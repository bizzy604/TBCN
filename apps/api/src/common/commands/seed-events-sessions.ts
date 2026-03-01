import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../app.module';
import { User } from '../../modules/users/entities/user.entity';
import { CoachProfile } from '../../modules/coaching/entities/coach-profile.entity';
import { CoachAvailability } from '../../modules/coaching/entities/coach-availability.entity';
import { CoachingSession } from '../../modules/coaching/entities/coaching-session.entity';
import { SessionFeedback } from '../../modules/coaching/entities/session-feedback.entity';
import { SessionStatus, SessionType } from '../../modules/coaching/enums/session-status.enum';
import { Event } from '../../modules/events/entities/event.entity';
import { EventStatus } from '../../modules/events/enums/event-status.enum';
import { LocationType } from '../../modules/events/enums/location-type.enum';
import { UserRole, UserStatus } from '@tbcn/shared';

function addDays(base: Date, days: number, hour = 10, minute = 0): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function ensureDate(date: Date): Date {
  return new Date(date.toISOString());
}

async function resolveUser(
  userRepo: Repository<User>,
  role: UserRole,
  preferredEmail: string,
): Promise<User> {
  const byEmail = await userRepo.findOne({
    where: { email: preferredEmail.toLowerCase().trim() },
  });
  if (byEmail) {
    return byEmail;
  }

  const fallback = await userRepo.findOne({
    where: { role, status: UserStatus.ACTIVE },
    order: { createdAt: 'ASC' },
  });
  if (!fallback) {
    throw new Error(
      `No active user found for role=${role}. Run \"npm run seed:test-users\" first.`,
    );
  }
  return fallback;
}

async function upsertCoachProfile(
  profileRepo: Repository<CoachProfile>,
  userId: string,
  profile: Partial<CoachProfile>,
): Promise<void> {
  const existing = await profileRepo.findOne({ where: { userId } });
  if (!existing) {
    await profileRepo.save(
      profileRepo.create({
        userId,
        tagline: profile.tagline ?? 'Certified Brand Coach',
        bio: profile.bio ?? 'Experienced coach helping founders build strong brands.',
        specialties: profile.specialties ?? ['branding', 'positioning'],
        hourlyRate: profile.hourlyRate ?? 75,
        currency: profile.currency ?? 'KES',
        yearsExperience: profile.yearsExperience ?? 5,
        languages: profile.languages ?? ['English'],
        isActive: true,
      }),
    );
    return;
  }

  await profileRepo.update(existing.id, {
    tagline: profile.tagline ?? existing.tagline,
    bio: profile.bio ?? existing.bio,
    specialties: profile.specialties ?? existing.specialties,
    hourlyRate: profile.hourlyRate ?? existing.hourlyRate,
    currency: profile.currency ?? existing.currency,
    yearsExperience: profile.yearsExperience ?? existing.yearsExperience,
    languages: profile.languages ?? existing.languages,
    isActive: true,
  });
}

async function seedCoachAvailability(
  availabilityRepo: Repository<CoachAvailability>,
  coachId: string,
  timezone = 'Africa/Nairobi',
): Promise<void> {
  await availabilityRepo.delete({ coachId });
  const windows: Array<Partial<CoachAvailability>> = [];
  for (const dayOfWeek of [1, 2, 3, 4, 5]) {
    windows.push({
      coachId,
      dayOfWeek,
      startTime: '09:00',
      endTime: '12:00',
      timezone,
      isActive: true,
    });
    windows.push({
      coachId,
      dayOfWeek,
      startTime: '14:00',
      endTime: '17:00',
      timezone,
      isActive: true,
    });
  }
  await availabilityRepo.save(availabilityRepo.create(windows));
}

async function upsertEvent(
  eventRepo: Repository<Event>,
  seed: {
    title: string;
    organizerId: string;
    description: string;
    startAt: Date;
    endAt: Date;
    locationType: LocationType;
    location?: string | null;
    meetingUrl?: string | null;
    capacity?: number | null;
    price?: number;
    currency?: string;
    status: EventStatus;
  },
): Promise<'created' | 'updated'> {
  const existing = await eventRepo.findOne({
    where: { title: seed.title, organizerId: seed.organizerId },
  });

  if (!existing) {
    await eventRepo.save(
      eventRepo.create({
        ...seed,
        location: seed.location ?? null,
        meetingUrl: seed.meetingUrl ?? null,
        capacity: seed.capacity ?? null,
        price: seed.price ?? 0,
        currency: seed.currency ?? 'KES',
        bannerUrl: null,
        registrationCount: 0,
      }),
    );
    return 'created';
  }

  await eventRepo.update(existing.id, {
    description: seed.description,
    startAt: seed.startAt,
    endAt: seed.endAt,
    locationType: seed.locationType,
    location: seed.location ?? null,
    meetingUrl: seed.meetingUrl ?? null,
    capacity: seed.capacity ?? null,
    price: seed.price ?? 0,
    currency: seed.currency ?? 'KES',
    status: seed.status,
  });
  return 'updated';
}

