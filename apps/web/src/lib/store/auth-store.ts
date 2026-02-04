import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User, AuthTokens } from '@/types';

// ============================================
// Auth Store - Manages authentication state
// ============================================

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      isHydrated: false,

      // Actions
      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
        }),

      setTokens: (accessToken, refreshToken) =>
        set((state) => {
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;
        }),

      login: (user, accessToken, refreshToken) =>
        set((state) => {
          state.user = user;
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
          state.isAuthenticated = true;
          state.isLoading = false;
        }),

      logout: () =>
        set((state) => {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
        }),

      updateUser: (updates) =>
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...updates };
          }
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setHydrated: (hydrated) =>
        set((state) => {
          state.isHydrated = hydrated;
        }),
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
