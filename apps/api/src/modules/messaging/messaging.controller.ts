import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@tbcn/shared';
import { CurrentUser, Roles } from '../../common/decorators';
import { ConversationQueryDto } from './dto/conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagingService } from './messaging.service';

const MESSAGING_USER_ROLES: UserRole[] = [
  UserRole.MEMBER,
  UserRole.PARTNER,
  UserRole.COACH,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

@ApiTags('Messaging')
@Controller('messages')
@ApiBearerAuth('JWT-auth')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'List conversations for current user' })
  async listConversations(@CurrentUser('id') userId: string) {
    return this.messagingService.listConversations(userId);
  }

  @Get('conversations/:peerId')
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'Get message thread with a specific peer' })
  async getConversation(
    @CurrentUser('id') userId: string,
    @Param('peerId', ParseUUIDPipe) peerId: string,
    @Query() query: ConversationQueryDto,
  ) {
    return this.messagingService.getConversation(userId, peerId, query);
  }

  @Post()
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'Send a direct message' })
  async send(
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.send(userId, dto);
  }

  @Patch(':id/read')
  @Roles(...MESSAGING_USER_ROLES)
  @ApiOperation({ summary: 'Mark a message as read' })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.messagingService.markAsRead(id, userId);
  }
}
