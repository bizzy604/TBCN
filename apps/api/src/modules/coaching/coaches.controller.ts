import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { UserRole } from '@tbcn/shared';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { AvailabilityService } from './availability.service';
import { CoachingService } from './coaching.service';
import { AvailabilityQueryDto, SetAvailabilityDto } from './dto/availability.dto';
import { UpsertCoachProfileDto } from './dto/coach-profile.dto';

class CoachesQueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

@ApiTags('Coaching')
@Controller('coaches')
export class CoachesController {
  constructor(
    private readonly coachingService: CoachingService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List coach profiles' })
  @ApiResponse({ status: 200, description: 'Paginated coach list' })
  async list(@Query() query: CoachesQueryDto) {
    return this.coachingService.listCoaches(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get coach profile by user ID' })
  @ApiParam({ name: 'id', description: 'Coach user UUID' })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.coachingService.getCoachById(id);
  }

  @Get(':id/availability')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get coach availability slots for a date range' })
  async getAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.availabilityService.getCoachAvailability(id, query);
  }

  @Post('me/profile')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create or update current coach profile' })
  async upsertProfile(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: UpsertCoachProfileDto,
  ) {
    return this.coachingService.upsertProfile(userId, role, dto);
  }

  @Post('me/availability')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Replace weekly availability for current coach' })
  async setAvailability(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.availabilityService.setWeeklyAvailability(userId, role, dto);
  }
}
