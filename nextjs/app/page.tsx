import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import StatsBand from '@/components/StatsBand';
import StatementSection from '@/components/StatementSection';
import PodcastSection from '@/components/PodcastSection';
import ExperienceSection from '@/components/ExperienceSection';
import NewsletterSection from '@/components/NewsletterSection';
import WritingSection from '@/components/WritingSection';
import Footer from '@/components/Footer';
import { getDatabaseAsync } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = await getDatabaseAsync();
  const { siteInfo, posts, podcasts, experience } = db;

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero siteInfo={siteInfo} />
        <StatsBand stats={siteInfo.stats} caption={siteInfo.statsCaption} />
        <StatementSection philosophy={siteInfo.philosophy} />
        <PodcastSection podcasts={podcasts} />
        <ExperienceSection experience={experience} />
        <NewsletterSection />
        <WritingSection posts={posts} />
      </main>
      <Footer siteInfo={siteInfo} />
    </div>
  );
}
