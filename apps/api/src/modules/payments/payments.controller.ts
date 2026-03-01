import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@tbcn/shared';
import { CurrentUser, Roles } from '../../common/decorators';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Initiate checkout payment' })
  async checkout(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiateCheckout(userId, dto);
  }

  @Post('callback')
  @ApiOperation({ summary: 'Confirm payment status after provider redirect' })
  async callback(@Body() dto: PaymentCallbackDto) {
    return this.paymentsService.confirmCallback(dto);
  }

  @Get('transactions')
  async myTransactions(
    @CurrentUser('id') userId: string,
    @Query() query: TransactionQueryDto,
  ) {
    return this.paymentsService.getMyTransactions(userId, query);
  }

  @Get('transactions/:id')
  async myTransactionById(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.getTransactionById(id, userId);
  }

  @Get('admin/transactions')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async adminTransactions(@Query() query: TransactionQueryDto) {
    return this.paymentsService.getAllTransactions(query);
  }

  @Get('subscription/me')
  async mySubscription(@CurrentUser('id') userId: string) {
    return this.paymentsService.getMySubscription(userId);
  }

  @Post('subscription/upgrade')
  async upgradeSubscription(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiateCheckout(userId, dto);
  }

  @Patch('subscription/cancel')
  async cancelSubscription(@CurrentUser('id') userId: string) {
    return this.paymentsService.cancelSubscription(userId);
  }
}
