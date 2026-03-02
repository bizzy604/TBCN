'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';

function scorePassword(value: string): number {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  return score;
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const passwordScore = scorePassword(password);
  const passwordStrength = ['Weak', 'Fair', 'Good', 'Strong'][Math.max(0, passwordScore - 1)] || 'Weak';

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Invalid reset link</h1>
        <p className="text-sm text-muted-foreground">This password reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="btn btn-primary w-full">
          Request new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setStatus('loading');

    try {
      await authApi.resetPassword(token, password, confirmPassword);
      setStatus('success');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Could not reset password.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary/15 text-secondary">
          <CheckCircle className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">Password updated</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your password has been updated successfully.</p>
        </div>
        <Link href="/login" className="btn btn-primary w-full">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Reset password</h1>
        <p className="text-sm text-muted-foreground">Enter your new password to continue.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-xl border border-destructive/35 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <label>
          <span className="label">New Password</span>
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input"
            placeholder="Enter a strong password"
          />
        </label>

        <div className="space-y-2 rounded-xl border border-border bg-muted/45 p-3">
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className={`h-full transition-all ${
                passwordScore <= 1
                  ? 'bg-destructive'
                  : passwordScore === 2
                    ? 'bg-accent'
                    : passwordScore === 3
                      ? 'bg-secondary'
                      : 'bg-primary'
              }`}
              style={{ width: `${(passwordScore / 4) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Strength: {passwordStrength}</p>
        </div>

        <label>
          <span className="label">Confirm Password</span>
          <input
            type="password"
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="input"
            placeholder="Confirm your password"
          />
        </label>

        <button type="submit" disabled={status === 'loading'} className="btn btn-primary w-full">
          {status === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Resetting...
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-secondary hover:text-primary">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
