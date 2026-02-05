import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from './user.entity';

/**
 * User Profile Entity
 * Extended profile information separate from core user data
 */
@Entity('user_profiles')
export class UserProfile extends BaseEntity {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  headline: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string | null;

  @Column({ name: 'job_title', type: 'varchar', length: 255, nullable: true })
  jobTitle: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  website: string | null;

  @Column({ name: 'linkedin_url', type: 'varchar', length: 500, nullable: true })
  linkedinUrl: string | null;

  @Column({ name: 'twitter_url', type: 'varchar', length: 500, nullable: true })
  twitterUrl: string | null;

  @Column({ name: 'instagram_url', type: 'varchar', length: 500, nullable: true })
  instagramUrl: string | null;

  @Column({ name: 'facebook_url', type: 'varchar', length: 500, nullable: true })
  facebookUrl: string | null;

  // Coaching-specific fields
  @Column({ name: 'years_experience', type: 'int', nullable: true })
  yearsExperience: number | null;

  @Column({ name: 'specializations', type: 'simple-array', nullable: true })
  specializations: string[] | null;

  @Column({ name: 'certifications', type: 'simple-array', nullable: true })
  certifications: string[] | null;

  @Column({ name: 'industries_served', type: 'simple-array', nullable: true })
  industriesServed: string[] | null;

  // Preferences
  @Column({ name: 'notification_preferences', type: 'jsonb', default: {} })
  notificationPreferences: {
    email: {
      marketing: boolean;
      updates: boolean;
      reminders: boolean;
    };
    push: {
      enabled: boolean;
      messages: boolean;
      reminders: boolean;
    };
    sms: {
      enabled: boolean;
      reminders: boolean;
    };
  };

  @Column({ name: 'privacy_settings', type: 'jsonb', default: {} })
  privacySettings: {
    profileVisibility: 'public' | 'members' | 'private';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };

  // Onboarding
  @Column({ name: 'onboarding_completed', type: 'boolean', default: false })
  onboardingCompleted: boolean;

  @Column({ name: 'onboarding_step', type: 'int', default: 0 })
  onboardingStep: number;
}
