import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { AssessmentsRepository } from './assessments.repository';
import { Assessment } from './entities/assessment.entity';
import { AssessmentSubmission } from './entities/assessment-submission.entity';

/**
 * Assessments Module
 * Manages quizzes, assignments, and grading
 * - Assessment CRUD
 * - Submission handling
 * - Auto-grading (objective) and manual grading (subjective)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Assessment, AssessmentSubmission]),
  ],
  controllers: [AssessmentsController],
  providers: [AssessmentsService, AssessmentsRepository],
  exports: [AssessmentsService, TypeOrmModule],
})
export class AssessmentsModule {}
