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

  const reference = params.get('reference');
  const rawStatus = params.get('status') || 'success';
  const status = useMemo(() => statusMap[rawStatus.toLowerCase()] || 'success', [rawStatus]);

  useEffect(() => {
    if (!reference) {
      setResultMessage('Missing payment reference.');
      return;
    }

    let active = true;
    const run = async () => {
      try {
        await confirm.mutateAsync({ reference, status });
        if (active) {
          setResultMessage(`Payment ${status}. Your subscription status has been updated.`);
        }
      } catch (error: any) {
        if (active) {
          setResultMessage(error?.error?.message || error?.message || 'Could not confirm payment.');
        }
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [confirm, reference, status]);

  return (
    <Card className="p-6">
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Confirmation</h1>
          <p className="mt-2 text-muted-foreground">{resultMessage}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/settings/subscription"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Back to Subscription
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </Card>
  );
}
