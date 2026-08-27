'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Recommendation } from '@/lib/data';

interface RecommendationsSectionProps {
  recommendations?: Recommendation[];
}

const defaultRecommendations: Recommendation[] = [
  {
    id: 'rec_1',
    name: 'Jhankar Mahbub',
    role: 'Founder & CEO',
    company: 'Programming Hero',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content:
      'Abdur Rakib is a rare blend of deep technical architecture and disciplined operational execution. Under his operational leadership, our placement corridor grew into a global engine helping thousands of developers enter the industry. He builds systems that scale predictably.',
    linkedinUrl: 'https://www.linkedin.com/in/abdurrakib0/',
    relation: 'Managed Abdur directly at Programming Hero',
    date: '2024',
  },
  {
    id: 'rec_2',
    name: 'Tanvir Hasan',
    role: 'VP of Engineering',
    company: 'Tech Innovations Ltd',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    content:
      'Working with Rakib on high-throughput talent development opened my eyes to what rigorous engineering training looks like. His focus on feedback loops, deliberate practice, and operational excellence sets him apart as an exceptional tech leader.',
    linkedinUrl: 'https://www.linkedin.com/in/abdurrakib0/',
    relation: 'Collaborated on workforce initiatives',
    date: '2023',
  },
  {
    id: 'rec_3',
    name: 'Farhana Yasmin',
    role: 'Head of People & Culture',
    company: 'Global Dev Talent',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    content:
      'Rakib has an uncanny ability to identify bottlenecks in complex team operations and solve them with elegance. His mentorship style inspires young engineers to strive for craft, systems thinking, and discipline.',
    linkedinUrl: 'https://www.linkedin.com/in/abdurrakib0/',
    relation: 'Collaborated on tech hiring corridors',
    date: '2024',
  },
  {
    id: 'rec_4',
    name: 'Arifur Rahman',
    role: 'Lead Architect',
    company: 'CloudScale Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    content:
      'Rakib approaches every technical and managerial challenge with incredible clarity. His ability to align distributed teams toward quantifiable milestones made working alongside him a privilege.',
    linkedinUrl: 'https://www.linkedin.com/in/abdurrakib0/',
    relation: 'Engineering system architecture review',
    date: '2023',
  },
  {
    id: 'rec_5',
    name: 'Mahmudul Karim',
    role: 'Chief Technology Officer',
    company: 'NextGen Ventures',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    content:
      'A leader who leads by example. Abdur Rakib has built an unparalleled operational model for tech workforce development. His dedication to craft, systems thinking, and execution speed is truly world-class.',
    linkedinUrl: 'https://www.linkedin.com/in/abdurrakib0/',
    relation: 'Advised on tech operations & scaling',
    date: '2024',
  },
];

export default function RecommendationsSection({
  recommendations = defaultRecommendations,
}: RecommendationsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const items = recommendations && recommendations.length > 0 ? recommendations : defaultRecommendations;

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section id="recommendations" className="container space-y-8">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-header-title-group">
          <span className="section-label">04 / Endorsements</span>
          <h2 className="section-title">What Industry Leaders Say</h2>
        </div>

        {/* Header Controls: Arrow buttons + LinkedIn link */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className="w-9 h-9 rounded-full border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Previous endorsements"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className="w-9 h-9 rounded-full border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Next endorsements"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
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
      </div>

      {/* Native Horizontal Scroll Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 -mx-2 px-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((rec) => (
            <article
              key={rec.id}
              className="snap-start shrink-0 w-[300px] sm:w-[380px] md:w-[420px] bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all hover:border-[var(--ink)]/40 hover:shadow-2xs"
            >
              {/* Top Quote Icon & Relation */}
              <div className="flex items-start justify-between gap-3">
                <span className="font-serif text-[2.5rem] leading-none text-[var(--accent)] select-none">
                  &ldquo;
                </span>
                {rec.relation && (
                  <span className="font-mono text-[0.6875rem] text-[var(--ink-muted)] bg-[var(--bg)] border border-[var(--rule)] px-2.5 py-1 rounded-[var(--radius)] text-right line-clamp-1">
                    {rec.relation}
                  </span>
                )}
              </div>

              {/* Quote Content */}
              <p className="font-serif text-[1rem] sm:text-[1.0625rem] text-[var(--ink)] leading-relaxed italic m-0 flex-1">
                {rec.content}
              </p>

              {/* Author Metadata Footer */}
              <div className="flex items-center justify-between border-t border-[var(--rule)] pt-4 mt-2">
                <div className="flex items-center gap-3">
                  {rec.avatarUrl ? (
                    <img
                      src={rec.avatarUrl}
                      alt={rec.name}
                      className="w-10 h-10 rounded-full object-cover border border-[var(--rule)] shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--rule)] flex items-center justify-center font-mono text-[0.875rem] font-bold text-[var(--accent)] shrink-0">
                      {rec.name.charAt(0)}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-[0.9375rem] text-[var(--ink)] leading-tight truncate">
                      {rec.name}
                    </span>
                    <span className="text-[0.75rem] text-[var(--ink-muted)] truncate mt-0.5">
                      {rec.role} · {rec.company}
                    </span>
                  </div>
                </div>

                <a
                  href={rec.linkedinUrl || 'https://www.linkedin.com/in/abdurrakib0'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[var(--bg)] border border-[var(--rule)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--ink-muted)] flex items-center justify-center transition-colors shrink-0"
                  aria-label={`${rec.name} LinkedIn Profile`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
