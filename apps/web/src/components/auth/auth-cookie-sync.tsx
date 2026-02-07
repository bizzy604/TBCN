'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

/**
 * AuthCookieSync
 * Syncs the Zustand auth state to a cookie so Next.js middleware
 * can read it on the server side for route protection.
 *
 * Drop this component in the root layout.
 */
export function AuthCookieSync() {
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Set a cookie with the auth state for middleware to read
      const state = JSON.stringify({
        state: {
          accessToken,
          isAuthenticated: true,
        },
      });
      document.cookie = `auth-storage=${encodeURIComponent(state)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    } else {
      // Clear the cookie on logout
      document.cookie = 'auth-storage=; path=/; max-age=0; SameSite=Lax';
    }
  }, [accessToken, isAuthenticated]);

  return null;
}
