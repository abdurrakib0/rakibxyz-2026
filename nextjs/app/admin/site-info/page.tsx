'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SiteInfo } from '@/lib/data';

const DRAFT_SITEINFO_KEY = 'abdur_rakib_siteinfo_draft_v1';

export default function AdminSiteInfoPage() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [draftStatus, setDraftStatus] = useState('');
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSiteInfo = async () => {
    try {
      const res = await fetch('/api/site-info', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSiteInfo(data);
      }
    } catch (err) {
      console.error('Error fetching site info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteInfo();
    try {
      if (localStorage.getItem(DRAFT_SITEINFO_KEY)) {
        setHasSavedDraft(true);
      }
    } catch (e) {}
  }, []);

  // Auto-Save Draft watcher
  useEffect(() => {
    if (!siteInfo) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setDraftStatus('Saving draft...');

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_SITEINFO_KEY,
          JSON.stringify({
            siteInfo,
            savedAt: new Date().toISOString(),
          })
        );
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setDraftStatus(`Draft auto-saved at ${timeStr}`);
      } catch (e) {
        setDraftStatus('');
      }
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [siteInfo]);

  const handleRestoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_SITEINFO_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.siteInfo) {
          setSiteInfo(parsed.siteInfo);
          const time = parsed.savedAt ? new Date(parsed.savedAt).toLocaleTimeString() : '';
          setDraftStatus(`Restored draft from ${time}`);
          setHasSavedDraft(false);
        }
      }
    } catch (e) {
      alert('Failed to restore draft.');
    }
  };

  const handleStatChange = (idx: number, field: 'number' | 'label', value: string) => {
    if (!siteInfo) return;
    const newStats = siteInfo.stats.map((s, i) =>
      i === idx ? { ...s, [field]: value } : s
    );
    setSiteInfo({ ...siteInfo, stats: newStats });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteInfo) return;

    setSaveStatus('saving');
    setMessage('');
    setIsError(false);

    try {
      const res = await fetch('/api/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteInfo),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus('success');
        setMessage('Site information & statistics updated successfully!');
        setIsError(false);
        if (data.siteInfo) {
          setSiteInfo(data.siteInfo);
        }

        // Clear draft on successful save
        try {
          localStorage.removeItem(DRAFT_SITEINFO_KEY);
          setHasSavedDraft(false);
        } catch (e) {}

        setTimeout(() => {
          setSaveStatus('idle');
        }, 2500);
      } else {
        setSaveStatus('error');
        setMessage(data.message || 'Failed to update site information.');
        setIsError(true);
        setTimeout(() => setSaveStatus('idle'), 3500);
      }
    } catch (err: any) {
      setSaveStatus('error');
      setMessage(`Error updating site information: ${err.message || 'Network error'}`);
      setIsError(true);
      setTimeout(() => setSaveStatus('idle'), 3500);
    }
  };

  if (loading || !siteInfo) {
    return <div className="font-mono text-sm text-[var(--ink-muted)]">Loading site information...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal">
            Site Info &amp; Statistics Manager
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-muted)]">
            Live-edit Hero statement, bio, metrics numbers, and 2030 mission values.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {draftStatus && (
            <span className="font-mono text-[0.6875rem] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              {draftStatus}
            </span>
          )}

          {hasSavedDraft && (
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-[var(--radius)] font-mono text-[0.75rem] transition-colors cursor-pointer"
            >
              📋 Restore Auto-Saved Draft
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 border rounded font-mono text-xs ${
            isError
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}
        >
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
              <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Role &amp; Company</label>
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
                  onChange={(e) => handleStatChange(idx, 'number', e.target.value)}
                  placeholder="e.g. 6,300+"
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded px-2.5 py-1.5 text-[0.875rem] font-bold text-[var(--ink)]"
                />
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
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
            3. Philosophy &amp; 2030 Mission Canvas
          </h2>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Philosophy Quote</label>
            <input
              type="text"
              value={siteInfo.philosophy?.quote || ''}
              onChange={(e) => setSiteInfo({
                ...siteInfo,
                philosophy: { ...(siteInfo.philosophy || {}), quote: e.target.value } as any
              })}
              className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Decade Target Number</label>
              <input
                type="text"
                value={siteInfo.philosophy?.decadeTarget || ''}
                onChange={(e) => setSiteInfo({
                  ...siteInfo,
                  philosophy: { ...(siteInfo.philosophy || {}), decadeTarget: e.target.value } as any
                })}
                className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Decade Target Label</label>
              <input
                type="text"
                value={siteInfo.philosophy?.decadeTargetLabel || ''}
                onChange={(e) => setSiteInfo({
                  ...siteInfo,
                  philosophy: { ...(siteInfo.philosophy || {}), decadeTargetLabel: e.target.value } as any
                })}
                className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
              />
            </div>
          </div>
        </div>

        {/* Save Button with Interactive Lifecycle State */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className={`px-8 py-3 rounded-[var(--radius)] font-mono text-[0.875rem] uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md flex items-center gap-2 font-medium ${
              saveStatus === 'saving'
                ? 'bg-[var(--ink)] text-white opacity-80 cursor-wait'
                : saveStatus === 'success'
                ? 'bg-emerald-600 text-white scale-[1.02]'
                : saveStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-[var(--accent)] hover:bg-[var(--ink)] text-white'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving &amp; Syncing...</span>
              </>
            ) : saveStatus === 'success' ? (
              <>
                <span className="text-base font-bold">✓</span>
                <span>Saved Successfully!</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <span>✕</span>
                <span>Failed to Save</span>
              </>
            ) : (
              <span>Save All Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
