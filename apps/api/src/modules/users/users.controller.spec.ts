import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole, UserStatus } from './entities';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findById: jest.fn(),
    findByIdWithProfile: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateProfile: jest.fn(),
    adminUpdate: jest.fn(),
    delete: jest.fn(),
    updateAvatar: jest.fn(),
    getCountByRole: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.MEMBER,
    status: UserStatus.ACTIVE,
  };

  const mockProfile = {
    userId: 'test-user-id',
    bio: 'Test bio',
    headline: 'Coach',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        Reflector,
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /users/me', () => {
    it('should return current user with profile', async () => {
      mockUsersService.findByIdWithProfile.mockResolvedValueOnce({
        ...mockUser,
        profile: mockProfile,
      });

      const result = await controller.getCurrentUser('test-user-id');

      expect(usersService.findByIdWithProfile).toHaveBeenCalledWith('test-user-id');
      expect(result).toHaveProperty('profile');
    });
  });

  describe('PUT /users/me', () => {
    it('should update current user', async () => {
      const dto = { firstName: 'Updated' };
      mockUsersService.update.mockResolvedValueOnce({ ...mockUser, ...dto });

      const result = await controller.updateCurrentUser('test-user-id', dto);

      expect(usersService.update).toHaveBeenCalledWith('test-user-id', dto);
      expect(result.firstName).toBe('Updated');
    });
  });

  describe('PUT /users/me/profile', () => {
    it('should update current user profile', async () => {
      const dto = { bio: 'New bio' };
      mockUsersService.updateProfile.mockResolvedValueOnce({ ...mockProfile, ...dto });

      const result = await controller.updateCurrentUserProfile('test-user-id', dto);

      expect(usersService.updateProfile).toHaveBeenCalledWith('test-user-id', dto);
      expect(result.bio).toBe('New bio');
    });
  });

  describe('POST /users/me/avatar', () => {
    it('should upload avatar and return URL', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1000,
      } as unknown as Express.Multer.File;

      const result = await controller.uploadAvatar('test-user-id', mockFile);

      expect(usersService.updateAvatar).toHaveBeenCalled();
      expect(result).toHaveProperty('avatarUrl');
    });
  });

  describe('GET /users (Admin)', () => {
    it('should return paginated users list', async () => {
      const mockPaginatedResult = {
        data: [mockUser],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      mockUsersService.findAll.mockResolvedValueOnce(mockPaginatedResult);

      const result = await controller.findAll({ page: 1, limit: 20 });

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.meta).toBeDefined();
    });

    it('should filter by role', async () => {
      const query = { role: UserRole.COACH };
      mockUsersService.findAll.mockResolvedValueOnce({ data: [], meta: {} });

      await controller.findAll(query);

      expect(usersService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.COACH }),
      );
    });
  });

  describe('POST /users (Admin)', () => {
    it('should create a new user', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'Password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };
      mockUsersService.create.mockResolvedValueOnce({ ...dto, id: 'new-id' });

      const result = await controller.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('new-id');
    });
  });

  describe('GET /users/stats (Admin)', () => {
    it('should return user stats by role', async () => {
      const mockStats = {
        [UserRole.MEMBER]: 100,
        [UserRole.COACH]: 10,
        [UserRole.ADMIN]: 2,
      };
      mockUsersService.getCountByRole.mockResolvedValueOnce(mockStats);

      const result = await controller.getStats();

      expect(usersService.getCountByRole).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('GET /users/:id (Admin)', () => {
    it('should return user by ID with profile', async () => {
      mockUsersService.findByIdWithProfile.mockResolvedValueOnce({
        ...mockUser,
        profile: mockProfile,
      });

      const result = await controller.findById('test-user-id');

      expect(usersService.findByIdWithProfile).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('PATCH /users/:id (Admin)', () => {
    it('should update user as admin', async () => {
      const dto = { role: UserRole.COACH };
      mockUsersService.adminUpdate.mockResolvedValueOnce({ ...mockUser, ...dto });

      const result = await controller.adminUpdate('test-user-id', dto);

      expect(usersService.adminUpdate).toHaveBeenCalledWith('test-user-id', dto);
      expect(result.role).toBe(UserRole.COACH);
    });
  });

  describe('DELETE /users/:id (Admin)', () => {
    it('should delete user', async () => {
      mockUsersService.delete.mockResolvedValueOnce(undefined);

      await controller.delete('test-user-id');

      expect(usersService.delete).toHaveBeenCalledWith('test-user-id');
    });
  });
});
