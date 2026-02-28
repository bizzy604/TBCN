import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { UserRole } from '@tbcn/shared';
import {
  PaginatedResult,
  createPaginatedResult,
  createPaginationMeta,
} from '../../common/dto';
import { User } from '../users/entities/user.entity';
import { CoachingSession } from './entities/coaching-session.entity';
import { SessionFeedback } from './entities/session-feedback.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionFeedbackDto } from './dto/session-feedback.dto';
import { UpdateSessionAction, UpdateSessionDto } from './dto/update-session.dto';
import { SessionStatus, SessionType } from './enums/session-status.enum';

interface SessionActor {
  id: string;
  role: UserRole;
}

interface SessionQuery {
  page?: number;
  limit?: number;
  role?: 'coach' | 'mentee';
  status?: SessionStatus;
  upcoming?: boolean;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(CoachingSession)
    private readonly sessionRepo: Repository<CoachingSession>,
    @InjectRepository(SessionFeedback)
    private readonly feedbackRepo: Repository<SessionFeedback>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async bookSession(menteeId: string, dto: CreateSessionDto): Promise<CoachingSession> {
    const coach = await this.userRepo.findOne({ where: { id: dto.coachId } });
    if (!coach || coach.role !== UserRole.COACH) {
      throw new NotFoundException(`Coach with ID "${dto.coachId}" not found`);
    }
    if (dto.coachId === menteeId) {
      throw new BadRequestException('You cannot book a coaching session with yourself');
    }

    const scheduledAt = new Date(dto.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid scheduledAt date');
    }
    if (scheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException('Session must be booked for a future time');
    }

    const endAt = new Date(scheduledAt.getTime() + dto.durationMinutes * 60_000);
    await this.assertNoConflicts(dto.coachId, scheduledAt, endAt);

    const session = this.sessionRepo.create({
      coachId: dto.coachId,
      menteeId,
      scheduledAt,
      durationMinutes: dto.durationMinutes,
      sessionType: dto.sessionType ?? SessionType.ONE_ON_ONE,
      topic: dto.topic,
      notes: dto.notes ?? null,
      timezone: dto.timezone ?? 'UTC',
      meetingLink: null,
      status: SessionStatus.SCHEDULED,
    });
    await this.sessionRepo.save(session);
    return this.findById(session.id, { id: menteeId, role: UserRole.MEMBER });
  }

  async listSessions(actor: SessionActor, query: SessionQuery): Promise<PaginatedResult<CoachingSession>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const asCoach = query.role === 'coach';