async function upsertSession(
  sessionRepo: Repository<CoachingSession>,
  feedbackRepo: Repository<SessionFeedback>,
  seed: {
    topic: string;
    coachId: string;
    menteeId: string;
    scheduledAt: Date;
    durationMinutes: number;
    sessionType?: SessionType;
    notes?: string;
    timezone?: string;
    status: SessionStatus;
    completedAt?: Date | null;
    feedback?: {
      rating: number;
      feedbackText: string;
    };
  },
): Promise<'created' | 'updated'> {
  const existing = await sessionRepo.findOne({
    where: {
      topic: seed.topic,
      coachId: seed.coachId,
      menteeId: seed.menteeId,
    },
    relations: ['feedback'],
  });

  let session: CoachingSession;
  let action: 'created' | 'updated';

  if (!existing) {
    session = await sessionRepo.save(
      sessionRepo.create({
        coachId: seed.coachId,
        menteeId: seed.menteeId,
        scheduledAt: seed.scheduledAt,
        durationMinutes: seed.durationMinutes,
        sessionType: seed.sessionType ?? SessionType.ONE_ON_ONE,
        topic: seed.topic,
        notes: seed.notes ?? null,
        timezone: seed.timezone ?? 'Africa/Nairobi',
        meetingLink: 'https://meet.google.com/tbcn-demo-session',
        status: seed.status,
        completedAt: seed.completedAt ?? null,
      }),
    );
    action = 'created';
  } else {
    await sessionRepo.update(existing.id, {
      scheduledAt: seed.scheduledAt,
      durationMinutes: seed.durationMinutes,
      sessionType: seed.sessionType ?? existing.sessionType,
      notes: seed.notes ?? existing.notes,
      timezone: seed.timezone ?? existing.timezone,
      status: seed.status,
      completedAt: seed.completedAt ?? null,
      meetingLink: existing.meetingLink ?? 'https://meet.google.com/tbcn-demo-session',
    });
    session = await sessionRepo.findOneByOrFail({ id: existing.id });
    action = 'updated';
  }

  if (seed.feedback) {
    const existingFeedback = await feedbackRepo.findOne({ where: { sessionId: session.id } });
    if (!existingFeedback) {
      await feedbackRepo.save(
        feedbackRepo.create({
          sessionId: session.id,
          rating: seed.feedback.rating,
          feedbackText: seed.feedback.feedbackText,
          wouldRecommend: true,
          highlights: ['clarity', 'actionable insights'],
          isPublic: true,
        }),
      );
    } else {
      await feedbackRepo.update(existingFeedback.id, {
        rating: seed.feedback.rating,
        feedbackText: seed.feedback.feedbackText,
      });
    }
  }

  return action;
}

