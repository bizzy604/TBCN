import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssessmentsRepository } from './assessments.repository';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import { Assessment, Question } from './entities/assessment.entity';
import { AssessmentSubmission } from './entities/assessment-submission.entity';
import { AssessmentResultDto, QuestionResultDto } from './dto/assessment-result.dto';
import { SubmissionStatus, QuestionType, AssessmentType } from '@tbcn/shared';
import { v4 as uuidv4 } from 'uuid';

export const ASSESSMENT_EVENTS = {
  CREATED: 'assessment.created',
  SUBMITTED: 'assessment.submitted',
  PASSED: 'assessment.passed',
  FAILED: 'assessment.failed',
  GRADED: 'assessment.graded',
};

@Injectable()
export class AssessmentsService {
  constructor(
    private readonly repository: AssessmentsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ═══════════════════════════════════════════════
  // Assessment CRUD
  // ═══════════════════════════════════════════════

  async create(dto: CreateAssessmentDto): Promise<Assessment> {
    // Assign IDs to questions
    const questions: Question[] = dto.questions.map((q, idx) => ({
      id: uuidv4(),
      text: q.text,
      type: q.type,
      options: q.options || null,
      correctAnswer: q.correctAnswer || null,
      points: q.points || 10,
      sortOrder: q.sortOrder ?? idx,
    }));

    const assessment = await this.repository.create({
      lessonId: dto.lessonId,
      title: dto.title,
      description: dto.description || null,
      type: dto.type || AssessmentType.QUIZ,
      passingScore: dto.passingScore ?? 70,
      maxAttempts: dto.maxAttempts ?? 3,
      timeLimitMinutes: dto.timeLimitMinutes || null,
      questions,
    } as Partial<Assessment>);

    this.eventEmitter.emit(ASSESSMENT_EVENTS.CREATED, { assessment });
    return assessment;
  }

  async findById(id: string): Promise<Assessment> {
    const assessment = await this.repository.findById(id);
    if (!assessment) {
      throw new NotFoundException(`Assessment with ID "${id}" not found`);
    }
    return assessment;
  }

  async findByLessonId(lessonId: string): Promise<Assessment | null> {
    return this.repository.findByLessonId(lessonId);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }

  // ═══════════════════════════════════════════════
  // Assessment Submissions & Grading
  // ═══════════════════════════════════════════════

  async submit(
    assessmentId: string,
    userId: string,
    dto: SubmitAssessmentDto,
  ): Promise<AssessmentResultDto> {
    const assessment = await this.findById(assessmentId);

    // Check attempt limit
    const attemptCount = await this.repository.countAttempts(assessmentId, userId);
    if (attemptCount >= assessment.maxAttempts) {
      throw new BadRequestException(
        `Maximum attempts (${assessment.maxAttempts}) reached for this assessment`,
      );
    }

    const attemptNumber = attemptCount + 1;

    // Auto-grade for objective types (quiz, true_false, multiple_choice)
    const isAutoGradable = assessment.type === AssessmentType.QUIZ;
    let score: number | null = null;
    let passed: boolean | null = null;
    let status = SubmissionStatus.PENDING;
    const results: QuestionResultDto[] = [];

    if (isAutoGradable) {
      let earnedPoints = 0;
      const totalPoints = assessment.totalPoints;

      for (const question of assessment.questions) {
        const userAnswer = dto.answers[question.id] || '';
        const isObjective =
          question.type === QuestionType.MULTIPLE_CHOICE ||
          question.type === QuestionType.TRUE_FALSE;

        let correct = false;
        let qEarnedPoints = 0;

        if (isObjective && question.correctAnswer) {
          correct =
            userAnswer.trim().toLowerCase() ===
            question.correctAnswer.trim().toLowerCase();
          qEarnedPoints = correct ? question.points : 0;
          earnedPoints += qEarnedPoints;
        }

        results.push({
          questionId: question.id,
          questionText: question.text,
          userAnswer,
          correct,
          points: question.points,
          earnedPoints: qEarnedPoints,
        });
      }

      const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      score = percentage;
      passed = percentage >= assessment.passingScore;
      status = SubmissionStatus.GRADED;
    } else {
      // Subjective — requires coach review
      status = SubmissionStatus.REQUIRES_REVIEW;

      for (const question of assessment.questions) {
        results.push({
          questionId: question.id,
          questionText: question.text,
          userAnswer: dto.answers[question.id] || '',
          correct: false,
          points: question.points,
          earnedPoints: 0,
        });
      }
    }

    const submission = await this.repository.createSubmission({
      assessmentId,
      enrollmentId: dto.enrollmentId,
      userId,
      answers: dto.answers,
      score,
      passed,
      status,
      attemptNumber,
    } as Partial<AssessmentSubmission>);

    this.eventEmitter.emit(ASSESSMENT_EVENTS.SUBMITTED, {
      submission,
      userId,
      assessmentId,
    });

    if (passed === true) {
      this.eventEmitter.emit(ASSESSMENT_EVENTS.PASSED, { submission });
    } else if (passed === false) {
      this.eventEmitter.emit(ASSESSMENT_EVENTS.FAILED, { submission });
    }

    return {
      submissionId: submission.id,
      assessmentId,
      score: score ?? 0,
      totalPoints: assessment.totalPoints,
      percentage: score ?? 0,
      passed: passed ?? false,
      attemptNumber,
      attemptsRemaining: assessment.maxAttempts - attemptNumber,
      feedback: submission.feedback,
      results,
    };
  }

  async getSubmissions(
    assessmentId: string,
    userId: string,
  ): Promise<AssessmentSubmission[]> {
    return this.repository.findSubmissionsByAssessmentAndUser(assessmentId, userId);
  }

  async getSubmissionsByEnrollment(enrollmentId: string): Promise<AssessmentSubmission[]> {
    return this.repository.findSubmissionsByEnrollment(enrollmentId);
  }

  async gradeSubmission(
    submissionId: string,
    graderId: string,
    score: number,
    feedback: string,
  ): Promise<AssessmentSubmission> {
    const submission = await this.repository.findSubmissionById(submissionId);
    if (!submission) {
      throw new NotFoundException(`Submission with ID "${submissionId}" not found`);
    }

    const assessment = submission.assessment || await this.findById(submission.assessmentId);
    const passed = score >= assessment.passingScore;

    const updated = await this.repository.updateSubmission(submissionId, {
      score,
      passed,
      feedback,
      gradedBy: graderId,
      gradedAt: new Date(),
      status: SubmissionStatus.GRADED,
    });

    this.eventEmitter.emit(ASSESSMENT_EVENTS.GRADED, { submission: updated });
    return updated;
  }

  // ═══════════════════════════════════════════════
  // Get assessment for learner (hide correct answers)
  // ═══════════════════════════════════════════════

  async getForLearner(assessmentId: string): Promise<Partial<Assessment>> {
    const assessment = await this.findById(assessmentId);
    // Strip correct answers from questions
    const sanitizedQuestions = assessment.questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options,
      points: q.points,
      sortOrder: q.sortOrder,
      // correctAnswer is intentionally omitted
    }));

    return {
      id: assessment.id,
      lessonId: assessment.lessonId,
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      passingScore: assessment.passingScore,
      maxAttempts: assessment.maxAttempts,
      timeLimitMinutes: assessment.timeLimitMinutes,
      questions: sanitizedQuestions as Question[],
    };
  }
}
