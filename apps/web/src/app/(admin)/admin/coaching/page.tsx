'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useCoaches } from '@/hooks';

export default function AdminCoachingPage() {
  const { data, isLoading, error } = useCoaches({ page: 1, limit: 50 });
  const rows = data?.data ?? [];

  const metrics = useMemo(() => {
    const coachCount = rows.length;
    const totalSessions = rows.reduce((sum, coach) => sum + (coach.stats?.totalSessions ?? 0), 0);
    const averageRate = coachCount
      ? rows.reduce((sum, coach) => sum + Number(coach.hourlyRate || 0), 0) / coachCount
      : 0;

    return { coachCount, totalSessions, averageRate };
  }, [rows]);

  const errorMessage =
    (error as any)?.error?.message ||
    (error as any)?.message ||
    null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coaching</h1>
        <p className="text-muted-foreground">View coach profiles and marketplace readiness.</p>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Coaches Loaded</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.coachCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Sessions Completed</p>
          <p className="mt-1 text-2xl font-semibold">{metrics.totalSessions}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Average Hourly Rate</p>
          <p className="mt-1 text-2xl font-semibold">KES {metrics.averageRate.toFixed(2)}</p>
        </div>
      </section>

      {errorMessage && <p className="text-sm text-muted-foreground">{errorMessage}</p>}

      <section className="overflow-x-auto rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Coach Directory</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading coaches...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No coaches found.</p>
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Headline</th>
                <th className="px-2 py-2">Specialties</th>
                <th className="px-2 py-2">Rate</th>
                <th className="px-2 py-2">Rating</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((coach) => (
                <tr key={coach.id} className="border-b border-border/60">
                  <td className="px-2 py-2 font-medium">{coach.fullName}</td>
                  <td className="px-2 py-2">{coach.tagline || '-'}</td>
                  <td className="px-2 py-2">{coach.specialties?.slice(0, 3).join(', ') || '-'}</td>
                  <td className="px-2 py-2">{coach.currency} {Number(coach.hourlyRate).toFixed(2)}</td>
                  <td className="px-2 py-2">
                    {Number(coach.stats?.averageRating || 0).toFixed(1)} ({coach.stats?.reviewCount || 0})
                  </td>
                  <td className="px-2 py-2">
                    <Link
                      href={`/coaches/${coach.id}`}
                      className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
