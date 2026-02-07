'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminProgramsApi, type ProgramSummary, type ProgramStats } from '@/lib/api/admin-api';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status] || 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  );
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [stats, setStats] = useState<ProgramStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const [programsRes, statsRes] = await Promise.all([
        adminProgramsApi.getAll({
          page,
          limit: 15,
          search: search || undefined,
          status: statusFilter || undefined,
        }),
        adminProgramsApi.getStats(),
      ]);
      setPrograms(programsRes.data);
      setTotalPages(programsRes.meta.totalPages);
      setStats(statsRes);
    } catch {
      // silently fail for now
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Programs</h1>
          <p className="text-muted-foreground mt-1">Manage coaching programs on the platform.</p>
        </div>
        <Link href="/programs/new">
          <Button>+ Create Program</Button>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total },
            { label: 'Published', value: stats.published },
            { label: 'Draft', value: stats.draft },
            { label: 'Enrollments', value: stats.totalEnrollments },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search programs..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Difficulty</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Price</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Enrolled</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
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
                <tr key={program.id} className="hover:bg-muted/20 transition">
                  <td className="px-4 py-3">
                    <Link
                      href={`/programs/${program.id}`}
                      className="font-medium text-foreground hover:text-primary transition"
                    >
                      {program.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Created {new Date(program.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={program.status} />
                  </td>
                  <td className="px-4 py-3 capitalize hidden md:table-cell">
                    {program.difficulty}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    {program.isFree ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      `$${Number(program.price).toFixed(2)}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{program.enrollmentCount}</td>
                  <td className="px-4 py-3 text-right">
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
                          className="text-green-600"
                        >
                          Publish
                        </Button>
                      )}
                      {program.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchive(program.id)}
                        >
                          Archive
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(program.id, program.title)}
                        className="text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
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
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}