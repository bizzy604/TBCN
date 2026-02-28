import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRole } from '@tbcn/shared';
import { Repository } from 'typeorm';
import { SessionsService } from './sessions.service';
import { CoachingSession } from './entities/coaching-session.entity';
import { SessionFeedback } from './entities/session-feedback.entity';
import { User } from '../users/entities/user.entity';
import { SessionStatus } from './enums/session-status.enum';
import { UpdateSessionAction } from './dto/update-session.dto';

const createQbMock = () => {
  const qb: any = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getOne: jest.fn(),
  };
  return qb;
};

describe('SessionsService', () => {
  let service: SessionsService;
  let sessionRepo: jest.Mocked<Repository<CoachingSession>>;
  let feedbackRepo: jest.Mocked<Repository<SessionFeedback>>;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(CoachingSession),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SessionFeedback),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    sessionRepo = module.get(getRepositoryToken(CoachingSession));
    feedbackRepo = module.get(getRepositoryToken(SessionFeedback));
    userRepo = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bookSession', () => {
    it('should throw when booking in the past', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'coach-1',
        role: UserRole.COACH,
      } as User);

      await expect(
        service.bookSession('mentee-1', {
          coachId: 'coach-1',
          topic: 'Career growth',
          durationMinutes: 60,
          scheduledAt: '2020-01-01T00:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw conflict when slot overlaps an existing booking', async () => {
      userRepo.findOne.mockResolvedValue({
        id: 'coach-1',
        role: UserRole.COACH,
      } as User);
      const qb = createQbMock();
      qb.getOne.mockResolvedValue({ id: 'existing-1' });
      sessionRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.bookSession('mentee-1', {
          coachId: 'coach-1',
          topic: 'Career growth',
          durationMinutes: 60,
          scheduledAt: '2099-01-01T10:00:00.000Z',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateSession', () => {
    it('should reject completion by non-coach participant', async () => {
      sessionRepo.findOne.mockResolvedValue({
        id: 'session-1',
        coachId: 'coach-1',
        menteeId: 'mentee-1',
        status: SessionStatus.SCHEDULED,
      } as CoachingSession);

      await expect(
        service.updateSession(
          'session-1',
          { id: 'mentee-1', role: UserRole.MEMBER },
          { action: UpdateSessionAction.COMPLETE },
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('submitFeedback', () => {
    it('should reject feedback for non-completed sessions', async () => {
      sessionRepo.findOne.mockResolvedValue({
        id: 'session-1',
        coachId: 'coach-1',
        menteeId: 'mentee-1',
        status: SessionStatus.SCHEDULED,
      } as CoachingSession);

      await expect(
        service.submitFeedback(
          'session-1',
          { id: 'mentee-1', role: UserRole.MEMBER },
          { rating: 5 },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});

