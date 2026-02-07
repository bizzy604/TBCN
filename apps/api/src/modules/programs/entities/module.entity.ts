import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { Program } from './program.entity';
import { Lesson } from './lesson.entity';

@Entity('program_modules')
@Index('idx_modules_program_sort', ['programId', 'sortOrder'])
export class ProgramModule extends BaseEntity {
  @ManyToOne(() => Program, (program) => program.modules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ name: 'program_id', type: 'uuid' })
  programId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({
    name: 'estimated_duration',
    type: 'int',
    nullable: true,
    comment: 'Estimated duration in minutes',
  })
  estimatedDuration: number | null;

  @OneToMany(() => Lesson, (lesson) => lesson.module, { cascade: true })
  lessons: Lesson[];

  // Computed
  get lessonCount(): number {
    return this.lessons?.length ?? 0;
  }
}
