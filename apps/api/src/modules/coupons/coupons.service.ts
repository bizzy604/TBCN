import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import {
  PaginatedResult,
  createPaginatedResult,
  createPaginationMeta,
} from '../../common/dto';
import { Subscription } from '../payments/entities/subscription.entity';
import { CouponQueryDto } from './dto/coupon-query.dto';
import { CreateCouponDto, UpdateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { CouponDiscountType } from './enums/coupon-discount-type.enum';
import { CouponContextType } from './enums/coupon-context-type.enum';
import { CouponRedemptionStatus } from './enums/coupon-redemption-status.enum';
import { CouponRedemption } from './entities/coupon-redemption.entity';
import { Coupon } from './entities/coupon.entity';

interface CouponComputationInput {
  code: string;
  userId: string;
  amount: number;
  currency?: string;
  plan?: string;
}

export interface CouponComputationResult {
  couponId: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
}

interface CouponRedemptionInput extends CouponComputationResult {
  userId: string;
  contextType: CouponContextType;
  orderId?: string;
  transactionReference?: string;
  metadata?: Record<string, unknown>;
}

export interface ValidationOutcome {
  valid: boolean;
  message?: string;
  data?: CouponComputationResult;
}

@Injectable()
export class CouponsService {
  private readonly logger = new Logger(CouponsService.name);

  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
    @InjectRepository(CouponRedemption)
    private readonly redemptionRepo: Repository<CouponRedemption>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async list(query: CouponQueryDto): Promise<PaginatedResult<Coupon>> {
    const page = Number.isFinite(query.page) && query.page! > 0 ? Math.floor(query.page!) : 1;
    const limit = Number.isFinite(query.limit) && query.limit! > 0 ? Math.floor(query.limit!) : 20;
    const qb = this.couponRepo
      .createQueryBuilder('coupon')
      .orderBy('coupon.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere(
        '(LOWER(coupon.code) LIKE LOWER(:search) OR LOWER(COALESCE(coupon.name, \'\')) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (typeof query.isActive === 'boolean') {
      qb.andWhere('coupon.isActive = :isActive', { isActive: query.isActive });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return createPaginatedResult(items, createPaginationMeta(page, limit, total));
  }

  async create(dto: CreateCouponDto): Promise<Coupon> {
    this.validateCouponDates(dto.startsAt, dto.expiresAt);
    this.validateDiscount(dto.discountType, dto.discountValue);

    const code = this.normalizeCode(dto.code);
    const existing = await this.couponRepo.findOne({ where: { code } });
    if (existing) {
      throw new BadRequestException(`Coupon code "${code}" already exists`);
    }

    const coupon = this.couponRepo.create({
      code,
      name: dto.name?.trim() || null,
      description: dto.description?.trim() || null,
      discountType: dto.discountType,
      discountValue: this.roundMoney(dto.discountValue),
      currency: dto.currency ? dto.currency.toUpperCase() : null,
      isActive: dto.isActive ?? true,
      startsAt: dto.startsAt ?? null,
      expiresAt: dto.expiresAt ?? null,
      maxTotalUses: dto.maxTotalUses ?? null,
      maxUsesPerUser: dto.maxUsesPerUser ?? null,
      allowStacking: dto.allowStacking ?? false,
      applicableUserIds: dto.applicableUserIds ?? [],
      allowedPlans: (dto.allowedPlans ?? []).map((plan) => plan.trim().toLowerCase()),
      minOrderAmount: typeof dto.minOrderAmount === 'number'
        ? this.roundMoney(dto.minOrderAmount)
        : null,
      deactivatedAt: dto.isActive === false ? new Date() : null,
      metadata: dto.metadata ?? {},
    });

    return this.couponRepo.save(coupon);
  }

  async update(id: string, dto: UpdateCouponDto): Promise<Coupon> {
    const coupon = await this.findById(id);
    this.validateCouponDates(dto.startsAt ?? coupon.startsAt ?? undefined, dto.expiresAt ?? coupon.expiresAt ?? undefined);

    const discountType = dto.discountType ?? coupon.discountType;
    const discountValue = dto.discountValue ?? Number(coupon.discountValue);
    this.validateDiscount(discountType, discountValue);

    if (dto.code && this.normalizeCode(dto.code) !== coupon.code) {
      const nextCode = this.normalizeCode(dto.code);
      const existing = await this.couponRepo.findOne({ where: { code: nextCode } });
      if (existing && existing.id !== coupon.id) {
        throw new BadRequestException(`Coupon code "${nextCode}" already exists`);
      }
      coupon.code = nextCode;
    }

    if (dto.name !== undefined) coupon.name = dto.name?.trim() || null;
    if (dto.description !== undefined) coupon.description = dto.description?.trim() || null;
    if (dto.discountType !== undefined) coupon.discountType = dto.discountType;
    if (dto.discountValue !== undefined) coupon.discountValue = this.roundMoney(dto.discountValue);
    if (dto.currency !== undefined) coupon.currency = dto.currency ? dto.currency.toUpperCase() : null;
    if (dto.startsAt !== undefined) coupon.startsAt = dto.startsAt ?? null;
    if (dto.expiresAt !== undefined) coupon.expiresAt = dto.expiresAt ?? null;
    if (dto.maxTotalUses !== undefined) coupon.maxTotalUses = dto.maxTotalUses ?? null;
    if (dto.maxUsesPerUser !== undefined) coupon.maxUsesPerUser = dto.maxUsesPerUser ?? null;
    if (dto.allowStacking !== undefined) coupon.allowStacking = dto.allowStacking;
    if (dto.applicableUserIds !== undefined) coupon.applicableUserIds = dto.applicableUserIds;
    if (dto.allowedPlans !== undefined) {
      coupon.allowedPlans = dto.allowedPlans.map((plan) => plan.trim().toLowerCase());
    }
    if (dto.minOrderAmount !== undefined) {
      coupon.minOrderAmount = dto.minOrderAmount === null
        ? null
        : this.roundMoney(dto.minOrderAmount);
    }
    if (dto.metadata !== undefined) {
      coupon.metadata = { ...coupon.metadata, ...dto.metadata };
    }

    if (dto.isActive !== undefined) {
      coupon.isActive = dto.isActive;
      coupon.deactivatedAt = dto.isActive ? null : new Date();
    }

    return this.couponRepo.save(coupon);
  }

  async activate(id: string): Promise<Coupon> {
    const coupon = await this.findById(id);
    coupon.isActive = true;
    coupon.deactivatedAt = null;
    return this.couponRepo.save(coupon);
  }

  async deactivate(id: string): Promise<Coupon> {
    const coupon = await this.findById(id);
    coupon.isActive = false;
    coupon.deactivatedAt = new Date();
    return this.couponRepo.save(coupon);
  }

  async validateForUser(userId: string, dto: ValidateCouponDto): Promise<ValidationOutcome> {
    return this.evaluateCoupon({
      userId,
      code: dto.code,
      amount: dto.amount,
      currency: dto.currency,
      plan: dto.plan,
    });
  }

  async applyCoupon(input: CouponComputationInput): Promise<CouponComputationResult> {
    const evaluation = await this.evaluateCoupon(input);
    if (!evaluation.valid || !evaluation.data) {
      throw new BadRequestException(evaluation.message || 'Coupon is not valid');
    }
    return evaluation.data;
  }

  async recordRedemption(input: CouponRedemptionInput): Promise<CouponRedemption> {
    const coupon = await this.findById(input.couponId);
    const redemption = this.redemptionRepo.create({
      couponId: coupon.id,
      userId: input.userId,
      contextType: input.contextType,
      status: CouponRedemptionStatus.APPLIED,
      orderId: input.orderId ?? null,
      transactionReference: input.transactionReference ?? null,
      originalAmount: this.roundMoney(input.originalAmount),
      discountAmount: this.roundMoney(input.discountAmount),
      finalAmount: this.roundMoney(input.finalAmount),
      currency: input.currency.toUpperCase(),
      metadata: {
        code: input.code,
        discountType: input.discountType,
        discountValue: input.discountValue,
        ...(input.metadata ?? {}),
      },
    });

    const saved = await this.redemptionRepo.save(redemption);
    await this.couponRepo.increment({ id: coupon.id }, 'usedCount', 1);
    return saved;
  }

  async getAnalytics() {
    const [totalCoupons, activeCoupons, totalRedemptions, summary] = await Promise.all([
      this.couponRepo.count(),
      this.couponRepo.count({ where: { isActive: true } }),
      this.redemptionRepo.count(),
      this.redemptionRepo
        .createQueryBuilder('redemption')
        .select('COALESCE(SUM(redemption.discountAmount), 0)', 'totalDiscount'),
    ]);

    const summaryRow = await summary.getRawOne<{ totalDiscount: string }>();
    const topCoupons = await this.redemptionRepo
      .createQueryBuilder('redemption')
      .innerJoin(Coupon, 'coupon', 'coupon.id = redemption.couponId')
      .select('coupon.id', 'couponId')
      .addSelect('coupon.code', 'code')
      .addSelect('coupon.discountType', 'discountType')
      .addSelect('COUNT(redemption.id)', 'redemptions')
      .addSelect('COALESCE(SUM(redemption.discountAmount), 0)', 'discountAmount')
      .addSelect('COALESCE(SUM(redemption.originalAmount), 0)', 'grossAmount')
      .groupBy('coupon.id')
      .addGroupBy('coupon.code')
      .addGroupBy('coupon.discountType')
      .orderBy('COUNT(redemption.id)', 'DESC')
      .limit(20)
      .getRawMany<{
        couponId: string;
        code: string;
        discountType: CouponDiscountType;
        redemptions: string;
        discountAmount: string;
        grossAmount: string;
      }>();

    return {
      summary: {
        totalCoupons,
        activeCoupons,
        totalRedemptions,
        totalDiscountAmount: this.roundMoney(Number(summaryRow?.totalDiscount ?? 0)),
      },
      topCoupons: topCoupons.map((row) => ({
        couponId: row.couponId,
        code: row.code,
        discountType: row.discountType,
        redemptions: Number(row.redemptions),
        discountAmount: this.roundMoney(Number(row.discountAmount)),
        grossAmount: this.roundMoney(Number(row.grossAmount)),
      })),
    };
  }

  @Cron('0 */30 * * * *')
  async disableExpiredCoupons(): Promise<void> {
    const result = await this.couponRepo
      .createQueryBuilder()
      .update(Coupon)
      .set({
        isActive: false,
        deactivatedAt: () => 'CURRENT_TIMESTAMP',
      })
      .where('isActive = :active', { active: true })
      .andWhere('expiresAt IS NOT NULL')
      .andWhere('expiresAt <= NOW()')
      .execute();

    if ((result.affected ?? 0) > 0) {
      this.logger.log(`Deactivated ${result.affected} expired coupon(s).`);
    }
  }

  private async evaluateCoupon(input: CouponComputationInput): Promise<ValidationOutcome> {
    const code = this.normalizeCode(input.code);
    const coupon = await this.couponRepo.findOne({ where: { code } });
    if (!coupon) {
      return { valid: false, message: 'Coupon code not found.' };
    }

    const normalizedAmount = this.roundMoney(input.amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 0) {
      return { valid: false, message: 'Checkout amount is invalid for coupon validation.' };
    }

    const currentPlan = await this.resolvePlan(input.userId, input.plan);
    const restrictionError = await this.validateRestrictions(
      coupon,
      input.userId,
      normalizedAmount,
      input.currency,
      currentPlan,
    );

    if (restrictionError) {
      return { valid: false, message: restrictionError };
    }

    const currency = (input.currency ?? coupon.currency ?? 'KES').toUpperCase();
    const discountAmount = this.computeDiscount(coupon, normalizedAmount, currency);
    const finalAmount = this.roundMoney(Math.max(0, normalizedAmount - discountAmount));

    return {
      valid: true,
      data: {
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: this.roundMoney(Number(coupon.discountValue)),
        originalAmount: normalizedAmount,
        discountAmount,
        finalAmount,
        currency,
      },
    };
  }

  private async validateRestrictions(
    coupon: Coupon,
    userId: string,
    amount: number,
    currency: string | undefined,
    plan: string,
  ): Promise<string | null> {
    const now = new Date();

    if (!coupon.isActive) {
      return 'Coupon is inactive.';
    }

    if (coupon.startsAt && coupon.startsAt.getTime() > now.getTime()) {
      return 'Coupon is not active yet.';
    }

    if (coupon.expiresAt && coupon.expiresAt.getTime() <= now.getTime()) {
      return 'Coupon has expired.';
    }

    if (coupon.maxTotalUses !== null && coupon.usedCount >= coupon.maxTotalUses) {
      return 'Coupon usage limit has been reached.';
    }

    if (coupon.maxUsesPerUser !== null) {
      const usedByUser = await this.redemptionRepo.count({
        where: {
          couponId: coupon.id,
          userId,
          status: CouponRedemptionStatus.APPLIED,
        },
      });
      if (usedByUser >= coupon.maxUsesPerUser) {
        return 'You have already used this coupon the maximum allowed times.';
      }
    }

    if (Array.isArray(coupon.applicableUserIds) && coupon.applicableUserIds.length > 0) {
      const allowed = coupon.applicableUserIds.includes(userId);
      if (!allowed) {
        return 'Coupon is not available for this account.';
      }
    }

    if (Array.isArray(coupon.allowedPlans) && coupon.allowedPlans.length > 0) {
      const allowed = coupon.allowedPlans.map((entry) => entry.toLowerCase()).includes(plan.toLowerCase());
      if (!allowed) {
        return `Coupon is not available for your current tier (${plan}).`;
      }
    }

    const minAmount = coupon.minOrderAmount !== null ? Number(coupon.minOrderAmount) : null;
    if (minAmount !== null && amount < minAmount) {
      return `Coupon requires a minimum checkout amount of ${minAmount}.`;
    }

    if (coupon.discountType === CouponDiscountType.FIXED && coupon.currency && currency) {
      if (coupon.currency.toUpperCase() !== currency.toUpperCase()) {
        return `Coupon is only valid for ${coupon.currency.toUpperCase()} checkouts.`;
      }
    }

    return null;
  }

  private computeDiscount(coupon: Coupon, amount: number, currency: string): number {
    if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
      const percentage = Number(coupon.discountValue);
      const raw = this.roundMoney(amount * (percentage / 100));
      return this.roundMoney(Math.min(amount, raw));
    }

    if (coupon.currency && coupon.currency.toUpperCase() !== currency.toUpperCase()) {
      throw new BadRequestException(`Coupon is only valid for ${coupon.currency.toUpperCase()} checkouts.`);
    }

    const fixed = this.roundMoney(Number(coupon.discountValue));
    return this.roundMoney(Math.min(amount, fixed));
  }

  private async findById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException(`Coupon with ID "${id}" not found`);
    }
    return coupon;
  }

  private async resolvePlan(userId: string, plan?: string): Promise<string> {
    if (plan && plan.trim()) {
      return plan.trim().toLowerCase();
    }

    const subscription = await this.subscriptionRepo.findOne({
      where: { userId },
      select: ['id', 'plan'],
    });

    if (subscription?.plan?.trim()) {
      return subscription.plan.trim().toLowerCase();
    }

    return 'free';
  }

  private validateCouponDates(startsAt?: Date, expiresAt?: Date): void {
    if (startsAt && expiresAt && startsAt.getTime() > expiresAt.getTime()) {
      throw new BadRequestException('Coupon startsAt must be before expiresAt.');
    }
  }

  private validateDiscount(type: CouponDiscountType, value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new BadRequestException('Discount value must be greater than zero.');
    }

    if (type === CouponDiscountType.PERCENTAGE && value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100.');
    }
  }

  private normalizeCode(code: string): string {
    return code.trim().toUpperCase();
  }

  private roundMoney(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
