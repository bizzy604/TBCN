'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks';
import { useSessions, useUpdateSession, useSubmitSessionFeedback } from '@/hooks/use-coaching';
import type { CoachingSession } from '@/lib/api/sessions';
import { canManageCoachingSessions } from '@/lib/auth/rbac';

function SessionCard({
  canManage,
  session,
  onCancel,
  onComplete,
  onReschedule,
  onFeedback,
}: {
  canManage: boolean;
  session: CoachingSession;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onReschedule: (id: string) => void;
  onFeedback: (id: string) => void;
}) {
  const scheduledAt = new Date(session.scheduledAt);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{session.topic}</h2>
          <p className="text-sm text-muted-foreground">
            {scheduledAt.toLocaleDateString()}{' '}
            {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-muted-foreground">Duration: {session.durationMinutes} mins</p>
          <p className="text-sm text-muted-foreground capitalize">Status: {session.status}</p>
          <p className="text-sm text-muted-foreground">
            Coach: {session.coach?.firstName} {session.coach?.lastName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {session.status === 'scheduled' && (
            <>
              <button
                type="button"
                onClick={() => onReschedule(session.id)}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Reschedule
              </button>
              <button
                type="button"
                onClick={() => onCancel(session.id)}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                Cancel
              </button>
              {canManage && (
                <button
                  type="button"
                  onClick={() => onComplete(session.id)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                >
                  Mark Complete
                </button>
              )}
            </>
          )}
          {session.status === 'completed' && !session.feedback && !canManage && (
            <button
              type="button"
              onClick={() => onFeedback(session.id)}
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            >
              Leave Feedback
            </button>
          )}
        </div>
      </div>
      {session.feedback && (
        <div className="mt-4 rounded-md border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
          Feedback rating: {session.feedback.rating}/5
        </div>
      )}
    </div>
  );
}

export default function SessionsPage() {
  const { user } = useAuth();
  const role = user?.role ?? null;
  const canManage = canManageCoachingSessions(user?.role ?? null);
  const sessionMode: 'coach' | 'mentee' = role === 'coach' ? 'coach' : 'mentee';

  const [message, setMessage] = useState<string | null>(null);
  const { data, isLoading } = useSessions({ role: sessionMode });
  const updateSession = useUpdateSession();
  const submitFeedback = useSubmitSessionFeedback();

  const sessions = useMemo(() => data?.data ?? [], [data]);

  const handleCancel = async (id: string) => {
    setMessage(null);
    const reason = window.prompt('Cancellation reason (optional):') || undefined;
    try {
      await updateSession.mutateAsync({
        id,
        payload: {
          action: 'cancel',
          cancellationReason: reason,
        },
      });
      setMessage('Session cancelled.');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to cancel session');
    }
  };

  const handleReschedule = async (id: string) => {
    setMessage(null);
    const iso = window.prompt('Enter new date-time (ISO format, e.g. 2026-03-10T14:00:00.000Z):');
    if (!iso) return;
    try {
      await updateSession.mutateAsync({
        id,
        payload: {
          action: 'reschedule',
          scheduledAt: iso,
        },
      });
      setMessage('Session rescheduled.');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to reschedule session');
    }
  };

  const handleComplete = async (id: string) => {
    setMessage(null);
    try {
      await updateSession.mutateAsync({
        id,
        payload: {
          action: 'complete',
        },
      });
      setMessage('Session marked as completed.');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to update session');
    }
  };

  const handleFeedback = async (id: string) => {
    setMessage(null);
    const raw = window.prompt('Rating (1-5):', '5');
    if (!raw) return;
    const rating = parseInt(raw, 10);
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      setMessage('Rating must be between 1 and 5.');
      return;
    }
    const text = window.prompt('Optional feedback text:') || undefined;

    try {
      await submitFeedback.mutateAsync({
        id,
        payload: {
          rating,
          feedbackText: text,
        },
      });
      setMessage('Feedback submitted.');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to submit feedback');
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="mt-2 text-muted-foreground">
            {canManage
              ? 'Manage upcoming sessions with your mentees.'
              : 'Track your booked coaching sessions and provide feedback.'}
          </p>
        </div>

        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 animate-pulse rounded-lg border border-border bg-muted/30" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">No sessions found yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                canManage={canManage}
                session={session}
                onCancel={handleCancel}
                onComplete={handleComplete}
                onReschedule={handleReschedule}
                onFeedback={handleFeedback}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
