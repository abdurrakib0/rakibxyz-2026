import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import StatsBand from '@/components/StatsBand';
import StatementSection from '@/components/StatementSection';
import PodcastSection from '@/components/PodcastSection';
import ExperienceSection from '@/components/ExperienceSection';
import RecommendationsSection from '@/components/RecommendationsSection';
import WhereIShareSection from '@/components/WhereIShareSection';
import NewsletterSection from '@/components/NewsletterSection';
import WritingSection from '@/components/WritingSection';
import Footer from '@/components/Footer';
import { getDatabaseAsync } from '@/lib/data';
import type { PlaylistsResponse } from '@/app/api/playlists/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getPlaylistVideos(): Promise<PlaylistsResponse> {
  try {
    // Call our own API route which handles youtubei.js + caching
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/playlists`, {
      next: { revalidate: 3600 }, // cache for 1 hour server-side
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[page] Failed to fetch playlist videos:', err);
    return { careerCrackerz: [], borderlessBangladeshi: [], fetchedAt: new Date().toISOString() };
  }
}

export default async function HomePage() {
  // Fetch site data and YouTube playlists in parallel
  const [db, playlists] = await Promise.all([
    getDatabaseAsync(),
    getPlaylistVideos(),
  ]);

  const { siteInfo, posts, experience, recommendations } = db;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero siteInfo={siteInfo} />
        <StatsBand stats={siteInfo.stats} caption={siteInfo.statsCaption} />
        <StatementSection philosophy={siteInfo.philosophy} />
        <RecommendationsSection recommendations={recommendations} />
        <WhereIShareSection siteInfo={siteInfo} />
        <PodcastSection
          careerCrackerz={playlists.careerCrackerz}
          borderlessBangladeshi={playlists.borderlessBangladeshi}
        />
        <ExperienceSection experience={experience} />
        <NewsletterSection />
        <WritingSection posts={posts} />
      </main>
      <Footer siteInfo={siteInfo} />
    </div>
  );
}
