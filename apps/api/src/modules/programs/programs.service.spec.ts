import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProgramStatus, UserRole } from '@tbcn/shared';
import { ProgramsService } from './programs.service';
import { ProgramsRepository } from './programs.repository';

describe('ProgramsService', () => {
  let service: ProgramsService;

  const mockRepository = {
    createProgram: jest.fn(),
    findProgramById: jest.fn(),
    findProgramBySlug: jest.fn(),
    findPrograms: jest.fn(),
    updateProgram: jest.fn(),
    deleteProgram: jest.fn(),
    createModule: jest.fn(),
    findModulesByProgramId: jest.fn(),
    findModuleById: jest.fn(),
    updateModule: jest.fn(),
    deleteModule: jest.fn(),
    createLesson: jest.fn(),
    findLessonsByModuleId: jest.fn(),
    findLessonById: jest.fn(),
    updateLesson: jest.fn(),
    deleteLesson: jest.fn(),
    countLessonsByProgramId: jest.fn(),
    incrementEnrollmentCount: jest.fn(),
    decrementEnrollmentCount: jest.fn(),
    getProgramStats: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramsService,
        { provide: ProgramsRepository, useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ProgramsService>(ProgramsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a program and emit created event', async () => {
      mockRepository.createProgram.mockResolvedValueOnce({ id: 'program-1' });
      mockRepository.findProgramById.mockResolvedValueOnce({
        id: 'program-1',
        title: 'Program',
        description: 'Program description',
        status: ProgramStatus.DRAFT,
        instructorId: 'coach-1',
        modules: [],
      });

      const result = await service.create(
        {
          title: 'Program',
          description: 'Program description',
        },
        'coach-1',
      );

      expect(mockRepository.createProgram).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Program',
          instructorId: 'coach-1',
        }),
      );
      expect(result.id).toBe('program-1');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'program.created',
        expect.objectContaining({
          program: expect.objectContaining({ id: 'program-1' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException when program does not exist', async () => {
      mockRepository.findProgramById.mockResolvedValueOnce(null);

      await expect(service.findById('missing-program')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException when requester is not owner', async () => {
      mockRepository.findProgramById.mockResolvedValueOnce({
        id: 'program-1',
        title: 'Program',
        description: 'Program description',
        status: ProgramStatus.DRAFT,
        instructorId: 'owner-1',
        modules: [],
      });

      await expect(
        service.update('program-1', { title: 'Updated' }, { id: 'other-user', role: UserRole.COACH }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should require at least one lesson before publishing', async () => {
      mockRepository.findProgramById.mockResolvedValueOnce({
        id: 'program-1',
        title: 'Program',
        description: 'Program description',
        status: ProgramStatus.DRAFT,
        instructorId: 'coach-1',
        modules: [],
      });
      mockRepository.countLessonsByProgramId.mockResolvedValueOnce(0);

      await expect(
        service.update(
          'program-1',
          { status: ProgramStatus.PUBLISHED },
          { id: 'coach-1', role: UserRole.COACH },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
