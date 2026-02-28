'use client';

import Link from 'next/link';
import { useCoaches } from '@/hooks/use-coaching';

export default function CoachesClient() {
  const { data, isLoading } = useCoaches();
  const coaches = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-36 animate-pulse rounded-lg border border-border bg-muted/30" />
        ))}
      </div>
    );
  }

  if (!coaches.length) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">No coaches available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {coaches.map((coach) => (
        <div key={coach.id} className="rounded-lg border border-border bg-card p-5">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">{coach.fullName}</h2>
            <p className="text-sm text-muted-foreground">{coach.tagline || 'Coach profile available'}</p>
            <p className="text-sm text-muted-foreground">{coach.yearsExperience} years experience</p>
            <p className="text-sm text-muted-foreground">{coach.currency} {coach.hourlyRate}/hour</p>
            <p className="text-sm text-muted-foreground">
              Rating: {coach.stats.averageRating.toFixed(1)} ({coach.stats.reviewCount} reviews)
            </p>
            {!!coach.specialties.length && (
              <p className="text-sm text-muted-foreground">{coach.specialties.slice(0, 3).join(', ')}</p>
            )}
          </div>
          <div className="mt-4">
            <Link
              href={`/coaches/${coach.id}`}
              className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              View Profile
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

