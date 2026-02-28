import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ProgramsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const API_PREFIX = '/api/v1';
  const testUser = {
    email: `programs-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Programs',
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

  it('should list available programs from public catalog', () => {
    return request(app.getHttpServer())
      .get(`${API_PREFIX}/programs/catalog`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('items');
        expect(res.body).toHaveProperty('meta');
      });
  });

  it('should return 404 for unknown program slug', () => {
    return request(app.getHttpServer())
      .get(`${API_PREFIX}/programs/catalog/non-existent-program-slug`)
      .expect(404);
  });

  it('should block unauthenticated program creation', () => {
    return request(app.getHttpServer())
      .post(`${API_PREFIX}/programs`)
      .send({
        title: 'Unauthorized Program',
        description: 'Should fail without auth',
      })
      .expect(401);
  });

  it('should block member from program creation (coach/admin only)', () => {
    return request(app.getHttpServer())
      .post(`${API_PREFIX}/programs`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Member Program',
        description: 'Members cannot create programs',
      })
      .expect(403);
  });

  it('should block member from program stats endpoint (admin only)', () => {
    return request(app.getHttpServer())
      .get(`${API_PREFIX}/programs/stats`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
