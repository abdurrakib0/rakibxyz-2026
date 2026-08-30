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
import { getYouTubePlaylists } from '@/lib/youtube-playlists';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function HomePage() {
  const [db, playlists] = await Promise.all([
    getDatabaseAsync(),
    getYouTubePlaylists(),
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
