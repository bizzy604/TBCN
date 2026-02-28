import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';
import { Reaction } from './reaction.entity';

@Entity('community_comments')
@Index('idx_community_comments_post', ['postId'])
@Index('idx_community_comments_author', ['authorId'])
export class Comment extends BaseEntity {
  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @Column({ name: 'post_id', type: 'uuid' })
  postId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'reaction_count', type: 'int', default: 0 })
  reactionCount: number;

  @OneToMany(() => Reaction, (reaction) => reaction.comment)
  reactions: Reaction[];
}
