'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/solid';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { useCoaches } from '@/hooks/use-coaching';

export default function CoachesClient() {
  const { data, isLoading } = useCoaches();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'top' | 'price_low' | 'price_high'>('top');

  const coaches = useMemo(() => {
    const rows = [...(data?.data ?? [])].filter((coach) => {
      const query = search.trim().toLowerCase();
      if (!query) {
        return true;
      }
      return (
        coach.fullName.toLowerCase().includes(query)
        || coach.tagline?.toLowerCase().includes(query)
        || coach.specialties.some((specialty) => specialty.toLowerCase().includes(query))
      );
    });

    if (sort === 'price_low') {
      rows.sort((a, b) => Number(a.hourlyRate) - Number(b.hourlyRate));
    } else if (sort === 'price_high') {
      rows.sort((a, b) => Number(b.hourlyRate) - Number(a.hourlyRate));
    } else {
      rows.sort((a, b) => b.stats.averageRating - a.stats.averageRating);
    }

    return rows;
  }, [data?.data, search, sort]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="card h-64 animate-pulse bg-muted/55" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),220px]">
        <label className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or specialization"
            className="input pl-10"
          />
        </label>

        <label className="relative">
          <FunnelIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="input pl-10">
            <option value="top">Top Rated</option>
            <option value="price_low">Price Low to High</option>
            <option value="price_high">Price High to Low</option>
          </select>
        </label>
      </div>

      {coaches.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-lg font-semibold">No coaches found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a broader search term.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {coaches.map((coach, index) => (
            <article key={coach.id} className="card-hover p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
                    {coach.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coach.avatarUrl} alt={coach.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                        {coach.fullName.slice(0, 1)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">{coach.fullName}</h2>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{coach.tagline || 'Coach profile available'}</p>
                  </div>
                </div>
                {index < 2 && <span className="badge-warning">Top Coach</span>}
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">{coach.specialties.slice(0, 3).join(' · ') || 'Personal branding and leadership'}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1 text-foreground">
                    <StarIcon className="h-4 w-4 text-accent" />
                    {coach.stats.averageRating.toFixed(1)} ({coach.stats.reviewCount})
                  </span>
                  <span className="font-semibold text-foreground">
                    {coach.currency} {Number(coach.hourlyRate).toFixed(0)}
                  </span>
                </div>
              </div>

              <Link href={`/coaches/${coach.id}`} className="btn btn-primary mt-4 w-full">
                Book a Session
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
