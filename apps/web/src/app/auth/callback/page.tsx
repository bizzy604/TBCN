'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { usersApi } from '@/lib/api';
import { getRedirectForRole } from '@/types';
import toast from 'react-hot-toast';

type CallbackStatus = 'processing' | 'success' | 'error';

/**
 * OAuth Callback Page
 * Receives tokens from the API's OAuth redirect and stores them in the auth store.
 * URL format: /auth/callback?accessToken=...&refreshToken=...&expiresIn=...&provider=...
 * Error format: /auth/callback?error=...&provider=...
 */
export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [message, setMessage] = useState('Processing your login...');
  const processedRef = useRef(false);

  const { setUser, setTokens } = useAuthStore();

  useEffect(() => {
    // Prevent double processing in strict mode
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      const error = searchParams.get('error');
      const provider = searchParams.get('provider') || 'social';

      // Handle error case
      if (error) {
        setStatus('error');
        const errorMessages: Record<string, string> = {
          no_email: `Could not get your email from ${provider}. Please ensure your ${provider} account has an email address.`,
          auth_failed: `Authentication with ${provider} failed. Please try again.`,
        };
        setMessage(errorMessages[error] || `Login with ${provider} failed. Please try again.`);
        toast.error(`${provider} login failed`);
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
        return;
      }

      // Extract tokens from URL
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const expiresIn = searchParams.get('expiresIn');
      const redirectTo = searchParams.get('redirectTo');

      if (!accessToken || !refreshToken) {
        setStatus('error');
        setMessage('Invalid callback: missing authentication tokens.');
        toast.error('Login failed — missing tokens');
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
        return;
      }

      try {
        // Store tokens in auth store
        setTokens(accessToken, refreshToken);

        // Fetch full user profile from /users/me
        const user = await usersApi.getMe();
        setUser(user);

        // Determine role-based redirect
        const destination = redirectTo || getRedirectForRole(user.role);

        setStatus('success');
        setMessage(`Welcome${user.firstName ? `, ${user.firstName}` : ''}! Redirecting...`);
        toast.success(`Signed in with ${provider}`);

        // Redirect to role-appropriate page
        setTimeout(() => {
          router.push(destination);
        }, 1500);
      } catch (err) {
        setStatus('error');
        setMessage('Failed to fetch your profile. Please try logging in again.');
        toast.error('Login failed');
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, setUser, setTokens]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        {/* Status Icon */}
        <div className="flex justify-center">
          {status === 'processing' && (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle size={32} className="text-red-600" />
            </div>
          )}
        </div>

        {/* Status Text */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {status === 'processing' && 'Signing you in...'}
            {status === 'success' && 'Login Successful!'}
            {status === 'error' && 'Login Failed'}
          </h1>
          <p className="mt-2 text-muted-foreground">{message}</p>
        </div>

        {/* Manual redirect link */}
        {status === 'error' && (
          <button
            onClick={() => router.push('/login')}
            className="btn-primary px-6 py-2"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
