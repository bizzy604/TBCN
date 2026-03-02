'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useEvent,
  useEventAccessLink,
  useEventCheckout,
  useMyEventRegistrations,
  useRegisterEvent,
} from '@/hooks/use-engagement';
import { useAuth } from '@/hooks';
import type { PaymentMethod } from '@/lib/api/payments';
import { createCheckoutIdempotencyKey } from '@/lib/payment-idempotency';

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

function isPaymentRequiredError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('complete payment first') || normalized.includes('paid event');
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
  const checkoutKeyRef = useRef<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const registration = useMemo(
    () => (registrations ?? []).find((entry) => entry.eventId === eventId && entry.status !== 'cancelled'),
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
      const idempotencyKey = checkoutKeyRef.current
        ?? createCheckoutIdempotencyKey('event', eventId);
      checkoutKeyRef.current = idempotencyKey;

      const transaction = await checkoutEvent.mutateAsync({
        id: eventId,
        payload: {
          amount: Number(event.price),
          currency: event.currency,
          paymentMethod,
          phone: paymentMethod === 'mpesa' ? phone : undefined,
          returnPath: `/events/${eventId}`,
          description: `Event access payment: ${event.title}`,
          idempotencyKey,
        },
      });

      const provider = extractProvider(transaction.metadata);
      const accessCode = extractPaystackAccessCode(transaction.metadata);
      const shouldUsePaystackInline = paymentMethod === 'card' || paymentMethod === 'paystack' || provider === 'paystack';

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
      setMessage('Registration successful. Live link appears below when available.');
    } catch (error: any) {
      const errMessage = error?.error?.message || error?.message || 'Registration failed';
      if (requiresPayment && isPaymentRequiredError(errMessage)) {
        setMessage('Payment required. Redirecting to checkout...');
        await handleCheckout();
        return;
      }
      setMessage(errMessage);
    }
  };

  if (isLoading) {
    return <div className="card h-72 animate-pulse bg-muted/55" />;
  }

  if (!event) {
    return <div className="card p-8 text-sm text-muted-foreground">Event not found.</div>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr),360px]">
      <section className="space-y-4">
        <article className="card overflow-hidden p-0">
          <div className="h-52 bg-gradient-to-br from-secondary/35 to-accent/35" />
          <div className="space-y-3 p-5">
            <h2 className="text-2xl font-semibold text-foreground">{event.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{event.description}</p>

            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <p>Start: {new Date(event.startAt).toLocaleString()}</p>
              <p>End: {new Date(event.endAt).toLocaleString()}</p>
              <p>Format: {event.locationType}</p>
              <p>Price: {event.currency} {event.price}</p>
              {event.location && <p className="sm:col-span-2">Location: {event.location}</p>}
            </div>
          </div>
        </article>

        {isRegistered && accessLink.data?.meetingUrl && (
          <article className="card p-4">
            <p className="text-sm font-semibold text-foreground">Live Event Link</p>
            <a href={accessLink.data.meetingUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block break-all text-sm font-medium text-secondary underline">
              {accessLink.data.meetingUrl}
            </a>
          </article>
        )}

        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </section>

      <aside>
        <article className="card sticky top-24 p-5">
          <h3 className="text-lg font-semibold">Registration</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {requiresPayment ? 'Complete checkout then register for event access.' : 'Register now to reserve your slot.'}
          </p>

          {requiresPayment && !isRegistered && (
            <div className="mt-4 space-y-3 rounded-xl border border-border bg-background p-3">
              <label>
                <span className="label">Payment Method</span>
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} className="input">
                  <option value="card">Card (Paystack)</option>
                  <option value="mpesa">M-PESA</option>
                  <option value="flutterwave">Flutterwave</option>
                  <option value="paypal">PayPal</option>
                </select>
              </label>

              {paymentMethod === 'mpesa' && (
                <label>
                  <span className="label">M-PESA Phone</span>
                  <input
                    value={mpesaPhone}
                    onChange={(event) => setMpesaPhone(event.target.value)}
                    className="input"
                    placeholder="07XXXXXXXX or 2547XXXXXXXX"
                  />
                </label>
              )}

              <button type="button" onClick={handleCheckout} disabled={checkoutEvent.isPending} className="btn btn-outline w-full">
                {checkoutEvent.isPending ? 'Processing...' : `Pay ${event.currency} ${event.price}`}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleRegister}
            disabled={registerEvent.isPending || checkoutEvent.isPending || isRegistered}
            className="btn btn-primary mt-4 w-full"
          >
            {isRegistered
              ? 'Registered'
              : checkoutEvent.isPending
                ? 'Starting checkout...'
                : registerEvent.isPending
                  ? 'Registering...'
                  : requiresPayment
                    ? 'Pay & Register'
                    : 'Register for Event'}
          </button>
        </article>
      </aside>
    </div>
  );
}
