import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import {
  getEmailVerificationTemplate,
  getPasswordResetTemplate,
  getWelcomeTemplate,
  getPasswordChangedTemplate,
} from './templates';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly frontendUrl: string;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.fromEmail = this.configService.get<string>(
      'SMTP_FROM_EMAIL',
      'noreply@brandcoachnetwork.com',
    );
    this.fromName = this.configService.get<string>(
      'SMTP_FROM_NAME',
      'The Brand Coach Network',
    );
    this.frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );

    const host = this.configService.get<string>('SMTP_HOST');
    this.isEnabled = this.isUsableSmtpHost(host);
  }

  async onModuleInit() {
    await this.createTransporter();
  }

  private async createTransporter(): Promise<void> {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure = this.configService.get<boolean>('SMTP_SECURE', false);

    if (!this.isEnabled || !host) {
      this.logger.warn(
        'SMTP host is not configured for real delivery. Emails will be logged to console.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    try {
      await this.transporter.verify();
      this.logger.log(`Email service connected to SMTP server: ${host}:${port}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to SMTP server: ${message}`);
      this.logger.warn('Emails will be logged to console as fallback.');
      this.transporter = null;
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const { to, subject, html, text } = options;

    if (!this.transporter) {
      this.logger.log(`[EMAIL PREVIEW] To: ${to} | Subject: ${subject}`);
      this.logger.debug(`[EMAIL BODY]\n${text || html}`);
      return true;
    }

    try {
      const result = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      });

      this.logger.log(`Email sent to ${to} - messageId: ${result.messageId}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${to}: ${message}`);
      return false;
    }
  }

  async sendVerificationEmail(
    to: string,
    firstName: string,
    token: string,
  ): Promise<boolean> {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    return this.sendEmail({
      to,
      subject: 'Verify your email - Brand Coach Network',
      html: getEmailVerificationTemplate({
        firstName,
        verificationUrl,
        frontendUrl: this.frontendUrl,
      }),
    });
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    token: string,
  ): Promise<boolean> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    return this.sendEmail({
      to,
      subject: 'Reset your password - Brand Coach Network',
      html: getPasswordResetTemplate({
        firstName,
        resetUrl,
        frontendUrl: this.frontendUrl,
      }),
    });
  }

  async sendWelcomeEmail(
    to: string,
    firstName: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to Brand Coach Network!',
      html: getWelcomeTemplate({
        firstName,
        loginUrl: `${this.frontendUrl}/login`,
        frontendUrl: this.frontendUrl,
      }),
    });
  }

  async sendPasswordChangedEmail(
    to: string,
    firstName: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Your password has been changed - Brand Coach Network',
      html: getPasswordChangedTemplate({
        firstName,
        supportEmail: this.fromEmail,
        frontendUrl: this.frontendUrl,
      }),
    });
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  private isUsableSmtpHost(host?: string): boolean {
    if (!host) {
      return false;
    }

    const normalized = host.trim().toLowerCase();
    if (!normalized) {
      return false;
    }

    const placeholderFragments = ['placeholder', 'example', 'changeme', '<smtp'];
    return !placeholderFragments.some((fragment) =>
      normalized.includes(fragment),
    );
  }
}

