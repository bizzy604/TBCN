import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lesson | Brand Coach Network',
  description: 'View lesson content and materials.',
};

export default function LessonPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lesson</h1>
        <p className="mt-2 text-muted-foreground">
          Access lesson content, videos, and materials.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="text-4xl">🎓</div>
          <h2 className="text-xl font-semibold">Lesson Content Coming Soon</h2>
          <p className="text-sm text-muted-foreground">
            Lesson videos, reading materials, and exercises will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
