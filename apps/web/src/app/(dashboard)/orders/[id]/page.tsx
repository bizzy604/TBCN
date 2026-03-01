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
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="mt-2 text-muted-foreground">View invoice breakdown and fulfillment status.</p>
        </div>
        <OrderDetailClient orderId={id} />
      </div>
    </Card>
  );
}

