import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    acceptTerms: true,
  };

  // API base path with versioning
  const API_PREFIX = '/api/v1';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply same configuration as main.ts
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

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .send(testUser)
        .expect(201)
        .expect((res: Response) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Registration successful');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should fail with weak password', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .send({
          ...testUser,
          password: '123',
        })
        .expect(400);
    });

    it('should fail without accepting terms', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .send({
          ...testUser,
          email: 'another@example.com',
          acceptTerms: false,
        })
        .expect(400);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/register`)
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body).toHaveProperty('expiresIn');
          expect(res.body.tokenType).toBe('Bearer');
          
          // Store tokens for subsequent tests
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/login`)
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);
    });

    it('should fail with missing email', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/login`)
        .send({
          password: testUser.password,
        })
        .expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should return new tokens for valid refresh token', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/refresh`)
        .send({
          refreshToken: refreshToken,
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/refresh`)
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });

  describe('/auth/me (GET)', () => {
    it('should return current user with valid token', () => {
      return request(app.getHttpServer())
        .get(`${API_PREFIX}/auth/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('role');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer())
        .get(`${API_PREFIX}/auth/me`)
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get(`${API_PREFIX}/auth/me`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should accept any email (prevents enumeration)', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/forgot-password`)
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.message).toContain('If an account with that email exists');
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/forgot-password`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('/auth/reset-password (POST)', () => {
    it('should fail if passwords do not match', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/reset-password`)
        .send({
          token: 'some-token',
          password: 'NewPassword123',
          confirmPassword: 'DifferentPassword123',
        })
        .expect(400);
    });
  });

  describe('/auth/change-password (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/change-password`)
        .send({
          currentPassword: 'CurrentPass123',
          newPassword: 'NewPassword123',
          confirmPassword: 'NewPassword123',
        })
        .expect(401);
    });

    it('should fail if new passwords do not match', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/change-password`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword123',
          confirmPassword: 'DifferentPassword123',
        })
        .expect(400);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout successfully with valid token', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/logout`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.message).toContain('Logged out');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/auth/logout`)
        .expect(401);
    });
  });
});
