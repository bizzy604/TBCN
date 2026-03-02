'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks';
import { useSessions, useSubmitSessionFeedback, useUpdateSession } from '@/hooks/use-coaching';
import { canManageCoachingSessions } from '@/lib/auth/rbac';
import type { CoachingSession } from '@/lib/api/sessions';

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
    <article className="card-hover p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{session.topic}</h2>
          <p className="text-sm text-muted-foreground">{scheduledAt.toLocaleDateString()} {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-xs text-muted-foreground">{session.durationMinutes} minutes · {session.status}</p>
          <p className="text-xs text-muted-foreground">Coach: {session.coach?.firstName} {session.coach?.lastName}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {session.status === 'scheduled' && (
            <>
              <button type="button" onClick={() => onReschedule(session.id)} className="btn btn-sm btn-outline">
                Reschedule
              </button>
              <button type="button" onClick={() => onCancel(session.id)} className="btn btn-sm btn-outline">
                Cancel
              </button>
              {canManage && (
                <button type="button" onClick={() => onComplete(session.id)} className="btn btn-sm btn-primary">
                  Mark Complete
                </button>
              )}
            </>
          )}
          {session.status === 'completed' && !session.feedback && !canManage && (
            <button type="button" onClick={() => onFeedback(session.id)} className="btn btn-sm btn-primary">
              Leave Feedback
            </button>
          )}
        </div>
      </div>

      {session.feedback && (
        <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          Feedback rating: {session.feedback.rating}/5
        </div>
      )}
    </article>
  );
}

export default function SessionsPage() {
  const { user } = useAuth();
  const canManage = canManageCoachingSessions(user?.role ?? null);
  const sessionMode: 'coach' | 'mentee' = user?.role === 'coach' ? 'coach' : 'mentee';

  const [message, setMessage] = useState<string | null>(null);
  const { data, isLoading } = useSessions({ role: sessionMode });
  const updateSession = useUpdateSession();
  const submitFeedback = useSubmitSessionFeedback();

  const sessions = useMemo(() => data?.data ?? [], [data]);

  const handleCancel = async (id: string) => {
    setMessage(null);
    const reason = window.prompt('Cancellation reason (optional):') || undefined;
    try {
      await updateSession.mutateAsync({ id, payload: { action: 'cancel', cancellationReason: reason } });
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
      await updateSession.mutateAsync({ id, payload: { action: 'reschedule', scheduledAt: iso } });
      setMessage('Session rescheduled.');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to reschedule session');
    }
  };

  const handleComplete = async (id: string) => {
    setMessage(null);
    try {
      await updateSession.mutateAsync({ id, payload: { action: 'complete' } });
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
      await submitFeedback.mutateAsync({ id, payload: { rating, feedbackText: text } });
      setMessage('Feedback submitted.');
    } catch (error: any) {
      setMessage(error?.error?.message || error?.message || 'Failed to submit feedback');
    }
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Sessions</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Coaching Sessions</h1>
        <p className="mt-2 text-sm text-sidebar-foreground/80">
          {canManage ? 'Manage upcoming sessions with your mentees.' : 'Track your upcoming and completed coaching sessions.'}
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {message && <p className="text-sm text-muted-foreground">{message}</p>}

        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((index) => (
              <div key={index} className="card h-32 animate-pulse bg-muted/55" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-lg font-semibold">No sessions yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Book your first coaching session to get started.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {!canManage ? (
                <Link href="/coaches" className="btn btn-primary">
                  Find a Coach
                </Link>
              ) : (
                <>
                  <Link href="/coaches" className="btn btn-outline">
                    Coach Directory
                  </Link>
                  <Link href="/coach/workspace" className="btn btn-outline">
                    Coach Workspace
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
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
