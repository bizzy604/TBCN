import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, IsNull } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User, UserRole, UserStatus, UserProfile } from './entities';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  AdminUpdateUserDto,
  UserQueryDto,
} from './dto/user.dto';

// Domain events
export const USER_EVENTS = {
  CREATED: 'user.created',
  UPDATED: 'user.updated',
  DELETED: 'user.deleted',
  ROLE_CHANGED: 'user.role.changed',
  STATUS_CHANGED: 'user.status.changed',
};

/**
 * Users Service
 * Handles all user-related business logic
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ============================================
  // Query Methods
  // ============================================

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase().trim(), deletedAt: IsNull() },
    });
  }

  /**
   * Find user by email including password (for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: email.toLowerCase().trim() })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }

  /**
   * Find all users with pagination and filtering
   */
  async findAll(query: UserQueryDto) {
    const { search, role, status, page = 1, limit = 20 } = query;

    const where: FindOptionsWhere<User> = { deletedAt: IsNull() };

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    const queryBuilder = this.userRepository.createQueryBuilder('user');
    queryBuilder.where('user.deletedAt IS NULL');

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user with profile
   */
  async findByIdWithProfile(id: string): Promise<User & { profile: UserProfile }> {
    const user = await this.findById(id);
    const profile = await this.profileRepository.findOne({
      where: { userId: id },
    });

    return { ...user, profile: profile || null } as User & { profile: UserProfile };
  }

  // ============================================
  // Mutation Methods
  // ============================================

  /**
   * Create a new user (admin use - requires password to be hashed)
   */
  async create(dto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existing = await this.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    // Create user entity
    const user = this.userRepository.create({
      ...dto,
      email: dto.email.toLowerCase().trim(),
      role: dto.role || UserRole.MEMBER,
      status: UserStatus.PENDING,
    });

    const savedUser = await this.userRepository.save(user);

    // Create empty profile
    const profile = this.profileRepository.create({
      userId: savedUser.id,
    });
    await this.profileRepository.save(profile);

    // Emit event
    this.eventEmitter.emit(USER_EVENTS.CREATED, { userId: savedUser.id });

    return savedUser;
  }

  /**
   * Create a new user with pre-hashed password (for registration)
   */
  async createWithPassword(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    // Create user entity with hashed password
    const user = this.userRepository.create({
      email: data.email.toLowerCase().trim(),
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.MEMBER,
      status: UserStatus.PENDING,
    });

    const savedUser = await this.userRepository.save(user);

    // Create empty profile
    const profile = this.profileRepository.create({
      userId: savedUser.id,
    });
    await this.profileRepository.save(profile);

    // Emit event
    this.eventEmitter.emit(USER_EVENTS.CREATED, { userId: savedUser.id });

    return savedUser;
  }

  /**
   * Find or create user from social OAuth provider
   * If user exists by email, link the OAuth provider
   * If user exists by provider + providerId, return them
   * Otherwise create a new user
   */
  async findOrCreateFromSocial(data: {
    provider: string;
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  }): Promise<User> {
    // 1. Try to find by OAuth provider + providerId
    const existingByProvider = await this.userRepository.findOne({
      where: {
        oauthProvider: data.provider,
        oauthProviderId: data.providerId,
        deletedAt: IsNull(),
      },
    });

    if (existingByProvider) {
      // Update avatar if we have a new one
      if (data.avatarUrl && !existingByProvider.avatarUrl) {
        existingByProvider.avatarUrl = data.avatarUrl;
        await this.userRepository.save(existingByProvider);
      }
      return existingByProvider;
    }

    // 2. Try to find by email (user registered with email, now logging in with social)
    const existingByEmail = await this.findByEmail(data.email);

    if (existingByEmail) {
      // Link OAuth provider to existing account
      existingByEmail.oauthProvider = data.provider;
      existingByEmail.oauthProviderId = data.providerId;
      if (data.avatarUrl && !existingByEmail.avatarUrl) {
        existingByEmail.avatarUrl = data.avatarUrl;
      }
      // Social login auto-verifies email
      if (!existingByEmail.emailVerified) {
        existingByEmail.emailVerified = true;
        existingByEmail.emailVerifiedAt = new Date();
        existingByEmail.status = UserStatus.ACTIVE;
      }
      return this.userRepository.save(existingByEmail);
    }

    // 3. Create new user from social profile
    const newUser = this.userRepository.create({
      email: data.email.toLowerCase().trim(),
      password: null, // No password for social users
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.MEMBER,
      status: UserStatus.ACTIVE, // Social signup = auto-verified
      emailVerified: true,
      emailVerifiedAt: new Date(),
      oauthProvider: data.provider,
      oauthProviderId: data.providerId,
      avatarUrl: data.avatarUrl,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Create empty profile
    const profile = this.profileRepository.create({
      userId: savedUser.id,
    });
    await this.profileRepository.save(profile);

    // Emit event
    this.eventEmitter.emit(USER_EVENTS.CREATED, { userId: savedUser.id });

    return savedUser;
  }

  /**
   * Update user
   */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    Object.assign(user, dto);
    const updatedUser = await this.userRepository.save(user);

    this.eventEmitter.emit(USER_EVENTS.UPDATED, { userId: id });

    return updatedUser;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.profileRepository.create({ userId });
    }

    Object.assign(profile, dto);
    return this.profileRepository.save(profile);
  }

  /**
   * Admin update user (can change role/status)
   */
  async adminUpdate(id: string, dto: AdminUpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    const oldRole = user.role;
    const oldStatus = user.status;

    Object.assign(user, dto);
    const updatedUser = await this.userRepository.save(user);

    // Emit role change event if role changed
    if (dto.role && dto.role !== oldRole) {
      this.eventEmitter.emit(USER_EVENTS.ROLE_CHANGED, {
        userId: id,
        oldRole,
        newRole: dto.role,
      });
    }

    // Emit status change event if status changed
    if (dto.status && dto.status !== oldStatus) {
      this.eventEmitter.emit(USER_EVENTS.STATUS_CHANGED, {
        userId: id,
        oldStatus,
        newStatus: dto.status,
      });
    }

    return updatedUser;
  }

  /**
   * Soft delete user
   */
  async delete(id: string): Promise<void> {
    const user = await this.findById(id);
    user.deletedAt = new Date();
    user.status = UserStatus.DEACTIVATED;
    await this.userRepository.save(user);

    this.eventEmitter.emit(USER_EVENTS.DELETED, { userId: id });
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.status = UserStatus.ACTIVE;
    user.emailVerificationToken = null;
    await this.userRepository.save(user);
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string, ip: string): Promise<void> {
    await this.userRepository.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      failedLoginAttempts: 0,
      lockedUntil: null,
    });
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedAttempts(userId: string): Promise<void> {
    const user = await this.findById(userId);
    user.failedLoginAttempts += 1;

    // Lock account after 5 failed attempts
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }

    await this.userRepository.save(user);
  }

  /**
   * Set password reset token
   */
  async setPasswordResetToken(userId: string, token: string): Promise<void> {
    await this.userRepository.update(userId, {
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });
  }

  /**
   * Update password
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);
  }

  /**
   * Set email verification token
   */
  async setEmailVerificationToken(userId: string, token: string): Promise<void> {
    await this.userRepository.update(userId, {
      emailVerificationToken: token,
    });
  }

  /**
   * Find user by email verification token
   */
  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { emailVerificationToken: token, deletedAt: IsNull() },
    });
  }

  /**
   * Find user by password reset token (not expired)
   */
  async findByPasswordResetToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { passwordResetToken: token, deletedAt: IsNull() },
    });
  }

  /**
   * Update user avatar
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    await this.userRepository.update(userId, { avatarUrl });
  }

  /**
   * Get user count by role
   */
  async getCountByRole(): Promise<Record<UserRole, number>> {
    const results = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('user.deletedAt IS NULL')
      .groupBy('user.role')
      .getRawMany();

    const counts = {} as Record<UserRole, number>;
    Object.values(UserRole).forEach((role) => {
      counts[role] = 0;
    });

    results.forEach(({ role, count }: { role: UserRole; count: string }) => {
      counts[role] = parseInt(count, 10);
    });

    return counts;
  }
}
