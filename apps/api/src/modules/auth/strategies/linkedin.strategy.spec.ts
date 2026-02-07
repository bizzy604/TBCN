import { ConfigService } from '@nestjs/config';
import { LinkedInStrategy } from './linkedin.strategy';

describe('LinkedInStrategy', () => {
  let strategy: LinkedInStrategy;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        LINKEDIN_CLIENT_ID: 'linkedin-test-client-id',
        LINKEDIN_CLIENT_SECRET: 'linkedin-test-secret',
        LINKEDIN_CALLBACK_URL: 'http://localhost:4000/api/v1/auth/linkedin/callback',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(() => {
    strategy = new LinkedInStrategy(mockConfigService as unknown as ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should extract user data from LinkedIn profile', async () => {
      const profile = {
        id: 'li-12345',
        name: { givenName: 'Bob', familyName: 'Builder' },
        emails: [{ value: 'bob@linkedin.com' }],
        photos: [{ value: 'https://media.linkedin.com/photo.jpg' }],
      };

      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', profile as any, done);

      expect(done).toHaveBeenCalledWith(null, {
        providerId: 'li-12345',
        provider: 'linkedin',
        email: 'bob@linkedin.com',
        firstName: 'Bob',
        lastName: 'Builder',
        avatarUrl: 'https://media.linkedin.com/photo.jpg',
      });
    });

    it('should handle missing email gracefully', async () => {
      const profile = {
        id: 'li-67890',
        name: { givenName: 'No', familyName: 'Email' },
        emails: undefined,
        photos: [],
      };

      const done = jest.fn();

      await strategy.validate('access-token', 'refresh-token', profile as any, done);

      expect(done).toHaveBeenCalledWith(null, expect.objectContaining({
        providerId: 'li-67890',
        email: '',
      }));
    });

    it('should handle missing name and photo', async () => {
      const profile = {
        id: 'li-minimal',
        name: undefined,
        emails: [{ value: 'min@linkedin.com' }],
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
