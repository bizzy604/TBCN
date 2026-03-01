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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '@tbcn/shared';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionFeedbackDto } from './dto/session-feedback.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionStatus } from './enums/session-status.enum';
import { SessionsService } from './sessions.service';

class SessionsQueryDto {
  page?: number;
  limit?: number;
  role?: 'coach' | 'mentee';
  status?: SessionStatus;
  upcoming?: boolean;
}

const COACHING_USER_ROLES: UserRole[] = [
  UserRole.MEMBER,
  UserRole.PARTNER,
  UserRole.COACH,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

@ApiTags('Coaching')
@Controller('sessions')
@ApiBearerAuth('JWT-auth')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @Roles(...COACHING_USER_ROLES)
  @ApiOperation({ summary: 'Book a coaching session' })
  @ApiResponse({ status: 201, description: 'Session created' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.bookSession(userId, dto);
  }

  @Get()
  @Roles(...COACHING_USER_ROLES)
  @ApiOperation({ summary: 'List current user sessions' })
  async findMine(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Query() query: SessionsQueryDto,
  ) {
    return this.sessionsService.listSessions({ id: userId, role }, query);
  }

  @Get(':id')
  @Roles(...COACHING_USER_ROLES)
  @ApiOperation({ summary: 'Get session by ID' })
  @ApiParam({ name: 'id', description: 'Session UUID' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.sessionsService.findById(id, { id: userId, role });
  }

  @Patch(':id')
  @Roles(...COACHING_USER_ROLES)
  @ApiOperation({ summary: 'Reschedule/cancel/complete a session' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionsService.updateSession(id, { id: userId, role }, dto);
  }

  @Post(':id/feedback')
  @Roles(...COACHING_USER_ROLES)
  @ApiOperation({ summary: 'Submit post-session feedback' })
  async submitFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: SessionFeedbackDto,
  ) {
    return this.sessionsService.submitFeedback(id, { id: userId, role }, dto);
  }
}
