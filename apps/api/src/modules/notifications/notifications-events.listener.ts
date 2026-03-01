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

interface SessionEventPayload {
  sessionId?: string;
  coachId?: string;
  menteeId?: string;
  topic?: string;
  scheduledAt?: string | Date;
  completedAt?: string | Date;
  cancellationReason?: string | null;
  rating?: number;
}

interface MessageSentPayload {
  messageId?: string;
  senderId?: string;
  senderName?: string;
  recipientId?: string;
  recipientName?: string;
  preview?: string;
}

interface EventRegistrationPayload {
  eventId?: string;
  userId?: string;
  organizerId?: string;
  title?: string;
  price?: number;
  currency?: string;
}

interface PaymentPayload {
  transactionId?: string;
  reference?: string;
  userId?: string;
  type?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  status?: string;
  metadata?: Record<string, unknown>;
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

  @OnEvent('message.sent')
  async onMessageSent(payload: MessageSentPayload) {
    if (!payload?.recipientId) return;
    const senderName = payload.senderName || 'A user';
    await this.safeCreate(
      payload.recipientId,
      'New message received',
      `${senderName} sent you a new message.`,
      NotificationType.INFO,
      {
        event: 'message.sent',
        messageId: payload.messageId,
        senderId: payload.senderId,
        preview: payload.preview,
      },
    );
  }

  @OnEvent('session.booked')
  async onSessionBooked(payload: SessionEventPayload) {
    if (payload?.menteeId) {
      await this.safeCreate(
        payload.menteeId,
        'Session booked',
        `Your session "${payload.topic || 'Coaching session'}" has been booked successfully.`,
        NotificationType.SUCCESS,
        {
          event: 'session.booked',
          sessionId: payload.sessionId,
          scheduledAt: payload.scheduledAt,
        },
      );
    }
    if (payload?.coachId) {
      await this.safeCreate(
        payload.coachId,
        'New session booking',
        `A new session "${payload.topic || 'Coaching session'}" has been booked with you.`,
        NotificationType.INFO,
        {
          event: 'session.booked',
          sessionId: payload.sessionId,
          scheduledAt: payload.scheduledAt,
        },
      );
    }
  }

  @OnEvent('session.rescheduled')
  async onSessionRescheduled(payload: SessionEventPayload) {
    const message = `Session "${payload.topic || 'Coaching session'}" was rescheduled.`;
    if (payload?.menteeId) {
      await this.safeCreate(
        payload.menteeId,
        'Session rescheduled',
        message,
        NotificationType.INFO,
        { event: 'session.rescheduled', sessionId: payload.sessionId, scheduledAt: payload.scheduledAt },
      );
    }
    if (payload?.coachId) {
      await this.safeCreate(
        payload.coachId,
        'Session rescheduled',
        message,
        NotificationType.INFO,
        { event: 'session.rescheduled', sessionId: payload.sessionId, scheduledAt: payload.scheduledAt },
      );
    }
  }

  @OnEvent('session.cancelled')
  async onSessionCancelled(payload: SessionEventPayload) {
    const reason = payload?.cancellationReason ? ` Reason: ${payload.cancellationReason}` : '';
    const message = `Session "${payload.topic || 'Coaching session'}" was cancelled.${reason}`;
    if (payload?.menteeId) {
      await this.safeCreate(
        payload.menteeId,
        'Session cancelled',
        message,
        NotificationType.WARNING,
        { event: 'session.cancelled', sessionId: payload.sessionId },
      );
    }
    if (payload?.coachId) {
      await this.safeCreate(
        payload.coachId,
        'Session cancelled',
        message,
        NotificationType.WARNING,
        { event: 'session.cancelled', sessionId: payload.sessionId },
      );
    }
  }

