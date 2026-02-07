import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';

/**
 * LinkedIn OAuth2 Strategy
 * Handles LinkedIn social login via passport
 */
@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID'),
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET'),
      callbackURL: configService.get<string>(
        'LINKEDIN_CALLBACK_URL',
        'http://localhost:4000/api/v1/auth/linkedin/callback',
      ),
      scope: ['openid', 'profile', 'email'],
    });
  }

  /**
   * Validate the LinkedIn profile returned after OAuth consent
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any, info?: any) => void,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;

    const user = {
      providerId: id,
      provider: 'linkedin',
      email: emails?.[0]?.value || '',
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      avatarUrl: photos?.[0]?.value || null,
    };

    done(null, user);
  }
}
