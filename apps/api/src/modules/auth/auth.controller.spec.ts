import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
    logout: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationEmail: jest.fn(),
    socialLogin: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        FRONTEND_URL: 'http://localhost:3000',
      };
      return config[key] || defaultValue;
    }),
  };

  const mockUsersService = {
    findByIdWithProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        Reflector,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ==================================================
  // Registration
  // ==================================================
  describe('POST /auth/register', () => {
    it('should call authService.register with correct params', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
      };

      mockAuthService.register.mockResolvedValueOnce({
        message: 'Registration successful',
      });

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result.message).toContain('Registration successful');
    });
  });

  // ==================================================
  // Login
  // ==================================================
  describe('POST /auth/login', () => {
    it('should return tokens on successful login', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer' as const,
      };

      mockAuthService.login.mockResolvedValueOnce(mockTokens);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTokens);
    });
  });

  // ==================================================
  // Refresh Token
  // ==================================================
  describe('POST /auth/refresh', () => {
    it('should return new tokens for valid refresh token', async () => {
      const dto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 900,
        tokenType: 'Bearer' as const,
      };

      mockAuthService.refreshToken.mockResolvedValueOnce(mockTokens);

      const result = await controller.refreshToken(dto);

      expect(authService.refreshToken).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTokens);
    });
  });

  // ==================================================
  // Forgot Password
  // ==================================================
  describe('POST /auth/forgot-password', () => {
    it('should call authService.forgotPassword', async () => {
      const dto = { email: 'test@example.com' };

      mockAuthService.forgotPassword.mockResolvedValueOnce({
        message: 'Email sent',
      });

      const result = await controller.forgotPassword(dto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
    });
  });

  // ==================================================
  // Reset Password
  // ==================================================
  describe('POST /auth/reset-password', () => {
    it('should call authService.resetPassword', async () => {
      const dto = {
        token: 'reset-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      mockAuthService.resetPassword.mockResolvedValueOnce({
        message: 'Password has been reset',
      });

      const result = await controller.resetPassword(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
      expect(result.message).toContain('Password has been reset');
    });
  });

  // ==================================================
  // Verify Email
  // ==================================================
  describe('POST /auth/verify-email', () => {
    it('should call authService.verifyEmail', async () => {
      const dto = { token: 'verification-token-abc' };

      mockAuthService.verifyEmail.mockResolvedValueOnce({
        message: 'Email verified successfully',
      });

      const result = await controller.verifyEmail(dto);

      expect(authService.verifyEmail).toHaveBeenCalledWith(dto);
      expect(result.message).toContain('Email verified');
    });
  });

  // ==================================================
  // Resend Verification
  // ==================================================
  describe('POST /auth/resend-verification', () => {
    it('should call authService.resendVerificationEmail', async () => {
      const dto = { email: 'test@example.com' };

      mockAuthService.resendVerificationEmail.mockResolvedValueOnce({
        message: 'Verification email resent',
      });

      const result = await controller.resendVerification(dto);

      expect(authService.resendVerificationEmail).toHaveBeenCalledWith(dto.email);
    });
  });

  // ==================================================
  // Logout
  // ==================================================
  describe('POST /auth/logout', () => {
    it('should call authService.logout with user ID', async () => {
      mockAuthService.logout.mockResolvedValueOnce({
        message: 'Logged out',
      });

      const result = await controller.logout('user-id');

      expect(authService.logout).toHaveBeenCalledWith('user-id');
    });
  });

  // ==================================================
  // Change Password
  // ==================================================
  describe('POST /auth/change-password', () => {
    it('should call authService.changePassword', async () => {
      const dto = {
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      };

      mockAuthService.changePassword.mockResolvedValueOnce({
        message: 'Password changed',
      });

      const result = await controller.changePassword('user-id', dto);

      expect(authService.changePassword).toHaveBeenCalledWith('user-id', dto);
    });
  });

  // ==================================================
  // Get Current User
  // ==================================================
  describe('GET /auth/me', () => {
    it('should return full user with profile from UsersService', async () => {
      const mockFullUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'member',
        status: 'active',
        emailVerified: true,
        profile: { bio: 'Test bio' },
      };

      mockUsersService.findByIdWithProfile.mockResolvedValueOnce(mockFullUser);

      const result = await controller.me('user-id');

      expect(mockUsersService.findByIdWithProfile).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockFullUser);
      expect(result.profile).toBeDefined();
    });
  });

  // ==================================================
  // OAuth Callbacks (unit-level — tests handleOAuthCallback)
  // ==================================================
  describe('OAuth callbacks', () => {
    const mockRes = {
      redirect: jest.fn(),
    };

    describe('GET /auth/google/callback', () => {
      it('should redirect to frontend with tokens on success', async () => {
        const mockReq = {
          user: {
            provider: 'google',
            providerId: 'g-123',
            email: 'google@example.com',
            firstName: 'Google',
            lastName: 'User',
            avatarUrl: 'https://photo.url',
          },
        };

        mockAuthService.socialLogin.mockResolvedValueOnce({
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          expiresIn: 900,
          tokenType: 'Bearer',
          redirectTo: '/dashboard',
        });

        await controller.googleCallback(mockReq as any, mockRes as any);

        expect(mockAuthService.socialLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: 'google',
            email: 'google@example.com',
          }),
        );
        expect(mockRes.redirect).toHaveBeenCalledWith(
          expect.stringContaining('accessToken=access-token'),
        );
      });

      it('should redirect with error if no user data', async () => {
        const mockReq = { user: null };

        await controller.googleCallback(mockReq as any, mockRes as any);

        expect(mockRes.redirect).toHaveBeenCalledWith(
          expect.stringContaining('error=no_email'),
        );
      });
    });

    describe('GET /auth/facebook/callback', () => {
      it('should redirect to frontend with tokens on success', async () => {
        const mockReq = {
          user: {
            provider: 'facebook',
            providerId: 'fb-456',
            email: 'fb@example.com',
            firstName: 'FB',
            lastName: 'User',
            avatarUrl: null,
          },
        };

        mockAuthService.socialLogin.mockResolvedValueOnce({
          accessToken: 'fb-access-token',
          refreshToken: 'fb-refresh-token',
          expiresIn: 900,
          tokenType: 'Bearer',
          redirectTo: '/dashboard',
        });

        await controller.facebookCallback(mockReq as any, mockRes as any);

        expect(mockAuthService.socialLogin).toHaveBeenCalledWith(
          expect.objectContaining({ provider: 'facebook' }),
        );
        expect(mockRes.redirect).toHaveBeenCalledWith(
          expect.stringContaining('provider=facebook'),
        );
      });
    });

    describe('GET /auth/linkedin/callback', () => {
      it('should redirect to frontend with tokens on success', async () => {
        const mockReq = {
          user: {
            provider: 'linkedin',
            providerId: 'li-789',
            email: 'li@example.com',
            firstName: 'LinkedIn',
            lastName: 'User',
            avatarUrl: null,
          },
        };

        mockAuthService.socialLogin.mockResolvedValueOnce({
          accessToken: 'li-access-token',
          refreshToken: 'li-refresh-token',
          expiresIn: 900,
          tokenType: 'Bearer',
          redirectTo: '/dashboard',
        });

        await controller.linkedinCallback(mockReq as any, mockRes as any);

        expect(mockAuthService.socialLogin).toHaveBeenCalledWith(
          expect.objectContaining({ provider: 'linkedin' }),
        );
        expect(mockRes.redirect).toHaveBeenCalledWith(
          expect.stringContaining('provider=linkedin'),
        );
      });
    });

    describe('OAuth error handling', () => {
      it('should redirect with error when socialLogin throws', async () => {
        const mockReq = {
          user: {
            provider: 'google',
            providerId: 'g-err',
            email: 'error@example.com',
            firstName: 'Err',
            lastName: 'User',
          },
        };

        mockAuthService.socialLogin.mockRejectedValueOnce(
          new Error('Service failure'),
        );

        await controller.googleCallback(mockReq as any, mockRes as any);

        expect(mockRes.redirect).toHaveBeenCalledWith(
          expect.stringContaining('error=auth_failed'),
        );
      });
    });
  });
});
