import React from 'react';
import { getSubscribersAsync } from '@/lib/data';
import SubscribersClient from './SubscribersClient';

export const dynamic = 'force-dynamic';

export default async function AdminSubscribersPage() {
  const initialSubscribers = await getSubscribersAsync();
  return <SubscribersClient initialSubscribers={initialSubscribers} />;
}
