import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../enums/payment-method.enum';

export class InitiatePaymentDto {
  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0.5)
  amount: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.CARD })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ example: 'pro' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  plan?: string;

  @ApiPropertyOptional({ example: 'Subscription upgrade to Pro' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '+254712345678', description: 'Customer phone number. Required for M-PESA when not saved on profile.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: '/settings/subscription' })
  @IsOptional()
  @IsString()
  returnPath?: string;

  @ApiPropertyOptional({ example: 'WELCOME20' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  couponCode?: string;
}
