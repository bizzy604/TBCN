// ============================================
// Auth Types
// ============================================

import type { UserRole } from './user';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

/**
 * Full login/socialLogin response — includes tokens + inline user + redirect
 */
export interface LoginResponse extends AuthTokens {
  user?: LoginUser;
  redirectTo?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface AuthResponse {
  user: import('./user').User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export type OAuthProvider = 'google' | 'linkedin' | 'facebook';
