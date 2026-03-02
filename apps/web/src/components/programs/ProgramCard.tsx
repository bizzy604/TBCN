'use client';

import Link from 'next/link';
import { LockClosedIcon, StarIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { ProgramSummary } from '@/lib/api/programs';

interface ProgramCardProps {
  program: ProgramSummary;
  className?: string;
}

const difficultyLabel: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

function formatPrice(price: number, currency: string) {
  if (!price) {
    return 'Free';
  }
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency || 'KES',
    minimumFractionDigits: 0,
  }).format(Number(price));
}

function formatDuration(minutes: number | null) {
  if (!minutes) {
    return 'Self-paced';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins} min`;
  }
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
}

export function ProgramCard({ program, className }: ProgramCardProps) {
  const paid = Number(program.price) > 0;

  return (
    <Link href={`/programs/${program.slug}`} className={cn('group block', className)}>
      <article className="card-hover overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-secondary/25 via-secondary/10 to-accent/25">
          {program.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={program.thumbnailUrl}
              alt={program.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground">Program Cover</div>
          )}

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className={`badge ${paid ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
              {paid ? 'Paid Tier' : 'Free Access'}
            </span>
            {paid && (
              <span className="badge bg-card/90 text-foreground">
                <LockClosedIcon className="mr-1 h-3.5 w-3.5" />
                Upgrade to Access
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="badge bg-muted text-foreground">{difficultyLabel[program.difficulty] ?? 'All Levels'}</span>
            <span className="text-sm font-semibold text-foreground">{formatPrice(program.price, program.currency)}</span>
          </div>

          <h3 className="line-clamp-2 text-lg font-semibold text-foreground group-hover:text-primary">{program.title}</h3>

          {program.shortDescription && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{program.shortDescription}</p>
          )}

          <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" />
              {formatDuration(program.estimatedDuration)}
            </span>
            <span className="inline-flex items-center gap-1">
              <StarIcon className="h-3.5 w-3.5 text-accent" />
              {program.averageRating ? Number(program.averageRating).toFixed(1) : 'New'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
