'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast notification provider
 * Provides global toast notifications with consistent styling
 */
export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#171717',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
          },
          // Success toast styling
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: '#ffffff',
            },
          },
          // Error toast styling
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },
            duration: 5000,
          },
        }}
      />
    </>
  );
}
