import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('site_info')
        .select('*')
        .eq('id', 'default')
        .single();

      if (!error && data) {
        return NextResponse.json({
          name: data.name,
          role: data.role,
          company: data.company,
          heroHeadline: data.hero_headline,
          heroBio: data.hero_bio,
          statsCaption: data.stats_caption,
          stats: data.stats,
          philosophy: data.philosophy,
          ecosystemLinks: data.ecosystem_links,
          socialLinks: data.social_links,
        });
      }
    } catch (e) {
      console.error('Supabase error fetching site-info:', e);
    }
  }

  const db = getDatabase();
  return NextResponse.json(db.siteInfo);
}

export async function PUT(req: NextRequest) {
  try {
    const updatedSiteInfo = await req.json();

    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        await supabaseAdmin.from('site_info').upsert({
          id: 'default',
          name: updatedSiteInfo.name,
          role: updatedSiteInfo.role,
          company: updatedSiteInfo.company,
          hero_headline: updatedSiteInfo.heroHeadline,
          hero_bio: updatedSiteInfo.heroBio,
          stats_caption: updatedSiteInfo.statsCaption,
          stats: updatedSiteInfo.stats,
          philosophy: updatedSiteInfo.philosophy,
          ecosystem_links: updatedSiteInfo.ecosystemLinks,
          social_links: updatedSiteInfo.socialLinks,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Supabase error updating site-info:', e);
      }
    }

    const db = getDatabase();
    db.siteInfo = {
      ...db.siteInfo,
      ...updatedSiteInfo,
    };

    saveDatabase(db);
    return NextResponse.json({ success: true, siteInfo: db.siteInfo });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update site info' }, { status: 500 });
  }
}