async function bootstrap() {
  console.log('\nTBCN events/sessions seeding started\n');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    const coachProfileRepo = app.get<Repository<CoachProfile>>(getRepositoryToken(CoachProfile));
    const coachAvailabilityRepo = app.get<Repository<CoachAvailability>>(
      getRepositoryToken(CoachAvailability),
    );
    const eventRepo = app.get<Repository<Event>>(getRepositoryToken(Event));
    const sessionRepo = app.get<Repository<CoachingSession>>(getRepositoryToken(CoachingSession));
    const feedbackRepo = app.get<Repository<SessionFeedback>>(getRepositoryToken(SessionFeedback));

    const coach = await resolveUser(
      userRepo,
      UserRole.COACH,
      process.env.SEED_COACH_EMAIL || 'coach@tbcn.local',
    );
    const mentor = await resolveUser(
      userRepo,
      UserRole.COACH,
      process.env.SEED_MENTOR_EMAIL || 'mentor@tbcn.local',
    );
    const member = await resolveUser(
      userRepo,
      UserRole.MEMBER,
      process.env.SEED_MEMBER_EMAIL || 'member@tbcn.local',
    );
    const partner = await resolveUser(
      userRepo,
      UserRole.PARTNER,
      process.env.SEED_PARTNER_EMAIL || 'partner@tbcn.local',
    );
    const admin = await resolveUser(
      userRepo,
      UserRole.ADMIN,
      process.env.SEED_ADMIN_EMAIL || 'admin@tbcn.local',
    );

    await upsertCoachProfile(coachProfileRepo, coach.id, {
      tagline: 'Brand Strategy Coach',
      bio: 'Helps founders clarify brand positioning and growth messaging.',
      specialties: ['brand strategy', 'positioning', 'content strategy'],
      hourlyRate: 120,
      currency: 'KES',
      yearsExperience: 8,
      languages: ['English', 'Swahili'],
    });
    await upsertCoachProfile(coachProfileRepo, mentor.id, {
      tagline: 'Business Growth Mentor',
      bio: 'Supports service businesses with offer design and customer retention.',
      specialties: ['offer design', 'retention', 'business systems'],
      hourlyRate: 95,
      currency: 'KES',
      yearsExperience: 6,
      languages: ['English'],
    });

    await seedCoachAvailability(coachAvailabilityRepo, coach.id);
    await seedCoachAvailability(coachAvailabilityRepo, mentor.id);

    const now = new Date();
    const events = [
      {
        title: '[Seed] Brand Positioning Masterclass',
        organizerId: coach.id,
        description:
          'Live workshop on how to define your positioning and communicate your unique value clearly.',
        startAt: ensureDate(addDays(now, 5, 17, 0)),
        endAt: ensureDate(addDays(now, 5, 19, 0)),
        locationType: LocationType.VIRTUAL,
        meetingUrl: 'https://meet.google.com/tbcn-brand-masterclass',
        capacity: 120,
        price: 0,
        currency: 'KES',
        status: EventStatus.PUBLISHED,
      },
      {
        title: '[Seed] Growth Coaching Roundtable',
        organizerId: admin.id,
        description:
          'Interactive group event for members and partners to discuss growth blockers and implementation strategy.',
        startAt: ensureDate(addDays(now, 9, 15, 30)),
        endAt: ensureDate(addDays(now, 9, 17, 0)),
        locationType: LocationType.HYBRID,
        location: 'Nairobi Garage, Westlands',
        meetingUrl: 'https://meet.google.com/tbcn-growth-roundtable',
        capacity: 80,
        price: 1500,
        currency: 'KES',
        status: EventStatus.PUBLISHED,
      },
      {
        title: '[Seed] Storytelling for Founders (Replay)',
        organizerId: mentor.id,
        description:
          'A completed event focused on storytelling frameworks for social posts and investor updates.',
        startAt: ensureDate(addDays(now, -14, 16, 0)),
        endAt: ensureDate(addDays(now, -14, 18, 0)),
        locationType: LocationType.VIRTUAL,
        meetingUrl: 'https://meet.google.com/tbcn-storytelling-replay',
        capacity: 100,
        price: 0,
        currency: 'KES',
        status: EventStatus.COMPLETED,
      },
    ];

    let createdEvents = 0;
    let updatedEvents = 0;
    for (const seedEvent of events) {
      const result = await upsertEvent(eventRepo, seedEvent);
      if (result === 'created') createdEvents += 1;
      if (result === 'updated') updatedEvents += 1;
    }

    const sessions = [
      {
        topic: '[Seed] Brand Foundation Strategy Session',
        coachId: coach.id,
        menteeId: member.id,
        scheduledAt: ensureDate(addDays(now, 2, 11, 0)),
        durationMinutes: 60,
        notes: 'Focus on positioning and messaging pillars.',
        status: SessionStatus.SCHEDULED,
      },
      {
        topic: '[Seed] Offer Optimization Session',
        coachId: mentor.id,
        menteeId: partner.id,
        scheduledAt: ensureDate(addDays(now, 4, 15, 0)),
        durationMinutes: 45,
        notes: 'Review pricing and offer stack.',
        status: SessionStatus.SCHEDULED,
      },
      {
        topic: '[Seed] Completed Growth Review',
        coachId: coach.id,
        menteeId: member.id,
        scheduledAt: ensureDate(addDays(now, -7, 14, 0)),
        durationMinutes: 60,
        notes: 'Monthly review and action plan follow-up.',
        status: SessionStatus.COMPLETED,
        completedAt: ensureDate(addDays(now, -7, 15, 0)),
        feedback: {
          rating: 5,
          feedbackText: 'Very practical session with clear next steps.',
        },
      },
    ];

    let createdSessions = 0;
    let updatedSessions = 0;
    for (const seedSession of sessions) {
      const result = await upsertSession(sessionRepo, feedbackRepo, seedSession);
      if (result === 'created') createdSessions += 1;
      if (result === 'updated') updatedSessions += 1;
    }

    console.log('Seed summary:');
    console.table([
      { item: 'Coach profiles', created_or_updated: 2 },
      { item: 'Coach availability windows', created_or_updated: 20 },
      { item: 'Events created', created_or_updated: createdEvents },
      { item: 'Events updated', created_or_updated: updatedEvents },
      { item: 'Sessions created', created_or_updated: createdSessions },
      { item: 'Sessions updated', created_or_updated: updatedSessions },
    ]);

    console.log('\nCompleted events/sessions seeding.\n');
  } finally {
    await Promise.race([
      app.close(),
      new Promise<void>((resolve) => setTimeout(resolve, 1500)),
    ]);
  }
}

bootstrap()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
