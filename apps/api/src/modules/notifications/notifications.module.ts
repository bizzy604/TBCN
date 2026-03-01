import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { InAppChannel } from './channels/in-app.channel';
import { EmailChannel } from './channels/email.channel';
import { SmsChannel } from './channels/sms.channel';
import { PushChannel } from './channels/push.channel';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsEventsListener } from './notifications-events.listener';

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
    JwtModule,
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsEventsListener,
    InAppChannel,
    EmailChannel,
    SmsChannel,
    PushChannel,
  ],
  exports: [NotificationsService, TypeOrmModule],
})
export class NotificationsModule {}
