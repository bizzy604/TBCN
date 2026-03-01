import { createHmac } from 'crypto';
import {
  BadRequestException,
  Injectable,
  HttpException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus } from '../enums/payment-status.enum';
import {
  CheckoutInitInput,
  CheckoutInitResult,
} from './processor.types';

@Injectable()
export class PaystackProcessor {
  private readonly logger = new Logger(PaystackProcessor.name);
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    if (this.configService.get<string>('NODE_ENV') === 'test') {
      return false;
    }
    return Boolean(this.configService.get<string>('PAYSTACK_SECRET_KEY'));
  }

  async createCheckout(input: CheckoutInitInput): Promise<CheckoutInitResult> {
    if (!this.isConfigured()) {
      this.logger.warn('PAYSTACK_SECRET_KEY not set; using local checkout fallback.');
      return {
        checkoutUrl: `/payments/confirmation?reference=${encodeURIComponent(input.reference)}&status=success&provider=paystack`,
        providerPayload: {
          mode: 'fallback',
          provider: 'paystack',
        },
      };
    }
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY') as string;
    const preferredCurrency = this.configService.get<string>('PAYSTACK_CURRENCY')?.toUpperCase();
    const requestedCurrency = input.currency.toUpperCase();
    const initPayload = {
      email: input.email,
      amount: this.toMinorUnits(input.amount),
      currency: preferredCurrency || requestedCurrency,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: {
        ...input.metadata,
        description: input.description,
      },
    };

    let response: any;
    try {
      response = await this.request({
        method: 'POST',
        path: '/transaction/initialize',
        secret,
        body: initPayload,
      });
    } catch (error) {
      if (!this.isCurrencyUnsupportedError(error) || !initPayload.currency) {
        throw error;
      }

      this.logger.warn(`Paystack rejected currency "${initPayload.currency}". Retrying without explicit currency.`);
      response = await this.request({
        method: 'POST',
        path: '/transaction/initialize',
        secret,
        body: {
          ...initPayload,
          currency: undefined,
        },
      });
    }

    if (!response?.status || !response?.data?.authorization_url) {
      throw new BadRequestException('Unable to initialize Paystack checkout.');
    }

    return {
      checkoutUrl: response.data.authorization_url,
      providerTransactionId: response.data.access_code ?? String(response.data.id ?? ''),
      providerPayload: {
        provider: 'paystack',
        accessCode: response.data.access_code,
      },
    };
  }

  async verifyTransaction(reference: string): Promise<{
    status: PaymentStatus;
    providerTransactionId?: string;
    payload: Record<string, unknown>;
  }> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException('Paystack verification is not configured.');
    }
    const secret = this.configService.get<string>('PAYSTACK_SECRET_KEY') as string;

    const response = await this.request({
      method: 'GET',
      path: `/transaction/verify/${encodeURIComponent(reference)}`,
      secret,
    });

    if (!response?.status || !response?.data) {
      throw new BadRequestException('Unable to verify Paystack transaction.');
    }

    const normalizedStatus = this.mapPaystackStatus(response.data.status) ?? PaymentStatus.PROCESSING;

    return {
      status: normalizedStatus,
      providerTransactionId: response.data.id !== undefined ? String(response.data.id) : undefined,
      payload: response.data as Record<string, unknown>,
    };
  }

  verifyWebhookSignature(
    payload: Record<string, unknown>,
    signatureHeader: string | undefined,
  ): boolean {
    const secret = this.configService.get<string>('PAYSTACK_WEBHOOK_SECRET')
      ?? this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!secret || !signatureHeader) {
      return false;
    }

    const computed = createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return computed === signatureHeader;
  }

  extractWebhook(payload: Record<string, unknown>): {
    reference?: string;
    providerTransactionId?: string;
    status?: PaymentStatus;
    eventType: string;
  } {
    const eventType = typeof payload.event === 'string'
      ? payload.event
      : 'paystack.webhook';
    const data = this.asObject(payload.data);
    const reference = typeof data?.reference === 'string' ? data.reference : undefined;
    const providerTransactionId = data?.id !== undefined
      ? String(data.id)
      : undefined;
    const status = this.mapPaystackStatus(data?.status);

    return {
      reference,
      providerTransactionId,
      status,
      eventType,
    };
  }

  private mapPaystackStatus(status: unknown): PaymentStatus | undefined {
    if (typeof status !== 'string') {
      return undefined;
    }

    const value = status.toLowerCase();
    if (value === 'success') return PaymentStatus.SUCCESS;
    if (['abandoned', 'failed', 'reversed'].includes(value)) return PaymentStatus.FAILED;
    if (['pending', 'queued', 'ongoing'].includes(value)) return PaymentStatus.PROCESSING;
    return undefined;
  }

  private toMinorUnits(amount: number): number {
    return Math.round(amount * 100);
  }

  private async request(params: {
    method: 'GET' | 'POST';
    path: string;
    secret: string;
    body?: Record<string, unknown>;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}${params.path}`, {
      method: params.method,
      headers: {
        Authorization: `Bearer ${params.secret}`,
        'Content-Type': 'application/json',
      },
      body: params.body ? JSON.stringify(params.body) : undefined,
    });

    const payload = await this.safeJson(response);

    if (!response.ok) {
      const message = this.extractMessage(payload)
        ?? `Paystack request failed with HTTP ${response.status}`;
      throw new BadRequestException(message);
    }

    return payload;
  }

  private async safeJson(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  private extractMessage(payload: any): string | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }
    return typeof payload.message === 'string' ? payload.message : null;
  }

  private isCurrencyUnsupportedError(error: unknown): boolean {
    if (!(error instanceof HttpException)) {
      return false;
    }

    const response = error.getResponse();
    const message = typeof response === 'string'
      ? response
      : typeof response === 'object' && response && 'message' in response
        ? String((response as { message?: unknown }).message ?? '')
        : '';

    return message.toLowerCase().includes('currency not supported');
  }

  private asObject(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, unknown>;
  }
}
