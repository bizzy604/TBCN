'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  useCreateEvent,
  useEvents,
  useMyEventRegistrations,
  useRegisterEvent,
} from '@/hooks/use-engagement';
import { useAuthStore } from '@/lib/store';
import type { LocationType } from '@/lib/api/events';

function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventsClient() {
  const role = useAuthStore((state) => state.user?.role ?? null);
  const canCreateEvent = role === 'coach' || role === 'admin' || role === 'super_admin';

  const { data, isLoading } = useEvents({ upcoming: true });
  const { data: registrations } = useMyEventRegistrations();
  const registerEvent = useRegisterEvent();
  const createEvent = useCreateEvent();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const defaultTimes = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 3);
    start.setHours(15, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 90);
    return {
      startAt: toDateTimeLocal(start),
      endAt: toDateTimeLocal(end),
    };
  }, []);

  const [form, setForm] = useState({
    title: '',
    description: '',
    startAt: defaultTimes.startAt,
    endAt: defaultTimes.endAt,
    locationType: 'virtual' as LocationType,
    location: '',
    meetingUrl: '',
    capacity: 50,
    price: 0,
    currency: 'KES',
  });

  const events = data?.data ?? [];
  const registeredIds = new Set(
    (registrations ?? [])
      .filter((r) => r.status === 'registered')
      .map((r) => r.eventId),
  );

  const handleRegister = async (eventId: string) => {
    try {
      await registerEvent.mutateAsync(eventId);
      setFeedbackMessage('Event registration successful.');
    } catch {
      setFeedbackMessage('Registration failed. Please try again.');
    }
  };

  const handleCreateEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedbackMessage(null);

    try {
      await createEvent.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        locationType: form.locationType,
        location: form.location.trim() || undefined,
        meetingUrl: form.meetingUrl.trim() || undefined,
        capacity: form.capacity || undefined,
        price: Number(form.price || 0),
        currency: form.currency.trim().toUpperCase() || 'KES',
        status: 'published',
      });
      setFeedbackMessage('Event created and published successfully.');
      setForm((prev) => ({
        ...prev,
        title: '',
        description: '',
      }));
    } catch (error: any) {
      setFeedbackMessage(error?.error?.message || error?.message || 'Could not create event.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="h-24 animate-pulse rounded-lg border border-border bg-muted/30"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canCreateEvent && (
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Create Event</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Coaches and admins can publish events directly from this page.
          </p>

          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleCreateEvent}>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Personal Branding Masterclass"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the event agenda and expected outcomes."
                className="min-h-[90px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Start Time</label>
              <input
                required
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">End Time</label>
              <input
                required
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Location Type</label>
              <select
                value={form.locationType}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, locationType: e.target.value as LocationType }))
                }
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="virtual">Virtual</option>
                <option value="physical">Physical</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Capacity</label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Location (optional)</label>
              <input
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Nairobi Garage, Westlands"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Meeting URL (optional)</label>
              <input
                value={form.meetingUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, meetingUrl: e.target.value }))}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Price</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Currency</label>
              <input
                value={form.currency}
                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                placeholder="KES"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={createEvent.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {createEvent.isPending ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </section>
      )}

      {feedbackMessage && <p className="text-sm text-muted-foreground">{feedbackMessage}</p>}

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
          No upcoming events available right now.
        </div>
      ) : (
        events.map((event) => {
          const registered = registeredIds.has(event.id);
          return (
            <article key={event.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{event.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(event.startAt).toLocaleString()} - {event.locationType}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.currency} {event.price} - {event.registrationCount} registered
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/events/${event.id}`}
                    className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted"
                  >
                    View
                  </Link>
                  {Number(event.price) > 0 && !registered ? (
                    <Link
                      href={`/events/${event.id}`}
                      className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                    >
                      Pay & Register
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={registered || registerEvent.isPending}
                      onClick={() => handleRegister(event.id)}
                      className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                    >
                      {registered ? 'Registered' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
