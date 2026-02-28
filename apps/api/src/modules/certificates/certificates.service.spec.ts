import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRole } from '@tbcn/shared';
import { CertificatesService } from './certificates.service';
import { CertificatesRepository } from './certificates.repository';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { EnrollmentStatus } from '../enrollments/entities/enrollment.entity';

describe('CertificatesService', () => {
  let service: CertificatesService;

  const mockCertificatesRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByEnrollmentId: jest.fn(),
    findByVerificationCode: jest.fn(),
    findByCertificateNumber: jest.fn(),
    findByUserId: jest.fn(),
    update: jest.fn(),
  };

  const mockEnrollmentsRepository = {
    findById: jest.fn(),
  };

  const mockEnrollmentsService = {
    attachCertificate: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificatesService,
        { provide: CertificatesRepository, useValue: mockCertificatesRepository },
        { provide: EnrollmentsRepository, useValue: mockEnrollmentsRepository },
        { provide: EnrollmentsService, useValue: mockEnrollmentsService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<CertificatesService>(CertificatesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('issueForEnrollment', () => {
    it('should return existing certificate when already issued', async () => {
      const existing = { id: 'cert-1', enrollmentId: 'enroll-1' };
      mockCertificatesRepository.findByEnrollmentId.mockResolvedValueOnce(existing);

      const result = await service.issueForEnrollment('enroll-1');

      expect(result).toEqual(existing);
      expect(mockCertificatesRepository.findByEnrollmentId).toHaveBeenCalledWith(
        'enroll-1',
      );
      expect(mockCertificatesRepository.create).not.toHaveBeenCalled();
    });

    it('should throw when enrollment is not found', async () => {
      mockCertificatesRepository.findByEnrollmentId.mockResolvedValueOnce(null);
      mockEnrollmentsRepository.findById.mockResolvedValueOnce(null);

      await expect(service.issueForEnrollment('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw when enrollment is not completed', async () => {
      mockCertificatesRepository.findByEnrollmentId.mockResolvedValueOnce(null);
      mockEnrollmentsRepository.findById.mockResolvedValueOnce({
        id: 'enroll-1',
        status: EnrollmentStatus.ACTIVE,
      });

      await expect(service.issueForEnrollment('enroll-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should issue a certificate and attach it to enrollment', async () => {
      mockCertificatesRepository.findByEnrollmentId.mockResolvedValueOnce(null);
      mockEnrollmentsRepository.findById.mockResolvedValueOnce({
        id: 'enroll-1',
        userId: 'user-1',
        programId: 'program-1',
        status: EnrollmentStatus.COMPLETED,
        completedAt: new Date('2026-01-10T00:00:00.000Z'),
        progressPercentage: 100,
        completedLessons: 8,
        totalLessons: 8,
        user: {
          firstName: 'John',
          lastName: 'Doe',
        },
        program: {
          title: 'Master Your Brand',
        },
      });
      mockCertificatesRepository.findByCertificateNumber.mockResolvedValueOnce(null);
      mockCertificatesRepository.findByVerificationCode.mockResolvedValueOnce(null);
      mockCertificatesRepository.create.mockResolvedValueOnce({
        id: 'cert-1',
        enrollmentId: 'enroll-1',
        userId: 'user-1',
        programId: 'program-1',
      });

      const result = await service.issueForEnrollment('enroll-1', 'admin-1');

      expect(result.id).toBe('cert-1');
      expect(mockCertificatesRepository.create).toHaveBeenCalled();
      expect(mockEnrollmentsService.attachCertificate).toHaveBeenCalledWith(
        'enroll-1',
        'cert-1',
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'certificate.issued',
        expect.objectContaining({ certificateId: 'cert-1' }),
      );
    });
  });

  describe('findById', () => {
    it('should throw ForbiddenException when user is not owner and not privileged', async () => {
      mockCertificatesRepository.findById.mockResolvedValueOnce({
        id: 'cert-1',
        userId: 'owner-1',
      });

      await expect(
        service.findById('cert-1', { id: 'other-user', role: UserRole.MEMBER }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
