import type { Metadata } from 'next';
import ProgramDetailClient from './ProgramDetailClient';

export const metadata: Metadata = {
  title: 'Program Details | Brand Coach Network',
  description: 'View program details, curriculum, and enrollment options.',
};

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProgramDetailClient slug={id} />;
}
