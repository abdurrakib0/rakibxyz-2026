import React from 'react';
import { getDatabaseAsync } from '@/lib/data';
import SiteInfoClient from './SiteInfoClient';

export const dynamic = 'force-dynamic';

export default async function AdminSiteInfoPage() {
  const db = await getDatabaseAsync();
  return <SiteInfoClient initialSiteInfo={db.siteInfo} />;
}
