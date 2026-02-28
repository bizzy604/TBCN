import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionType } from '../enums/session-status.enum';

export class CreateSessionDto {
  @ApiProperty()
  @IsUUID()
  coachId: string;

  @ApiProperty({ example: '2026-03-11T10:00:00.000Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ minimum: 15, maximum: 240, example: 60 })
  @IsInt()
  @Min(15)
  durationMinutes: number;

  @ApiProperty({ enum: SessionType, default: SessionType.ONE_ON_ONE })
  @IsEnum(SessionType)
  @IsOptional()
  sessionType?: SessionType;

  @ApiProperty({ example: 'Personal brand positioning strategy' })
  @IsString()
  @MaxLength(255)
  topic: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'Africa/Nairobi' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;
}
