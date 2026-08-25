import React from 'react';
import { ExperienceItem } from '@/lib/data';

interface ExperienceProps {
  experience: ExperienceItem[];
}

const getRoleCategory = (role: string, company: string): string => {
  if (role.toLowerCase().includes('chief operating officer') || role.toLowerCase().includes('coo')) {
    return 'Executive Leadership';
  }
  if (role.toLowerCase().includes('advisor')) {
    return 'Advisory & Venture Scale';
  }
  if (role.toLowerCase().includes('strategic assistant')) {
    return 'Global Market Expansion';
  }
  if (role.toLowerCase().includes('technical project manager')) {
    return 'Digital Transformation';
  }
  if (role.toLowerCase().includes('product manager')) {
    return 'Fintech & Product Ops';
  }
  return 'Engineering & Delivery';
};

// Highlight key metrics cleanly with bold text (no background box)
const formatBulletText = (text: string) => {
  const metricPattern = /(\d+[\d,]*\+?|\d+\.\d+★|\d+ → \d+|\d+ to \d+\+?|Dubai & Japan|bKash|eKYC|<1%|17% GMV|70K\+|33K|57 countries|20\+ countries)/g;
  const parts = text.split(metricPattern);

  return parts.map((part, i) => {
    if (part.match(metricPattern)) {
      return (
        <strong key={i} className="font-semibold text-[var(--ink)]">
          {part}
        </strong>
      );
    }
    return part;
  });
};

export default function ExperienceSection({ experience }: ExperienceProps) {
  return (
    <section id="experience" className="container">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-header-title-group">
          <span className="section-label">Experience</span>
          <h2 className="section-title">Ten years, one direction</h2>
        </div>
      </div>

      {/* Vertical Executive Timeline with Card Boxes */}
      <div className="relative pl-6 sm:pl-10 md:pl-12 border-l border-[var(--rule)] ml-2 sm:ml-4 space-y-8 sm:space-y-12">
        {experience.map((item) => {
          const isPresent = item.period.toLowerCase().includes('present');
          const category = getRoleCategory(item.role, item.company);

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Node Indicator */}
              <div
                className={`absolute -left-[31px] sm:-left-[47px] md:-left-[55px] top-4 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                  isPresent
                    ? 'bg-emerald-500 border-[var(--bg)] ring-4 ring-emerald-500/20 group-hover:scale-125'
                    : 'bg-[var(--bg)] border-[var(--ink-muted)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:scale-110'
                }`}
              >
                {isPresent && (
                  <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-75 animate-ping will-change-transform transform-gpu" />
                )}
              </div>

              {/* Card Box */}
              <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-5 sm:p-7 transition-all duration-200 hover:border-[var(--ink-muted)]/80">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                  {/* Left Metadata (4 Cols) */}
                  <div className="md:col-span-4 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[0.875rem] tracking-wide ${
                          isPresent ? 'text-[var(--accent)] font-semibold' : 'text-[var(--ink)] font-medium'
                        }`}
                      >
                        {item.period}
                      </span>
                      {isPresent && (
                        <span className="font-mono text-[0.625rem] uppercase tracking-wider text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)]">
                      {category}
                    </span>
                  </div>

                  {/* Right Content: Title, Company & Bullet Points (8 Cols) */}
                  <div className="md:col-span-8 flex flex-col gap-3">
                    <div>
                      <h3 className="font-serif text-[1.25rem] sm:text-[1.375rem] text-[var(--ink)] font-medium leading-snug group-hover:text-[var(--accent)] transition-colors">
                        {item.role}
                      </h3>
                      <p className="font-mono text-[0.8125rem] text-[var(--ink-muted)] mt-0.5">
                        {item.company}
                      </p>
                    </div>

                    {/* Bullet Points with bold metrics */}
                    <ul className="space-y-2 mt-1 pt-3 border-t border-[var(--rule)]/60">
                      {item.details.map((detail, idx) => (
                        <li
                          key={idx}
                          className="font-serif text-[0.9375rem] sm:text-[1rem] text-[var(--ink-muted)] leading-relaxed flex items-start gap-2.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-70 mt-2 shrink-0" />
                          <span className="text-[var(--ink-muted)]">
                            {formatBulletText(detail)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
