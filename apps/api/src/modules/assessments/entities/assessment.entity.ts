import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Lesson } from '../../programs/entities/lesson.entity';
import { AssessmentSubmission } from './assessment-submission.entity';
import { AssessmentType, QuestionType, PASSING_GRADE, MAX_ASSESSMENT_ATTEMPTS } from '@tbcn/shared';

export { AssessmentType };

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[] | null;
  correctAnswer: string | null;
  points: number;
  sortOrder: number;
}

@Entity('assessments')
@Index('idx_assessments_lesson', ['lessonId'])
export class Assessment extends BaseEntity {
  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: AssessmentType,
    default: AssessmentType.QUIZ,
  })
  type: AssessmentType;

  @Column({
    name: 'passing_score',
    type: 'int',
    default: PASSING_GRADE,
    comment: 'Minimum percentage to pass',
  })
  passingScore: number;

  @Column({
    name: 'max_attempts',
    type: 'int',
    default: MAX_ASSESSMENT_ATTEMPTS,
  })
  maxAttempts: number;

  @Column({
    name: 'time_limit_minutes',
    type: 'int',
    nullable: true,
  })
  timeLimitMinutes: number | null;

  @Column({ type: 'jsonb', default: [] })
  questions: Question[];

  @OneToMany(() => AssessmentSubmission, (sub) => sub.assessment)
  submissions: AssessmentSubmission[];

  // Helpers
  get totalPoints(): number {
    return this.questions?.reduce((sum, q) => sum + q.points, 0) ?? 0;
  }

  get questionCount(): number {
    return this.questions?.length ?? 0;
  }
}
