import React from 'react';
import Link from 'next/link';
import { getDatabaseAsync, getSubscribersAsync } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [db, subscribers] = await Promise.all([
    getDatabaseAsync(),
    getSubscribersAsync(),
  ]);
  const { posts, podcasts, siteInfo, recommendations } = db;

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.length - publishedCount;

  return (
    <div className="flex flex-col gap-10">
      {/* Top Welcome Header with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--rule)]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[0.6875rem] uppercase tracking-widest text-[var(--accent)] font-semibold">
              Live Production Console
            </span>
          </div>
          <h1 className="font-serif text-[2.25rem] md:text-[2.5rem] text-[var(--ink)] font-normal tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-[0.9375rem] text-[var(--ink-muted)] max-w-2xl">
            Welcome back, Abdur Rakib. Monitor placements, publish long-form essays, curate endorsements, and manage monthly newsletter subscribers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/writings"
            className="flex items-center gap-2 bg-[var(--ink)] text-[var(--bg)] px-4 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] font-medium no-underline hover:bg-[var(--accent)] transition-colors shadow-sm"
          >
            <span>+ Write New Essay</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Writings */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all hover:border-[var(--ink)]/40 hover:shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] font-medium">
              Essays &amp; Articles
            </span>
            <span className="w-8 h-8 rounded-full bg-[var(--bg)] border border-[var(--rule)] flex items-center justify-center text-[var(--accent)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              </svg>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-serif text-[2.75rem] text-[var(--ink)] leading-none font-normal">
              {posts.length}
            </span>
            <div className="flex items-center gap-2 font-mono text-[0.75rem] text-[var(--ink-muted)]">
              <span className="text-emerald-700 font-semibold">{publishedCount} live</span>
              <span>·</span>
              <span>{draftCount} drafts</span>
            </div>
          </div>
          <Link
            href="/admin/writings"
            className="font-mono text-[0.75rem] text-[var(--accent)] no-underline hover:underline flex items-center gap-1 font-medium pt-2 border-t border-[var(--rule)]"
          >
            <span>Manage Writings</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 2: Endorsements */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all hover:border-[var(--ink)]/40 hover:shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] font-medium">
              LinkedIn Endorsements
            </span>
            <span className="w-8 h-8 rounded-full bg-[var(--bg)] border border-[var(--rule)] flex items-center justify-center text-[var(--accent)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-serif text-[2.75rem] text-[var(--ink)] leading-none font-normal">
              {(recommendations || []).length}
            </span>
            <span className="font-mono text-[0.75rem] text-[var(--ink-muted)]">
              Curated testimonials
            </span>
          </div>
          <Link
            href="/admin/recommendations"
            className="font-mono text-[0.75rem] text-[var(--accent)] no-underline hover:underline flex items-center gap-1 font-medium pt-2 border-t border-[var(--rule)]"
          >
            <span>Manage Testimonials</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 3: Subscribers */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all hover:border-[var(--ink)]/40 hover:shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] font-medium">
              Newsletter Audience
            </span>
            <span className="w-8 h-8 rounded-full bg-[var(--bg)] border border-[var(--rule)] flex items-center justify-center text-[var(--accent)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-serif text-[2.75rem] text-[var(--ink)] leading-none font-normal">
              {subscribers.length}
            </span>
            <span className="font-mono text-[0.75rem] text-emerald-700 font-semibold">
              Verified active subscribers
            </span>
          </div>
          <Link
            href="/admin/subscribers"
            className="font-mono text-[0.75rem] text-[var(--accent)] no-underline hover:underline flex items-center gap-1 font-medium pt-2 border-t border-[var(--rule)]"
          >
            <span>Export &amp; Manage</span>
            <span>→</span>
          </Link>
        </div>

        {/* Card 4: Career Placements */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all hover:border-[var(--ink)]/40 hover:shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] font-medium">
              Total Placements
            </span>
            <span className="w-8 h-8 rounded-full bg-[var(--bg)] border border-[var(--rule)] flex items-center justify-center text-[var(--accent)]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-serif text-[2.75rem] text-[var(--ink)] leading-none font-normal">
              {siteInfo.stats[0]?.number || '6,300+'}
            </span>
            <span className="font-mono text-[0.75rem] text-[var(--ink-muted)]">
              Across {siteInfo.stats[1]?.number || '57'} countries
            </span>
          </div>
          <Link
            href="/admin/site-info"
            className="font-mono text-[0.75rem] text-[var(--accent)] no-underline hover:underline flex items-center gap-1 font-medium pt-2 border-t border-[var(--rule)]"
          >
            <span>Update Metrics</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/admin/writings"
          className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-3 no-underline hover:border-[var(--ink)] hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="font-serif text-[1.25rem] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
              Markdown Editor
            </span>
            <span className="text-[var(--accent)] font-mono text-[1.125rem] group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <p className="text-[0.875rem] text-[var(--ink-muted)] leading-relaxed">
            Publish long-form thoughts on engineering systems, AI-era hiring filters, and developer roadmaps.
          </p>
        </Link>

        <Link
          href="/admin/podcasts"
          className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-3 no-underline hover:border-[var(--ink)] hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="font-serif text-[1.25rem] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
              Podcasts &amp; Keynotes
            </span>
            <span className="text-[var(--accent)] font-mono text-[1.125rem] group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <p className="text-[0.875rem] text-[var(--ink-muted)] leading-relaxed">
            Add or reorder YouTube video conversations, guest names, tags, and clickable keynote links.
          </p>
        </Link>

        <Link
          href="/admin/site-info"
          className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-3 no-underline hover:border-[var(--ink)] hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="font-serif text-[1.25rem] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
              Philosophy &amp; Socials
            </span>
            <span className="text-[var(--accent)] font-mono text-[1.125rem] group-hover:translate-x-1 transition-transform">→</span>
          </div>
          <p className="text-[0.875rem] text-[var(--ink-muted)] leading-relaxed">
            Update your Hero statement, 2030 placement targets, ecosystem initiatives, and official social channels.
          </p>
        </Link>
      </div>

      {/* Recent Essays Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)] font-medium">
              Latest Published Essays
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--rule)] font-mono text-[0.6875rem] text-[var(--ink-muted)]">
              {posts.length} Total
            </span>
          </div>
          <Link href="/admin/writings" className="font-mono text-[0.75rem] text-[var(--accent)] no-underline hover:underline font-medium">
            View full archive →
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-[var(--rule)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--surface)] shadow-2xs">
          {posts.slice(0, 5).map((post) => (
            <div key={post.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 hover:bg-[var(--bg)]/50 transition-colors">
              <div className="flex flex-col gap-1 min-w-0">
                <Link
                  href={`/writing/${post.slug}`}
                  target="_blank"
                  className="font-serif text-[1.0625rem] text-[var(--ink)] hover:text-[var(--accent)] no-underline truncate"
                >
                  {post.title}
                </Link>
                <div className="flex items-center gap-2 font-mono text-[0.6875rem] text-[var(--ink-muted)]">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                  <span>·</span>
                  <span className="px-2 py-0.5 bg-[var(--bg)] border border-[var(--rule)] rounded">
                    {post.tag}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`font-mono text-[0.6875rem] font-medium px-2.5 py-1 rounded-[var(--radius)] ${
                    post.published
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {post.published ? 'Published' : 'Draft'}
                </span>
                <Link
                  href="/admin/writings"
                  className="font-mono text-[0.75rem] text-[var(--ink)] hover:text-[var(--accent)] no-underline px-3 py-1 border border-[var(--rule)] rounded-[var(--radius)] bg-[var(--bg)] hover:border-[var(--ink)] transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
