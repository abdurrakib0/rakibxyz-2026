'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';

export default function RecommendationsSection() {
  useEffect(() => {
    // Ensure script triggers when component mounts or route updates
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

      {/* SociableKIT LinkedIn Recommendations Live Widget */}
      <div className="linkedin-widget-wrapper">
        <div className="sk-ww-linkedin-recommendations" data-embed-id="25708007"></div>
      </div>

      <Script
        src="https://widgets.sociablekit.com/linkedin-recommendations/widget.js"
        strategy="lazyOnload"
      />
    </section>
  );
}
