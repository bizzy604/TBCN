import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';
import { UsersService } from '../users/users.service';

// Domain events
export const AUTH_EVENTS = {
  USER_REGISTERED: 'auth.user.registered',
  USER_LOGGED_IN: 'auth.user.loggedIn',
  PASSWORD_RESET_REQUESTED: 'auth.password.resetRequested',
  PASSWORD_CHANGED: 'auth.password.changed',
};

// JWT Payload interface
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Token response interface
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Auth Service
 * Handles all authentication logic
 */
@Injectable()
export class AuthService {
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

    // Emit registration event
    this.eventEmitter.emit(AUTH_EVENTS.USER_REGISTERED, {
      userId: user.id,
      email: dto.email,
      firstName: dto.firstName,
    });

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

    return tokens;
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
    // TODO: Find user by email
    // const user = await this.usersService.findByEmail(dto.email);

    // Always return success (don't reveal if email exists)
    // if (user) {
    //   const resetToken = this.generateResetToken();
    //   // Store reset token in database
    //   // Emit event to send email
    //   this.eventEmitter.emit(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, {
    //     userId: user.id,
    //     email: user.email,
    //     resetToken,
    //   });
    // }

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

    // TODO: Validate reset token
    // TODO: Update user password
    // TODO: Invalidate reset token

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

    // TODO: Verify current password
    // TODO: Update password
    // TODO: Emit event

    return {
      message: 'Password has been changed successfully.',
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
    role: string,
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
   * Generate a random reset token
   */
  private generateResetToken(): string {
    return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
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
