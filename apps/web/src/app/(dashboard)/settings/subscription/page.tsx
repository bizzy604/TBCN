'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks';
import {
  useCancelSubscription,
  useMySubscription,
  useMyTransactions,
  useUpgradeSubscription,
} from '@/hooks/use-payments';
import type { PaymentMethod } from '@/lib/api/payments';

type PaystackInlineCallbacks = {
  onSuccess?: (payload: { reference?: string }) => void;
  onCancel?: () => void;
  onError?: (payload: { message?: string }) => void;
};

type PaystackInlineInstance = {
  resumeTransaction: (accessCode: string, callbacks?: PaystackInlineCallbacks) => void;
};

type PaystackInlineConstructor = new () => PaystackInlineInstance;

const plans = [
  { id: 'free', name: 'Free', amount: 0, currency: 'USD', features: ['Community access', 'Basic dashboard'] },
  { id: 'pro', name: 'Pro', amount: 29.99, currency: 'USD', features: ['All free features', 'Priority support', 'Advanced insights'] },
  { id: 'enterprise', name: 'Enterprise', amount: 99.0, currency: 'USD', features: ['All pro features', 'Team access', 'Dedicated manager'] },
] as const;

function isValidMpesaPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return (
    (digits.startsWith('254') && digits.length === 12)
    || (digits.startsWith('0') && digits.length === 10)
    || (digits.startsWith('7') && digits.length === 9)
  );
}

function extractPaystackAccessCode(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const providerPayload = (metadata as Record<string, unknown>).providerPayload;
  if (!providerPayload || typeof providerPayload !== 'object' || Array.isArray(providerPayload)) {
    return null;
  }

  const accessCode = (providerPayload as Record<string, unknown>).accessCode;
  return typeof accessCode === 'string' ? accessCode : null;
}

function extractProvider(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const provider = (metadata as Record<string, unknown>).provider;
  return typeof provider === 'string' ? provider.toLowerCase() : null;
}

