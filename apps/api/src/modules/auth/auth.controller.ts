import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService, TokenResponse } from './auth.service';
import { UsersService } from '../users/users.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
} from './dto';
import { Public, CurrentUser } from '../../common/decorators';
import {
  JwtAuthGuard,
  GoogleAuthGuard,
  FacebookAuthGuard,
  LinkedInAuthGuard,
} from '../../common/guards';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  // ============================================
  // Public Endpoints
  // ============================================

  @Post('register')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<TokenResponse> {
    return this.authService.refreshToken(dto);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification token' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({ status: 200, description: 'Verification email resent if account exists' })
  async resendVerification(@Body() dto: ForgotPasswordDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }

  // ============================================
  // Protected Endpoints
  // ============================================

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser('sub') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password changed' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user info' })
  async me(@CurrentUser('sub') userId: string) {
    return this.usersService.findByIdWithProfile(userId);
  }

  // ============================================
  // OAuth Social Login Endpoints
  // ============================================

  /**
   * Redirect user to Google OAuth consent screen
   */
  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async googleLogin() {
    // Guard handles the redirect to Google
  }

  /**
   * Google OAuth callback - receives the profile from Google
   */
  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'google');
  }

  /**
   * Redirect user to Facebook OAuth consent screen
   */
  @Get('facebook')
  @Public()
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Initiate Facebook OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Facebook OAuth' })
  async facebookLogin() {
    // Guard handles the redirect to Facebook
  }

  /**
   * Facebook OAuth callback
   */
  @Get('facebook/callback')
  @Public()
  @UseGuards(FacebookAuthGuard)
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  async facebookCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'facebook');
  }

  /**
   * Redirect user to LinkedIn OAuth consent screen
   */
  @Get('linkedin')
  @Public()
  @UseGuards(LinkedInAuthGuard)
  @ApiOperation({ summary: 'Initiate LinkedIn OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to LinkedIn OAuth' })
  async linkedinLogin() {
    // Guard handles the redirect to LinkedIn
  }

  /**
   * LinkedIn OAuth callback
   */
  @Get('linkedin/callback')
  @Public()
  @UseGuards(LinkedInAuthGuard)
  @ApiOperation({ summary: 'LinkedIn OAuth callback' })
  async linkedinCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'linkedin');
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Handle OAuth callback from any provider
   * Generates JWT tokens and redirects to frontend with tokens in URL
   */
  private async handleOAuthCallback(
    req: Request,
    res: Response,
    provider: string,
  ): Promise<void> {
    try {
      const socialUser = req.user as any;

      if (!socialUser || !socialUser.email) {
        this.logger.warn(`OAuth callback failed for ${provider}: No user data`);
        res.redirect(
          `${this.frontendUrl}/auth/callback?error=no_email&provider=${provider}`,
        );
        return;
      }

      // Generate JWT tokens from the social profile
      const tokens = await this.authService.socialLogin({
        provider: socialUser.provider || provider,
        providerId: socialUser.providerId,
        email: socialUser.email,
        firstName: socialUser.firstName || '',
        lastName: socialUser.lastName || '',
        avatarUrl: socialUser.avatarUrl || null,
      });

      // Redirect to frontend callback page with tokens
      const callbackUrl = new URL(`${this.frontendUrl}/auth/callback`);
      callbackUrl.searchParams.set('accessToken', tokens.accessToken);
      callbackUrl.searchParams.set('refreshToken', tokens.refreshToken);
      callbackUrl.searchParams.set('expiresIn', tokens.expiresIn.toString());
      callbackUrl.searchParams.set('provider', provider);
      if (tokens.redirectTo) {
        callbackUrl.searchParams.set('redirectTo', tokens.redirectTo);
      }

      res.redirect(callbackUrl.toString());
    } catch (error) {
      this.logger.error(`OAuth callback error for ${provider}:`, error);
      res.redirect(
        `${this.frontendUrl}/auth/callback?error=auth_failed&provider=${provider}`,
      );
    }
  }
}
