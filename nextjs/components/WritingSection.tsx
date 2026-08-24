'use client';

import React, { useState } from 'react';
import { Post } from '@/lib/data';

interface WritingSectionProps {
  posts: Post[];
}

export default function WritingSection({ posts }: WritingSectionProps) {
  const [activeArticle, setActiveArticle] = useState<Post | null>(null);
  const [showAll, setShowAll] = useState(false);

  const publishedPosts = posts.filter((p) => p.published);
  const visiblePosts = showAll ? publishedPosts : publishedPosts.slice(0, 6);

  const openArticle = (post: Post) => {
    setActiveArticle(post);
    document.body.style.overflow = 'hidden';
  };

  const closeArticle = () => {
    setActiveArticle(null);
    document.body.style.overflow = '';
  };

  return (
    <>
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

        {/* Writing Grid (Cards) */}
        <div className="writing-grid" id="writingGrid">
          {visiblePosts.map((post) => (
            <div
              key={post.id}
              className="writing-card"
              onClick={() => openArticle(post)}
              tabIndex={0}
              role="button"
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
            </div>
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
                style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
              >
                <polyline points="4 6 8 10 12 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </section>

      {/* Full Blog Reading Modal */}
      {activeArticle && (
        <div
          id="readingModalBackdrop"
          className="reading-modal-backdrop active"
          onClick={closeArticle}
        >
          <div
            className="reading-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn-close-modal"
              onClick={closeArticle}
              aria-label="Close reading view"
            >
              ×
            </button>
            <div className="modal-article-header">
              <span id="modalArticleMeta" className="modal-article-meta">
                {activeArticle.tag} · {activeArticle.date} · {activeArticle.readTime}
              </span>
              <h1 id="modalArticleTitle" className="modal-article-h1">
                {activeArticle.title}
              </h1>
            </div>
            <div
              id="modalArticleBody"
              className="modal-article-body"
            >
              {activeArticle.content.split('\n\n').map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
