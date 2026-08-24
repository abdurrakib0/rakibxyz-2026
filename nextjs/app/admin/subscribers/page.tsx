'use client';

import React, { useEffect, useState } from 'react';
import { Subscriber } from '@/lib/data';

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editError, setEditError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscribers');
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

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
    const cleanEmail = editEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setEditError('Email address cannot be empty.');
      return;
    }

    if (!GMAIL_REGEX.test(cleanEmail)) {
      setEditError('Please enter a valid @gmail.com address.');
      return;
    }

    setSavingId(id);
    setEditError('');

    try {
      const res = await fetch('/api/subscribers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email: cleanEmail }),
      });

      const data = await res.json();
      if (data.success) {
        setSubscribers((prev) =>
          prev.map((s) => (s.id === id ? { ...s, email: cleanEmail } : s))
        );
        setStatusMessage(`Successfully updated subscriber to "${cleanEmail}"`);
        setTimeout(() => setStatusMessage(''), 4000);
        handleCancelEdit();
      } else {
        setEditError(data.message || 'Failed to update subscriber');
      }
    } catch (err) {
      setEditError('Error updating subscriber. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove "${email}" from the subscriber list?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/subscribers?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSubscribers((prev) => prev.filter((s) => s.id !== id));
        setStatusMessage(`Successfully removed ${email}`);
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        alert(data.message || 'Failed to delete subscriber');
      }
    } catch (err) {
      alert('Error deleting subscriber');
    } finally {
      setDeletingId(null);
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

  // Export to Excel (.xls HTML table format compatible with Excel / Numbers / Google Sheets)
  const handleExportExcel = () => {
    if (subscribers.length === 0) {
      alert('No subscribers to export.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Subscribers</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
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

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header & Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal tracking-tight">
            Newsletter Subscribers
          </h1>
          <p className="font-mono text-[0.8125rem] text-[var(--ink-muted)] mt-1">
            Real-time subscriber records stored in Supabase cloud database
          </p>
        </div>

        {/* Action Buttons: Export CSV & Excel */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchSubscribers}
            disabled={loading}
            className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3 py-2 rounded-[var(--radius)] font-mono text-[0.75rem] text-[var(--ink)] cursor-pointer transition-colors"
            title="Refresh list"
          >
            {loading ? 'Refreshing...' : '↻ Refresh Live'}
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
            className="bg-[var(--ink)] hover:bg-[var(--accent)] text-[var(--bg)] px-4 py-2 rounded-[var(--radius)] font-mono text-[0.75rem] cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="8" y1="13" x2="16" y2="13"></line>
              <line x1="8" y1="17" x2="16" y2="17"></line>
            </svg>
            <span>Export Excel (.xls)</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem]">
          ✓ {statusMessage}
        </div>
      )}

      {/* Metrics Band */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--rule)] p-5 rounded-[var(--radius-lg)]">
          <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] block">
            Total Subscribers
          </span>
          <span className="font-serif text-[2rem] text-[var(--ink)] block mt-1">
            {subscribers.length}
          </span>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--rule)] p-5 rounded-[var(--radius-lg)]">
          <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] block">
            Database Status
          </span>
          <span className="font-mono text-[1rem] text-[var(--accent)] block mt-2 font-medium">
            Supabase PostgreSQL
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

      {/* Search Bar */}
      <div className="relative w-full">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter subscribers by email address..."
          className="w-full bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-4 py-2.5 text-[0.875rem] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] font-mono"
        />
      </div>

      {/* Subscribers Table */}
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center font-mono text-[0.875rem] text-[var(--ink-muted)]">
            Loading subscriber data...
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="p-8 text-center font-mono text-[0.875rem] text-[var(--ink-muted)]">
            {search ? 'No subscribers match your search filter.' : 'No subscribers recorded yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-[0.8125rem]">
              <thead>
                <tr className="border-b border-[var(--rule)] bg-[var(--bg)] text-[var(--ink-muted)] text-[0.6875rem] uppercase tracking-wider">
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Subscribed Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {filteredSubscribers.map((sub, index) => {
                  const isEditing = editingId === sub.id;

                  return (
                    <tr key={sub.id} className="hover:bg-[var(--bg)] transition-colors">
                      <td className="py-3.5 px-4 text-[var(--ink-muted)]">{index + 1}</td>
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
                              placeholder="name@gmail.com"
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
                          <a href={`mailto:${sub.email}`} className="no-underline hover:text-[var(--accent)]">
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
                              disabled={savingId === sub.id}
                              className="text-green-700 hover:text-green-900 font-bold text-[0.75rem] font-mono cursor-pointer border-0 bg-transparent"
                            >
                              {savingId === sub.id ? 'Saving...' : 'Save'}
                            </button>
                            <span className="text-[var(--rule)]">|</span>
                            <button
                              onClick={handleCancelEdit}
                              disabled={savingId === sub.id}
                              className="text-[var(--ink-muted)] hover:text-[var(--ink)] text-[0.75rem] font-mono cursor-pointer border-0 bg-transparent"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleStartEdit(sub)}
                              className="text-[var(--ink)] hover:text-[var(--accent)] text-[0.75rem] font-mono cursor-pointer border-0 bg-transparent"
                            >
                              Edit
                            </button>
                            <span className="text-[var(--rule)]">|</span>
                            <button
                              onClick={() => handleDelete(sub.id, sub.email)}
                              disabled={deletingId === sub.id}
                              className="text-red-600 hover:text-red-800 text-[0.75rem] font-mono cursor-pointer border-0 bg-transparent"
                            >
                              {deletingId === sub.id ? 'Deleting...' : 'Delete'}
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
      </div>
    </div>
  );
}
