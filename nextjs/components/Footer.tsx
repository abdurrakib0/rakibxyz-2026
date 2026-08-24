'use client';

import React from 'react';
import { SiteInfo } from '@/lib/data';

interface FooterProps {
  siteInfo: SiteInfo;
}

export default function Footer({ siteInfo }: FooterProps) {
  return (
    <footer id="contact" className="site-footer">
      <div className="container footer-inner">
        {/* Top / Main Footer Grid */}
        <div className="footer-top-grid">
          {/* Brand & Vision Column */}
          <div className="footer-col footer-brand-col">
            <a href="#home" className="footer-logo">{siteInfo.name}</a>
            <p className="footer-tagline">
              Chief Operating Officer at Programming Hero. Building operational systems for tech talent and scaling global placement infrastructure.
            </p>
          </div>

          {/* Initiatives / Ecosystem Column */}
          <div className="footer-col">
            <span className="footer-col-title">Ecosystem</span>
            <ul className="footer-links">
              <li>
                <a href="https://www.programming-hero.com/" target="_blank" rel="noopener noreferrer">
                  Programming Hero ↗
                </a>
              </li>
              <li>
                <a href="https://web.programming-hero.com/hero-union" target="_blank" rel="noopener noreferrer">
                  Graduation Ceremony ↗
                </a>
              </li>
              <li>
                <a href="https://www.programming-hero.com/ph-phitron-success" target="_blank" rel="noopener noreferrer">
                  Programming Hero Impact ↗
                </a>
              </li>
              <li>
                <a href="https://phitron.io/" target="_blank" rel="noopener noreferrer">
                  Phitron.io ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Connect & Social Column */}
          <div className="footer-col">
            <span className="footer-col-title">Connect</span>
            <p className="footer-connect-text">Follow updates on systems, hiring frameworks, and tech careers.</p>
            <div className="footer-social-icons">
              {/* LinkedIn */}
              <a
                href={siteInfo.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Abdur Rakib LinkedIn Profile"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={siteInfo.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Abdur Rakib Facebook Profile"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>

              {/* GitHub */}
              <a
                href={siteInfo.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Abdur Rakib GitHub Profile"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href={siteInfo.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Abdur Rakib YouTube Channel"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>

              {/* Email */}
              <a
                href={`mailto:${siteInfo.socialLinks.email}`}
                className="social-icon-btn"
                aria-label="Contact Abdur Rakib via Email"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © 2026 Abdur Rakib. Built with a quiet, editorial design system. All rights reserved.
          </div>
          <div className="footer-timezone">
            Dhaka, Bangladesh (UTC+6) · Systems &amp; Scale
          </div>
        </div>
      </div>
    </footer>
  );
}
