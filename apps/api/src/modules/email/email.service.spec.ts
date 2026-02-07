import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

// Mock nodemailer
const mockSendMail = jest.fn();
const mockVerify = jest.fn();
const mockCreateTransport = jest.fn().mockReturnValue({
  sendMail: mockSendMail,
  verify: mockVerify,
});

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockImplementation((...args: unknown[]) => mockCreateTransport(...args)),
}));

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  // ---------- Without SMTP (console fallback) ----------

  describe('without SMTP configured', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => {
                const config: Record<string, any> = {
                  SMTP_FROM_EMAIL: 'noreply@brandcoachnetwork.com',
                  SMTP_FROM_NAME: 'The Brand Coach Network',
                  FRONTEND_URL: 'http://localhost:3000',
                  // SMTP_HOST intentionally missing → emails go to console
                  SMTP_PORT: 587,
                  SMTP_SECURE: false,
                };
                return config[key] ?? defaultValue;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
      await service.onModuleInit();

      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should not create transporter when SMTP_HOST not set', () => {
      // After onModuleInit, transporter should be null
      expect(mockCreateTransport).not.toHaveBeenCalled();
    });

    it('should log to console instead of sending when no transporter', async () => {
      const logSpy = jest.spyOn((service as any).logger, 'log');

      const result = await service.sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<h1>Hello</h1>',
      });

      expect(result).toBe(true);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[EMAIL PREVIEW]'),
      );
    });

    it('sendVerificationEmail should succeed via console fallback', async () => {
      const result = await service.sendVerificationEmail(
        'user@example.com',
        'John',
        'token-abc-123',
      );
      expect(result).toBe(true);
    });

    it('sendPasswordResetEmail should succeed via console fallback', async () => {
      const result = await service.sendPasswordResetEmail(
        'user@example.com',
        'John',
        'reset-token-456',
      );
      expect(result).toBe(true);
    });

    it('sendWelcomeEmail should succeed via console fallback', async () => {
      const result = await service.sendWelcomeEmail(
        'user@example.com',
        'John',
      );
      expect(result).toBe(true);
    });

    it('sendPasswordChangedEmail should succeed via console fallback', async () => {
      const result = await service.sendPasswordChangedEmail(
        'user@example.com',
        'John',
      );
      expect(result).toBe(true);
    });
  });

  // ---------- With SMTP configured ----------

  describe('with SMTP configured', () => {
    beforeEach(async () => {
      mockCreateTransport.mockClear();
      mockSendMail.mockClear();
      mockVerify.mockResolvedValue(true);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => {
                const config: Record<string, any> = {
                  SMTP_HOST: 'smtp.mailtrap.io',
                  SMTP_PORT: 587,
                  SMTP_USER: 'testuser',
                  SMTP_PASS: 'testpass',
                  SMTP_SECURE: false,
                  SMTP_FROM_EMAIL: 'noreply@brandcoachnetwork.com',
                  SMTP_FROM_NAME: 'The Brand Coach Network',
                  FRONTEND_URL: 'http://localhost:3000',
                };
                return config[key] ?? defaultValue;
              }),
            },
          },
        ],
      }).compile();

      service = module.get<EmailService>(EmailService);
      await service.onModuleInit();
    });

    it('should create transporter when SMTP_HOST is set', () => {
      expect(mockCreateTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.mailtrap.io',
          port: 587,
          secure: false,
          auth: { user: 'testuser', pass: 'testpass' },
        }),
      );
    });

    it('should verify SMTP connection on init', () => {
      expect(mockVerify).toHaveBeenCalled();
    });

    it('sendEmail should call transporter.sendMail', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: '<msg-001>' });

      const result = await service.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<h1>Hello</h1>',
      });

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Test',
          html: '<h1>Hello</h1>',
        }),
      );
    });

    it('sendEmail should return false when sendMail throws', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('SMTP error'));

      const result = await service.sendEmail({
        to: 'user@example.com',
        subject: 'Fail',
        html: '<p>Oops</p>',
      });

      expect(result).toBe(false);
    });

    it('sendVerificationEmail should send with correct subject and URL', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: '<msg-002>' });

      const result = await service.sendVerificationEmail(
        'user@example.com',
        'John',
        'verify-token-xyz',
      );

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Verify your email'),
        }),
      );
      // HTML should contain the verification URL
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('verify-token-xyz');
    });

    it('sendPasswordResetEmail should send with reset URL', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: '<msg-003>' });

      const result = await service.sendPasswordResetEmail(
        'user@example.com',
        'Jane',
        'reset-token-abc',
      );

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Reset your password'),
        }),
      );
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('reset-token-abc');
    });

    it('sendWelcomeEmail should send with welcome subject', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: '<msg-004>' });

      const result = await service.sendWelcomeEmail('user@example.com', 'John');

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('Welcome'),
        }),
      );
    });

    it('sendPasswordChangedEmail should send confirmation', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: '<msg-005>' });

      const result = await service.sendPasswordChangedEmail(
        'user@example.com',
        'John',
      );

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('password has been changed'),
        }),
      );
    });
  });

  // ---------- SMTP connection failure ----------

  describe('SMTP connection failure on init', () => {
    it('should fall back to console logging when verify fails', async () => {
      mockCreateTransport.mockClear();
      mockVerify.mockRejectedValueOnce(new Error('Connection refused'));

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string, defaultValue?: any) => {
                const config: Record<string, any> = {
                  SMTP_HOST: 'bad.smtp.server',
                  SMTP_PORT: 587,
                  SMTP_FROM_EMAIL: 'noreply@brandcoachnetwork.com',
                  SMTP_FROM_NAME: 'The Brand Coach Network',
                  FRONTEND_URL: 'http://localhost:3000',
                };
                return config[key] ?? defaultValue;
              }),
            },
          },
        ],
      }).compile();

      const failService = module.get<EmailService>(EmailService);
      await failService.onModuleInit();

      // Transporter set to null after verify fails, so email falls back to console
      const result = await failService.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Hello</p>',
      });

      expect(result).toBe(true);
    });
  });
});
