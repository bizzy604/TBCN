// ============================================
// User Types
// ============================================

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
  phoneNumber: string | null;
  phoneVerified: boolean;
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

export enum UserRole {
  ADMIN = 'admin',
  COACH = 'coach',
  MEMBER = 'member',
  PARTNER = 'partner',
  VISITOR = 'visitor',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}
