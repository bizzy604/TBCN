import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import EventDetailClient from './EventDetailClient';

export const metadata: Metadata = {
  title: 'Event Details | Brand Coach Network',
  description: 'Review event details and complete registration.',
};

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Event Detail</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Event Registration</h1>
      </div>
      <div className="p-5 sm:p-6">
        <EventDetailClient eventId={id} />
      </div>
    </Card>
  );
}
