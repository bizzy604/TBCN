import {
  Entity,
  Column,
  Index,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../common/entities';
import { UserRole, UserStatus } from '@tbcn/shared';

// Re-export so existing imports like `import { UserRole } from './entities'` keep working
export { UserRole, UserStatus };

/**
 * User Entity
 * Core user account information
 */
@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_users_email')
  email: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  @Exclude()
  password: string | null;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MEMBER,
  })
  @Index('idx_users_role')
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  @Index('idx_users_status')
  status: UserStatus;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'phone_verified', type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ name: 'timezone', type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ name: 'locale', type: 'varchar', length: 10, default: 'en' })
  locale: string;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({ name: 'last_login_ip', type: 'varchar', length: 45, nullable: true })
  lastLoginIp: string | null;

  @Column({ name: 'failed_login_attempts', type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @Column({ name: 'two_factor_enabled', type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', type: 'varchar', length: 255, nullable: true })
  @Exclude()
  twoFactorSecret: string | null;

  // Password reset fields
  @Column({ name: 'password_reset_token', type: 'varchar', length: 255, nullable: true })
  @Exclude()
  passwordResetToken: string | null;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  @Exclude()
  passwordResetExpires: Date | null;

  // Email verification fields
  @Column({ name: 'email_verification_token', type: 'varchar', length: 255, nullable: true })
  @Exclude()
  emailVerificationToken: string | null;

  // OAuth fields
  @Column({ name: 'oauth_provider', type: 'varchar', length: 50, nullable: true })
  @Index('idx_users_oauth')
  oauthProvider: string | null;

  @Column({ name: 'oauth_provider_id', type: 'varchar', length: 255, nullable: true })
  oauthProviderId: string | null;

  // Soft delete
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  // ============================================
  // Lifecycle Hooks
  // ============================================

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    // Only hash if password isn't already hashed (bcrypt hashes start with $2)
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    // Normalize email to lowercase
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    // Only hash if password was modified and not already hashed
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // ============================================
  // Instance Methods
  // ============================================

  /**
   * Compare password with hash
   */
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Check if account is locked
   */
  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return new Date() < this.lockedUntil;
  }

  /**
   * Get full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  /**
   * Check if user is admin or super admin
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
  }

  /**
   * Check if user can access admin panel
   */
  canAccessAdmin(): boolean {
    return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COACH].includes(this.role);
  }
}
