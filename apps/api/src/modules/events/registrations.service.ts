import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@tbcn/shared';
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
  ) {}

  async register(eventId: string, userId: string): Promise<EventRegistration> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Event with ID "${eventId}" not found`);
    }
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Only published events can accept registrations');
    }
    if (event.capacity !== null && event.registrationCount >= event.capacity) {
      throw new BadRequestException('Event is fully booked');
    }

    const existing = await this.registrationRepo.findOne({ where: { eventId, userId } });
    if (existing) {
      if (existing.status === EventRegistrationStatus.CANCELLED) {
        existing.status = EventRegistrationStatus.REGISTERED;
        await this.registrationRepo.save(existing);
        await this.eventRepo.increment({ id: eventId }, 'registrationCount', 1);
        return existing;
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
    return this.findById(registration.id);
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
    return this.findById(registration.id);
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
    return this.registrationRepo.save(registration);
  }

  async listMine(userId: string): Promise<EventRegistration[]> {
    return this.registrationRepo.find({
      where: { userId },
      relations: ['event'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<EventRegistration> {
    const registration = await this.registrationRepo.findOne({
      where: { id },
      relations: ['event', 'user'],
    });
    if (!registration) {
      throw new NotFoundException(`Registration with ID "${id}" not found`);
    }
    return registration;
  }
}
