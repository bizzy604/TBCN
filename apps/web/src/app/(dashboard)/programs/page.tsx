import type { Metadata } from 'next';
import ProgramsCatalogClient from './ProgramsCatalogClient';

export const metadata: Metadata = {
  title: 'Programs | Brand Coach Network',
  description: 'Browse coaching programs and courses available on Brand Coach Network.',
};

export default function ProgramsPage() {
  return <ProgramsCatalogClient />;
}