  @OnEvent('session.completed')
  async onSessionCompleted(payload: SessionEventPayload) {
    const message = `Session "${payload.topic || 'Coaching session'}" was marked completed.`;
    if (payload?.menteeId) {
      await this.safeCreate(
        payload.menteeId,
        'Session completed',
        `${message} You can now submit feedback.`,
        NotificationType.SUCCESS,
        { event: 'session.completed', sessionId: payload.sessionId, completedAt: payload.completedAt },
      );
    }
    if (payload?.coachId) {
      await this.safeCreate(
        payload.coachId,
        'Session completed',
        message,
        NotificationType.SUCCESS,
        { event: 'session.completed', sessionId: payload.sessionId, completedAt: payload.completedAt },
      );
    }
  }

  @OnEvent('session.feedback.submitted')
  async onSessionFeedbackSubmitted(payload: SessionEventPayload) {
    if (!payload?.coachId) return;
    await this.safeCreate(
      payload.coachId,
      'New session feedback',
      `You received ${payload.rating || 0}/5 feedback on "${payload.topic || 'a session'}".`,
      NotificationType.INFO,
      { event: 'session.feedback.submitted', sessionId: payload.sessionId, rating: payload.rating },
    );
  }

  @OnEvent('event.registered')
  async onEventRegistered(payload: EventRegistrationPayload) {
    if (payload?.userId) {
      await this.safeCreate(
        payload.userId,
        'Event registration confirmed',
        `You are registered for "${payload.title || 'an event'}".`,
        NotificationType.SUCCESS,
        { event: 'event.registered', eventId: payload.eventId },
      );
    }
    if (payload?.organizerId && payload.organizerId !== payload.userId) {
      await this.safeCreate(
        payload.organizerId,
        'New event registration',
        `A participant registered for "${payload.title || 'your event'}".`,
        NotificationType.INFO,
        { event: 'event.registered', eventId: payload.eventId, userId: payload.userId },
      );
    }
  }

  @OnEvent('event.registration.cancelled')
  async onEventRegistrationCancelled(payload: EventRegistrationPayload) {
    if (payload?.userId) {
      await this.safeCreate(
        payload.userId,
        'Event registration cancelled',
        `Your registration for "${payload.title || 'an event'}" was cancelled.`,
        NotificationType.WARNING,
        { event: 'event.registration.cancelled', eventId: payload.eventId },
      );
    }
    if (payload?.organizerId && payload.organizerId !== payload.userId) {
      await this.safeCreate(
        payload.organizerId,
        'Event registration cancelled',
        `A participant cancelled registration for "${payload.title || 'your event'}".`,
        NotificationType.WARNING,
        { event: 'event.registration.cancelled', eventId: payload.eventId, userId: payload.userId },
      );
    }
  }

  @OnEvent('payment.initiated')
  async onPaymentInitiated(payload: PaymentPayload) {
    if (!payload?.userId) return;
    await this.safeCreate(
      payload.userId,
      'Payment initiated',
      `Payment ${payload.reference || ''} was initiated for ${payload.currency || ''} ${payload.amount ?? 0}.`,
      NotificationType.INFO,
      {
        event: 'payment.initiated',
        reference: payload.reference,
        transactionId: payload.transactionId,
        type: payload.type,
      },
    );
  }

  @OnEvent('payment.status.changed')
  async onPaymentStatusChanged(payload: PaymentPayload) {
    if (!payload?.userId) return;
    const status = (payload.status || 'pending').toLowerCase();
    const type =
      status === 'success'
        ? NotificationType.SUCCESS
        : status === 'failed' || status === 'cancelled'
          ? NotificationType.ERROR
          : NotificationType.INFO;

    const context =
      payload.type === 'event_registration'
        ? 'event access payment'
        : payload.type === 'product'
          ? 'order payment'
          : 'subscription payment';

    await this.safeCreate(
      payload.userId,
      'Payment update',
      `Your ${context} is now ${status}. Reference: ${payload.reference || 'n/a'}.`,
      type,
      {
        event: 'payment.status.changed',
        reference: payload.reference,
        transactionId: payload.transactionId,
        paymentStatus: status,
        paymentType: payload.type,
      },
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
