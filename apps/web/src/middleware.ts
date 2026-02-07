import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware — Server-side route protection
 *
 * This runs on every matched request BEFORE React renders.
 * It reads the persisted auth-storage from cookies/localStorage proxy
 * and enforces:
 *   1. Protected routes require a token
 *   2. Admin routes require admin/super_admin role
 *   3. Auth pages redirect away if already logged in
 *
 * NOTE: We read the `auth-storage` value that Zustand persists to localStorage.
 * Since middleware runs server-side and can't read localStorage directly,
 * we parse the token from the Authorization cookie or check for the
 * auth-storage cookie set by the client-side hydration.
 *
 * For a more robust approach, we decode the JWT to extract the role
 * without verifying the signature (that's the API's job).
 */

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/admin', '/coaching'];

// Routes only for unauthenticated users
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Routes that require admin role
const ADMIN_ROUTES = ['/admin'];

// Roles allowed to access admin routes
const ADMIN_ROLES = ['super_admin', 'admin'];

/**
 * Decode JWT payload without verification (signature check is API's responsibility).
 * Returns null if token is malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Try to extract auth state from the Zustand persisted cookie.
 * Zustand persist with localStorage also sets a cookie via our
 * client-side sync script, or we fall back to reading the header.
 */
function getAuthFromRequest(request: NextRequest): {
  isAuthenticated: boolean;
  role: string | null;
  accessToken: string | null;
} {
  // Strategy 1: Read from auth-storage cookie (set by client-side sync)
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
      // Invalid JSON, fall through
    }
  }

  // Strategy 2: Check Authorization header (for API-style requests)
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

  // 1. Protected routes — redirect to login if not authenticated
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Admin routes — redirect to dashboard if not admin
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  if (isAdminRoute && isAuthenticated && role && !ADMIN_ROLES.includes(role)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Auth pages — redirect authenticated users to their dashboard
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    // Redirect to role-appropriate page
    const redirectMap: Record<string, string> = {
      super_admin: '/admin',
      admin: '/admin',
      coach: '/dashboard',
      partner: '/dashboard',
      member: '/dashboard',
    };
    const destination = (role && redirectMap[role]) || '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by NestJS)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, images, fonts
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts|manifest.json).*)',
  ],
};
