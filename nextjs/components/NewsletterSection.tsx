'use client';

import React, { useState } from 'react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      setMessage('Please provide a valid email address (e.g., yourname@gmail.com).');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribed(true);
      } else {
        setMessage(data.message || 'Subscription failed. Please try again.');
        setIsError(true);
      }
    } catch (err) {
      setMessage('Connection error. Please try again.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="newsletter-band">
      <div className="container newsletter-grid">
        <div className="newsletter-left">
          <span className="section-label">Newsletter</span>
          <h2 className="newsletter-title">One letter a month on systems, hiring, and the work</h2>
          <p className="newsletter-desc">
            A quiet essay delivered directly to your inbox on the third Wednesday of every month. Practical breakdowns on scaling tech talent, engineering culture, and leadership.
          </p>
        </div>

        <div className="newsletter-right">
          {subscribed ? (
            <div className="p-4 bg-white/80 border border-[var(--rule)] rounded-[var(--radius)] font-mono text-[0.875rem] text-[var(--ink)]">
              ✓ Thank you for subscribing! You will receive the next quiet essay.
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
              <input
                className={`newsletter-input ${isError ? '!border-red-500 ring-1 ring-red-500' : ''}`}
                type="email"
                placeholder="you@gmail.com"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (message) {
                    setMessage('');
                    setIsError(false);
                  }
                }}
                aria-label="Email address"
              />
              <button className="newsletter-button" type="submit" disabled={loading}>
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}

          {message && (
            <p className="font-mono text-xs text-red-600 mt-2 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{message}</span>
            </p>
          )}

          <p className="newsletter-caption">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" transform="translate(-2 -2) scale(0.8)"></rect>
              <path d="M7 9V7a3 3 0 0 1 6 0v2" transform="translate(-2 -2) scale(0.8)"></path>
            </svg>
            No course promotions. Unsubscribe in one click.
          </p>
        </div>
      </div>
    </section>
  );
}
