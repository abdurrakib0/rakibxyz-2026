'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        setError(data.message || 'Invalid admin password. Please try again.');
      }
    } catch (err) {
      setError('Connection error. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 text-[var(--ink)] antialiased">
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-8 sm:p-10 max-w-md w-full shadow-md flex flex-col gap-6">
        {/* Brand Portrait & Title */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[var(--rule)] relative shadow-xs">
            <Image
              src="/img/Abdur Rakib Vaiya 2.JPG"
              alt="Abdur Rakib"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-serif text-[1.875rem] font-medium text-[var(--ink)] leading-tight tracking-tight">
              Executive Console
            </h1>
            <span className="font-mono text-[0.6875rem] uppercase tracking-widest text-[var(--accent)] font-semibold mt-1">
              Abdur Rakib · rakib.xyz CMS
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[var(--radius)] font-mono text-[0.8125rem] flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink)] font-medium">
              Admin Master Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
                className="w-full bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-3 text-[0.9375rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono pr-10 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[var(--ink-muted)] hover:text-[var(--ink)] cursor-pointer bg-transparent border-0 p-0 text-sm"
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[var(--ink)] text-[var(--bg)] py-3 rounded-[var(--radius)] font-mono text-[0.8125rem] uppercase tracking-wider font-semibold hover:bg-[var(--accent)] transition-colors cursor-pointer disabled:opacity-50 mt-2 shadow-2xs"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal →'}
          </button>
        </form>

        <div className="text-center font-mono text-[0.75rem] text-[var(--ink-muted)] border-t border-[var(--rule)] pt-4">
          <Link href="/" className="hover:text-[var(--ink)] text-[var(--ink-muted)] no-underline flex items-center justify-center gap-1">
            <span>← Return to live website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
