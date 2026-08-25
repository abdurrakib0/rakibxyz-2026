'use client';

import React from 'react';
import { SiteInfo } from '@/lib/data';

interface HeroProps {
  siteInfo: SiteInfo;
}

export default function Hero({ siteInfo }: HeroProps) {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const elem = document.getElementById(targetId);
    if (elem) {
      const offset = 40;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = elem.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      window.history.pushState(null, '', `/${targetId}`);
    }
  };

  return (
    <section id="home" className="hero-section container">
      <div className="hero-grid">
        <div className="hero-content">
          {/* Main Editorial Statement */}
          <h1 
            className="hero-h1"
            dangerouslySetInnerHTML={{ __html: siteInfo.heroHeadline }}
          />
          
          {/* Executive Lead Paragraph */}
          <p 
            className="hero-bio"
            dangerouslySetInnerHTML={{ __html: siteInfo.heroBio }}
          />

          {/* Action Buttons */}
          <div className="hero-cta-group">
            <a 
              href="#writing" 
              onClick={(e) => scrollToSection(e, 'writing')}
              className="btn-hero-primary"
            >
              <span>Writings</span>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="8" x2="13" y2="8" />
                <polyline points="9 4 13 8 9 12" />
              </svg>
            </a>
            <a 
              href="#podcast" 
              onClick={(e) => scrollToSection(e, 'podcast')}
              className="btn-hero-secondary"
            >
              <span>Watch Keynotes</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Portrait Image */}
        <div className="portrait-box" aria-label="Portrait Photograph of Abdur Rakib">
          <img 
            src={siteInfo.avatarUrl || "/img/Hero%20image.png"} 
            alt="Abdur Rakib Portrait" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
