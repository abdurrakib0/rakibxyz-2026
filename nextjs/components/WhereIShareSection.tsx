import React from 'react';
import { SiteInfo } from '@/lib/data';

interface WhereIShareSectionProps {
  siteInfo: SiteInfo;
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
        'Long-form essays on engineering leadership, junior-to-senior hiring filters, and high-throughput career systems.',
      actionText: 'Connect on LinkedIn',
      brandColor: '#0A66C2',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
    },
    {
      id: 'youtube',
      name: 'YouTube',
      handle: '@abdurrakib0',
      url: socialLinks?.youtube || 'https://www.youtube.com/@abdurrakib0',
      count: socialMetrics?.youtubeSubscribers || '25,000+',
      countLabel: socialMetrics?.youtubeLabel || 'Subscribers',
      description:
        'Host of Career Crackerz & Borderless Bangladeshi podcasts, keynote speeches, and step-by-step developer growth masterclasses.',
      actionText: 'Subscribe on YouTube',
      brandColor: '#FF0000',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: '@abdurrakibzero',
      url: socialLinks?.facebook || 'https://www.facebook.com/abdurrakibzero',
      count: socialMetrics?.facebookFollowers || '50,000+',
      countLabel: socialMetrics?.facebookLabel || 'Followers',
      description:
        'Daily thoughts on tech entrepreneurship, live Q&A sessions, ecosystem milestones, and community engagement.',
      actionText: 'Follow on Facebook',
      brandColor: '#1877F2',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
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
          Publishing insights, podcast episodes, and engineering frameworks across primary platforms.
        </p>
      </div>

      {/* 3 Channels Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {channels.map((ch) => (
          <article
            key={ch.id}
            className="group relative bg-[var(--surface)] border border-[var(--rule)] rounded-[20px] p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all duration-300 hover:border-[var(--ink)]/40 hover:shadow-sm"
          >
            {/* Top Row: Icon, Name & Handle */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0"
                  style={{
                    backgroundColor: `${ch.brandColor}12`,
                    color: ch.brandColor,
                  }}
                >
                  {ch.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[1.125rem] text-[var(--ink)] leading-tight tracking-tight">
                    {ch.name}
                  </h3>
                  <span className="font-mono text-[0.8125rem] text-[var(--ink-muted)] block mt-0.5">
                    {ch.handle}
                  </span>
                </div>
              </div>

              {/* Follower / Subscriber Big Metric Counter */}
              <div className="bg-[var(--bg)] border border-[var(--rule)] rounded-[14px] p-4 flex flex-col gap-0.5">
                <span className="font-serif text-[2rem] text-[var(--ink)] font-normal leading-none tracking-tight">
                  {ch.count}
                </span>
                <span className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)] mt-1 font-medium">
                  {ch.countLabel}
                </span>
              </div>

              {/* Description */}
              <p className="text-[0.875rem] text-[var(--ink)]/85 leading-relaxed m-0">
                {ch.description}
              </p>
            </div>

            {/* Action Link Button */}
            <a
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-3 rounded-[12px] bg-[var(--bg)] border border-[var(--rule)] text-[var(--ink)] no-underline font-mono text-[0.8125rem] font-medium transition-all duration-200 group-hover:bg-[var(--ink)] group-hover:text-[var(--bg)] group-hover:border-[var(--ink)]"
            >
              <span>{ch.actionText}</span>
              <span className="text-base group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                ↗
              </span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
