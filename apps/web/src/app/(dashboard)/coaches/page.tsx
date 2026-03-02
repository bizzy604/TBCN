import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import CoachesClient from './CoachesClient';

export const metadata: Metadata = {
  title: 'Coach Directory | Brand Coach Network',
  description: 'Find mentors and book coaching sessions on Brand Coach Network.',
};

export default function CoachesPage() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Coach Directory</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Find Your Coach</h1>
        <p className="mt-2 text-sm text-sidebar-foreground/80">Browse certified coaches by specialization, rating, and price.</p>
      </div>
      <div className="p-5 sm:p-6">
        <CoachesClient />
      </div>
    </Card>
  );
}
