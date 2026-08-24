'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { Recommendation } from '@/lib/data';

interface RecommendationsSectionProps {
  recommendations?: Recommendation[];
}

export default function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  useEffect(() => {
    // Ensure script triggers when component mounts
    const existing = document.querySelector(
      'script[src="https://widgets.sociablekit.com/linkedin-recommendations/widget.js"]'
    );
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://widgets.sociablekit.com/linkedin-recommendations/widget.js';
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <section id="recommendations" className="container my-16 md:my-24">
      {/* Section Header */}
      <div className="section-header mb-8">
        <div className="section-header-title-group">
          <span className="section-label">04 / Endorsements</span>
          <h2 className="section-title">What Industry Leaders Say</h2>
          <p className="font-serif text-[1.0625rem] text-[var(--ink-muted)] max-w-2xl mt-2 leading-relaxed">
            Live recommendations and kind words from founders, engineering leaders, and colleagues on LinkedIn.
          </p>
        </div>
      </div>

      {/* SociableKIT LinkedIn Recommendations Live Widget */}
      <div className="w-full bg-[var(--surface)] border border-[var(--rule)] p-4 sm:p-6 rounded-[var(--radius-lg)] overflow-hidden min-h-[300px]">
        <div className="sk-ww-linkedin-recommendations" data-embed-id="25708007"></div>
      </div>

      <Script
        src="https://widgets.sociablekit.com/linkedin-recommendations/widget.js"
        strategy="lazyOnload"
      />
    </section>
  );
}
