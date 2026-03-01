import {
  Column,
  Entity,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { CouponRedemption } from './coupon-redemption.entity';
import { CouponDiscountType } from '../enums/coupon-discount-type.enum';

@Entity('coupons')
@Index('idx_coupons_code', ['code'], { unique: true })
@Index('idx_coupons_active', ['isActive'])
@Index('idx_coupons_expires_at', ['expiresAt'])
export class Coupon extends BaseEntity {
  @Column({ type: 'varchar', length: 40, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  name: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: CouponDiscountType,
    default: CouponDiscountType.PERCENTAGE,
  })
  discountType: CouponDiscountType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 12, scale: 2 })
  discountValue: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'starts_at', type: 'timestamptz', nullable: true })
  startsAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'max_total_uses', type: 'int', nullable: true })
  maxTotalUses: number | null;

  @Column({ name: 'max_uses_per_user', type: 'int', nullable: true })
  maxUsesPerUser: number | null;

  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  @Column({ name: 'allow_stacking', type: 'boolean', default: false })
  allowStacking: boolean;

  @Column({ name: 'applicable_user_ids', type: 'jsonb', default: () => "'[]'" })
  applicableUserIds: string[];

  @Column({ name: 'allowed_plans', type: 'jsonb', default: () => "'[]'" })
  allowedPlans: string[];

  @Column({ name: 'min_order_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  minOrderAmount: number | null;

  @Column({ name: 'deactivated_at', type: 'timestamptz', nullable: true })
  deactivatedAt: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @OneToMany(() => CouponRedemption, (redemption) => redemption.coupon)
  redemptions: CouponRedemption[];
}

