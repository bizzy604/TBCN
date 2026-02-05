import apiClient from './client';
import type { User, UserProfile, PaginatedResponse, PaginationParams } from '@/types';

// Backend wraps responses in { data: T, timestamp: string }
interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

export interface UpdateProfileData {
  bio?: string;
  headline?: string;
  company?: string;
  jobTitle?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  yearsExperience?: number;
  specializations?: string[];
  certifications?: string[];
  industriesServed?: string[];
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
}

/**
 * Users API
 * User profile and management API calls
 */
export const usersApi = {
  /**
   * Get current user with profile
   */
  async getMe(): Promise<User & { profile: UserProfile }> {
    const response = await apiClient.get<ApiResponse<User & { profile: UserProfile }>>('/users/me');
    return response.data.data;
  },

  /**
   * Update current user
   */
  async updateMe(data: UpdateUserData): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/users/me', data);
    return response.data.data;
  },

  /**
   * Update current user profile
   */
  async updateMyProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await apiClient.put<ApiResponse<UserProfile>>('/users/me/profile', data);
    return response.data.data;
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<ApiResponse<{ avatarUrl: string }>>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // ============================================
  // Admin endpoints
  // ============================================

  /**
   * Get all users (admin)
   */
  async getAll(params?: PaginationParams & {
    search?: string;
    role?: string;
    status?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>('/users', { params });
    return response.data.data;
  },

  /**
   * Get user by ID (admin)
   */
  async getById(id: string): Promise<User & { profile: UserProfile }> {
    const response = await apiClient.get<ApiResponse<User & { profile: UserProfile }>>(`/users/${id}`);
    return response.data.data;
  },

  /**
   * Update user (admin)
   */
  async update(id: string, data: UpdateUserData & {
    role?: string;
    status?: string;
    emailVerified?: boolean;
  }): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete user (admin)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Get user stats (admin)
   */
  async getStats(): Promise<Record<string, number>> {
    const response = await apiClient.get<ApiResponse<Record<string, number>>>('/users/stats');
    return response.data.data;
  },
};
