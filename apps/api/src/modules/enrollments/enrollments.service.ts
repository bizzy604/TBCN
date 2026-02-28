import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EnrollmentsRepository } from './enrollments.repository';
import { ProgramsService } from '../programs/programs.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { Enrollment } from './entities/enrollment.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { EnrollmentStatus } from '@tbcn/shared';
import {
  PaginatedResult,
  createPaginationMeta,
  createPaginatedResult,
} from '../../common/dto';

export const ENROLLMENT_EVENTS = {
  CREATED: 'enrollment.created',
  COMPLETED: 'enrollment.completed',
  DROPPED: 'enrollment.dropped',
  PROGRESS_UPDATED: 'enrollment.progress.updated',
  LESSON_COMPLETED: 'enrollment.lesson.completed',
};

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly repository: EnrollmentsRepository,
    private readonly programsService: ProgramsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ═══════════════════════════════════════════════
  // Enrollment CRUD
  // ═══════════════════════════════════════════════

  async enroll(userId: string, dto: CreateEnrollmentDto): Promise<Enrollment> {
    const program = await this.programsService.findById(dto.programId);

    // Check if already enrolled
    const existing = await this.repository.findByUserAndProgram(userId, dto.programId);
    if (existing) {
      if (existing.status === EnrollmentStatus.ACTIVE) {
        throw new ConflictException('You are already enrolled in this program');
      }
      if (existing.status === EnrollmentStatus.COMPLETED) {
        throw new ConflictException('You have already completed this program');
      }
      // Re-enroll if dropped/expired
      const reEnrolled = await this.repository.update(existing.id, {
        status: EnrollmentStatus.ACTIVE,
        progressPercentage: 0,
        completedLessons: 0,
        completedAt: null,
        lastAccessedAt: new Date(),
      });
      return reEnrolled;
    }

    // Check capacity
    if (!program.hasCapacity) {
      throw new BadRequestException('This program has reached maximum enrollment capacity');
    }

    // Get total lesson count
    const totalLessons = await this.programsService.countLessonsByProgramId(dto.programId);

    const enrollment = await this.repository.create({
      userId,
      programId: dto.programId,
      totalLessons,
      status: EnrollmentStatus.ACTIVE,
    });

    // Increment program enrollment count
    await this.programsService.incrementEnrollmentCount(dto.programId);

    this.eventEmitter.emit(ENROLLMENT_EVENTS.CREATED, {
      enrollment,
      userId,
      programId: dto.programId,
    });

    return this.repository.findById(enrollment.id, ['program']);
  }

  async findById(id: string): Promise<Enrollment> {
    const enrollment = await this.repository.findById(id, ['program', 'lessonProgress']);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID "${id}" not found`);
    }
    return enrollment;
  }

  async findMyEnrollments(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<Enrollment>> {
    const { data, total } = await this.repository.findByUserId(userId, page, limit);
    const meta = createPaginationMeta(page, limit, total);
    return createPaginatedResult(data, meta);
  }

  async findByProgramId(
    programId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<Enrollment>> {
    const { data, total } = await this.repository.findByProgramId(programId, page, limit);
    const meta = createPaginationMeta(page, limit, total);
    return createPaginatedResult(data, meta);
  }

  async drop(enrollmentId: string, userId: string): Promise<Enrollment> {
    const enrollment = await this.findById(enrollmentId);
    this.assertOwner(enrollment, userId);

    if (enrollment.status !== EnrollmentStatus.ACTIVE) {
      throw new BadRequestException('Can only drop an active enrollment');
    }

    const updated = await this.repository.update(enrollmentId, {
      status: EnrollmentStatus.DROPPED,
    });

    await this.programsService.decrementEnrollmentCount(enrollment.programId);

    this.eventEmitter.emit(ENROLLMENT_EVENTS.DROPPED, {
      enrollment: updated,
      userId,
    });

    return updated;
  }

  async getStats(): Promise<{ total: number; active: number; completed: number }> {
    return this.repository.getEnrollmentStats();
  }

  async attachCertificate(enrollmentId: string, certificateId: string): Promise<Enrollment> {
    const enrollment = await this.repository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID "${enrollmentId}" not found`);
    }

    return this.repository.update(enrollmentId, {
      certificateId,
    });
  }

  // ═══════════════════════════════════════════════
  // Progress Tracking
  // ═══════════════════════════════════════════════

  async updateProgress(
    enrollmentId: string,
    userId: string,
    dto: UpdateProgressDto,
  ): Promise<LessonProgress> {
    const enrollment = await this.findById(enrollmentId);
    this.assertOwner(enrollment, userId);

    if (!enrollment.isActive) {
      throw new BadRequestException('Cannot update progress on a non-active enrollment');
    }

    // Find or create lesson progress
    const progress = await this.repository.findOrCreateProgress(
      enrollmentId,
      dto.lessonId,
    );

    const updateData: Partial<LessonProgress> = {};

    if (dto.timeSpent !== undefined) {
      updateData.timeSpent = (progress.timeSpent || 0) + dto.timeSpent;
    }

    if (dto.lastPosition !== undefined) {
      updateData.lastPosition = dto.lastPosition;
    }

    if (dto.completed && !progress.completed) {
      updateData.completed = true;
      updateData.completedAt = new Date();
    }

    const updatedProgress = await this.repository.updateProgress(progress.id, updateData);

    // Update enrollment-level progress
    await this.recalculateEnrollmentProgress(enrollmentId);

    // Update last accessed
    await this.repository.update(enrollmentId, {
      lastAccessedAt: new Date(),
    } as Partial<Enrollment>);

    if (dto.completed && !progress.completed) {
      this.eventEmitter.emit(ENROLLMENT_EVENTS.LESSON_COMPLETED, {
        enrollmentId,
        lessonId: dto.lessonId,
        userId,
      });
    }

    return updatedProgress;
  }

  async getProgress(enrollmentId: string, userId: string): Promise<LessonProgress[]> {
    const enrollment = await this.findById(enrollmentId);
    this.assertOwner(enrollment, userId);
    return this.repository.findProgressByEnrollment(enrollmentId);
  }

  // ═══════════════════════════════════════════════
  // Private Helpers
  // ═══════════════════════════════════════════════

  private assertOwner(enrollment: Enrollment, userId: string): void {
    if (enrollment.userId !== userId) {
      throw new BadRequestException('You do not have access to this enrollment');
    }
  }

  private async recalculateEnrollmentProgress(enrollmentId: string): Promise<void> {
    const enrollment = await this.repository.findById(enrollmentId);
    if (!enrollment) return;

    const completedLessons = await this.repository.countCompletedLessons(enrollmentId);
    const totalLessons = enrollment.totalLessons || 1;
    const progressPercentage = Math.min(
      100,
      Math.round((completedLessons / totalLessons) * 10000) / 100,
    );

    const updateData: Partial<Enrollment> = {
      completedLessons,
      progressPercentage,
    };

    // Check if completed
    if (completedLessons >= totalLessons && totalLessons > 0) {
      updateData.status = EnrollmentStatus.COMPLETED;
      updateData.completedAt = new Date();
    }

    await this.repository.update(enrollmentId, updateData);

    if (updateData.status === EnrollmentStatus.COMPLETED) {
      this.eventEmitter.emit(ENROLLMENT_EVENTS.COMPLETED, {
        enrollmentId,
        userId: enrollment.userId,
        programId: enrollment.programId,
      });
    }
  }
}
