'use client';

import Link from 'next/link';
import { useEvents, useRegisterEvent, useMyEventRegistrations } from '@/hooks/use-engagement';

export default function EventsClient() {
  const { data, isLoading } = useEvents({ upcoming: true });
  const { data: registrations } = useMyEventRegistrations();
  const registerEvent = useRegisterEvent();

  const events = data?.data ?? [];
  const registeredIds = new Set((registrations ?? []).filter((r) => r.status === 'registered').map((r) => r.eventId));

  const handleRegister = async (eventId: string) => {
    try {
      await registerEvent.mutateAsync(eventId);
    } catch {
      // surface minimal friction in list view
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 animate-pulse rounded-lg border border-border bg-muted/30" />
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
        No upcoming events available right now.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const registered = registeredIds.has(event.id);
        return (
          <article key={event.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {new Date(event.startAt).toLocaleString()} • {event.locationType}
                </p>
                <p className="text-sm text-muted-foreground">
                  {event.currency} {event.price} • {event.registrationCount} registered
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/events/${event.id}`}
                  className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                >
                  View
                </Link>
                <button
                  type="button"
                  disabled={registered || registerEvent.isPending}
                  onClick={() => handleRegister(event.id)}
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  {registered ? 'Registered' : 'Register'}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

