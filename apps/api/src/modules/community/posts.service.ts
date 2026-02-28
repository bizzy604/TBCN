import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@tbcn/shared';
import {
  PaginatedResult,
  createPaginatedResult,
  createPaginationMeta,
} from '../../common/dto';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto } from './dto/post-query.dto';

interface Actor {
  id: string;
  role: UserRole;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async list(query: PostQueryDto): Promise<PaginatedResult<Post>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .orderBy('post.isPinned', 'DESC')
      .addOrderBy('post.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere(
        '(LOWER(post.title) LIKE LOWER(:search) OR LOWER(post.content) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (query.category) {
      qb.andWhere('post.category = :category', { category: query.category });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return createPaginatedResult(items, createPaginationMeta(page, limit, total));
  }

  async findById(id: string): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with ID "${id}" not found`);
    }
    return post;
  }

  async create(userId: string, dto: CreatePostDto): Promise<Post> {
    const post = this.postRepo.create({
      authorId: userId,
      title: dto.title,
      content: dto.content,
      category: dto.category,
      tags: dto.tags ?? [],
    });
    return this.postRepo.save(post);
  }

  async update(id: string, actor: Actor, dto: UpdatePostDto): Promise<Post> {
    const post = await this.findById(id);
    if (!this.canManage(post.authorId, actor)) {
      throw new ForbiddenException('You do not have permission to update this post');
    }
    await this.postRepo.update(id, {
      ...dto,
      tags: dto.tags ?? post.tags,
    });
    return this.findById(id);
  }

  async remove(id: string, actor: Actor): Promise<void> {
    const post = await this.findById(id);
    if (!this.canManage(post.authorId, actor)) {
      throw new ForbiddenException('You do not have permission to delete this post');
    }
    await this.postRepo.delete(id);
  }

  async listForModeration(limit = 50): Promise<Post[]> {
    return this.postRepo.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async setLock(postId: string, locked: boolean): Promise<Post> {
    const post = await this.findById(postId);
    post.isLocked = locked;
    return this.postRepo.save(post);
  }

  private canManage(authorId: string, actor: Actor): boolean {
    return actor.id === authorId || actor.role === UserRole.ADMIN || actor.role === UserRole.SUPER_ADMIN;
  }
}
