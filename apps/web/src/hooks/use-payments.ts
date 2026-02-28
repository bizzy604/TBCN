'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, type PaymentStatus } from '@/lib/api/payments';

export const paymentKeys = {
  all: ['payments'] as const,
  subscription: () => ['payments', 'subscription'] as const,
  transactions: (page = 1, limit = 20, status?: PaymentStatus) =>
    ['payments', 'transactions', page, limit, status] as const,
  transaction: (id: string) => ['payments', 'transaction', id] as const,
};

export function useMySubscription() {
  return useQuery({
    queryKey: paymentKeys.subscription(),
    queryFn: () => paymentsApi.getMySubscription(),
  });
}

export function useMyTransactions(page = 1, limit = 20, status?: PaymentStatus) {
  return useQuery({
    queryKey: paymentKeys.transactions(page, limit, status),
    queryFn: () => paymentsApi.getMyTransactions(page, limit, status),
  });
}

export function useInitiateCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.initiateCheckout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.upgradeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.subscription() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.subscription() });
    },
  });
}

export function useConfirmPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.confirmPayment,
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.subscription() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentKeys.transaction(payload.reference) });
    },
  });
}
