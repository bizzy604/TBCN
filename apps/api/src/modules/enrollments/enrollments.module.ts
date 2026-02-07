import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsController } from './enrollments.controller';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsRepository } from './enrollments.repository';
import { Enrollment } from './entities/enrollment.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { ProgramsModule } from '../programs/programs.module';

/**
 * Enrollments Module
 * Manages user enrollments in programs
 * - Enrollment creation
 * - Progress tracking
 * - Lesson completion
 * - Certificate generation triggers
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment, LessonProgress]),
    ProgramsModule,
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService, EnrollmentsRepository],
  exports: [EnrollmentsService, EnrollmentsRepository, TypeOrmModule],
})
export class EnrollmentsModule {}
