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
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
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
      <div>
        <Link
          href={`/programs/${resolvedParams.id}`}
          className="text-xs text-muted-foreground hover:text-foreground transition"
        >
          ← Back to Program
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">
          Edit: {program.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          Update program details, modules, and lessons.
        </p>
      </div>
      <ProgramForm program={program} mode="edit" />
    </div>
  );
}