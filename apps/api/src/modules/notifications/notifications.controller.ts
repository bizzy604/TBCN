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
import { SendNotificationDto } from './dto/send-notification.dto';
import { NotificationsService } from './notifications.service';

const NOTIFICATION_USER_ROLES: UserRole[] = [
  UserRole.MEMBER,
  UserRole.PARTNER,
  UserRole.COACH,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(...NOTIFICATION_USER_ROLES)
  @ApiOperation({ summary: 'List current user notifications' })
  async listMine(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationsService.listMine(userId, page, limit);
  }

  @Patch(':id/read')
  @Roles(...NOTIFICATION_USER_ROLES)
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markRead(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationsService.markRead(id, userId);
  }

  @Patch('read-all')
  @Roles(...NOTIFICATION_USER_ROLES)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @Post('send')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Send notifications to target users (admin)' })
  async send(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: SendNotificationDto,
  ) {
    return this.notificationsService.send({ id: userId, role }, dto);
  }
}
