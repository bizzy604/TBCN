'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProgramForm } from '@/components/content/ProgramForm';
import { adminProgramsApi, type Program } from '@/lib/api/admin-api';

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminProgramsApi
      .getById(resolvedParams.id)
      .then(setProgram)
      .catch(() => setProgram(null))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 animate-pulse rounded-2xl border border-border bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Program Not Found</h2>
        <Link href="/programs">
          <Button variant="outline">Back to Programs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="admin-panel overflow-hidden">
        <div className="bg-sidebar px-6 py-6 sm:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/70">
            Screen 31
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-sidebar-foreground sm:text-3xl">
            Edit Program
          </h2>
          <p className="mt-2 truncate text-sm text-sidebar-foreground/85">
            {program.title}
          </p>
        </div>
      </section>
      <ProgramForm program={program} mode="edit" />
    </div>
  );
}
