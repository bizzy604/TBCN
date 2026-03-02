'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { useConfirmPayment } from '@/hooks/use-payments';
import type { PaymentStatus } from '@/lib/api/payments';

const statusMap: Record<string, PaymentStatus> = {
  success: 'success',
  failed: 'failed',
  cancelled: 'cancelled',
  processing: 'processing',
  pending: 'pending',
};

export default function PaymentConfirmationPage() {
  const params = useSearchParams();
  const confirm = useConfirmPayment();
  const [resultMessage, setResultMessage] = useState<string>('Confirming payment status...');
  const [destination, setDestination] = useState<{ href: string; label: string }>({
    href: '/settings/subscription',
    label: 'Back to Subscription',
  });

  const provider = (params.get('provider') || 'paystack').toLowerCase();
  const reference = params.get('reference') || params.get('trxref');
  const rawStatus = params.get('status') || (provider === 'mpesa' ? 'processing' : 'pending');
  const status = useMemo(() => statusMap[rawStatus.toLowerCase()] || 'processing', [rawStatus]);

  useEffect(() => {
    if (!reference) {
      setResultMessage('Missing payment reference.');
      return;
    }

    let active = true;
    const run = async () => {
      try {
        const transaction = await confirm.mutateAsync({ reference, status });
        const metadata = transaction.metadata ?? {};
        const returnPath = typeof metadata.returnPath === 'string' ? metadata.returnPath : null;
        const eventId = typeof metadata.eventId === 'string' ? metadata.eventId : null;

        const fallbackDestination = (() => {
          if (transaction.type === 'product') return { href: '/orders', label: 'View My Orders' };
          if (transaction.type === 'event_registration') return { href: eventId ? `/events/${eventId}` : '/events', label: 'Back to Event' };
          return { href: '/settings/subscription', label: 'Back to Subscription' };
        })();

        setDestination(returnPath ? { href: returnPath, label: fallbackDestination.label } : fallbackDestination);

        if (!active) return;

        if (transaction.status === 'success') {
          setResultMessage('Payment successful. Your account has been updated.');
        } else if (transaction.status === 'processing' || transaction.status === 'pending') {
          setResultMessage('Payment is processing. We will update your status shortly.');
        } else {
          setResultMessage(`Payment ${transaction.status}. Please retry if needed.`);
        }
      } catch (error: any) {
        if (active) {
          setResultMessage(error?.error?.message || error?.message || 'Could not confirm payment.');
        }
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [confirm, reference, status]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Payment Confirmation</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Transaction Status</h1>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">{resultMessage}</p>
        <div className="flex flex-wrap gap-2">
          <Link href={destination.href} className="btn btn-primary">
            {destination.label}
          </Link>
          <Link href="/dashboard" className="btn btn-outline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </Card>
  );
}
