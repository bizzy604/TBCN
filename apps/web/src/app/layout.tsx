import type { Metadata, Viewport } from 'next';
import { Outfit, Space_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { AuthCookieSync } from '@/components/auth';
import { ThemeToggle } from '@/components/theme/theme-toggle';

// Font configuration
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

// SEO Metadata
export const metadata: Metadata = {
  title: {
    default: 'The Brand Coach Network | Build Your Brand, Transform Your Life',
    template: '%s | The Brand Coach Network',
  },
  description:
    'Join Africa\'s premier coaching platform. Discover your brand, build visibility, and create measurable impact through structured coaching, community, and commerce.',
  keywords: [
    'brand coaching',
    'personal branding',
    'African entrepreneurs',
    'business coaching',
    'online learning',
    'coaching marketplace',
    'professional development',
  ],
  authors: [{ name: 'The Brand Coach Network' }],
  creator: 'The Brand Coach Network',
  publisher: 'The Brand Coach Network',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://brandcoachnetwork.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'The Brand Coach Network',
    title: 'The Brand Coach Network | Build Your Brand, Transform Your Life',
    description:
      'Join Africa\'s premier coaching platform. Discover your brand, build visibility, and create measurable impact.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Brand Coach Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Brand Coach Network',
    description: 'Build Your Brand, Transform Your Life',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

// Viewport configuration
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFA' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// Root Layout Component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <AuthCookieSync />
          {children}
          <ThemeToggle />
        </Providers>
      </body>
    </html>
  );
}
