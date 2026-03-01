import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { UserRole } from '@tbcn/shared';
import { CreateEventDto } from './dto/create-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';
import { RegistrationsService } from './registrations.service';

const AUTHENTICATED_USER_ROLES: UserRole[] = [
  UserRole.MEMBER,
  UserRole.PARTNER,
  UserRole.COACH,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

const EVENT_MANAGER_ROLES: UserRole[] = [
  UserRole.COACH,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly registrationsService: RegistrationsService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List events' })
  async list(@Query() query: EventQueryDto) {
    return this.eventsService.list(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findById(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(...EVENT_MANAGER_ROLES)
  @ApiOperation({ summary: 'Create an event' })
  async create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create({ id: userId, role }, dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(...EVENT_MANAGER_ROLES)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, { id: userId, role }, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(...EVENT_MANAGER_ROLES)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    await this.eventsService.remove(id, { id: userId, role });
    return { success: true };
  }

  @Post(':id/register')
  @ApiBearerAuth('JWT-auth')
  @Roles(...AUTHENTICATED_USER_ROLES)
  async register(
    @Param('id', ParseUUIDPipe) eventId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.registrationsService.register(eventId, userId);
  }

  @Delete(':id/register')
  @ApiBearerAuth('JWT-auth')
  @Roles(...AUTHENTICATED_USER_ROLES)
  async cancelRegistration(
    @Param('id', ParseUUIDPipe) eventId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.registrationsService.cancel(eventId, userId);
  }

  @Get('me/registrations')
  @ApiBearerAuth('JWT-auth')
  @Roles(...AUTHENTICATED_USER_ROLES)
  async myRegistrations(@CurrentUser('id') userId: string) {
    return this.registrationsService.listMine(userId);
  }

  @Patch(':id/attendance/:registrationId')
  @ApiBearerAuth('JWT-auth')
  @Roles(...EVENT_MANAGER_ROLES)
  async markAttended(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Param('registrationId', ParseUUIDPipe) registrationId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.registrationsService.markAttended(eventId, registrationId, { id: userId, role });
  }
}
