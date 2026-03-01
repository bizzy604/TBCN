'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  adminProgramsApi,
  getAdminUserFromCookie,
  PLATFORM_ADMIN_ROLES,
  type Program,
  type Lesson,
} from '@/lib/api/admin-api';
import { AssessmentEditor } from '@/components/assessments/AssessmentEditor';

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${styles[status] || 'bg-muted text-muted-foreground'}`}>
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
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
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

  const totalLessons = program.modules?.reduce(
    (sum, mod) => sum + (mod.lessons?.length || 0),
    0,
  ) || 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/programs"
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            ← Back to Programs
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mt-2">
            {program.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={program.status} />
            <span className="text-sm text-muted-foreground capitalize">
              {program.difficulty}
            </span>
            <span className="text-sm text-muted-foreground">
              {program.isFree ? 'Free' : `$${Number(program.price).toFixed(2)}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/programs/${program.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          {program.status === 'draft' && (
            <Button onClick={handlePublish}>Publish</Button>
          )}
          {program.status === 'published' && (
            isPlatformAdmin ? (
              <Button variant="outline" onClick={handleArchive}>
                Archive
              </Button>
            ) : null
          )}
          {isPlatformAdmin && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Description</h2>
        {program.shortDescription && (
          <p className="text-sm text-muted-foreground italic">{program.shortDescription}</p>
        )}
        <p className="text-sm text-foreground whitespace-pre-wrap">{program.description}</p>
      </div>

      {/* Tags */}
      {program.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {program.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Learning Outcomes */}
      {program.learningOutcomes?.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold">Learning Outcomes</h2>
          <ul className="space-y-1.5">
            {program.learningOutcomes.map((outcome, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5">✓</span>
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Curriculum Overview */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          Curriculum ({program.modules?.length || 0} modules, {totalLessons} lessons)
        </h2>
        {program.modules?.map((mod, mi) => (
          <div key={mod.id} className="border border-border/60 rounded-lg overflow-hidden">
            <div className="bg-muted/30 px-4 py-3">
              <h3 className="font-medium text-sm">
                Module {mi + 1}: {mod.title}
              </h3>
              {mod.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
              )}
            </div>
            {mod.lessons?.length > 0 && (
              <div className="divide-y divide-border/30">
                {mod.lessons.map((lesson, li) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs text-muted-foreground w-5">{li + 1}.</span>
                      <span className="truncate">{lesson.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <span className="capitalize">{lesson.contentType}</span>
                      {lesson.isFree && (
                        <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                          Free
                        </span>
                      )}
                      {lesson.estimatedDuration && <span>{lesson.estimatedDuration}m</span>}
                      <button
                        onClick={() => setSelectedLesson(lesson)}
                        className="ml-1 px-2 py-1 rounded-md border border-border text-xs font-medium hover:bg-muted transition"
                        title="Manage assessment for this lesson"
                      >
                        📝 Assessment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground space-y-1">
        <p>Created: {new Date(program.createdAt).toLocaleString()}</p>
        {program.publishedAt && (
          <p>Published: {new Date(program.publishedAt).toLocaleString()}</p>
        )}
        <p>Slug: {program.slug}</p>
        <p>ID: {program.id}</p>
      </div>

      {/* Assessment Editor Sheet */}
      <Sheet
        open={!!selectedLesson}
        onOpenChange={(open) => { if (!open) setSelectedLesson(null); }}
      >
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Assessment Editor</SheetTitle>
            <SheetDescription>
              Create or edit the assessment for this lesson.
            </SheetDescription>
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
