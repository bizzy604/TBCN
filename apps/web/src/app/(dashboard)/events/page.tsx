import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import EventsClient from './EventsClient';

export const metadata: Metadata = {
  title: 'Events & Masterclasses | Brand Coach Network',
  description: 'Browse events, register, and manage your event access.',
};

export default function EventsPage() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Events & Masterclasses</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Upcoming Learning Events</h1>
        <p className="mt-2 text-sm text-sidebar-foreground/80">Register for webinars, workshops, and in-person sessions.</p>
      </div>
      <div className="p-5 sm:p-6">
        <EventsClient />
      </div>
    </Card>
  );
}
