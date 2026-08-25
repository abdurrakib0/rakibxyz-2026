import React from 'react';
import { ExperienceItem } from '@/lib/data';

interface ExperienceProps {
  experience: ExperienceItem[];
}

export default function ExperienceSection({ experience }: ExperienceProps) {
  return (
    <section id="experience" className="container">
      {/* Section Header */}
      <div className="section-header">
        <div className="section-header-title-group">
          <span className="section-label">Core Functionality / Experience</span>
          <h2 className="section-title">Experience &amp; Impact</h2>
          <p className="font-mono text-[0.8125rem] text-[var(--ink-muted)] mt-1">
            Developer → PM → Strategic Leader → COO
          </p>
        </div>
      </div>

      {/* Experience List */}
      <div className="experience-list">
        {experience.map((item) => (
          <div key={item.id} className="experience-item">
            <div className="experience-date">{item.period}</div>
            <div className="experience-role-box">
              <h3 className="experience-role">{item.role}</h3>
              <span className="experience-company">{item.company}</span>
            </div>
            <ul className="experience-details">
              {item.details.map((d, idx) => (
                <li key={idx}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
