'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--rule)] border-t-[var(--accent)] animate-spin" />
        <span className="font-mono text-[0.8125rem] text-[var(--ink-muted)] tracking-wider uppercase">
          Verifying security credentials...
        </span>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      ),
    },
    {
      name: 'Writings & Essays',
      href: '/admin/writings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn Endorsements',
      href: '/admin/recommendations',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      name: 'Newsletter Subscribers',
      href: '/admin/subscribers',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
    },
    {
      name: 'Site Info & Stats',
      href: '/admin/site-info',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" x2="20" y1="21" y2="21" />
          <line x1="4" x2="20" y1="14" y2="14" />
          <line x1="4" x2="20" y1="7" y2="7" />
          <circle cx="8" cy="7" r="2" />
          <circle cx="16" cy="14" r="2" />
          <circle cx="10" cy="21" r="2" />
        </svg>
      ),
    },
    {
      name: 'Podcasts & Keynotes',
      href: '/admin/podcasts',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10 15 5-3-5-3v6Z" />
          <rect width="20" height="14" x="2" y="5" rx="2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[var(--bg)] flex flex-col md:flex-row text-[var(--ink)] antialiased">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[var(--surface)] border-b border-[var(--rule)] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--rule)] relative">
            <Image
              src="/img/Abdur Rakib Vaiya 2.JPG"
              alt="Abdur Rakib"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-[1.125rem] font-medium leading-none text-[var(--ink)]">
              Abdur Rakib
            </span>
            <span className="font-mono text-[0.625rem] uppercase tracking-wider text-[var(--accent)] mt-0.5">
              Admin Portal
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Sidebar Navigation (Fixed & Non-scrolling) */}
      <aside
        className={`${
          mobileMenuOpen ? 'flex' : 'hidden'
        } md:flex w-full md:w-72 bg-[var(--surface)] border-b md:border-b-0 md:border-r border-[var(--rule)] p-6 md:p-7 flex-col justify-between md:h-screen md:overflow-y-auto shrink-0 z-40`}
      >
        <div className="flex flex-col gap-8">
          {/* Brand Header */}
          <div className="hidden md:flex items-center gap-3.5 pb-6 border-b border-[var(--rule)]">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[var(--rule)] relative shrink-0 shadow-sm">
              <Image
                src="/img/Abdur Rakib Vaiya 2.JPG"
                alt="Abdur Rakib"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-[1.25rem] font-medium leading-none text-[var(--ink)] tracking-tight">
                Abdur Rakib
              </span>
              <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--accent)] font-semibold mt-1">
                Executive Portal
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1.5 font-mono text-[0.8125rem]">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-[var(--radius)] no-underline transition-all group ${
                    active
                      ? '!bg-[var(--ink)] !text-[var(--bg)] font-medium shadow-sm hover:!bg-[var(--ink)] hover:!text-[var(--bg)] cursor-default'
                      : '!text-[var(--ink-muted)] hover:!text-[var(--ink)] hover:!bg-[var(--bg)]/90'
                  }`}
                >
                  <span className={`${active ? '!text-[var(--accent)]' : '!text-[var(--ink-muted)] group-hover:!text-[var(--ink)]'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span className="tracking-tight">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-[var(--rule)] flex flex-col gap-3 font-mono text-[0.75rem] mt-6 md:mt-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-[var(--radius)] border border-[var(--rule)] bg-[var(--bg)] text-[var(--ink)] no-underline hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all group shadow-2xs"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Site</span>
            </span>
            <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--radius)] text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer border-0 font-mono text-[0.75rem] font-medium"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-6 sm:p-8 md:p-10 lg:p-12 w-full md:h-screen md:overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
