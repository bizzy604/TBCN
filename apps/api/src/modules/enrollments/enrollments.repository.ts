import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { LessonProgress } from './entities/lesson-progress.entity';
import { EnrollmentStatus } from '@tbcn/shared';

@Injectable()
export class EnrollmentsRepository {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(LessonProgress)
    private readonly progressRepo: Repository<LessonProgress>,
  ) {}

  // ─── Enrollments ─────────────────────────────────────

  async create(data: Partial<Enrollment>): Promise<Enrollment> {
    const enrollment = this.enrollmentRepo.create(data);
    return this.enrollmentRepo.save(enrollment);
  }

  async findById(id: string, relations: string[] = []): Promise<Enrollment | null> {
    return this.enrollmentRepo.findOne({ where: { id }, relations });
  }

  async findByUserAndProgram(
    userId: string,
    programId: string,
  ): Promise<Enrollment | null> {
    return this.enrollmentRepo.findOne({
      where: { userId, programId },
    });
  }

  async findByUserId(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Enrollment[]; total: number }> {
    const [data, total] = await this.enrollmentRepo.findAndCount({
      where: { userId },
      relations: ['program'],
      order: { enrolledAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findByProgramId(
    programId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Enrollment[]; total: number }> {
    const [data, total] = await this.enrollmentRepo.findAndCount({
      where: { programId },
      relations: ['user'],
      order: { enrolledAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async update(id: string, data: Partial<Enrollment>): Promise<Enrollment> {
    await this.enrollmentRepo.update(id, data);
    return this.findById(id, ['program']);
  }

  async delete(id: string): Promise<void> {
    await this.enrollmentRepo.delete(id);
  }

  async countByProgramId(programId: string): Promise<number> {
    return this.enrollmentRepo.count({ where: { programId } });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.enrollmentRepo.count({ where: { userId } });
  }

  async getEnrollmentStats(): Promise<{
    total: number;
    active: number;
    completed: number;
  }> {
    const total = await this.enrollmentRepo.count();
    const active = await this.enrollmentRepo.count({
      where: { status: EnrollmentStatus.ACTIVE },
    });
    const completed = await this.enrollmentRepo.count({
      where: { status: EnrollmentStatus.COMPLETED },
    });
    return { total, active, completed };
  }

  // ─── Lesson Progress ────────────────────────────────

  async findOrCreateProgress(
    enrollmentId: string,
    lessonId: string,
  ): Promise<LessonProgress> {
    let progress = await this.progressRepo.findOne({
      where: { enrollmentId, lessonId },
    });
    if (!progress) {
      progress = this.progressRepo.create({ enrollmentId, lessonId });
      progress = await this.progressRepo.save(progress);
    }
    return progress;
  }

  async updateProgress(
    id: string,
    data: Partial<LessonProgress>,
  ): Promise<LessonProgress> {
    await this.progressRepo.update(id, data);
    return this.progressRepo.findOne({ where: { id } });
  }

  async findProgressByEnrollment(enrollmentId: string): Promise<LessonProgress[]> {
    return this.progressRepo.find({
      where: { enrollmentId },
      order: { createdAt: 'ASC' },
    });
  }

  async countCompletedLessons(enrollmentId: string): Promise<number> {
    return this.progressRepo.count({
      where: { enrollmentId, completed: true },
    });
  }
}
