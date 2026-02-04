import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store';
import type { ApiError, ApiResponse } from '@/types';

/**
 * API Client
 * Centralized Axios instance with interceptors for auth and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState();
    
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const { tokens, logout } = useAuthStore.getState();
      
      if (tokens?.refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });
          
          const newTokens = response.data.data;
          useAuthStore.getState().setTokens(newTokens);
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          }
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    // Transform error for consistent handling
    const apiError: ApiError = error.response?.data || {
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
      },
      timestamp: new Date().toISOString(),
    };
    
    return Promise.reject(apiError);
  }
);

// ============================================
// API Methods
// ============================================

export const api = {
  /**
   * GET request
   */
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },

  /**
   * POST request
   */
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  /**
   * PUT request
   */
  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  /**
   * PATCH request
   */
  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },

  /**
   * DELETE request
   */
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  },
};

export default apiClient;
