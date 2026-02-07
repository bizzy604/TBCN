'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Redirect: /dashboard/profile/edit → /settings/profile/edit
 * Profile editing has been consolidated under /settings/profile/edit
 */
export default function EditProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings/profile/edit');
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
