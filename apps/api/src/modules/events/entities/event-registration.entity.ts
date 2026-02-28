import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { Event } from './event.entity';
import { EventRegistrationStatus } from '../enums/event-status.enum';

@Entity('event_registrations')
@Unique('uq_event_registration_user_event', ['eventId', 'userId'])
@Index('idx_event_registrations_event', ['eventId'])
@Index('idx_event_registrations_user', ['userId'])
export class EventRegistration extends BaseEntity {
  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: EventRegistrationStatus,
    default: EventRegistrationStatus.REGISTERED,
  })
  status: EventRegistrationStatus;

  @Column({ name: 'registered_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  registeredAt: Date;
}
