import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/data';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const localDb = getDatabase();
    const currentMetrics = localDb.siteInfo.socialMetrics || {
      linkedinFollowers: '35,000+',
      linkedinLabel: 'Followers & Connections',
      youtubeSubscribers: '25,000+',
      youtubeLabel: 'Subscribers',
      facebookFollowers: '50,000+',
      facebookLabel: 'Followers',
    };

    let updatedMetrics = { ...currentMetrics };
    let youtubeUpdated = false;

    // 1. Fetch live YouTube subscribers for @abdurrakib0
    try {
      const ytRes = await fetch('https://www.youtube.com/@abdurrakib0', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        cache: 'no-store',
      });

      if (ytRes.ok) {
        const text = await ytRes.text();
        const match = text.match(/"subscriberCountText":\{"accessibility":\{"accessibilityData":\{"label":"([^"]+)"\}\},"simpleText":"([^"]+)"\}/);
        if (match && match[2]) {
          const subText = match[2].replace('subscribers', '').trim();
          if (subText) {
            updatedMetrics.youtubeSubscribers = subText;
            youtubeUpdated = true;
          }
        }
      }
    } catch (ytErr) {
      console.warn('YouTube scraping fallback error:', ytErr);
    }

    // 2. Save updated metrics to local JSON
    localDb.siteInfo.socialMetrics = updatedMetrics;
    saveDatabase(localDb);

    // 3. Save to Supabase if configured
    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        const socialLinksWithMetrics = {
          ...(localDb.siteInfo.socialLinks || {}),
          metrics: updatedMetrics,
        };

        const { error: updateErr } = await supabaseAdmin
          .from('site_info')
          .update({
            social_metrics: updatedMetrics,
            social_links: socialLinksWithMetrics,
          })
          .eq('id', 'default');

        if (updateErr) {
          // Fallback if social_metrics column doesn't exist
          await supabaseAdmin
            .from('site_info')
            .update({
              social_links: socialLinksWithMetrics,
            })
            .eq('id', 'default');
        }
      } catch (dbErr) {
        console.warn('Supabase site_info update error:', dbErr);
      }
    }

    try {
      revalidatePath('/');
      revalidatePath('/admin/site-info');
    } catch (e) {}

    return NextResponse.json({
      success: true,
      metrics: updatedMetrics,
      youtubeLive: youtubeUpdated,
      message: youtubeUpdated
        ? 'Live metrics refreshed successfully!'
        : 'Metrics saved and synced across all channels.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to sync social metrics' },
      { status: 500 }
    );
  }
}
