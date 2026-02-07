import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';

// Common modules
import { DatabaseModule } from './common/database/database.module';
import { CacheModule } from './common/cache/cache.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmailModule } from './modules/email/email.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { CoachingModule } from './modules/coaching/coaching.module';
import { CommunityModule } from './modules/community/community.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { EventsModule } from './modules/events/events.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PartnersModule } from './modules/partners/partners.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { MediaModule } from './modules/media/media.module';

// Configuration validation
import { configValidationSchema } from './common/config/config.schema';

@Module({
  imports: [
    // ============================================
    // Configuration
    // ============================================
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: configValidationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),

    // ============================================
    // Rate Limiting
    // ============================================
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get<number>('THROTTLE_TTL', 60000), // 1 minute
        limit: config.get<number>('THROTTLE_LIMIT', 100), // 100 requests per minute
      }]),
    }),

    // ============================================
    // Event Emitter (Domain Events)
    // ============================================
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // ============================================
    // Job Queue (BullMQ)
    // ============================================
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 200,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      }),
    }),

    // ============================================
    // Scheduled Tasks
    // ============================================
    ScheduleModule.forRoot(),

    // ============================================
    // Infrastructure Modules
    // ============================================
    DatabaseModule,
    CacheModule,

    // ============================================
    // Feature Modules
    // ============================================
    AuthModule,
    UsersModule,
    EmailModule,
    ProgramsModule,
    EnrollmentsModule,
    CoachingModule,
    CommunityModule,
    MessagingModule,
    EventsModule,
    PaymentsModule,
    NotificationsModule,
    AnalyticsModule,
    PartnersModule,
    AssessmentsModule,
    MediaModule,
  ],
  providers: [
    // Global guards — every route requires JWT auth by default.
    // Use @Public() decorator to opt-out specific routes.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
