import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Enrollments | Brand Coach Network',
  description: 'View and manage your program enrollments.',
};

export default function EnrollmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Enrollments</h1>
        <p className="mt-2 text-muted-foreground">
          Track your active enrollments and course progress.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">📋</div>
          <h2 className="text-xl font-semibold">No Enrollments Yet</h2>
          <p className="text-sm text-muted-foreground">
            Once you enroll in a program, your progress and details will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
