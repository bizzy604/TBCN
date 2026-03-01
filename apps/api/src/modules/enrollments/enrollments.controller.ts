import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '@tbcn/shared';

@ApiTags('Enrollments')
@Controller('enrollments')
@ApiBearerAuth('JWT-auth')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // ─── User Enrollments ────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Enroll in a program' })
  @ApiResponse({ status: 201, description: 'Enrollment created' })
  async enroll(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEnrollmentDto,
  ) {
    return this.enrollmentsService.enroll(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my enrollments' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMyEnrollments(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.enrollmentsService.findMyEnrollments(userId, page || 1, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  @ApiParam({ name: 'id', description: 'Enrollment UUID' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.enrollmentsService.findByIdForViewer(id, { id: userId, role });
  }

  @Patch(':id/drop')
  @ApiOperation({ summary: 'Drop/unenroll from a program' })
  async drop(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentsService.drop(id, userId);
  }

  // ─── Progress ────────────────────────────────────────

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update lesson progress' })
  async updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.enrollmentsService.updateProgress(id, userId, dto);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get all lesson progress for enrollment' })
  async getProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentsService.getProgress(id, userId);
  }

  // ─── Admin ──────────────────────────────────────────

  @Get('program/:programId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Get enrollments for a program (admin/coach)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getByProgram(
    @Param('programId', ParseUUIDPipe) programId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.enrollmentsService.findByProgramId(programId, page || 1, limit || 10);
  }

  @Get('stats/overview')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get enrollment statistics' })
  async getStats() {
    return this.enrollmentsService.getStats();
  }
}
