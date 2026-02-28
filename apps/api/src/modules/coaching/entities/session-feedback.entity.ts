import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { CoachingSession } from './coaching-session.entity';

@Entity('session_feedback')
@Unique('uq_session_feedback_session', ['sessionId'])
@Index('idx_session_feedback_session', ['sessionId'])
export class SessionFeedback extends BaseEntity {
  @OneToOne(() => CoachingSession, (session) => session.feedback, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: CoachingSession;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ name: 'would_recommend', type: 'boolean', default: true })
  wouldRecommend: boolean;

  @Column({ name: 'feedback_text', type: 'text', nullable: true })
  feedbackText: string | null;

  @Column({ type: 'simple-array', default: '' })
  highlights: string[];

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic: boolean;
}
