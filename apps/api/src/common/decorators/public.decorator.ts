import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Public Decorator
 * Marks a route as publicly accessible (no auth required)
 * 
 * Usage:
 * @Public()
 * @Get('catalog')
 * getCatalog() {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
