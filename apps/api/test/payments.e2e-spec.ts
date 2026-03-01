import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const API_PREFIX = '/api/v1';
  const testUser = {
    email: `payments-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Payments',
    lastName: 'Tester',
    acceptTerms: true,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

    await app.init();

    await request(app.getHttpServer()).post(`${API_PREFIX}/auth/register`).send(testUser);
    const loginRes = await request(app.getHttpServer())
      .post(`${API_PREFIX}/auth/login`)
      .send({ email: testUser.email, password: testUser.password });

    accessToken = loginRes.body.accessToken;
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('should block unauthenticated checkout initiation', () => {
    return request(app.getHttpServer())
      .post(`${API_PREFIX}/payments/checkout`)
      .send({ amount: 29.99 })
      .expect(401);
  });

  it('should return current user subscription', () => {
    return request(app.getHttpServer())
      .get(`${API_PREFIX}/payments/subscription/me`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('plan');
        expect(res.body).toHaveProperty('status');
      });
  });

  it('should initiate checkout for authenticated user', () => {
    return request(app.getHttpServer())
      .post(`${API_PREFIX}/payments/checkout`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: 29.99,
        currency: 'USD',
        paymentMethod: 'card',
        plan: 'pro',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('reference');
        expect(res.body).toHaveProperty('checkoutUrl');
      });
  });

  it('should reject mpesa checkout when user profile has no phone number', () => {
    return request(app.getHttpServer())
      .post(`${API_PREFIX}/payments/checkout`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: 29.99,
        currency: 'KES',
        paymentMethod: 'mpesa',
        plan: 'pro',
      })
      .expect(400)
      .expect((res) => {
        expect(String(res.body.message || '')).toContain('phone number');
      });
  });

  it('should initiate mpesa checkout when phone number is provided in payload', () => {
    return request(app.getHttpServer())
      .post(`${API_PREFIX}/payments/checkout`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: 29.99,
        currency: 'KES',
        paymentMethod: 'mpesa',
        phone: '0712345678',
        plan: 'pro',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.paymentMethod).toBe('mpesa');
        expect(res.body.status).toBe('processing');
      });
  });

  it('should initiate paystack checkout for authenticated user', () => {
    return request(app.getHttpServer())
      .post(`${API_PREFIX}/payments/checkout`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        amount: 29.99,
        currency: 'USD',
        paymentMethod: 'paystack',
        plan: 'pro',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.paymentMethod).toBe('paystack');
        expect(res.body.checkoutUrl).toContain('/payments/confirmation');
      });
  });
});
