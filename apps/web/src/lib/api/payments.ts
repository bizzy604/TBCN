import { api } from './client';

export type PaymentMethod = 'card' | 'mpesa' | 'flutterwave' | 'paypal';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  userId: string;
  reference: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  type: string;
  description: string | null;
  providerTransactionId: string | null;
  checkoutUrl: string | null;
  completedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: 'active' | 'trial' | 'cancelled' | 'expired';
  startsAt: string;
  renewsAt: string | null;
  cancelledAt: string | null;
  lastTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const paymentsApi = {
  initiateCheckout: (payload: {
    amount: number;
    currency?: string;
    paymentMethod?: PaymentMethod;
    plan?: string;
    description?: string;
    returnPath?: string;
  }) => api.post<Transaction>('/payments/checkout', payload),

  upgradeSubscription: (payload: {
    amount: number;
    currency?: string;
    paymentMethod?: PaymentMethod;
    plan?: string;
    description?: string;
    returnPath?: string;
  }) => api.post<Transaction>('/payments/subscription/upgrade', payload),

  confirmPayment: (payload: {
    reference: string;
    status: PaymentStatus;
    providerTransactionId?: string;
  }) => api.post<Transaction>('/payments/callback', payload),

  getMyTransactions: (page = 1, limit = 20, status?: PaymentStatus) =>
    api.getRaw<PaginatedTransactions>('/payments/transactions', { params: { page, limit, status } }),

  getAdminTransactions: (page = 1, limit = 20, status?: PaymentStatus) =>
    api.getRaw<PaginatedTransactions>('/payments/admin/transactions', { params: { page, limit, status } }),

  getTransactionById: (id: string) => api.get<Transaction>(`/payments/transactions/${id}`),

  getMySubscription: () => api.get<Subscription>('/payments/subscription/me'),

  cancelSubscription: () => api.patch<Subscription>('/payments/subscription/cancel'),
};
