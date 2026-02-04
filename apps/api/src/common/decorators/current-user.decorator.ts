import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Current User Decorator
 * Extracts the authenticated user from the request
 * 
 * Usage:
 * @CurrentUser() user: User - Get full user object
 * @CurrentUser('id') userId: string - Get specific property
 */
export const CurrentUser = createParamDecorator(
  (property: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as Record<string, unknown> | undefined;

    if (!user) {
      return null;
    }

    return property ? user[property] : user;
  },
);
