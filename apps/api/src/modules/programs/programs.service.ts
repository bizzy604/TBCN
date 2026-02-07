import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProgramsRepository } from './programs.repository';
import { CreateProgramDto, CreateModuleDto, CreateLessonDto } from './dto/create-program.dto';
import { UpdateProgramDto, UpdateModuleDto, UpdateLessonDto } from './dto/update-program.dto';
import { ProgramQueryDto } from './dto/program-query.dto';
import { Program } from './entities/program.entity';
import { ProgramModule } from './entities/module.entity';
import { Lesson } from './entities/lesson.entity';
import { ProgramStatus } from '@tbcn/shared';
import {
  PaginatedResult,
  createPaginationMeta,
  createPaginatedResult,
} from '../../common/dto';

export const PROGRAM_EVENTS = {
  CREATED: 'program.created',
  UPDATED: 'program.updated',
  PUBLISHED: 'program.published',
  ARCHIVED: 'program.archived',
  DELETED: 'program.deleted',
  MODULE_CREATED: 'program.module.created',
  LESSON_CREATED: 'program.lesson.created',
};

@Injectable()
export class ProgramsService {
  constructor(
    private readonly repository: ProgramsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ═══════════════════════════════════════════════
  // Programs
  // ═══════════════════════════════════════════════

  async create(
    dto: CreateProgramDto,
    instructorId: string,
  ): Promise<Program> {
    const program = await this.repository.createProgram({
      ...dto,
      instructorId,
      isFree: dto.isFree ?? (dto.price === 0 || dto.price === undefined),
    } as Partial<Program>);

    // Create modules and lessons if provided
    if (dto.modules?.length) {
      for (const [idx, modDto] of dto.modules.entries()) {
        const mod = await this.createModule(program.id, {
          ...modDto,
          sortOrder: modDto.sortOrder ?? idx,
        });
        if (modDto.lessons?.length) {
          for (const [lIdx, lessonDto] of modDto.lessons.entries()) {
            await this.createLesson(mod.id, {
              ...lessonDto,
              sortOrder: lessonDto.sortOrder ?? lIdx,
            });
          }
        }
      }
    }

    const result = await this.findById(program.id);
    this.eventEmitter.emit(PROGRAM_EVENTS.CREATED, { program: result });
    return result;
  }

  async findAll(query: ProgramQueryDto): Promise<PaginatedResult<Program>> {
    const { data, total } = await this.repository.findPrograms(query);
    const meta = createPaginationMeta(query.page || 1, query.limit || 12, total);
    return createPaginatedResult(data, meta);
  }

  async findPublished(query: ProgramQueryDto): Promise<PaginatedResult<Program>> {
    const merged = Object.assign(new ProgramQueryDto(), query, { status: ProgramStatus.PUBLISHED });
    return this.findAll(merged);
  }

  async findById(id: string): Promise<Program> {
    const program = await this.repository.findProgramById(id, [
      'modules',
      'modules.lessons',
      'instructor',
    ]);
    if (!program) {
      throw new NotFoundException(`Program with ID "${id}" not found`);
    }
    // Sort modules and lessons
    if (program.modules) {
      program.modules.sort((a, b) => a.sortOrder - b.sortOrder);
      program.modules.forEach((mod) => {
        if (mod.lessons) {
          mod.lessons.sort((a, b) => a.sortOrder - b.sortOrder);
        }
      });
    }
    return program;
  }

  async findBySlug(slug: string): Promise<Program> {
    const program = await this.repository.findProgramBySlug(slug, [
      'modules',
      'modules.lessons',
      'instructor',
    ]);
    if (!program) {
      throw new NotFoundException(`Program "${slug}" not found`);
    }
    if (program.modules) {
      program.modules.sort((a, b) => a.sortOrder - b.sortOrder);
      program.modules.forEach((mod) => {
        if (mod.lessons) {
          mod.lessons.sort((a, b) => a.sortOrder - b.sortOrder);
        }
      });
    }
    return program;
  }

  async update(
    id: string,
    dto: UpdateProgramDto,
    userId: string,
  ): Promise<Program> {
    const program = await this.findById(id);
    this.assertOwnerOrAdmin(program, userId);

    const updateData: Partial<Program> = { ...dto } as Partial<Program>;

    // Handle publish
    if (dto.status === ProgramStatus.PUBLISHED && program.status !== ProgramStatus.PUBLISHED) {
      await this.validateForPublish(program);
      updateData.publishedAt = new Date();
    }

    const updated = await this.repository.updateProgram(id, updateData);

    if (dto.status === ProgramStatus.PUBLISHED) {
      this.eventEmitter.emit(PROGRAM_EVENTS.PUBLISHED, { program: updated });
    } else if (dto.status === ProgramStatus.ARCHIVED) {
      this.eventEmitter.emit(PROGRAM_EVENTS.ARCHIVED, { program: updated });
    } else {
      this.eventEmitter.emit(PROGRAM_EVENTS.UPDATED, { program: updated });
    }

    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const program = await this.findById(id);
    this.assertOwnerOrAdmin(program, userId);

    if (program.enrollmentCount > 0) {
      throw new BadRequestException(
        'Cannot delete a program with active enrollments. Archive it instead.',
      );
    }

    await this.repository.deleteProgram(id);
    this.eventEmitter.emit(PROGRAM_EVENTS.DELETED, { programId: id });
  }

  async publish(id: string, userId: string): Promise<Program> {
    return this.update(id, { status: ProgramStatus.PUBLISHED }, userId);
  }

  async archive(id: string, userId: string): Promise<Program> {
    return this.update(id, { status: ProgramStatus.ARCHIVED }, userId);
  }

  async getStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    totalEnrollments: number;
  }> {
    return this.repository.getProgramStats();
  }

