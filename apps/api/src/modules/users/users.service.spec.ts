import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole, UserStatus, UserProfile } from './entities';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let profileRepository: Repository<UserProfile>;
  let eventEmitter: EventEmitter2;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockUser: Partial<User> = {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.MEMBER,
    status: UserStatus.ACTIVE,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(UserProfile), useValue: mockProfileRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    profileRepository = module.get<Repository<UserProfile>>(getRepositoryToken(UserProfile));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      const result = await service.findById('test-user-id');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-user-id', deletedAt: expect.any(Object) },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should return null when not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should normalize email to lowercase', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      await service.findByEmail('TEST@EXAMPLE.COM');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com', deletedAt: expect.any(Object) },
      });
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'Password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(null); // No existing user
      mockUserRepository.create.mockReturnValueOnce({ ...dto, id: 'new-id' });
      mockUserRepository.save.mockResolvedValueOnce({ ...dto, id: 'new-id' });
      mockProfileRepository.create.mockReturnValueOnce({ userId: 'new-id' });
      mockProfileRepository.save.mockResolvedValueOnce({ userId: 'new-id' });

      const result = await service.create(dto);

      expect(result.id).toBe('new-id');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.created',
        expect.objectContaining({ userId: 'new-id' }),
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto = {
        email: 'existing@example.com',
        password: 'Password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser); // Existing user

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const dto = { firstName: 'Updated' };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepository.save.mockResolvedValueOnce({ ...mockUser, ...dto });

      const result = await service.update('test-user-id', dto);

      expect(result.firstName).toBe('Updated');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.updated',
        expect.objectContaining({ userId: 'test-user-id' }),
      );
    });
  });

  describe('updateProfile', () => {
    it('should update existing profile', async () => {
      const mockProfile = { userId: 'test-user-id', bio: 'Old bio' };
      const dto = { bio: 'New bio' };

      mockProfileRepository.findOne.mockResolvedValueOnce(mockProfile);
      mockProfileRepository.save.mockResolvedValueOnce({ ...mockProfile, ...dto });

      const result = await service.updateProfile('test-user-id', dto);

      expect(result.bio).toBe('New bio');
    });

    it('should create profile if it does not exist', async () => {
      const dto = { bio: 'New bio' };

      mockProfileRepository.findOne.mockResolvedValueOnce(null);
      mockProfileRepository.create.mockReturnValueOnce({ userId: 'test-user-id' });
      mockProfileRepository.save.mockResolvedValueOnce({ userId: 'test-user-id', bio: 'New bio' });

      const result = await service.updateProfile('test-user-id', dto);

      expect(mockProfileRepository.create).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepository.save.mockResolvedValueOnce({
        ...mockUser,
        deletedAt: new Date(),
        status: UserStatus.DEACTIVATED,
      });

      await service.delete('test-user-id');

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: UserStatus.DEACTIVATED,
        }),
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.deleted',
        expect.objectContaining({ userId: 'test-user-id' }),
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email and activate user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      mockUserRepository.save.mockResolvedValueOnce({
        ...mockUser,
        emailVerified: true,
        status: UserStatus.ACTIVE,
      });

      await service.verifyEmail('test-user-id');

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          emailVerified: true,
          status: UserStatus.ACTIVE,
          emailVerificationToken: null,
        }),
      );
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login info', async () => {
      await service.updateLastLogin('test-user-id', '192.168.1.1');

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          lastLoginIp: '192.168.1.1',
          failedLoginAttempts: 0,
          lockedUntil: null,
        }),
      );
    });
  });

  describe('incrementFailedAttempts', () => {
    it('should lock account after 5 failed attempts', async () => {
      const userWith4Attempts = { ...mockUser, failedLoginAttempts: 4 };
      mockUserRepository.findOne.mockResolvedValueOnce(userWith4Attempts);
      mockUserRepository.save.mockResolvedValueOnce({
        ...userWith4Attempts,
        failedLoginAttempts: 5,
        lockedUntil: expect.any(Date),
      });

      await service.incrementFailedAttempts('test-user-id');

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          failedLoginAttempts: 5,
        }),
      );
    });
  });
});
