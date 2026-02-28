'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { programsApi } from '@/lib/api/programs';

export default function AdminProgramsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'programs', 'all'],
    queryFn: () => programsApi.getAll({ page: 1, limit: 100 }),
  });

  const programs = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Programs</h1>
          <p className="text-muted-foreground">
            Manage program catalog and curriculum structure.
          </p>
        </div>
        <Link
          href="/admin/programs/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New Program
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Difficulty</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Enrollments</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                  Loading programs...
                </td>
              </tr>
            ) : programs.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                  No programs found.
                </td>
              </tr>
            ) : (
              programs.map((program) => (
                <tr key={program.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{program.title}</p>
                      <p className="text-xs text-muted-foreground">{program.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {program.status}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {program.difficulty}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {program.enrollmentCount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/programs/${program.id}/builder`}
                      className="text-primary hover:underline"
                    >
                      Open Builder
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