    if (asCoach && ![UserRole.COACH, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(actor.role)) {
      throw new ForbiddenException('Only coaches can list sessions in coach mode');
    }

    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.coach', 'coach')
      .leftJoinAndSelect('session.mentee', 'mentee')
      .leftJoinAndSelect('session.feedback', 'feedback')
      .orderBy('session.scheduledAt', 'DESC');

    if (asCoach) {
      qb.where('session.coachId = :actorId', { actorId: actor.id });
    } else {
      qb.where('session.menteeId = :actorId', { actorId: actor.id });
    }

    if (query.status) {
      qb.andWhere('session.status = :status', { status: query.status });
    }

    if (query.upcoming) {
      qb.andWhere('session.scheduledAt >= :now', { now: new Date() });
      qb.andWhere('session.status = :scheduled', { scheduled: SessionStatus.SCHEDULED });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return createPaginatedResult(items, createPaginationMeta(page, limit, total));
  }

  async findById(id: string, actor: SessionActor): Promise<CoachingSession> {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['coach', 'mentee', 'feedback'],
    });
    if (!session) {
      throw new NotFoundException(`Session with ID "${id}" not found`);
    }
    this.assertCanAccessSession(session, actor);
    return session;
  }

  async updateSession(id: string, actor: SessionActor, dto: UpdateSessionDto): Promise<CoachingSession> {
    const session = await this.findById(id, actor);
    if (session.status !== SessionStatus.SCHEDULED && dto.action !== UpdateSessionAction.COMPLETE) {
      throw new BadRequestException('Only scheduled sessions can be modified');
    }

    if (dto.action === UpdateSessionAction.RESCHEDULE) {
      if (!dto.scheduledAt) {
        throw new BadRequestException('scheduledAt is required when rescheduling');
      }
      const scheduledAt = new Date(dto.scheduledAt);
      if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
        throw new BadRequestException('Rescheduled time must be a valid future date');
      }
      const endAt = new Date(scheduledAt.getTime() + session.durationMinutes * 60_000);
      await this.assertNoConflicts(session.coachId, scheduledAt, endAt, session.id);
      session.scheduledAt = scheduledAt;
      await this.sessionRepo.save(session);
      return this.findById(id, actor);
    }

    if (dto.action === UpdateSessionAction.CANCEL) {
      session.status = SessionStatus.CANCELLED;
      session.cancelledAt = new Date();
      session.cancellationReason = dto.cancellationReason ?? null;
      await this.sessionRepo.save(session);
      return this.findById(id, actor);
    }

    if (dto.action === UpdateSessionAction.COMPLETE) {
      if (session.coachId !== actor.id && !this.isPrivileged(actor.role)) {
        throw new ForbiddenException('Only coach or admin can mark a session complete');
      }
      session.status = SessionStatus.COMPLETED;
      session.completedAt = new Date();
      await this.sessionRepo.save(session);
      return this.findById(id, actor);
    }

    throw new BadRequestException('Invalid session update action');
  }

  async submitFeedback(sessionId: string, actor: SessionActor, dto: SessionFeedbackDto): Promise<SessionFeedback> {
    const session = await this.findById(sessionId, actor);
    if (session.menteeId !== actor.id && !this.isPrivileged(actor.role)) {
      throw new ForbiddenException('Only the mentee can submit session feedback');
    }
    if (session.status !== SessionStatus.COMPLETED) {
      throw new BadRequestException('Feedback can only be submitted after session completion');
    }

    const existing = await this.feedbackRepo.findOne({ where: { sessionId } });
    if (existing) {
      throw new ConflictException('Feedback already submitted for this session');
    }

    const feedback = this.feedbackRepo.create({
      sessionId,
      rating: dto.rating,
      wouldRecommend: dto.wouldRecommend ?? true,
      feedbackText: dto.feedbackText ?? null,
      highlights: dto.highlights ?? [],
      isPublic: dto.isPublic ?? true,
    });
    return this.feedbackRepo.save(feedback);
  }

  private async assertNoConflicts(
    coachId: string,
    startAt: Date,
    endAt: Date,
    excludeSessionId?: string,
  ): Promise<void> {
    const qb = this.sessionRepo
      .createQueryBuilder('session')
      .where('session.coachId = :coachId', { coachId })
      .andWhere('session.status = :status', { status: SessionStatus.SCHEDULED })
      .andWhere(new Brackets((expr) => {
        expr.where(':startAt < (session.scheduledAt + (session.durationMinutes * interval \'1 minute\'))', { startAt });
        expr.andWhere(':endAt > session.scheduledAt', { endAt });
      }));

    if (excludeSessionId) {
      qb.andWhere('session.id != :excludeSessionId', { excludeSessionId });
    }

    const conflict = await qb.getOne();
    if (conflict) {
      throw new ConflictException('This time slot is no longer available');
    }
  }

  private assertCanAccessSession(session: CoachingSession, actor: SessionActor): void {
    if (this.isPrivileged(actor.role)) {
      return;
    }
    if (session.coachId !== actor.id && session.menteeId !== actor.id) {
      throw new ForbiddenException('You do not have permission to access this session');
    }
  }

  private isPrivileged(role: UserRole): boolean {
    return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  }
}
