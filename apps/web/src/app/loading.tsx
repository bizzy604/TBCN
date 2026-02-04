/**
 * Global loading state
 * Shown during route transitions
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-neutral-200 dark:border-neutral-800" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
        
        {/* Loading text */}
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Loading...
        </p>
      </div>
    </div>
  );
}
