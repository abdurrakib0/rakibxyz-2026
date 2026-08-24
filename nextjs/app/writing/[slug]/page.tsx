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
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// Dynamic SEO Metadata for Google & AI Search Engines
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlugAsync(params.slug);

  if (!post) {
    return {
      title: 'Essay Not Found | Abdur Rakib',
      description: 'The requested essay could not be found.',
    };
  }

  const title = `${post.title} | Abdur Rakib`;
  const description = post.subtitle || post.content.substring(0, 160).replace(/\n/g, ' ');
  const url = `https://rakib.xyz/writing/${post.slug}`;
  const ogImage = post.coverImage || 'https://rakib.xyz/img/Abdur%20Rakib%20Vaiya%202.JPG';

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
      siteName: 'Abdur Rakib',
      publishedTime: post.isoDate || undefined,
      authors: ['Abdur Rakib'],
      tags: [post.tag],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${post.title} - Abdur Rakib`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@abdurrakib0',
      creator: '@abdurrakib0',
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
  const featuredImage = post.coverImage || 'https://rakib.xyz/img/Abdur%20Rakib%20Vaiya%202.JPG';

  // Schema.org BlogPosting & BreadcrumbList JSON-LD
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://rakib.xyz/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Writing',
            item: 'https://rakib.xyz/#writing',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: `https://rakib.xyz/writing/${post.slug}`,
          },
        ],
      },
      {
        '@type': 'BlogPosting',
        '@id': `https://rakib.xyz/writing/${post.slug}#article`,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://rakib.xyz/writing/${post.slug}`,
        },
        headline: post.title,
        description: post.subtitle || post.content.substring(0, 160).replace(/\n/g, ' '),
        image: featuredImage,
        author: {
          '@type': 'Person',
          name: 'Abdur Rakib',
          url: 'https://rakib.xyz/',
          jobTitle: 'Chief Operating Officer',
          worksFor: {
            '@type': 'Organization',
            name: 'Programming Hero',
          },
        },
        publisher: {
          '@type': 'Person',
          name: 'Abdur Rakib',
          url: 'https://rakib.xyz/',
        },
        datePublished: post.isoDate || '2026-01-01',
        dateModified: post.isoDate || '2026-01-01',
        articleSection: post.tag,
        inLanguage: 'en-US',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]" style={{ overflowX: 'hidden', width: '100%' }}>
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Header />

      <main
        className="container"
        style={{
          marginTop: '40px',
          marginBottom: '100px',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        {/* Breadcrumb / Back Link */}
        <div style={{ marginBottom: '28px', maxWidth: '720px', margin: '0 auto 28px' }}>
          <Link
            href="/writing"
            className="btn-playlist-link"
            style={{
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-mono)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>← Back to all essays</span>
          </Link>
        </div>

        {/* Article Layout Container */}
        <article
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          {/* Article Header */}
          <header
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span className="podcast-tag" style={{ fontSize: '0.75rem' }}>
                {post.tag}
              </span>
              <span style={{ color: 'var(--rule)' }}>·</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--ink-muted)',
                }}
              >
                {post.date}
              </span>
              <span style={{ color: 'var(--rule)' }}>·</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--ink-muted)',
                }}
              >
                {post.readTime}
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                lineHeight: 1.18,
                fontWeight: 400,
                color: 'var(--ink)',
                margin: '4px 0 0',
                letterSpacing: '-0.02em',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}
            >
              {post.title}
            </h1>

            {post.subtitle && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(1rem, 2.5vw, 1.1875rem)',
                  lineHeight: 1.6,
                  color: 'var(--ink-muted)',
                  margin: '4px 0 0',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                }}
              >
                {post.subtitle}
              </p>
            )}

            <div
              style={{
                height: '1px',
                background: 'var(--rule)',
                marginTop: '16px',
                width: '100%',
              }}
            />
          </header>

          {/* Featured Thumbnail / Cover Image */}
          {post.coverImage && (
            <div
              style={{
                width: '100%',
                maxHeight: '440px',
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--rule)',
                marginBottom: '36px',
                background: 'var(--surface)',
              }}
            >
              <img
                src={post.coverImage}
                alt={post.title}
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '440px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          )}

          {/* Article Full Body */}
          <div
            className="modal-article-body"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.0625rem)',
              lineHeight: 1.8,
              color: 'var(--ink)',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {post.content.split('\n\n').map((paragraph, idx) => {
              const trimmed = paragraph.trim();

              // Heading 2
              if (trimmed.startsWith('## ')) {
                return (
                  <h2
                    key={idx}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.35rem, 3.5vw, 1.75rem)',
                      fontWeight: 400,
                      marginTop: '24px',
                      marginBottom: '6px',
                      color: 'var(--ink)',
                      lineHeight: 1.25,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {trimmed.replace('## ', '')}
                  </h2>
                );
              }

              // Heading 3
              if (trimmed.startsWith('### ')) {
                return (
                  <h3
                    key={idx}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.2rem, 3vw, 1.45rem)',
                      fontWeight: 500,
                      marginTop: '20px',
                      marginBottom: '4px',
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                    }}
                  >
                    {trimmed.replace('### ', '')}
                  </h3>
                );
              }

              // Blockquote
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote
                    key={idx}
                    style={{
                      borderLeft: '2px solid var(--accent)',
                      paddingLeft: '16px',
                      fontStyle: 'italic',
                      color: 'var(--ink-muted)',
                      margin: '8px 0',
                    }}
                  >
                    {trimmed.replace(/^>\s*/gm, '')}
                  </blockquote>
                );
              }

              // Code block
              if (trimmed.startsWith('```')) {
                const code = trimmed.replace(/```/g, '').trim();
                return (
                  <pre
                    key={idx}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--rule)',
                      borderRadius: 'var(--radius)',
                      padding: '16px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8125rem',
                      overflowX: 'auto',
                      color: 'var(--ink)',
                      margin: '12px 0',
                    }}
                  >
                    <code>{code}</code>
                  </pre>
                );
              }

              // Horizontal rule
              if (trimmed === '---') {
                return <hr key={idx} style={{ border: 0, borderTop: '1px solid var(--rule)', margin: '24px 0' }} />;
              }

              // Inline image markdown ![alt](url)
              const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
              if (imgMatch) {
                return (
                  <div
                    key={idx}
                    style={{
                      margin: '16px 0',
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      border: '1px solid var(--rule)',
                    }}
                  >
                    <img
                      src={imgMatch[2]}
                      alt={imgMatch[1]}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                    {imgMatch[1] && (
                      <span
                        style={{
                          display: 'block',
                          padding: '8px 12px',
                          fontSize: '0.75rem',
                          color: 'var(--ink-muted)',
                          fontFamily: 'var(--font-mono)',
                          background: 'var(--surface)',
                          textAlign: 'center',
                        }}
                      >
                        {imgMatch[1]}
                      </span>
                    )}
                  </div>
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
              marginTop: '56px',
              padding: '24px 20px',
              background: 'var(--surface)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--rule)',
              }}
            >
              <img
                src="/img/Abdur%20Rakib%20Vaiya%202.JPG"
                alt="Abdur Rakib"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                flex: 1,
                minWidth: '200px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1875rem',
                  fontWeight: 500,
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
                Chief Operating Officer at Programming Hero. Writing practical essays on software engineering systems, hiring discipline, and scaling global placement infrastructure.
              </p>
            </div>
          </div>
        </article>

        {/* Related Essays Section */}
        {relatedPosts.length > 0 && (
          <section
            style={{
              marginTop: '80px',
              borderTop: '1px solid var(--rule)',
              paddingTop: '56px',
              maxWidth: '1120px',
              margin: '80px auto 0',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div className="section-header" style={{ marginBottom: '32px' }}>
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
                  aria-label={`Read essay: ${rPost.title}`}
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
