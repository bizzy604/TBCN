'use client';

import { useState, useMemo } from 'react';
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
    <Card className="p-4 sm:p-6">
      <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Programs</h1>
        <p className="mt-1 sm:mt-2 text-muted-foreground text-base sm:text-lg">
          Discover transformational programs designed to build your brand, skills, and impact.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search programs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          />
        </div>

        {/* Difficulty filter */}
        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
        >
          {DIFFICULTY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Free toggle */}
        <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border border-border bg-card select-none">
          <input
            type="checkbox"
            checked={isFreeOnly}
            onChange={(e) => {
              setIsFreeOnly(e.target.checked);
              setPage(1);
            }}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Free only
          </span>
        </label>
      </div>

      {/* Results count */}
      {meta && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Showing {programs.length} of {meta.total} programs
        </p>
      )}

      {/* Program Grid */}
      <ProgramList programs={programs} loading={isLoading} />

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!meta.hasPreviousPage}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
            // Show pages around current page
            let pageNum: number;
            if (meta.totalPages <= 7) {
              pageNum = i + 1;
            } else if (page <= 4) {
              pageNum = i + 1;
            } else if (page >= meta.totalPages - 3) {
              pageNum = meta.totalPages - 6 + i;
            } else {
              pageNum = page - 3 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  pageNum === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-foreground hover:bg-muted'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!meta.hasNextPage}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
      </div>
    </Card>
  );
}
