import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import OrderDetailClient from './OrderDetailClient';

export const metadata: Metadata = {
  title: 'Order Details | Brand Coach Network',
  description: 'View order status, invoice details, and download entitlements.',
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Order Detail</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Invoice & Fulfillment</h1>
      </div>
      <div className="p-5 sm:p-6">
        <OrderDetailClient orderId={id} />
      </div>
    </Card>
  );
}
