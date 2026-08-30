'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    // If we're on the homepage, perform smooth scroll
    if (isHomePage) {
      e.preventDefault();

      if (targetId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
        return;
      }

      const elem = document.getElementById(targetId);
      if (elem) {
        const offset = 40;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = elem.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });

        window.history.pushState(null, '', `/${targetId}`);
      }
    }
  };

  const closeMobileMenu = () => {
    const details = document.querySelector('.mobile-menu-details') as HTMLDetailsElement | null;
    if (details) {
      details.removeAttribute('open');
    }
  };

  return (
    <header>
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="Abdur Rakib - Home">
          <span className="logo-text">Abdur Rakib</span>
          <span className="logo-dot">.</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav" aria-label="Desktop Navigation">
          <Link
            href="/#home"
            onClick={(e) => handleNavClick(e, 'home')}
          >
            Home
          </Link>
          <Link
            href="/writing"
            className={pathname.startsWith('/writing') ? 'active-nav-link' : ''}
            style={pathname.startsWith('/writing') ? { color: 'var(--ink)', fontWeight: 600 } : undefined}
          >
            Writing
          </Link>
          <Link
            href="/#recommendations"
            onClick={(e) => handleNavClick(e, 'recommendations')}
          >
            Endorsements
          </Link>
          <Link
            href="/#podcast"
            onClick={(e) => handleNavClick(e, 'podcast')}
          >
            Podcast
          </Link>
          <Link
            href="/#experience"
            onClick={(e) => handleNavClick(e, 'experience')}
          >
            Experience
          </Link>
          <Link
            href="/#contact"
            onClick={(e) => handleNavClick(e, 'contact')}
          >
            Contact
          </Link>
        </nav>

        {/* Mobile Menu (Details Drawer) */}
        <details className="mobile-menu-details" aria-label="Mobile Navigation Menu">
          <summary className="menu-trigger" aria-label="Toggle navigation menu">
            <svg
              className="menu-icon-bars"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <svg
              className="menu-icon-close"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </summary>
          <div className="menu-content">
            <nav className="mobile-nav">
              <Link
                href="/#home"
                onClick={(e) => {
                  closeMobileMenu();
                  handleNavClick(e, 'home');
                }}
              >
                Home
              </Link>
              <Link
                href="/writing"
                onClick={closeMobileMenu}
                style={pathname.startsWith('/writing') ? { color: 'var(--ink)', fontWeight: 600 } : undefined}
              >
                Writing
              </Link>
              <Link
                href="/#recommendations"
                onClick={(e) => {
                  closeMobileMenu();
                  handleNavClick(e, 'recommendations');
                }}
              >
                Endorsements
              </Link>
              <Link
                href="/#podcast"
                onClick={(e) => {
                  closeMobileMenu();
                  handleNavClick(e, 'podcast');
                }}
              >
                Podcast
              </Link>
              <Link
                href="/#experience"
                onClick={(e) => {
                  closeMobileMenu();
                  handleNavClick(e, 'experience');
                }}
              >
                Experience
              </Link>
              <Link
                href="/#contact"
                onClick={(e) => {
                  closeMobileMenu();
                  handleNavClick(e, 'contact');
                }}
              >
                Contact
              </Link>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
