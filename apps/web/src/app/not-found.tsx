import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="card max-w-lg p-10 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Error 404</p>
        <h1 className="mt-2 text-4xl font-semibold">Page Not Found</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The page you are looking for has moved or does not exist.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn btn-primary">
            Go to Homepage
          </Link>
          <Link href="/dashboard" className="btn btn-outline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
