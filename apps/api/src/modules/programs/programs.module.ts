import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramsController } from './programs.controller';
import { ProgramsService } from './programs.service';
import { ProgramsRepository } from './programs.repository';
import { Program } from './entities/program.entity';
import { ProgramModule as ProgramModuleEntity } from './entities/module.entity';
import { Lesson } from './entities/lesson.entity';

/**
 * Programs Module
 * Manages learning programs and courses
 * - Program CRUD
 * - Module/Lesson structure
 * - Content management
 * - Course catalog
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Program, ProgramModuleEntity, Lesson]),
  ],
  controllers: [ProgramsController],
  providers: [ProgramsService, ProgramsRepository],
  exports: [ProgramsService, ProgramsRepository, TypeOrmModule],
})
export class ProgramsModule {}
