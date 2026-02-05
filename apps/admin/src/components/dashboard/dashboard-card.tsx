import * as React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  className?: string;
}

export function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: DashboardCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return TrendingUp;
    if (trend.value < 0) return TrendingDown;
    return Minus;
  };

  const TrendIcon = getTrendIcon();

  const variantStyles = {
    default: {
      card: 'bg-card border border-border',
      icon: 'bg-muted text-foreground',
    },
    primary: {
      card: 'bg-primary text-primary-foreground',
      icon: 'bg-primary-foreground/20 text-primary-foreground',
    },
    secondary: {
      card: 'bg-secondary text-secondary-foreground',
      icon: 'bg-secondary-foreground/20 text-secondary-foreground',
    },
    accent: {
      card: 'bg-accent text-accent-foreground',
      icon: 'bg-accent-foreground/20 text-accent-foreground',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-6 transition-all hover:shadow-lg',
        styles.card,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p
            className={cn(
              'text-sm font-medium',
              variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
            )}
          >
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p
              className={cn(
                'text-sm',
                variant === 'default' ? 'text-muted-foreground' : 'opacity-70'
              )}
            >
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5">
              {TrendIcon && (
                <TrendIcon
                  className={cn(
                    'h-4 w-4',
                    trend.value > 0 && 'text-green-500',
                    trend.value < 0 && 'text-red-500'
                  )}
                />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.value > 0 && 'text-green-500',
                  trend.value < 0 && 'text-red-500',
                  variant !== 'default' && 'opacity-90'
                )}
              >
                {trend.value > 0 && '+'}
                {trend.value}%
              </span>
              <span
                className={cn(
                  'text-sm',
                  variant === 'default' ? 'text-muted-foreground' : 'opacity-70'
                )}
              >
                {trend.label}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            styles.icon
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Decorative element */}
      {variant !== 'default' && (
        <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      )}
    </div>
  );
}
