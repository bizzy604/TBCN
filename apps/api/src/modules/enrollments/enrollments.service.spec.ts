import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EnrollmentStatus } from '@tbcn/shared';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsRepository } from './enrollments.repository';
import { ProgramsService } from '../programs/programs.service';
import { Transaction } from '../payments/entities/transaction.entity';
import { PaymentsService } from '../payments/payments.service';
import { PaymentMethod } from '../payments/enums/payment-method.enum';

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;

  const mockRepository = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByProgramId: jest.fn(),
    findByUserAndProgram: jest.fn(),
    getEnrollmentStats: jest.fn(),
    findOrCreateProgress: jest.fn(),
    updateProgress: jest.fn(),
    findProgressByEnrollment: jest.fn(),
    countCompletedLessons: jest.fn(),
  };

  const mockProgramsService = {
    findById: jest.fn(),
    countLessonsByProgramId: jest.fn(),
    incrementEnrollmentCount: jest.fn(),
    decrementEnrollmentCount: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockPaymentsService = {
    initiateCheckout: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  const mockTransactionRepo = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: EnrollmentsRepository, useValue: mockRepository },
        { provide: ProgramsService, useValue: mockProgramsService },
        { provide: getRepositoryToken(Transaction), useValue: mockTransactionRepo },
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<EnrollmentsService>(EnrollmentsService);
    jest.clearAllMocks();
    mockQueryBuilder.where.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
    mockQueryBuilder.orderBy.mockReturnThis();
    mockQueryBuilder.getOne.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('enroll', () => {
    it('should create enrollment and increment program count', async () => {
      mockProgramsService.findById.mockResolvedValueOnce({
        id: 'program-1',
        hasCapacity: true,
        price: 0,
        isFree: true,
      });
      mockRepository.findByUserAndProgram.mockResolvedValueOnce(null);
      mockProgramsService.countLessonsByProgramId.mockResolvedValueOnce(6);
      mockRepository.create.mockResolvedValueOnce({ id: 'enrollment-1' });
      mockRepository.findById.mockResolvedValueOnce({
        id: 'enrollment-1',
        userId: 'user-1',
        programId: 'program-1',
        status: EnrollmentStatus.ACTIVE,
      });

      const result = await service.enroll('user-1', { programId: 'program-1' });

      expect(result.id).toBe('enrollment-1');
      expect(mockProgramsService.incrementEnrollmentCount).toHaveBeenCalledWith('program-1');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'enrollment.created',
        expect.objectContaining({
          userId: 'user-1',
          programId: 'program-1',
        }),
      );
    });

    it('should throw ConflictException when user already has active enrollment', async () => {
      mockProgramsService.findById.mockResolvedValueOnce({ id: 'program-1', hasCapacity: true });
      mockRepository.findByUserAndProgram.mockResolvedValueOnce({
        id: 'enrollment-1',
        status: EnrollmentStatus.ACTIVE,
      });

      await expect(
        service.enroll('user-1', { programId: 'program-1' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject paid enrollment when payment is not completed', async () => {
      mockProgramsService.findById.mockResolvedValueOnce({
        id: 'program-1',
        hasCapacity: true,
        price: 1200,
        isFree: false,
      });
      mockRepository.findByUserAndProgram.mockResolvedValueOnce(null);
      mockQueryBuilder.getOne.mockResolvedValueOnce(null);

      await expect(
        service.enroll('user-1', { programId: 'program-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('initiateCheckout', () => {
    it('should initialize checkout for paid programs', async () => {
      mockProgramsService.findById.mockResolvedValueOnce({
        id: 'program-1',
        slug: 'brand-mastery',
        title: 'Brand Mastery',
        price: 1200,
        currency: 'KES',
        isFree: false,
      });
      mockQueryBuilder.getOne.mockResolvedValueOnce(null);
      mockPaymentsService.initiateCheckout.mockResolvedValueOnce({
        id: 'txn-1',
        reference: 'txn_ref',
      });

      const result = await service.initiateCheckout('program-1', 'user-1', {
        amount: 1200,
        paymentMethod: PaymentMethod.CARD,
      });

      expect(result.id).toBe('txn-1');
      expect(mockPaymentsService.initiateCheckout).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          amount: 1200,
          currency: 'KES',
          returnPath: '/programs/brand-mastery',
        }),
        expect.objectContaining({
          type: 'program_enrollment',
          metadata: expect.objectContaining({
            programId: 'program-1',
          }),
        }),
      );
    });
  });

  describe('drop', () => {
    it('should drop enrollment and decrement count', async () => {
      mockRepository.findById.mockResolvedValueOnce({
        id: 'enrollment-1',
        userId: 'user-1',
        programId: 'program-1',
        status: EnrollmentStatus.ACTIVE,
      });
      mockRepository.update.mockResolvedValueOnce({
        id: 'enrollment-1',
        status: EnrollmentStatus.DROPPED,
      });

      const result = await service.drop('enrollment-1', 'user-1');

      expect(result.status).toBe(EnrollmentStatus.DROPPED);
      expect(mockProgramsService.decrementEnrollmentCount).toHaveBeenCalledWith('program-1');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'enrollment.dropped',
        expect.objectContaining({ userId: 'user-1' }),
      );
    });
  });

  describe('updateProgress', () => {
    it('should update lesson progress and emit completion events', async () => {
      mockRepository.findById
        .mockResolvedValueOnce({
          id: 'enrollment-1',
          userId: 'user-1',
          programId: 'program-1',
          status: EnrollmentStatus.ACTIVE,
          isActive: true,
          totalLessons: 1,
        })
        .mockResolvedValueOnce({
          id: 'enrollment-1',
          userId: 'user-1',
          programId: 'program-1',
          totalLessons: 1,
        });
      mockRepository.findOrCreateProgress.mockResolvedValueOnce({
        id: 'progress-1',
        completed: false,
        timeSpent: 0,
        lastPosition: 0,
      });
      mockRepository.updateProgress.mockResolvedValueOnce({
        id: 'progress-1',
        completed: true,
      });
      mockRepository.countCompletedLessons.mockResolvedValueOnce(1);

      const result = await service.updateProgress('enrollment-1', 'user-1', {
        lessonId: 'lesson-1',
        completed: true,
      });

      expect(result.id).toBe('progress-1');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'enrollment.lesson.completed',
        expect.objectContaining({ enrollmentId: 'enrollment-1' }),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'enrollment.completed',
        expect.objectContaining({ enrollmentId: 'enrollment-1' }),
      );
    });
  });

  describe('attachCertificate', () => {
    it('should throw NotFoundException for unknown enrollment', async () => {
      mockRepository.findById.mockResolvedValueOnce(null);

      await expect(
        service.attachCertificate('missing-enrollment', 'certificate-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
