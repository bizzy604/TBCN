import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let eventEmitter: EventEmitter2;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_ACCESS_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw BadRequestException if terms not accepted', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: false,
      };

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('should emit USER_REGISTERED event on successful registration', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
      };

      const result = await service.register(dto);

      expect(result.message).toContain('Registration successful');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'auth.user.registered',
        expect.objectContaining({
          email: dto.email,
          firstName: dto.firstName,
        }),
      );
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.tokenType).toBe('Bearer');
    });

    it('should emit USER_LOGGED_IN event on successful login', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.login(dto);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'auth.user.loggedIn',
        expect.objectContaining({
          email: dto.email,
        }),
      );
    });
  });

  describe('refreshToken', () => {
    it('should return new tokens for valid refresh token', async () => {
      const dto = { refreshToken: 'valid-refresh-token' };

      mockJwtService.verifyAsync.mockResolvedValueOnce({
        sub: 'user-id',
        email: 'test@example.com',
        role: 'member',
      });

      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refreshToken(dto);

      expect(result.accessToken).toBe('new-access-token');
      expect(result.refreshToken).toBe('new-refresh-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const dto = { refreshToken: 'invalid-token' };

      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(service.refreshToken(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should return success message (prevents email enumeration)', async () => {
      const dto = { email: 'test@example.com' };

      const result = await service.forgotPassword(dto);

      expect(result.message).toContain('If an account with that email exists');
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if passwords do not match', async () => {
      const dto = {
        token: 'reset-token',
        password: 'NewPassword123',
        confirmPassword: 'DifferentPassword123',
      };

      await expect(service.resetPassword(dto)).rejects.toThrow(BadRequestException);
    });

    it('should return success message for matching passwords', async () => {
      const dto = {
        token: 'reset-token',
        password: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };

      const result = await service.resetPassword(dto);

      expect(result.message).toContain('Password has been reset');
    });
  });

  describe('changePassword', () => {
    it('should throw BadRequestException if passwords do not match', async () => {
      const dto = {
        currentPassword: 'CurrentPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'DifferentPassword123',
      };

      await expect(service.changePassword('user-id', dto)).rejects.toThrow(BadRequestException);
    });

    it('should return success message for valid password change', async () => {
      const dto = {
        currentPassword: 'CurrentPassword123',
        newPassword: 'NewPassword123',
        confirmPassword: 'NewPassword123',
      };

      const result = await service.changePassword('user-id', dto);

      expect(result.message).toContain('Password has been changed');
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await service.logout('user-id');

      expect(result.message).toContain('Logged out successfully');
    });
  });
});
