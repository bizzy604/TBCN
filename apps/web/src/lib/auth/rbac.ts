export type AppRole = 'member' | 'partner' | 'coach' | 'admin' | 'super_admin';

export const ADMIN_ROLES: AppRole[] = ['super_admin', 'admin'];
export const COACH_MANAGEMENT_ROLES: AppRole[] = ['super_admin', 'admin', 'coach'];
export const PARTNER_WORKSPACE_ROLES: AppRole[] = ['super_admin', 'admin', 'partner'];
export const AUTHENTICATED_ROLES: AppRole[] = [
  'member',
  'partner',
  'coach',
  'admin',
  'super_admin',
];

const AUTH_REQUIRED_PREFIXES = [
  '/dashboard',
  '/programs',
  '/enrollments',
  '/coaches',
  '/sessions',
  '/certificates',
  '/community',
  '/events',
  '/messages',
  '/notifications',
  '/settings',
  '/payments',
  '/admin',
  '/coach',
  '/partner',
  '/coaching',
];

const ROLE_ROUTE_RULES: Array<{ prefix: string; roles: AppRole[] }> = [
  { prefix: '/admin', roles: ADMIN_ROLES },
  { prefix: '/coach', roles: COACH_MANAGEMENT_ROLES },
  { prefix: '/partner', roles: PARTNER_WORKSPACE_ROLES },
];

function pathMatches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isAuthRequiredPath(pathname: string): boolean {
  return AUTH_REQUIRED_PREFIXES.some((prefix) => pathMatches(pathname, prefix));
}

export function canAccessPath(pathname: string, role: string | null): boolean {
  const matchedRule = ROLE_ROUTE_RULES.find((rule) => pathMatches(pathname, rule.prefix));
  if (!matchedRule) {
    return true;
  }

  if (!role) {
    return false;
  }

  return matchedRule.roles.includes(role as AppRole);
}

export function getDefaultRedirectByRole(role: string | null): string {
  if (role && ADMIN_ROLES.includes(role as AppRole)) {
    return '/admin';
  }

  return '/dashboard';
}

export function canManageCoachingSessions(role: string | null): boolean {
  if (!role) return false;
  return COACH_MANAGEMENT_ROLES.includes(role as AppRole);
}

export function canAccessPartnerWorkspace(role: string | null): boolean {
  if (!role) return false;
  return PARTNER_WORKSPACE_ROLES.includes(role as AppRole);
}
