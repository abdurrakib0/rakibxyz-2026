import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getDatabaseAsync, getPostBySlugAsync, getRelatedPostsAsync } from '@/lib/data';

interface PageProps {
  params: {
    slug: string;
  };
}

export const dynamic = 'force-dynamic';

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlugAsync(params.slug);

  if (!post) {
    return {
      title: 'Essay Not Found | Abdur Rakib',
      description: 'The requested essay could not be found.',
    };
  }

  const title = `${post.title} | Abdur Rakib`;
  const description = post.subtitle || post.content.substring(0, 160);
  const url = `https://rakib.xyz/writing/${post.slug}`;
  const ogImage = 'https://rakib.xyz/img/Abdur%20Rakib%20Vaiya%202.JPG';

  return {
    title,
    description,
    authors: [{ name: 'Abdur Rakib' }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      publishedTime: post.isoDate || undefined,
      authors: ['Abdur Rakib'],
      tags: [post.tag],
      images: [
        {
          url: ogImage,
          alt: `${post.title} - Abdur Rakib`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function SingleEssayPage({ params }: PageProps) {
  const post = await getPostBySlugAsync(params.slug);

  if (!post) {
    notFound();
  }

  const db = await getDatabaseAsync();
  const relatedPosts = await getRelatedPostsAsync(post.id, 3);

  // Schema.org BlogPosting JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://rakib.xyz/writing/${post.slug}`,
    },
    headline: post.title,
    description: post.subtitle || post.content.substring(0, 160),
    image: 'https://rakib.xyz/img/Abdur%20Rakib%20Vaiya%202.JPG',
    author: {
      '@type': 'Person',
      name: 'Abdur Rakib',
      url: 'https://rakib.xyz/',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Abdur Rakib',
      logo: {
        '@type': 'ImageObject',
        url: 'https://rakib.xyz/img/Abdur%20Rakib%20Vaiya%202.JPG',
      },
    },
    datePublished: post.isoDate || '2026-01-01',
    dateModified: post.isoDate || '2026-01-01',
    articleSection: post.tag,
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Header />

      <main className="container" style={{ marginTop: '48px', marginBottom: '120px' }}>
        {/* Breadcrumb / Back Link */}
        <div style={{ marginBottom: '32px' }}>
          <Link
            href="/#writing"
            className="btn-playlist-link"
            style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}
          >
            ← Back to all essays
          </Link>
        </div>

        {/* Article Layout Container */}
        <article style={{ maxWidth: '760px', margin: '0 auto' }}>
          {/* Article Header */}
          <header style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="podcast-tag">{post.tag}</span>
              <span style={{ color: 'var(--rule)' }}>·</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                {post.date}
              </span>
              <span style={{ color: 'var(--rule)' }}>·</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                {post.readTime}
              </span>
            </div>

            <h1
              className="hero-h1"
              style={{
                fontSize: '2.5rem',
                lineHeight: '1.2',
                margin: '0',
                letterSpacing: '-0.02em',
              }}
            >
              {post.title}
            </h1>

            {post.subtitle && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.125rem',
                  lineHeight: '1.6',
                  color: 'var(--ink-muted)',
                  margin: '0',
                }}
              >
                {post.subtitle}
              </p>
            )}

            <div style={{ height: '1px', background: 'var(--rule)', marginTop: '16px' }} />
          </header>

          {/* Article Full Body */}
          <div
            className="modal-article-body"
            style={{
              fontSize: '1.0625rem',
              lineHeight: '1.8',
              color: 'var(--ink)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {post.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2
                    key={idx}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.75rem',
                      fontWeight: 400,
                      marginTop: '24px',
                      marginBottom: '8px',
                      color: 'var(--ink)',
                    }}
                  >
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              return (
                <p key={idx} style={{ margin: '0' }}>
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Author Box */}
          <div
            style={{
              marginTop: '64px',
              padding: '32px',
              background: 'var(--surface)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--rule)',
              }}
            >
              <img
                src="/img/Abdur%20Rakib%20Vaiya%202.JPG"
                alt="Abdur Rakib"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  color: 'var(--ink)',
                }}
              >
                Abdur Rakib
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  color: 'var(--ink-muted)',
                  margin: '0',
                }}
              >
                Chief Operating Officer at Programming Hero. Writing practical essays on software engineering systems, hiring discipline, and tech placement scale.
              </p>
            </div>
          </div>
        </article>

        {/* Related Essays Section */}
        {relatedPosts.length > 0 && (
          <section style={{ marginTop: '100px', borderTop: '1px solid var(--rule)', paddingTop: '64px' }}>
            <div className="section-header" style={{ marginBottom: '40px' }}>
              <div className="section-header-title-group">
                <span className="section-label">More Essays</span>
                <h2 className="section-title">Continue reading</h2>
              </div>
            </div>

            <div className="writing-grid">
              {relatedPosts.map((rPost) => (
                <Link
                  key={rPost.id}
                  href={`/writing/${rPost.slug}`}
                  className="writing-card"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="writing-card-body">
                    <span className="writing-card-meta">
                      {rPost.date} · {rPost.readTime}
                    </span>
                    <h3 className="writing-card-title">{rPost.title}</h3>
                    <p className="writing-card-excerpt">{rPost.subtitle}</p>
                  </div>
                  <div className="writing-card-action">
                    <span>Read essay</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="3" y1="8" x2="13" y2="8"></line>
                      <polyline points="9 4 13 8 9 12"></polyline>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer siteInfo={db.siteInfo} />
    </div>
  );
}
