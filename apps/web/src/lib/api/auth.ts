import apiClient from './client';
import type { User, AuthTokens, LoginCredentials, RegisterCredentials, LoginResponse, OAuthProvider } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Backend wraps responses in { data: T, timestamp: string }
interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

/**
 * Auth API
 * All authentication-related API calls
 */
export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  /**
   * Register a new user
   */
  async register(data: RegisterCredentials): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/register', data);
    return response.data.data;
  },

  /**
   * Refresh the access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  /**
   * Get current user info
   */
  async me(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
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
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return response.data.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', {
      token,
      password,
      confirmPassword,
    });
    return response.data.data;
  },

  /**
   * Change password (authenticated)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data.data;
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', { token });
    return response.data.data;
  },

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/resend-verification');
    return response.data.data;
  },

  /**
   * Get the OAuth redirect URL for a provider
   * Redirects the browser to the API's OAuth endpoint
   */
  getOAuthUrl(provider: OAuthProvider): string {
    return `${API_BASE_URL}/auth/${provider}`;
  },

  /**
   * Initiate OAuth login by redirecting to the provider
   */
  initiateOAuth(provider: OAuthProvider): void {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  },
};
