import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  canAccessPath,
  getDefaultRedirectByRole,
  isAuthRequiredPath,
} from './lib/auth/rbac';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function getAuthFromRequest(request: NextRequest): {
  isAuthenticated: boolean;
  role: string | null;
  accessToken: string | null;
} {
  const authCookie = request.cookies.get('auth-storage')?.value;

  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie);
      const state = parsed?.state || parsed;
      if (state?.accessToken && state?.isAuthenticated) {
        const payload = decodeJwtPayload(state.accessToken);
        return {
          isAuthenticated: true,
          role: (payload?.role as string) || null,
          accessToken: state.accessToken,
        };
      }
    } catch {
      // Fall through to header strategy.
    }
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = decodeJwtPayload(token);
    if (payload) {
      return {
        isAuthenticated: true,
        role: (payload.role as string) || null,
        accessToken: token,
      };
    }
  }

  return { isAuthenticated: false, role: null, accessToken: null };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { isAuthenticated, role } = getAuthFromRequest(request);

  const requiresAuth = isAuthRequiredPath(pathname);
  if (requiresAuth && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (requiresAuth && isAuthenticated && !canAccessPath(pathname, role)) {
    return NextResponse.redirect(new URL(getDefaultRedirectByRole(role), request.url));
  }

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(getDefaultRedirectByRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts|manifest.json).*)',
  ],
};
