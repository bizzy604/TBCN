'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ClipboardPenLine, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  adminProgramsApi,
  getAdminUserFromCookie,
  PLATFORM_ADMIN_ROLES,
  type Lesson,
  type Program,
} from '@/lib/api/admin-api';
import { AssessmentEditor } from '@/components/assessments/AssessmentEditor';

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

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    const user = getAdminUserFromCookie();
    setIsPlatformAdmin(
      user
        ? PLATFORM_ADMIN_ROLES.includes(user.role as (typeof PLATFORM_ADMIN_ROLES)[number])
        : false,
    );

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
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">Program not found</h2>
        <Link href="/programs" className="mt-4 inline-block">
          <Button variant="outline">Back to Programs</Button>
        </Link>
      </div>
    );
  }

  const totalLessons =
    program.modules?.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0) || 0;

  const handlePublish = async () => {
    try {
      const updated = await adminProgramsApi.publish(program.id);
      setProgram(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish');
    }
  };

  const handleArchive = async () => {
    try {
      const updated = await adminProgramsApi.archive(program.id);
      setProgram(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${program.title}"? This cannot be undone.`)) return;
    try {
      await adminProgramsApi.delete(program.id);
      router.push('/programs');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <section className="admin-panel overflow-hidden">
        <div className="bg-sidebar px-6 py-6 sm:px-8">
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-sidebar-foreground/75 hover:text-sidebar-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Programs
          </Link>

          <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-sidebar-foreground sm:text-3xl">
                {program.title}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge status={program.status} />
                <span className="admin-chip border-sidebar-foreground/20 bg-sidebar-accent/25 text-sidebar-foreground">
                  {program.difficulty}
                </span>
                <span className="admin-chip border-sidebar-foreground/20 bg-sidebar-accent/25 text-sidebar-foreground">
                  {program.isFree ? 'Free' : `$${Number(program.price).toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/programs/${program.id}/edit`}>
                <Button variant="outline" className="border-sidebar-foreground/35 bg-sidebar-accent/20 text-sidebar-foreground hover:bg-sidebar-accent/35">
                  Edit
                </Button>
              </Link>
              {program.status === 'draft' && (
                <Button onClick={handlePublish} className="bg-primary text-primary-foreground">
                  Publish
                </Button>
              )}
              {program.status === 'published' && isPlatformAdmin && (
                <Button
                  variant="outline"
                  onClick={handleArchive}
                  className="border-sidebar-foreground/35 bg-sidebar-accent/20 text-sidebar-foreground hover:bg-sidebar-accent/35"
                >
                  Archive
                </Button>
              )}
              {isPlatformAdmin && (
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Modules', value: program.modules?.length || 0 },
          { label: 'Lessons', value: totalLessons },
          { label: 'Enrolled', value: program.enrollmentCount },
          {
            label: 'Rating',
            value: program.averageRating
              ? `${Number(program.averageRating).toFixed(1)} (${program.totalRatings})`
              : 'N/A',
          },
        ].map((metric) => (
          <div key={metric.label} className="admin-kpi-card">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="admin-panel p-6">
        <h3 className="text-base font-semibold text-foreground">Description</h3>
        {program.shortDescription && (
          <p className="mt-2 text-sm italic text-muted-foreground">{program.shortDescription}</p>
        )}
        <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{program.description}</p>
      </section>

      {program.learningOutcomes?.length > 0 && (
        <section className="admin-panel p-6">
          <h3 className="text-base font-semibold text-foreground">Learning Outcomes</h3>
          <ul className="mt-4 space-y-2">
            {program.learningOutcomes.map((outcome, index) => (
              <li key={`${outcome}-${index}`} className="flex items-start gap-2 text-sm text-foreground">
                <Star className="mt-0.5 h-4 w-4 text-secondary" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="admin-panel p-6">
        <h3 className="text-base font-semibold text-foreground">
          Curriculum ({program.modules?.length || 0} modules, {totalLessons} lessons)
        </h3>

        <div className="mt-4 space-y-4">
          {program.modules?.map((module, moduleIndex) => (
            <div key={module.id} className="overflow-hidden rounded-xl border border-border/80 bg-background/70">
              <div className="border-b border-border bg-muted/40 px-4 py-3">
                <h4 className="text-sm font-medium text-foreground">
                  Module {moduleIndex + 1}: {module.title}
                </h4>
                {module.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{module.description}</p>
                )}
              </div>

              <div className="divide-y divide-border/60">
                {module.lessons?.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {lessonIndex + 1}. {lesson.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lesson.contentType} {lesson.estimatedDuration ? `- ${lesson.estimatedDuration} min` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {lesson.isFree && (
                        <span className="admin-chip border-secondary/35 bg-secondary/10 text-secondary">
                          Free
                        </span>
                      )}
                      <button
                        onClick={() => setSelectedLesson(lesson)}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                        title="Manage lesson assessment"
                      >
                        <ClipboardPenLine className="h-3.5 w-3.5" />
                        Assessment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel p-5 text-sm text-muted-foreground">
        <p>Created: {new Date(program.createdAt).toLocaleString()}</p>
        {program.publishedAt && <p>Published: {new Date(program.publishedAt).toLocaleString()}</p>}
        <p>Slug: {program.slug}</p>
        <p>ID: {program.id}</p>
      </section>

      <Sheet open={!!selectedLesson} onOpenChange={(open) => !open && setSelectedLesson(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Assessment Editor</SheetTitle>
            <SheetDescription>Create or edit the assessment for this lesson.</SheetDescription>
          </SheetHeader>
          {selectedLesson && (
            <div className="mt-6">
              <AssessmentEditor
                lessonId={selectedLesson.id}
                lessonTitle={selectedLesson.title}
                onClose={() => setSelectedLesson(null)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
