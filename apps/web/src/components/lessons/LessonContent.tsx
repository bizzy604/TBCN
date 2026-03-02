'use client';

import Link from 'next/link';
import type { Lesson } from '@/lib/api/programs';
import { VideoPlayer } from './VideoPlayer';

interface LessonContentProps {
  lesson: Lesson;
  programSlug?: string;
  lessonId?: string;
  startPosition?: number;
  onVideoTimeUpdate?: (time: number) => void;
  onVideoComplete?: () => void;
}

export function LessonContent({
  lesson,
  programSlug,
  lessonId,
  startPosition,
  onVideoTimeUpdate,
  onVideoComplete,
}: LessonContentProps) {
  if (lesson.contentType === 'video' && lesson.videoUrl) {
    return (
      <div className="space-y-6">
        <VideoPlayer
          src={lesson.videoUrl}
          title={lesson.title}
          startPosition={startPosition}
          onTimeUpdate={onVideoTimeUpdate}
          onComplete={onVideoComplete}
        />
        {lesson.content && <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{lesson.content}</p>}
      </div>
    );
  }

  if (lesson.contentType === 'text') {
    return <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{lesson.content || 'No content available.'}</p>;
  }

  if (lesson.contentType === 'quiz') {
    const assessmentPath = programSlug && lessonId ? `/programs/${programSlug}/lessons/${lessonId}/assessment` : null;
    return (
      <div className="card p-8 text-center">
        <h3 className="text-lg font-semibold">Assessment</h3>
        <p className="mt-2 text-sm text-muted-foreground">Complete this quiz to validate understanding and track progress.</p>
        {assessmentPath ? (
          <Link href={assessmentPath} className="btn btn-primary mt-4">
            Start Assessment
          </Link>
        ) : (
          <button type="button" disabled className="btn btn-outline mt-4">
            Start Assessment
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lesson.content && <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{lesson.content}</p>}
      {lesson.resourceUrls?.length ? (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Resources</h3>
          {lesson.resourceUrls.map((url, index) => (
            <a
              key={`${url}-${index}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover flex items-center justify-between gap-3 p-3 text-sm"
            >
              <span className="truncate text-foreground">{url.split('/').pop() || `Resource ${index + 1}`}</span>
              <span className="text-xs font-semibold text-secondary">Open</span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
