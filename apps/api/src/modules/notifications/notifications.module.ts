import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

/**
 * Notifications Module
 * Manages all notification channels
 * - Email (SendGrid/SES)
 * - In-app notifications
 * - Push notifications
 * - SMS (Twilio)
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class NotificationsModule {}
