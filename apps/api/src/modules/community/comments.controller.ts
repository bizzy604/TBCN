import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post as HttpPost,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import { UserRole } from '@tbcn/shared';
import { CommentsService } from './comments.service';
import { ReactionType } from './enums/reaction-type.enum';
import { ReactionsService } from './reactions.service';

class ReactionDto {
  type?: ReactionType;
}

@ApiTags('Community')
@Controller('community/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
  ) {}

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    await this.commentsService.remove(id, { id: userId, role });
    return { success: true };
  }

  @HttpPost(':id/reactions')
  @ApiBearerAuth('JWT-auth')
  async toggleReaction(
    @Param('id', ParseUUIDPipe) commentId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReactionDto,
  ) {
    return this.reactionsService.toggleCommentReaction(commentId, userId, dto.type ?? ReactionType.LIKE);
  }
}
