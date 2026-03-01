import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto';
import { SessionStatus } from '../enums/session-status.enum';

export enum SessionQueryRole {
  COACH = 'coach',
  MENTEE = 'mentee',
}

function toOptionalBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }
  return undefined;
}

export class SessionsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: SessionQueryRole })
  @IsOptional()
  @IsEnum(SessionQueryRole)
  role?: SessionQueryRole;

  @ApiPropertyOptional({ enum: SessionStatus })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @ApiPropertyOptional({ description: 'Return only upcoming scheduled sessions' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toOptionalBoolean(value))
  upcoming?: boolean;
}

