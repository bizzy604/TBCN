import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity';
import { ReactionType } from './enums/reaction-type.enum';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepo: Repository<Reaction>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async togglePostReaction(postId: string, userId: string, type: ReactionType): Promise<{ reacted: boolean }> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }

    const existing = await this.reactionRepo.findOne({ where: { postId, userId } });
    if (existing) {
      await this.reactionRepo.delete(existing.id);
      await this.postRepo.decrement({ id: postId }, 'reactionCount', 1);
      return { reacted: false };
    }

    await this.reactionRepo.save(this.reactionRepo.create({
      postId,
      userId,
      type,
      commentId: null,
    }));
    await this.postRepo.increment({ id: postId }, 'reactionCount', 1);
    return { reacted: true };
  }

  async toggleCommentReaction(commentId: string, userId: string, type: ReactionType): Promise<{ reacted: boolean }> {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID "${commentId}" not found`);
    }

    const existing = await this.reactionRepo.findOne({ where: { commentId, userId } });
    if (existing) {
      await this.reactionRepo.delete(existing.id);
      await this.commentRepo.decrement({ id: commentId }, 'reactionCount', 1);
      return { reacted: false };
    }

    await this.reactionRepo.save(this.reactionRepo.create({
      commentId,
      userId,
      type,
      postId: null,
    }));
    await this.commentRepo.increment({ id: commentId }, 'reactionCount', 1);
    return { reacted: true };
  }
}
