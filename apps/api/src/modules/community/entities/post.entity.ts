import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { PostCategory } from '../enums/post-category.enum';
import { Comment } from './comment.entity';
import { Reaction } from './reaction.entity';

@Entity('community_posts')
@Index('idx_community_posts_author', ['authorId'])
@Index('idx_community_posts_category', ['category'])
export class Post extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column({ name: 'author_id', type: 'uuid' })
  authorId: string;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: PostCategory,
    default: PostCategory.GENERAL,
  })
  category: PostCategory;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ name: 'is_locked', type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  @Column({ name: 'reaction_count', type: 'int', default: 0 })
  reactionCount: number;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.post)
  reactions: Reaction[];
}
