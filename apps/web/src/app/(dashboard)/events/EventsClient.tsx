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

type EventsTab = 'upcoming' | 'registered' | 'replays';

function toDateTimeLocal(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventsClient() {
  const role = useAuthStore((state) => state.user?.role ?? null);
  const canCreateEvent = role === 'coach' || role === 'admin' || role === 'super_admin';

  const [tab, setTab] = useState<EventsTab>('upcoming');
  const [locationFilter, setLocationFilter] = useState<'all' | LocationType>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const { data, isLoading } = useEvents({ upcoming: true });
  const { data: registrations } = useMyEventRegistrations();
  const registerEvent = useRegisterEvent();
  const createEvent = useCreateEvent();

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
  const registeredMap = new Set((registrations ?? []).filter((item) => item.status === 'registered').map((item) => item.eventId));

  const visibleEvents = useMemo(() => {
    let rows = [...events];
    if (tab === 'registered') {
      rows = rows.filter((item) => registeredMap.has(item.id));
    } else if (tab === 'replays') {
      rows = [];
    }
    if (locationFilter !== 'all') {
      rows = rows.filter((item) => item.locationType === locationFilter);
    }
    return rows;
  }, [events, registeredMap, tab, locationFilter]);

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
      setForm((prev) => ({ ...prev, title: '', description: '' }));
    } catch (error: any) {
      setFeedbackMessage(error?.error?.message || error?.message || 'Could not create event.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
          Upcoming
        </TabButton>
        <TabButton active={tab === 'registered'} onClick={() => setTab('registered')}>
          Registered
        </TabButton>
        <TabButton active={tab === 'replays'} onClick={() => setTab('replays')}>
          Replays
        </TabButton>

        <select
          value={locationFilter}
          onChange={(event) => setLocationFilter(event.target.value as 'all' | LocationType)}
          className="input ml-auto max-w-[180px]"
        >
          <option value="all">All Locations</option>
          <option value="virtual">Virtual</option>
          <option value="physical">In-person</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      {canCreateEvent && (
        <section className="dashboard-panel">
          <h2 className="text-lg font-semibold">Create Event</h2>
          <p className="mt-1 text-sm text-muted-foreground">Publish workshops and masterclasses directly from this screen.</p>

          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleCreateEvent}>
            <label className="md:col-span-2">
              <span className="label">Title</span>
              <input
                required
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="input"
                placeholder="Personal Branding Masterclass"
              />
            </label>

            <label className="md:col-span-2">
              <span className="label">Description</span>
              <textarea
                required
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="input min-h-[100px]"
              />
            </label>

            <label>
              <span className="label">Start Time</span>
              <input type="datetime-local" value={form.startAt} onChange={(event) => setForm((prev) => ({ ...prev, startAt: event.target.value }))} className="input" required />
            </label>

            <label>
              <span className="label">End Time</span>
              <input type="datetime-local" value={form.endAt} onChange={(event) => setForm((prev) => ({ ...prev, endAt: event.target.value }))} className="input" required />
            </label>

            <label>
              <span className="label">Location Type</span>
              <select value={form.locationType} onChange={(event) => setForm((prev) => ({ ...prev, locationType: event.target.value as LocationType }))} className="input">
                <option value="virtual">Virtual</option>
                <option value="physical">Physical</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>

            <label>
              <span className="label">Capacity</span>
              <input type="number" min={1} value={form.capacity} onChange={(event) => setForm((prev) => ({ ...prev, capacity: Number(event.target.value) }))} className="input" />
            </label>

            <label>
              <span className="label">Location (optional)</span>
              <input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} className="input" />
            </label>

            <label>
              <span className="label">Meeting URL (optional)</span>
              <input value={form.meetingUrl} onChange={(event) => setForm((prev) => ({ ...prev, meetingUrl: event.target.value }))} className="input" />
            </label>

            <label>
              <span className="label">Price</span>
              <input type="number" min={0} step="0.01" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))} className="input" />
            </label>

            <label>
              <span className="label">Currency</span>
              <input value={form.currency} onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))} className="input" />
            </label>

            <button type="submit" disabled={createEvent.isPending} className="btn btn-primary md:col-span-2 w-fit">
              {createEvent.isPending ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </section>
      )}

      {feedbackMessage && <p className="text-sm text-muted-foreground">{feedbackMessage}</p>}

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="card h-44 animate-pulse bg-muted/55" />
          ))}
        </div>
      ) : visibleEvents.length === 0 ? (
        <div className="card p-10 text-center text-sm text-muted-foreground">
          {tab === 'replays' ? 'Replays are not available yet.' : 'No events found for the selected filters.'}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {visibleEvents.map((event) => {
            const registered = registeredMap.has(event.id);
            const paid = Number(event.price) > 0;

            return (
              <article key={event.id} className="card-hover overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-secondary/30 to-accent/35" />
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-semibold text-foreground line-clamp-1">{event.title}</h2>
                      <p className="text-xs text-muted-foreground">{new Date(event.startAt).toLocaleString()}</p>
                    </div>
                    <span className={`badge ${event.locationType === 'physical' ? 'bg-accent/20 text-amber-900' : 'bg-secondary/15 text-secondary'}`}>
                      {event.locationType}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-foreground">
                      {paid ? `${event.currency} ${event.price}` : 'Free'}
                    </span>
                    <span className="text-muted-foreground">{event.registrationCount} registered</span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/events/${event.id}`} className="btn btn-sm btn-outline">
                      View
                    </Link>
                    {paid && !registered ? (
                      <Link href={`/events/${event.id}`} className="btn btn-sm btn-primary">
                        Pay & Register
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRegister(event.id)}
                        disabled={registered || registerEvent.isPending}
                        className="btn btn-sm btn-primary"
                      >
                        {registered ? 'Registered' : 'Register'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}>
      {children}
    </button>
  );
}
