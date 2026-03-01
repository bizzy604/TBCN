import type { Metadata } from 'next';
import StoreClient from './StoreClient';

export const metadata: Metadata = {
  title: 'Store | Brand Coach Network',
  description: 'Browse digital products, toolkits, and branded resources.',
};

export default function StorePage() {
  return <StoreClient />;
}

