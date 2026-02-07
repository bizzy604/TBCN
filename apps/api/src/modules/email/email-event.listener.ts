import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './email.service';
import { AUTH_EVENTS } from '../auth/auth.service';

/**
 * Listens for domain events and sends corresponding emails
 */
@Injectable()
export class EmailEventListener {
  private readonly logger = new Logger(EmailEventListener.name);

  constructor(private readonly emailService: EmailService) {}

  /**
   * When a user registers → send email verification
   */
  @OnEvent(AUTH_EVENTS.USER_REGISTERED)
  async handleUserRegistered(payload: {
    userId: string;
    email: string;
    firstName: string;
    verificationToken: string;
  }): Promise<void> {
    this.logger.log(`Sending verification email to ${payload.email}`);

    const sent = await this.emailService.sendVerificationEmail(
      payload.email,
      payload.firstName,
      payload.verificationToken,
    );

    if (sent) {
      this.logger.log(`Verification email sent to ${payload.email}`);
    } else {
      this.logger.error(`Failed to send verification email to ${payload.email}`);
    }
  }

  /**
   * When a password reset is requested → send reset email
   */
  @OnEvent(AUTH_EVENTS.PASSWORD_RESET_REQUESTED)
  async handlePasswordResetRequested(payload: {
    userId: string;
    email: string;
    firstName: string;
    resetToken: string;
  }): Promise<void> {
    this.logger.log(`Sending password reset email to ${payload.email}`);

    const sent = await this.emailService.sendPasswordResetEmail(
      payload.email,
      payload.firstName,
      payload.resetToken,
    );

    if (sent) {
      this.logger.log(`Password reset email sent to ${payload.email}`);
    } else {
      this.logger.error(`Failed to send password reset email to ${payload.email}`);
    }
  }

  /**
   * When a password is changed → send confirmation email
   */
  @OnEvent(AUTH_EVENTS.PASSWORD_CHANGED)
  async handlePasswordChanged(payload: {
    userId: string;
    email: string;
    firstName: string;
  }): Promise<void> {
    this.logger.log(`Sending password changed confirmation to ${payload.email}`);

    await this.emailService.sendPasswordChangedEmail(
      payload.email,
      payload.firstName,
    );
  }
}
