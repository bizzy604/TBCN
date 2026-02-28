import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { EventRegistration } from './event-registration.entity';

@Entity('event_tickets')
@Index('idx_event_tickets_registration', ['registrationId'])
export class EventTicket extends BaseEntity {
  @ManyToOne(() => EventRegistration, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'registration_id' })
  registration: EventRegistration;

  @Column({ name: 'registration_id', type: 'uuid' })
  registrationId: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ name: 'qr_code_url', type: 'text', nullable: true })
  qrCodeUrl: string | null;
}
