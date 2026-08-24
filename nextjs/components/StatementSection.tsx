import React from 'react';
import { SiteInfo } from '@/lib/data';

interface StatementSectionProps {
  philosophy: SiteInfo['philosophy'];
}

export default function StatementSection({ philosophy }: StatementSectionProps) {
  return (
    <section className="container statement-section">
      <div className="pt-14 md:pt-20 pb-4 md:pb-6 border-t border-[var(--rule)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Operating Philosophy */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--accent)] font-medium italic">
                Operating Philosophy
              </span>
            </div>

            <blockquote className="m-0 p-0">
              <h2 className="font-serif text-[1.875rem] sm:text-[2.25rem] md:text-[2.625rem] leading-[1.25] tracking-tight text-[var(--ink)] font-normal">
                <span className="text-[var(--accent)] font-serif text-[2.25rem] sm:text-[2.75rem] md:text-[3.25rem] leading-none select-none align-top inline-block mr-1">“</span>AI raised the bar for junior developers.{' '}
                <span className="text-[var(--accent)] italic">Motivation does not clear it. Systems do.</span>
              </h2>
            </blockquote>

            <p className="font-serif text-[1.0625rem] md:text-[1.125rem] text-[var(--ink-muted)] leading-relaxed max-w-xl">
              {philosophy.reflection}
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {philosophy.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] border border-[var(--rule)] px-3 py-1.5 rounded-[var(--radius)] hover:border-[var(--ink)] transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Decade Objective Canvas with Vertical Hairline */}
          <div className="lg:col-span-5 lg:border-l lg:border-[var(--rule)] lg:pl-12 flex flex-col gap-6 lg:pt-2">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--ink-muted)]">
                Decade Objective
              </span>
              <span className="font-mono text-[0.6875rem] text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1 rounded-[var(--radius)] font-medium">
                Target 2030
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-serif text-[3.5rem] md:text-[4.25rem] leading-none text-[var(--ink)] font-normal tracking-tight">
                {philosophy.decadeTarget}
              </span>
              <span className="font-mono text-[0.8125rem] uppercase tracking-wider text-[var(--ink-muted)]">
                {philosophy.decadeTargetLabel}
              </span>
            </div>

            <div className="border-t border-[var(--rule)] pt-5">
              <p className="font-serif text-[0.9375rem] md:text-[1rem] leading-relaxed text-[var(--ink)] italic">
                &ldquo;{philosophy.decadeNote}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
