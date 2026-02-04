import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { Response } from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let testUserId: string;

  // API base path with versioning
  const API_PREFIX = '/api/v1';

  const testUser = {
    email: `user-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    acceptTerms: true,
  };

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

    // Register and login test user
    await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/register`)
      .send(testUser);

    const loginRes = await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/login`)
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    accessToken = loginRes.body.accessToken;

    // Get user ID
    const meRes = await request(app.getHttpServer())
      .get(`${API_PREFIX}/auth/me`)
      .set('Authorization', `Bearer ${accessToken}`);

    testUserId = meRes.body.id;
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/users/me (GET)', () => {
    it('should return current user with profile', () => {
      return request(app.getHttpServer())
        .get(`${API_PREFIX}/users/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res: Response) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', testUser.email);
          expect(res.body).toHaveProperty('firstName', testUser.firstName);
          expect(res.body).toHaveProperty('lastName', testUser.lastName);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`${API_PREFIX}/users/me`)
        .expect(401);
    });
  });

  describe('/users/me (PUT)', () => {
    it('should update current user', () => {
      return request(app.getHttpServer())
        .put(`${API_PREFIX}/users/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(200)
        .expect((res: Response) => {
          expect(res.body.firstName).toBe('Updated');
          expect(res.body.lastName).toBe('Name');
        });
    });

    it('should fail with invalid data', () => {
      return request(app.getHttpServer())
        .put(`${API_PREFIX}/users/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'A', // Too short
        })
        .expect(400);
    });
  });

  describe('/users/me/profile (PUT)', () => {
    // TODO: Profile update needs the user to exist first
    it.todo('should update user profile');
    it.todo('should validate URL fields');
    it.todo('should accept valid URLs');
  });

  describe('/users/me/avatar (POST)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post(`${API_PREFIX}/users/me/avatar`)
        .expect(401);
    });
  });

  // Admin endpoints tests
  describe('Admin Endpoints', () => {
    describe('/users (GET) - Admin Only', () => {
      it('should reject non-admin users', () => {
        return request(app.getHttpServer())
          .get(`${API_PREFIX}/users`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('/users/:id (GET) - Admin Only', () => {
      it('should reject non-admin users', () => {
        return request(app.getHttpServer())
          .get(`${API_PREFIX}/users/${testUserId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('/users (POST) - Admin Only', () => {
      it('should reject non-admin users', () => {
        return request(app.getHttpServer())
          .post(`${API_PREFIX}/users`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            email: 'newuser@example.com',
            password: 'Password123!',
            firstName: 'New',
            lastName: 'User',
          })
          .expect(403);
      });
    });

    describe('/users/:id (PATCH) - Admin Only', () => {
      it('should reject non-admin users', () => {
        return request(app.getHttpServer())
          .patch(`${API_PREFIX}/users/${testUserId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            firstName: 'Changed',
          })
          .expect(403);
      });
    });

    describe('/users/:id (DELETE) - Super Admin Only', () => {
      it('should reject non-admin users', () => {
        return request(app.getHttpServer())
          .delete(`${API_PREFIX}/users/${testUserId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('/users/stats (GET) - Admin Only', () => {
      it('should reject non-admin users', () => {
        return request(app.getHttpServer())
          .get(`${API_PREFIX}/users/stats`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });
  });
});
