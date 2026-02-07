import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Admin App Middleware — Server-side route protection
 *
 * Reads the `admin_token` cookie set at login. If the cookie is absent on any
 * dashboard route, the user is redirected to /login. If the cookie is present
 * on /login, they are sent to the dashboard.
 *
 * We also decode the JWT payload (without verifying the signature — that is
 * the API server's responsibility) to confirm the role is admin/super_admin.
 */

const ADMIN_ROLES = ['super_admin', 'admin'];

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Convert base64url → standard base64, then decode via atob (Edge-safe)
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getAuth(request: NextRequest): {
  isAuthenticated: boolean;
  role: string | null;
} {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return { isAuthenticated: false, role: null };

  const payload = decodeJwtPayload(token);
  if (!payload) return { isAuthenticated: false, role: null };

  const role = (payload.role as string) || null;
  const isAdmin = role ? ADMIN_ROLES.includes(role) : false;

  return { isAuthenticated: isAdmin, role };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { isAuthenticated } = getAuth(request);

  // Allow /login for unauthenticated users
  if (pathname === '/login') {
    if (isAuthenticated) {
      // Already logged in — redirect to dashboard
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - api (proxy to NestJS)
     * - _next/static, _next/image
     * - favicon.ico, images, fonts
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
};
