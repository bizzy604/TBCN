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
    return <div className="card h-80 animate-pulse bg-muted/55" />;
  }

  if (!product) {
    return <div className="card p-8 text-sm text-muted-foreground">Product not found.</div>;
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
          // fall back to redirect below
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
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr),360px]">
      <section className="space-y-4">
        <article className="card overflow-hidden p-0">
          <div className="h-60 bg-gradient-to-br from-secondary/30 to-accent/30">
            {product.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.thumbnailUrl} alt={product.title} className="h-full w-full object-cover" />
            ) : null}
          </div>

          <div className="space-y-3 p-5">
            <span className="badge bg-muted text-foreground capitalize">{product.type.replace('_', ' ')}</span>
            <h2 className="text-2xl font-semibold text-foreground">{product.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{product.description}</p>
            <p className="text-lg font-semibold text-foreground">{formatPrice(product.currency, product.price)}</p>
          </div>
        </article>
      </section>

      <aside>
        <article className="card sticky top-24 p-5">
          <h3 className="text-lg font-semibold">Checkout & Payment</h3>

          <div className="mt-4 space-y-3">
            <label>
              <span className="label">Quantity</span>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                className="input"
              />
            </label>

            <label>
              <span className="label">Payment Method</span>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} className="input">
                <option value="card">Stripe/Card</option>
                <option value="mpesa">M-PESA</option>
                <option value="paypal">PayPal</option>
                <option value="flutterwave">Flutterwave</option>
              </select>
            </label>

            {paymentMethod === 'mpesa' && (
              <label>
                <span className="label">M-PESA Phone</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="07XXXXXXXX or 2547XXXXXXXX"
                  className="input"
                />
                <p className="mt-1 text-xs text-muted-foreground">You will receive an STK push prompt.</p>
              </label>
            )}

            <div>
              <span className="label">Promo Code</span>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="WELCOME20"
                  className="input"
                />
                <button type="button" onClick={handleValidateCoupon} disabled={validateCoupon.isPending} className="btn btn-outline">
                  Apply
                </button>
              </div>
              {couponFeedback && <p className="mt-2 text-xs text-muted-foreground">{couponFeedback}</p>}
            </div>

            <div className="rounded-xl border border-border bg-background p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{formatPrice(product.currency, subtotal)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/45 p-3 text-xs text-muted-foreground">
              Secure checkout protected by encrypted payment processing.
            </div>

            {feedback && <p className="text-sm text-muted-foreground">{feedback}</p>}

            <button type="button" onClick={handleCheckout} disabled={createOrder.isPending} className="btn btn-primary w-full">
              {createOrder.isPending ? 'Starting checkout...' : 'Complete Payment'}
            </button>
          </div>
        </article>
      </aside>
    </div>
  );
}
