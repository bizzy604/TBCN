import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from './entities/assessment.entity';
import { AssessmentSubmission } from './entities/assessment-submission.entity';

@Injectable()
export class AssessmentsRepository {
  constructor(
    @InjectRepository(Assessment)
    private readonly assessmentRepo: Repository<Assessment>,
    @InjectRepository(AssessmentSubmission)
    private readonly submissionRepo: Repository<AssessmentSubmission>,
  ) {}

  // ─── Assessments ─────────────────────────────────────

  async create(data: Partial<Assessment>): Promise<Assessment> {
    const assessment = this.assessmentRepo.create(data);
    return this.assessmentRepo.save(assessment);
  }

  async findById(id: string): Promise<Assessment | null> {
    return this.assessmentRepo.findOne({ where: { id } });
  }

  async findByLessonId(lessonId: string): Promise<Assessment | null> {
    return this.assessmentRepo.findOne({ where: { lessonId } });
  }

  async update(id: string, data: Partial<Assessment>): Promise<Assessment> {
    await this.assessmentRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.assessmentRepo.delete(id);
  }

  // ─── Submissions ────────────────────────────────────

  async createSubmission(data: Partial<AssessmentSubmission>): Promise<AssessmentSubmission> {
    const submission = this.submissionRepo.create(data);
    return this.submissionRepo.save(submission);
  }

  async findSubmissionById(id: string): Promise<AssessmentSubmission | null> {
    return this.submissionRepo.findOne({
      where: { id },
      relations: ['assessment'],
    });
  }

  async findSubmissionsByAssessmentAndUser(
    assessmentId: string,
    userId: string,
  ): Promise<AssessmentSubmission[]> {
    return this.submissionRepo.find({
      where: { assessmentId, userId },
      order: { attemptNumber: 'ASC' },
    });
  }

  async findSubmissionsByEnrollment(enrollmentId: string): Promise<AssessmentSubmission[]> {
    return this.submissionRepo.find({
      where: { enrollmentId },
      relations: ['assessment'],
      order: { submittedAt: 'DESC' },
    });
  }

  async countAttempts(assessmentId: string, userId: string): Promise<number> {
    return this.submissionRepo.count({
      where: { assessmentId, userId },
    });
  }

  async updateSubmission(
    id: string,
    data: Partial<AssessmentSubmission>,
  ): Promise<AssessmentSubmission> {
    await this.submissionRepo.update(id, data);
    return this.findSubmissionById(id);
  }
}
