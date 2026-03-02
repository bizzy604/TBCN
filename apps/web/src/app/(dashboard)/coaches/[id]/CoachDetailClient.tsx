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

  const selectedSlotLabel = selectedSlot
    ? new Date(selectedSlot).toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No slot selected';

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
      setMessage('Session booked successfully. Open Sessions to manage it.');
      setSelectedSlot(null);
      setNotes('');
    } catch (error: any) {
      const errMsg = error?.error?.message || error?.message || 'Failed to book session';
      setMessage(errMsg);
    }
  };

  if (coachLoading) {
    return <div className="card h-56 animate-pulse bg-muted/55" />;
  }

  if (!coach) {
    return <div className="card p-6 text-sm text-muted-foreground">Coach not found.</div>;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr,0.9fr]">
      <section className="space-y-5">
        <article className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Step 1</p>
          <h2 className="mt-2 text-xl font-semibold">Coach Profile Summary</h2>

          <div className="mt-4 flex items-start gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
              {coach.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coach.avatarUrl} alt={coach.fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                  {coach.fullName.slice(0, 1)}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">{coach.fullName}</p>
              <p className="text-sm text-muted-foreground">{coach.tagline || 'Professional coach'}</p>
              <div className="flex flex-wrap gap-2">
                {coach.specialties.slice(0, 4).map((specialty) => (
                  <span key={specialty} className="badge bg-secondary/16 text-secondary">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <p>Rating: {coach.stats.averageRating.toFixed(1)} ({coach.stats.reviewCount} reviews)</p>
            <p>Experience: {coach.yearsExperience} years</p>
            <p>Sessions delivered: {coach.stats.totalSessions}</p>
            <p>Rate: {coach.currency} {Number(coach.hourlyRate).toFixed(0)} / hour</p>
          </div>

          {coach.bio && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{coach.bio}</p>}
        </article>

        <article className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Step 2</p>
          <h2 className="mt-2 text-xl font-semibold">Schedule</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label>
              <span className="label">Session Type / Topic</span>
              <input value={topic} onChange={(event) => setTopic(event.target.value)} className="input" />
            </label>

            <label>
              <span className="label">Duration</span>
              <select
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(parseInt(event.target.value, 10))}
                className="input"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
              </select>
            </label>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">Available time slots (next 14 days)</p>
            {availabilityLoading ? (
              <div className="mt-2 h-16 animate-pulse rounded-xl bg-muted/55" />
            ) : availableSlots.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No open slots for this duration.</p>
            ) : (
              <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {availableSlots.slice(0, 24).map((slot) => {
                  const selected = selectedSlot === slot.startAt;
                  return (
                    <button
                      key={slot.startAt}
                      type="button"
                      onClick={() => setSelectedSlot(slot.startAt)}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                        selected
                          ? 'border-primary bg-primary/12 text-foreground'
                          : 'border-border bg-card hover:bg-muted/55'
                      }`}
                    >
                      <p className="font-medium text-foreground">{new Date(slot.startAt).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">
                        {new Date(slot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <label className="mt-4 block">
            <span className="label">Notes (optional)</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="input"
            />
          </label>
        </article>
      </section>

      <aside>
        <article className="card sticky top-24 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Step 3</p>
          <h2 className="mt-2 text-xl font-semibold">Confirm Booking</h2>

          <div className="mt-4 space-y-3 rounded-xl border border-border bg-background p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Coach</span>
              <span className="font-medium text-foreground">{coach.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Date & Time</span>
              <span className="font-medium text-foreground">{selectedSlotLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium text-foreground">{durationMinutes} mins</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-muted-foreground">Estimated Fee</span>
              <span className="text-base font-semibold text-foreground">
                {coach.currency} {Math.round((Number(coach.hourlyRate) / 60) * durationMinutes)}
              </span>
            </div>
          </div>

          {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}

          <button
            type="button"
            onClick={handleBook}
            disabled={createSession.isPending}
            className="btn btn-primary mt-5 w-full"
          >
            {createSession.isPending ? 'Booking...' : 'Confirm Booking'}
          </button>
        </article>
      </aside>
    </div>
  );
}
