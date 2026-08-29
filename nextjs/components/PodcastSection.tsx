'use client';

import React, { useState } from 'react';
import type { PlaylistVideo } from '@/app/api/playlists/route';

interface PodcastSectionProps {
  careerCrackerz: PlaylistVideo[];
  borderlessBangladeshi: PlaylistVideo[];
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="8" x2="13" y2="8" />
      <polyline points="9 4 13 8 9 12" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <polygon points="6,4 20,12 6,20" />
    </svg>
  );
}

/* ── Single video card ── */
function VideoCard({
  video,
  badgeLabel,
  onPlay,
}: {
  video: PlaylistVideo;
  badgeLabel: string;
  onPlay: (id: string, title: string) => void;
}) {
  return (
    <article
      className="podcast-card"
      onClick={() => onPlay(video.id, video.title)}
      tabIndex={0}
      role="button"
      aria-label={`Play: ${video.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onPlay(video.id, video.title)}
    >
      <div className="podcast-thumbnail-wrap">
        <img
          src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.title}
          className="podcast-thumb-img"
          loading="lazy"
        />
        <div className="podcast-play-overlay">
          <div className="podcast-play-btn">
            <PlayIcon />
          </div>
        </div>
        <span className="podcast-duration-badge">{badgeLabel}</span>
      </div>

      <div className="podcast-details">
        <div className="podcast-category-row">
          <span className="podcast-tag">{video.tag}</span>
        </div>
        <h3 className="podcast-title">{video.title}</h3>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="podcast-bottom-meta"
          onClick={(e) => e.stopPropagation()}
        >
          <span>Watch on YouTube</span>
          <ArrowRight />
        </a>
      </div>
    </article>
  );
}

/* ── Playlist sub-section ── */
function PlaylistSection({
  title,
  accentClass,
  playlistUrl,
  videos,
  badgeLabel,
  onPlay,
}: {
  title: string;
  accentClass: string;
  playlistUrl: string;
  videos: PlaylistVideo[];
  badgeLabel: string;
  onPlay: (id: string, title: string) => void;
}) {
  if (videos.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between border-b border-[var(--rule)] pb-4">
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${accentClass}`} />
          <h3 className="font-serif text-[1.5rem] sm:text-[1.75rem] text-[var(--ink)] font-normal tracking-tight">
            {title}
          </h3>
        </div>
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-playlist-link !py-1.5 !px-3 text-[0.75rem]"
        >
          <span>Watch more</span>
          <ExternalLinkIcon />
        </a>
      </div>

      <div className="podcast-grid">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} badgeLabel={badgeLabel} onPlay={onPlay} />
        ))}
      </div>
    </div>
  );
}

/* ── Main Section ── */
export default function PodcastSection({ careerCrackerz, borderlessBangladeshi }: PodcastSectionProps) {
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
      <section id="podcast" className="container space-y-12 md:space-y-16">
        {/* Header */}
        <div className="section-header">
          <div className="section-header-title-group">
            <span className="section-label">Media & Conversations</span>
            <h2 className="section-title">Podcast</h2>
          </div>
          <a
            href="https://www.youtube.com/@abdurrakib0"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-playlist-link"
          >
            <span>Watch more</span>
            <ExternalLinkIcon />
          </a>
        </div>

        {/* Career Crackerz */}
        <PlaylistSection
          title="Career Crackerz Podcast"
          accentClass="bg-[var(--accent)]"
          playlistUrl="https://www.youtube.com/playlist?list=PLMq1yVf8pLJY"
          videos={careerCrackerz}
          badgeLabel="Career Crackerz"
          onPlay={openVideo}
        />

        {/* Borderless Bangladeshi */}
        <PlaylistSection
          title="Borderless Bangladeshi"
          accentClass="bg-blue-700"
          playlistUrl="https://www.youtube.com/playlist?list=PLK1lqIVem4B0"
          videos={borderlessBangladeshi}
          badgeLabel="Borderless Bangladeshi"
          onPlay={openVideo}
        />
      </section>

      {/* YouTube Player Modal */}
      {activeVideo && (
        <div
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
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="video-modal-footer">
              <h3 className="video-modal-title">{activeVideo.title}</h3>
              <a
                href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-direct-yt"
              >
                <span>Open on YouTube App</span>
                <ExternalLinkIcon />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
