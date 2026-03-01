import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus } from '../enums/payment-status.enum';
import {
  CheckoutInitInput,
  CheckoutInitResult,
} from './processor.types';

@Injectable()
export class MpesaProcessor {
  private readonly logger = new Logger(MpesaProcessor.name);
  private readonly sandboxBaseUrl = 'https://sandbox.safaricom.co.ke';
  private readonly productionBaseUrl = 'https://api.safaricom.co.ke';

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    if (this.configService.get<string>('NODE_ENV') === 'test') {
      return false;
    }
    return Boolean(
      this.configService.get<string>('MPESA_CONSUMER_KEY')
      && this.configService.get<string>('MPESA_CONSUMER_SECRET')
      && this.configService.get<string>('MPESA_SHORTCODE')
      && this.configService.get<string>('MPESA_PASSKEY'),
    );
  }

  async createCheckout(input: CheckoutInitInput): Promise<CheckoutInitResult> {
    if (!input.phone) {
      throw new BadRequestException('M-PESA payments require a phone number on the user profile.');
    }

    if (!this.isConfigured()) {
      this.logger.warn('M-PESA credentials not set; using local checkout fallback.');
      return {
        checkoutUrl: `/payments/confirmation?reference=${encodeURIComponent(input.reference)}&status=processing&provider=mpesa`,
        status: PaymentStatus.PROCESSING,
        providerPayload: {
          mode: 'fallback',
          provider: 'mpesa',
        },
      };
    }

    const phone = this.normalizePhone(input.phone);
    const callbackUrl = this.resolveCallbackUrl(input.webhookUrl);
    const shortcode = this.requireConfig('MPESA_SHORTCODE');
    const passkey = this.requireConfig('MPESA_PASSKEY');
    const transactionType = this.configService.get<string>('MPESA_TRANSACTION_TYPE', 'CustomerPayBillOnline');
    const timestamp = this.getTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const accessToken = await this.getAccessToken();
    const amount = Math.max(1, Math.round(input.amount));

    const response = await this.request({
      method: 'POST',
      path: '/mpesa/stkpush/v1/processrequest',
      accessToken,
      body: {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: input.reference,
        TransactionDesc: input.description.slice(0, 100),
      },
    });

    if (response.ResponseCode !== '0') {
      const error = response.ResponseDescription || response.errorMessage || 'Unable to initialize M-PESA STK push.';
      throw new BadRequestException(error);
    }

    return {
      checkoutUrl: `/payments/confirmation?reference=${encodeURIComponent(input.reference)}&status=processing&provider=mpesa`,
      providerTransactionId: response.CheckoutRequestID,
      status: PaymentStatus.PROCESSING,
      providerPayload: {
        provider: 'mpesa',
        merchantRequestId: response.MerchantRequestID,
        checkoutRequestId: response.CheckoutRequestID,
        customerMessage: response.CustomerMessage,
      },
    };
  }

  extractWebhook(payload: Record<string, unknown>): {
    reference?: string;
    providerTransactionId?: string;
    providerPaymentId?: string;
    status?: PaymentStatus;
    eventType: string;
    payload: Record<string, unknown>;
  } {
    const body = this.asObject(payload.Body);
    const callback = this.asObject(body?.stkCallback);
    const metadata = this.extractMetadata(callback?.CallbackMetadata);
    const resultCode = typeof callback?.ResultCode === 'number'
      ? callback.ResultCode
      : Number(callback?.ResultCode);

    const reference = typeof metadata.AccountReference === 'string'
      ? metadata.AccountReference
      : undefined;

    return {
      reference,
      providerTransactionId: typeof callback?.CheckoutRequestID === 'string'
        ? callback.CheckoutRequestID
        : undefined,
      providerPaymentId: typeof metadata.MpesaReceiptNumber === 'string'
        ? metadata.MpesaReceiptNumber
        : undefined,
      status: Number.isNaN(resultCode)
        ? undefined
        : resultCode === 0
          ? PaymentStatus.SUCCESS
          : PaymentStatus.FAILED,
      eventType: 'mpesa.stk_callback',
      payload: {
        resultCode,
        resultDesc: callback?.ResultDesc,
        metadata,
      },
    };
  }

  private async getAccessToken(): Promise<string> {
    const consumerKey = this.requireConfig('MPESA_CONSUMER_KEY');
    const consumerSecret = this.requireConfig('MPESA_CONSUMER_SECRET');
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    const response = await fetch(`${this.getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const payload = await this.safeJson(response);
    if (!response.ok || typeof payload.access_token !== 'string') {
      throw new BadRequestException('Unable to get M-PESA access token.');
    }

    return payload.access_token;
  }

  private async request(params: {
    method: 'POST' | 'GET';
    path: string;
    accessToken: string;
    body?: Record<string, unknown>;
  }): Promise<any> {
    const response = await fetch(`${this.getBaseUrl()}${params.path}`, {
      method: params.method,
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: params.body ? JSON.stringify(params.body) : undefined,
    });

    const payload = await this.safeJson(response);
    if (!response.ok) {
      const message = this.extractMessage(payload) ?? `M-PESA request failed with HTTP ${response.status}`;
      throw new BadRequestException(message);
    }

    return payload;
  }

  private getBaseUrl(): string {
    const env = this.configService.get<string>('MPESA_ENV', 'sandbox').toLowerCase();
    return env === 'production' ? this.productionBaseUrl : this.sandboxBaseUrl;
  }

  private requireConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new BadRequestException(`${key} is required for M-PESA payments.`);
    }
    return value;
  }

  private getTimestamp(): string {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('254') && digits.length === 12) {
      return digits;
    }
    if (digits.startsWith('0') && digits.length === 10) {
      return `254${digits.slice(1)}`;
    }
    if (digits.startsWith('7') && digits.length === 9) {
      return `254${digits}`;
    }

    throw new BadRequestException('Phone number must be a valid Kenyan mobile number for M-PESA.');
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
    return typeof payload.errorMessage === 'string'
      ? payload.errorMessage
      : typeof payload.message === 'string'
        ? payload.message
        : null;
  }

  private asObject(value: unknown): Record<string, any> | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null;
    }
    return value as Record<string, any>;
  }

  private extractMetadata(value: unknown): Record<string, unknown> {
    const metadata = this.asObject(value);
    const items = Array.isArray(metadata?.Item) ? metadata.Item : [];
    const result: Record<string, unknown> = {};

    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const name = (item as Record<string, unknown>).Name;
      const val = (item as Record<string, unknown>).Value;
      if (typeof name === 'string') {
        result[name] = val;
      }
    }

    return result;
  }

  private resolveCallbackUrl(defaultUrl: string): string {
    const configured = this.configService.get<string>('MPESA_CALLBACK_URL')?.trim();
    const candidate = configured || defaultUrl;

    if (this.isPublicHttpsUrl(candidate)) {
      return candidate;
    }

    const fallback = this.configService.get<string>('MPESA_SANDBOX_CALLBACK_FALLBACK', 'https://example.com/mpesa/callback');
    if (this.isPublicHttpsUrl(fallback)) {
      this.logger.warn('M-PESA callback URL is not a public HTTPS URL. Using MPESA_SANDBOX_CALLBACK_FALLBACK; webhook confirmations may not reach this API.');
      return fallback;
    }

    throw new BadRequestException(
      'M-PESA callback URL must be a public HTTPS URL. Set MPESA_CALLBACK_URL to your public endpoint (for local dev, use an HTTPS tunnel like ngrok).',
    );
  }

  private isPublicHttpsUrl(value: string): boolean {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== 'https:') {
        return false;
      }

      const host = parsed.hostname.toLowerCase();
      if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
        return false;
      }

      if (host.endsWith('.local') || host.endsWith('.localhost')) {
        return false;
      }

      const isIpv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
      if (isIpv4) {
        const parts = host.split('.').map((part) => Number(part));
        const [a, b] = parts;

        const isPrivate =
          a === 10
          || (a === 172 && b >= 16 && b <= 31)
          || (a === 192 && b === 168)
          || a === 127;

        if (isPrivate) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }
}
