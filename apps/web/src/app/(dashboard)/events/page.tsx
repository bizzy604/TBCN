import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | Brand Coach Network',
  description: 'Browse upcoming coaching events and workshops.',
};

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="mt-2 text-muted-foreground">
          Discover upcoming workshops, webinars, and networking events.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">📅</div>
          <h2 className="text-xl font-semibold">Events Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Workshops, webinars, and community events will be listed here.
          </p>
        </div>
      </div>
    </div>
  );
}
