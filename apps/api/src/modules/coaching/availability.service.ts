import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { UserRole } from '@tbcn/shared';
import { User } from '../users/entities/user.entity';
import { CoachAvailability } from './entities/coach-availability.entity';
import { CoachBlockedTime } from './entities/coach-blocked-time.entity';
import { CoachingSession } from './entities/coaching-session.entity';
import { SessionStatus } from './enums/session-status.enum';
import {
  AvailabilityQueryDto,
  SetAvailabilityDto,
} from './dto/availability.dto';

interface SlotView {
  startAt: string;
  endAt: string;
  isAvailable: boolean;
  reason?: string;
}

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(CoachAvailability)
    private readonly availabilityRepo: Repository<CoachAvailability>,
    @InjectRepository(CoachBlockedTime)
    private readonly blockedTimeRepo: Repository<CoachBlockedTime>,
    @InjectRepository(CoachingSession)
    private readonly sessionRepo: Repository<CoachingSession>,
  ) {}

  async setWeeklyAvailability(
    actorId: string,
    actorRole: UserRole,
    dto: SetAvailabilityDto,
  ) {
    if (actorRole !== UserRole.COACH && actorRole !== UserRole.ADMIN && actorRole !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('Only coaches and admins can set availability');
    }

    const user = await this.userRepo.findOne({ where: { id: actorId } });
    if (!user || user.role !== UserRole.COACH) {
      throw new NotFoundException('Coach not found');
    }

    for (const window of dto.windows) {
      if (window.endTime <= window.startTime) {
        throw new BadRequestException('Each availability window must have endTime after startTime');
      }
    }

    await this.availabilityRepo.delete({ coachId: actorId });
    const records = dto.windows.map((window) => this.availabilityRepo.create({
      coachId: actorId,
      dayOfWeek: window.dayOfWeek,
      startTime: window.startTime,
      endTime: window.endTime,
      timezone: window.timezone ?? user.timezone ?? 'UTC',
      isActive: window.isActive ?? true,
    }));
    await this.availabilityRepo.save(records);

    return this.availabilityRepo.find({
      where: { coachId: actorId },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async getCoachAvailability(coachId: string, query: AvailabilityQueryDto) {
    const coach = await this.userRepo.findOne({ where: { id: coachId } });
    if (!coach || coach.role !== UserRole.COACH) {
      throw new NotFoundException(`Coach with ID "${coachId}" not found`);
    }

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    if (endDate < startDate) {
      throw new BadRequestException('endDate must be on or after startDate');
    }

    const maxRangeDays = 30;
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000);
    if (daysDiff > maxRangeDays) {
      throw new BadRequestException(`Date range cannot exceed ${maxRangeDays} days`);
    }

    const durationMinutes = query.durationMinutes ?? 60;

    const windows = await this.availabilityRepo.find({
      where: { coachId, isActive: true },
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });

    const blocked = await this.blockedTimeRepo.find({
      where: {
        coachId,
        startAt: Between(startDate, endDate),
      },
    });

    const sessions = await this.sessionRepo.find({
      where: {
        coachId,
        status: In([SessionStatus.SCHEDULED]),
        scheduledAt: Between(
          new Date(startDate.getTime() - 24 * 60 * 60 * 1000),
          new Date(endDate.getTime() + 24 * 60 * 60 * 1000),
        ),
      },
    });

    const availability = [];
    const cursor = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
      0, 0, 0, 0,
    ));
    const endCursor = new Date(Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate(),
      0, 0, 0, 0,
    ));

    while (cursor <= endCursor) {
      const dayWindows = windows.filter((w) => w.dayOfWeek === cursor.getUTCDay());
      const slots: SlotView[] = [];

      for (const window of dayWindows) {
        slots.push(...this.expandSlots(cursor, window.startTime, window.endTime, durationMinutes, sessions, blocked));
      }

      availability.push({
        date: cursor.toISOString().slice(0, 10),
        slots,
      });

      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return {
      coachId,
      timezone: coach.timezone ?? 'UTC',
      availability,
    };
  }

  private expandSlots(
    date: Date,
    startTime: string,
    endTime: string,
    durationMinutes: number,
    sessions: CoachingSession[],
    blocked: CoachBlockedTime[],
  ): SlotView[] {
    const slots: SlotView[] = [];
    const [startHour, startMinute] = startTime.split(':').map((v) => parseInt(v, 10));
    const [endHour, endMinute] = endTime.split(':').map((v) => parseInt(v, 10));
    const dayStart = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      startHour,
      startMinute,
      0,
      0,
    ));
    const dayEnd = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      endHour,
      endMinute,
      0,
      0,
    ));

    let cursor = new Date(dayStart);
    while (cursor.getTime() + durationMinutes * 60_000 <= dayEnd.getTime()) {
      const slotEnd = new Date(cursor.getTime() + durationMinutes * 60_000);
      let reason: string | undefined;
      let isAvailable = true;

      if (this.overlapsWithSessions(cursor, slotEnd, sessions)) {
        isAvailable = false;
        reason = 'booked';
      } else if (this.overlapsWithBlockedTime(cursor, slotEnd, blocked)) {
        isAvailable = false;
        reason = 'blocked';
      } else if (cursor.getTime() <= Date.now()) {
        isAvailable = false;
        reason = 'past';
      }

      slots.push({
        startAt: cursor.toISOString(),
        endAt: slotEnd.toISOString(),
        isAvailable,
        ...(reason ? { reason } : {}),
      });

      cursor = new Date(cursor.getTime() + durationMinutes * 60_000);
    }

    return slots;
  }

  private overlapsWithSessions(startAt: Date, endAt: Date, sessions: CoachingSession[]): boolean {
    return sessions.some((session) => {
      const sessionStart = new Date(session.scheduledAt);
      const sessionEnd = new Date(sessionStart.getTime() + session.durationMinutes * 60_000);
      return startAt < sessionEnd && endAt > sessionStart;
    });
  }

  private overlapsWithBlockedTime(startAt: Date, endAt: Date, blocked: CoachBlockedTime[]): boolean {
    return blocked.some((entry) => startAt < new Date(entry.endAt) && endAt > new Date(entry.startAt));
  }
}
