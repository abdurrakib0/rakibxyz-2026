import React from 'react';
import { getDatabaseAsync } from '@/lib/data';
import PodcastsClient from './PodcastsClient';

export const dynamic = 'force-dynamic';

export default async function AdminPodcastsPage() {
  const db = await getDatabaseAsync();
  return <PodcastsClient initialPodcasts={db.podcasts || []} />;
}
