'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/lib/data';

const DRAFT_STORAGE_KEY = 'abdur_rakib_post_draft_v1';
const ITEMS_PER_PAGE = 10;

interface WritingsClientProps {
  initialPosts: Post[];
}

export default function WritingsClient({ initialPosts }: WritingsClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // Sync with initialPosts from server
  useEffect(() => {
    if (initialPosts) {
      setPosts(initialPosts);
    }
  }, [initialPosts]);

  // Check saved draft on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title) {
          setHasSavedDraft(true);
        }
      }
    } catch (_) {}
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    // Optimistic delete
    setPosts((prev) => prev.filter((p) => p.id !== id && p.slug !== id));
    setStatusMessage(`Deleted "${title}"`);
    setTimeout(() => setStatusMessage(''), 3500);

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        console.warn('Delete warning:', data.message);
      }
      router.refresh();
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // Filter & Pagination Calculations
  const filteredPosts = posts.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
      (p.tag && p.tag.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredPosts.length);
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal tracking-tight">
            Writings &amp; Essays Manager
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-muted)] mt-1">
            Dedicated Full-Page Editor · Auto-save Drafts · Smart WebP Image Compression.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {hasSavedDraft && (
            <Link
              href="/admin/writings/new"
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-4 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] transition-colors no-underline flex items-center gap-1.5"
            >
              <span>📋 Resume Auto-Saved Draft</span>
            </Link>
          )}

          <Link
            href="/admin/writings/new"
            className="bg-[var(--accent)] text-white px-5 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] hover:bg-[var(--ink)] transition-colors no-underline self-start sm:self-auto shadow-sm font-medium"
          >
            + Write New Essay
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-[var(--radius)] font-mono text-[0.8125rem] flex items-center gap-2">
          <span>✓</span>
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search essays by title, tag, or subtitle..."
            className="w-full bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-4 py-2.5 text-[0.875rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
          />
        </div>

        <div className="font-mono text-[0.75rem] text-[var(--ink-muted)] shrink-0">
          Showing <span className="font-semibold text-[var(--ink)]">{filteredPosts.length === 0 ? 0 : startIndex + 1}–{endIndex}</span> of <span className="font-semibold text-[var(--ink)]">{filteredPosts.length}</span> essays (10 per page)
        </div>
      </div>

      {/* Writings Table List */}
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden shadow-2xs">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center font-mono text-[0.875rem] text-[var(--ink-muted)] flex flex-col items-center gap-3">
            <span>{search ? 'No essays match your search filter.' : 'No essays published yet.'}</span>
            {!search && (
              <Link
                href="/admin/writings/new"
                className="bg-[var(--accent)] text-white px-4 py-2 rounded text-xs font-mono no-underline"
              >
                + Write First Essay
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--rule)] font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)] bg-[var(--bg)]">
                <th className="p-4 w-12">#</th>
                <th className="p-4">Cover &amp; Title</th>
                <th className="p-4 hidden sm:table-cell">Category</th>
                <th className="p-4 hidden md:table-cell">Date &amp; Read Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)] text-[0.875rem]">
              {currentPosts.map((post, idx) => {
                const globalIdx = startIndex + idx + 1;
                return (
                  <tr key={post.id} className="hover:bg-[var(--bg)]/70 transition-colors">
                    <td className="p-4 font-mono text-[0.75rem] text-[var(--ink-muted)]">
                      #{globalIdx}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {post.coverImage ? (
                          <div className="w-12 h-12 rounded overflow-hidden border border-[var(--rule)] bg-black shrink-0">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded border border-dashed border-[var(--rule)] bg-[var(--bg)] shrink-0 flex items-center justify-center font-mono text-[0.625rem] text-[var(--ink-muted)]">
                            No img
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/admin/writings/${post.id}`}
                            className="font-serif text-[1rem] text-[var(--ink)] font-medium hover:text-[var(--accent)] no-underline"
                          >
                            {post.title}
                          </Link>
                          <div className="text-[0.75rem] text-[var(--ink-muted)] line-clamp-1 mt-0.5">
                            {post.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell font-mono text-[0.75rem] text-[var(--ink-muted)]">
                      {post.tag}
                    </td>
                    <td className="p-4 hidden md:table-cell font-mono text-[0.75rem] text-[var(--ink-muted)]">
                      {post.date} · {post.readTime}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-mono text-[0.6875rem] px-2.5 py-1 rounded-[var(--radius)] font-medium ${
                          post.published
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/writings/${post.id}`}
                          className="font-mono text-[0.75rem] text-[var(--accent)] hover:underline no-underline font-medium"
                        >
                          Edit
                        </Link>
                        <span className="text-[var(--rule)]">·</span>
                        <a
                          href={`/writing/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[0.75rem] text-[var(--ink)] hover:underline no-underline"
                        >
                          View ↗
                        </a>
                        <span className="text-[var(--rule)]">·</span>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="font-mono text-[0.75rem] text-red-600 hover:underline cursor-pointer border-0 bg-transparent p-0"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* 10-Item Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--rule)] bg-[var(--bg)] font-mono text-[0.75rem]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3.5 py-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer transition-colors ${
                    safePage === pageNum
                      ? 'bg-[var(--ink)] text-[var(--bg)] font-bold'
                      : 'border border-[var(--rule)] bg-[var(--surface)] hover:border-[var(--ink)] text-[var(--ink)]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3.5 py-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
