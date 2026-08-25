'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function RecommendationsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldLoadWidget, setShouldLoadWidget] = useState(false);

  useEffect(() => {
    // Only load third-party widget when user scrolls near the section (zero initial render impact)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoadWidget(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoadLoadScript(shouldLoadWidget)) return;

    const existing = document.querySelector(
      'script[src="https://widgets.sociablekit.com/linkedin-recommendations/widget.js"]'
    );
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://widgets.sociablekit.com/linkedin-recommendations/widget.js';
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [shouldLoadWidget]);

  return (
    <section ref={sectionRef} id="recommendations" className="container">
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

      {/* SociableKIT LinkedIn Recommendations Live Widget */}
      <div className="linkedin-widget-wrapper min-h-[220px]">
        {shouldLoadWidget ? (
          <div className="sk-ww-linkedin-recommendations" data-embed-id="25708007"></div>
        ) : (
          <div className="w-full py-12 flex items-center justify-center font-mono text-[0.8125rem] text-[var(--ink-muted)] opacity-60">
            Loading endorsements...
          </div>
        )}
      </div>
    </section>
  );
}

function shouldLoadLoadScript(shouldLoad: boolean) {
  return shouldLoad && typeof window !== 'undefined';
}
