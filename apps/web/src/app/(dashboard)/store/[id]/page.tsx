import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import ProductDetailClient from './ProductDetailClient';

export const metadata: Metadata = {
  title: 'Checkout | Brand Coach Network',
  description: 'Review item details and complete payment securely.',
};

export default async function StoreProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Order Summary & Payment</h1>
      </div>
      <div className="p-5 sm:p-6">
        <ProductDetailClient productId={id} />
      </div>
    </Card>
  );
}
