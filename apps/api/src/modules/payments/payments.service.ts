import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import {
  PaginatedResult,
  createPaginatedResult,
  createPaginationMeta,
} from '../../common/dto';
import { Transaction } from './entities/transaction.entity';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { PaymentMethod } from './enums/payment-method.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { StripeProcessor } from './processors/stripe.processor';
import { FlutterwaveProcessor } from './processors/flutterwave.processor';
import { MpesaProcessor } from './processors/mpesa.processor';
import { PaypalProcessor } from './processors/paypal.processor';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(WebhookEvent)
    private readonly webhookEventRepo: Repository<WebhookEvent>,
    private readonly configService: ConfigService,
    private readonly stripeProcessor: StripeProcessor,
    private readonly flutterwaveProcessor: FlutterwaveProcessor,
    private readonly mpesaProcessor: MpesaProcessor,
    private readonly paypalProcessor: PaypalProcessor,
  ) {}

  async getMySubscription(userId: string): Promise<Subscription> {
    const existing = await this.subscriptionRepo.findOne({ where: { userId } });
    if (existing) {
      return existing;
    }
    return this.subscriptionRepo.save(this.subscriptionRepo.create({
      userId,
      plan: 'free',
      status: SubscriptionStatus.ACTIVE,
      renewsAt: null,
    }));
  }

  async initiateCheckout(userId: string, dto: InitiatePaymentDto): Promise<Transaction> {
    const reference = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const currency = dto.currency ?? 'USD';
    const plan = dto.plan ?? 'pro';
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const returnPath = dto.returnPath ?? '/settings/subscription';

    const checkoutTarget = await this.getCheckoutTarget(dto.paymentMethod ?? PaymentMethod.CARD, reference);
    const checkoutUrl = checkoutTarget.checkoutUrl.startsWith('http')
      ? checkoutTarget.checkoutUrl
      : `${frontendUrl}${checkoutTarget.checkoutUrl}`;

    const transaction = await this.transactionRepo.save(this.transactionRepo.create({
      userId,
      reference,
      paymentMethod: dto.paymentMethod ?? PaymentMethod.CARD,
      status: PaymentStatus.PENDING,
      amount: dto.amount,
      currency,
      type: 'subscription',
      description: dto.description ?? `Upgrade subscription to ${plan}`,
      checkoutUrl,
      metadata: {
        plan,
        returnPath,
      },
    }));

    return transaction;
  }

  async confirmCallback(dto: PaymentCallbackDto): Promise<Transaction> {
    const transaction = await this.transactionRepo.findOne({ where: { reference: dto.reference } });
    if (!transaction) {
      throw new NotFoundException(`Transaction "${dto.reference}" not found`);
    }

    transaction.status = dto.status;
    transaction.providerTransactionId = dto.providerTransactionId ?? transaction.providerTransactionId;
    if (dto.status === PaymentStatus.SUCCESS) {
      transaction.completedAt = new Date();
      await this.applySubscriptionUpgrade(transaction);
    }
    return this.transactionRepo.save(transaction);
  }

  async handleWebhook(
    provider: string,
    idempotencyKey: string,
    payload: Record<string, unknown>,
  ): Promise<{ processed: boolean; reason?: string }> {
    const existing = await this.webhookEventRepo.findOne({ where: { idempotencyKey } });
    if (existing) {
      return { processed: false, reason: 'duplicate' };
    }

    const reference = typeof payload.reference === 'string' ? payload.reference : null;
    const status = typeof payload.status === 'string' ? payload.status : null;

    await this.webhookEventRepo.save(this.webhookEventRepo.create({
      provider,
      idempotencyKey,
      eventType: typeof payload.eventType === 'string' ? payload.eventType : 'payment.webhook',
      payload,
    }));

    if (!reference || !status) {
      return { processed: true, reason: 'no-reference-or-status' };
    }

    const normalizedStatus = this.normalizeStatus(status);
    await this.confirmCallback({
      reference,
      status: normalizedStatus,
      providerTransactionId: typeof payload.providerTransactionId === 'string'
        ? payload.providerTransactionId
        : undefined,
    });

    return { processed: true };
  }

  async getMyTransactions(userId: string, query: TransactionQueryDto): Promise<PaginatedResult<Transaction>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.transactionRepo
      .createQueryBuilder('txn')
      .where('txn.userId = :userId', { userId })
      .orderBy('txn.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('txn.status = :status', { status: query.status });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return createPaginatedResult(items, createPaginationMeta(page, limit, total));
  }

  async getAllTransactions(query: TransactionQueryDto): Promise<PaginatedResult<Transaction>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.transactionRepo
      .createQueryBuilder('txn')
      .leftJoinAndSelect('txn.user', 'user')
      .orderBy('txn.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('txn.status = :status', { status: query.status });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return createPaginatedResult(items, createPaginationMeta(page, limit, total));
  }

  async getTransactionById(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionRepo.findOne({ where: { id, userId } });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID "${id}" not found`);
    }
    return transaction;
  }

  async cancelSubscription(userId: string): Promise<Subscription> {
    const subscription = await this.getMySubscription(userId);
    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    return this.subscriptionRepo.save(subscription);
  }

  private async applySubscriptionUpgrade(transaction: Transaction): Promise<void> {
    const subscription = await this.getMySubscription(transaction.userId);
    const plan = typeof transaction.metadata?.plan === 'string' ? transaction.metadata.plan : 'pro';
    subscription.plan = plan;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.lastTransactionId = transaction.id;
    subscription.startsAt = new Date();
    subscription.renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    subscription.cancelledAt = null;
    await this.subscriptionRepo.save(subscription);
  }

  private async getCheckoutTarget(
    method: PaymentMethod,
    reference: string,
  ): Promise<{ checkoutUrl: string }> {
    switch (method) {
      case PaymentMethod.FLUTTERWAVE:
        return this.flutterwaveProcessor.createCheckout(reference);
      case PaymentMethod.MPESA:
        return this.mpesaProcessor.createCheckout(reference);
      case PaymentMethod.PAYPAL:
        return this.paypalProcessor.createCheckout(reference);
      case PaymentMethod.CARD:
      default:
        return this.stripeProcessor.createCheckout(reference);
    }
  }

  private normalizeStatus(value: string): PaymentStatus {
    const val = value.toLowerCase();
    if (['success', 'paid', 'completed'].includes(val)) return PaymentStatus.SUCCESS;
    if (['processing', 'pending'].includes(val)) return PaymentStatus.PROCESSING;
    if (['cancelled', 'canceled'].includes(val)) return PaymentStatus.CANCELLED;
    if (['failed', 'error'].includes(val)) return PaymentStatus.FAILED;
    throw new BadRequestException(`Unsupported webhook status: ${value}`);
  }
}
