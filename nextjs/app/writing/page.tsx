import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterSection from '@/components/NewsletterSection';
import WritingArchive from '@/components/WritingArchive';
import { getDatabaseAsync } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'Writing & Essays | Abdur Rakib - Systems, Hiring & Engineering',
  description:
    'Long-form essays by Abdur Rakib on software engineering systems, AI-era developer hiring, team operations, and scaling placement infrastructure.',
  alternates: {
    canonical: 'https://rakib.xyz/writing',
  },
  openGraph: {
    type: 'website',
    url: 'https://rakib.xyz/writing',
    title: 'Writing & Essays | Abdur Rakib',
    description:
      'Long-form essays on software engineering systems, AI-era developer hiring, team operations, and scaling placement infrastructure.',
    images: [
      {
        url: 'https://rakib.xyz/img/Abdur%20Rakib%20Vaiya%202.JPG',
        alt: 'Abdur Rakib Essays & Writings',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Writing & Essays | Abdur Rakib',
    description:
      'Long-form essays on software engineering systems, AI-era developer hiring, team operations, and scaling placement infrastructure.',
    images: ['https://rakib.xyz/img/Abdur%20Rakib%20Vaiya%202.JPG'],
  },
};

export default async function WritingPage() {
  const db = await getDatabaseAsync();
  const { posts, siteInfo } = db;

  // Schema.org CollectionPage & ItemList JSON-LD
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Writing & Essays by Abdur Rakib',
    url: 'https://rakib.xyz/writing',
    description:
      'Long-form essays by Abdur Rakib on software engineering systems, AI-era developer hiring, and team operations.',
    author: {
      '@type': 'Person',
      name: 'Abdur Rakib',
      url: 'https://rakib.xyz/',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts
        .filter((p) => p.published)
        .map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `https://rakib.xyz/writing/${p.slug}`,
          name: p.title,
        })),
    },
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]" style={{ overflowX: 'hidden', width: '100%' }}>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <Header />

      <main className="container" style={{ marginTop: '56px', marginBottom: '100px' }}>
        {/* Page Hero Header */}
        <div style={{ maxWidth: '780px', marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span className="section-label">02 / Writing &amp; Publications</span>
          <h1
            className="hero-h1"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Essays on systems, hiring &amp; the work
          </h1>
          <p
            className="hero-bio"
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.65,
              color: 'var(--ink-muted)',
              margin: 0,
            }}
          >
            Practical breakdowns on software engineering discipline, operational architecture, junior developer hiring in the AI era, and scaling placement corridors.
          </p>
        </div>

        {/* Live Search, Category Filters, and Decorated Grid */}
        <WritingArchive posts={posts} />
      </main>

      <NewsletterSection />
      <Footer siteInfo={siteInfo} />
    </div>
  );
}
