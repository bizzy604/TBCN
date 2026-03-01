import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';

interface EnrollmentCreatedPayload {
  userId?: string;
  programId?: string;
}

interface EnrollmentCompletedPayload {
  userId?: string;
  enrollmentId?: string;
  programId?: string;
}

interface CertificatePayload {
  userId?: string;
  certificateId?: string;
}

interface AssessmentPayload {
  submission?: {
    userId?: string;
    assessmentId?: string;
    score?: number | null;
    feedback?: string | null;
  };
}

interface UserRoleChangedPayload {
  userId?: string;
  oldRole?: string;
  newRole?: string;
}

interface UserStatusChangedPayload {
  userId?: string;
  oldStatus?: string;
  newStatus?: string;
}

@Injectable()
export class NotificationsEventsListener {
  private readonly logger = new Logger(NotificationsEventsListener.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('auth.user.registered')
  async onUserRegistered(payload: { userId?: string }) {
    if (!payload?.userId) return;
    await this.safeCreate(
      payload.userId,
      'Welcome to TBCN',
      'Your account was created successfully. Verify your email to unlock all features.',
      NotificationType.SUCCESS,
      { event: 'auth.user.registered' },
    );
  }

  @OnEvent('enrollment.created')
  async onEnrollmentCreated(payload: EnrollmentCreatedPayload) {
    if (!payload?.userId) return;
    await this.safeCreate(
      payload.userId,
      'Enrollment confirmed',
      'You have been enrolled successfully. Start learning from your dashboard.',
      NotificationType.SUCCESS,
      { event: 'enrollment.created', programId: payload.programId },
    );
  }

  @OnEvent('enrollment.completed')
  async onEnrollmentCompleted(payload: EnrollmentCompletedPayload) {
    if (!payload?.userId) return;
    await this.safeCreate(
      payload.userId,
      'Program completed',
      'Congratulations on completing your program. Your certificate is being prepared.',
      NotificationType.SUCCESS,
      {
        event: 'enrollment.completed',
        enrollmentId: payload.enrollmentId,
        programId: payload.programId,
      },
    );
  }

  @OnEvent('certificate.issued')
  async onCertificateIssued(payload: CertificatePayload) {
    if (!payload?.userId) return;
    await this.safeCreate(
      payload.userId,
      'Certificate issued',
      'Your certificate is ready. You can view and verify it from your certificates page.',
      NotificationType.SUCCESS,
      { event: 'certificate.issued', certificateId: payload.certificateId },
    );
  }

  @OnEvent('certificate.revoked')
  async onCertificateRevoked(payload: { userId?: string; reason?: string }) {
    if (!payload?.userId) return;
    await this.safeCreate(
      payload.userId,
      'Certificate revoked',
      payload.reason || 'One of your certificates has been revoked by an administrator.',
      NotificationType.WARNING,
      { event: 'certificate.revoked' },
    );
  }

  @OnEvent('assessment.passed')
  async onAssessmentPassed(payload: AssessmentPayload) {
    const userId = payload?.submission?.userId;
    if (!userId) return;
    await this.safeCreate(
      userId,
      'Assessment passed',
      'Great work. You passed your assessment successfully.',
      NotificationType.SUCCESS,
      {
        event: 'assessment.passed',
        assessmentId: payload.submission?.assessmentId,
      },
    );
  }

  @OnEvent('assessment.failed')
  async onAssessmentFailed(payload: AssessmentPayload) {
    const userId = payload?.submission?.userId;
    if (!userId) return;
    await this.safeCreate(
      userId,
      'Assessment attempt recorded',
      'Your assessment was submitted. Review feedback and try again if attempts remain.',
      NotificationType.WARNING,
      {
        event: 'assessment.failed',
        assessmentId: payload.submission?.assessmentId,
      },
    );
  }

  @OnEvent('assessment.graded')
  async onAssessmentGraded(payload: AssessmentPayload) {
    const userId = payload?.submission?.userId;
    if (!userId) return;
    const score = payload?.submission?.score;
    await this.safeCreate(
      userId,
      'Assessment graded',
      score !== null && score !== undefined
        ? `Your assessment has been graded. Score: ${score}.`
        : 'Your assessment has been graded.',
      NotificationType.INFO,
      {
        event: 'assessment.graded',
        assessmentId: payload.submission?.assessmentId,
      },
    );
  }

  @OnEvent('user.role.changed')
  async onUserRoleChanged(payload: UserRoleChangedPayload) {
    if (!payload?.userId) return;
    await this.safeCreate(
      payload.userId,
      'Role updated',
      `Your account role changed from ${payload.oldRole || 'unknown'} to ${payload.newRole || 'unknown'}.`,
      NotificationType.INFO,
      { event: 'user.role.changed' },
    );
  }

  @OnEvent('user.status.changed')
  async onUserStatusChanged(payload: UserStatusChangedPayload) {
    if (!payload?.userId) return;
    const type =
      payload.newStatus === 'active' ? NotificationType.SUCCESS : NotificationType.WARNING;
    await this.safeCreate(
      payload.userId,
      'Account status updated',
      `Your account status changed from ${payload.oldStatus || 'unknown'} to ${payload.newStatus || 'unknown'}.`,
      type,
      { event: 'user.status.changed' },
    );
  }

  private async safeCreate(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.notificationsService.createForUser(userId, title, message, type, metadata);
    } catch (error) {
      this.logger.warn(
        `Failed to create notification for user ${userId}: ${(error as Error).message}`,
      );
    }
  }
}
