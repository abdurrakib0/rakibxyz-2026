import React from 'react';
import { getRecommendationsAsync } from '@/lib/data';
import RecommendationsClient from './RecommendationsClient';

export const dynamic = 'force-dynamic';

export default async function AdminRecommendationsPage() {
  const initialRecommendations = await getRecommendationsAsync();
  return <RecommendationsClient initialRecommendations={initialRecommendations} />;
}
