import { Entity, Column, Unique, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';

@Entity('payment_webhook_events')
@Unique('uq_payment_webhook_events_idempotency', ['idempotencyKey'])
@Index('idx_payment_webhook_events_provider', ['provider'])
export class WebhookEvent extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  provider: string;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 200 })
  idempotencyKey: string;

  @Column({ name: 'processed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  processedAt: Date;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload: Record<string, unknown>;
}

