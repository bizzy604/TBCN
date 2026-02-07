// ============================================
// User Types
// ============================================

import { UserRole, UserStatus, ROLE_REDIRECT_MAP, ADMIN_ROLES, COACH_ROLES } from '@tbcn/shared';

// Re-export shared enums so all frontend code imports from @/types
export { UserRole, UserStatus, ROLE_REDIRECT_MAP, ADMIN_ROLES, COACH_ROLES };

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phone: string | null;
  phoneVerified: boolean;
  timezone?: string;
  locale?: string;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio: string | null;
  headline: string | null;
  location: string | null;
  timezone: string;
  website: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  company: string | null;
  jobTitle: string | null;
  industry: string | null;
  yearsOfExperience: number | null;
  skills: string[];
  interests: string[];
}

/**
 * Helper: check if a role can access admin panel
 */
export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * Helper: check if a role can manage coaching
 */
export function isCoachRole(role: UserRole): boolean {
  return COACH_ROLES.includes(role);
}

/**
 * Get the correct redirect path for a user role
 */
export function getRedirectForRole(role: UserRole): string {
  return ROLE_REDIRECT_MAP[role] || '/dashboard';
}
