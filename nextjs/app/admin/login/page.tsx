'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/admin');
      } else {
        setError(data.message || 'Invalid password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-8 md:p-10 max-w-md w-full shadow-lg flex flex-col gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="font-serif text-[1.75rem] text-[var(--ink)] font-normal">
            Admin Portal
          </h1>
          <p className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)]">
            Abdur Rakib Personal Site CMS
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink)]">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (default: rakib2026)"
              required
              className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-2.5 text-[0.9375rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[var(--ink)] text-[var(--bg)] py-3 rounded-[var(--radius)] font-mono text-[0.875rem] uppercase tracking-wider hover:bg-[var(--accent)] transition-colors cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="text-center font-mono text-[0.75rem] text-[var(--ink-muted)] border-t border-[var(--rule)] pt-4">
          <a href="/" className="hover:text-[var(--ink)] no-underline">
            ← Return to live website
          </a>
        </div>
      </div>
    </div>
  );
}
