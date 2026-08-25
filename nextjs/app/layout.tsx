import type { Metadata, Viewport } from 'next';
import { Newsreader, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import JsonLd from '@/components/JsonLd';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const viewport: Viewport = {
  themeColor: '#FAF9F5',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://rakib.xyz'),
  title: 'Abdur Rakib | COO, Programming Hero - Systems, Hiring & Tech Placements',
  description:
    'Official website of Abdur Rakib, COO at Programming Hero. Engineering high-throughput tech placement systems, developer hiring pipelines, and global ed-tech infrastructure.',
  keywords: [
    'Abdur Rakib',
    'Programming Hero',
    'COO',
    'Tech Job Placement',
    'Software Engineering Systems',
    'AI Developer Hiring',
    'Career Crackerz',
    'Bangladesh Tech Leaders',
  ],
  authors: [{ name: 'Abdur Rakib' }],
  alternates: {
    canonical: 'https://rakib.xyz',
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
  icons: {
    icon: '/img/Abdur%20Rakib%20Vaiya%202.JPG',
    shortcut: '/img/Abdur%20Rakib%20Vaiya%202.JPG',
    apple: '/img/Abdur%20Rakib%20Vaiya%202.JPG',
  },
  openGraph: {
    siteName: 'Abdur Rakib',
    type: 'profile',
    locale: 'en_US',
    url: 'https://rakib.xyz/',
    title: 'Abdur Rakib | Systems, Hiring & Tech Placements',
    description:
      'COO at Programming Hero. Building operational systems for tech talent and scaling global placement infrastructure across 57+ countries.',
    images: [
      {
        url: '/img/Hero%20image.png',
        width: 1200,
        height: 630,
        alt: 'Abdur Rakib Portrait',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@abdurrakib0',
    title: 'Abdur Rakib | Systems, Hiring & Tech Placements',
    description:
      'COO at Programming Hero. Building operational systems for tech talent and scaling global placement infrastructure.',
    images: ['/img/Hero%20image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} ${ibmPlexMono.variable}`} prefix="og: https://ogp.me/ns#">
      <head>
        <link rel="preconnect" href="https://widgets.sociablekit.com" />
        <link rel="dns-prefetch" href="https://widgets.sociablekit.com" />
        <JsonLd />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
