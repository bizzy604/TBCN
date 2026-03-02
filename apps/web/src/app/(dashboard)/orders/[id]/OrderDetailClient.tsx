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
    if (!order) return null;
    return {
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
    };
  }, [order]);

  const handleCancelOrder = async () => {
    if (!order) return;
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
    return <div className="card h-72 animate-pulse bg-muted/55" />;
  }

  if (!order) {
    return <div className="card p-8 text-sm text-muted-foreground">Order not found.</div>;
  }

  return (
    <div className="space-y-4">
      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{order.invoiceNumber}</h2>
            <p className="mt-1 text-sm text-muted-foreground capitalize">Status: {order.status.replace('_', ' ')}</p>
            <p className="text-sm text-muted-foreground">Created: {new Date(order.createdAt).toLocaleString()}</p>
            {order.couponCode && <p className="text-sm text-muted-foreground">Coupon: {order.couponCode}</p>}
          </div>

          <div className="flex gap-2">
            <Link href="/orders" className="btn btn-outline btn-sm">
              Back
            </Link>
            <button type="button" disabled={!canCancel || cancelOrder.isPending} onClick={handleCancelOrder} className="btn btn-outline btn-sm">
              Cancel Order
            </button>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="text-lg font-semibold">Items</h3>
        <div className="mt-4 space-y-2">
          {order.items.map((item) => (
            <article key={item.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{item.productTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty {item.quantity} · {order.currency} {Number(item.lineTotal).toFixed(2)}
                  </p>
                  {item.isDigital && <p className="text-xs text-muted-foreground">Remaining downloads: {item.remainingDownloads}</p>}
                </div>

                {item.isDigital && order.status === 'paid' && (
                  <button type="button" onClick={() => handleDownload(item.id)} disabled={requestDownload.isPending} className="btn btn-sm btn-primary">
                    Download
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h3 className="text-lg font-semibold">Invoice Summary</h3>
        <div className="mt-3 space-y-1 text-sm">
          <SummaryRow label="Subtotal" value={`${order.currency} ${(invoice ? Number(invoice.subtotal) : totals?.subtotal || 0).toFixed(2)}`} />
          <SummaryRow label="Tax" value={`${order.currency} ${(invoice ? Number(invoice.tax) : totals?.tax || 0).toFixed(2)}`} />
          <SummaryRow label="Discount" value={`- ${order.currency} ${(invoice ? Number(invoice.discount) : totals?.discount || 0).toFixed(2)}`} />
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-semibold">
            <span>Total</span>
            <span>{order.currency} {(invoice ? Number(invoice.total) : totals?.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </section>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
