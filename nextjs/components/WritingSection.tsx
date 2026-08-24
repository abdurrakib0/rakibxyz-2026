'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/data';

interface WritingSectionProps {
  posts: Post[];
}

export default function WritingSection({ posts }: WritingSectionProps) {
  const [showAll, setShowAll] = useState(false);

  const publishedPosts = posts.filter((p) => p.published);
  const visiblePosts = showAll ? publishedPosts : publishedPosts.slice(0, 6);

  return (
    <section id="writing" className="container">
      <div className="section-header">
        <div className="section-header-title-group">
          <span className="section-label">Writing</span>
          <h2 className="section-title">Long-form essays on systems, hiring &amp; engineering</h2>
        </div>
        <span className="section-label" id="writingCountLabel">
          Showing {visiblePosts.length} of {publishedPosts.length} essays
        </span>
      </div>

      {/* Writing Grid (SEO-Friendly Link Cards) */}
      <div className="writing-grid" id="writingGrid">
        {visiblePosts.map((post) => (
          <Link
            key={post.id}
            href={`/writing/${post.slug}`}
            className="writing-card"
            style={{ textDecoration: 'none' }}
            aria-label={`Read essay: ${post.title}`}
          >
            <div className="writing-card-body">
              <span className="writing-card-meta">
                {post.date} · {post.readTime}
              </span>
              <h3 className="writing-card-title">{post.title}</h3>
              <p className="writing-card-excerpt">{post.subtitle}</p>
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

      {/* Load More Button */}
      {publishedPosts.length > 6 && (
        <div className="writing-load-more-container">
          <button
            id="btnLoadMoreWriting"
            className="btn-load-more"
            onClick={() => setShowAll(!showAll)}
          >
            <span>{showAll ? 'Show Less' : 'Load More Essays'}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: showAll ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            >
              <polyline points="4 6 8 10 12 6"></polyline>
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
