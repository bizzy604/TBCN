import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';

@Entity('analytics_events')
@Index('idx_analytics_events_name', ['eventName'])
@Index('idx_analytics_events_user', ['userId'])
export class AnalyticsEvent extends BaseEntity {
  @Column({ name: 'event_name', type: 'varchar', length: 120 })
  eventName: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  payload: Record<string, unknown>;
}
