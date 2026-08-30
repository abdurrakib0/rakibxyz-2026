import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
        .maybeSingle();

      if (!error && data) {
        const socialLinks = data.social_links || {};
        const socialMetrics =
          data.social_metrics ||
          data.socialMetrics ||
          socialLinks.metrics ||
          socialLinks.socialMetrics ||
          null;

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
          socialMetrics: socialMetrics,
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
      const socialLinksWithMetrics = {
        ...(updatedSiteInfo.socialLinks || {}),
        metrics: updatedSiteInfo.socialMetrics,
      };

      try {
        // First try upserting with both social_metrics and social_links
        const { error } = await supabaseAdmin.from('site_info').upsert({
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
          social_links: socialLinksWithMetrics,
          social_metrics: updatedSiteInfo.socialMetrics,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.warn('Supabase upsert with social_metrics column error, using social_links.metrics fallback:', error.message);
          // Fallback without social_metrics column in case column is not yet created in Supabase
          const { error: fallbackError } = await supabaseAdmin.from('site_info').upsert({
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
            social_links: socialLinksWithMetrics,
            updated_at: new Date().toISOString(),
          });

          if (fallbackError) {
            console.error('Supabase fallback upsert error:', fallbackError);
          }
        }
      } catch (e) {
        console.error('Supabase exception updating site-info:', e);
      }
    }

    const db = getDatabase();
    db.siteInfo = {
      ...db.siteInfo,
      ...updatedSiteInfo,
    };

    saveDatabase(db);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/admin/site-info', 'page');
    } catch (err) {
      console.warn('revalidatePath warning:', err);
    }

    return NextResponse.json({ success: true, siteInfo: db.siteInfo });
  } catch (error: any) {
    console.error('API PUT site-info error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update site info' },
      { status: 500 }
    );
  }
}