export default function SubscriptionSettingsPage() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const { user } = useAuth();
  const { data: subscription, isLoading } = useMySubscription();
  const { data: transactions } = useMyTransactions(1, 10);
  const upgrade = useUpgradeSubscription();
  const cancel = useCancelSubscription();

  const currentPlan = subscription?.plan ?? 'free';

  useEffect(() => {
    if (user?.phone) {
      setMpesaPhone((prev) => prev || user.phone || '');
    }
  }, [user?.phone]);

  const openPaystackInline = async (accessCode: string, reference: string) => {
    const { default: PaystackPop } = await import('@paystack/inline-js');
    const PopupConstructor = PaystackPop as unknown as PaystackInlineConstructor;
    const popup = new PopupConstructor();

    popup.resumeTransaction(accessCode, {
      onSuccess: (payload) => {
        const resolvedReference = payload?.reference || reference;
        window.location.href = `/payments/confirmation?reference=${encodeURIComponent(resolvedReference)}&provider=paystack&status=success`;
      },
      onCancel: () => {
        window.location.href = `/payments/confirmation?reference=${encodeURIComponent(reference)}&provider=paystack&status=cancelled`;
      },
      onError: () => {
        window.location.href = `/payments/confirmation?reference=${encodeURIComponent(reference)}&provider=paystack&status=failed`;
      },
    });
  };

  const handleUpgrade = async (planId: string, amount: number, currency: string) => {
    setFeedback(null);
    const phone = mpesaPhone.trim();

    if (paymentMethod === 'mpesa') {
      if (!phone) {
        setFeedback('Enter the M-PESA number to receive STK push.');
        return;
      }

      if (!isValidMpesaPhone(phone)) {
        setFeedback('Use a valid Kenyan mobile number: 07XXXXXXXX, 7XXXXXXXX, or 2547XXXXXXXX.');
        return;
      }
    }

    try {
      const tx = await upgrade.mutateAsync({
        amount,
        currency,
        paymentMethod,
        plan: planId,
        description: `Upgrade to ${planId} plan`,
        phone: paymentMethod === 'mpesa' ? phone : undefined,
        returnPath: '/settings/subscription',
        couponCode: couponCode.trim() || undefined,
      });

      const provider = extractProvider(tx.metadata);
      const accessCode = extractPaystackAccessCode(tx.metadata);
      const shouldUsePaystackInline = (
        paymentMethod === 'card'
        || paymentMethod === 'paystack'
        || provider === 'paystack'
      );

      if (shouldUsePaystackInline && accessCode) {
        try {
          await openPaystackInline(accessCode, tx.reference);
          return;
        } catch {
          if (tx.checkoutUrl) {
            window.location.href = tx.checkoutUrl;
            return;
          }
          setFeedback('Could not open Paystack popup. Please try again.');
          return;
        }
      }

      if (tx.checkoutUrl) {
        window.location.href = tx.checkoutUrl;
        return;
      }

      setFeedback('Checkout initialized, but checkout URL is missing.');
    } catch (error: any) {
      setFeedback(error?.error?.message || error?.message || 'Upgrade failed');
    }
  };

  const handleCancel = async () => {
    setFeedback(null);
    try {
      await cancel.mutateAsync();
      setFeedback('Subscription cancelled successfully.');
    } catch (error: any) {
      setFeedback(error?.error?.message || error?.message || 'Cancellation failed');
    }
  };

  const txRows = useMemo(() => transactions?.data ?? [], [transactions]);

  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="mt-2 text-muted-foreground">Manage your plan, billing, and payment history.</p>
        </div>

        {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Current Plan</h2>
              {isLoading ? (
                <p className="mt-1 text-sm text-muted-foreground">Loading...</p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground capitalize">
                  {subscription?.plan ?? 'free'} • {subscription?.status ?? 'active'}
                </p>
              )}
              {subscription?.renewsAt && (
                <p className="mt-1 text-xs text-muted-foreground">Renews on {new Date(subscription.renewsAt).toLocaleDateString()}</p>
              )}
            </div>
            {currentPlan !== 'free' && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancel.isPending}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
              >
                {cancel.isPending ? 'Cancelling...' : 'Cancel Plan'}
              </button>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upgrade Plan</h2>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="card">Card (Paystack)</option>
              <option value="mpesa">M-PESA</option>
              <option value="flutterwave">Flutterwave</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <label className="block text-sm font-medium">Coupon Code (Optional)</label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME20"
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          {paymentMethod === 'mpesa' && (
            <div className="rounded-lg border border-border bg-card p-4">
              <label className="block text-sm font-medium">M-PESA Phone Number</label>
              <input
                type="tel"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                placeholder="07XXXXXXXX or 2547XXXXXXXX"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                We send an STK push to this number. It will also be saved to your profile for the next payment.
              </p>
            </div>
          )}

          {(paymentMethod === 'card' || paymentMethod === 'paystack') && (
            <p className="text-xs text-muted-foreground">
              Card payments open a secure Paystack popup checkout.
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const active = currentPlan === plan.id && subscription?.status === 'active';
              return (
                <div key={plan.id} className={`rounded-lg border p-4 ${active ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.amount === 0 ? 'Free' : `${plan.currency} ${plan.amount}/month`}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature}>• {feature}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={active || plan.id === 'free' || upgrade.isPending}
                    onClick={() => handleUpgrade(plan.id, plan.amount, plan.currency)}
                    className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                  >
                    {active ? 'Current Plan' : `Choose ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          {txRows.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-2 py-2">Reference</th>
                    <th className="px-2 py-2">Amount</th>
                    <th className="px-2 py-2">Method</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {txRows.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/60">
                      <td className="px-2 py-2">{tx.reference}</td>
                      <td className="px-2 py-2">{tx.currency} {tx.amount}</td>
                      <td className="px-2 py-2 capitalize">{tx.paymentMethod}</td>
                      <td className="px-2 py-2 capitalize">{tx.status}</td>
                      <td className="px-2 py-2">{new Date(tx.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Card>
  );
}
