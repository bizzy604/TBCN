import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import {
  PaginatedResult,
  createPaginatedResult,
  createPaginationMeta,
} from '../../common/dto';
import { CouponContextType } from '../coupons/enums/coupon-context-type.enum';
import { CouponsService } from '../coupons/coupons.service';
import { User } from '../users/entities/user.entity';
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
import { PaystackProcessor } from './processors/paystack.processor';
import { CheckoutInitInput, CheckoutInitResult } from './processors/processor.types';

interface InitiateCheckoutOptions {
  type?: string;
  plan?: string;
  description?: string;
  returnPath?: string;
  metadata?: Record<string, unknown>;
  skipCoupon?: boolean;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
    private readonly paystackProcessor: PaystackProcessor,
    private readonly paypalProcessor: PaypalProcessor,
    private readonly couponsService: CouponsService,
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

  async initiateCheckout(
    userId: string,
    dto: InitiatePaymentDto,
    options: InitiateCheckoutOptions = {},
  ): Promise<Transaction> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User "${userId}" not found`);
    }

    const paymentMethod = dto.paymentMethod ?? PaymentMethod.CARD;
    const reference = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const requestedCurrency = (dto.currency ?? 'KES').toUpperCase();
    const currency = this.resolveCheckoutCurrency(paymentMethod, requestedCurrency);
    const originalAmount = this.roundMoney(dto.amount);
    if (!Number.isFinite(originalAmount) || originalAmount < 0) {
      throw new BadRequestException('Payment amount must be a valid non-negative number.');
    }

    const transactionType = options.type ?? 'subscription';
    const plan = options.plan ?? dto.plan ?? 'pro';
    const checkoutPhone = dto.phone?.trim() || user.phone || undefined;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const returnPath = options.returnPath ?? dto.returnPath ?? '/settings/subscription';
    const provider = this.resolveProviderName(paymentMethod);
    const description = options.description
      ?? dto.description
      ?? (transactionType === 'subscription'
        ? `Upgrade subscription to ${plan}`
        : 'Checkout payment');

    const checkoutMetadata: Record<string, unknown> = {
      userId,
      returnPath,
      ...options.metadata,
    };

    if (transactionType === 'subscription') {
      checkoutMetadata.plan = plan;
    }

    let amountToCharge = originalAmount;
    let appliedCoupon: Awaited<ReturnType<CouponsService['applyCoupon']>> | null = null;
    if (dto.couponCode && !options.skipCoupon) {
      appliedCoupon = await this.couponsService.applyCoupon({
        userId,
        code: dto.couponCode,
        amount: originalAmount,
        currency,
        plan,
      });
      amountToCharge = appliedCoupon.finalAmount;
      checkoutMetadata.coupon = {
        code: appliedCoupon.code,
        couponId: appliedCoupon.couponId,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue,
        discountAmount: appliedCoupon.discountAmount,
        originalAmount: appliedCoupon.originalAmount,
        finalAmount: appliedCoupon.finalAmount,
      };
    }

    if (dto.phone?.trim() && dto.phone.trim() !== user.phone) {
      user.phone = dto.phone.trim();
      await this.userRepo.save(user);
    }

    if (amountToCharge <= 0) {
      const transaction = await this.transactionRepo.save(this.transactionRepo.create({
        userId,
        reference,
        paymentMethod,
        status: PaymentStatus.SUCCESS,
        amount: 0,
        currency,
        type: transactionType,
        description,
        providerTransactionId: null,
        checkoutUrl: `${frontendUrl}/payments/confirmation?reference=${encodeURIComponent(reference)}&status=success&provider=internal`,
        completedAt: new Date(),
        metadata: {
          provider: 'internal',
          ...checkoutMetadata,
        },
      }));

      if (transaction.type === 'subscription') {
        await this.applySubscriptionUpgrade(transaction);
      }

      if (appliedCoupon) {
        await this.recordCouponRedemptionSafe(transaction, appliedCoupon);
      }

      return transaction;
    }

    const initInput: CheckoutInitInput = {
      reference,
      amount: amountToCharge,
      currency,
      description,
      email: user.email,
      phone: checkoutPhone,
      callbackUrl: `${frontendUrl}/payments/confirmation?provider=${provider}`,
      webhookUrl: `${this.resolveApiPublicBaseUrl()}/payments/webhooks/${provider}`,
      metadata: checkoutMetadata,
    };

    const checkoutTarget = await this.getCheckoutTarget(paymentMethod, initInput);
    const checkoutUrl = checkoutTarget.checkoutUrl.startsWith('http')
      ? checkoutTarget.checkoutUrl
      : `${frontendUrl}${checkoutTarget.checkoutUrl}`;

    const transaction = await this.transactionRepo.save(this.transactionRepo.create({
      userId,
      reference,
      paymentMethod,
      status: checkoutTarget.status ?? PaymentStatus.PENDING,
      amount: amountToCharge,
      currency,
      type: transactionType,
      description: initInput.description,
      providerTransactionId: checkoutTarget.providerTransactionId ?? null,
      checkoutUrl,
      metadata: {
        provider,
        ...checkoutMetadata,
        providerPayload: checkoutTarget.providerPayload ?? {},
      },
    }));

    if (appliedCoupon) {
      await this.recordCouponRedemptionSafe(transaction, appliedCoupon);
    }

    return transaction;
  }

  async confirmCallback(dto: PaymentCallbackDto): Promise<Transaction> {
    const transaction = await this.transactionRepo.findOne({ where: { reference: dto.reference } });
    if (!transaction) {
      throw new NotFoundException(`Transaction "${dto.reference}" not found`);
    }

    const resolution = await this.resolveCallbackStatus(transaction, dto);
    const wasSuccessful = transaction.status === PaymentStatus.SUCCESS;

    transaction.status = resolution.status;
    transaction.providerTransactionId = resolution.providerTransactionId
      ?? dto.providerTransactionId
      ?? transaction.providerTransactionId;

    if (resolution.payload) {
      transaction.metadata = {
        ...transaction.metadata,
        providerConfirmation: resolution.payload,
      };
    }

    if (resolution.status === PaymentStatus.SUCCESS) {
      transaction.completedAt = transaction.completedAt ?? new Date();
      if (!wasSuccessful && transaction.type === 'subscription') {
        await this.applySubscriptionUpgrade(transaction);
      }
    }

    if ([PaymentStatus.FAILED, PaymentStatus.CANCELLED].includes(resolution.status)) {
      transaction.completedAt = transaction.completedAt ?? new Date();
    }

    return this.transactionRepo.save(transaction);
  }

  async handleWebhook(
    provider: string,
    idempotencyKey: string,
    payload: Record<string, unknown>,
    headers: Record<string, string | string[] | undefined> = {},
  ): Promise<{ processed: boolean; reason?: string }> {
    const existing = await this.webhookEventRepo.findOne({ where: { idempotencyKey } });
    if (existing) {
      return { processed: false, reason: 'duplicate' };
    }

    const normalizedProvider = provider.toLowerCase();
    const extracted = await this.extractWebhookData(normalizedProvider, payload, headers);

    await this.webhookEventRepo.save(this.webhookEventRepo.create({
      provider: normalizedProvider,
      idempotencyKey,
      eventType: extracted.eventType,
      payload,
    }));

    const reference = extracted.reference
      ?? await this.resolveReferenceByProviderTransactionId(extracted.providerTransactionId);
    const status = extracted.status;

    if (!reference || !status) {
      return { processed: true, reason: 'no-reference-or-status' };
    }

    const transaction = await this.confirmCallback({
      reference,
      status,
      providerTransactionId: extracted.providerPaymentId ?? extracted.providerTransactionId,
    });

    if (extracted.payload) {
      transaction.metadata = {
        ...transaction.metadata,
        providerWebhook: extracted.payload,
      };
      await this.transactionRepo.save(transaction);
    }

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
    input: CheckoutInitInput,
  ): Promise<CheckoutInitResult> {
    switch (method) {
      case PaymentMethod.MPESA:
        return this.mpesaProcessor.createCheckout(input);
      case PaymentMethod.PAYSTACK:
      case PaymentMethod.CARD:
        return this.paystackProcessor.createCheckout(input);
      case PaymentMethod.FLUTTERWAVE:
        return this.flutterwaveProcessor.createCheckout(input.reference);
      case PaymentMethod.PAYPAL:
        return this.paypalProcessor.createCheckout(input.reference);
      default:
        return this.stripeProcessor.createCheckout(input.reference);
    }
  }

  private resolveProviderName(method: PaymentMethod): string {
    if (method === PaymentMethod.CARD) {
      return 'paystack';
    }
    return method;
  }

  private resolveCheckoutCurrency(method: PaymentMethod, requestedCurrency: string): string {
    if (method === PaymentMethod.MPESA) {
      return 'KES';
    }

    if ([PaymentMethod.CARD, PaymentMethod.PAYSTACK].includes(method)) {
      const paystackCurrency = this.configService.get<string>('PAYSTACK_CURRENCY')?.toUpperCase();
      return paystackCurrency || requestedCurrency;
    }

    return requestedCurrency;
  }

  private resolveApiPublicBaseUrl(): string {
    const configured = this.configService.get<string>('API_PUBLIC_URL');
    if (configured) {
      return configured.replace(/\/+$/, '');
    }
    const port = this.configService.get<number>('PORT', 4000);
    return `http://localhost:${port}/api/v1`;
  }

  private async resolveCallbackStatus(
    transaction: Transaction,
    dto: PaymentCallbackDto,
  ): Promise<{
    status: PaymentStatus;
    providerTransactionId?: string;
    payload?: Record<string, unknown>;
  }> {
    const usesPaystack = [PaymentMethod.CARD, PaymentMethod.PAYSTACK]
      .includes(transaction.paymentMethod);

    if (usesPaystack && this.paystackProcessor.isConfigured()) {
      const verification = await this.paystackProcessor.verifyTransaction(transaction.reference);
      return {
        status: verification.status,
        providerTransactionId: verification.providerTransactionId,
        payload: verification.payload,
      };
    }

    if (!dto.status) {
      throw new BadRequestException('Payment status is required when provider verification is unavailable.');
    }

    return {
      status: dto.status,
    };
  }

  private async extractWebhookData(
    provider: string,
    payload: Record<string, unknown>,
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{
    reference?: string;
    providerTransactionId?: string;
    providerPaymentId?: string;
    status?: PaymentStatus;
    eventType: string;
    payload?: Record<string, unknown>;
  }> {
    if (provider === 'paystack') {
      const signatureHeader = this.readHeader(headers, 'x-paystack-signature');
      const signatureValid = this.paystackProcessor.verifyWebhookSignature(payload, signatureHeader);
      if (!signatureValid && this.paystackProcessor.isConfigured()) {
        this.logger.warn('Paystack webhook signature could not be verified via request body hash; falling back to transaction verify.');
      }

      const extracted = this.paystackProcessor.extractWebhook(payload);
      if (extracted.reference && this.paystackProcessor.isConfigured()) {
        const verification = await this.paystackProcessor.verifyTransaction(extracted.reference);
        return {
          ...extracted,
          status: verification.status,
          providerTransactionId: verification.providerTransactionId ?? extracted.providerTransactionId,
          payload: verification.payload,
        };
      }
      return extracted;
    }

    if (provider === 'mpesa') {
      return this.mpesaProcessor.extractWebhook(payload);
    }

    const reference = typeof payload.reference === 'string' ? payload.reference : undefined;
    const status = typeof payload.status === 'string'
      ? this.normalizeStatus(payload.status)
      : undefined;

    return {
      reference,
      status,
      providerTransactionId: typeof payload.providerTransactionId === 'string'
        ? payload.providerTransactionId
        : undefined,
      eventType: typeof payload.eventType === 'string'
        ? payload.eventType
        : `${provider}.webhook`,
      payload,
    };
  }

  private async resolveReferenceByProviderTransactionId(
    providerTransactionId?: string,
  ): Promise<string | undefined> {
    if (!providerTransactionId) {
      return undefined;
    }
    const transaction = await this.transactionRepo.findOne({
      where: { providerTransactionId },
    });
    return transaction?.reference;
  }

  private async recordCouponRedemptionSafe(
    transaction: Transaction,
    coupon: Awaited<ReturnType<CouponsService['applyCoupon']>>,
  ): Promise<void> {
    try {
      const orderId = typeof transaction.metadata?.orderId === 'string'
        ? transaction.metadata.orderId
        : undefined;
      await this.couponsService.recordRedemption({
        ...coupon,
        userId: transaction.userId,
        contextType: transaction.type === 'subscription'
          ? CouponContextType.SUBSCRIPTION
          : CouponContextType.ORDER,
        orderId,
        transactionReference: transaction.reference,
        metadata: {
          transactionType: transaction.type,
          transactionId: transaction.id,
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to record coupon redemption for transaction "${transaction.reference}".`);
    }
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private normalizeStatus(value: string): PaymentStatus {
    const val = value.toLowerCase();
    if (['success', 'paid', 'completed'].includes(val)) return PaymentStatus.SUCCESS;
    if (['processing', 'pending'].includes(val)) return PaymentStatus.PROCESSING;
    if (['cancelled', 'canceled'].includes(val)) return PaymentStatus.CANCELLED;
    if (['failed', 'error'].includes(val)) return PaymentStatus.FAILED;
    throw new BadRequestException(`Unsupported webhook status: ${value}`);
  }

  private readHeader(
    headers: Record<string, string | string[] | undefined>,
    key: string,
  ): string | undefined {
    const value = headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }
}
