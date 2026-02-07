/**
 * User Roles — Single source of truth
 * Matches PRD Section 4.1 (FR-1.2) Role Permission Matrix
 *
 * Hierarchy (highest → lowest):
 *   SUPER_ADMIN > ADMIN > COACH > PARTNER > MEMBER > GUEST
 *
 * GUEST is an unauthenticated visitor (no DB record).
 * All other roles are persisted on the User entity.
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  COACH = 'coach',
  PARTNER = 'partner',
  MEMBER = 'member',
}

/**
 * Role hierarchy level — higher number = more privileges.
 * Useful for "at least role X" checks.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.MEMBER]: 1,
  [UserRole.PARTNER]: 2,
  [UserRole.COACH]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.SUPER_ADMIN]: 5,
};

/**
 * Roles that can access the admin panel
 */
export const ADMIN_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

/**
 * Roles that can manage coaching sessions
 */
export const COACH_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COACH];

/**
 * Default redirect path per role after login
 */
export const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: '/admin',
  [UserRole.ADMIN]: '/admin',
  [UserRole.COACH]: '/dashboard',
  [UserRole.PARTNER]: '/dashboard',
  [UserRole.MEMBER]: '/dashboard',
};
