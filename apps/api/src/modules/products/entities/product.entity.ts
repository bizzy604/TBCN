import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { ProductType } from '../enums/product-type.enum';

@Entity('products')
@Index('idx_products_slug', ['slug'], { unique: true })
@Index('idx_products_type', ['type'])
@Index('idx_products_is_published', ['isPublished'])
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.DIGITAL,
  })
  type: ProductType;

  @Column({ name: 'is_published', type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ name: 'is_digital', type: 'boolean', default: true })
  isDigital: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'KES' })
  currency: string;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 600, nullable: true })
  thumbnailUrl: string | null;

  @Column({ name: 'download_url', type: 'varchar', length: 1000, nullable: true })
  downloadUrl: string | null;

  @Column({ name: 'stock_quantity', type: 'int', nullable: true })
  stockQuantity: number | null;

  @Column({ name: 'download_limit', type: 'int', default: 3 })
  downloadLimit: number;

  @Column({ name: 'download_expires_days', type: 'int', default: 7 })
  downloadExpiresDays: number;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, unknown>;
}
