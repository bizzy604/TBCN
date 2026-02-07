import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@tbcn/shared';

export const ROLES_KEY = 'roles';

/**
 * Backward-compatible alias — use UserRole from @tbcn/shared
 */
export const Role = UserRole;
export type Role = UserRole;

/**
 * Roles Decorator
 * Specifies which roles can access a route
 *
 * Usage:
 * @Roles(Role.ADMIN, Role.COACH)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
