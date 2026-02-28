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

  @ApiPropertyOptional({ example: '/settings/subscription' })
  @IsOptional()
  @IsString()
  returnPath?: string;
}
