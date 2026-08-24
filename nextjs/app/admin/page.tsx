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

  return (
    <div className="flex flex-col gap-10">
      {/* Top Welcome Header */}
      <div className="flex flex-col gap-2 border-b border-[var(--rule)] pb-6">
        <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal">
          Dashboard Overview
        </h1>
        <p className="text-[0.9375rem] text-[var(--ink-muted)]">
          Manage writings, LinkedIn endorsements, newsletter subscribers, site statistics, and YouTube podcast cards.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-2">
          <span className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)]">
            Total Writings
          </span>
          <span className="font-serif text-[2.5rem] text-[var(--ink)] leading-none">
            {posts.length}
          </span>
          <span className="font-mono text-[0.75rem] text-[var(--accent)] mt-1">
            {posts.filter((p) => p.published).length} Published Essays
          </span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-2">
          <span className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)]">
            LinkedIn Endorsements
          </span>
          <span className="font-serif text-[2.5rem] text-[var(--ink)] leading-none">
            {(recommendations || []).length}
          </span>
          <Link
            href="/admin/recommendations"
            className="font-mono text-[0.75rem] text-[var(--accent)] mt-1 no-underline hover:underline"
          >
            Manage Testimonials →
          </Link>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-2">
          <span className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)]">
            Subscribers
          </span>
          <span className="font-serif text-[2.5rem] text-[var(--ink)] leading-none">
            {subscribers.length}
          </span>
          <Link
            href="/admin/subscribers"
            className="font-mono text-[0.75rem] text-[var(--accent)] mt-1 no-underline hover:underline"
          >
            Manage &amp; Export →
          </Link>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-2">
          <span className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)]">
            Placements Tracked
          </span>
          <span className="font-serif text-[2.5rem] text-[var(--ink)] leading-none">
            {siteInfo.stats[0]?.number || '6,300+'}
          </span>
          <span className="font-mono text-[0.75rem] text-[var(--ink-muted)] mt-1">
            Across {siteInfo.stats[1]?.number || '57'} countries
          </span>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/writings"
          className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-3 no-underline hover:border-[var(--ink)] hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="font-serif text-[1.25rem] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
              Manage Writings
            </span>
            <span className="text-[var(--accent)] font-mono text-[1.125rem]">→</span>
          </div>
          <p className="text-[0.875rem] text-[var(--ink-muted)] leading-[1.5]">
            Create, edit, or publish blog articles and essays with Markdown format.
          </p>
        </Link>

        <Link
          href="/admin/recommendations"
          className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-3 no-underline hover:border-[var(--ink)] hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="font-serif text-[1.25rem] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
              LinkedIn Endorsements
            </span>
            <span className="text-[var(--accent)] font-mono text-[1.125rem]">→</span>
          </div>
          <p className="text-[0.875rem] text-[var(--ink-muted)] leading-[1.5]">
            Add and manage testimonials and quotes from industry leaders on LinkedIn.
          </p>
        </Link>

        <Link
          href="/admin/subscribers"
          className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-3 no-underline hover:border-[var(--ink)] hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="font-serif text-[1.25rem] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
              Subscribers
            </span>
            <span className="text-[var(--accent)] font-mono text-[1.125rem]">→</span>
          </div>
          <p className="text-[0.875rem] text-[var(--ink-muted)] leading-[1.5]">
            View real-time email subscribers, edit emails, and export to CSV or Excel (.xls).
          </p>
        </Link>
      </div>

      {/* Recent Writings List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
          <span className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)]">
            Recent Essays
          </span>
          <Link href="/admin/writings" className="font-mono text-[0.75rem] text-[var(--accent)] no-underline hover:underline">
            View all →
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-[var(--rule)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--surface)]">
          {posts.slice(0, 4).map((post) => (
            <div key={post.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-serif text-[1rem] text-[var(--ink)] line-clamp-1">
                  {post.title}
                </span>
                <span className="font-mono text-[0.6875rem] text-[var(--ink-muted)]">
                  {post.date} · {post.readTime}
                </span>
              </div>
              <span
                className={`font-mono text-[0.6875rem] px-2 py-0.5 rounded ${
                  post.published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {post.published ? 'Published' : 'Draft'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
