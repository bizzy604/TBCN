import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import EventDetailClient from './EventDetailClient';

export const metadata: Metadata = {
  title: 'Event Details | Brand Coach Network',
  description: 'View event details and complete registration.',
};

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Details</h1>
          <p className="mt-2 text-muted-foreground">Review event information and register.</p>
        </div>
        <EventDetailClient eventId={id} />
      </div>
    </Card>
  );
}

