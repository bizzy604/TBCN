import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  // ============================================
  // Security Middleware
  // ============================================
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  const corsOrigins = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000,http://localhost:3002');
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  });

  // ============================================
  // API Versioning
  // ============================================
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ============================================
  // Global Pipes (Validation)
  // ============================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Auto-transform payloads
      transformOptions: {
        enableImplicitConversion: true,
      },
      validationError: {
        target: false, // Don't expose target object
        value: false, // Don't expose values
      },
    }),
  );

  // ============================================
  // Global Filters & Interceptors
  // ============================================
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
    new TimeoutInterceptor(),
  );

  // ============================================
  // Swagger Documentation
  // ============================================
  if (configService.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('The Brand Coach Network API')
      .setDescription(
        'RESTful API for The Brand Coach Network platform - Learning, Coaching, Community, Commerce',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Authentication & Authorization')
      .addTag('Users', 'User Management')
      .addTag('Programs', 'Learning Programs & Courses')
      .addTag('Enrollments', 'User Enrollments & Progress')
      .addTag('Coaching', 'Coaching Marketplace')
      .addTag('Community', 'Community Forums & Posts')
      .addTag('Events', 'Events & Masterclasses')
      .addTag('Payments', 'Payments & Subscriptions')
      .addTag('Coupons', 'Coupon & Discount Management')
      .addTag('Certificates', 'Learning Certificates & Verification')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // ============================================
  // Start Server
  // ============================================
  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);

  console.log(`
    🚀 The Brand Coach Network API
    ================================
    Environment: ${configService.get<string>('NODE_ENV', 'development')}
    Port: ${port}
    API Docs: http://localhost:${port}/api
    ================================
  `);
}

bootstrap();
