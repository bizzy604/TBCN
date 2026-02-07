import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '../entities/media-asset.entity';

export class RequestPresignedUrlDto {
  @ApiProperty({ description: 'Original file name', example: 'intro-video.mp4' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  fileName: string;

  @ApiProperty({ description: 'MIME type', example: 'video/mp4' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({ enum: MediaType, example: MediaType.VIDEO })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  fileSize?: number;
}