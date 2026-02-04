import { apiClient } from './client';
import type { User, AuthTokens, LoginCredentials, RegisterCredentials } from '@/types';

/**
 * Auth API
 * All authentication-related API calls
 */
export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterCredentials): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/register', data);
    return response.data;
  },

  /**
   * Refresh the access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Get current user info
   */
  async me(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
      confirmPassword,
    });
    return response.data;
  },

  /**
   * Change password (authenticated)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/verify-email', { token });
    return response.data;
  },

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/resend-verification');
    return response.data;
  },
};
