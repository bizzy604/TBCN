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
import { ProgramStatus, UserRole } from '@tbcn/shared';
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

interface ProgramActor {
  id: string;
  role: UserRole;
}

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
        }, { id: instructorId, role: UserRole.COACH });
        if (modDto.lessons?.length) {
          for (const [lIdx, lessonDto] of modDto.lessons.entries()) {
            await this.createLesson(mod.id, {
              ...lessonDto,
              sortOrder: lessonDto.sortOrder ?? lIdx,
            }, { id: instructorId, role: UserRole.COACH });
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
    actor: ProgramActor,
  ): Promise<Program> {
    const program = await this.findById(id);
    this.assertCanManageProgram(program, actor);

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

  async delete(id: string, actor: ProgramActor): Promise<void> {
    const program = await this.findById(id);
    this.assertCanManageProgram(program, actor);

    if (program.enrollmentCount > 0) {
      throw new BadRequestException(
        'Cannot delete a program with active enrollments. Archive it instead.',
      );
    }

    await this.repository.deleteProgram(id);
    this.eventEmitter.emit(PROGRAM_EVENTS.DELETED, { programId: id });
  }

  async publish(id: string, actor: ProgramActor): Promise<Program> {
    return this.update(id, { status: ProgramStatus.PUBLISHED }, actor);
  }

  async archive(id: string, actor: ProgramActor): Promise<Program> {
    return this.update(id, { status: ProgramStatus.ARCHIVED }, actor);
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

  async createModule(
    programId: string,
    dto: CreateModuleDto,
    actor: ProgramActor,
  ): Promise<ProgramModule> {
    const program = await this.findById(programId);
    this.assertCanManageProgram(program, actor);

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

  async updateModule(
    id: string,
    dto: UpdateModuleDto,
    actor: ProgramActor,
  ): Promise<ProgramModule> {
    const mod = await this.repository.findModuleById(id, ['program']);
    if (!mod) throw new NotFoundException(`Module with ID "${id}" not found`);

    this.assertCanManageProgram(
      mod.program || (await this.findById(mod.programId)),
      actor,
    );

    return this.repository.updateModule(id, dto as Partial<ProgramModule>);
  }

  async deleteModule(id: string, actor: ProgramActor): Promise<void> {
    const mod = await this.repository.findModuleById(id, ['program']);
    if (!mod) throw new NotFoundException(`Module with ID "${id}" not found`);

    this.assertCanManageProgram(
      mod.program || (await this.findById(mod.programId)),
      actor,
    );

    await this.repository.deleteModule(id);
  }

  // ═══════════════════════════════════════════════
  // Lessons
  // ═══════════════════════════════════════════════

  async createLesson(
    moduleId: string,
    dto: CreateLessonDto,
    actor: ProgramActor,
  ): Promise<Lesson> {
    const mod = await this.repository.findModuleById(moduleId, ['program']);
    if (!mod) throw new NotFoundException(`Module with ID "${moduleId}" not found`);

    this.assertCanManageProgram(
      mod.program || (await this.findById(mod.programId)),
      actor,
    );

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

  async updateLesson(
    id: string,
    dto: UpdateLessonDto,
    actor: ProgramActor,
  ): Promise<Lesson> {
    const lesson = await this.repository.findLessonById(id, ['module', 'module.program']);
    if (!lesson) throw new NotFoundException(`Lesson with ID "${id}" not found`);

    const ownerModule = lesson.module
      || (await this.repository.findModuleById(lesson.moduleId, ['program']));
    if (!ownerModule) {
      throw new NotFoundException(`Module for lesson "${id}" not found`);
    }

    this.assertCanManageProgram(
      ownerModule.program || (await this.findById(ownerModule.programId)),
      actor,
    );

    return this.repository.updateLesson(id, dto as Partial<Lesson>);
  }

  async deleteLesson(id: string, actor: ProgramActor): Promise<void> {
    const lesson = await this.repository.findLessonById(id, ['module', 'module.program']);
    if (!lesson) throw new NotFoundException(`Lesson with ID "${id}" not found`);

    const ownerModule = lesson.module
      || (await this.repository.findModuleById(lesson.moduleId, ['program']));
    if (!ownerModule) {
      throw new NotFoundException(`Module for lesson "${id}" not found`);
    }

    this.assertCanManageProgram(
      ownerModule.program || (await this.findById(ownerModule.programId)),
      actor,
    );

    await this.repository.deleteLesson(id);
  }

  async countLessonsByProgramId(programId: string): Promise<number> {
    return this.repository.countLessonsByProgramId(programId);
  }

  async incrementEnrollmentCount(programId: string): Promise<void> {
    await this.repository.incrementEnrollmentCount(programId);
  }

  async decrementEnrollmentCount(programId: string): Promise<void> {
    await this.repository.decrementEnrollmentCount(programId);
  }

  // ═══════════════════════════════════════════════
  // Private Helpers
  // ═══════════════════════════════════════════════

  private assertCanManageProgram(program: Program, actor: ProgramActor): void {
    const privilegedRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
    if (privilegedRoles.includes(actor.role)) {
      return;
    }

    if (program.instructorId !== actor.id) {
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

