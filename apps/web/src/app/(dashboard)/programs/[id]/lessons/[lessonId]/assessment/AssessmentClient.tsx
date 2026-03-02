'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { QuizPlayer } from '@/components/assessments/QuizPlayer';
import { useAssessmentByLesson, useMyAssessmentSubmissions, useMyEnrollments } from '@/hooks/use-enrollments';
import { useProgramBySlug } from '@/hooks/use-programs';
import type { Enrollment } from '@/lib/api/enrollments';

interface AssessmentClientProps {
  programSlug: string;
  lessonId: string;
}

export default function AssessmentClient({ programSlug, lessonId }: AssessmentClientProps) {
  const { data: program, isLoading: programLoading } = useProgramBySlug(programSlug);
  const { data: enrollmentsData } = useMyEnrollments(1, 100);
  const { data: assessment, isLoading: assessmentLoading } = useAssessmentByLesson(lessonId);
  const { data: submissions } = useMyAssessmentSubmissions(assessment?.id || '');

  const enrollment: Enrollment | undefined = program && enrollmentsData?.data
    ? enrollmentsData.data.find((item: Enrollment) => item.programId === program.id)
    : undefined;

  if (programLoading || assessmentLoading) {
    return <div className="card h-72 animate-pulse bg-muted/55" />;
  }

  if (!program) {
    return (
      <div className="card p-10 text-center">
        <h2 className="text-2xl font-semibold">Program not found</h2>
        <Link href="/programs" className="btn btn-primary mt-4">
          Back to Programs
        </Link>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="card p-10 text-center">
        <h2 className="text-2xl font-semibold">No assessment found</h2>
        <Link href={`/programs/${programSlug}/lessons/${lessonId}`} className="btn btn-outline mt-4">
          Back to Lesson
        </Link>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="card p-10 text-center">
        <h2 className="text-2xl font-semibold">Enrollment required</h2>
        <Link href={`/programs/${programSlug}`} className="btn btn-primary mt-4">
          Go to Program
        </Link>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border bg-sidebar px-5 py-6 text-sidebar-foreground sm:px-6">
        <p className="text-xs uppercase tracking-[0.16em] text-sidebar-foreground/70">Lesson Assessment</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{assessment.title}</h1>
        <p className="mt-2 text-sm text-sidebar-foreground/80">Passing score: {assessment.passingScore}%</p>
      </div>

      <div className="p-5 sm:p-6">
        {assessment.description && <p className="mb-5 text-sm text-muted-foreground">{assessment.description}</p>}
        <QuizPlayer assessment={assessment} enrollmentId={enrollment.id} existingAttempts={submissions?.length || 0} />
      </div>
    </Card>
  );
}
