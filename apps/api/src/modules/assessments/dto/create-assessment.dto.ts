import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsUUID,
  Min,
  Max,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssessmentType, QuestionType } from '@tbcn/shared';

export class CreateQuestionDto {
  @ApiProperty({ example: 'What is a personal brand?' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional({ type: [String], example: ['Option A', 'Option B', 'Option C', 'Option D'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ example: 'Option A' })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiProperty({ example: 10, default: 10 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  points?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class CreateAssessmentDto {
  @ApiProperty({ description: 'Lesson this assessment belongs to' })
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @ApiProperty({ example: 'Module 1 Quiz' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: AssessmentType, default: AssessmentType.QUIZ })
  @IsEnum(AssessmentType)
  @IsOptional()
  type?: AssessmentType;

  @ApiPropertyOptional({ default: 70, description: 'Minimum passing percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @ApiPropertyOptional({ default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({ description: 'Time limit in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  timeLimitMinutes?: number;

  @ApiProperty({ type: [CreateQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
