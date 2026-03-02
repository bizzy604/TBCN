'use client';

import { useMemo, useState } from 'react';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useProgramCatalog } from '@/hooks/use-programs';
import { ProgramList } from '@/components/programs/ProgramList';
import { Card } from '@/components/ui/Card';

const DIFFICULTY_OPTIONS = [
  { label: 'All Levels', value: '' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

export default function ProgramsCatalogClient() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      page,
      limit: 12,
      search: search || undefined,
      difficulty: difficulty || undefined,
      isFree: isFreeOnly || undefined,
      status: 'published' as const,
    }),
    [page, search, difficulty, isFreeOnly],
  );

  const { data, isLoading } = useProgramCatalog(params);
  const programs = data?.data || [];
  const meta = data?.meta;

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Programs Catalog</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Find the Right Program</h1>
        <p className="mt-2 text-sm text-sidebar-foreground/80">
          Filter by level and access type to discover programs built for your current growth stage.
        </p>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),180px,160px]">
          <label className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search programs"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="input pl-10"
            />
          </label>

          <label className="relative">
            <FunnelIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={difficulty}
              onChange={(event) => {
                setDifficulty(event.target.value);
                setPage(1);
              }}
              className="input pl-10"
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={isFreeOnly}
              onChange={(event) => {
                setIsFreeOnly(event.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            Free only
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {difficulty && <span className="badge-brand">Level: {difficulty}</span>}
          {isFreeOnly && <span className="badge-success">Free access</span>}
          {!difficulty && !isFreeOnly && <span className="text-muted-foreground">All programs</span>}
        </div>

        {meta && !isLoading && (
          <p className="text-sm text-muted-foreground">
            Showing {programs.length} of {meta.total} programs
          </p>
        )}

        <ProgramList programs={programs} loading={isLoading} />

        {meta && meta.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-5">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!meta.hasPreviousPage}
              className="btn btn-sm btn-outline"
              type="button"
            >
              Previous
            </button>
            <span className="px-2 text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!meta.hasNextPage}
              className="btn btn-sm btn-outline"
              type="button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
