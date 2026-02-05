'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * Global error boundary
 * Catches and displays runtime errors
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Error icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/30">
          <ExclamationTriangleIcon className="h-8 w-8 text-error-600 dark:text-error-400" />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="mb-6 text-muted-foreground">
          We encountered an unexpected error. Our team has been notified and is working on a fix.
        </p>

        {/* Error digest (for debugging) */}
        {error.digest && (
          <p className="mb-6 font-mono text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Try Again
          </button>
          <Link href="/" className="btn-secondary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
