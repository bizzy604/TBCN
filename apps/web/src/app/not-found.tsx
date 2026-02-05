import Link from 'next/link';
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * 404 Not Found page
 * Shown when a route doesn't exist
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        {/* 404 Text */}
        <p className="text-8xl font-bold text-primary">404</p>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mt-2 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved or doesn't exist.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="btn-primary inline-flex items-center justify-center gap-2">
            <HomeIcon className="h-4 w-4" />
            Go Home
          </Link>
          <Link href="/courses" className="btn-secondary inline-flex items-center justify-center gap-2">
            <MagnifyingGlassIcon className="h-4 w-4" />
            Browse Courses
          </Link>
        </div>

        {/* Help link */}
        <p className="mt-8 text-sm text-muted-foreground">
          Need help?{' '}
          <Link href="/contact" className="text-primary hover:text-primary/80 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
