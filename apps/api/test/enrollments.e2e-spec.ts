import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('EnrollmentsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const API_PREFIX = '/api/v1';
  const testUser = {
    email: `enrollments-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Enrollments',
    lastName: 'Tester',
    acceptTerms: true,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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

    await request(app.getHttpServer()).post(`${API_PREFIX}/auth/register`).send(testUser);
    const loginRes = await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/login`)
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    accessToken = loginRes.body.accessToken;
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should require authentication to enroll in a program', () => {
    return request(app.getHttpServer())
      .post(`${API_PREFIX}/enrollments`)
      .send({ programId: '57fb57dc-74b2-4e1a-89bc-24ea113f9d6a' })
      .expect(401);
  });

  it('should validate enrollment request payload', () => {
    return request(app.getHttpServer())
      .post(`${API_PREFIX}/enrollments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ programId: 'invalid-uuid' })
      .expect(400);
  });

  it('should list authenticated user enrollments', () => {
    return request(app.getHttpServer())
      .get(`${API_PREFIX}/enrollments/me`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('items');
        expect(res.body).toHaveProperty('meta');
      });
  });

  it('should return 404 when dropping a missing enrollment', () => {
    return request(app.getHttpServer())
      .patch(`${API_PREFIX}/enrollments/57fb57dc-74b2-4e1a-89bc-24ea113f9d6a/drop`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('should return 404 when updating progress for missing enrollment', () => {
    return request(app.getHttpServer())
      .patch(`${API_PREFIX}/enrollments/57fb57dc-74b2-4e1a-89bc-24ea113f9d6a/progress`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        lessonId: 'a6e7f31a-b4a7-4e6d-b6ef-6e32d57fef0a',
        completed: true,
      })
      .expect(404);
  });
});
