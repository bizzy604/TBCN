import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  imageWrapperClassName?: string;
  priority?: boolean;
  size?: number;
  subtitle?: string;
  subtitleClassName?: string;
  textClassName?: string;
  title?: string;
  titleClassName?: string;
}

export default function BrandLogo({
  className,
  imageClassName,
  imageWrapperClassName,
  priority = false,
  size = 40,
  subtitle,
  subtitleClassName,
  textClassName,
  title,
  titleClassName,
}: BrandLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <span
        className={cn(
          'relative block shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 shadow-sm',
          imageWrapperClassName,
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src="/images/tbcn-logo.jpeg"
          alt="The Brand Coach Network logo"
          fill
          priority={priority}
          sizes={`${size}px`}
          className={cn('object-cover', imageClassName)}
        />
      </span>

      {(title || subtitle) && (
        <span className={cn('min-w-0 leading-none', textClassName)}>
          {title ? (
            <span className={cn('block', titleClassName)}>{title}</span>
          ) : null}
          {subtitle ? (
            <span className={cn('mt-1 block', subtitleClassName)}>
              {subtitle}
            </span>
          ) : null}
        </span>
      )}
    </div>
  );
}
