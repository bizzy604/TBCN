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

@Entity('coach_availability')
@Unique('uq_coach_availability_day_time', [
  'coachId',
  'dayOfWeek',
  'startTime',
  'endTime',
])
@Index('idx_coach_availability_coach', ['coachId'])
export class CoachAvailability extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coach_id' })
  coach: User;

  @Column({ name: 'coach_id', type: 'uuid' })
  coachId: string;

  @Column({ name: 'day_of_week', type: 'int' })
  dayOfWeek: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
