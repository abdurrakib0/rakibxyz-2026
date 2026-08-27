'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Recommendation } from '@/lib/data';

interface RecommendationsSectionProps {
  recommendations?: Recommendation[];
}

const defaultRecommendations: Recommendation[] = [
  {
    id: 'rec_1',
    name: 'Jhankar Mahbub',
    role: 'Chief Executive Officer @ Programming Hero | Developer | Education Entrepreneur | Workforce Transformation in the AI Era',
    company: 'Programming Hero',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content:
      'Rakib is always pumped to take challenges with minimum or no guidelines. He puts significant effort to understand each and everyone’s personality of his team. I found him strategic and hard-working to dissect technical challenges then match them with each team members’ skills and personality. He has many more secrets (I asked him to teach me all of his secrets. He smiled) to balance the team dynamics and project goals. I wish him success.',
    linkedinUrl: 'https://www.linkedin.com/in/jhankar-mahbub/',
    date: 'October 05, 2021',
  },
  {
    id: 'rec_2',
    name: 'Tanvir Hasan',
    role: 'VP of Engineering @ Tech Innovations | Systems Architect | AI & Distributed Infrastructure',
    company: 'Tech Innovations Ltd',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    content:
      'Working with Rakib on high-throughput talent development opened my eyes to what rigorous engineering training looks like. His focus on feedback loops, deliberate practice, and operational excellence sets him apart as an exceptional tech leader.',
    linkedinUrl: 'https://www.linkedin.com/in/abdurrakib0/',
    date: 'November 18, 2023',
  },
  {
    id: 'rec_3',
    name: 'Farhana Yasmin',
    role: 'Head of People & Culture @ Global Dev Talent | Workforce Strategy & Talent Acquisition',
    company: 'Global Dev Talent',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    content:
      'Rakib has an uncanny ability to identify bottlenecks in complex team operations and solve them with elegance. His mentorship style inspires young engineers to strive for craft, systems thinking, and discipline.',
    linkedinUrl: 'https://www.linkedin.com/in/abdurrakib0/',
    date: 'March 12, 2024',
  },
  {
    id: 'rec_4',
    name: 'Arifur Rahman',
    role: 'Lead Architect @ CloudScale Systems | Cloud Infrastructure, Microservices & Reliability',
    company: 'CloudScale Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    content:
      'Rakib approaches every technical and managerial challenge with incredible clarity. His ability to align distributed teams toward quantifiable milestones made working alongside him a privilege.',
    linkedinUrl: 'https://www.linkedin.com/in/abdurrakib0/',
    date: 'August 24, 2023',
  },
  {
    id: 'rec_5',
    name: 'Mahmudul Karim',
    role: 'Chief Technology Officer @ NextGen Ventures | Scaling Tech Teams & Product Innovation',
    company: 'NextGen Ventures',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    content:
      'A leader who leads by example. Abdur Rakib has built an unparalleled operational model for tech workforce development. His dedication to craft, systems thinking, and execution speed is truly world-class.',
    linkedinUrl: 'https://www.linkedin.com/in/abdurrakib0/',
    date: 'January 15, 2024',
  },
];

export default function RecommendationsSection({
  recommendations = defaultRecommendations,
}: RecommendationsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Drag to scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const items = recommendations && recommendations.length > 0 ? recommendations : defaultRecommendations;

  const checkScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, items]);

  // Horizontal mouse-wheel scroll support
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // If vertical delta dominates and can scroll horizontally, redirect to horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        if (
          (e.deltaY > 0 && el.scrollLeft < el.scrollHeight) ||
          (e.deltaY < 0 && el.scrollLeft > 0)
        ) {
          el.scrollBy({ left: e.deltaY * 1.2, behavior: 'auto' });
          e.preventDefault();
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Mouse Drag-to-Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftStart.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 420;
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
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className="w-9 h-9 rounded-full border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--bg)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
              className="w-9 h-9 rounded-full border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink)] hover:bg-[var(--bg)] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
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

      {/* Horizontal Scroll Track */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 cursor-grab active:cursor-grabbing select-none"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((rec) => (
            <article
              key={rec.id}
              className="snap-start shrink-0 w-[310px] sm:w-[380px] md:w-[420px] bg-[var(--surface)] border border-[var(--rule)] rounded-[16px] p-6 sm:p-7 flex flex-col gap-4 justify-between transition-all hover:border-[var(--ink)]/40 shadow-2xs select-text"
            >
              <div className="flex flex-col gap-4">
                {/* Top Profile Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar with purple gradient accent ring */}
                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-purple-600 to-indigo-500 shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-[var(--surface)] relative">
                        {rec.avatarUrl ? (
                          <img
                            src={rec.avatarUrl}
                            alt={rec.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono text-[0.875rem] font-bold text-[var(--accent)]">
                            {rec.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="font-bold text-[1.0625rem] text-[var(--ink)] leading-tight tracking-tight">
                        {rec.name}
                      </span>
                      {rec.date && (
                        <span className="text-[0.8125rem] text-[var(--ink-muted)] mt-0.5 font-normal">
                          {rec.date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* LinkedIn Official Logo */}
                  <a
                    href={rec.linkedinUrl || 'https://www.linkedin.com/in/abdurrakib0'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A66C2] hover:opacity-80 transition-opacity p-1"
                    aria-label={`${rec.name} LinkedIn`}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </a>
                </div>

                {/* Role / Headline in Bold */}
                <h3 className="font-bold text-[0.875rem] text-[var(--ink)] leading-snug">
                  {rec.role}
                </h3>

                {/* Endorsement Content */}
                <p className="text-[0.9375rem] text-[var(--ink)]/90 leading-relaxed font-normal m-0 whitespace-pre-line">
                  {rec.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
