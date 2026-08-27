import React from 'react';
import { getDatabaseAsync } from '@/lib/data';
import WritingsClient from './WritingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminWritingsPage() {
  const db = await getDatabaseAsync();
  return <WritingsClient initialPosts={db.posts || []} />;
}
