'use client';

import React, { useRef, useState, useEffect } from 'react';
import { SiteInfo } from '@/lib/data';

interface WhereIShareSectionProps {
  siteInfo: SiteInfo;
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

function useCountUp(target: string, inView: boolean) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;

    // Parse numeric part (e.g. "35,000+" → 35000, "25,000+" → 25000)
    const numericStr = target.replace(/[^0-9]/g, '');
    const suffix = target.replace(/[0-9,]/g, ''); // "+", "K", etc.
    const end = parseInt(numericStr, 10);

    if (isNaN(end)) {
      setDisplay(target);
      return;
    }

    const duration = 1400;
    const steps = 50;
    const stepTime = duration / steps;
    let current = 0;
    const increment = end / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        clearInterval(timer);
        setDisplay(end.toLocaleString() + suffix);
      } else {
        setDisplay(Math.floor(current).toLocaleString() + suffix);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, target]);

  return display;
}

function ChannelCard({
  ch,
}: {
  ch: {
    id: string;
    name: string;
    handle: string;
    url: string;
    count: string;
    countLabel: string;
    description: string;
    actionText: string;
    brandColor: string;
    icon: React.ReactNode;
  };
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const animated = useCountUp(ch.count, inView);

  return (
    <article
      ref={ref}
      className="group relative flex flex-col bg-[var(--surface)] border border-[var(--rule)] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--ink)]/25"
    >
      {/* Top colour strip */}
      <div
        className="h-1 w-full transition-all duration-300 group-hover:h-[3px]"
        style={{ backgroundColor: ch.brandColor }}
      />

      {/* Card Body */}
      <div className="flex flex-col gap-5 p-6 flex-1">
        {/* Platform identity row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${ch.brandColor}18`, color: ch.brandColor }}
            >
              {ch.icon}
            </div>
            <div>
              <h3 className="font-semibold text-[1rem] text-[var(--ink)] leading-none tracking-tight">
                {ch.name}
              </h3>
              <span className="font-mono text-[0.75rem] text-[var(--ink-muted)] mt-1 block">
                {ch.handle}
              </span>
            </div>
          </div>

          {/* Live pulse */}
          <span className="flex items-center gap-1.5 font-mono text-[0.6875rem] text-[var(--ink-muted)]">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: ch.brandColor }}
            />
            Live
          </span>
        </div>

        {/* Metric */}
        <div className="py-4 px-5 rounded-xl bg-[var(--bg)] border border-[var(--rule)]">
          <span
            className="block font-serif text-[2.5rem] leading-none tracking-tight font-normal tabular-nums"
            style={{ color: ch.brandColor }}
          >
            {animated}
          </span>
          <span className="block font-mono text-[0.7rem] uppercase tracking-widest text-[var(--ink-muted)] mt-2">
            {ch.countLabel}
          </span>
        </div>

        {/* Description */}
        <p className="text-[0.875rem] text-[var(--ink-muted)] leading-[1.65] m-0 flex-1">
          {ch.description}
        </p>
      </div>

      {/* CTA button — sits flush at the bottom */}
      <div className="px-6 pb-6">
        <a
          href={ch.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl font-mono text-[0.8125rem] font-semibold no-underline border transition-all duration-200"
          style={
            {
              '--btn-color': ch.brandColor,
              backgroundColor: `${ch.brandColor}10`,
              borderColor: `${ch.brandColor}30`,
              color: ch.brandColor,
            } as React.CSSProperties
          }
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.backgroundColor = ch.brandColor;
            el.style.borderColor = ch.brandColor;
            el.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.backgroundColor = `${ch.brandColor}10`;
            el.style.borderColor = `${ch.brandColor}30`;
            el.style.color = ch.brandColor;
          }}
        >
          <span className="shrink-0" style={{ color: 'inherit' }}>{ch.icon}</span>
          <span>{ch.actionText}</span>
          <ArrowUpRight />
        </a>
      </div>
    </article>
  );
}

export default function WhereIShareSection({ siteInfo }: WhereIShareSectionProps) {
  const { socialLinks, socialMetrics } = siteInfo;

  const channels = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: '@abdurrakib0',
      url: socialLinks?.linkedin || 'https://www.linkedin.com/in/abdurrakib0/',
      count: socialMetrics?.linkedinFollowers || '35,000+',
      countLabel: socialMetrics?.linkedinLabel || 'Followers & Connections',
      description:
        'Long-form essays on engineering leadership, junior-to-senior hiring filters, and high-throughput career systems that consistently get results.',
      actionText: 'Connect on LinkedIn',
      brandColor: '#0A66C2',
      icon: <LinkedInIcon />,
    },
    {
      id: 'youtube',
      name: 'YouTube',
      handle: '@abdurrakib0',
      url: socialLinks?.youtube || 'https://www.youtube.com/@abdurrakib0',
      count: socialMetrics?.youtubeSubscribers || '25,000+',
      countLabel: socialMetrics?.youtubeLabel || 'Subscribers',
      description:
        'Host of Career Crackerz & Borderless Bangladeshi — podcast conversations, keynote masterclasses, and step-by-step developer growth guides.',
      actionText: 'Subscribe on YouTube',
      brandColor: '#FF0000',
      icon: <YouTubeIcon />,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: '@abdurrakibzero',
      url: socialLinks?.facebook || 'https://www.facebook.com/abdurrakibzero',
      count: socialMetrics?.facebookFollowers || '50,000+',
      countLabel: socialMetrics?.facebookLabel || 'Followers',
      description:
        'Daily engineering thoughts, live AMA sessions, ecosystem milestones, and direct community conversations with 50,000+ aspiring builders.',
      actionText: 'Follow on Facebook',
      brandColor: '#1877F2',
      icon: <FacebookIcon />,
    },
  ];

  return (
    <section id="where-i-share" className="container space-y-8">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-header-title-group">
          <span className="section-label">05 / Channels</span>
          <h2 className="section-title">Where I Share</h2>
        </div>
        <p className="text-[0.9375rem] text-[var(--ink-muted)] max-w-md hidden md:block">
          Publishing engineering insights, podcast episodes, and career frameworks across three primary channels.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {channels.map((ch) => (
          <ChannelCard key={ch.id} ch={ch} />
        ))}
      </div>
    </section>
  );
}
