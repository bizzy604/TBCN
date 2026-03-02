'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning';
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = true,
  size = 'md',
  variant = 'default',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-secondary',
    warning: 'bg-accent',
  };

  const tone = percentage >= 100 ? 'success' : variant;

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-muted', sizeClasses[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', variantClasses[tone])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
