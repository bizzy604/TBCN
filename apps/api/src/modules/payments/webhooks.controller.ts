import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments/webhooks')
export class WebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post(':provider')
  @ApiOperation({ summary: 'Handle payment provider webhook with idempotency key' })
  async handleWebhook(
    @Param('provider') provider: string,
    @Headers('x-idempotency-key') idempotencyKeyHeader: string | undefined,
    @Body() payload: Record<string, unknown>,
  ) {
    const idempotencyKey = idempotencyKeyHeader
      || (typeof payload.idempotencyKey === 'string' ? payload.idempotencyKey : null)
      || `${provider}-${payload.reference ?? payload.eventId ?? Date.now()}`;

    return this.paymentsService.handleWebhook(provider, idempotencyKey, payload);
  }
}
