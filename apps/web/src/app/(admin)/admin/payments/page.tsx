'use client';

import { useEffect, useState } from 'react';
import { paymentsApi, type Transaction } from '@/lib/api/payments';

export default function AdminPaymentsPage() {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await paymentsApi.getAdminTransactions(1, 50);
        setRows(result.data);
      } catch (e: any) {
        setError(e?.error?.message || e?.message || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Review recent platform transactions.</p>
      </div>

      {error && <p className="text-sm text-muted-foreground">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading transactions...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions available.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card p-4">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-2 py-2">Reference</th>
                <th className="px-2 py-2">User</th>
                <th className="px-2 py-2">Amount</th>
                <th className="px-2 py-2">Method</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((tx) => (
                <tr key={tx.id} className="border-b border-border/60">
                  <td className="px-2 py-2">{tx.reference}</td>
                  <td className="px-2 py-2">{(tx as any).user?.email || tx.userId}</td>
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
    </div>
  );
}
