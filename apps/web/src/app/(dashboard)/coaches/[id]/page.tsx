import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import CoachDetailClient from './CoachDetailClient';

export const metadata: Metadata = {
  title: 'Coach Booking | Brand Coach Network',
  description: 'Review coach profile, schedule a slot, and confirm your session booking.',
};

export default async function CoachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Coaching Session</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Book Your Session</h1>
        <p className="mt-2 text-sm text-sidebar-foreground/80">Choose session type, pick a time slot, and confirm your booking.</p>
      </div>
      <div className="p-5 sm:p-6">
        <CoachDetailClient coachId={id} />
      </div>
    </Card>
  );
}
