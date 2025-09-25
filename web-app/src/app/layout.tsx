import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'OceanaVerse - Blue Carbon Registry',
    template: '%s | OceanaVerse'
  },
  description: 'Decentralized blue carbon credit management on Solana blockchain by OceanaVerse. Register, verify, and trade ocean-based carbon credits securely.',
  keywords: [
    'OceanaVerse', 'blue carbon', 'carbon credits', 'blockchain', 'solana', 'sustainability', 
    'ocean conservation', 'mangrove', 'seagrass', 'wetlands', 'carbon offset',
    'DeFi', 'environmental finance', 'climate change', 'carbon trading'
  ],
  authors: [{ name: 'OceanaVerse Team' }],
  creator: 'OceanaVerse',
  publisher: 'OceanaVerse',
  applicationName: 'Blue Carbon Registry',
  category: 'Environmental Finance',
  classification: 'Carbon Credit Management',
  referrer: 'origin-when-cross-origin',
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
  icons: {
    icon: [
      { url: '/OceanaVerse.png', type: 'image/png' },
      { url: '/OceanaVerse.png', type: 'image/png', sizes: '32x32' },
      { url: '/OceanaVerse.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/OceanaVerse.png',
    apple: '/OceanaVerse.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'OceanaVerse - Blue Carbon Registry',
    description: 'Secure, transparent carbon credit management on Solana blockchain by OceanaVerse',
    siteName: 'OceanaVerse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OceanaVerse',
    description: 'Decentralized carbon credit management on Solana by OceanaVerse',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3B82F6' },
    { media: '(prefers-color-scheme: dark)', color: '#1E40AF' }
  ],
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/OceanaVerse.png" type="image/png" />
        <link rel="icon" href="/OceanaVerse.png" type="image/png" sizes="32x32" />
        <link rel="shortcut icon" href="/OceanaVerse.png" />
        <link rel="apple-touch-icon" href="/OceanaVerse.png" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
