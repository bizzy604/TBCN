import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { RegistrationsService } from './registrations.service';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { EventTicket } from './entities/event-ticket.entity';
import { Transaction } from '../payments/entities/transaction.entity';
import { PaymentsModule } from '../payments/payments.module';

/**
 * Events Module
 * Manages events and masterclasses
 * - Event creation
 * - Registration and ticketing
 * - Attendance tracking
 * - Virtual/physical event support
 */
@Module({
  imports: [TypeOrmModule.forFeature([Event, EventRegistration, EventTicket, Transaction]), PaymentsModule],
  controllers: [EventsController],
  providers: [EventsService, RegistrationsService],
  exports: [EventsService, RegistrationsService, TypeOrmModule],
})
export class EventsModule {}
