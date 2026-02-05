'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for hydration
    if (!isHydrated) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(pathname);
      router.push(`${redirectTo}?redirect=${redirect}`);
      return;
    }

    // Check roles if required
    if (requiredRoles && requiredRoles.length > 0 && user) {
      if (!requiredRoles.includes(user.role)) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isHydrated, user, requiredRoles, router, pathname, redirectTo]);

  // Show nothing while checking auth
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show nothing if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // Show nothing if wrong role (redirect will happen)
  if (requiredRoles && requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Admin Route Component
 * Wraps pages that require admin access
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Coach Route Component
 * Wraps pages that require coach access
 */
export function CoachRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['super_admin', 'admin', 'coach']}>
      {children}
    </ProtectedRoute>
  );
}
