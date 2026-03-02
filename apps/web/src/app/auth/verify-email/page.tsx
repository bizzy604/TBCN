'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Mail, XCircle } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email') || 'your@email.com';

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('idle');
      return;
    }

    let mounted = true;
    const run = async () => {
      setStatus('loading');
      setMessage('Verifying your email...');
      try {
        const response = await authApi.verifyEmail(token);
        if (!mounted) return;
        setStatus('success');
        setMessage(response.message || 'Email verified successfully.');
      } catch (error: any) {
        if (!mounted) return;
        setStatus('error');
        setMessage(error?.response?.data?.message || error?.message || 'Verification failed.');
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="card w-full max-w-md p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/16 text-accent">
          {status === 'success' ? <CheckCircle2 className="h-8 w-8" /> : status === 'error' ? <XCircle className="h-8 w-8" /> : <Mail className="h-8 w-8" />}
        </div>

        {status === 'idle' && (
          <>
            <h1 className="text-2xl font-semibold">Verify your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a verification link to {email}. Open your inbox and click the link to activate your account.
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <a className="btn btn-outline" href="https://mail.google.com" target="_blank" rel="noreferrer">
                Open Gmail
              </a>
              <a className="btn btn-outline" href="https://outlook.live.com" target="_blank" rel="noreferrer">
                Open Outlook
              </a>
            </div>

            <div className="mt-3">
              <Link href="/login" className="text-sm font-medium text-secondary hover:text-primary">
                Back to login
              </Link>
            </div>
          </>
        )}

        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-semibold">Verifying email</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-2xl font-semibold">Email verified</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Link href="/dashboard" className="btn btn-primary mt-6 w-full">
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-semibold">Verification failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Link href="/register" className="btn btn-outline mt-6 w-full">
              Register again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
