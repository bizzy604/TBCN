'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="card max-w-lg p-10 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Error 500</p>
        <h1 className="mt-2 text-4xl font-semibold">Something Went Wrong</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We are already tracking this issue. Please retry in a moment.
        </p>

        {error.digest && <p className="mt-4 text-xs font-mono text-muted-foreground">Error ID: {error.digest}</p>}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={reset} className="btn btn-primary" type="button">
            Retry
          </button>
          <Link href="/" className="btn btn-outline">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
