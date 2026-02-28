import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostCategory } from '../enums/post-category.enum';

export class CreatePostDto {
  @ApiProperty({ example: 'How do you define your unique brand promise?' })
  @IsString()
  @MinLength(5)
  @MaxLength(180)
  title: string;

  @ApiProperty({ example: 'I am refining my positioning and would like feedback...' })
  @IsString()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ enum: PostCategory, default: PostCategory.GENERAL })
  @IsOptional()
  @IsEnum(PostCategory)
  category?: PostCategory;

  @ApiPropertyOptional({ type: [String], example: ['positioning', 'strategy'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
