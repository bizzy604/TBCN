import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({ example: 'WELCOME20' })
  @IsString()
  @MaxLength(40)
  code: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'KES' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: 'pro', description: 'Plan/tier context for tier-restricted coupons.' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  plan?: string;
}

