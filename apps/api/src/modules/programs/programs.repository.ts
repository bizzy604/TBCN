import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Program } from './entities/program.entity';
import { ProgramModule } from './entities/module.entity';
import { Lesson } from './entities/lesson.entity';
import { ProgramQueryDto } from './dto/program-query.dto';
import { ProgramStatus } from '@tbcn/shared';

@Injectable()
export class ProgramsRepository {
  constructor(
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(ProgramModule)
    private readonly moduleRepo: Repository<ProgramModule>,
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
  ) {}

  // ─── Programs ────────────────────────────────────────

  async createProgram(data: Partial<Program>): Promise<Program> {
    const program = this.programRepo.create(data);
    return this.programRepo.save(program);
  }

  async findProgramById(id: string, relations: string[] = []): Promise<Program | null> {
    return this.programRepo.findOne({
      where: { id },
      relations,
    });
  }

  async findProgramBySlug(slug: string, relations: string[] = []): Promise<Program | null> {
    return this.programRepo.findOne({
      where: { slug },
      relations,
    });
  }

  async findPrograms(query: ProgramQueryDto): Promise<{ data: Program[]; total: number }> {
    const qb = this.programRepo
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.instructor', 'instructor')
      .select([
        'program',
        'instructor.id',
        'instructor.firstName',
        'instructor.lastName',
        'instructor.avatarUrl',
      ]);

    this.applyFilters(qb, query);

    const page = query.page || 1;
    const limit = query.limit || 12;
    qb.skip((page - 1) * limit).take(limit);

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = (query.sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'DESC';
    qb.orderBy(`program.${sortBy}`, sortOrder);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async updateProgram(id: string, data: Partial<Program>): Promise<Program> {
    // Strip out relation properties that cannot be passed to .update()
    const { modules, instructor, ...columnData } = data as any;
    await this.programRepo.update(id, columnData);
    return this.findProgramById(id, ['modules', 'modules.lessons', 'instructor']);
  }

  async deleteProgram(id: string): Promise<void> {
    await this.programRepo.delete(id);
  }

  async incrementEnrollmentCount(programId: string): Promise<void> {
    await this.programRepo.increment({ id: programId }, 'enrollmentCount', 1);
  }

  async decrementEnrollmentCount(programId: string): Promise<void> {
    await this.programRepo.decrement({ id: programId }, 'enrollmentCount', 1);
  }

  async getProgramStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    totalEnrollments: number;
  }> {
    const total = await this.programRepo.count();
    const published = await this.programRepo.count({
      where: { status: ProgramStatus.PUBLISHED },
    });
    const draft = await this.programRepo.count({
      where: { status: ProgramStatus.DRAFT },
    });
    const result = await this.programRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.enrollment_count), 0)', 'totalEnrollments')
      .getRawOne();
    return {
      total,
      published,
      draft,
      totalEnrollments: parseInt(result.totalEnrollments, 10),
    };
  }

  // ─── Modules ─────────────────────────────────────────

  async createModule(data: Partial<ProgramModule>): Promise<ProgramModule> {
    const mod = this.moduleRepo.create(data);
    return this.moduleRepo.save(mod);
  }

  async findModuleById(id: string, relations: string[] = []): Promise<ProgramModule | null> {
    return this.moduleRepo.findOne({ where: { id }, relations });
  }

  async findModulesByProgramId(programId: string): Promise<ProgramModule[]> {
    return this.moduleRepo.find({
      where: { programId },
      relations: ['lessons'],
      order: { sortOrder: 'ASC' },
    });
  }

  async updateModule(id: string, data: Partial<ProgramModule>): Promise<ProgramModule> {
    await this.moduleRepo.update(id, data);
    return this.findModuleById(id, ['lessons']);
  }

  async deleteModule(id: string): Promise<void> {
    await this.moduleRepo.delete(id);
  }

  // ─── Lessons ─────────────────────────────────────────

  async createLesson(data: Partial<Lesson>): Promise<Lesson> {
    const lesson = this.lessonRepo.create(data);
    return this.lessonRepo.save(lesson);
  }

  async findLessonById(id: string, relations: string[] = []): Promise<Lesson | null> {
    return this.lessonRepo.findOne({ where: { id }, relations });
  }

  async findLessonsByModuleId(moduleId: string): Promise<Lesson[]> {
    return this.lessonRepo.find({
      where: { moduleId },
      order: { sortOrder: 'ASC' },
    });
  }

  async updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson> {
    await this.lessonRepo.update(id, data);
    return this.findLessonById(id);
  }

  async deleteLesson(id: string): Promise<void> {
    await this.lessonRepo.delete(id);
  }

  async countLessonsByProgramId(programId: string): Promise<number> {
    return this.lessonRepo
      .createQueryBuilder('lesson')
      .innerJoin('lesson.module', 'module')
      .where('module.programId = :programId', { programId })
      .getCount();
  }

  // ─── Private Helpers ─────────────────────────────────

  private applyFilters(
    qb: SelectQueryBuilder<Program>,
    query: ProgramQueryDto,
  ): void {
    if (query.search) {
      qb.andWhere(
        '(LOWER(program.title) LIKE LOWER(:search) OR LOWER(program.description) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      qb.andWhere('program.status = :status', { status: query.status });
    }

    if (query.difficulty) {
      qb.andWhere('program.difficulty = :difficulty', {
        difficulty: query.difficulty,
      });
    }

    if (query.tag) {
      qb.andWhere('program.tags LIKE :tag', { tag: `%${query.tag}%` });
    }

    if (query.instructorId) {
      qb.andWhere('program.instructorId = :instructorId', {
        instructorId: query.instructorId,
      });
    }

    if (query.isFree !== undefined) {
      qb.andWhere('program.isFree = :isFree', { isFree: query.isFree });
    }
  }
}
