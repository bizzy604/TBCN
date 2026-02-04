import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
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
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-neutral-50 font-sans antialiased dark:bg-neutral-950">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
