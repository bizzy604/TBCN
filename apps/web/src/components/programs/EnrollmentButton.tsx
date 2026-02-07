'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEnroll } from '@/hooks/use-enrollments';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface EnrollmentButtonProps {
  programId: string;
  programSlug?: string;
  isFree: boolean;
  price: number;
  currency: string;
  isEnrolled?: boolean;
  enrollmentId?: string;
  className?: string;
}

export function EnrollmentButton({
  programId,
  programSlug,
  isFree,
  price,
  currency,
  isEnrolled = false,
  enrollmentId,
  className,
}: EnrollmentButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const enrollMutation = useEnroll();
  const [confirming, setConfirming] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency || 'KES',
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const handleEnroll = async () => {
    if (!user) {
      const redirectPath = programSlug ? `/programs/${programSlug}` : '/programs';
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    if (isEnrolled && enrollmentId) {
      router.push(`/enrollments`);
      return;
    }

    if (!isFree && !confirming) {
      setConfirming(true);
      return;
    }

    try {
      await enrollMutation.mutateAsync(programId);
      toast.success('Successfully enrolled! Let\'s start learning.');
      router.push('/enrollments');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to enroll. Please try again.');
      setConfirming(false);
    }
  };

  if (isEnrolled) {
    return (
      <button
        onClick={handleEnroll}
        className={cn(
          'w-full py-3 px-6 rounded-lg font-semibold text-white',
          'bg-green-600 hover:bg-green-700 transition-colors',
          className,
        )}
      >
        Continue Learning
      </button>
    );
  }

  if (confirming) {
    return (
      <div className={cn('space-y-2', className)}>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Confirm enrollment for <strong>{formatPrice(price, currency)}</strong>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 py-2 px-4 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            disabled={enrollMutation.isPending}
            className="flex-1 py-2 px-4 rounded-lg font-semibold text-white bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 transition-colors"
          >
            {enrollMutation.isPending ? 'Enrolling...' : 'Confirm'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={enrollMutation.isPending}
      className={cn(
        'w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors',
        'bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50',
        'shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40',
        className,
      )}
    >
      {enrollMutation.isPending
        ? 'Enrolling...'
        : isFree
          ? 'Enroll for Free'
          : `Enroll — ${formatPrice(price, currency)}`}
    </button>
  );
}
