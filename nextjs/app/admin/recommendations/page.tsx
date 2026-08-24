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
      id: '',
      name: '',
      role: '',
      company: '',
      avatarUrl: '',
      content: '',
      linkedinUrl: '',
      relation: '',
      date: new Date().getFullYear().toString(),
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
      alert('Please fill in Name, Role, and Recommendation Content.');
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
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal tracking-tight">
            LinkedIn Endorsements & Recommendations
          </h1>
          <p className="font-mono text-[0.8125rem] text-[var(--ink-muted)] mt-1">
            Manage testimonials displayed in the &ldquo;What Industry Leaders Say&rdquo; section
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3 py-2 rounded-[var(--radius)] font-mono text-[0.75rem] text-[var(--ink)] cursor-pointer transition-colors"
          >
            ↻ Refresh
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-[var(--ink)] hover:bg-[var(--accent)] text-[var(--bg)] px-4 py-2 rounded-[var(--radius)] font-mono text-[0.75rem] cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span>+ Add Recommendation</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem]">
          ✓ {statusMessage}
        </div>
      )}

      {/* Editor Modal / Form */}
      {editingItem && (
        <div className="bg-[var(--surface)] border-2 border-[var(--ink)] p-6 rounded-[var(--radius-lg)]">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-4 mb-6">
            <h2 className="font-serif text-[1.25rem] text-[var(--ink)]">
              {isNew ? 'Add New Recommendation' : `Edit Recommendation: ${editingItem.name}`}
            </h2>
            <button
              onClick={() => setEditingItem(null)}
              className="text-[var(--ink-muted)] hover:text-[var(--ink)] font-mono text-[0.8125rem] bg-transparent border-0 cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Jhankar Mahbub"
                  className="w-full bg-white border border-[var(--rule)] rounded-[var(--radius)] p-2.5 font-mono text-[0.8125rem] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* Role / Job Title */}
              <div>
                <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider block mb-1">
                  Role / Designation *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.role}
                  onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                  placeholder="e.g. Founder & CEO"
                  className="w-full bg-white border border-[var(--rule)] rounded-[var(--radius)] p-2.5 font-mono text-[0.8125rem] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* Company */}
              <div>
                <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider block mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={editingItem.company}
                  onChange={(e) => setEditingItem({ ...editingItem, company: e.target.value })}
                  placeholder="e.g. Programming Hero"
                  className="w-full bg-white border border-[var(--rule)] rounded-[var(--radius)] p-2.5 font-mono text-[0.8125rem] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* Avatar Image URL */}
              <div>
                <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider block mb-1">
                  Avatar Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingItem.avatarUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, avatarUrl: e.target.value })}
                  placeholder="https://... (or leave empty for initials fallback)"
                  className="w-full bg-white border border-[var(--rule)] rounded-[var(--radius)] p-2.5 font-mono text-[0.8125rem] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* LinkedIn URL */}
              <div>
                <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider block mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={editingItem.linkedinUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-white border border-[var(--rule)] rounded-[var(--radius)] p-2.5 font-mono text-[0.8125rem] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* Relationship */}
              <div>
                <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider block mb-1">
                  Relationship / Context
                </label>
                <input
                  type="text"
                  value={editingItem.relation || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, relation: e.target.value })}
                  placeholder="e.g. Managed Abdur directly at Programming Hero"
                  className="w-full bg-white border border-[var(--rule)] rounded-[var(--radius)] p-2.5 font-mono text-[0.8125rem] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider block mb-1">
                  Date / Year
                </label>
                <input
                  type="text"
                  value={editingItem.date || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                  placeholder="e.g. 2024 or Oct 2023"
                  className="w-full bg-white border border-[var(--rule)] rounded-[var(--radius)] p-2.5 font-mono text-[0.8125rem] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider block mb-1">
                  Display Sort Order
                </label>
                <input
                  type="number"
                  value={editingItem.sortOrder ?? 0}
                  onChange={(e) => setEditingItem({ ...editingItem, sortOrder: Number(e.target.value) })}
                  className="w-full bg-white border border-[var(--rule)] rounded-[var(--radius)] p-2.5 font-mono text-[0.8125rem] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>
            </div>

            {/* Recommendation Content */}
            <div>
              <label className="font-mono text-[0.75rem] text-[var(--ink)] uppercase tracking-wider block mb-1">
                Recommendation Text / Quote *
              </label>
              <textarea
                required
                rows={5}
                value={editingItem.content}
                onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                placeholder="Paste the full LinkedIn recommendation here..."
                className="w-full bg-white border border-[var(--rule)] rounded-[var(--radius)] p-3 font-serif text-[0.9375rem] text-[var(--ink)] leading-relaxed focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saveStatus === 'saving'}
                className="bg-[var(--ink)] hover:bg-[var(--accent)] text-[var(--bg)] px-5 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] cursor-pointer transition-colors"
              >
                {saveStatus === 'saving' ? 'Saving...' : isNew ? 'Save Recommendation' : 'Update Recommendation'}
              </button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="border border-[var(--rule)] hover:bg-[var(--bg)] px-4 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] text-[var(--ink-muted)] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center font-mono text-[0.875rem] text-[var(--ink-muted)]">
            Loading recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 text-center font-mono text-[0.875rem] text-[var(--ink-muted)]">
            No recommendations added yet. Click &ldquo;+ Add Recommendation&rdquo; to add your first endorsement.
          </div>
        ) : (
          <div className="divide-y divide-[var(--rule)]">
            {recommendations.map((item, idx) => (
              <div key={item.id} className="p-6 hover:bg-[var(--bg)] transition-colors flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <span className="font-mono text-[0.75rem] text-[var(--ink-muted)] w-6 pt-1">
                    #{idx + 1}
                  </span>

                  {item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border border-[var(--rule)] bg-white"
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

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-[1.125rem] text-[var(--ink)] font-medium">
                        {item.name}
                      </h3>
                      {item.linkedinUrl && (
                        <a
                          href={item.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0A66C2] text-xs font-mono no-underline hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>LinkedIn</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                    <p className="font-mono text-[0.75rem] text-[var(--ink-muted)] mt-0.5">
                      {item.role} {item.company ? `at ${item.company}` : ''}
                    </p>

                    {item.relation && (
                      <span className="inline-block mt-2 font-mono text-[0.6875rem] text-[var(--ink-muted)] bg-white px-2 py-0.5 rounded border border-[var(--rule)]">
                        {item.relation}
                      </span>
                    )}

                    <p className="font-serif text-[0.9375rem] text-[var(--ink)] mt-3 italic leading-relaxed whitespace-pre-line bg-white/60 p-3.5 rounded border border-[var(--rule)]">
                      &ldquo;{item.content}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-start">
                  <button
                    onClick={() => handleEdit(item)}
                    className="border border-[var(--rule)] bg-white hover:bg-[var(--bg)] px-3 py-1.5 rounded font-mono text-[0.75rem] text-[var(--ink)] cursor-pointer transition-colors"
                  >
                    Edit
                  </button>
                  <button
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
