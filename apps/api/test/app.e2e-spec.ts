import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Setup global prefix and versioning (matching main.ts)
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Health Check', () => {
    // TODO: Implement health module in Sprint 2
    it.todo('/api/health (GET) should return OK');
  });

  describe('API Documentation', () => {
    // TODO: Swagger is at /api in production, verify it works
    it.todo('GET /api should serve Swagger UI');
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', () => {
      return request(app.getHttpServer())
        .get('/api/v1/unknown-route')
        .expect(404)
        .expect((res: Response) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should handle malformed JSON', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });

  describe('Input Validation', () => {
    it('should reject forbidden non-whitelisted properties when configured', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
          acceptTerms: true,
          role: 'super_admin', // Should be forbidden
        })
        .expect(400);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          // missing password, firstName, lastName
        })
        .expect(400);
    });
  });

  describe('Security Headers', () => {
    // TODO: Helmet headers are applied in main.ts bootstrap, not in test
    it.todo('should include x-content-type-options header');
    it.todo('should include x-frame-options header');
    it.todo('should include x-xss-protection header');
  });

  describe('Rate Limiting', () => {
    // TODO: Throttler module is configured but need rate limit tests
    it.todo('should allow requests within rate limit');
    it.todo('should block requests exceeding rate limit');
  });

  describe('CORS', () => {
    // TODO: CORS is configured in main.ts bootstrap
    it.todo('should include access-control-allow-origin header');
    it.todo('should handle preflight OPTIONS requests');
  });
});


