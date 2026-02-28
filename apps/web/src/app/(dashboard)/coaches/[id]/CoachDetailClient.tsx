'use client';

import { useMemo, useState } from 'react';
import { useCoach, useCoachAvailability, useCreateSession } from '@/hooks/use-coaching';

interface CoachDetailClientProps {
  coachId: string;
}

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function CoachDetailClient({ coachId }: CoachDetailClientProps) {
  const [topic, setTopic] = useState('Brand strategy session');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const range = useMemo(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 14);
    return {
      startDate: formatDateInput(start),
      endDate: formatDateInput(end),
    };
  }, []);

  const { data: coach, isLoading: coachLoading } = useCoach(coachId);
  const { data: availability, isLoading: availabilityLoading } = useCoachAvailability(coachId, {
    ...range,
    durationMinutes,
  });
  const createSession = useCreateSession();

  const availableSlots = (availability?.availability ?? []).flatMap((day) =>
    day.slots
      .filter((slot) => slot.isAvailable)
      .map((slot) => ({ date: day.date, startAt: slot.startAt, endAt: slot.endAt })),
  );

  const handleBook = async () => {
    if (!selectedSlot) {
      setMessage('Select an available slot first.');
      return;
    }
    if (!topic.trim()) {
      setMessage('Topic is required.');
      return;
    }

    setMessage(null);
    try {
      await createSession.mutateAsync({
        coachId,
        scheduledAt: selectedSlot,
        durationMinutes,
        topic: topic.trim(),
        notes: notes.trim() || undefined,
      });
      setMessage('Session booked successfully. Check Sessions page for details.');
      setSelectedSlot(null);
      setNotes('');
    } catch (error: any) {
      const errMsg = error?.error?.message || error?.message || 'Failed to book session';
      setMessage(errMsg);
    }
  };

  if (coachLoading) {
    return <div className="h-40 animate-pulse rounded-lg border border-border bg-muted/30" />;
  }

  if (!coach) {
    return <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6">Coach not found.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="text-xl font-semibold">{coach.fullName}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{coach.tagline || 'Professional Coach'}</p>
        <p className="mt-3 text-sm text-muted-foreground">{coach.bio || 'No coach bio provided yet.'}</p>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>{coach.currency} {coach.hourlyRate}/hour</p>
          <p>{coach.yearsExperience} years experience</p>
          <p>Rating {coach.stats.averageRating.toFixed(1)} ({coach.stats.reviewCount} reviews)</p>
          <p>{coach.stats.totalSessions} sessions</p>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-lg font-semibold">Book Session</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Topic</span>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Duration</span>
            <select
              className="w-full rounded-md border border-border bg-background px-3 py-2"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block text-sm">
          <span className="mb-1 block text-muted-foreground">Notes (optional)</span>
          <textarea
            className="w-full rounded-md border border-border bg-background px-3 py-2"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <div className="mt-4">
          <p className="mb-2 text-sm text-muted-foreground">Available slots (next 14 days)</p>
          {availabilityLoading ? (
            <div className="h-20 animate-pulse rounded-md border border-border bg-muted/30" />
          ) : availableSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open slots for the selected duration.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {availableSlots.slice(0, 16).map((slot) => {
                const selected = selectedSlot === slot.startAt;
                return (
                  <button
                    key={slot.startAt}
                    type="button"
                    onClick={() => setSelectedSlot(slot.startAt)}
                    className={`rounded-md border px-3 py-2 text-left text-sm ${selected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/40'}`}
                  >
                    <div>{new Date(slot.startAt).toLocaleDateString()}</div>
                    <div className="text-muted-foreground">
                      {new Date(slot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {message && (
          <p className="mt-4 text-sm text-muted-foreground">{message}</p>
        )}

        <button
          type="button"
          onClick={handleBook}
          disabled={createSession.isPending}
          className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {createSession.isPending ? 'Booking...' : 'Book Session'}
        </button>
      </section>
    </div>
  );
}

