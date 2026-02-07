import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Google OAuth Guard
 * Triggers the Google OAuth2 flow via passport
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }
}

/**
 * Facebook OAuth Guard
 * Triggers the Facebook OAuth flow via passport
 */
@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }
}

/**
 * LinkedIn OAuth Guard
 * Triggers the LinkedIn OAuth2 flow via passport
 */
@Injectable()
export class LinkedInAuthGuard extends AuthGuard('linkedin') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }
}
