'use client';

import React, { useRef, useState, useEffect } from 'react';
import { SiteInfo } from '@/lib/data';

interface WhereIShareSectionProps {
  siteInfo: SiteInfo;
}

/* ── Icons ─────────────────────────────────────────── */
function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function YouTubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/* ── Count-up animation on scroll ──────────────────── */
function useCountUp(target: string, inView: boolean) {
  const [display, setDisplay] = useState('—');

  useEffect(() => {
    if (!inView) return;
    const numericStr = target.replace(/[^0-9]/g, '');
    const suffix = target.replace(/[0-9,]/g, '');
    const end = parseInt(numericStr, 10);
    if (isNaN(end)) { setDisplay(target); return; }

    const steps = 45;
    const duration = 1200;
    let current = 0;
    const inc = end / steps;
    const id = setInterval(() => {
      current += inc;
      if (current >= end) {
        clearInterval(id);
        setDisplay(end.toLocaleString() + suffix);
      } else {
        setDisplay(Math.floor(current).toLocaleString() + suffix);
      }
    }, duration / steps);
    return () => clearInterval(id);
  }, [inView, target]);

  return display;
}

/* ── Fetch live YouTube subscriber count ────────────
   - Hits /api/social-counts which caches for 1 hour server-side
   - Client refreshes every 30 min for long-open tabs
   - Falls back silently if no API key is set
───────────────────────────────────────────────────── */
function useLiveCounts() {
  const [youtubeLive, setYoutubeLive] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/social-counts');
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.youtube && !data.apiKeyMissing && !cancelled) {
          setYoutubeLive(data.youtube);
          setIsLive(true);
        }
      } catch (_) { /* silent fallback */ }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30 * 60 * 1000); // every 30 min
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { youtubeLive, isLive };
}

/* ── Individual Channel Card ────────────────────────── */
interface ChannelCardProps {
  name: string;
  handle: string;
  url: string;
  count: string;
  countLabel: string;
  description: string;
  actionText: string;
  brandColor: string;
  isApiLive?: boolean;
  icon: React.ReactNode;
  iconSmall: React.ReactNode;
}

function ChannelCard({
  name, handle, url, count, countLabel,
  description, actionText, brandColor, isApiLive,
  icon, iconSmall,
}: ChannelCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const animated = useCountUp(count, inView);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group flex flex-col bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-250 hover:border-[var(--ink)]/30 hover:shadow-sm"
    >
      {/* Brand colour top strip — 2px only */}
      <div className="h-[2px] shrink-0" style={{ backgroundColor: brandColor }} />

      {/* Card body */}
      <div className="flex flex-col gap-5 p-6 flex-1">

        {/* Platform identity row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="shrink-0" style={{ color: brandColor }}>{icon}</span>
            <div>
              <h3 className="font-semibold text-[var(--ink)] text-[0.9375rem] leading-tight">
                {name}
              </h3>
              <span className="font-mono text-[0.75rem] text-[var(--ink-muted)] block mt-0.5">
                {handle}
              </span>
            </div>
          </div>

          {/* Live badge — uses API live indicator for YouTube, static for others */}
          <span className="flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-wider text-[var(--ink-muted)] border border-[var(--rule)] rounded-full px-2 py-0.5 shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isApiLive ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: isApiLive ? brandColor : 'var(--ink-muted)', opacity: isApiLive ? 1 : 0.5 }}
            />
            {isApiLive ? 'Live API' : 'Live'}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--rule)]" />

        {/* Metric */}
        <div>
          <span className="block font-serif text-[2.75rem] text-[var(--ink)] font-normal leading-none tracking-tight tabular-nums">
            {animated}
          </span>
          <span className="block font-mono text-[0.6875rem] uppercase tracking-widest text-[var(--ink-muted)] mt-2">
            {countLabel}
          </span>
        </div>

        {/* Description */}
        <p className="text-[0.875rem] text-[var(--ink-muted)] leading-relaxed m-0 flex-1">
          {description}
        </p>
      </div>

      {/* CTA — flush bottom */}
      <div className="px-6 pb-6">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 w-full py-2.5 px-4 rounded border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] no-underline font-mono text-[0.8125rem] font-medium transition-all duration-200 hover:bg-[var(--ink)] hover:text-[var(--bg)] hover:border-[var(--ink)] group/btn"
        >
          <span
            className="shrink-0 transition-colors duration-200 group-hover/btn:!text-[var(--bg)]"
            style={{ color: brandColor }}
          >
            {iconSmall}
          </span>
          <span className="flex-1">{actionText}</span>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="shrink-0 opacity-40 group-hover/btn:opacity-100 transition-all duration-200"
            aria-hidden
          >
            <path d="M7 17L17 7M7 7h10v10" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ── Main Section ───────────────────────────────────── */
export default function WhereIShareSection({ siteInfo }: WhereIShareSectionProps) {
  const { socialLinks, socialMetrics } = siteInfo;
  const { youtubeLive, isLive } = useLiveCounts();

  const channels: ChannelCardProps[] = [
    {
      name: 'LinkedIn',
      handle: '@abdurrakib0',
      url: socialLinks?.linkedin || 'https://www.linkedin.com/in/abdurrakib0/',
      count: socialMetrics?.linkedinFollowers || '35,000+',
      countLabel: socialMetrics?.linkedinLabel || 'Followers & Connections',
      description:
        'Long-form essays on engineering leadership, junior-to-senior hiring filters, and high-throughput career systems.',
      actionText: 'Connect on LinkedIn',
      brandColor: '#0A66C2',
      icon: <LinkedInIcon size={22} />,
      iconSmall: <LinkedInIcon size={14} />,
      isApiLive: false,
    },
    {
      name: 'YouTube',
      handle: '@abdurrakib0',
      url: socialLinks?.youtube || 'https://www.youtube.com/@abdurrakib0',
      // Live API count takes priority; falls back to admin-set value
      count: youtubeLive || socialMetrics?.youtubeSubscribers || '25,000+',
      countLabel: socialMetrics?.youtubeLabel || 'Subscribers',
      description:
        'Host of Career Crackerz & Borderless Bangladeshi — podcast conversations, keynotes, and step-by-step developer growth masterclasses.',
      actionText: 'Subscribe on YouTube',
      brandColor: '#CC0000',
      icon: <YouTubeIcon size={22} />,
      iconSmall: <YouTubeIcon size={14} />,
      isApiLive: isLive,
    },
    {
      name: 'Facebook',
      handle: '@abdurrakibzero',
      url: socialLinks?.facebook || 'https://www.facebook.com/abdurrakibzero',
      count: socialMetrics?.facebookFollowers || '50,000+',
      countLabel: socialMetrics?.facebookLabel || 'Followers',
      description:
        'Daily engineering thoughts, live AMA sessions, ecosystem milestones, and direct mentorship conversations with aspiring builders.',
      actionText: 'Follow on Facebook',
      brandColor: '#1877F2',
      icon: <FacebookIcon size={22} />,
      iconSmall: <FacebookIcon size={14} />,
      isApiLive: false,
    },
  ];

  return (
    <section id="where-i-share" className="container space-y-8">
      <div className="section-header">
        <div className="section-header-title-group">
          <span className="section-label">05 / Channels</span>
          <h2 className="section-title">Where I Share</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {channels.map((ch) => (
          <ChannelCard key={ch.name} {...ch} />
        ))}
      </div>
    </section>
  );
}
