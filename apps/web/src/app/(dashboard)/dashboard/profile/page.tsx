'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Redirect: /dashboard/profile → /settings/profile
 * Profile management has been consolidated under /settings/profile
 */
export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/profile');
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
