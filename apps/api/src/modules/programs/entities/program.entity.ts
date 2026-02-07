import {
  Entity,
  Column,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { ProgramStatus, DifficultyLevel } from '@tbcn/shared';
import { User } from '../../users/entities/user.entity';
import { ProgramModule } from './module.entity';

export { ProgramStatus, DifficultyLevel };

@Entity('programs')
export class Program extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 300, unique: true })
  @Index('idx_programs_slug')
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'short_description', type: 'varchar', length: 500, nullable: true })
  shortDescription: string | null;

  @Column({ name: 'thumbnail_url', type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string | null;

  @Column({ name: 'banner_url', type: 'varchar', length: 500, nullable: true })
  bannerUrl: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'instructor_id' })
  instructor: User;

  @Column({ name: 'instructor_id', type: 'uuid', nullable: true })
  @Index('idx_programs_instructor')
  instructorId: string | null;

  @Column({
    type: 'enum',
    enum: ProgramStatus,
    default: ProgramStatus.DRAFT,
  })
  @Index('idx_programs_status')
  status: ProgramStatus;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    default: DifficultyLevel.BEGINNER,
  })
  difficulty: DifficultyLevel;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'KES' })
  currency: string;

  @Column({ name: 'is_free', type: 'boolean', default: false })
  isFree: boolean;

  @Column({
    name: 'estimated_duration',
    type: 'int',
    nullable: true,
    comment: 'Total estimated duration in minutes',
  })
  estimatedDuration: number | null;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  prerequisites: string[] | null;

  @Column({ name: 'learning_outcomes', type: 'jsonb', default: [] })
  learningOutcomes: string[];

  @Column({
    name: 'max_enrollments',
    type: 'int',
    nullable: true,
    comment: 'null means unlimited',
  })
  maxEnrollments: number | null;

  @Column({ name: 'enrollment_count', type: 'int', default: 0 })
  enrollmentCount: number;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  averageRating: number | null;

  @Column({ name: 'total_ratings', type: 'int', default: 0 })
  totalRatings: number;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @OneToMany(() => ProgramModule, (mod) => mod.program, { cascade: true })
  modules: ProgramModule[];

  // Hooks
  @BeforeInsert()
  generateSlug() {
    if (!this.slug && this.title) {
      this.slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  }

  @BeforeUpdate()
  updateSlugOnTitleChange() {
    // Only auto-update slug if explicitly not set
  }

  // Helpers
  get isPublished(): boolean {
    return this.status === ProgramStatus.PUBLISHED && !!this.publishedAt;
  }

  get hasCapacity(): boolean {
    if (!this.maxEnrollments) return true;
    return this.enrollmentCount < this.maxEnrollments;
  }
}
