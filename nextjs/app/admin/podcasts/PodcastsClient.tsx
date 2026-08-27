'use client';

import React, { useState } from 'react';
import { Podcast } from '@/lib/data';

const ITEMS_PER_PAGE = 10;

interface PodcastsClientProps {
  initialPodcasts: Podcast[];
}

export default function PodcastsClient({ initialPodcasts }: PodcastsClientProps) {
  const [podcasts, setPodcasts] = useState<Podcast[]>(initialPodcasts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPodcasts = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/podcasts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPodcasts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSyncYouTube = async () => {
    setSyncing(true);
    setMessage('');
    try {
      const res = await fetch('/api/sync/youtube', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(`Sync complete! ${data.addedCount} new video(s) found.`);
        fetchPodcasts();
      } else {
        setMessage(data.message || 'Sync failed.');
      }
    } catch (e: any) {
      setMessage('Error syncing YouTube channel.');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateNew = () => {
    const newPod: Podcast = {
      id: '',
      title: '',
      guest: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      tag: 'Tech & Career',
      youtubeUrl: '',
      show: 'Career Crackerz',
    };
    setEditingPodcast(newPod);
    setIsNew(true);
    setSaveStatus('idle');
  };

  const handleEdit = (podcast: Podcast) => {
    setEditingPodcast({ ...podcast });
    setIsNew(false);
    setSaveStatus('idle');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this podcast card?')) return;
    // Instant optimistic update
    setPodcasts((prev) => prev.filter((p) => p.id !== id));
    setMessage('Podcast deleted successfully');
    setTimeout(() => setMessage(''), 3000);

    try {
      await fetch(`/api/podcasts/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete podcast:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPodcast) return;

    const savedPodcast = { ...editingPodcast };

    // Instant optimistic update
    if (isNew) {
      setPodcasts((prev) => [savedPodcast, ...prev]);
      setMessage('Podcast added successfully!');
    } else {
      setPodcasts((prev) => prev.map((p) => (p.id === savedPodcast.id ? savedPodcast : p)));
      setMessage('Podcast updated successfully!');
    }

    setEditingPodcast(null);
    setSaveStatus('idle');
    setTimeout(() => setMessage(''), 3000);

    try {
      const url = isNew ? '/api/podcasts' : `/api/podcasts/${savedPodcast.id}`;
      const method = isNew ? 'POST' : 'PUT';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedPodcast),
      });
    } catch (err: any) {
      console.error('Error saving podcast:', err);
    }
  };

  // Filter & Pagination Calculations
  const filteredPodcasts = podcasts.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.guest && p.guest.toLowerCase().includes(q)) ||
      (p.tag && p.tag.toLowerCase().includes(q)) ||
      (p.show && p.show.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredPodcasts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredPodcasts.length);
  const currentPodcasts = filteredPodcasts.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal tracking-tight">
            Podcasts &amp; Keynotes
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-muted)] mt-1">
            Manage featured video conversations across &ldquo;Career Crackerz&rdquo; and &ldquo;Borderless Bangladeshi&rdquo;.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchPodcasts}
            disabled={isRefreshing}
            className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3 py-2 rounded-[var(--radius)] font-mono text-[0.75rem] text-[var(--ink)] cursor-pointer transition-colors"
          >
            {isRefreshing ? 'Refreshing...' : '↻ Refresh'}
          </button>

          <button
            onClick={handleSyncYouTube}
            disabled={syncing}
            className="bg-red-700 hover:bg-red-800 text-white px-3.5 py-2 rounded-[var(--radius)] font-mono text-[0.75rem] cursor-pointer flex items-center gap-1.5 transition-colors font-medium shadow-2xs"
            title="Auto-fetch latest videos from YouTube RSS feed"
          >
            <span>{syncing ? '⏳ Syncing...' : '▶ Sync from YouTube'}</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="bg-[var(--accent)] hover:bg-[var(--ink)] text-white px-4 py-2 rounded-[var(--radius)] font-mono text-[0.75rem] cursor-pointer transition-colors font-medium shadow-2xs"
          >
            + Add Video
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2.5 rounded font-mono text-[0.8125rem]">
          ✓ {message}
        </div>
      )}

      {/* Editor Modal */}
      {editingPodcast && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius-lg)] max-w-xl w-full p-6 my-auto shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-4">
              <h2 className="font-serif text-[1.25rem] text-[var(--ink)]">
                {isNew ? 'Add Video / Podcast' : 'Edit Video Details'}
              </h2>
              <button
                onClick={() => setEditingPodcast(null)}
                className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--rule)] flex items-center justify-center text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Video Title *</label>
                <input
                  type="text"
                  required
                  value={editingPodcast.title}
                  onChange={(e) => setEditingPodcast({ ...editingPodcast, title: e.target.value })}
                  placeholder="e.g. From Scratch to Top 1% Developer"
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">YouTube Video ID / URL *</label>
                  <input
                    type="text"
                    required
                    value={editingPodcast.id}
                    onChange={(e) => {
                      const val = e.target.value;
                      let cleanId = val;
                      if (val.includes('v=')) {
                        cleanId = val.split('v=')[1].split('&')[0];
                      } else if (val.includes('youtu.be/')) {
                        cleanId = val.split('youtu.be/')[1].split('?')[0];
                      }
                      setEditingPodcast({ ...editingPodcast, id: cleanId });
                    }}
                    placeholder="e.g. dQw4w9WgXcQ"
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)] font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Show / Section</label>
                  <select
                    value={editingPodcast.show || 'Career Crackerz'}
                    onChange={(e) => setEditingPodcast({ ...editingPodcast, show: e.target.value })}
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
                  >
                    <option value="Career Crackerz">Career Crackerz Podcast</option>
                    <option value="Borderless Bangladeshi">Borderless Bangladeshi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Guest Name</label>
                  <input
                    type="text"
                    value={editingPodcast.guest}
                    onChange={(e) => setEditingPodcast({ ...editingPodcast, guest: e.target.value })}
                    placeholder="e.g. Nahid Bin Azhar"
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Category / Tag</label>
                  <input
                    type="text"
                    value={editingPodcast.tag}
                    onChange={(e) => setEditingPodcast({ ...editingPodcast, tag: e.target.value })}
                    placeholder="e.g. Career Resilience"
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Date</label>
                  <input
                    type="text"
                    value={editingPodcast.date}
                    onChange={(e) => setEditingPodcast({ ...editingPodcast, date: e.target.value })}
                    placeholder="e.g. Jan 10, 2026"
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)] font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[var(--rule)] pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingPodcast(null)}
                  className="px-4 py-2 border border-[var(--rule)] rounded font-mono text-[0.8125rem] cursor-pointer hover:bg-[var(--surface)]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 rounded font-mono text-[0.8125rem] transition-all cursor-pointer font-medium bg-[var(--ink)] hover:bg-[var(--accent)] text-white shadow-2xs"
                >
                  Save Podcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Bar & Pagination Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search podcasts by title, guest, or show..."
            className="w-full bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-4 py-2.5 text-[0.875rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
          />
        </div>

        <div className="font-mono text-[0.75rem] text-[var(--ink-muted)] shrink-0">
          Showing <span className="font-semibold text-[var(--ink)]">{filteredPodcasts.length === 0 ? 0 : startIndex + 1}–{endIndex}</span> of <span className="font-semibold text-[var(--ink)]">{filteredPodcasts.length}</span> episodes (10 per page)
        </div>
      </div>

      {/* Grid of Podcasts */}
      {filteredPodcasts.length === 0 ? (
        <div className="p-12 text-center font-mono text-[0.875rem] text-[var(--ink-muted)] bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)]">
          {search ? 'No podcasts match your search filter.' : 'No podcasts recorded yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {currentPodcasts.map((pod) => (
            <div key={pod.id} className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden flex flex-col justify-between shadow-2xs hover:border-[var(--ink)]/40 transition-colors">
              <div className="aspect-video bg-black relative">
                <img
                  src={`https://img.youtube.com/vi/${pod.id}/hqdefault.jpg`}
                  alt={pod.title}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-2 left-2 font-mono text-[0.625rem] px-2 py-0.5 rounded shadow-sm text-white font-medium ${
                  pod.show === 'Borderless Bangladeshi' ? 'bg-blue-900/90' : 'bg-black/80'
                }`}>
                  {pod.show || 'Career Crackerz'}
                </span>
              </div>

              <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                <div>
                  <span className="font-mono text-[0.6875rem] text-[var(--accent)] block">
                    {pod.guest} · {pod.date}
                  </span>
                  <h3 className="font-serif text-[1rem] text-[var(--ink)] line-clamp-2 mt-1 font-medium">
                    {pod.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between border-t border-[var(--rule)] pt-3 mt-2 font-mono text-[0.75rem]">
                  <button
                    onClick={() => handleEdit(pod)}
                    className="text-[var(--accent)] hover:underline cursor-pointer font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pod.id)}
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 10-Item Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border border-[var(--rule)] bg-[var(--surface)] rounded-[var(--radius-lg)] font-mono text-[0.75rem]">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="border border-[var(--rule)] bg-[var(--bg)] hover:bg-[var(--surface)] px-3.5 py-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer transition-colors ${
                  safePage === pageNum
                    ? 'bg-[var(--ink)] text-[var(--bg)] font-bold'
                    : 'border border-[var(--rule)] bg-[var(--bg)] hover:border-[var(--ink)] text-[var(--ink)]'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="border border-[var(--rule)] bg-[var(--bg)] hover:bg-[var(--surface)] px-3.5 py-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
