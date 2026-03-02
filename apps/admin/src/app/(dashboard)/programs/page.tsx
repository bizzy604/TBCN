'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  adminProgramsApi,
  getAdminUserFromCookie,
  PLATFORM_ADMIN_ROLES,
  type ProgramStats,
  type ProgramSummary,
} from '@/lib/api/admin-api';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'border-warning/40 bg-warning/10 text-warning',
    published: 'border-secondary/35 bg-secondary/10 text-secondary',
    archived: 'border-border bg-muted text-muted-foreground',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
        styles[status] || 'border-border bg-muted text-muted-foreground'
      }`}
    >
      {status}
    </span>
  );
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [stats, setStats] = useState<ProgramStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const programsRequest = adminProgramsApi.getAll({
        page,
        limit: 15,
        search: search || undefined,
        status: statusFilter || undefined,
      });

      if (isPlatformAdmin) {
        const [programsRes, statsRes] = await Promise.allSettled([
          programsRequest,
          adminProgramsApi.getStats(),
        ]);

        if (programsRes.status === 'fulfilled') {
          setPrograms(programsRes.value.data);
          setTotalPages(programsRes.value.meta.totalPages);
        }
        if (statsRes.status === 'fulfilled') setStats(statsRes.value);
        return;
      }

      const [programsRes, allRes, publishedRes, draftRes] = await Promise.allSettled([
        programsRequest,
        adminProgramsApi.getAll({ page: 1, limit: 1 }),
        adminProgramsApi.getAll({ page: 1, limit: 1, status: 'published' }),
        adminProgramsApi.getAll({ page: 1, limit: 1, status: 'draft' }),
      ]);

      if (programsRes.status === 'fulfilled') {
        setPrograms(programsRes.value.data);
        setTotalPages(programsRes.value.meta.totalPages);
      }

      setStats({
        total: allRes.status === 'fulfilled' ? allRes.value.meta.total : 0,
        published: publishedRes.status === 'fulfilled' ? publishedRes.value.meta.total : 0,
        draft: draftRes.status === 'fulfilled' ? draftRes.value.meta.total : 0,
        totalEnrollments: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [isPlatformAdmin, page, search, statusFilter]);

  useEffect(() => {
    const user = getAdminUserFromCookie();
    setIsPlatformAdmin(
      user
        ? PLATFORM_ADMIN_ROLES.includes(user.role as (typeof PLATFORM_ADMIN_ROLES)[number])
        : false,
    );
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await adminProgramsApi.delete(id);
      fetchPrograms();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await adminProgramsApi.publish(id);
      fetchPrograms();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await adminProgramsApi.archive(id);
      fetchPrograms();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive');
    }
  };

  return (
    <div className="space-y-6">
      <section className="admin-panel overflow-hidden">
        <div className="flex flex-col gap-5 bg-sidebar px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/70">
              Screen 31
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-sidebar-foreground sm:text-3xl">
              Program & Course Builder
            </h2>
            <p className="mt-2 text-sm text-sidebar-foreground/85">
              Create, publish, and manage programs, modules, lessons, and pricing access.
            </p>
          </div>
          <Link href="/programs/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Create Program
            </Button>
          </Link>
        </div>
      </section>

      {stats && (
        <section className={`grid grid-cols-2 gap-4 ${isPlatformAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          {[
            { label: 'Total Programs', value: stats.total },
            { label: 'Published', value: stats.published },
            { label: 'Draft', value: stats.draft },
            ...(isPlatformAdmin ? [{ label: 'Enrollments', value: stats.totalEnrollments }] : []),
          ].map((item) => (
            <div key={item.label} className="admin-kpi-card">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </section>
      )}

      <section className="admin-panel p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search programs..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <div className="relative w-full sm:w-56">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-9 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">All statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </section>

      <section className="admin-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border bg-muted/55">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Program</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Difficulty</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Enrolled</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                    </td>
                  </tr>
                ))
              ) : programs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No programs found.
                  </td>
                </tr>
              ) : (
                programs.map((program) => (
                  <tr key={program.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/programs/${program.id}`}
                        className="inline-flex items-center gap-1 font-medium text-foreground hover:text-secondary"
                      >
                        {program.title}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Created {new Date(program.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={program.status} />
                    </td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">
                      {program.difficulty}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {program.isFree ? (
                        <span className="font-medium text-secondary">Free</span>
                      ) : (
                        `$${Number(program.price).toFixed(2)}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">{program.enrollmentCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/programs/${program.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                        {program.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePublish(program.id)}
                            className="text-secondary hover:text-secondary"
                          >
                            Publish
                          </Button>
                        )}
                        {program.status === 'published' && isPlatformAdmin && (
                          <Button variant="ghost" size="sm" onClick={() => handleArchive(program.id)}>
                            Archive
                          </Button>
                        )}
                        {isPlatformAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(program.id, program.title)}
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {totalPages > 1 && (
        <section className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </section>
      )}
    </div>
  );
}
