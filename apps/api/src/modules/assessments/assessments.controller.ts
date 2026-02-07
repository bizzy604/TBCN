import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '@tbcn/shared';

@ApiTags('Assessments')
@Controller('assessments')
@ApiBearerAuth('JWT-auth')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  // ─── Admin/Coach ─────────────────────────────────────

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Create an assessment for a lesson' })
  @ApiResponse({ status: 201, description: 'Assessment created' })
  async create(@Body() dto: CreateAssessmentDto) {
    return this.assessmentsService.create(dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an assessment' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.assessmentsService.delete(id);
  }

  @Patch('submissions/:submissionId/grade')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Grade a subjective submission' })
  async gradeSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @CurrentUser('id') graderId: string,
    @Body() body: { score: number; feedback: string },
  ) {
    return this.assessmentsService.gradeSubmission(
      submissionId,
      graderId,
      body.score,
      body.feedback,
    );
  }

  // ─── Learner ─────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment (learner view — answers hidden)' })
  @ApiParam({ name: 'id', description: 'Assessment UUID' })
  async getForLearner(@Param('id', ParseUUIDPipe) id: string) {
    return this.assessmentsService.getForLearner(id);
  }

  @Get(':id/full')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Get full assessment with answers (admin/coach)' })
  async getFullAssessment(@Param('id', ParseUUIDPipe) id: string) {
    return this.assessmentsService.findById(id);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'Get assessment for a lesson' })
  async getByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.assessmentsService.findByLessonId(lessonId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit assessment answers' })
  @ApiResponse({ status: 201, description: 'Assessment result' })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitAssessmentDto,
  ) {
    return this.assessmentsService.submit(id, userId, dto);
  }

  @Get(':id/submissions')
  @ApiOperation({ summary: 'Get my submissions for an assessment' })
  async getMySubmissions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.assessmentsService.getSubmissions(id, userId);
  }

  @Get('enrollment/:enrollmentId/submissions')
  @ApiOperation({ summary: 'Get all submissions for an enrollment' })
  async getEnrollmentSubmissions(
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
  ) {
    return this.assessmentsService.getSubmissionsByEnrollment(enrollmentId);
  }
}
