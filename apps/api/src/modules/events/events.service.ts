import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@tbcn/shared';
import {
  PaginatedResult,
  createPaginatedResult,
  createPaginationMeta,
} from '../../common/dto';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventQueryDto } from './dto/event-query.dto';
import { EventStatus } from './enums/event-status.enum';

interface Actor {
  id: string;
  role: UserRole;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  async list(query: EventQueryDto): Promise<PaginatedResult<Event>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const qb = this.eventRepo
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .orderBy('event.startAt', 'ASC');

    if (query.search) {
      qb.andWhere('(LOWER(event.title) LIKE LOWER(:search) OR LOWER(event.description) LIKE LOWER(:search))', {
        search: `%${query.search}%`,
      });
    }
    if (query.status) {
      qb.andWhere('event.status = :status', { status: query.status });
    } else {
      qb.andWhere('event.status IN (:...statuses)', { statuses: [EventStatus.PUBLISHED, EventStatus.COMPLETED] });
    }
    if (query.upcoming) {
      qb.andWhere('event.startAt >= :now', { now: new Date() });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return createPaginatedResult(items, createPaginationMeta(page, limit, total));
  }

  async findById(id: string): Promise<Event> {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['organizer'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }
    return event;
  }

  async create(actor: Actor, dto: CreateEventDto): Promise<Event> {
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH].includes(actor.role)) {
      throw new ForbiddenException('Only admins and coaches can create events');
    }
    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    if (endAt <= startAt) {
      throw new ForbiddenException('Event end time must be after start time');
    }

    const event = this.eventRepo.create({
      organizerId: actor.id,
      title: dto.title,
      description: dto.description,
      startAt,
      endAt,
      locationType: dto.locationType,
      location: dto.location ?? null,
      meetingUrl: dto.meetingUrl ?? null,
      capacity: dto.capacity ?? null,
      price: dto.price ?? 0,
      currency: dto.currency ?? 'USD',
      bannerUrl: dto.bannerUrl ?? null,
      status: dto.status ?? EventStatus.DRAFT,
    });
    return this.eventRepo.save(event);
  }

  async update(id: string, actor: Actor, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findById(id);
    if (event.organizerId !== actor.id && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(actor.role)) {
      throw new ForbiddenException('You do not have permission to modify this event');
    }
    const payload: Partial<Event> = {
      ...dto,
      startAt: dto.startAt ? new Date(dto.startAt) : event.startAt,
      endAt: dto.endAt ? new Date(dto.endAt) : event.endAt,
    };
    await this.eventRepo.update(id, payload);
    return this.findById(id);
  }

  async remove(id: string, actor: Actor): Promise<void> {
    const event = await this.findById(id);
    if (event.organizerId !== actor.id && ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(actor.role)) {
      throw new ForbiddenException('You do not have permission to delete this event');
    }
    await this.eventRepo.delete(id);
  }
}
