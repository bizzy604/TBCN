import { PartialType } from '@nestjs/swagger';
import { CreateProgramDto, CreateModuleDto, CreateLessonDto } from './create-program.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProgramStatus } from '@tbcn/shared';

export class UpdateProgramDto extends PartialType(CreateProgramDto) {
  @ApiPropertyOptional({ enum: ProgramStatus })
  @IsOptional()
  @IsEnum(ProgramStatus)
  status?: ProgramStatus;
}

export class UpdateModuleDto extends PartialType(CreateModuleDto) {}

export class UpdateLessonDto extends PartialType(CreateLessonDto) {}
