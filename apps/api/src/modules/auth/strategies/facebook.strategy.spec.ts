import { ConfigService } from '@nestjs/config';
import { FacebookStrategy } from './facebook.strategy';

describe('FacebookStrategy', () => {
  let strategy: FacebookStrategy;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        FACEBOOK_APP_ID: 'facebook-test-app-id',
        FACEBOOK_APP_SECRET: 'facebook-test-secret',
        FACEBOOK_CALLBACK_URL: 'http://localhost:4000/api/v1/auth/facebook/callback',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(() => {
    strategy = new FacebookStrategy(mockConfigService as unknown as ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should extract user data from Facebook profile', async () => {
      const profile = {
        id: 'fb-12345',
        name: { givenName: 'Jane', familyName: 'Smith' },
        emails: [{ value: 'jane@facebook.com' }],
        photos: [{ value: 'https://graph.facebook.com/photo.jpg' }],
      };

      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', profile as any, done);

      expect(done).toHaveBeenCalledWith(null, {
        providerId: 'fb-12345',
        provider: 'facebook',
        email: 'jane@facebook.com',
        firstName: 'Jane',
        lastName: 'Smith',
        avatarUrl: 'https://graph.facebook.com/photo.jpg',
      });
    });

    it('should handle missing email gracefully', async () => {
      const profile = {
        id: 'fb-67890',
        name: { givenName: 'No', familyName: 'Email' },
        emails: undefined,
        photos: [],
      };

      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', profile as any, done);

      expect(done).toHaveBeenCalledWith(null, expect.objectContaining({
        providerId: 'fb-67890',
        email: '',
      }));
    });

    it('should handle missing photo', async () => {
      const profile = {
        id: 'fb-nophoto',
        name: { givenName: 'No', familyName: 'Photo' },
        emails: [{ value: 'no-photo@facebook.com' }],
        photos: undefined,
      };

      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', profile as any, done);

      expect(done).toHaveBeenCalledWith(null, expect.objectContaining({
        avatarUrl: null,
      }));
    });
  });
});
