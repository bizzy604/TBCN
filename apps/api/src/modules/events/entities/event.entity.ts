import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { EventStatus } from '../enums/event-status.enum';
import { LocationType } from '../enums/location-type.enum';
import { EventRegistration } from './event-registration.entity';

@Entity('events')
@Index('idx_events_organizer', ['organizerId'])
@Index('idx_events_start_at', ['startAt'])
@Index('idx_events_status', ['status'])
export class Event extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @Column({ name: 'organizer_id', type: 'uuid' })
  organizerId: string;

  @Column({ type: 'varchar', length: 220 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt: Date;

  @Column({
    name: 'location_type',
    type: 'enum',
    enum: LocationType,
    default: LocationType.VIRTUAL,
  })
  locationType: LocationType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ name: 'meeting_url', type: 'text', nullable: true })
  meetingUrl: string | null;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ name: 'banner_url', type: 'text', nullable: true })
  bannerUrl: string | null;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ name: 'registration_count', type: 'int', default: 0 })
  registrationCount: number;

  @OneToMany(() => EventRegistration, (registration) => registration.event)
  registrations: EventRegistration[];
}
