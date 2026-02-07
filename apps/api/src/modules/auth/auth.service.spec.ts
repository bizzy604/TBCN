import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { AuthService, AUTH_EVENTS } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;
  let eventEmitter: EventEmitter2;

  // ---------- mocks ----------

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

  const mockUsersService = {
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    createWithPassword: jest.fn(),
    setEmailVerificationToken: jest.fn(),
    findById: jest.fn(),
    findOrCreateFromSocial: jest.fn(),
    findByPasswordResetToken: jest.fn(),
    findByEmailVerificationToken: jest.fn(),
    setPasswordResetToken: jest.fn(),
    updatePassword: jest.fn(),
    verifyEmail: jest.fn(),
  };

  // ---------- helpers ----------

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'member',
    password: '$2b$12$hashedpassword',
    emailVerified: false,
    passwordResetToken: null,
    passwordResetExpires: null,
  };

  const setupTokenMocks = () => {
    mockJwtService.signAsync
      .mockResolvedValueOnce('mock-access-token')
      .mockResolvedValueOnce('mock-refresh-token');
  };

  // ---------- setup ----------

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ==================================================
  // register
  // ==================================================
  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      acceptTerms: true,
    };

    it('should throw BadRequestException if terms not accepted', async () => {
      await expect(
        service.register({ ...registerDto, acceptTerms: false }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should create user and emit USER_REGISTERED event', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      mockUsersService.createWithPassword.mockResolvedValueOnce(mockUser);
      mockUsersService.setEmailVerificationToken.mockResolvedValueOnce(undefined);

      const result = await service.register(registerDto);

      expect(result.message).toContain('Registration successful');
      expect(mockUsersService.createWithPassword).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        }),
      );
      expect(mockUsersService.setEmailVerificationToken).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        AUTH_EVENTS.USER_REGISTERED,
        expect.objectContaining({
          userId: mockUser.id,
          email: registerDto.email,
          firstName: registerDto.firstName,
          verificationToken: expect.any(String),
        }),
      );
    });
  });

  // ==================================================
  // login
  // ==================================================
  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'Password123!' };

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValueOnce(mockUser);

      await expect(
        service.login({ ...loginDto, password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens, user, redirectTo and emit event on valid login', async () => {
      // bcrypt hash of 'Password123!' with 12 rounds
      const bcrypt = require('bcrypt');
      const hashed = await bcrypt.hash('Password123!', 12);
      mockUsersService.findByEmailWithPassword.mockResolvedValueOnce({
        ...mockUser,
        password: hashed,
      });
      setupTokenMocks();

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.tokenType).toBe('Bearer');
      expect(result.expiresIn).toBe(900);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.role).toBe(mockUser.role);
      expect(result.redirectTo).toBe('/dashboard');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        AUTH_EVENTS.USER_LOGGED_IN,
        expect.objectContaining({ email: mockUser.email }),
      );
    });
  });

  // ==================================================
  // refreshToken
  // ==================================================
  describe('refreshToken', () => {
    it('should return new tokens for valid refresh token', async () => {
      mockJwtService.verifyAsync.mockResolvedValueOnce({
        sub: 'user-uuid-1',
        email: 'test@example.com',
        role: 'member',
      });
      setupTokenMocks();

      const result = await service.refreshToken({ refreshToken: 'valid-token' });

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('bad'));

      await expect(
        service.refreshToken({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ==================================================
  // forgotPassword
  // ==================================================
  describe('forgotPassword', () => {
    it('should return generic success message even if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);

      const result = await service.forgotPassword({ email: 'nobody@example.com' });

      expect(result.message).toContain('If an account with that email exists');
      expect(mockUsersService.setPasswordResetToken).not.toHaveBeenCalled();
    });

    it('should set reset token and emit event when user found', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockUsersService.setPasswordResetToken.mockResolvedValueOnce(undefined);

      const result = await service.forgotPassword({ email: mockUser.email });

      expect(result.message).toContain('If an account with that email exists');
      expect(mockUsersService.setPasswordResetToken).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        AUTH_EVENTS.PASSWORD_RESET_REQUESTED,
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          resetToken: expect.any(String),
        }),
      );
    });
  });

  // ==================================================
  // resetPassword
  // ==================================================
  describe('resetPassword', () => {
    const resetDto = {
      token: 'valid-reset-token',
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    it('should throw BadRequestException if passwords do not match', async () => {
      await expect(
        service.resetPassword({ ...resetDto, confirmPassword: 'Mismatch' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid/missing token', async () => {
      mockUsersService.findByPasswordResetToken.mockResolvedValueOnce(null);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      mockUsersService.findByPasswordResetToken.mockResolvedValueOnce({
        ...mockUser,
        passwordResetExpires: new Date(Date.now() - 3600000), // 1hr ago
      });

      await expect(service.resetPassword(resetDto)).rejects.toThrow(BadRequestException);
    });

    it('should hash new password and update user', async () => {
      mockUsersService.findByPasswordResetToken.mockResolvedValueOnce({
        ...mockUser,
        passwordResetExpires: new Date(Date.now() + 3600000), // 1hr from now
      });
      mockUsersService.updatePassword.mockResolvedValueOnce(undefined);

      const result = await service.resetPassword(resetDto);

      expect(result.message).toContain('Password has been reset');
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String), // hashed password
      );
    });
  });

  // ==================================================
  // changePassword
  // ==================================================
  describe('changePassword', () => {
    const changeDto = {
      currentPassword: 'Password123!',
      newPassword: 'NewPassword456!',
      confirmPassword: 'NewPassword456!',
    };

    it('should throw BadRequestException if new passwords do not match', async () => {
      await expect(
        service.changePassword('user-uuid-1', {
          ...changeDto,
          confirmPassword: 'Mismatch',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for social-only accounts', async () => {
      mockUsersService.findById.mockResolvedValueOnce(mockUser);
      mockUsersService.findByEmailWithPassword.mockResolvedValueOnce({
        ...mockUser,
        password: null,
      });

      await expect(
        service.changePassword('user-uuid-1', changeDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException for wrong current password', async () => {
      mockUsersService.findById.mockResolvedValueOnce(mockUser);
      mockUsersService.findByEmailWithPassword.mockResolvedValueOnce(mockUser);

      await expect(
        service.changePassword('user-uuid-1', {
          ...changeDto,
          currentPassword: 'WrongCurrent',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update password and emit event on success', async () => {
      const bcrypt = require('bcrypt');
      const hashed = await bcrypt.hash('Password123!', 12);
      mockUsersService.findById.mockResolvedValueOnce(mockUser);
      mockUsersService.findByEmailWithPassword.mockResolvedValueOnce({
        ...mockUser,
        password: hashed,
      });
      mockUsersService.updatePassword.mockResolvedValueOnce(undefined);

      const result = await service.changePassword('user-uuid-1', changeDto);

      expect(result.message).toContain('Password has been changed');
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        'user-uuid-1',
        expect.any(String),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        AUTH_EVENTS.PASSWORD_CHANGED,
        expect.objectContaining({
          userId: 'user-uuid-1',
          email: mockUser.email,
        }),
      );
    });
  });

  // ==================================================
  // verifyEmail
  // ==================================================
  describe('verifyEmail', () => {
    it('should throw BadRequestException for invalid token', async () => {
      mockUsersService.findByEmailVerificationToken.mockResolvedValueOnce(null);

      await expect(
        service.verifyEmail({ token: 'bad-token' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call verifyEmail on users service for valid token', async () => {
      mockUsersService.findByEmailVerificationToken.mockResolvedValueOnce(mockUser);
      mockUsersService.verifyEmail.mockResolvedValueOnce(undefined);

      const result = await service.verifyEmail({ token: 'valid-token' });

      expect(result.message).toContain('Email verified successfully');
      expect(mockUsersService.verifyEmail).toHaveBeenCalledWith(mockUser.id);
    });
  });

  // ==================================================
  // resendVerificationEmail
  // ==================================================
  describe('resendVerificationEmail', () => {
    it('should return generic message even if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);

      const result = await service.resendVerificationEmail('nobody@example.com');

      expect(result.message).toContain('not yet verified');
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should not resend if email already verified', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce({
        ...mockUser,
        emailVerified: true,
      });

      const result = await service.resendVerificationEmail(mockUser.email);

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should generate new token and emit event for unverified user', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      mockUsersService.setEmailVerificationToken.mockResolvedValueOnce(undefined);

      const result = await service.resendVerificationEmail(mockUser.email);

      expect(mockUsersService.setEmailVerificationToken).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        AUTH_EVENTS.USER_REGISTERED,
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          verificationToken: expect.any(String),
        }),
      );
    });
  });

  // ==================================================
  // socialLogin
  // ==================================================
  describe('socialLogin', () => {
    const socialProfile = {
      provider: 'google',
      providerId: 'google-123',
      email: 'social@example.com',
      firstName: 'Social',
      lastName: 'User',
      avatarUrl: 'https://photo.url/pic.jpg',
    };

    it('should throw BadRequestException if no email on profile', async () => {
      await expect(
        service.socialLogin({ ...socialProfile, email: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should find or create user and return tokens with redirect', async () => {
      const socialUser = {
        id: 'social-user-uuid',
        email: socialProfile.email,
        firstName: 'Social',
        lastName: 'User',
        role: 'member',
      };
      mockUsersService.findOrCreateFromSocial.mockResolvedValueOnce(socialUser);
      setupTokenMocks();

      const result = await service.socialLogin(socialProfile);

      expect(mockUsersService.findOrCreateFromSocial).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          providerId: 'google-123',
          email: socialProfile.email,
        }),
      );
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.tokenType).toBe('Bearer');
      expect(result.user).toBeDefined();
      expect(result.user.role).toBe('member');
      expect(result.redirectTo).toBe('/dashboard');
    });

    it('should emit USER_SOCIAL_LOGIN event', async () => {
      const socialUser = {
        id: 'social-user-uuid',
        email: socialProfile.email,
        firstName: 'Social',
        lastName: 'User',
        role: 'member',
      };
      mockUsersService.findOrCreateFromSocial.mockResolvedValueOnce(socialUser);
      setupTokenMocks();

      await service.socialLogin(socialProfile);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        AUTH_EVENTS.USER_SOCIAL_LOGIN,
        expect.objectContaining({
          userId: socialUser.id,
          email: socialUser.email,
          provider: 'google',
        }),
      );
    });

    it('should work for facebook provider', async () => {
      const fbProfile = { ...socialProfile, provider: 'facebook', providerId: 'fb-456' };
      mockUsersService.findOrCreateFromSocial.mockResolvedValueOnce({
        id: 'fb-user-uuid',
        email: fbProfile.email,
        firstName: 'Social',
        lastName: 'User',
        role: 'member',
      });
      setupTokenMocks();

      const result = await service.socialLogin(fbProfile);

      expect(result.accessToken).toBeDefined();
      expect(mockUsersService.findOrCreateFromSocial).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'facebook' }),
      );
    });

    it('should work for linkedin provider', async () => {
      const liProfile = { ...socialProfile, provider: 'linkedin', providerId: 'li-789' };
      mockUsersService.findOrCreateFromSocial.mockResolvedValueOnce({
        id: 'li-user-uuid',
        email: liProfile.email,
        firstName: 'Social',
        lastName: 'User',
        role: 'member',
      });
      setupTokenMocks();

      const result = await service.socialLogin(liProfile);

      expect(result.accessToken).toBeDefined();
      expect(mockUsersService.findOrCreateFromSocial).toHaveBeenCalledWith(
        expect.objectContaining({ provider: 'linkedin' }),
      );
    });
  });

  // ==================================================
  // logout
  // ==================================================
  describe('logout', () => {
    it('should return success message', async () => {
      const result = await service.logout('user-uuid-1');
      expect(result.message).toContain('Logged out successfully');
    });
  });
});
