'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/data';

interface WritingArchiveProps {
  posts: Post[];
}

export default function WritingArchive({ posts }: WritingArchiveProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const publishedPosts = useMemo(() => posts.filter((p) => p.published), [posts]);

  // Extract all unique categories and count
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    publishedPosts.forEach((post) => {
      const tag = post.tag || 'General';
      counts[tag] = (counts[tag] || 0) + 1;
    });

    const list = Object.keys(counts).map((tag) => ({
      name: tag,
      count: counts[tag],
    }));

    return [{ name: 'All', count: publishedPosts.length }, ...list];
  }, [publishedPosts]);

  // Filter posts by search query and category
  const filteredPosts = useMemo(() => {
    return publishedPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' || post.tag === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) ||
        (post.subtitle && post.subtitle.toLowerCase().includes(q)) ||
        post.tag.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q)
      );
    });
  }, [publishedPosts, selectedCategory, searchQuery]);

  // Group filtered posts by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Post[]> = {};
    filteredPosts.forEach((post) => {
      const cat = post.tag || 'General';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(post);
    });
    return groups;
  }, [filteredPosts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', width: '100%', boxSizing: 'border-box' }}>
      {/* Search & Filter Toolbar */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Search Input Box */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--ink-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search essays by title, topic, systems, or keywords..."
            style={{
              width: '100%',
              padding: '14px 44px 14px 44px',
              background: 'var(--bg)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              color: 'var(--ink)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--ink)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--rule)')}
            aria-label="Search essays"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--ink-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                padding: '4px',
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ink-muted)',
              marginRight: '6px',
            }}
          >
            Categories:
          </span>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: isActive
                    ? '1px solid var(--ink)'
                    : '1px solid var(--rule)',
                  background: isActive ? 'var(--ink)' : 'var(--bg)',
                  color: isActive ? 'var(--bg)' : 'var(--ink)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{cat.name}</span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    opacity: isActive ? 0.9 : 0.6,
                  }}
                >
                  ({cat.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--rule)',
          paddingBottom: '14px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ink-muted)',
          }}
        >
          Showing {filteredPosts.length} of {publishedPosts.length} essays
          {searchQuery && ` for "${searchQuery}"`}
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        </span>

        {(searchQuery || selectedCategory !== 'All') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--accent)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            background: 'var(--surface)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--ink)' }}>
            No essays found
          </span>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--ink-muted)', margin: 0, maxWidth: '420px' }}>
            We couldn't find any essays matching your search terms. Try searching with different keywords or clear your category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="btn-hero-primary"
            style={{ marginTop: '8px' }}
          >
            <span>View All Essays</span>
          </button>
        </div>
      )}

      {/* HORIZONTAL EDITORIAL LIST OF ESSAYS */}
      {selectedCategory === 'All' && !searchQuery ? (
        // When viewing all: Group into categorized horizontal sections
        <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
          {Object.entries(groupedByCategory).map(([categoryName, categoryPosts]) => (
            <section key={categoryName} style={{ margin: 0 }}>
              {/* Category Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  borderBottom: '2px solid var(--ink)',
                  paddingBottom: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'inline-block',
                    }}
                  />
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.375rem',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      margin: 0,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {categoryName}
                  </h3>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--ink-muted)',
                  }}
                >
                  {categoryPosts.length} {categoryPosts.length === 1 ? 'piece' : 'pieces'}
                </span>
              </div>

              {/* Horizontal List Items */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {categoryPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/writing/${post.slug}`}
                    className="horizontal-essay-row"
                    aria-label={`Read essay: ${post.title}`}
                  >
                    {/* Left Meta: Date & Read Time */}
                    <div className="essay-row-meta">
                      <span className="essay-row-date">{post.date}</span>
                      <span className="essay-row-readtime">{post.readTime}</span>
                    </div>

                    {/* Middle: Title & Subtitle + Thumbnail */}
                    <div className="essay-row-content" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      {post.coverImage && (
                        <div
                          style={{
                            width: '72px',
                            height: '48px',
                            borderRadius: 'var(--radius)',
                            overflow: 'hidden',
                            border: '1px solid var(--rule)',
                            flexShrink: 0,
                            marginTop: '4px',
                            background: 'var(--surface)',
                          }}
                          className="hidden sm:block"
                        >
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <h4 className="essay-row-title">{post.title}</h4>
                        <p className="essay-row-excerpt">{post.subtitle}</p>
                      </div>
                    </div>

                    {/* Right: Read Action Arrow */}
                    <div className="essay-row-action">
                      <span className="essay-row-link-text">Read</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="essay-row-arrow"
                      >
                        <line x1="3" y1="8" x2="13" y2="8"></line>
                        <polyline points="9 4 13 8 9 12"></polyline>
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        // When filtered by Category or Search: Single Flat Horizontal List
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/writing/${post.slug}`}
              className="horizontal-essay-row"
              aria-label={`Read essay: ${post.title}`}
            >
              {/* Left Meta: Date & Tag */}
              <div className="essay-row-meta">
                <span className="podcast-tag" style={{ fontSize: '0.6875rem' }}>
                  {post.tag}
                </span>
                <span className="essay-row-date">{post.date}</span>
                <span className="essay-row-readtime">{post.readTime}</span>
              </div>

              {/* Middle: Title & Subtitle + Thumbnail */}
              <div className="essay-row-content" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                {post.coverImage && (
                  <div
                    style={{
                      width: '72px',
                      height: '48px',
                      borderRadius: 'var(--radius)',
                      overflow: 'hidden',
                      border: '1px solid var(--rule)',
                      flexShrink: 0,
                      marginTop: '4px',
                      background: 'var(--surface)',
                    }}
                    className="hidden sm:block"
                  >
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h4 className="essay-row-title">{post.title}</h4>
                  <p className="essay-row-excerpt">{post.subtitle}</p>
                </div>
              </div>

              {/* Right: Read Action Arrow */}
              <div className="essay-row-action">
                <span className="essay-row-link-text">Read</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="essay-row-arrow"
                >
                  <line x1="3" y1="8" x2="13" y2="8"></line>
                  <polyline points="9 4 13 8 9 12"></polyline>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
