import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Enrollment } from './enrollment.entity';
import { Lesson } from '../../programs/entities/lesson.entity';

@Entity('lesson_progress')
@Unique('uq_lesson_progress', ['enrollmentId', 'lessonId'])
@Index('idx_lesson_progress_enrollment', ['enrollmentId'])
export class LessonProgress extends BaseEntity {
  @ManyToOne(() => Enrollment, (enrollment) => enrollment.lessonProgress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId: string;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({
    name: 'time_spent',
    type: 'int',
    default: 0,
    comment: 'Time spent in seconds',
  })
  timeSpent: number;

  @Column({
    name: 'last_position',
    type: 'int',
    default: 0,
    comment: 'Video position in seconds',
  })
  lastPosition: number;
}
