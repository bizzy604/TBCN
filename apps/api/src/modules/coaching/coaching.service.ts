import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@tbcn/shared';
import {
  PaginatedResult,
  createPaginatedResult,
  createPaginationMeta,
} from '../../common/dto';
import { User } from '../users/entities/user.entity';
import { CoachProfile } from './entities/coach-profile.entity';
import { CoachingSession } from './entities/coaching-session.entity';
import { SessionFeedback } from './entities/session-feedback.entity';
import { UpsertCoachProfileDto } from './dto/coach-profile.dto';

export interface CoachQuery {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class CoachingService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(CoachProfile)
    private readonly profileRepo: Repository<CoachProfile>,
    @InjectRepository(CoachingSession)
    private readonly sessionRepo: Repository<CoachingSession>,
    @InjectRepository(SessionFeedback)
    private readonly feedbackRepo: Repository<SessionFeedback>,
  ) {}

  async listCoaches(query: CoachQuery): Promise<PaginatedResult<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.COACH });

    if (query.search) {
      qb.andWhere(
        `(LOWER(user.firstName) LIKE LOWER(:search)
          OR LOWER(user.lastName) LIKE LOWER(:search)
          OR LOWER(user.email) LIKE LOWER(:search))`,
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('user.created_at', 'DESC').skip((page - 1) * limit).take(limit);

    const [users, total] = await qb.getManyAndCount();
    const coaches = await this.buildCoachViewBatch(users);

    return createPaginatedResult(coaches, createPaginationMeta(page, limit, total));
  }

  async getCoachById(coachId: string) {
    const user = await this.userRepo.findOne({ where: { id: coachId } });
    if (!user || user.role !== UserRole.COACH) {
      throw new NotFoundException(`Coach with ID "${coachId}" not found`);
    }

    return this.buildCoachView(coachId, user);
  }

  async upsertProfile(actorId: string, actorRole: UserRole, dto: UpsertCoachProfileDto) {
    if (actorRole !== UserRole.COACH && actorRole !== UserRole.ADMIN && actorRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only coaches and admins can manage coach profiles');
    }

    const user = await this.userRepo.findOne({ where: { id: actorId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${actorId}" not found`);
    }

    if (actorRole === UserRole.COACH && user.role !== UserRole.COACH) {
      throw new ForbiddenException('Only users with coach role can create coaching profiles');
    }

    const profile = await this.profileRepo.findOne({ where: { userId: actorId } });
    const payload: Partial<CoachProfile> = {
      userId: actorId,
      tagline: dto.tagline ?? profile?.tagline ?? null,
      bio: dto.bio ?? profile?.bio ?? null,
      specialties: dto.specialties ?? profile?.specialties ?? [],
      hourlyRate: dto.hourlyRate ?? profile?.hourlyRate ?? 0,
      currency: dto.currency ?? profile?.currency ?? 'USD',
      yearsExperience: dto.yearsExperience ?? profile?.yearsExperience ?? 0,
      languages: dto.languages ?? profile?.languages ?? [],
      isActive: true,
    };

    if (!profile) {
      const created = this.profileRepo.create(payload);
      await this.profileRepo.save(created);
    } else {
      await this.profileRepo.update(profile.id, payload);
    }

    return this.getCoachById(actorId);
  }

  private async buildCoachViewBatch(users: User[]) {
    if (users.length === 0) return [];

    const coachIds = users.map((u) => u.id);

    const [profiles, sessionCounts, ratingRows] = await Promise.all([
      this.profileRepo.find({ where: coachIds.map((id) => ({ userId: id })) }),

      this.sessionRepo
        .createQueryBuilder('s')
        .select('s.coach_id', 'coachId')
        .addSelect('COUNT(s.id)', 'count')
        .where('s.coach_id IN (:...ids)', { ids: coachIds })
        .groupBy('s.coach_id')
        .getRawMany<{ coachId: string; count: string }>(),

      this.feedbackRepo
        .createQueryBuilder('fb')
        .innerJoin('fb.session', 'session')
        .select('session.coach_id', 'coachId')
        .addSelect('COALESCE(AVG(fb.rating), 0)', 'avg')
        .addSelect('COUNT(fb.id)', 'count')
        .where('session.coach_id IN (:...ids)', { ids: coachIds })
        .groupBy('session.coach_id')
        .getRawMany<{ coachId: string; avg: string; count: string }>(),
    ]);

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    const sessionMap = new Map(sessionCounts.map((r) => [r.coachId, Number(r.count)]));
    const ratingMap = new Map(ratingRows.map((r) => [r.coachId, r]));

    return users.map((u) => {
      const profile = profileMap.get(u.id);
      const rating = ratingMap.get(u.id);
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        fullName: u.fullName,
        email: u.email,
        avatarUrl: u.avatarUrl,
        tagline: profile?.tagline ?? null,
        bio: profile?.bio ?? null,
        hourlyRate: Number(profile?.hourlyRate ?? 0),
        currency: profile?.currency ?? 'USD',
        yearsExperience: profile?.yearsExperience ?? 0,
        specialties: (profile?.specialties ?? []).filter(Boolean),
        languages: (profile?.languages ?? []).filter(Boolean),
        stats: {
          totalSessions: sessionMap.get(u.id) ?? 0,
          averageRating: Number(rating?.avg ?? 0),
          reviewCount: Number(rating?.count ?? 0),
        },
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    });
  }

  private async buildCoachView(coachId: string, user?: User) {
    const coachUser = user ?? await this.userRepo.findOne({ where: { id: coachId } });
    if (!coachUser) {
      throw new NotFoundException(`Coach with ID "${coachId}" not found`);
    }

    const profile = await this.profileRepo.findOne({ where: { userId: coachId } });
    const sessionCount = await this.sessionRepo.count({ where: { coachId } });

    const ratingAgg = await this.feedbackRepo
      .createQueryBuilder('feedback')
      .innerJoin('feedback.session', 'session')
      .select('COALESCE(AVG(feedback.rating), 0)', 'avg')
      .addSelect('COUNT(feedback.id)', 'count')
      .where('session.coach_id = :coachId', { coachId })
      .getRawOne<{ avg: string; count: string }>();

    return {
      id: coachUser.id,
      firstName: coachUser.firstName,
      lastName: coachUser.lastName,
      fullName: coachUser.fullName,
      email: coachUser.email,
      avatarUrl: coachUser.avatarUrl,
      tagline: profile?.tagline ?? null,
      bio: profile?.bio ?? null,
      hourlyRate: Number(profile?.hourlyRate ?? 0),
      currency: profile?.currency ?? 'USD',
      yearsExperience: profile?.yearsExperience ?? 0,
      specialties: (profile?.specialties ?? []).filter(Boolean),
      languages: (profile?.languages ?? []).filter(Boolean),
      stats: {
        totalSessions: sessionCount,
        averageRating: Number(ratingAgg?.avg ?? 0),
        reviewCount: Number(ratingAgg?.count ?? 0),
      },
      createdAt: coachUser.createdAt,
      updatedAt: coachUser.updatedAt,
    };
  }
}
