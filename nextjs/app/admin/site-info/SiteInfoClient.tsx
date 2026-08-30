'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SiteInfo } from '@/lib/data';

const DRAFT_SITEINFO_KEY = 'abdur_rakib_siteinfo_draft_v1';

interface SiteInfoClientProps {
  initialSiteInfo: SiteInfo;
}

export default function SiteInfoClient({ initialSiteInfo }: SiteInfoClientProps) {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(initialSiteInfo);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [draftStatus, setDraftStatus] = useState('');
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [isSyncingSocial, setIsSyncingSocial] = useState(false);

  const handleSyncSocialStats = async () => {
    setIsSyncingSocial(true);
    setMessage('');
    try {
      const res = await fetch('/api/sync/social', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.metrics) {
          setSiteInfo((prev) => ({
            ...prev,
            socialMetrics: data.metrics,
          }));
        }
        setMessage('Live follower and subscriber counts synced successfully!');
        setTimeout(() => setMessage(''), 4000);
      } else {
        setMessage(data.message || 'Sync failed.');
      }
    } catch (e) {
      setMessage('Error syncing live social stats.');
    } finally {
      setIsSyncingSocial(false);
    }
  };

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
    }, 1200);

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

  const handleSave = async (e: React.FormEvent) => {
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
        setMessage('Site Info updated and synced across all pages!');
        try {
          localStorage.removeItem(DRAFT_SITEINFO_KEY);
          setHasSavedDraft(false);
        } catch (e) {}
        setTimeout(() => setSaveStatus('idle'), 3500);
      } else {
        setSaveStatus('error');
        setIsError(true);
        setMessage(data.message || 'Failed to save site info.');
        setTimeout(() => setSaveStatus('idle'), 3500);
      }
    } catch (err: any) {
      setSaveStatus('error');
      setIsError(true);
      setMessage(`Error saving site info: ${err.message || 'Network error'}`);
      setTimeout(() => setSaveStatus('idle'), 3500);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal tracking-tight">
            Site Info &amp; Philosophy
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-muted)] mt-1">
            Update personal bio, executive leadership metrics, and social channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasSavedDraft && (
            <button
              onClick={handleRestoreDraft}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-[var(--radius)] font-mono text-[0.75rem] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>📋 Restore Draft</span>
            </button>
          )}

          {draftStatus && (
            <span className="font-mono text-[0.75rem] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              {draftStatus}
            </span>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-[var(--radius)] font-mono text-[0.8125rem] flex items-center gap-2 ${
            isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
          }`}
        >
          <span>{isError ? '✕' : '✓'}</span>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        {/* Core Identity */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-2xs">
          <h2 className="font-serif text-[1.25rem] text-[var(--ink)] border-b border-[var(--rule)] pb-3">
            Core Identity &amp; Title
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Full Name</label>
              <input
                type="text"
                value={siteInfo.name}
                onChange={(e) => setSiteInfo({ ...siteInfo, name: e.target.value })}
                className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Professional Title / Role</label>
              <input
                type="text"
                value={siteInfo.role}
                onChange={(e) => setSiteInfo({ ...siteInfo, role: e.target.value })}
                className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Hero Tagline / Headline</label>
            <input
              type="text"
              value={siteInfo.heroHeadline}
              onChange={(e) => setSiteInfo({ ...siteInfo, heroHeadline: e.target.value })}
              className="bg-[var(--bg)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Full Hero Bio</label>
            <textarea
              value={siteInfo.heroBio}
              onChange={(e) => setSiteInfo({ ...siteInfo, heroBio: e.target.value })}
              rows={4}
              className="bg-[var(--bg)] border border-[var(--rule)] rounded p-3 text-[0.875rem] text-[var(--ink)] leading-relaxed"
            />
          </div>
        </div>

        {/* Executive Stats & Metrics */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-2xs">
          <h2 className="font-serif text-[1.25rem] text-[var(--ink)] border-b border-[var(--rule)] pb-3">
            Executive Metrics &amp; Placements
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {siteInfo.stats.map((st, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 bg-[var(--bg)] border border-[var(--rule)] rounded">
                <span className="font-mono text-[0.6875rem] text-[var(--accent)] font-semibold">
                  Metric #{i + 1}
                </span>
                <input
                  type="text"
                  value={st.number}
                  onChange={(e) => {
                    const newStats = [...siteInfo.stats];
                    newStats[i] = { ...newStats[i], number: e.target.value };
                    setSiteInfo({ ...siteInfo, stats: newStats });
                  }}
                  placeholder="Number (e.g. 6,300+)"
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded px-2.5 py-1.5 font-serif text-[1.125rem] text-[var(--ink)]"
                />
                <input
                  type="text"
                  value={st.label}
                  onChange={(e) => {
                    const newStats = [...siteInfo.stats];
                    newStats[i] = { ...newStats[i], label: e.target.value };
                    setSiteInfo({ ...siteInfo, stats: newStats });
                  }}
                  placeholder="Label"
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded px-2.5 py-1 text-[0.75rem] text-[var(--ink-muted)]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Where I Share - Follower & Subscriber Metrics */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3 flex-wrap gap-2">
            <h2 className="font-serif text-[1.25rem] text-[var(--ink)]">
              Where I Share - Followers &amp; Audience Metrics
            </h2>
            <button
              type="button"
              onClick={handleSyncSocialStats}
              disabled={isSyncingSocial}
              className="bg-[var(--bg)] border border-[var(--rule)] hover:border-[var(--ink)] text-[var(--ink)] px-3.5 py-1.5 rounded font-mono text-[0.75rem] cursor-pointer transition-colors flex items-center gap-1.5 font-medium"
            >
              <span>{isSyncingSocial ? '⏳ Syncing...' : '↻ Auto-Sync Live Stats'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* LinkedIn */}
            <div className="flex flex-col gap-2 p-4 bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)]">
              <div className="flex items-center gap-2 font-mono text-[0.75rem] text-[#0A66C2] font-semibold">
                <span>LinkedIn</span>
              </div>
              <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">Follower Count</label>
              <input
                type="text"
                value={siteInfo.socialMetrics?.linkedinFollowers ?? ''}
                onChange={(e) => setSiteInfo({
                  ...siteInfo,
                  socialMetrics: { ...(siteInfo.socialMetrics || {}), linkedinFollowers: e.target.value }
                })}
                placeholder="e.g. 35,000+"
                className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] font-mono text-[var(--ink)]"
              />
              <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">Label</label>
              <input
                type="text"
                value={siteInfo.socialMetrics?.linkedinLabel ?? ''}
                onChange={(e) => setSiteInfo({
                  ...siteInfo,
                  socialMetrics: { ...(siteInfo.socialMetrics || {}), linkedinLabel: e.target.value }
                })}
                placeholder="Followers & Connections"
                className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.75rem] text-[var(--ink)]"
              />
            </div>

            {/* YouTube */}
            <div className="flex flex-col gap-2 p-4 bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)]">
              <div className="flex items-center gap-2 font-mono text-[0.75rem] text-[#FF0000] font-semibold">
                <span>YouTube</span>
              </div>
              <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">Subscriber Count</label>
              <input
                type="text"
                value={siteInfo.socialMetrics?.youtubeSubscribers ?? ''}
                onChange={(e) => setSiteInfo({
                  ...siteInfo,
                  socialMetrics: { ...(siteInfo.socialMetrics || {}), youtubeSubscribers: e.target.value }
                })}
                placeholder="e.g. 25,000+"
                className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] font-mono text-[var(--ink)]"
              />
              <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">Label</label>
              <input
                type="text"
                value={siteInfo.socialMetrics?.youtubeLabel ?? ''}
                onChange={(e) => setSiteInfo({
                  ...siteInfo,
                  socialMetrics: { ...(siteInfo.socialMetrics || {}), youtubeLabel: e.target.value }
                })}
                placeholder="Subscribers"
                className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.75rem] text-[var(--ink)]"
              />
            </div>

            {/* Facebook */}
            <div className="flex flex-col gap-2 p-4 bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)]">
              <div className="flex items-center gap-2 font-mono text-[0.75rem] text-[#1877F2] font-semibold">
                <span>Facebook</span>
              </div>
              <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">Follower Count</label>
              <input
                type="text"
                value={siteInfo.socialMetrics?.facebookFollowers ?? ''}
                onChange={(e) => setSiteInfo({
                  ...siteInfo,
                  socialMetrics: { ...(siteInfo.socialMetrics || {}), facebookFollowers: e.target.value }
                })}
                placeholder="e.g. 50,000+"
                className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] font-mono text-[var(--ink)]"
              />
              <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">Label</label>
              <input
                type="text"
                value={siteInfo.socialMetrics?.facebookLabel ?? ''}
                onChange={(e) => setSiteInfo({
                  ...siteInfo,
                  socialMetrics: { ...(siteInfo.socialMetrics || {}), facebookLabel: e.target.value }
                })}
                placeholder="Followers"
                className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.75rem] text-[var(--ink)]"
              />
            </div>
          </div>
        </div>

        {/* Philosophy & Decade Vision */}
        <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 flex flex-col gap-4 shadow-2xs">
          <h2 className="font-serif text-[1.25rem] text-[var(--ink)] border-b border-[var(--rule)] pb-3">
            Guiding Philosophy
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

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className={`px-8 py-3 rounded-[var(--radius)] font-mono text-[0.875rem] uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md flex items-center gap-2 font-medium ${
              saveStatus === 'saving'
                ? 'bg-[var(--ink)] text-white opacity-80 cursor-wait'
                : saveStatus === 'success'
                ? 'bg-emerald-600 text-white'
                : saveStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-[var(--accent)] hover:bg-[var(--ink)] text-white'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'success' ? (
              <>
                <span className="text-base font-bold">✓</span>
                <span>Saved Successfully!</span>
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
