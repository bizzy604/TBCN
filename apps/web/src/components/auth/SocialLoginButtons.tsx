'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { OAuthProvider } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface SocialLoginButtonsProps {
  mode?: 'login' | 'register';
  disabled?: boolean;
}

const providers: Array<{ key: OAuthProvider; label: string; short: string }> = [
  { key: 'google', label: 'Google', short: 'G' },
  { key: 'linkedin', label: 'LinkedIn', short: 'in' },
  { key: 'facebook', label: 'Facebook', short: 'f' },
];

export function SocialLoginButtons({ mode = 'login', disabled = false }: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const handleSocialLogin = (provider: OAuthProvider) => {
    setLoadingProvider(provider);
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  const actionText = mode === 'login' ? 'Sign in' : 'Sign up';

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {providers.map((provider) => (
        <button
          key={provider.key}
          type="button"
          disabled={disabled || loadingProvider !== null}
          className="btn btn-outline justify-center"
          onClick={() => handleSocialLogin(provider.key)}
          title={`${actionText} with ${provider.label}`}
          aria-label={`${actionText} with ${provider.label}`}
        >
          {loadingProvider === provider.key ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
              {provider.short}
            </span>
          )}
          <span>{provider.label}</span>
        </button>
      ))}
    </div>
  );
}
