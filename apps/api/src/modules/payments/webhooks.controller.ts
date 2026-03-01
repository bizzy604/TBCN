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
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() payload: Record<string, unknown>,
  ) {
    const idempotencyKey = idempotencyKeyHeader
      || this.resolveWebhookIdempotencyKey(provider, payload)
      || `${provider}-${Date.now()}`;

    return this.paymentsService.handleWebhook(provider, idempotencyKey, payload, headers);
  }

  private resolveWebhookIdempotencyKey(
    provider: string,
    payload: Record<string, unknown>,
  ): string | null {
    if (typeof payload.idempotencyKey === 'string') {
      return payload.idempotencyKey;
    }

    const providerName = provider.toLowerCase();
    if (providerName === 'paystack') {
      const event = typeof payload.event === 'string' ? payload.event : 'paystack.event';
      const data = this.asObject(payload.data);
      const reference = typeof data?.reference === 'string'
        ? data.reference
        : typeof payload.reference === 'string'
          ? payload.reference
          : undefined;
      return reference ? `${providerName}-${event}-${reference}` : null;
    }

    if (providerName === 'mpesa') {
      const body = this.asObject(payload.Body);
      const callback = this.asObject(body?.stkCallback);
      const checkoutRequestId = typeof callback?.CheckoutRequestID === 'string'
        ? callback.CheckoutRequestID
        : undefined;
      return checkoutRequestId ? `${providerName}-stk-${checkoutRequestId}` : null;
    }

    const eventId = typeof payload.eventId === 'string' ? payload.eventId : undefined;
    const reference = typeof payload.reference === 'string' ? payload.reference : undefined;
    return eventId || reference ? `${providerName}-${eventId ?? reference}` : null;
  }

  private asObject(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  }
}
