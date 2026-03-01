import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import ProductDetailClient from './ProductDetailClient';

export const metadata: Metadata = {
  title: 'Product Details | Brand Coach Network',
  description: 'Review product details and complete checkout.',
};

export default async function StoreProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Details</h1>
          <p className="mt-2 text-muted-foreground">Configure your purchase and complete payment.</p>
        </div>
        <ProductDetailClient productId={id} />
      </div>
    </Card>
  );
}

