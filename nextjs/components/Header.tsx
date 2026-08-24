'use client';

import React from 'react';

export default function Header() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
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
        behavior: 'smooth'
      });

      window.history.pushState(null, '', `/${targetId}`);
    }
  };

  return (
    <header>
      <div className="container header-inner">
        <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="logo">
          Abdur Rakib
        </a>
        
        {/* Desktop Nav */}
        <nav className="desktop-nav" aria-label="Desktop Navigation">
          <a href="#home" onClick={(e) => handleNavClick(e, 'home')}>Home</a>
          <a href="#writing" onClick={(e) => handleNavClick(e, 'writing')}>Writing</a>
          <a href="#podcast" onClick={(e) => handleNavClick(e, 'podcast')}>Podcast</a>
          <a href="#experience" onClick={(e) => handleNavClick(e, 'experience')}>Experience</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
        </nav>

        {/* Mobile Menu (Details Drawer) */}
        <details className="mobile-menu-details" aria-label="Mobile Navigation Menu">
          <summary className="menu-trigger">menu</summary>
          <div className="menu-content">
            <nav className="mobile-nav">
              <a href="#home" onClick={(e) => handleNavClick(e, 'home')}>Home</a>
              <a href="#writing" onClick={(e) => handleNavClick(e, 'writing')}>Writing</a>
              <a href="#podcast" onClick={(e) => handleNavClick(e, 'podcast')}>Podcast</a>
              <a href="#experience" onClick={(e) => handleNavClick(e, 'experience')}>Experience</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
