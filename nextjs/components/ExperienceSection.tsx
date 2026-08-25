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

// Helper to highlight key executive numbers and milestones
const formatBulletText = (text: string) => {
  const metricPattern = /(\d+[\d,]*\+?|\d+\.\d+★|\d+ → \d+|\d+ to \d+\+?|Dubai & Japan|bKash|eKYC|<1%|17% GMV|70K\+|33K|57 countries|20\+ countries)/g;
  const parts = text.split(metricPattern);

  return parts.map((part, i) => {
    if (part.match(metricPattern)) {
      return (
        <strong key={i} className="font-medium text-[var(--ink)] bg-[var(--bg)] px-1 py-0.5 rounded border border-[var(--rule)]/60">
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

      {/* Vertical Executive Timeline Container */}
      <div className="relative pl-6 sm:pl-10 md:pl-12 border-l border-[var(--rule)] ml-2 sm:ml-4 space-y-12 sm:space-y-16">
        {experience.map((item) => {
          const isPresent = item.period.toLowerCase().includes('present');
          const category = getRoleCategory(item.role, item.company);

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Node Indicator */}
              <div
                className={`absolute -left-[31px] sm:-left-[47px] md:-left-[55px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                  isPresent
                    ? 'bg-emerald-500 border-[var(--bg)] ring-4 ring-emerald-500/20 group-hover:scale-125'
                    : 'bg-[var(--surface)] border-[var(--ink-muted)] group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:scale-110'
                }`}
              >
                {isPresent && (
                  <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                )}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
                {/* Left Column: Period & Category Badge (4 Cols) */}
                <div className="md:col-span-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[0.8125rem] font-medium tracking-wide ${
                        isPresent ? 'text-[var(--accent)] font-semibold' : 'text-[var(--ink-muted)]'
                      }`}
                    >
                      {item.period}
                    </span>
                    {isPresent && (
                      <span className="font-mono text-[0.625rem] uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] opacity-80">
                    {category}
                  </span>
                </div>

                {/* Right Column: Role, Company & Bullet Achievements (8 Cols) */}
                <div className="md:col-span-8 flex flex-col gap-3 bg-[var(--surface)] p-5 sm:p-6 rounded-[var(--radius-lg)] border border-[var(--rule)] transition-all duration-200 group-hover:border-[var(--ink-muted)]/80 group-hover:shadow-sm">
                  <div>
                    <h3 className="font-serif text-[1.1875rem] sm:text-[1.25rem] text-[var(--ink)] font-medium leading-snug group-hover:text-[var(--accent)] transition-colors">
                      {item.role}
                    </h3>
                    <span className="font-mono text-[0.75rem] text-[var(--ink-muted)] block mt-0.5">
                      {item.company}
                    </span>
                  </div>

                  {/* Bullet achievements with highlighted metrics */}
                  <ul className="space-y-2 mt-1 pt-3 border-t border-[var(--rule)]/60">
                    {item.details.map((detail, idx) => (
                      <li
                        key={idx}
                        className="font-serif text-[0.875rem] sm:text-[0.9375rem] text-[var(--ink-muted)] leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] opacity-60 mt-2 shrink-0" />
                        <span>{formatBulletText(detail)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
