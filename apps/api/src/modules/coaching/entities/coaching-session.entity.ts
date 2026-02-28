import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { SessionFeedback } from './session-feedback.entity';
import { SessionStatus, SessionType } from '../enums/session-status.enum';

@Entity('coaching_sessions')
@Index('idx_coaching_sessions_coach', ['coachId'])
@Index('idx_coaching_sessions_mentee', ['menteeId'])
@Index('idx_coaching_sessions_scheduled_at', ['scheduledAt'])
@Index('idx_coaching_sessions_status', ['status'])
export class CoachingSession extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coach_id' })
  coach: User;

  @Column({ name: 'coach_id', type: 'uuid' })
  coachId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentee_id' })
  mentee: User;

  @Column({ name: 'mentee_id', type: 'uuid' })
  menteeId: string;

  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({
    name: 'session_type',
    type: 'enum',
    enum: SessionType,
    default: SessionType.ONE_ON_ONE,
  })
  sessionType: SessionType;

  @Column({ type: 'varchar', length: 255 })
  topic: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ name: 'meeting_link', type: 'text', nullable: true })
  meetingLink: string | null;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @OneToOne(() => SessionFeedback, (feedback) => feedback.session, {
    nullable: true,
  })
  feedback: SessionFeedback | null;

  get endsAt(): Date {
    return new Date(this.scheduledAt.getTime() + this.durationMinutes * 60_000);
  }

  get isActiveBooking(): boolean {
    return this.status === SessionStatus.SCHEDULED;
  }
}
