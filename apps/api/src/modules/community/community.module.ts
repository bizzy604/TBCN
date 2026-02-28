import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { CommentsController } from './comments.controller';
import { PostsService } from './posts.service';
import { CommentsService } from './comments.service';
import { ReactionsService } from './reactions.service';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Reaction } from './entities/reaction.entity';
import { User } from '../users/entities/user.entity';

/**
 * Community Module
 * Manages community features
 * - Discussion forums
 * - Posts and comments
 * - Likes and reactions
 * - Topic circles
 */
@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, Reaction, User])],
  controllers: [PostsController, CommentsController],
  providers: [PostsService, CommentsService, ReactionsService],
  exports: [PostsService, CommentsService, ReactionsService, TypeOrmModule],
})
export class CommunityModule {}
