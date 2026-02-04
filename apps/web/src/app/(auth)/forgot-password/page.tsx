'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
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
    } catch (error) {
      // Always show success to prevent email enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-gray-600">
            If an account with that email exists, we've sent you a password reset link.
            Please check your inbox and spam folder.
          </p>
        </div>
        
        <Link href="/login" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={20} />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl font-bold text-gray-900">Forgot password?</h1>
        <p className="mt-2 text-gray-600">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Sending...
            </>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      {/* Back to login */}
      <p className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-500 font-medium"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
      </p>
    </div>
  );
}
