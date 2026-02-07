'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProgramBySlug } from '@/hooks/use-programs';
import { useMyEnrollments } from '@/hooks/use-enrollments';
import { EnrollmentButton } from '@/components/programs/EnrollmentButton';
import { Card } from '@/components/ui/Card';
import type { Lesson, ProgramModule } from '@/lib/api/programs';

function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colors[level] || 'bg-muted text-muted-foreground'}`}>
      {level}
    </span>
  );
}

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
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition rounded-lg"
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-medium shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{lesson.title}</p>
        {lesson.description && (
          <p className="text-xs text-muted-foreground truncate">{lesson.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
        {lesson.contentType === 'video' && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {lesson.videoDuration ? `${Math.round(lesson.videoDuration / 60)}m` : 'Video'}
          </span>
        )}
        {lesson.contentType === 'text' && <span>📄 Reading</span>}
        {lesson.contentType === 'quiz' && <span>📝 Quiz</span>}
        {lesson.isFree && (
          <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
            Free
          </span>
        )}
      </div>
    </Link>
  );
}

function ModuleAccordion({
  module,
  index,
  programSlug,
}: {
  module: ProgramModule;
  index: number;
  programSlug: string;
}) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const lessonCount = module.lessons?.length || 0;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 px-5 py-4 bg-card hover:bg-muted/30 transition text-left"
      >
        <svg
          className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">
            Module {index + 1}: {module.title}
          </h3>
          {module.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{module.description}</p>
          )}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
          {module.estimatedDuration ? ` · ${module.estimatedDuration} min` : ''}
        </span>
      </button>
      {isOpen && module.lessons?.length > 0 && (
        <div className="border-t border-border divide-y divide-border/50 px-2 py-1">
          {module.lessons.map((lesson, i) => (
            <LessonRow key={lesson.id} lesson={lesson} index={i} programSlug={programSlug} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProgramDetailClient({ slug }: { slug: string }) {
  const { data: program, isLoading, error } = useProgramBySlug(slug);
  const { data: enrollmentsData } = useMyEnrollments(1, 100);

  // Check if the user is already enrolled in this program
  const enrollment = enrollmentsData?.data?.find(
    (e: any) => e.programId === program?.id && e.status === 'active',
  );
  const isEnrolled = !!enrollment;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="text-sm text-muted-foreground">Loading program...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4">😕</div>
        <h2 className="text-xl font-semibold mb-2">Program Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The program you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/programs"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Browse Programs
        </Link>
      </div>
    );
  }

  const totalLessons = program.modules?.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0) || 0;
  const totalDuration = program.modules?.reduce(
    (sum, mod) => sum + (mod.estimatedDuration || 0),
    0,
  ) || program.estimatedDuration || 0;

  return (
    <Card className="p-6">
      <div className="space-y-8">
      {/* Banner */}
      {program.bannerUrl && (
        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
          <Image
            src={program.bannerUrl}
            alt={program.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left – Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title & Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <DifficultyBadge level={program.difficulty} />
              {program.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-muted text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{program.title}</h1>
            {program.shortDescription && (
              <p className="text-lg text-muted-foreground">{program.shortDescription}</p>
            )}
            {/* Instructor */}
            {program.instructor && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                  {program.instructor.avatarUrl ? (
                    <Image
                      src={program.instructor.avatarUrl}
                      alt={`${program.instructor.firstName} ${program.instructor.lastName}`}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-muted-foreground">
                      {program.instructor.firstName?.[0]}
                      {program.instructor.lastName?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {program.instructor.firstName} {program.instructor.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">Instructor</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-3">About This Program</h2>
            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {program.description}
            </div>
          </div>

          {/* Learning Outcomes */}
          {program.learningOutcomes?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">What You&apos;ll Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {program.learningOutcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-foreground">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {program.prerequisites?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Prerequisites</h2>
              <ul className="space-y-2">
                {program.prerequisites.map((prereq, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Curriculum */}
          {program.modules?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Curriculum</h2>
              <div className="space-y-3">
                {program.modules.map((mod, i) => (
                  <ModuleAccordion key={mod.id} module={mod} index={i} programSlug={program.slug} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right – Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6 space-y-6">
            {/* Thumbnail */}
            {program.thumbnailUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={program.thumbnailUrl}
                  alt={program.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Price */}
            <div className="text-center">
              {program.isFree ? (
                <p className="text-3xl font-bold text-green-600">Free</p>
              ) : (
                <p className="text-3xl font-bold">
                  {program.currency === 'USD' ? '$' : program.currency}
                  {Number(program.price).toFixed(2)}
                </p>
              )}
            </div>

            {/* Enroll */}
            <EnrollmentButton
              programId={program.id}
              programSlug={program.slug}
              isFree={program.isFree}
              price={Number(program.price)}
              currency={program.currency || 'KES'}
              isEnrolled={isEnrolled}
              enrollmentId={enrollment?.id}
            />

            {/* Stats */}
            <div className="divide-y divide-border text-sm">
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Difficulty</span>
                <span className="font-medium capitalize">{program.difficulty}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Modules</span>
                <span className="font-medium">{program.modules?.length || 0}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Lessons</span>
                <span className="font-medium">{totalLessons}</span>
              </div>
              {totalDuration > 0 && (
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {totalDuration >= 60
                      ? `${Math.round(totalDuration / 60)}h ${totalDuration % 60}m`
                      : `${totalDuration}m`}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-3">
                <span className="text-muted-foreground">Enrolled</span>
                <span className="font-medium">{program.enrollmentCount} students</span>
              </div>
              {program.averageRating && (
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium">
                    ⭐ {Number(program.averageRating).toFixed(1)} ({program.totalRatings})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </Card>
  );
}
