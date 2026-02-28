import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import EventsClient from './EventsClient';

export const metadata: Metadata = {
  title: 'Events | Brand Coach Network',
  description: 'Browse upcoming coaching events and workshops.',
};

export default function EventsPage() {
  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="mt-2 text-muted-foreground">Discover upcoming workshops, webinars, and networking events.</p>
        </div>
        <EventsClient />
      </div>
    </Card>
  );
}