  // ═══════════════════════════════════════════════
  // Modules
  // ═══════════════════════════════════════════════

  async createModule(programId: string, dto: CreateModuleDto): Promise<ProgramModule> {
    await this.findById(programId); // ensure program exists
    const mod = await this.repository.createModule({
      ...dto,
      programId,
    } as Partial<ProgramModule>);
    this.eventEmitter.emit(PROGRAM_EVENTS.MODULE_CREATED, { module: mod });
    return mod;
  }

  async findModulesByProgramId(programId: string): Promise<ProgramModule[]> {
    return this.repository.findModulesByProgramId(programId);
  }

  async updateModule(id: string, dto: UpdateModuleDto): Promise<ProgramModule> {
    const mod = await this.repository.findModuleById(id);
    if (!mod) throw new NotFoundException(`Module with ID "${id}" not found`);
    return this.repository.updateModule(id, dto as Partial<ProgramModule>);
  }

  async deleteModule(id: string): Promise<void> {
    const mod = await this.repository.findModuleById(id);
    if (!mod) throw new NotFoundException(`Module with ID "${id}" not found`);
    await this.repository.deleteModule(id);
  }

  // ═══════════════════════════════════════════════
  // Lessons
  // ═══════════════════════════════════════════════

  async createLesson(moduleId: string, dto: CreateLessonDto): Promise<Lesson> {
    const mod = await this.repository.findModuleById(moduleId);
    if (!mod) throw new NotFoundException(`Module with ID "${moduleId}" not found`);
    const lesson = await this.repository.createLesson({
      ...dto,
      moduleId,
    } as Partial<Lesson>);
    this.eventEmitter.emit(PROGRAM_EVENTS.LESSON_CREATED, { lesson });
    return lesson;
  }

  async findLessonsByModuleId(moduleId: string): Promise<Lesson[]> {
    return this.repository.findLessonsByModuleId(moduleId);
  }

  async findLessonById(id: string): Promise<Lesson> {
    const lesson = await this.repository.findLessonById(id);
    if (!lesson) throw new NotFoundException(`Lesson with ID "${id}" not found`);
    return lesson;
  }

  async updateLesson(id: string, dto: UpdateLessonDto): Promise<Lesson> {
    await this.findLessonById(id);
    return this.repository.updateLesson(id, dto as Partial<Lesson>);
  }

  async deleteLesson(id: string): Promise<void> {
    await this.findLessonById(id);
    await this.repository.deleteLesson(id);
  }

  async countLessonsByProgramId(programId: string): Promise<number> {
    return this.repository.countLessonsByProgramId(programId);
  }

  // ═══════════════════════════════════════════════
  // Private Helpers
  // ═══════════════════════════════════════════════

  private assertOwnerOrAdmin(program: Program, userId: string): void {
    // Allow if user is the instructor — admin check happens at guard level
    if (program.instructorId && program.instructorId !== userId) {
      throw new ForbiddenException('You do not have permission to modify this program');
    }
  }

  private async validateForPublish(program: Program): Promise<void> {
    if (!program.title || !program.description) {
      throw new BadRequestException('Program must have a title and description to be published');
    }
    const lessonCount = await this.countLessonsByProgramId(program.id);
    if (lessonCount === 0) {
      throw new BadRequestException('Program must have at least one lesson to be published');
    }
  }
}
