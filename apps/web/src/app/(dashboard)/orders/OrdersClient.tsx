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
    () => ({ page, limit: 20, status: status || undefined }),
    [page, status],
  );

  const { data, isLoading } = useMyOrders(query);
  const rows = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Orders</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Purchase History</h1>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="max-w-xs flex-1">
            <span className="label">Filter by status</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as '' | OrderStatus);
                setPage(1);
              }}
              className="input"
            >
              {statusOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Link href="/store" className="btn btn-primary">
            Browse Store
          </Link>
        </div>

        {isLoading ? (
          <div className="card h-56 animate-pulse bg-muted/55" />
        ) : rows.length === 0 ? (
          <div className="card p-10 text-center text-sm text-muted-foreground">You do not have any orders yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/45 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Invoice</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Items</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="px-3 py-3 font-medium text-foreground">{order.invoiceNumber}</td>
                    <td className="px-3 py-3 text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-3 text-muted-foreground">{order.items.length}</td>
                    <td className="px-3 py-3 text-foreground">{order.currency} {Number(order.total).toFixed(2)}</td>
                    <td className="px-3 py-3 capitalize text-muted-foreground">{order.status.replace('_', ' ')}</td>
                    <td className="px-3 py-3 text-right">
                      <Link href={`/orders/${order.id}`} className="btn btn-sm btn-outline">
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
          <div className="flex items-center justify-center gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!meta.hasPreviousPage}
              className="btn btn-sm btn-outline"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {meta.page} of {meta.totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!meta.hasNextPage}
              className="btn btn-sm btn-outline"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
