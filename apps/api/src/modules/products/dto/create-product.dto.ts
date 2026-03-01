import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ProductType } from '../enums/product-type.enum';

export class CreateProductDto {
  @ApiProperty({ example: 'Personal Branding Toolkit' })
  @IsString()
  @MaxLength(180)
  title: string;

  @ApiProperty({ example: 'Downloadable templates and worksheets for brand growth.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ enum: ProductType, default: ProductType.TOOLKIT })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiProperty({ example: 2499 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'KES' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/assets/toolkit-cover.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/downloads/toolkit.zip' })
  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  downloadLimit?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  downloadExpiresDays?: number;

  @ApiPropertyOptional({ type: Object, example: { sku: 'TBCN-TOOLKIT-001' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Personal Branding Toolkit 2.0' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProductType })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiPropertyOptional({ example: 2999 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'KES' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/assets/toolkit-cover.jpg' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/downloads/toolkit.zip' })
  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  downloadLimit?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  downloadExpiresDays?: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
