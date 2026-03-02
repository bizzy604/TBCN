'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { authApi } from '@/lib/api';
import { SocialLoginButtons } from '@/components/auth';
import toast from 'react-hot-toast';

const passwordRequirements = [
  { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
  { id: 'number', label: 'One number', regex: /\d/ },
];

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/\d/, 'Password must contain a number'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the terms and privacy policy' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as unknown as true,
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        acceptTerms: data.acceptTerms,
      });

      toast.success('Registration successful. Check your email for verification.');
      router.push('/login?registered=true');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex rounded-full border border-border bg-muted/60 p-1 text-xs font-medium">
          <Link href="/login" className="rounded-full px-3 py-1 text-muted-foreground hover:text-foreground">
            Login
          </Link>
          <span className="rounded-full bg-card px-3 py-1 text-foreground">Sign Up</span>
        </div>
        <h1 className="text-3xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">Start your onboarding and choose the plan that fits your growth stage.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="label">First Name</span>
            <input className={`input ${errors.firstName ? 'input-error' : ''}`} placeholder="John" {...register('firstName')} />
            {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
          </label>
          <label>
            <span className="label">Last Name</span>
            <input className={`input ${errors.lastName ? 'input-error' : ''}`} placeholder="Doe" {...register('lastName')} />
            {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
          </label>
        </div>

        <label>
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

        <label>
          <span className="label">Password</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
              placeholder="Create a strong password"
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
        </label>

        {password && (
          <div className="rounded-xl border border-border bg-muted/45 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Password Strength</p>
            <div className="mt-2 space-y-1.5">
              {passwordRequirements.map((requirement) => {
                const met = requirement.regex.test(password);
                return (
                  <div key={requirement.id} className="flex items-center gap-2 text-xs">
                    {met ? <Check size={14} className="text-secondary" /> : <X size={14} className="text-muted-foreground" />}
                    <span className={met ? 'text-secondary' : 'text-muted-foreground'}>{requirement.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <label>
          <span className="label">Confirm Password</span>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Confirm your password"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </label>

        <label className="inline-flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary" {...register('acceptTerms')} />
          <span>
            By signing up, you agree to our{' '}
            <Link href="/terms" className="font-medium text-secondary hover:text-primary">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-secondary hover:text-primary">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>}

        <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="relative py-1 text-center text-xs text-muted-foreground">
        <span className="bg-card px-2">Or continue with</span>
        <div className="absolute inset-x-0 top-1/2 -z-10 border-t border-border" aria-hidden="true" />
      </div>

      <SocialLoginButtons mode="register" disabled={isLoading} />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:text-secondary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
