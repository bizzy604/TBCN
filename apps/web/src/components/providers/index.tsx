'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { ToastProvider } from './toast-provider';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Global providers wrapper
 * Combines all client-side providers in correct order
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
