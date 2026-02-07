import { IsOptional, IsBoolean, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiPropertyOptional({ description: 'Lesson ID being progressed' })
  @IsUUID()
  lessonId: string;

  @ApiPropertyOptional({ description: 'Whether the lesson is completed' })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({ description: 'Time spent in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number;

  @ApiPropertyOptional({ description: 'Video position in seconds' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lastPosition?: number;
}
