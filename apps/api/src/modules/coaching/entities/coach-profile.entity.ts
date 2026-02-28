import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';

@Entity('coach_profiles')
@Index('idx_coach_profiles_user', ['userId'])
export class CoachProfile extends BaseEntity {
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  tagline: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ type: 'simple-array', default: '' })
  specialties: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ name: 'years_experience', type: 'int', default: 0 })
  yearsExperience: number;

  @Column({ type: 'simple-array', default: '' })
  languages: string[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}

