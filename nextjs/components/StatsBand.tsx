import React from 'react';
import { SiteInfo } from '@/lib/data';

interface StatsBandProps {
  stats: SiteInfo['stats'];
  caption: string;
}

export default function StatsBand({ stats, caption }: StatsBandProps) {
  return (
    <div className="stats-band">
      <div className="container stats-inner">
        <div className="stats-grid">
          {stats.map((item, idx) => (
            <div key={idx} className="stat-item">
              <span className="stat-number">{item.number}</span>
              <span className="stat-desc">{item.label}</span>
            </div>
          ))}
        </div>
        <p className="stats-caption">{caption}</p>
      </div>
    </div>
  );
}
