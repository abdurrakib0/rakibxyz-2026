import React from 'react';
import { SiteInfo } from '@/lib/data';

interface StatementSectionProps {
  philosophy: SiteInfo['philosophy'];
}

export default function StatementSection({ philosophy }: StatementSectionProps) {
  return (
    <section className="statement-section container">
      <div className="manifesto-card">
        {/* Left: Core Philosophy & Quote */}
        <div className="manifesto-content">
          <div className="manifesto-badge">
            <span className="manifesto-badge-dot"></span>
            <span>Operating Philosophy</span>
          </div>
          
          <blockquote className="manifesto-quote">
            <span className="manifesto-quote-mark">&ldquo;</span>
            <p className="manifesto-quote-text">
              AI raised the bar for junior developers. <span className="manifesto-highlight">Motivation does not clear it. Systems do.</span>
            </p>
          </blockquote>

          <p className="manifesto-reflection">
            {philosophy.reflection}
          </p>

          <div className="manifesto-tags">
            {philosophy.tags.map((tag, idx) => (
              <span key={idx} className="manifesto-tag">{tag}</span>
            ))}
          </div>
        </div>

        {/* Right: 2030 Mission Canvas */}
        <div className="manifesto-mission-box">
          <div className="mission-box-header">
            <span className="mission-label">Decade Objective</span>
            <span className="mission-badge-pill">Target 2030</span>
          </div>
          
          <div className="mission-metric-block">
            <div className="mission-metric-number">{philosophy.decadeTarget}</div>
            <div className="mission-metric-unit">{philosophy.decadeTargetLabel}</div>
          </div>

          <p className="mission-metric-note">
            {philosophy.decadeNote}
          </p>

          <div className="mission-progress-track">
            <div className="mission-progress-bar"></div>
            <div className="mission-progress-labels">
              <span>{philosophy.placedToDate}</span>
              <span>{philosophy.targetRate}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
