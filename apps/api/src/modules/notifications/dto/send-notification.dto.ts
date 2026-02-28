import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';

export class SendNotificationDto {
  @ApiProperty({ type: [String], description: 'Recipient user IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  message: string;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.INFO })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
