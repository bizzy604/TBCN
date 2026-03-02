import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@tbcn/shared';
import { InitiatePaymentDto } from '../payments/dto/initiate-payment.dto';
import { Transaction } from '../payments/entities/transaction.entity';
import { PaymentStatus } from '../payments/enums/payment-status.enum';
import { PaymentsService } from '../payments/payments.service';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { EventRegistrationStatus, EventStatus } from './enums/event-status.enum';

interface Actor {
  id: string;
  role: UserRole;
}

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(EventRegistration)
    private readonly registrationRepo: Repository<EventRegistration>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly paymentsService: PaymentsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(eventId: string, userId: string): Promise<EventRegistration> {
    const event = await this.findEventOrThrow(eventId);
    this.assertEventAcceptsRegistrations(event);
    const eventPrice = Number(event.price || 0);

    if (eventPrice > 0) {
      const hasPaid = await this.hasSuccessfulEventPayment(userId, eventId);
      if (!hasPaid) {
        throw new BadRequestException(
          'This is a paid event. Complete payment first, then register to access the live link.',
        );
      }
    }

    const existing = await this.registrationRepo.findOne({ where: { eventId, userId } });
    if (existing) {
      if (existing.status === EventRegistrationStatus.CANCELLED) {
        existing.status = EventRegistrationStatus.REGISTERED;
        await this.registrationRepo.save(existing);
        await this.eventRepo.increment({ id: eventId }, 'registrationCount', 1);
        this.eventEmitter.emit('event.registered', {
          eventId: existing.eventId,
          userId: existing.userId,
          organizerId: event.organizerId,
          title: event.title,
          price: Number(event.price || 0),
          currency: event.currency,
        });
        return this.findById(existing.id);
      }
      throw new BadRequestException('You are already registered for this event');
    }

    const registration = this.registrationRepo.create({
      eventId,
      userId,
      status: EventRegistrationStatus.REGISTERED,
    });
    await this.registrationRepo.save(registration);
    await this.eventRepo.increment({ id: eventId }, 'registrationCount', 1);
    const saved = await this.findById(registration.id);

    this.eventEmitter.emit('event.registered', {
      eventId: saved.eventId,
      userId: saved.userId,
      organizerId: event.organizerId,
      title: event.title,
      price: Number(event.price || 0),
      currency: event.currency,
    });

    return saved;
  }

  async initiateCheckout(
    eventId: string,
    userId: string,
    dto: InitiatePaymentDto,
  ): Promise<Transaction> {
    const event = await this.findEventOrThrow(eventId);
    this.assertEventAcceptsRegistrations(event);
    const eventPrice = Number(event.price || 0);

    if (eventPrice <= 0) {
      throw new BadRequestException('This event is free. No payment is required.');
    }

    if (dto.amount && Math.abs(dto.amount - eventPrice) > 0.01) {
      throw new BadRequestException('Payment amount must match the event price.');
    }

    const hasPaid = await this.hasSuccessfulEventPayment(userId, eventId);
    if (hasPaid) {
      throw new BadRequestException(
        'Payment for this event is already completed. Proceed to event registration.',
      );
    }

    const payload: InitiatePaymentDto = {
      ...dto,
      amount: eventPrice,
      currency: event.currency,
      description: dto.description || `Event access payment: ${event.title}`,
      returnPath: dto.returnPath || `/events/${eventId}`,
    };

    const transaction = await this.paymentsService.initiateCheckout(userId, payload, {
      type: 'event_registration',
      description: payload.description,
      returnPath: payload.returnPath,
      idempotencyKey: dto.idempotencyKey,
      metadata: {
        eventId: event.id,
        eventTitle: event.title,
      },
    });

    this.eventEmitter.emit('event.payment.initiated', {
      eventId: event.id,
      userId,
      organizerId: event.organizerId,
      title: event.title,
      reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency,
      paymentMethod: transaction.paymentMethod,
    });

    return transaction;
  }

  async getAccessLink(eventId: string, userId: string): Promise<{ meetingUrl: string }> {
    const event = await this.findEventOrThrow(eventId);
    if (!event.meetingUrl) {
      throw new BadRequestException('Live event link is not available yet.');
    }

    const registration = await this.registrationRepo.findOne({ where: { eventId, userId } });
    if (!registration || registration.status === EventRegistrationStatus.CANCELLED) {
      throw new ForbiddenException('Register for this event to access the live event link.');
    }

    const canAccessLink = await this.canAccessMeetingLink(event, userId, registration.status);
    if (!canAccessLink) {
      throw new ForbiddenException('Complete payment first to access the live event link.');
    }

    return { meetingUrl: event.meetingUrl };
  }

  async cancel(eventId: string, userId: string): Promise<EventRegistration> {
    const registration = await this.registrationRepo.findOne({
      where: { eventId, userId },
    });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    if (registration.status === EventRegistrationStatus.CANCELLED) {
      return registration;
    }
    registration.status = EventRegistrationStatus.CANCELLED;
    await this.registrationRepo.save(registration);
    await this.eventRepo.decrement({ id: eventId }, 'registrationCount', 1);
    const saved = await this.findById(registration.id);
    const event = await this.eventRepo.findOne({ where: { id: eventId } });

    this.eventEmitter.emit('event.registration.cancelled', {
      eventId,
      userId,
      organizerId: event?.organizerId,
      title: event?.title,
    });

    return saved;
  }

  async markAttended(eventId: string, registrationId: string, actor: Actor): Promise<EventRegistration> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }
    if (event.organizerId !== actor.id && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(actor.role)) {
      throw new ForbiddenException('You do not have permission to mark attendance');
    }

    const registration = await this.registrationRepo.findOne({ where: { id: registrationId, eventId } });
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    registration.status = EventRegistrationStatus.ATTENDED;
    const saved = await this.registrationRepo.save(registration);

    this.eventEmitter.emit('event.attended', {
      eventId,
      userId: saved.userId,
      registrationId: saved.id,
      markedBy: actor.id,
    });

    return saved;
  }

  async listMine(userId: string): Promise<EventRegistration[]> {
    const registrations = await this.registrationRepo.find({
      where: { userId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      registrations.map(async (registration) => {
        if (!registration.event?.meetingUrl) {
          return registration;
        }

        const canAccess = await this.canAccessMeetingLink(
          registration.event,
          registration.userId,
          registration.status,
        );
        if (!canAccess) {
          registration.event.meetingUrl = null;
        }
        return registration;
      }),
    );
  }

  async findById(id: string): Promise<EventRegistration> {
    const registration = await this.registrationRepo.findOne({
      where: { id },
      relations: ['event', 'user'],
    });
    if (!registration) {
      throw new NotFoundException(`Registration with ID "${id}" not found`);
    }

    if (registration.event?.meetingUrl) {
      const canAccess = await this.canAccessMeetingLink(
        registration.event,
        registration.userId,
        registration.status,
      );
      if (!canAccess) {
        registration.event.meetingUrl = null;
      }
    }

    return registration;
  }

  private async findEventOrThrow(eventId: string): Promise<Event> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }
    return event;
  }

  private assertEventAcceptsRegistrations(event: Event): void {
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Only published events can accept registrations');
    }
    if (event.capacity !== null && event.registrationCount >= event.capacity) {
      throw new BadRequestException('Event is fully booked');
    }
  }

  private async hasSuccessfulEventPayment(userId: string, eventId: string): Promise<boolean> {
    const transaction = await this.transactionRepo
      .createQueryBuilder('txn')
      .where('txn.userId = :userId', { userId })
      .andWhere('txn.type = :type', { type: 'event_registration' })
      .andWhere('txn.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere("txn.metadata ->> 'eventId' = :eventId", { eventId })
      .orderBy('txn.createdAt', 'DESC')
      .getOne();

    return !!transaction;
  }

  private async canAccessMeetingLink(
    event: Event,
    userId: string,
    registrationStatus: EventRegistrationStatus,
  ): Promise<boolean> {
    if (!event.meetingUrl) {
      return false;
    }

    if (registrationStatus === EventRegistrationStatus.CANCELLED) {
      return false;
    }

    const eventPrice = Number(event.price || 0);
    if (eventPrice <= 0) {
      return true;
    }

    return this.hasSuccessfulEventPayment(userId, event.id);
  }
}
