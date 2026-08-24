'use client';

import React, { useState } from 'react';
import { Podcast } from '@/lib/data';

interface PodcastSectionProps {
  podcasts: Podcast[];
}

export default function PodcastSection({ podcasts }: PodcastSectionProps) {
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);

  const openVideo = (id: string, title: string) => {
    setActiveVideo({ id, title });
    document.body.style.overflow = 'hidden';
  };

  const closeVideo = () => {
    setActiveVideo(null);
    document.body.style.overflow = '';
  };

  return (
    <>
      <section id="podcast" className="container">
        <div className="section-header">
          <div className="section-header-title-group">
            <span className="section-label">Podcast &amp; Keynotes</span>
            <h2 className="section-title">Conversations with people worth listening to</h2>
          </div>
          <a
            href="https://www.youtube.com/@abdurrakib0"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-playlist-link"
          >
            <span>Watch more</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>

        <div className="podcast-grid" id="podcastGrid">
          {podcasts.map((item) => (
            <article
              key={item.id}
              className="podcast-card"
              onClick={() => openVideo(item.id, item.title)}
              tabIndex={0}
              role="button"
              aria-label={`Play video: ${item.title}`}
            >
              <div className="podcast-thumbnail-wrap">
                <img
                  src={`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
                  alt={`${item.guest} Episode Thumbnail`}
                  className="podcast-thumb-img"
                  loading="lazy"
                />
                <div className="podcast-play-overlay">
                  <div className="podcast-play-btn">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <polygon points="6,4 20,12 6,20"></polygon>
                    </svg>
                  </div>
                </div>
                <span className="podcast-duration-badge">Career Crackerz</span>
              </div>
              <div className="podcast-details">
                <div className="podcast-category-row">
                  <span className="podcast-tag">{item.tag}</span>
                  <span className="podcast-meta-date">{item.guest}</span>
                </div>
                <h3 className="podcast-title">{item.title}</h3>
                <a
                  href={item.youtubeUrl || `https://www.youtube.com/watch?v=${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="podcast-bottom-meta"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Watch on YouTube</span>
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
                    <line x1="3" y1="8" x2="13" y2="8"></line>
                    <polyline points="9 4 13 8 9 12"></polyline>
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* YouTube Video Player Modal */}
      {activeVideo && (
        <div
          id="videoModalBackdrop"
          className="reading-modal-backdrop active"
          onClick={closeVideo}
        >
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn-close-modal"
              onClick={closeVideo}
              aria-label="Close video player"
            >
              ×
            </button>
            <div className="video-player-container">
              <iframe
                id="youtubeIframe"
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="video-modal-footer">
              <h3 id="videoModalTitle" className="video-modal-title">
                {activeVideo.title}
              </h3>
              <a
                id="videoModalDirectLink"
                href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-direct-yt"
              >
                <span>Open on YouTube App</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
