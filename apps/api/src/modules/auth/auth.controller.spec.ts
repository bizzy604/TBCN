import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
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
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
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

  describe('POST /auth/logout', () => {
    it('should call authService.logout with user ID', async () => {
      mockAuthService.logout.mockResolvedValueOnce({
        message: 'Logged out',
      });

      const result = await controller.logout('user-id');

      expect(authService.logout).toHaveBeenCalledWith('user-id');
    });
  });

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

  describe('GET /auth/me', () => {
    it('should return current user info', async () => {
      const mockUser = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 'member',
      };

      const result = await controller.me(mockUser);

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        role: 'member',
      });
    });
  });
});
