'use client';

import { VideoPlayer } from './VideoPlayer';
import type { Lesson } from '@/lib/api/programs';

interface LessonContentProps {
  lesson: Lesson;
  startPosition?: number;
  onVideoTimeUpdate?: (time: number) => void;
  onVideoComplete?: () => void;
}

export function LessonContent({
  lesson,
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
        {/* Optional text content below video */}
        {lesson.content && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {lesson.content}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (lesson.contentType === 'text') {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-foreground leading-relaxed">
          {lesson.content || 'No content available for this lesson.'}
        </div>
      </div>
    );
  }

  if (lesson.contentType === 'quiz') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="text-3xl mb-3">📝</div>
        <h3 className="text-lg font-semibold mb-2">Assessment</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This lesson includes an assessment. Complete it to track your progress.
        </p>
        <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition">
          Start Assessment
        </button>
      </div>
    );
  }

  if (lesson.contentType === 'assignment') {
    return (
      <div className="space-y-6">
        {lesson.content && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {lesson.content}
            </div>
          </div>
        )}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold mb-2">Assignment</h3>
          <p className="text-sm text-muted-foreground">
            Submit your work for this assignment to receive feedback.
          </p>
        </div>
      </div>
    );
  }

  // Resource or fallback
  return (
    <div className="space-y-6">
      {lesson.content && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
            {lesson.content}
          </div>
        </div>
      )}
      {lesson.resourceUrls?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Resources</h3>
          <div className="space-y-2">
            {lesson.resourceUrls.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/30 transition text-sm"
              >
                <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <span className="text-foreground truncate">{url.split('/').pop() || `Resource ${i + 1}`}</span>
                <svg className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}