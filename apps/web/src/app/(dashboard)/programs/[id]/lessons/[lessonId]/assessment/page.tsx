import type { Metadata } from 'next';
import AssessmentClient from './AssessmentClient';

export const metadata: Metadata = {
  title: 'Assessment | Brand Coach Network',
  description: 'Take your lesson assessment.',
};

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  return <AssessmentClient programSlug={id} lessonId={lessonId} />;
}
