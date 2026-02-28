import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@tbcn/shared';
import { Comment } from './entities/comment.entity';
import { Post } from './entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

interface Actor {
  id: string;
  role: UserRole;
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async listByPost(postId: string): Promise<Comment[]> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }
    return this.commentRepo.find({
      where: { postId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(postId: string, authorId: string, dto: CreateCommentDto): Promise<Comment> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID "${postId}" not found`);
    }
    if (post.isLocked) {
      throw new ForbiddenException('Comments are locked for this post');
    }

    const comment = this.commentRepo.create({
      postId,
      authorId,
      content: dto.content,
    });
    await this.commentRepo.save(comment);
    await this.postRepo.increment({ id: postId }, 'commentCount', 1);
    return this.commentRepo.findOne({ where: { id: comment.id }, relations: ['author'] });
  }

  async remove(commentId: string, actor: Actor): Promise<void> {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID "${commentId}" not found`);
    }
    if (comment.authorId !== actor.id && actor.role !== UserRole.ADMIN && actor.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }
    await this.commentRepo.delete(commentId);
    await this.postRepo.decrement({ id: comment.postId }, 'commentCount', 1);
  }
}
