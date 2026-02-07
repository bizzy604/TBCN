import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Details | Brand Coach Network',
  description: 'View event details, schedule, and registration.',
};

export default function EventDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Details</h1>
        <p className="mt-2 text-muted-foreground">
          View event information, schedule, speakers, and registration.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">🎤</div>
          <h2 className="text-xl font-semibold">Event Details Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Event schedule, speaker information, and registration will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
