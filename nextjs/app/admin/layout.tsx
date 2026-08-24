'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    fetch('/api/auth')
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        } else {
          router.push('/admin/login');
        }
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <div className="min-h-screen bg-[var(--bg)]">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center font-mono text-[0.875rem] text-[var(--ink-muted)]">
        Verifying admin session...
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const navLinks = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Writings & Essays', href: '/admin/writings' },
    { name: 'Newsletter Subscribers', href: '/admin/subscribers' },
    { name: 'Site Info & Stats', href: '/admin/site-info' },
    { name: 'Podcasts & Videos', href: '/admin/podcasts' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[var(--surface)] border-b md:border-b-0 md:border-r border-[var(--rule)] p-6 flex flex-col justify-between">
        <div className="flex flex-col gap-8">
          <div>
            <Link href="/admin" className="font-serif text-[1.375rem] text-[var(--ink)] no-underline tracking-tight block">
              Rakib Admin
            </Link>
            <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--accent)] font-medium">
              CMS Management Portal
            </span>
          </div>

          <nav className="flex flex-col gap-1.5 font-mono text-[0.8125rem]">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2.5 rounded-[var(--radius)] no-underline transition-colors ${
                    active
                      ? 'bg-[var(--ink)] text-[var(--bg)] font-medium'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg)]'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[var(--rule)] flex flex-col gap-3 font-mono text-[0.75rem]">
          <Link href="/" target="_blank" className="text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline flex items-center gap-1">
            <span>View Live Site</span>
            <span>↗</span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-left text-red-600 hover:underline cursor-pointer bg-transparent border-0 p-0 font-mono text-[0.75rem]"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-6xl">
        {children}
      </main>
    </div>
  );
}
