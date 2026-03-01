import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { Coupon } from './coupon.entity';
import { CouponContextType } from '../enums/coupon-context-type.enum';
import { CouponRedemptionStatus } from '../enums/coupon-redemption-status.enum';

@Entity('coupon_redemptions')
@Index('idx_coupon_redemptions_coupon', ['couponId'])
@Index('idx_coupon_redemptions_user', ['userId'])
@Index('idx_coupon_redemptions_order', ['orderId'])
@Index('idx_coupon_redemptions_tx_ref', ['transactionReference'])
export class CouponRedemption extends BaseEntity {
  @ManyToOne(() => Coupon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @Column({ name: 'coupon_id', type: 'uuid' })
  couponId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'context_type',
    type: 'enum',
    enum: CouponContextType,
    default: CouponContextType.ORDER,
  })
  contextType: CouponContextType;

  @Column({
    type: 'enum',
    enum: CouponRedemptionStatus,
    default: CouponRedemptionStatus.APPLIED,
  })
  status: CouponRedemptionStatus;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string | null;

  @Column({ name: 'transaction_reference', type: 'varchar', length: 120, nullable: true })
  transactionReference: string | null;

  @Column({ name: 'original_amount', type: 'decimal', precision: 12, scale: 2 })
  originalAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2 })
  discountAmount: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 12, scale: 2 })
  finalAmount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, unknown>;
}

