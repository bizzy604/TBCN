import { PaymentStatus } from '../enums/payment-status.enum';

export interface CheckoutInitInput {
  reference: string;
  amount: number;
  currency: string;
  description: string;
  email: string;
  phone?: string | null;
  callbackUrl: string;
  webhookUrl: string;
  metadata?: Record<string, unknown>;
}

export interface CheckoutInitResult {
  checkoutUrl: string;
  providerTransactionId?: string;
  providerPayload?: Record<string, unknown>;
  status?: PaymentStatus;
}
