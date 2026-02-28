import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../common/dto';
import { PostCategory } from '../enums/post-category.enum';

export class PostQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PostCategory })
  @IsOptional()
  @IsEnum(PostCategory)
  category?: PostCategory;
}
