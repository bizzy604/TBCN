import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaymentStatus } from '../enums/payment-status.enum';

export class PaymentCallbackDto {
  @ApiProperty({ example: 'txn_123' })
  @IsString()
  @MaxLength(120)
  reference: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ example: 'provider_tx_456' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  providerTransactionId?: string;
}
