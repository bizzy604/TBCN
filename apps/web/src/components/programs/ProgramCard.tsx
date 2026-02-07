'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ProgramSummary } from '@/lib/api/programs';

interface ProgramCardProps {
  program: ProgramSummary;
  className?: string;
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function ProgramCard({ program, className }: ProgramCardProps) {
  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency || 'KES',
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <Link href={`/programs/${program.slug}`}>
      <div
        className={cn(
          'group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
          'shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1',
          'overflow-hidden cursor-pointer',
          className,
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-yellow-400 to-orange-500 overflow-hidden">
          {program.thumbnailUrl ? (
            <img
              src={program.thumbnailUrl}
              alt={program.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-sm font-bold',
                program.isFree
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-900 shadow-md',
              )}
            >
              {formatPrice(program.price, program.currency)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Tags row */}
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', difficultyColors[program.difficulty] || difficultyColors.beginner)}>
              {program.difficulty}
            </span>
            {program.estimatedDuration && (
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDuration(program.estimatedDuration)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
            {program.title}
          </h3>

          {/* Description */}
          {program.shortDescription && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {program.shortDescription}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            {/* Instructor */}
            {program.instructor && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                  {program.instructor.avatarUrl ? (
                    <img src={program.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {program.instructor.firstName?.[0]}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {program.instructor.firstName} {program.instructor.lastName}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {program.averageRating && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {Number(program.averageRating).toFixed(1)}
                </span>
              )}
              <span>{program.enrollmentCount} enrolled</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
