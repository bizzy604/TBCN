import { Test, TestingModule } from '@nestjs/testing';
import { EmailEventListener } from './email-event.listener';
import { EmailService } from './email.service';

describe('EmailEventListener', () => {
  let listener: EmailEventListener;
  let emailService: EmailService;

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    sendPasswordChangedEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailEventListener,
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    listener = module.get<EmailEventListener>(EmailEventListener);
    emailService = module.get<EmailService>(EmailService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  // ==================================================
  // USER_REGISTERED → verification email
  // ==================================================
  describe('handleUserRegistered', () => {
    const payload = {
      userId: 'user-uuid-1',
      email: 'john@example.com',
      firstName: 'John',
      verificationToken: 'verify-token-abc',
    };

    it('should call sendVerificationEmail with correct args', async () => {
      mockEmailService.sendVerificationEmail.mockResolvedValueOnce(true);

      await listener.handleUserRegistered(payload);

      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalledWith(
        payload.email,
        payload.firstName,
        payload.verificationToken,
      );
    });

    it('should log success when email sent', async () => {
      mockEmailService.sendVerificationEmail.mockResolvedValueOnce(true);
      const logSpy = jest.spyOn((listener as any).logger, 'log');

      await listener.handleUserRegistered(payload);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Verification email sent to ${payload.email}`),
      );
    });

    it('should log error when email fails', async () => {
      mockEmailService.sendVerificationEmail.mockResolvedValueOnce(false);
      const errorSpy = jest.spyOn((listener as any).logger, 'error');

      await listener.handleUserRegistered(payload);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Failed to send verification email to ${payload.email}`),
      );
    });
  });

  // ==================================================
  // PASSWORD_RESET_REQUESTED → reset email
  // ==================================================
  describe('handlePasswordResetRequested', () => {
    const payload = {
      userId: 'user-uuid-2',
      email: 'jane@example.com',
      firstName: 'Jane',
      resetToken: 'reset-token-xyz',
    };

    it('should call sendPasswordResetEmail with correct args', async () => {
      mockEmailService.sendPasswordResetEmail.mockResolvedValueOnce(true);

      await listener.handlePasswordResetRequested(payload);

      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        payload.email,
        payload.firstName,
        payload.resetToken,
      );
    });

    it('should log success when email sent', async () => {
      mockEmailService.sendPasswordResetEmail.mockResolvedValueOnce(true);
      const logSpy = jest.spyOn((listener as any).logger, 'log');

      await listener.handlePasswordResetRequested(payload);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Password reset email sent to ${payload.email}`),
      );
    });

    it('should log error when email fails', async () => {
      mockEmailService.sendPasswordResetEmail.mockResolvedValueOnce(false);
      const errorSpy = jest.spyOn((listener as any).logger, 'error');

      await listener.handlePasswordResetRequested(payload);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Failed to send password reset email to ${payload.email}`),
      );
    });
  });

  // ==================================================
  // PASSWORD_CHANGED → confirmation email
  // ==================================================
  describe('handlePasswordChanged', () => {
    const payload = {
      userId: 'user-uuid-3',
      email: 'bob@example.com',
      firstName: 'Bob',
    };

    it('should call sendPasswordChangedEmail with correct args', async () => {
      mockEmailService.sendPasswordChangedEmail.mockResolvedValueOnce(true);

      await listener.handlePasswordChanged(payload);

      expect(mockEmailService.sendPasswordChangedEmail).toHaveBeenCalledWith(
        payload.email,
        payload.firstName,
      );
    });
  });
});
