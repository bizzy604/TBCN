import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssessmentType, QuestionType } from '@tbcn/shared';
import { AssessmentsService } from './assessments.service';
import { AssessmentsRepository } from './assessments.repository';

describe('AssessmentsService', () => {
  let service: AssessmentsService;

  const mockRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByLessonId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createSubmission: jest.fn(),
    findSubmissionById: jest.fn(),
    findSubmissionsByAssessmentAndUser: jest.fn(),
    findSubmissionsByEnrollment: jest.fn(),
    countAttempts: jest.fn(),
    updateSubmission: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentsService,
        { provide: AssessmentsRepository, useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<AssessmentsService>(AssessmentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create assessment and emit created event', async () => {
      mockRepository.create.mockResolvedValueOnce({ id: 'assessment-1' });

      const result = await service.create({
        lessonId: 'lesson-1',
        title: 'Module Quiz',
        questions: [
          {
            text: 'What is branding?',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
            points: 10,
          },
        ],
      });

      expect(result.id).toBe('assessment-1');
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'assessment.created',
        expect.objectContaining({
          assessment: expect.objectContaining({ id: 'assessment-1' }),
        }),
      );
    });
  });

  describe('submit', () => {
    it('should enforce max attempt constraints', async () => {
      mockRepository.findById.mockResolvedValueOnce({
        id: 'assessment-1',
        type: AssessmentType.QUIZ,
        maxAttempts: 2,
      });
      mockRepository.countAttempts.mockResolvedValueOnce(2);

      await expect(
        service.submit('assessment-1', 'user-1', {
          enrollmentId: 'enrollment-1',
          answers: {},
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should auto-grade objective quiz submissions', async () => {
      mockRepository.findById.mockResolvedValueOnce({
        id: 'assessment-1',
        lessonId: 'lesson-1',
        title: 'Quiz',
        type: AssessmentType.QUIZ,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
            points: 10,
            sortOrder: 0,
          },
          {
            id: 'q2',
            text: 'Question 2',
            type: QuestionType.TRUE_FALSE,
            options: ['True', 'False'],
            correctAnswer: 'True',
            points: 10,
            sortOrder: 1,
          },
        ],
        totalPoints: 20,
      });
      mockRepository.countAttempts.mockResolvedValueOnce(1);
      mockRepository.createSubmission.mockResolvedValueOnce({
        id: 'submission-1',
        feedback: null,
      });

      const result = await service.submit('assessment-1', 'user-1', {
        enrollmentId: 'enrollment-1',
        answers: {
          q1: 'A',
          q2: 'True',
        },
      });

      expect(result.passed).toBe(true);
      expect(result.attemptNumber).toBe(2);
      expect(result.attemptsRemaining).toBe(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'assessment.passed',
        expect.any(Object),
      );
    });
  });

  describe('getForLearner', () => {
    it('should hide correctAnswer in learner payload', async () => {
      mockRepository.findById.mockResolvedValueOnce({
        id: 'assessment-1',
        lessonId: 'lesson-1',
        title: 'Quiz',
        description: null,
        type: AssessmentType.QUIZ,
        passingScore: 70,
        maxAttempts: 3,
        timeLimitMinutes: null,
        questions: [
          {
            id: 'q1',
            text: 'Question 1',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['A', 'B'],
            correctAnswer: 'A',
            points: 10,
            sortOrder: 0,
          },
        ],
      });

      const result = await service.getForLearner('assessment-1');
      expect(result.questions?.[0]).not.toHaveProperty('correctAnswer');
    });
  });
});

