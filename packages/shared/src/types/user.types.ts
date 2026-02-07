import { UserRole } from '../constants/roles.constants';
import { UserStatus } from '../constants/status.constants';

// Re-export for convenience
export { UserRole, UserStatus };

/**
 * Core User type — shared between API and frontend
 */
export interface UserBase {
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
  timezone: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Profile type — shared between API and frontend
 */
export interface UserProfileBase {
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
 * JWT Payload — shared between API token generation and frontend decoding
 */
export interface JwtPayloadBase {
  sub: string;    // User ID
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
