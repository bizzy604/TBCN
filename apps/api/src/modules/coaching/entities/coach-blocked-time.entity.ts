import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';

@Entity('coach_blocked_times')
@Index('idx_coach_blocked_times_coach', ['coachId'])
@Index('idx_coach_blocked_times_start_end', ['startAt', 'endAt'])
export class CoachBlockedTime extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coach_id' })
  coach: User;

  @Column({ name: 'coach_id', type: 'uuid' })
  coachId: string;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt: Date;

  @Column({ type: 'text', nullable: true })
  reason: string | null;
}
