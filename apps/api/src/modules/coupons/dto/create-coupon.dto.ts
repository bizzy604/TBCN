import { PartialType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { CouponDiscountType } from '../enums/coupon-discount-type.enum';

export class CreateCouponDto {
  @ApiProperty({ example: 'WELCOME20' })
  @IsString()
  @MaxLength(40)
  code: string;

  @ApiPropertyOptional({ example: 'Welcome Discount' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'Discount for new users' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CouponDiscountType, example: CouponDiscountType.PERCENTAGE })
  @IsEnum(CouponDiscountType)
  discountType: CouponDiscountType;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0.01)
  discountValue: number;

  @ApiPropertyOptional({ example: 'KES', description: 'Required for fixed coupons with currency-specific validation.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAt?: Date;

  @ApiPropertyOptional({ example: '2026-06-30T23:59:59.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxTotalUses?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsesPerUser?: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  allowStacking?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'If provided, coupon can only be used by these user IDs.' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  applicableUserIds?: string[];

  @ApiPropertyOptional({ type: [String], example: ['pro', 'enterprise'] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  allowedPlans?: string[];

  @ApiPropertyOptional({ example: 10, description: 'Minimum basket/checkout amount before coupon can be applied.' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}

