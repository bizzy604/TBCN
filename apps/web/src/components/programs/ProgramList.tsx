'use client';

import { ProgramCard } from './ProgramCard';
import type { ProgramSummary } from '@/lib/api/programs';

interface ProgramListProps {
  programs: ProgramSummary[];
  loading?: boolean;
}

function ProgramCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-video animate-pulse bg-muted/55" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-24 animate-pulse rounded-full bg-muted/55" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-muted/55" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted/55" />
      </div>
    </div>
  );
}

export function ProgramList({ programs, loading }: ProgramListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProgramCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-lg font-semibold text-foreground">No programs match your filters</p>
        <p className="mt-2 text-sm text-muted-foreground">Adjust filters or search to see available programs.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {programs.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </div>
  );
}
