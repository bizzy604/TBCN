'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useProgramBySlug } from '@/hooks/use-programs';
import { useMyEnrollments } from '@/hooks/use-enrollments';
import { EnrollmentButton } from '@/components/programs/EnrollmentButton';
import { Card } from '@/components/ui/Card';
import type { Lesson, ProgramModule } from '@/lib/api/programs';

function LessonRow({
  lesson,
  index,
  programSlug,
}: {
  lesson: Lesson;
  index: number;
  programSlug: string;
}) {
  return (
    <Link
      href={`/programs/${programSlug}/lessons/${lesson.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-muted/60"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
          {index + 1}
        </span>
        <div>
          <p className="font-medium text-foreground">{lesson.title}</p>
          {lesson.description && <p className="text-xs text-muted-foreground line-clamp-1">{lesson.description}</p>}
        </div>
      </div>
      <span className="text-xs text-muted-foreground capitalize">{lesson.contentType}</span>
    </Link>
  );
}

function ModuleAccordion({ module, index, programSlug }: { module: ProgramModule; index: number; programSlug: string }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <p className="text-base font-semibold text-foreground">Module {index + 1}: {module.title}</p>
          {module.description && <p className="text-xs text-muted-foreground">{module.description}</p>}
        </div>
        <span className="text-xs text-muted-foreground">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && module.lessons?.length ? (
        <div className="space-y-2 border-t border-border px-4 py-3">
          {module.lessons.map((lesson, lessonIndex) => (
            <LessonRow key={lesson.id} lesson={lesson} index={lessonIndex} programSlug={programSlug} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ProgramDetailClient({ slug }: { slug: string }) {
  const { data: program, isLoading, error } = useProgramBySlug(slug);
  const { data: enrollmentsData } = useMyEnrollments(1, 100);

  const enrollment = enrollmentsData?.data?.find((item: any) => item.programId === program?.id);
  const isEnrolled = !!enrollment;

  if (isLoading) {
    return <div className="card h-80 animate-pulse bg-muted/55" />;
  }

  if (error || !program) {
    return (
      <Card className="p-10 text-center">
        <h2 className="text-2xl font-semibold">Program not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This program may have been removed.</p>
        <Link href="/programs" className="btn btn-primary mt-5">
          Browse Programs
        </Link>
      </Card>
    );
  }

  const totalLessons = program.modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;
  const totalDuration =
    program.modules?.reduce((sum, module) => sum + Number(module.estimatedDuration || 0), 0) ||
    program.estimatedDuration ||
    0;

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative border-b border-border bg-sidebar px-5 py-8 text-sidebar-foreground sm:px-6">
        {program.bannerUrl && (
          <div className="absolute inset-0 opacity-15">
            <Image src={program.bannerUrl} alt={program.title} fill className="object-cover" />
          </div>
        )}
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Program Detail</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{program.title}</h1>
          {program.shortDescription && <p className="mt-2 text-sm text-sidebar-foreground/80">{program.shortDescription}</p>}
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1.4fr),360px] sm:p-6">
        <section className="space-y-6">
          <div className="card p-4">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{program.description}</p>
          </div>

          {program.learningOutcomes?.length ? (
            <div className="card p-4">
              <h2 className="text-xl font-semibold">What You Will Learn</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {program.learningOutcomes.map((outcome, index) => (
                  <li key={`${outcome}-${index}`}>- {outcome}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {program.prerequisites?.length ? (
            <div className="card p-4">
              <h2 className="text-xl font-semibold">Prerequisites</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {program.prerequisites.map((item, index) => (
                  <li key={`${item}-${index}`}>- {item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {program.modules?.length ? (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Curriculum</h2>
              {program.modules.map((module, index) => (
                <ModuleAccordion key={module.id} module={module} index={index} programSlug={program.slug} />
              ))}
            </div>
          ) : null}
        </section>

        <aside>
          <div className="card sticky top-24 p-5">
            <div className="space-y-3">
              {program.thumbnailUrl && (
                <div className="relative aspect-video overflow-hidden rounded-xl">
                  <Image src={program.thumbnailUrl} alt={program.title} fill className="object-cover" />
                </div>
              )}

              <div className="rounded-xl border border-border bg-background p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-base font-semibold text-foreground">
                    {program.isFree ? 'Free' : `${program.currency} ${Number(program.price).toFixed(2)}`}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Modules</span>
                  <span className="font-medium text-foreground">{program.modules?.length || 0}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Lessons</span>
                  <span className="font-medium text-foreground">{totalLessons}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{totalDuration ? `${totalDuration} mins` : 'Self-paced'}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Enrolled</span>
                  <span className="font-medium text-foreground">{program.enrollmentCount}</span>
                </div>
              </div>

              <EnrollmentButton
                programId={program.id}
                programSlug={program.slug}
                isFree={program.isFree}
                price={Number(program.price)}
                currency={program.currency || 'KES'}
                isEnrolled={isEnrolled}
                enrollmentId={enrollment?.id}
              />
            </div>
          </div>
        </aside>
      </div>
    </Card>
  );
}
