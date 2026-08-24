'use client';

import React from 'react';
import { Recommendation } from '@/lib/data';

interface RecommendationsSectionProps {
  recommendations?: Recommendation[];
}

export default function RecommendationsSection({ recommendations = [] }: RecommendationsSectionProps) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section id="recommendations" className="container">
      {/* Section Header matching site design system */}
      <div className="section-header">
        <div className="section-header-title-group">
          <span className="section-label">04 / Endorsements</span>
          <h2 className="section-title">What Industry Leaders Say</h2>
        </div>
        <a
          href="https://www.linkedin.com/in/abdurrakib0"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-playlist-link"
        >
          <span>View on LinkedIn</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.5 11.5L11.5 4.5" />
            <path d="M5.5 4.5H11.5V10.5" />
          </svg>
        </a>
      </div>

      {/* Instant Native Recommendations Grid (0ms Load Time) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item) => (
          <div
            key={item.id}
            className="bg-[var(--surface)] border border-[var(--rule)] p-6 sm:p-7 rounded-[var(--radius-lg)] flex flex-col justify-between transition-all hover:border-[var(--ink-muted)]"
          >
            {/* Header: Avatar, Name, Role & LinkedIn */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="flex items-center gap-3.5">
                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border border-[var(--rule)] bg-[var(--bg)]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--ink)] text-[var(--bg)] font-mono text-[0.875rem] font-bold flex items-center justify-center">
                      {item.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif text-[1.125rem] text-[var(--ink)] font-medium leading-snug">
                      {item.name}
                    </h3>
                    <p className="font-mono text-[0.75rem] text-[var(--ink-muted)] mt-0.5">
                      {item.role} {item.company ? `• ${item.company}` : ''}
                    </p>
                  </div>
                </div>

                {item.linkedinUrl && (
                  <a
                    href={item.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A66C2] hover:text-[var(--ink)] transition-colors p-1"
                    title={`View ${item.name} on LinkedIn`}
                    aria-label={`View ${item.name} on LinkedIn`}
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </a>
                )}
              </div>

              {/* Quote Content in Newsreader Serif Italic */}
              <div className="relative">
                <span className="font-serif text-[2.5rem] leading-none text-[var(--ink-muted)] opacity-30 select-none block -mb-4">
                  “
                </span>
                <p className="font-serif text-[0.9375rem] sm:text-[1rem] leading-relaxed text-[var(--ink)] italic whitespace-pre-line">
                  {item.content}
                </p>
              </div>
            </div>

            {/* Footer / Context Relation & Date */}
            <div className="mt-6 pt-4 border-t border-[var(--rule)] flex items-center justify-between gap-2 flex-wrap">
              {item.relation ? (
                <span className="font-mono text-[0.6875rem] text-[var(--ink-muted)] bg-[var(--bg)] px-2.5 py-1 rounded border border-[var(--rule)]">
                  {item.relation}
                </span>
              ) : (
                <span />
              )}
              {item.date && (
                <span className="font-mono text-[0.6875rem] text-[var(--ink-muted)]">
                  {item.date}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
