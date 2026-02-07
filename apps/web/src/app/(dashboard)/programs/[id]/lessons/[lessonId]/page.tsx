import type { Metadata } from 'next';
import LessonPlayerClient from './LessonPlayerClient';

export const metadata: Metadata = {
  title: 'Lesson | Brand Coach Network',
  description: 'View lesson content and materials.',
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  return <LessonPlayerClient programSlug={id} lessonId={lessonId} />;
}
