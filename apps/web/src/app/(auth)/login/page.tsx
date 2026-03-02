'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { authApi, usersApi } from '@/lib/api';
import { getRedirectForRole } from '@/types';
import { SocialLoginButtons } from '@/components/auth';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setTokens } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      setTokens(response.accessToken, response.refreshToken);
      const fullUser = await usersApi.getMe();
      setUser(fullUser);

      toast.success('Welcome back');
      const destination = searchParams.get('redirect') || response.redirectTo || getRedirectForRole(fullUser.role);
      router.push(destination);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid email or password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex rounded-full border border-border bg-muted/60 p-1 text-xs font-medium">
          <span className="rounded-full bg-card px-3 py-1 text-foreground">Login</span>
          <Link href="/register" className="rounded-full px-3 py-1 text-muted-foreground hover:text-foreground">
            Sign Up
          </Link>
        </div>
        <h1 className="text-3xl font-semibold">Sign in to your account</h1>
        <p className="text-sm text-muted-foreground">Continue your learning, coaching, and community experience.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block">
          <span className="label">Email</span>
          <input
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </label>

        <label className="block">
          <span className="label">Password</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
              placeholder="Enter your password"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </label>

        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-input text-primary focus:ring-primary" {...register('rememberMe')} />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-secondary hover:text-primary">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="relative py-1 text-center text-xs text-muted-foreground">
        <span className="bg-card px-2">Or continue with</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-border" aria-hidden="true" />
      </div>

      <SocialLoginButtons mode="login" disabled={isLoading} />

      <p className="text-center text-sm text-muted-foreground">
        New here?{' '}
        <Link href="/register" className="font-medium text-primary hover:text-secondary">
          Create an account
        </Link>
      </p>
    </div>
  );
}
