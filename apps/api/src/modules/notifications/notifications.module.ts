import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { InAppChannel } from './channels/in-app.channel';
import { EmailChannel } from './channels/email.channel';
import { SmsChannel } from './channels/sms.channel';
import { PushChannel } from './channels/push.channel';

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
    TypeOrmModule.forFeature([Notification]),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    InAppChannel,
    EmailChannel,
    SmsChannel,
    PushChannel,
  ],
  exports: [NotificationsService, TypeOrmModule],
})
export class NotificationsModule {}
