import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '../enums/event-status.enum';
import { LocationType } from '../enums/location-type.enum';

export class CreateEventDto {
  @ApiProperty({ example: 'Brand Positioning Masterclass' })
  @IsString()
  @MinLength(5)
  @MaxLength(220)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: '2026-05-10T09:00:00.000Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ example: '2026-05-10T11:00:00.000Z' })
  @IsDateString()
  endAt: string;

  @ApiPropertyOptional({ enum: LocationType, default: LocationType.VIRTUAL })
  @IsOptional()
  @IsEnum(LocationType)
  locationType?: LocationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ enum: EventStatus, default: EventStatus.DRAFT })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerUrl?: string;
}
