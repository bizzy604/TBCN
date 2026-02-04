import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * User roles enum
 */
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  COACH = 'coach',
  PARTNER = 'partner',
  MEMBER = 'member',
  VISITOR = 'visitor',
}

/**
 * Roles Decorator
 * Specifies which roles can access a route
 * 
 * Usage:
 * @Roles(Role.ADMIN, Role.COACH)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
