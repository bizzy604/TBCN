import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

/**
 * Facebook OAuth Strategy
 * Handles Facebook social login via passport
 */
@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'),
      callbackURL: configService.get<string>(
        'FACEBOOK_CALLBACK_URL',
        'http://localhost:4000/api/v1/auth/facebook/callback',
      ),
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'photos'],
    });
  }

  /**
   * Validate the Facebook profile returned after OAuth consent
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ): Promise<void> {
    const { id, name, emails, photos } = profile;

    const user = {
      providerId: id,
      provider: 'facebook',
      email: emails?.[0]?.value || '',
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      avatarUrl: photos?.[0]?.value || null,
    };

    done(null, user);
  }
}
