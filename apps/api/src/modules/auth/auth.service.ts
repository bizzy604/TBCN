import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Inject, forwardRef, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { UserRole, ROLE_REDIRECT_MAP } from '@tbcn/shared';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
  SocialLoginProfileDto,
} from './dto';
import { UsersService } from '../users/users.service';

// Domain events
export const AUTH_EVENTS = {
  USER_REGISTERED: 'auth.user.registered',
  USER_LOGGED_IN: 'auth.user.loggedIn',
  USER_SOCIAL_LOGIN: 'auth.user.socialLogin',
  PASSWORD_RESET_REQUESTED: 'auth.password.resetRequested',
  PASSWORD_CHANGED: 'auth.password.changed',
};

// JWT Payload interface
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Token response interface
export interface LoginUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user?: LoginUser;
  redirectTo?: string;
}

/**
 * Auth Service
 * Handles all authentication logic
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<{ message: string }> {
    // Check if acceptTerms is true
    if (!dto.acceptTerms) {
      throw new BadRequestException('You must accept the terms and conditions');
    }

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(dto.password);

    // Create user
    const user = await this.usersService.createWithPassword({
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    // Generate verification token and store it
    const verificationToken = this.generateSecureToken();
    await this.usersService.setEmailVerificationToken(user.id, verificationToken);

    // Emit registration event (email listener will send verification email)
    this.eventEmitter.emit(AUTH_EVENTS.USER_REGISTERED, {
      userId: user.id,
      email: dto.email,
      firstName: dto.firstName,
      verificationToken,
    });

    this.logger.log(`User registered: ${dto.email} — verification email queued`);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Login with email and password
   */
  async login(dto: LoginDto): Promise<TokenResponse> {
    // Find user by email
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Emit login event
    this.eventEmitter.emit(AUTH_EVENTS.USER_LOGGED_IN, {
      userId: user.id,
      email: user.email,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      },
      redirectTo: ROLE_REDIRECT_MAP[user.role] || '/dashboard',
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(dto: RefreshTokenDto): Promise<TokenResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Generate new tokens
      return this.generateTokens(payload.sub, payload.email, payload.role);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    // Always return success message (don't reveal if email exists)
    if (user) {
      const resetToken = this.generateSecureToken();
      await this.usersService.setPasswordResetToken(user.id, resetToken);

      this.eventEmitter.emit(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        resetToken,
      });

      this.logger.log(`Password reset requested for: ${dto.email}`);
    }

    return {
      message: 'If an account with that email exists, we have sent a password reset link.',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Find user by reset token
    const user = await this.usersService.findByPasswordResetToken(dto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check token expiration
    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Reset token has expired. Please request a new one.');
    }

    // Hash new password and update
    const hashedPassword = await this.hashPassword(dto.password);
    await this.usersService.updatePassword(user.id, hashedPassword);

    this.logger.log(`Password reset completed for: ${user.email}`);

    return {
      message: 'Password has been reset successfully.',
    };
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Get user with password
    const user = await this.usersService.findById(userId);
    const userWithPassword = await this.usersService.findByEmailWithPassword(user.email);

    if (!userWithPassword || !userWithPassword.password) {
      throw new BadRequestException('Cannot change password for social login accounts');
    }

    // Verify current password
    const isCurrentValid = await this.verifyPassword(dto.currentPassword, userWithPassword.password);
    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash and update password
    const hashedPassword = await this.hashPassword(dto.newPassword);
    await this.usersService.updatePassword(userId, hashedPassword);

    // Emit event (sends confirmation email)
    this.eventEmitter.emit(AUTH_EVENTS.PASSWORD_CHANGED, {
      userId,
      email: user.email,
      firstName: user.firstName,
    });

    this.logger.log(`Password changed for user: ${user.email}`);

    return {
      message: 'Password has been changed successfully.',
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmailVerificationToken(dto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark email as verified
    await this.usersService.verifyEmail(user.id);

    this.logger.log(`Email verified for user: ${user.email}`);

    return {
      message: 'Email verified successfully. You can now log in.',
    };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (user && !user.emailVerified) {
      const verificationToken = this.generateSecureToken();
      await this.usersService.setEmailVerificationToken(user.id, verificationToken);

      this.eventEmitter.emit(AUTH_EVENTS.USER_REGISTERED, {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        verificationToken,
      });

      this.logger.log(`Verification email resent to: ${email}`);
    }

    return {
      message: 'If your account exists and is not yet verified, a new verification email has been sent.',
    };
  }

  /**
   * Social login / signup via OAuth provider
   * Finds existing user or creates new one from provider profile
   */
  async socialLogin(profile: SocialLoginProfileDto): Promise<TokenResponse> {
    if (!profile.email) {
      throw new BadRequestException(
        'Email is required for social login. Please ensure your social account has an email address.',
      );
    }

    // Find or create user from social profile
    const user = await this.usersService.findOrCreateFromSocial({
      provider: profile.provider,
      providerId: profile.providerId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.avatarUrl || null,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Emit social login event
    this.eventEmitter.emit(AUTH_EVENTS.USER_SOCIAL_LOGIN, {
      userId: user.id,
      email: user.email,
      provider: profile.provider,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      },
      redirectTo: ROLE_REDIRECT_MAP[user.role] || '/dashboard',
    };
  }

  /**
   * Logout user (invalidate tokens)
   */
  async logout(userId: string): Promise<{ message: string }> {
    // TODO: Add refresh token to blacklist
    // TODO: Clear any sessions

    return {
      message: 'Logged out successfully.',
    };
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
  ): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m');
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessExpiration,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: refreshExpiration,
      }),
    ]);

    // Parse expiration to seconds
    const expiresIn = this.parseExpirationToSeconds(accessExpiration);

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * Hash password with bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a cryptographically secure random token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Parse expiration string to seconds
   */
  private parseExpirationToSeconds(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 900;
    }
  }
}
