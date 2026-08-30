'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Subscriber } from '@/lib/data';
import { validateEmail } from '@/lib/email-validator';

const ITEMS_PER_PAGE = 10;

interface SubscribersClientProps {
  initialSubscribers: Subscriber[];
}

export default function SubscribersClient({ initialSubscribers }: SubscribersClientProps) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers || []);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync with initialSubscribers prop changes
  useEffect(() => {
    if (initialSubscribers) {
      setSubscribers(initialSubscribers);
    }
  }, [initialSubscribers]);

  // Fetch live on mount
  useEffect(() => {
    fetchSubscribers();
  }, []);

  // Edit inline states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editError, setEditError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const fetchSubscribers = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/subscribers', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.subscribers)) {
        setSubscribers(data.subscribers);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStartEdit = (sub: Subscriber) => {
    setEditingId(sub.id);
    setEditEmail(sub.email);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditEmail('');
    setEditError('');
  };

  const handleSaveEdit = async (id: string) => {
    const validation = validateEmail(editEmail);

    if (!validation.isValid) {
      setEditError(validation.error || 'Please enter a valid email address.');
      return;
    }

    const cleanEmail = validation.cleanEmail || editEmail.trim().toLowerCase();

    // Instant optimistic update
    setSubscribers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, email: cleanEmail } : s))
    );
    setStatusMessage(`Updated subscriber to "${cleanEmail}"`);
    setTimeout(() => setStatusMessage(''), 3500);
    handleCancelEdit();

    try {
      await fetch('/api/subscribers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email: cleanEmail }),
      });
      router.refresh();
    } catch (err) {
      console.error('Error updating subscriber:', err);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove "${email}" from the subscriber list?`)) {
      return;
    }

    // Instant optimistic update
    setSubscribers((prev) =>
      prev.filter((s) => s.id !== id && s.email.toLowerCase() !== email.toLowerCase())
    );
    setStatusMessage(`Removed ${email}`);
    setTimeout(() => setStatusMessage(''), 3500);

    try {
      await fetch(`/api/subscribers?id=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      router.refresh();
    } catch (err) {
      console.error('Error deleting subscriber:', err);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export.');
      return;
    }

    const headers = ['Index', 'Email Address', 'Subscribed Date', 'Timestamp'];
    const rows = subscribers.map((sub, idx) => {
      const date = new Date(sub.created_at).toLocaleString();
      return [
        idx + 1,
        `"${sub.email}"`,
        `"${date}"`,
        `"${sub.created_at}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `abdur-rakib-newsletter-subscribers-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel (.xls HTML table format)
  const handleExportExcel = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      </head>
      <body>
        <table border="1">
          <thead>
            <tr style="background-color: #111110; color: #f9f9f8; font-weight: bold;">
              <th>#</th>
              <th>Email Address</th>
              <th>Subscribed Date</th>
              <th>Raw ISO Timestamp</th>
            </tr>
          </thead>
          <tbody>
            ${subscribers
              .map(
                (sub, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${sub.email}</td>
                <td>${new Date(sub.created_at).toLocaleString()}</td>
                <td>${sub.created_at}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `abdur-rakib-newsletter-subscribers-${today}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter & Pagination Calculations
  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredSubscribers.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredSubscribers.length);
  const currentSubscribers = filteredSubscribers.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal tracking-tight">
            Newsletter Subscribers
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-muted)] mt-1">
            Real-time newsletter audience synced across Supabase and local backup.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <button
            onClick={fetchSubscribers}
            disabled={isRefreshing}
            className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3 py-2 rounded-[var(--radius)] font-mono text-[0.75rem] text-[var(--ink)] cursor-pointer transition-colors"
            title="Refresh list"
          >
            {isRefreshing ? 'Refreshing...' : '↻ Refresh'}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={subscribers.length === 0}
            className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3.5 py-2 rounded-[var(--radius)] font-mono text-[0.75rem] text-[var(--ink)] cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={subscribers.length === 0}
            className="bg-[var(--ink)] hover:bg-[var(--accent)] text-[var(--bg)] px-4 py-2 rounded-[var(--radius)] font-mono text-[0.75rem] cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50 font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="8" y1="13" x2="16" y2="13"></line>
              <line x1="8" y1="17" x2="16" y2="17"></line>
            </svg>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] flex items-center gap-2">
          <span>✓</span>
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Metrics Band */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--rule)] p-5 rounded-[var(--radius-lg)]">
          <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] block">
            Total Subscribers
          </span>
          <span className="font-serif text-[2.25rem] text-[var(--ink)] block mt-1 leading-tight font-normal">
            {subscribers.length}
          </span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--rule)] p-5 rounded-[var(--radius-lg)]">
          <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] block">
            Database Status
          </span>
          <span className="font-mono text-[0.9375rem] text-emerald-700 block mt-2 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Supabase PostgreSQL Active
          </span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--rule)] p-5 rounded-[var(--radius-lg)]">
          <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] block">
            Latest Sign-up
          </span>
          <span className="font-mono text-[0.8125rem] text-[var(--ink)] block mt-2 truncate">
            {subscribers.length > 0
              ? new Date(subscribers[0].created_at).toLocaleDateString()
              : 'No signups yet'}
          </span>
        </div>
      </div>

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
            placeholder="Filter subscribers by email address..."
            className="w-full bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-4 py-2.5 text-[0.875rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
          />
        </div>

        <div className="font-mono text-[0.75rem] text-[var(--ink-muted)] shrink-0">
          Showing <span className="font-semibold text-[var(--ink)]">{filteredSubscribers.length === 0 ? 0 : startIndex + 1}–{endIndex}</span> of <span className="font-semibold text-[var(--ink)]">{filteredSubscribers.length}</span> entries (10 per page)
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden shadow-2xs">
        {filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center font-mono text-[0.875rem] text-[var(--ink-muted)]">
            {search ? 'No subscribers match your search filter.' : 'No subscribers recorded yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-[0.8125rem]">
              <thead>
                <tr className="border-b border-[var(--rule)] bg-[var(--bg)] text-[var(--ink-muted)] text-[0.6875rem] uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-14">#</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Subscribed Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {currentSubscribers.map((sub, index) => {
                  const globalIndex = startIndex + index + 1;
                  const isEditing = editingId === sub.id;

                  return (
                    <tr key={sub.id} className="hover:bg-[var(--bg)] transition-colors">
                      <td className="py-3.5 px-4 text-[var(--ink-muted)]">{globalIndex}</td>
                      <td className="py-3.5 px-4 text-[var(--ink)] font-medium">
                        {isEditing ? (
                          <div className="flex flex-col gap-1 max-w-md">
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => {
                                setEditEmail(e.target.value);
                                if (editError) setEditError('');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(sub.id);
                                if (e.key === 'Escape') handleCancelEdit();
                              }}
                              placeholder="name@domain.com"
                              autoFocus
                              className="bg-white border border-[var(--ink)] px-2.5 py-1 rounded text-[0.8125rem] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--ink)]"
                            />
                            {editError && (
                              <span className="text-red-600 text-[0.7rem] font-mono">
                                ⚠️ {editError}
                              </span>
                            )}
                          </div>
                        ) : (
                          <a href={`mailto:${sub.email}`} className="no-underline hover:text-[var(--accent)] text-[var(--ink)]">
                            {sub.email}
                          </a>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[var(--ink-muted)]">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSaveEdit(sub.id)}
                              className="text-green-700 hover:text-green-900 font-bold text-[0.75rem] font-mono cursor-pointer border-0 bg-transparent"
                            >
                              Save
                            </button>
                            <span className="text-[var(--rule)]">|</span>
                            <button
                              onClick={handleCancelEdit}
                              className="text-[var(--ink-muted)] hover:text-[var(--ink)] text-[0.75rem] font-mono cursor-pointer border-0 bg-transparent"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleStartEdit(sub)}
                              className="text-[var(--ink)] hover:text-[var(--accent)] text-[0.75rem] font-mono cursor-pointer border-0 bg-transparent font-medium"
                            >
                              Edit
                            </button>
                            <span className="text-[var(--rule)]">|</span>
                            <button
                              onClick={() => handleDelete(sub.id, sub.email)}
                              className="text-red-600 hover:text-red-800 text-[0.75rem] font-mono cursor-pointer border-0 bg-transparent"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 10-Item Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--rule)] bg-[var(--bg)] font-mono text-[0.75rem]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3 py-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
                      : 'border border-[var(--rule)] bg-[var(--surface)] hover:border-[var(--ink)] text-[var(--ink)]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3 py-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
