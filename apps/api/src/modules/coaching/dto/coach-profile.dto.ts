import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertCoachProfileDto {
  @ApiPropertyOptional({ example: 'Personal Branding Coach' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  tagline?: string;

  @ApiPropertyOptional({ example: 'I help founders build visible and trusted brands.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ type: [String], example: ['Personal Branding', 'Leadership'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsExperience?: number;

  @ApiPropertyOptional({ type: [String], example: ['English', 'Swahili'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}
