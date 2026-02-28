import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UpdateSessionAction {
  RESCHEDULE = 'reschedule',
  CANCEL = 'cancel',
  COMPLETE = 'complete',
}

export class UpdateSessionDto {
  @ApiProperty({ enum: UpdateSessionAction })
  @IsEnum(UpdateSessionAction)
  action: UpdateSessionAction;

  @ApiPropertyOptional({ example: '2026-03-11T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancellationReason?: string;
}
