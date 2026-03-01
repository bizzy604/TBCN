'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks';
import {
  useEvent,
  useEventAccessLink,
  useEventCheckout,
  useMyEventRegistrations,
  useRegisterEvent,
} from '@/hooks/use-engagement';
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

interface EventDetailClientProps {
  eventId: string;
}

export default function EventDetailClient({ eventId }: EventDetailClientProps) {
  const { user } = useAuth();
  const { data: event, isLoading } = useEvent(eventId);
  const { data: registrations } = useMyEventRegistrations();
  const checkoutEvent = useEventCheckout();
  const registerEvent = useRegisterEvent();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const registration = useMemo(
    () => (registrations ?? []).find((item) => item.eventId === eventId && item.status !== 'cancelled'),
    [registrations, eventId],
  );
  const isRegistered = !!registration;
  const requiresPayment = Number(event?.price ?? 0) > 0;
  const accessLink = useEventAccessLink(eventId, isRegistered);

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

  const handleCheckout = async () => {
    if (!event) return;

    setMessage(null);
    const phone = mpesaPhone.trim();
    if (paymentMethod === 'mpesa') {
      if (!phone) {
        setMessage('Enter the M-PESA number to receive STK push.');
        return;
      }
      if (!isValidMpesaPhone(phone)) {
        setMessage('Use a valid Kenyan mobile number: 07XXXXXXXX, 7XXXXXXXX, or 2547XXXXXXXX.');
        return;
      }
    }

    try {
      const transaction = await checkoutEvent.mutateAsync({
        id: eventId,
        payload: {
          amount: Number(event.price),
          currency: event.currency,
          paymentMethod,
          phone: paymentMethod === 'mpesa' ? phone : undefined,
          returnPath: `/events/${eventId}`,
          description: `Event access payment: ${event.title}`,
        },
      });

      const provider = extractProvider(transaction.metadata);
      const accessCode = extractPaystackAccessCode(transaction.metadata);
      const shouldUsePaystackInline = (
        paymentMethod === 'card'
        || paymentMethod === 'paystack'
        || provider === 'paystack'
      );

      if (shouldUsePaystackInline && accessCode) {
        await openPaystackInline(accessCode, transaction.reference);
        return;
      }

      if (transaction.checkoutUrl) {
        window.location.href = transaction.checkoutUrl;
        return;
      }

      setMessage('Payment initialized. Complete payment, then return and register.');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Could not start event checkout.');
    }
  };

  const handleRegister = async () => {
    setMessage(null);
    try {
      await registerEvent.mutateAsync(eventId);
      setMessage('Registration successful. Live link appears below when access requirements are met.');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Registration failed');
    }
  };

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-lg border border-border bg-muted/30" />;
  }

  if (!event) {
    return <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8">Event not found.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-2xl font-semibold">{event.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>

        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>Start: {new Date(event.startAt).toLocaleString()}</p>
          <p>End: {new Date(event.endAt).toLocaleString()}</p>
          <p>Format: {event.locationType}</p>
          <p>Price: {event.currency} {event.price}</p>
          {event.location && <p>Location: {event.location}</p>}
          <p className="sm:col-span-2">
            Live link: available only after registration
            {requiresPayment ? ' and successful payment.' : '.'}
          </p>
        </div>

        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}

        {requiresPayment && !isRegistered && (
          <div className="mt-4 space-y-3 rounded-md border border-border p-3">
            <p className="text-sm font-medium">Paid Event Checkout</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="card">Card (Paystack)</option>
                <option value="mpesa">M-PESA</option>
                <option value="flutterwave">Flutterwave</option>
                <option value="paypal">PayPal</option>
              </select>
              {paymentMethod === 'mpesa' && (
                <input
                  type="tel"
                  value={mpesaPhone}
                  onChange={(event) => setMpesaPhone(event.target.value)}
                  placeholder="07XXXXXXXX or 2547XXXXXXXX"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              )}
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkoutEvent.isPending}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
            >
              {checkoutEvent.isPending ? 'Processing...' : `Pay ${event.currency} ${event.price}`}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleRegister}
          disabled={registerEvent.isPending || isRegistered}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {isRegistered ? 'Registered' : registerEvent.isPending ? 'Registering...' : 'Register for Event'}
        </button>

        {isRegistered && accessLink.data?.meetingUrl && (
          <div className="mt-4 rounded-md border border-border bg-muted/20 p-3 text-sm">
            <p className="font-medium">Live Event Link</p>
            <a
              href={accessLink.data.meetingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline break-all"
            >
              {accessLink.data.meetingUrl}
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

