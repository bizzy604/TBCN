import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post as HttpPost,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@tbcn/shared';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { PostQueryDto } from './dto/post-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ReactionType } from './enums/reaction-type.enum';
import { PostsService } from './posts.service';
import { ReactionsService } from './reactions.service';

class ReactionDto {
  type?: ReactionType;
}

class ModerationLockDto {
  locked: boolean;
}

@ApiTags('Community')
@Controller('community/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List community posts' })
  async list(@Query() query: PostQueryDto) {
    return this.postsService.list(query);
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findById(id);
  }

  @HttpPost()
  @ApiBearerAuth('JWT-auth')
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, { id: userId, role }, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    await this.postsService.remove(id, { id: userId, role });
    return { success: true };
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'List comments for a post' })
  async listComments(@Param('id', ParseUUIDPipe) postId: string) {
    return this.commentsService.listByPost(postId);
  }

  @HttpPost(':id/comments')
  @ApiBearerAuth('JWT-auth')
  async addComment(
    @Param('id', ParseUUIDPipe) postId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, userId, dto);
  }

  @HttpPost(':id/reactions')
  @ApiBearerAuth('JWT-auth')
  async toggleReaction(
    @Param('id', ParseUUIDPipe) postId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReactionDto,
  ) {
    return this.reactionsService.togglePostReaction(postId, userId, dto.type ?? ReactionType.LIKE);
  }

  @Get('/moderation/list')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async listForModeration(@Query('limit') limit?: number) {
    return this.postsService.listForModeration(limit);
  }

  @Patch('/moderation/:id/lock')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async setLock(
    @Param('id', ParseUUIDPipe) postId: string,
    @Body() dto: ModerationLockDto,
  ) {
    return this.postsService.setLock(postId, !!dto.locked);
  }
}
