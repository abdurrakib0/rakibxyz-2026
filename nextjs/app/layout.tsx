import type { Metadata } from 'next';
import './globals.css';
import JsonLd from '@/components/JsonLd';

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
  robots: {
    index: true,
    follow: true,
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
        url: '/img/Abdur%20Rakib%20Vaiya%202.JPG',
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
    images: ['/img/Abdur%20Rakib%20Vaiya%202.JPG'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" prefix="og: https://ogp.me/ns#">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://widgets.sociablekit.com" />
        <link rel="dns-prefetch" href="https://widgets.sociablekit.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <JsonLd />
      </head>
      <body>{children}</body>
    </html>
  );
}
