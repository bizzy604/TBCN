import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Assessment } from './assessment.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { User } from '../../users/entities/user.entity';
import { SubmissionStatus } from '@tbcn/shared';

export { SubmissionStatus };

@Entity('assessment_submissions')
@Index('idx_submissions_assessment', ['assessmentId'])
@Index('idx_submissions_enrollment', ['enrollmentId'])
@Index('idx_submissions_user', ['userId'])
export class AssessmentSubmission extends BaseEntity {
  @ManyToOne(() => Assessment, (a) => a.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assessment_id' })
  assessment: Assessment;

  @Column({ name: 'assessment_id', type: 'uuid' })
  assessmentId: string;

  @ManyToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'jsonb', default: {} })
  answers: Record<string, string>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number | null;

  @Column({ type: 'boolean', nullable: true })
  passed: boolean | null;

  @Column({
    type: 'enum',
    enum: SubmissionStatus,
    default: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @Column({ name: 'attempt_number', type: 'int', default: 1 })
  attemptNumber: number;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ name: 'graded_by', type: 'uuid', nullable: true })
  gradedBy: string | null;

  @Column({
    name: 'submitted_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  submittedAt: Date;

  @Column({ name: 'graded_at', type: 'timestamptz', nullable: true })
  gradedAt: Date | null;
}
