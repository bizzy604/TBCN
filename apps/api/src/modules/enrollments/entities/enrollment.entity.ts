import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { Program } from '../../programs/entities/program.entity';
import { LessonProgress } from './lesson-progress.entity';
import { EnrollmentStatus } from '@tbcn/shared';

export { EnrollmentStatus };

@Entity('enrollments')
@Unique('uq_enrollment_user_program', ['userId', 'programId'])
@Index('idx_enrollments_user', ['userId'])
@Index('idx_enrollments_program', ['programId'])
@Index('idx_enrollments_status', ['status'])
export class Enrollment extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => Program, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ name: 'program_id', type: 'uuid' })
  programId: string;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column({
    name: 'progress_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  progressPercentage: number;

  @Column({ name: 'completed_lessons', type: 'int', default: 0 })
  completedLessons: number;

  @Column({ name: 'total_lessons', type: 'int', default: 0 })
  totalLessons: number;

  @Column({ name: 'last_accessed_at', type: 'timestamptz', nullable: true })
  lastAccessedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'enrolled_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  enrolledAt: Date;

  @Column({ name: 'certificate_id', type: 'uuid', nullable: true })
  certificateId: string | null;

  @OneToMany(() => LessonProgress, (lp) => lp.enrollment, { cascade: true })
  lessonProgress: LessonProgress[];

  // Helpers
  get isCompleted(): boolean {
    return this.status === EnrollmentStatus.COMPLETED;
  }

  get isActive(): boolean {
    return this.status === EnrollmentStatus.ACTIVE;
  }
}
