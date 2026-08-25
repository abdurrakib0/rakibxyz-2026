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
  title: {
    default: 'Abdur Rakib | COO, Programming Hero — Systems, Hiring & Tech Placements',
    template: '%s | Abdur Rakib',
  },
  description:
    'Official website of Abdur Rakib, Chief Operating Officer at Programming Hero. Engineering high-throughput tech placement systems, developer hiring pipelines, and global ed-tech infrastructure across 57+ countries.',
  keywords: [
    'Abdur Rakib',
    'Abdur Rakib COO',
    'Rakib Vai Programming Hero',
    'Abdur Rakib Zero',
    'Programming Hero',
    'Phitron',
    'Tech Job Placement Bangladesh',
    'Software Engineering Systems',
    'AI Developer Hiring Standards',
    'Junior Developer Placement',
    'High Throughput Vocational Training',
    'Career Crackerz',
    'Bangladesh Tech Leadership',
  ],
  authors: [{ name: 'Abdur Rakib', url: 'https://rakib.xyz' }],
  creator: 'Abdur Rakib',
  publisher: 'Abdur Rakib',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    title: 'Abdur Rakib | COO, Programming Hero — Systems, Hiring & Tech Placements',
    description:
      'Chief Operating Officer at Programming Hero. Building operational systems for tech talent and scaling global placement infrastructure across 57+ countries.',
    images: [
      {
        url: 'https://rakib.xyz/img/Abdur%20Rakib%20Vaiya%202.JPG',
        width: 1200,
        height: 630,
        alt: 'Abdur Rakib — Chief Operating Officer at Programming Hero',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@abdurrakib0',
    creator: '@abdurrakib0',
    title: 'Abdur Rakib | Systems, Hiring & Tech Placements',
    description:
      'COO at Programming Hero. Building operational systems for tech talent and scaling global placement infrastructure.',
    images: ['https://rakib.xyz/img/Abdur%20Rakib%20Vaiya%202.JPG'],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://widgets.sociablekit.com" />
        <link rel="dns-prefetch" href="https://widgets.sociablekit.com" />
        <JsonLd />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
