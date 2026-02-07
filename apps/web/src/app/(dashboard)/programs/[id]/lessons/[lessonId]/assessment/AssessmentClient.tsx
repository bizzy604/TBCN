'use client';

import Link from 'next/link';
import { useProgramBySlug } from '@/hooks/use-programs';
import { useAssessmentByLesson, useMyEnrollments } from '@/hooks/use-enrollments';
import { QuizPlayer } from '@/components/assessments/QuizPlayer';
import { Card } from '@/components/ui/Card';
import type { Enrollment } from '@/lib/api/enrollments';

interface AssessmentClientProps {
  programSlug: string;
  lessonId: string;
}

export default function AssessmentClient({ programSlug, lessonId }: AssessmentClientProps) {
  const { data: program, isLoading: programLoading } = useProgramBySlug(programSlug);
  const { data: enrollmentsData } = useMyEnrollments(1, 100);
  const { data: assessment, isLoading: assessmentLoading } = useAssessmentByLesson(lessonId);

  const enrollment: Enrollment | undefined = program && enrollmentsData?.data
    ? enrollmentsData.data.find((e: Enrollment) => e.programId === program.id)
    : undefined;

  if (programLoading || assessmentLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="text-sm text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Program Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn&apos;t load this program.</p>
        <Link
          href="/programs"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Back to Programs
        </Link>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">No Assessment Found</h2>
        <p className="text-muted-foreground mb-6">This lesson does not have an assessment.</p>
        <Link
          href={`/programs/${programSlug}/lessons/${lessonId}`}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Back to Lesson
        </Link>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold mb-2">Enrollment Required</h2>
        <p className="text-muted-foreground mb-6">Enroll in this program to take the assessment.</p>
        <Link
          href={`/programs/${programSlug}`}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Go to Program
        </Link>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/programs/${programSlug}/lessons/${lessonId}`}
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            Back to Lesson
          </Link>
          <h1 className="text-2xl font-semibold mt-2">{assessment.title}</h1>
          {assessment.description && (
            <p className="text-sm text-muted-foreground mt-1">{assessment.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Passing Score</p>
          <p className="text-sm font-medium">{assessment.passingScore}%</p>
        </div>
      </div>

      <QuizPlayer assessment={assessment} enrollmentId={enrollment.id} />
      </div>
    </Card>
  );
}
