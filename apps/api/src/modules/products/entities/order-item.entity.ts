import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Product } from './product.entity';
import { Order } from './order.entity';

@Entity('order_items')
@Index('idx_order_items_order', ['orderId'])
@Index('idx_order_items_product', ['productId'])
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId: string | null;

  @Column({ name: 'product_title', type: 'varchar', length: 180 })
  productTitle: string;

  @Column({ name: 'is_digital', type: 'boolean', default: true })
  isDigital: boolean;

  @Column({ name: 'download_url', type: 'varchar', length: 1000, nullable: true })
  downloadUrl: string | null;

  @Column({ name: 'download_token', type: 'varchar', length: 80, nullable: true })
  downloadToken: string | null;

  @Column({ name: 'download_expires_at', type: 'timestamptz', nullable: true })
  downloadExpiresAt: Date | null;

  @Column({ name: 'remaining_downloads', type: 'int', default: 0 })
  remainingDownloads: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 12, scale: 2 })
  lineTotal: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, unknown>;
}
