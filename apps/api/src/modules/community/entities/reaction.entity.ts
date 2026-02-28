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
import { Post } from './post.entity';
import { Comment } from './comment.entity';
import { ReactionType } from '../enums/reaction-type.enum';

@Entity('community_reactions')
@Unique('uq_community_reaction_post', ['userId', 'postId'])
@Unique('uq_community_reaction_comment', ['userId', 'commentId'])
@Index('idx_community_reactions_user', ['userId'])
export class Reaction extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => Post, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post | null;

  @Column({ name: 'post_id', type: 'uuid', nullable: true })
  postId: string | null;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment | null;

  @Column({ name: 'comment_id', type: 'uuid', nullable: true })
  commentId: string | null;

  @Column({
    type: 'enum',
    enum: ReactionType,
    default: ReactionType.LIKE,
  })
  type: ReactionType;
}
