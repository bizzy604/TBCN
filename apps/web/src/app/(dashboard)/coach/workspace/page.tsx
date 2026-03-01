'use client';

import Link from 'next/link';
import { CoachRoute } from '@/components/auth';
import { Card } from '@/components/ui/Card';
import { useSessions } from '@/hooks/use-coaching';

export default function CoachWorkspacePage() {
  const { data, isLoading } = useSessions({ role: 'coach' });
  const sessions = data?.data ?? [];

  const scheduled = sessions.filter((session) => session.status === 'scheduled').length;
  const completed = sessions.filter((session) => session.status === 'completed').length;

  return (
    <CoachRoute>
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Coach Workspace</h1>
            <p className="text-muted-foreground mt-1">
              Manage your coaching operations, sessions, and mentor-side delivery workflow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Scheduled Sessions</p>
              <p className="mt-2 text-2xl font-semibold">{isLoading ? '-' : scheduled}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Completed Sessions</p>
              <p className="mt-2 text-2xl font-semibold">{isLoading ? '-' : completed}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="mt-2 text-2xl font-semibold">{isLoading ? '-' : sessions.length}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/sessions"
              className="rounded-lg border border-border p-4 text-sm hover:bg-muted/30"
            >
              Open Sessions Management
            </Link>
            <Link
              href="/coaches"
              className="rounded-lg border border-border p-4 text-sm hover:bg-muted/30"
            >
              View Coach Directory
            </Link>
          </div>
        </div>
      </Card>
    </CoachRoute>
  );
}
