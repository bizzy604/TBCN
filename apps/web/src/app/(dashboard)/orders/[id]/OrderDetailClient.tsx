'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  useCancelOrder,
  useOrderDetail,
  useOrderInvoice,
  useRequestOrderDownload,
} from '@/hooks/use-commerce';

interface OrderDetailClientProps {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const { data: order, isLoading, refetch } = useOrderDetail(orderId);
  const { data: invoice } = useOrderInvoice(orderId);
  const cancelOrder = useCancelOrder();
  const requestDownload = useRequestOrderDownload();

  const [message, setMessage] = useState<string | null>(null);

  const canCancel = order?.status === 'pending_payment';
  const totals = useMemo(() => {
    if (!order) {
      return null;
    }
    return {
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
    };
  }, [order]);

  const handleCancelOrder = async () => {
    if (!order) {
      return;
    }
    setMessage(null);
    try {
      await cancelOrder.mutateAsync(order.id);
      await refetch();
      setMessage('Order cancelled successfully.');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Could not cancel order.');
    }
  };

  const handleDownload = async (itemId: string) => {
    setMessage(null);
    try {
      const result = await requestDownload.mutateAsync({ orderId, itemId });
      window.open(result.downloadUrl, '_blank', 'noopener,noreferrer');
      await refetch();
      setMessage(`Download started. Remaining downloads: ${result.remainingDownloads}`);
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Could not prepare download.');
    }
  };

  if (isLoading) {
    return <div className="h-56 animate-pulse rounded-lg border border-border bg-muted/30" />;
  }

  if (!order) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
        Order not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">{order.invoiceNumber}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Status: <span className="capitalize">{order.status.replace('_', ' ')}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(order.createdAt).toLocaleString()}
            </p>
            {order.couponCode && (
              <p className="text-sm text-muted-foreground">Coupon: {order.couponCode}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              href="/orders"
              className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
            >
              Back
            </Link>
            <button
              type="button"
              disabled={!canCancel || cancelOrder.isPending}
              onClick={handleCancelOrder}
              className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-50"
            >
              Cancel Order
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-lg font-semibold">Items</h3>
        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <article key={item.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.productTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty {item.quantity} • {order.currency} {Number(item.lineTotal).toFixed(2)}
                  </p>
                  {item.isDigital && (
                    <p className="text-xs text-muted-foreground">
                      Remaining downloads: {item.remainingDownloads}
                    </p>
                  )}
                </div>

                {item.isDigital && order.status === 'paid' && (
                  <button
                    type="button"
                    onClick={() => handleDownload(item.id)}
                    disabled={requestDownload.isPending}
                    className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                  >
                    Download
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {invoice && (
        <section className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-lg font-semibold">Invoice Summary</h3>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{invoice.currency} {Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{invoice.currency} {Number(invoice.tax).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>- {invoice.currency} {Number(invoice.discount).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span>{invoice.currency} {Number(invoice.total).toFixed(2)}</span>
            </div>
          </div>
        </section>
      )}

      {totals && !invoice && (
        <section className="rounded-lg border border-border bg-card p-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{order.currency} {totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{order.currency} {totals.tax.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Discount</span>
            <span>- {order.currency} {totals.discount.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-semibold">
            <span>Total</span>
            <span>{order.currency} {totals.total.toFixed(2)}</span>
          </div>
        </section>
      )}

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

