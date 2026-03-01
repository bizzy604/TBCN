import type { Metadata } from 'next';
import OrdersClient from './OrdersClient';

export const metadata: Metadata = {
  title: 'My Orders | Brand Coach Network',
  description: 'Track your purchases, invoices, and digital downloads.',
};

export default function OrdersPage() {
  return <OrdersClient />;
}

