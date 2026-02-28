import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { User } from '../users/entities/user.entity';
import { Program } from '../programs/entities/program.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Event } from '../events/entities/event.entity';
import { Transaction } from '../payments/entities/transaction.entity';
import { Post } from '../community/entities/post.entity';
import { Message } from '../messaging/entities/message.entity';

/**
 * Analytics Module
 * Manages analytics and reporting
 * - User analytics
 * - Course engagement metrics
 * - Revenue reports
 * - Admin dashboards
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      User,
      Program,
      Enrollment,
      Event,
      Transaction,
      Post,
      Message,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService, TypeOrmModule],
})
export class AnalyticsModule {}
