/**
 * User Account Status — Single source of truth
 */
export enum UserStatus {
  PENDING = 'pending',           // Awaiting email verification
  ACTIVE = 'active',             // Full access
  SUSPENDED = 'suspended',       // Temporarily suspended by admin
  DEACTIVATED = 'deactivated',   // User-requested or admin deactivation
}
