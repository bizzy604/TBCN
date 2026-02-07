import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        GOOGLE_CLIENT_ID: 'google-test-client-id',
        GOOGLE_CLIENT_SECRET: 'google-test-secret',
        GOOGLE_CALLBACK_URL: 'http://localhost:4000/api/v1/auth/google/callback',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(() => {
    // Instantiate directly — avoids PassportStrategy circular-dep in NestJS DI
    strategy = new GoogleStrategy(mockConfigService as unknown as ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should extract user data from Google profile', async () => {
      const profile = {
        id: 'google-12345',
        name: { givenName: 'John', familyName: 'Doe' },
        emails: [{ value: 'john@gmail.com', verified: true }],
        photos: [{ value: 'https://lh3.google.com/photo.jpg' }],
      };

      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', profile as any, done);

      expect(done).toHaveBeenCalledWith(null, {
        providerId: 'google-12345',
        provider: 'google',
        email: 'john@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: 'https://lh3.google.com/photo.jpg',
      });
    });

    it('should handle missing email gracefully', async () => {
      const profile = {
        id: 'google-67890',
        name: { givenName: 'No', familyName: 'Email' },
        emails: undefined,
        photos: [],
      };

      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', profile as any, done);

      expect(done).toHaveBeenCalledWith(null, expect.objectContaining({
        providerId: 'google-67890',
        email: '',
      }));
    });

    it('should handle missing name fields', async () => {
      const profile = {
        id: 'google-99',
        name: undefined,
        emails: [{ value: 'partial@gmail.com' }],
        photos: undefined,
      };

      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', profile as any, done);

      expect(done).toHaveBeenCalledWith(null, expect.objectContaining({
        firstName: '',
        lastName: '',
        avatarUrl: null,
      }));
    });
  });
});
