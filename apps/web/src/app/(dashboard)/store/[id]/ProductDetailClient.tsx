'use client';

import { useState } from 'react';
import { useCreateOrder, useProductDetail, useValidateCoupon } from '@/hooks/use-commerce';
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

function formatPrice(currency: string, amount: number): string {
  return `${currency.toUpperCase()} ${Number(amount).toFixed(2)}`;
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

interface ProductDetailClientProps {
  productId: string;
}

export default function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const { data: product, isLoading } = useProductDetail(productId);
  const createOrder = useCreateOrder();
  const validateCoupon = useValidateCoupon();

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [phone, setPhone] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

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

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg border border-border bg-muted/30" />;
  }

  if (!product) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
        Product not found.
      </div>
    );
  }

  const subtotal = Number(product.price) * quantity;

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponFeedback('Enter a coupon code first.');
      return;
    }

    setCouponFeedback(null);
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponCode.trim(),
        amount: subtotal,
        currency: product.currency,
      });

      if (result.valid && result.data) {
        setCouponFeedback(
          `Coupon applied: -${result.data.discountAmount.toFixed(2)} ${result.data.currency}. New total ${result.data.finalAmount.toFixed(2)} ${result.data.currency}.`,
        );
      } else {
        setCouponFeedback(result.message || 'Coupon is not valid for this checkout.');
      }
    } catch (error: any) {
      setCouponFeedback(error?.error?.message || error?.message || 'Coupon validation failed.');
    }
  };

  const handleCheckout = async () => {
    setFeedback(null);

    if (paymentMethod === 'mpesa') {
      if (!phone.trim()) {
        setFeedback('Enter an M-PESA phone number to receive STK push.');
        return;
      }
      if (!isValidMpesaPhone(phone)) {
        setFeedback('Use a valid Kenyan number: 07XXXXXXXX, 7XXXXXXXX, or 2547XXXXXXXX.');
        return;
      }
    }

    try {
      const result = await createOrder.mutateAsync({
        items: [{ productId: product.id, quantity }],
        paymentMethod,
        currency: product.currency,
        phone: paymentMethod === 'mpesa' ? phone.trim() : undefined,
        returnPath: '/orders',
        couponCode: couponCode.trim() || undefined,
      });

      const accessCode = extractPaystackAccessCode(result.transaction.metadata);
      const useInline = paymentMethod === 'card' || paymentMethod === 'paystack';
      if (useInline && accessCode) {
        try {
          await openPaystackInline(accessCode, result.transaction.reference);
          return;
        } catch {
          // fall back to normal redirect below
        }
      }

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }

      setFeedback('Order created, but checkout URL was not provided.');
    } catch (error: any) {
      setFeedback(error?.error?.message || error?.message || 'Could not start checkout.');
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="space-y-5 lg:col-span-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 h-56 rounded-md bg-muted/30">
            {product.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.thumbnailUrl}
                alt={product.title}
                className="h-full w-full rounded-md object-cover"
              />
            ) : null}
          </div>

          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
              {product.type.replace('_', ' ')}
            </span>
            <h2 className="text-2xl font-semibold">{product.title}</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
            <p className="text-lg font-semibold">{formatPrice(product.currency, product.price)}</p>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-lg font-semibold">Checkout</h3>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="card">Card (Paystack)</option>
                <option value="mpesa">M-PESA</option>
                <option value="flutterwave">Flutterwave</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {paymentMethod === 'mpesa' && (
              <div>
                <label className="mb-1 block text-sm font-medium">M-PESA Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="07XXXXXXXX or 2547XXXXXXXX"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">Coupon Code (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="WELCOME20"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleValidateCoupon}
                  disabled={validateCoupon.isPending}
                  className="rounded-md border border-border px-3 py-2 text-sm"
                >
                  Validate
                </button>
              </div>
              {couponFeedback && <p className="mt-2 text-xs text-muted-foreground">{couponFeedback}</p>}
            </div>

            <div className="rounded-md bg-muted/30 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(product.currency, subtotal)}</span>
              </div>
            </div>

            {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={createOrder.isPending}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {createOrder.isPending ? 'Starting Checkout...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
