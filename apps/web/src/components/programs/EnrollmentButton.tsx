'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEnroll, useProgramEnrollmentCheckout } from '@/hooks/use-enrollments';
import { useAuth } from '@/hooks/use-auth';
import type { PaymentMethod } from '@/lib/api/payments';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type PaystackInlineCallbacks = {
  onSuccess?: (payload: { reference?: string }) => void;
  onCancel?: () => void;
  onError?: (payload: { message?: string }) => void;
};

type PaystackInlineInstance = {
  resumeTransaction: (accessCode: string, callbacks?: PaystackInlineCallbacks) => void;
};

type PaystackInlineConstructor = new () => PaystackInlineInstance;

interface EnrollmentButtonProps {
  programId: string;
  programSlug?: string;
  programTitle?: string;
  isFree: boolean;
  price: number;
  currency: string;
  isEnrolled?: boolean;
  enrollmentId?: string;
  className?: string;
}

function formatPrice(value: number, currency: string) {
  if (value === 0) {
    return 'Free';
  }

  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency || 'KES',
    minimumFractionDigits: 0,
  }).format(Number(value));
}

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

export function EnrollmentButton({
  programId,
  programSlug,
  programTitle,
  isFree,
  price,
  currency,
  isEnrolled = false,
  enrollmentId,
  className,
}: EnrollmentButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const enrollMutation = useEnroll();
  const checkoutMutation = useProgramEnrollmentCheckout();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [message, setMessage] = useState<string | null>(null);

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

  const requireAuth = () => {
    if (user) return true;
    const redirectPath = programSlug ? `/programs/${programSlug}` : '/programs';
    router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    return false;
  };

  const handleStartCheckout = async () => {
    if (!requireAuth()) {
      return;
    }

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
      const transaction = await checkoutMutation.mutateAsync({
        programId,
        payload: {
          amount: Number(price),
          currency,
          paymentMethod,
          phone: paymentMethod === 'mpesa' ? phone : undefined,
          returnPath: programSlug ? `/programs/${programSlug}` : '/programs',
          description: programTitle
            ? `Program enrollment payment: ${programTitle}`
            : 'Program enrollment payment',
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

      if (transaction.status === 'success') {
        setMessage('Payment successful. Click "Enroll After Payment" to join this program.');
        return;
      }

      setMessage('Payment initialized. Complete payment, then click "Enroll After Payment".');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Could not start checkout.');
    }
  };

  const handleEnroll = async () => {
    if (!requireAuth()) {
      return;
    }

    if (isEnrolled && enrollmentId) {
      router.push('/enrollments');
      return;
    }

    try {
      await enrollMutation.mutateAsync(programId);
      toast.success('Successfully enrolled.');
      router.push('/enrollments');
    } catch (error: any) {
      const errMessage = error?.error?.message || error?.message || 'Failed to enroll. Please try again.';
      setMessage(errMessage);
      toast.error(errMessage);
    }
  };

  if (isEnrolled) {
    return (
      <button onClick={handleEnroll} className={cn('btn btn-secondary w-full', className)} type="button">
        Continue Learning
      </button>
    );
  }

  if (isFree) {
    return (
      <button
        onClick={handleEnroll}
        disabled={enrollMutation.isPending}
        className={cn('btn btn-primary w-full', className)}
        type="button"
      >
        {enrollMutation.isPending ? 'Enrolling...' : 'Enroll for Free'}
      </button>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <p className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
        This is a paid program. Complete payment first, then enroll.
      </p>

      <label>
        <span className="label">Payment Method</span>
        <select
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
          className="input"
        >
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

      <button
        type="button"
        onClick={handleStartCheckout}
        disabled={checkoutMutation.isPending}
        className="btn btn-outline w-full"
      >
        {checkoutMutation.isPending
          ? 'Starting checkout...'
          : `Pay ${formatPrice(price, currency)}`}
      </button>

      <button
        onClick={handleEnroll}
        disabled={enrollMutation.isPending}
        className="btn btn-primary w-full"
        type="button"
      >
        {enrollMutation.isPending ? 'Enrolling...' : 'Enroll After Payment'}
      </button>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
