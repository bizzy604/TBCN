'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsSubmitted(true);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary/15 text-secondary">
          <CheckCircle className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            If an account exists for that email, a password reset link was sent.
          </p>
        </div>
        <Link href="/login" className="btn btn-outline w-full">
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">Enter your email and we will send a reset link.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label>
          <span className="label">Email</span>
          <input className={`input ${errors.email ? 'input-error' : ''}`} placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </label>

        <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="inline-flex items-center gap-2 font-medium text-secondary hover:text-primary">
          <ArrowLeft size={14} />
          Back to login
        </Link>
      </p>
    </div>
  );
}
