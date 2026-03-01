import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { In, Repository } from 'typeorm';
import {
  createPaginatedResult,
  createPaginationMeta,
  PaginatedResult,
} from '../../common/dto';
import { CouponContextType } from '../coupons/enums/coupon-context-type.enum';
import { CouponsService } from '../coupons/coupons.service';
import { PaymentsService } from '../payments/payments.service';
import { PaymentStatus } from '../payments/enums/payment-status.enum';
import { Transaction } from '../payments/entities/transaction.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { Product } from './entities/product.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly paymentsService: PaymentsService,
    private readonly couponsService: CouponsService,
  ) {}

  async createWithCheckout(userId: string, dto: CreateOrderDto) {
    const productIds = [...new Set(dto.items.map((item) => item.productId))];
    const products = await this.productRepo.find({
      where: {
        id: In(productIds),
        isPublished: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products are unavailable');
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const firstCurrency = (dto.currency ?? products[0].currency ?? 'KES').toUpperCase();
    let subtotal = 0;

    const orderItems = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Product "${item.productId}" not found`);
      }

      if ((product.currency || 'KES').toUpperCase() !== firstCurrency) {
        throw new BadRequestException('Mixed product currencies in one order are not supported');
      }

      const quantity = item.quantity ?? 1;
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new BadRequestException('Quantity must be a positive integer');
      }

      if (!product.isDigital && Number.isFinite(product.stockQuantity) && product.stockQuantity !== null) {
        if (product.stockQuantity < quantity) {
          throw new BadRequestException(`Insufficient stock for "${product.title}"`);
        }
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      return this.orderItemRepo.create({
        productId: product.id,
        productTitle: product.title,
        isDigital: product.isDigital,
        downloadUrl: product.downloadUrl,
        unitPrice,
        quantity,
        lineTotal,
        remainingDownloads: 0,
        metadata: {
          productType: product.type,
        },
      });
    });

    const tax = 0;
    const grossTotal = this.roundMoney(subtotal + tax);
    let discount = 0;
    let appliedCoupon: Awaited<ReturnType<CouponsService['applyCoupon']>> | null = null;

    if (dto.couponCode) {
      appliedCoupon = await this.couponsService.applyCoupon({
        userId,
        code: dto.couponCode,
        amount: grossTotal,
        currency: firstCurrency,
      });
      discount = appliedCoupon.discountAmount;
    }

    const total = this.roundMoney(Math.max(0, grossTotal - discount));
    const orderMetadata: Record<string, unknown> = { ...(dto.metadata ?? {}) };
    if (appliedCoupon) {
      orderMetadata.coupon = {
        code: appliedCoupon.code,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue,
        discountAmount: appliedCoupon.discountAmount,
      };
    }

    const order = this.orderRepo.create({
      userId,
      invoiceNumber: this.buildInvoiceNumber(),
      status: OrderStatus.PENDING_PAYMENT,
      paymentMethod: dto.paymentMethod ?? null,
      currency: firstCurrency,
      subtotal: this.roundMoney(subtotal),
      tax,
      discount,
      total,
      couponId: appliedCoupon?.couponId ?? null,
      couponCode: appliedCoupon?.code ?? null,
      shippingAddress: dto.shippingAddress ?? null,
      metadata: orderMetadata,
      items: orderItems,
    });

    const savedOrder = await this.orderRepo.save(order);

    const transaction = await this.paymentsService.initiateCheckout(
      userId,
      {
        amount: total,
        currency: firstCurrency,
        paymentMethod: dto.paymentMethod,
        phone: dto.phone,
        returnPath: dto.returnPath ?? '/dashboard/orders',
        description: `Order payment (${savedOrder.invoiceNumber})`,
      },
      {
        type: 'product',
        returnPath: dto.returnPath ?? '/dashboard/orders',
        description: `Order payment (${savedOrder.invoiceNumber})`,
        skipCoupon: true,
        metadata: {
          orderId: savedOrder.id,
          invoiceNumber: savedOrder.invoiceNumber,
        },
      },
    );

    savedOrder.transactionReference = transaction.reference;
    savedOrder.paymentMethod = dto.paymentMethod ?? transaction.paymentMethod;
    await this.orderRepo.save(savedOrder);

    if (appliedCoupon) {
      try {
        await this.couponsService.recordRedemption({
          ...appliedCoupon,
          userId,
          contextType: CouponContextType.ORDER,
          orderId: savedOrder.id,
          transactionReference: transaction.reference,
          metadata: {
            invoiceNumber: savedOrder.invoiceNumber,
          },
        });
      } catch (error) {
        this.logger.warn(`Failed to record coupon redemption for order "${savedOrder.id}".`);
      }
    }

    const hydratedOrder = await this.findMineById(userId, savedOrder.id);
    return {
      order: hydratedOrder,
      transaction,
      checkoutUrl: transaction.checkoutUrl,
    };
  }

  async listMine(userId: string, query: OrderQueryDto): Promise<PaginatedResult<Order>> {
    const page = Number.isFinite(query.page) && query.page > 0 ? Math.floor(query.page) : 1;
    const limit = Number.isFinite(query.limit) && query.limit > 0 ? Math.floor(query.limit) : 20;
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .where('order.userId = :userId', { userId })
      .orderBy('order.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return createPaginatedResult(items, createPaginationMeta(page, limit, total));
  }

  async findMineById(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found`);
    }
    this.assertOwner(order, userId);
    await this.reconcilePaymentStatus(order);
    return order;
  }

  async cancel(userId: string, orderId: string): Promise<Order> {
    const order = await this.findMineById(userId, orderId);
    if (order.status === OrderStatus.PAID) {
      throw new BadRequestException('Paid orders cannot be cancelled from this endpoint');
    }

    if (order.status === OrderStatus.CANCELLED) {
      return order;
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    await this.orderRepo.save(order);
    return order;
  }

  async getInvoice(userId: string, orderId: string) {
    const order = await this.findMineById(userId, orderId);
    return {
      invoiceNumber: order.invoiceNumber,
      issuedAt: order.createdAt,
      paidAt: order.paidAt,
      status: order.status,
      currency: order.currency,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
      couponCode: order.couponCode,
      items: order.items.map((item) => ({
        id: item.id,
        title: item.productTitle,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
    };
  }

  async requestDownload(userId: string, orderId: string, itemId: string) {
    const order = await this.findMineById(userId, orderId);
    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Downloads are only available for paid orders');
    }

    const item = order.items.find((entry) => entry.id === itemId);
    if (!item) {
      throw new NotFoundException(`Order item "${itemId}" not found`);
    }

    if (!item.isDigital) {
      throw new BadRequestException('This item is not a digital product');
    }

    if (!item.downloadUrl) {
      throw new BadRequestException('No download URL configured for this product');
    }

    if (!item.downloadToken) {
      item.downloadToken = randomBytes(24).toString('hex');
    }

    if (!item.downloadExpiresAt || item.downloadExpiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('Download link has expired');
    }

    if (!Number.isFinite(item.remainingDownloads) || item.remainingDownloads <= 0) {
      throw new ForbiddenException('Download limit reached');
    }

    item.remainingDownloads -= 1;
    await this.orderItemRepo.save(item);

    return {
      downloadUrl: item.downloadUrl,
      securePath: `/api/v1/orders/${orderId}/items/${itemId}/download?token=${item.downloadToken}`,
      remainingDownloads: item.remainingDownloads,
      expiresAt: item.downloadExpiresAt,
    };
  }

  private async reconcilePaymentStatus(order: Order): Promise<void> {
    if (order.status !== OrderStatus.PENDING_PAYMENT || !order.transactionReference) {
      return;
    }

    const transaction = await this.transactionRepo.findOne({
      where: { reference: order.transactionReference },
    });

    if (!transaction) {
      return;
    }

    if (transaction.status === PaymentStatus.SUCCESS) {
      await this.markOrderPaid(order, transaction);
      return;
    }

    if ([PaymentStatus.FAILED, PaymentStatus.CANCELLED].includes(transaction.status)) {
      order.status = OrderStatus.CANCELLED;
      order.cancelledAt = order.cancelledAt ?? new Date();
      await this.orderRepo.save(order);
    }
  }

  private async markOrderPaid(order: Order, transaction: Transaction): Promise<void> {
    if (order.status === OrderStatus.PAID) {
      return;
    }

    for (const item of order.items) {
      if (item.isDigital) {
        if (!item.downloadToken) {
          item.downloadToken = randomBytes(24).toString('hex');
        }
        const product = item.product;
        const days = product?.downloadExpiresDays ?? 7;
        const limit = product?.downloadLimit ?? 3;
        item.downloadExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        item.remainingDownloads = limit;
      } else if (item.product && item.product.stockQuantity !== null) {
        const remaining = item.product.stockQuantity - item.quantity;
        if (remaining < 0) {
          throw new BadRequestException(`Insufficient inventory for "${item.product.title}"`);
        }
        item.product.stockQuantity = remaining;
        await this.productRepo.save(item.product);
      }
    }

    await this.orderItemRepo.save(order.items);

    order.status = OrderStatus.PAID;
    order.paidAt = order.paidAt ?? new Date();
    order.paymentMethod = order.paymentMethod ?? transaction.paymentMethod;
    await this.orderRepo.save(order);
  }

  private assertOwner(order: Order, userId: string): void {
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }
  }

  private buildInvoiceNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `TBCN-INV-${timestamp}-${random}`;
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
