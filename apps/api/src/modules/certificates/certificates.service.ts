import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { randomBytes, randomInt } from 'crypto';
import { UserRole } from '@tbcn/shared';
import {
  createPaginatedResult,
  createPaginationMeta,
  PaginatedResult,
} from '../../common/dto/pagination.dto';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { EnrollmentStatus } from '../enrollments/entities/enrollment.entity';
import { CertificatesRepository } from './certificates.repository';
import { Certificate } from './entities/certificate.entity';
import { GenerateCertificateDto } from './dto/generate-certificate.dto';

export const CERTIFICATE_EVENTS = {
  ISSUED: 'certificate.issued',
  REVOKED: 'certificate.revoked',
};

interface UserContext {
  id: string;
  role: UserRole;
}

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(
    private readonly repository: CertificatesRepository,
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async generate(
    dto: GenerateCertificateDto,
    issuedBy: string,
  ): Promise<Certificate> {
    return this.issueForEnrollment(dto.enrollmentId, issuedBy);
  }

  async issueForEnrollment(
    enrollmentId: string,
    issuedBy: string | null = null,
  ): Promise<Certificate> {
    const existing = await this.repository.findByEnrollmentId(enrollmentId);
    if (existing) {
      return existing;
    }

    const enrollment = await this.enrollmentsRepository.findById(enrollmentId, [
      'user',
      'program',
    ]);
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID "${enrollmentId}" not found`);
    }

    if (enrollment.status !== EnrollmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Certificate can only be issued for completed enrollments',
      );
    }

    const certificateNumber = await this.generateUniqueCertificateNumber();
    const verificationCode = await this.generateUniqueVerificationCode();

    const recipientName = enrollment.user
      ? `${enrollment.user.firstName} ${enrollment.user.lastName}`.trim()
      : 'Member';
    const programTitle = enrollment.program?.title || 'Program';

    const certificate = await this.repository.create({
      userId: enrollment.userId,
      programId: enrollment.programId,
      enrollmentId: enrollment.id,
      certificateNumber,
      verificationCode,
      recipientName,
      programTitle,
      completionDate: enrollment.completedAt,
      issuedBy,
      metadata: {
        progressPercentage: enrollment.progressPercentage,
        completedLessons: enrollment.completedLessons,
        totalLessons: enrollment.totalLessons,
      },
    });

    await this.enrollmentsService.attachCertificate(enrollment.id, certificate.id);

    this.eventEmitter.emit(CERTIFICATE_EVENTS.ISSUED, {
      certificateId: certificate.id,
      enrollmentId: enrollment.id,
      userId: enrollment.userId,
      programId: enrollment.programId,
    });

    return certificate;
  }

  async findById(id: string, user: UserContext): Promise<Certificate> {
    const certificate = await this.repository.findById(id);
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID "${id}" not found`);
    }

    if (!this.canAccess(certificate, user)) {
      throw new ForbiddenException('You do not have access to this certificate');
    }

    return certificate;
  }

  async findMyCertificates(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<Certificate>> {
    const { data, total } = await this.repository.findByUserId(userId, page, limit);
    const meta = createPaginationMeta(page, limit, total);
    return createPaginatedResult(data, meta);
  }

  async findByEnrollment(
    enrollmentId: string,
    user: UserContext,
  ): Promise<Certificate> {
    const certificate = await this.repository.findByEnrollmentId(enrollmentId);
    if (!certificate) {
      throw new NotFoundException(
        `Certificate for enrollment "${enrollmentId}" not found`,
      );
    }

    if (!this.canAccess(certificate, user)) {
      throw new ForbiddenException('You do not have access to this certificate');
    }

    return certificate;
  }

  async verifyByCode(verificationCode: string): Promise<Certificate> {
    const certificate = await this.repository.findByVerificationCode(
      verificationCode.toUpperCase(),
    );
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    return certificate;
  }

  async revoke(
    id: string,
    reason: string,
    revokedBy: string,
  ): Promise<Certificate> {
    const certificate = await this.repository.findById(id);
    if (!certificate) {
      throw new NotFoundException(`Certificate with ID "${id}" not found`);
    }

    if (certificate.isRevoked) {
      throw new ConflictException('Certificate is already revoked');
    }

    const updated = await this.repository.update(id, {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason || 'Revoked by administrator',
      issuedBy: revokedBy,
    });

    this.eventEmitter.emit(CERTIFICATE_EVENTS.REVOKED, {
      certificateId: updated.id,
      userId: updated.userId,
      reason: updated.revokedReason,
    });

    return updated;
  }

  @OnEvent('enrollment.completed')
  async handleEnrollmentCompleted(payload: { enrollmentId: string }): Promise<void> {
    try {
      await this.issueForEnrollment(payload.enrollmentId, null);
    } catch (error) {
      this.logger.error(
        `Failed to auto-issue certificate for enrollment ${payload.enrollmentId}: ${
          (error as Error).message
        }`,
      );
    }
  }

  private canAccess(certificate: Certificate, user: UserContext): boolean {
    const privilegedRoles = [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.COACH,
    ];
    return privilegedRoles.includes(user.role) || certificate.userId === user.id;
  }

  private async generateUniqueCertificateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = `TBCN-${year}-${randomInt(100000, 999999)}`;
      const exists = await this.repository.findByCertificateNumber(candidate);
      if (!exists) {
        return candidate;
      }
    }

    throw new ConflictException('Unable to generate unique certificate number');
  }

  private async generateUniqueVerificationCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = randomBytes(8).toString('hex').toUpperCase();
      const exists = await this.repository.findByVerificationCode(candidate);
      if (!exists) {
        return candidate;
      }
    }

    throw new ConflictException('Unable to generate unique verification code');
  }
}
