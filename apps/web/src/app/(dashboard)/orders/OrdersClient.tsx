'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useMyOrders } from '@/hooks/use-commerce';
import type { OrderStatus } from '@/lib/api/commerce';

const statusOptions: Array<{ label: string; value: '' | OrderStatus }> = [
  { label: 'All Statuses', value: '' },
  { label: 'Pending Payment', value: 'pending_payment' },
  { label: 'Paid', value: 'paid' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
];

export default function OrdersClient() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<'' | OrderStatus>('');
  const query = useMemo(
    () => ({
      page,
      limit: 20,
      status: status || undefined,
    }),
    [page, status],
  );

  const { data, isLoading } = useMyOrders(query);
  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="mt-2 text-muted-foreground">Manage purchases, invoices, and downloads.</p>
          </div>
          <Link
            href="/store"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Browse Store
          </Link>
        </div>

        <div className="max-w-xs">
          <label className="mb-1 block text-sm font-medium">Filter by Status</label>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as '' | OrderStatus);
              setPage(1);
            }}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        ) : rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
            You do not have any orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-2 py-2">Invoice</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Items</th>
                  <th className="px-2 py-2">Total</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr key={order.id} className="border-b border-border/60">
                    <td className="px-2 py-2">{order.invoiceNumber}</td>
                    <td className="px-2 py-2">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-2 py-2">{order.items.length}</td>
                    <td className="px-2 py-2">
                      {order.currency} {Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 capitalize">{order.status.replace('_', ' ')}</td>
                    <td className="px-2 py-2">
                      <Link
                        href={`/orders/${order.id}`}
                        className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!meta.hasPreviousPage}
              className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!meta.hasNextPage}
              className="rounded-md border border-border px-3 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

