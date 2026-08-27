'use client';

import React, { useState, useEffect } from 'react';
import { Recommendation } from '@/lib/data';

export default function AdminRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Recommendation | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommendations', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRecommendations(data.recommendations || []);
        }
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleCreateNew = () => {
    const newItem: Recommendation = {
      id: `rec_${Date.now()}`,
      name: '',
      role: '',
      company: '',
      avatarUrl: '',
      content: '',
      linkedinUrl: '',
      relation: '',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
      sortOrder: recommendations.length + 1,
    };
    setEditingItem(newItem);
    setIsNew(true);
    setSaveStatus('idle');
  };

  const handleEdit = (item: Recommendation) => {
    setEditingItem({ ...item });
    setIsNew(false);
    setSaveStatus('idle');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the recommendation from "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/recommendations?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setRecommendations((prev) => prev.filter((r) => r.id !== id));
        setStatusMessage(`Successfully deleted recommendation from ${name}`);
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        alert(data.message || 'Failed to delete recommendation');
      }
    } catch (err) {
      alert('Error deleting recommendation');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.name.trim() || !editingItem.role.trim() || !editingItem.content.trim()) {
      alert('Please fill in Name, Role/Headline, and Recommendation Content.');
      return;
    }

    setSaveStatus('saving');

    try {
      const method = isNew ? 'POST' : 'PATCH';
      const res = await fetch('/api/recommendations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus('success');
        setStatusMessage(isNew ? 'New recommendation added!' : 'Recommendation updated successfully!');
        setTimeout(() => setStatusMessage(''), 4000);
        setEditingItem(null);
        fetchRecommendations();
      } else {
        setSaveStatus('error');
        alert(data.message || 'Failed to save recommendation');
      }
    } catch (err) {
      setSaveStatus('error');
      alert('Network error while saving recommendation');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal tracking-tight">
            LinkedIn Endorsements &amp; Recommendations
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-muted)] mt-1">
            Manage testimonials displayed in the &ldquo;What Industry Leaders Say&rdquo; horizontal carousel.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3.5 py-2.5 rounded-[var(--radius)] font-mono text-[0.75rem] text-[var(--ink)] cursor-pointer transition-colors"
          >
            ↻ Refresh
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-[var(--accent)] hover:bg-[var(--ink)] text-white px-4.5 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] cursor-pointer transition-colors flex items-center gap-1.5 font-medium shadow-2xs"
          >
            <span>+ Add Endorsement</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-[var(--radius)] font-mono text-[0.8125rem] flex items-center gap-2">
          <span>✓</span>
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Editor Modal Dialog Overlay */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius-lg)] max-w-2xl w-full p-6 md:p-8 my-auto shadow-2xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-4">
              <h2 className="font-serif text-[1.5rem] text-[var(--ink)] font-normal">
                {isNew ? 'Add LinkedIn Endorsement' : `Edit Endorsement: ${editingItem.name}`}
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--rule)] flex items-center justify-center text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="e.g. Jhankar Mahbub"
                    className="w-full bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider font-medium">
                    Date Published
                  </label>
                  <input
                    type="text"
                    value={editingItem.date || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                    placeholder="e.g. October 05, 2021"
                    className="w-full bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
                  />
                </div>
              </div>

              {/* Headline / Designation */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider font-medium">
                  Headline / Designation (shown in bold) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.role}
                  onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                  placeholder="e.g. Chief Executive Officer @ Programming Hero | Developer | Education Entrepreneur"
                  className="w-full bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Avatar Image URL with Live Preview */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider font-medium">
                    Avatar Photo URL (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="url"
                      value={editingItem.avatarUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, avatarUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-2 text-[0.8125rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
                    />
                    {editingItem.avatarUrl ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--rule)] shrink-0 bg-white">
                        <img
                          src={editingItem.avatarUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.opacity = '0.3';
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* LinkedIn URL */}
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider font-medium">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={editingItem.linkedinUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-2 text-[0.8125rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
                  />
                </div>
              </div>

              {/* Recommendation Content */}
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider font-medium">
                  Endorsement Statement / Quote *
                </label>
                <textarea
                  required
                  rows={6}
                  value={editingItem.content}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  placeholder="Paste the full LinkedIn recommendation statement here..."
                  className="w-full bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] p-3.5 text-[0.9375rem] text-[var(--ink)] leading-relaxed focus:outline-none focus:border-[var(--accent)] font-sans"
                />
              </div>

              {/* Submit & Cancel Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-[var(--rule)] pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-[var(--rule)] rounded font-mono text-[0.8125rem] cursor-pointer hover:bg-[var(--surface)]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className={`px-6 py-2.5 rounded font-mono text-[0.8125rem] transition-all duration-200 cursor-pointer flex items-center gap-1.5 font-medium ${
                    saveStatus === 'saving'
                      ? 'bg-[var(--ink)] text-white opacity-80 cursor-wait'
                      : saveStatus === 'success'
                      ? 'bg-emerald-600 text-white'
                      : saveStatus === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-[var(--ink)] hover:bg-[var(--accent)] text-white'
                  }`}
                >
                  {saveStatus === 'saving'
                    ? 'Saving...'
                    : isNew
                    ? 'Save Endorsement'
                    : 'Update Endorsement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center font-mono text-[0.875rem] text-[var(--ink-muted)]">
            Loading endorsements...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 text-center font-mono text-[0.875rem] text-[var(--ink-muted)] flex flex-col items-center gap-3">
            <span>No endorsements found.</span>
            <button
              onClick={handleCreateNew}
              className="bg-[var(--accent)] text-white px-4 py-2 rounded text-xs font-mono"
            >
              + Add First Endorsement
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--rule)]">
            {recommendations.map((item, idx) => (
              <div
                key={item.id}
                className="p-6 hover:bg-[var(--bg)] transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6"
              >
                <div className="flex items-start gap-4 flex-1">
                  <span className="font-mono text-[0.75rem] text-[var(--ink-muted)] w-6 pt-1">
                    #{idx + 1}
                  </span>

                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border border-[var(--rule)] bg-white shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--ink)] text-[var(--bg)] font-mono text-[0.875rem] font-bold flex items-center justify-center shrink-0">
                      {item.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-[1.125rem] text-[var(--ink)] font-semibold">
                        {item.name}
                      </h3>
                      {item.date && (
                        <span className="text-[0.75rem] text-[var(--ink-muted)] font-mono">
                          · {item.date}
                        </span>
                      )}
                      {item.linkedinUrl && (
                        <a
                          href={item.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0A66C2] text-xs font-mono no-underline hover:underline inline-flex items-center gap-0.5 ml-1"
                        >
                          <span>LinkedIn</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>

                    <p className="text-[0.8125rem] font-semibold text-[var(--ink)] mt-1 line-clamp-2">
                      {item.role}
                    </p>

                    <p className="text-[0.875rem] text-[var(--ink)]/90 mt-2.5 leading-relaxed whitespace-pre-line bg-[var(--surface)] p-3.5 rounded border border-[var(--rule)] line-clamp-3">
                      &ldquo;{item.content}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="border border-[var(--rule)] bg-[var(--bg)] hover:border-[var(--ink)] px-3.5 py-1.5 rounded font-mono text-[0.75rem] text-[var(--ink)] cursor-pointer transition-colors font-medium shadow-2xs"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    disabled={deletingId === item.id}
                    className="border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded font-mono text-[0.75rem] text-red-700 cursor-pointer transition-colors"
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
