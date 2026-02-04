'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import { authApi, usersApi } from '@/lib/api';
import type { LoginCredentials, RegisterCredentials, User, UserProfile } from '@/types';
import toast from 'react-hot-toast';

/**
 * useAuth hook
 * Comprehensive authentication hook using React Query
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    accessToken,
    isAuthenticated,
    setUser,
    setTokens,
    logout: logoutStore,
  } = useAuthStore();

  // Fetch current user
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => usersApi.getMe(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    select: (data) => data,
  });

  // Sync user to store
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser, setUser]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: async (tokens) => {
      setTokens(tokens.accessToken, tokens.refreshToken);
      
      // Fetch user info
      const user = await usersApi.getMe();
      setUser(user);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterCredentials) => authApi.register(data),
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logoutStore();
      queryClient.clear();
      router.push('/login');
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: { token: string; password: string; confirmPassword: string }) =>
      authApi.resetPassword(data.token, data.password, data.confirmPassword),
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      authApi.changePassword(data.currentPassword, data.newPassword, data.confirmPassword),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
  });

  // Login handler
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      return loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  // Register handler
  const register = useCallback(
    async (data: RegisterCredentials) => {
      return registerMutation.mutateAsync(data);
    },
    [registerMutation]
  );

  // Logout handler
  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  return {
    // State
    user: currentUser || user,
    isAuthenticated,
    isLoading: isLoadingUser,
    
    // Actions
    login,
    register,
    logout,
    refetchUser,
    
    // Mutations
    loginMutation,
    registerMutation,
    logoutMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    changePasswordMutation,
  };
}

/**
 * useRequireAuth hook
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo = '/login') {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return { isLoading, isAuthenticated, user };
}

/**
 * useRequireRole hook
 * Redirects if user doesn't have required role
 */
export function useRequireRole(roles: string[], redirectTo = '/dashboard') {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (!roles.includes(user.role)) {
        toast.error('You do not have permission to access this page');
        router.push(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, user, roles, router, redirectTo]);

  return { isLoading, isAuthenticated, user };
}
