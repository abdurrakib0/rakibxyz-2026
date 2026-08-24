'use client';

import React, { useState, useEffect } from 'react';
import { SiteInfo } from '@/lib/data';

export default function AdminSiteInfoPage() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/site-info')
      .then((res) => res.json())
      .then((data) => setSiteInfo(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteInfo) return;
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteInfo),
      });

      if (res.ok) {
        setMessage('Site information & statistics updated successfully!');
      } else {
        setMessage('Failed to update site information.');
      }
    } catch (err) {
      setMessage('Error updating site information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !siteInfo) {
    return <div className="font-mono text-sm text-[var(--ink-muted)]">Loading site information...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--rule)] pb-6">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal">
            Site Info & Statistics Manager
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-muted)]">
            Live-edit Hero statement, bio, metrics numbers, and 2030 mission values.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded font-mono text-xs">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Section 1: Hero Information */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4">
          <h2 className="font-serif text-[1.25rem] text-[var(--ink)] border-b border-[var(--rule)] pb-2 font-medium">
            1. Hero Section Content
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Name</label>
              <input
                type="text"
                value={siteInfo.name}
                onChange={(e) => setSiteInfo({ ...siteInfo, name: e.target.value })}
                className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Role & Company</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={siteInfo.role}
                  onChange={(e) => setSiteInfo({ ...siteInfo, role: e.target.value })}
                  placeholder="Role"
                  className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
                />
                <input
                  type="text"
                  value={siteInfo.company}
                  onChange={(e) => setSiteInfo({ ...siteInfo, company: e.target.value })}
                  placeholder="Company"
                  className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Hero Headline (HTML allowed)</label>
            <input
              type="text"
              value={siteInfo.heroHeadline}
              onChange={(e) => setSiteInfo({ ...siteInfo, heroHeadline: e.target.value })}
              className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Hero Bio (HTML allowed)</label>
            <textarea
              value={siteInfo.heroBio}
              onChange={(e) => setSiteInfo({ ...siteInfo, heroBio: e.target.value })}
              rows={3}
              className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)] leading-[1.5]"
            />
          </div>
        </div>

        {/* Section 2: Statistics Band */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4">
          <h2 className="font-serif text-[1.25rem] text-[var(--ink)] border-b border-[var(--rule)] pb-2 font-medium">
            2. Statistics Band Numbers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {siteInfo.stats.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-2 p-3 bg-[var(--bg)] rounded border border-[var(--rule)]">
                <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">Stat #{idx + 1}</label>
                <input
                  type="text"
                  value={item.number}
                  onChange={(e) => {
                    const newStats = [...siteInfo.stats];
                    newStats[idx].number = e.target.value;
                    setSiteInfo({ ...siteInfo, stats: newStats });
                  }}
                  placeholder="e.g. 6,300+"
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded px-2.5 py-1.5 text-[0.875rem] font-bold text-[var(--ink)]"
                />
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => {
                    const newStats = [...siteInfo.stats];
                    newStats[idx].label = e.target.value;
                    setSiteInfo({ ...siteInfo, stats: newStats });
                  }}
                  placeholder="Label"
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded px-2.5 py-1.5 text-[0.75rem] text-[var(--ink-muted)]"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Stats Caption</label>
            <input
              type="text"
              value={siteInfo.statsCaption}
              onChange={(e) => setSiteInfo({ ...siteInfo, statsCaption: e.target.value })}
              className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
            />
          </div>
        </div>

        {/* Section 3: 2030 Mission & Philosophy */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4">
          <h2 className="font-serif text-[1.25rem] text-[var(--ink)] border-b border-[var(--rule)] pb-2 font-medium">
            3. Philosophy & 2030 Mission Canvas
          </h2>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Philosophy Quote</label>
            <input
              type="text"
              value={siteInfo.philosophy.quote}
              onChange={(e) => setSiteInfo({
                ...siteInfo,
                philosophy: { ...siteInfo.philosophy, quote: e.target.value }
              })}
              className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Decade Target Number</label>
              <input
                type="text"
                value={siteInfo.philosophy.decadeTarget}
                onChange={(e) => setSiteInfo({
                  ...siteInfo,
                  philosophy: { ...siteInfo.philosophy, decadeTarget: e.target.value }
                })}
                className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Decade Target Label</label>
              <input
                type="text"
                value={siteInfo.philosophy.decadeTargetLabel}
                onChange={(e) => setSiteInfo({
                  ...siteInfo,
                  philosophy: { ...siteInfo.philosophy, decadeTargetLabel: e.target.value }
                })}
                className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--accent)] text-white px-8 py-3 rounded-[var(--radius)] font-mono text-[0.875rem] uppercase tracking-wider hover:bg-[var(--ink)] transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
