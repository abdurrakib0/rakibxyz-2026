'use client';

import React, { useState, useEffect } from 'react';
import { Podcast } from '@/lib/data';

export default function AdminPodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPodcasts = async () => {
    try {
      const res = await fetch('/api/podcasts');
      if (res.ok) {
        const data = await res.json();
        setPodcasts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const handleCreateNew = () => {
    const newPod: Podcast = {
      id: '',
      title: '',
      guest: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      tag: 'Tech & Career',
      youtubeUrl: '',
    };
    setEditingPodcast(newPod);
    setIsNew(true);
  };

  const handleEdit = (podcast: Podcast) => {
    setEditingPodcast({ ...podcast });
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this podcast card?')) return;
    try {
      const res = await fetch(`/api/podcasts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPodcasts(podcasts.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert('Failed to delete podcast');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPodcast) return;
    setSaving(true);
    setMessage('');

    try {
      const url = isNew ? '/api/podcasts' : `/api/podcasts/${editingPodcast.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPodcast),
      });

      if (res.ok) {
        setMessage('Podcast saved successfully!');
        setEditingPodcast(null);
        fetchPodcasts();
      } else {
        setMessage('Failed to save podcast.');
      }
    } catch (err) {
      setMessage('Error saving podcast.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="font-mono text-sm text-[var(--ink-muted)]">Loading podcasts...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--rule)] pb-6">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal">
            Podcasts & Videos Manager
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-muted)]">
            Manage YouTube podcast cards and in-site video modal playback.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="bg-[var(--accent)] text-white px-5 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] hover:bg-[var(--ink)] transition-colors cursor-pointer"
        >
          + Add YouTube Episode
        </button>
      </div>

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded font-mono text-xs">
          {message}
        </div>
      )}

      {/* Editor Form Modal */}
      {editingPodcast && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius-lg)] max-w-2xl w-full p-6 md:p-8 my-auto shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-4">
              <h2 className="font-serif text-[1.5rem] text-[var(--ink)] font-normal">
                {isNew ? 'Add YouTube Podcast' : 'Edit Podcast Details'}
              </h2>
              <button
                onClick={() => setEditingPodcast(null)}
                className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--rule)] flex items-center justify-center text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">
                  YouTube URL or Video ID
                </label>
                <input
                  type="text"
                  value={editingPodcast.youtubeUrl || editingPodcast.id}
                  onChange={(e) => {
                    const val = e.target.value;
                    const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                    const extractedId = match ? match[1] : val;
                    setEditingPodcast({
                      ...editingPodcast,
                      id: extractedId,
                      youtubeUrl: val.startsWith('http') ? val : `https://www.youtube.com/watch?v=${extractedId}`,
                    });
                  }}
                  placeholder="e.g. https://www.youtube.com/watch?v=NeRnnnRP1c0 or NeRnnnRP1c0"
                  required
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.875rem] text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {editingPodcast.id && (
                <div className="aspect-video max-w-xs bg-black rounded overflow-hidden border border-[var(--rule)]">
                  <img
                    src={`https://img.youtube.com/vi/${editingPodcast.id}/hqdefault.jpg`}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Title</label>
                <input
                  type="text"
                  value={editingPodcast.title}
                  onChange={(e) => setEditingPodcast({ ...editingPodcast, title: e.target.value })}
                  placeholder="Episode title..."
                  required
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.9375rem] text-[var(--ink)]"
                />
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
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded px-3 py-2 text-[0.875rem] text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[var(--rule)] pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingPodcast(null)}
                  className="px-4 py-2 border border-[var(--rule)] rounded font-mono text-[0.8125rem]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[var(--ink)] text-white px-6 py-2 rounded font-mono text-[0.8125rem] hover:bg-[var(--accent)] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Podcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Podcasts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {podcasts.map((pod) => (
          <div key={pod.id} className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden flex flex-col justify-between">
            <div className="aspect-video bg-black relative">
              <img
                src={`https://img.youtube.com/vi/${pod.id}/hqdefault.jpg`}
                alt={pod.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
              <div>
                <span className="font-mono text-[0.6875rem] text-[var(--accent)] block">
                  {pod.guest} · {pod.date}
                </span>
                <h3 className="font-serif text-[1rem] text-[var(--ink)] line-clamp-2 mt-1">
                  {pod.title}
                </h3>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--rule)] pt-3 mt-2 font-mono text-[0.75rem]">
                <button
                  onClick={() => handleEdit(pod)}
                  className="text-[var(--accent)] hover:underline cursor-pointer"
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
    </div>
  );
}
