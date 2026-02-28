import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class WeeklyAvailabilityWindowDto {
  @ApiProperty({ minimum: 0, maximum: 6, example: 1 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be HH:mm' })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be HH:mm' })
  endTime: string;

  @ApiPropertyOptional({ example: 'Africa/Nairobi' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SetAvailabilityDto {
  @ApiProperty({ type: [WeeklyAvailabilityWindowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyAvailabilityWindowDto)
  windows: WeeklyAvailabilityWindowDto[];
}

export class AvailabilityQueryDto {
  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(240)
  durationMinutes?: number;
}
