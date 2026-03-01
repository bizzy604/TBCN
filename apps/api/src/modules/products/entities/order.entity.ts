import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { PaymentMethod } from '../../payments/enums/payment-method.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderItem } from './order-item.entity';

@Entity('orders')
@Index('idx_orders_user', ['userId'])
@Index('idx_orders_status', ['status'])
@Index('idx_orders_invoice', ['invoiceNumber'], { unique: true })
@Index('idx_orders_transaction_reference', ['transactionReference'])
export class Order extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'invoice_number', type: 'varchar', length: 50, unique: true })
  invoiceNumber: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAYMENT,
  })
  status: OrderStatus;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
  })
  paymentMethod: PaymentMethod | null;

  @Column({ name: 'transaction_reference', type: 'varchar', length: 120, nullable: true })
  transactionReference: string | null;

  @Column({ type: 'varchar', length: 10, default: 'KES' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({ name: 'coupon_id', type: 'uuid', nullable: true })
  couponId: string | null;

  @Column({ name: 'coupon_code', type: 'varchar', length: 40, nullable: true })
  couponCode: string | null;

  @Column({ name: 'shipping_address', type: 'jsonb', nullable: true })
  shippingAddress: Record<string, unknown> | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
