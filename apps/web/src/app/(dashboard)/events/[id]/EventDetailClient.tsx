'use client';

import { useState } from 'react';
import { useEvent, useRegisterEvent } from '@/hooks/use-engagement';

interface EventDetailClientProps {
  eventId: string;
}

export default function EventDetailClient({ eventId }: EventDetailClientProps) {
  const { data: event, isLoading } = useEvent(eventId);
  const registerEvent = useRegisterEvent();
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setMessage(null);
    try {
      await registerEvent.mutateAsync(eventId);
      setMessage('Registered successfully.');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Registration failed');
    }
  };

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-lg border border-border bg-muted/30" />;
  }

  if (!event) {
    return <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8">Event not found.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-2xl font-semibold">{event.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>

        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>Start: {new Date(event.startAt).toLocaleString()}</p>
          <p>End: {new Date(event.endAt).toLocaleString()}</p>
          <p>Format: {event.locationType}</p>
          <p>Price: {event.currency} {event.price}</p>
          {event.location && <p>Location: {event.location}</p>}
          {event.meetingUrl && <p>Meeting URL: {event.meetingUrl}</p>}
        </div>

        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}

        <button
          type="button"
          onClick={handleRegister}
          disabled={registerEvent.isPending}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {registerEvent.isPending ? 'Registering...' : 'Register for Event'}
        </button>
      </section>
    </div>
  );
}

