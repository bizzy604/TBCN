import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfirmUploadDto {
  @ApiProperty({ description: 'S3 key returned from presigned URL request' })
  @IsString()
  @IsNotEmpty()
  s3Key: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Extra metadata (video duration, dimensions, etc.)' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}