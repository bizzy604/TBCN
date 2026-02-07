import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { ProgramModule } from './module.entity';
import { ContentType } from '@tbcn/shared';

export { ContentType };

@Entity('lessons')
@Index('idx_lessons_module_sort', ['moduleId', 'sortOrder'])
export class Lesson extends BaseEntity {
  @ManyToOne(() => ProgramModule, (mod) => mod.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: ProgramModule;

  @Column({ name: 'module_id', type: 'uuid' })
  moduleId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'content_type',
    type: 'enum',
    enum: ContentType,
    default: ContentType.TEXT,
  })
  contentType: ContentType;

  @Column({ type: 'text', nullable: true, comment: 'Text/Markdown content' })
  content: string | null;

  @Column({ name: 'video_url', type: 'varchar', length: 500, nullable: true })
  videoUrl: string | null;

  @Column({
    name: 'video_duration',
    type: 'int',
    nullable: true,
    comment: 'Duration in seconds',
  })
  videoDuration: number | null;

  @Column({ name: 'resource_urls', type: 'jsonb', default: [] })
  resourceUrls: string[];

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({
    name: 'is_free',
    type: 'boolean',
    default: false,
    comment: 'Free preview lesson',
  })
  isFree: boolean;

  @Column({
    name: 'estimated_duration',
    type: 'int',
    nullable: true,
    comment: 'Estimated duration in minutes',
  })
  estimatedDuration: number | null;
}
