import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

/**
 * Messaging Module
 * Manages direct messaging
 * - 1-on-1 messaging
 * - Conversation threads
 * - Read receipts
 * - Message notifications
 */
@Module({
  imports: [TypeOrmModule.forFeature([Message, User])],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway],
  exports: [MessagingService, TypeOrmModule],
})
export class MessagingModule {}
