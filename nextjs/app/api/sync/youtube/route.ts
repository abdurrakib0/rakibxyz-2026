import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';
import { getDatabase, saveDatabase, Podcast } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// Playlist IDs
const PLAYLISTS = [
  { id: 'PLK1lqIVem4B0', show: 'Borderless Bangladeshi', tag: 'Global Career' },
  { id: 'PLMq1yVf8pLJY', show: 'Career Crackerz Podcast', tag: 'Tech & Career' },
];

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export async function POST() {
  try {
    // Initialize YouTube.js (no API key needed — uses YouTube's internal InnerTube API)
    const yt = await Innertube.create({
      generate_session_locally: true,
    });

    const db = getDatabase();
    const existingIds = new Set(db.podcasts.map((p) => p.id));
    const newPodcasts: Podcast[] = [];
    let subscriberCount: string | null = null;

    // ── Fetch subscriber count from channel ──────────────
    try {
      const channel = await yt.getChannel('@abdurrakib0');
      const subText = (channel as any)?.metadata?.subscriber_count_text
        || (channel as any)?.header?.subscriber_count?.text
        || null;

      if (subText) {
        // Clean up: "25.4K subscribers" → "25.4K+"
        const cleaned = subText.replace(/\s*subscribers?/i, '').trim();
        if (cleaned) subscriberCount = cleaned + '+';
      }
    } catch (err) {
      console.warn('[YouTube Sync] Could not fetch subscriber count:', err);
    }

    // ── Fetch each playlist ───────────────────────────────
    for (const playlist of PLAYLISTS) {
      try {
        const playlistData = await yt.getPlaylist(playlist.id);
        const videos = playlistData.videos || [];

        for (const video of videos) {
          const v = video as any;

          // Extract video ID
          const videoId: string =
            v?.id ||
            v?.video_id ||
            v?.endpoint?.payload?.videoId ||
            v?.navigationEndpoint?.watchEndpoint?.videoId ||
            '';

          if (!videoId || existingIds.has(videoId)) continue;

          // Extract title
          const title: string =
            v?.title?.text ||
            v?.title?.toString?.() ||
            v?.headline?.text ||
            'Untitled';

          // Extract date
          const rawDate: string =
            v?.published?.text ||
            v?.video_info?.runs?.[0]?.text ||
            '';

          // Extract duration
          const duration: string =
            v?.duration?.text ||
            v?.length_text?.text ||
            '';

          const podcast: Podcast = {
            id: videoId,
            title,
            guest: '', // YouTube doesn't expose guest name — admin can fill in
            date: formatDate(rawDate),
            tag: playlist.tag,
            show: playlist.show,
            youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
          };

          newPodcasts.push(podcast);
          existingIds.add(videoId);
        }
      } catch (err) {
        console.error(`[YouTube Sync] Error fetching playlist ${playlist.id}:`, err);
      }
    }

    // ── Persist new podcasts ──────────────────────────────
    if (newPodcasts.length > 0) {
      // Prepend newest at the top
      db.podcasts = [...newPodcasts, ...db.podcasts];
      saveDatabase(db);

      // Upsert to Supabase if configured
      if (isSupabaseConfigured() && supabaseAdmin) {
        try {
          const rows = newPodcasts.map((p) => ({
            id: p.id,
            title: p.title,
            guest: p.guest,
            date: p.date,
            tag: p.tag,
            show: p.show,
            youtube_url: p.youtubeUrl,
          }));
          await supabaseAdmin.from('podcasts').upsert(rows, { onConflict: 'id' });
        } catch (err) {
          console.warn('[YouTube Sync] Supabase upsert error:', err);
        }
      }
    }

    // ── Persist subscriber count if fetched ──────────────
    if (subscriberCount) {
      db.siteInfo.socialMetrics = {
        ...(db.siteInfo.socialMetrics || {}),
        youtubeSubscribers: subscriberCount,
      };
      saveDatabase(db);
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/admin/podcasts');
    } catch (_) {}

    return NextResponse.json({
      success: true,
      addedCount: newPodcasts.length,
      subscriberCount,
      message:
        newPodcasts.length > 0
          ? `Synced ${newPodcasts.length} new video(s) from YouTube playlists.`
          : 'All videos already up to date. No new videos found.',
    });
  } catch (error: any) {
    console.error('[YouTube Sync] Fatal error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'YouTube sync failed' },
      { status: 500 }
    );
  }
}

// GET: Quick check — returns current podcast count + sync status
export async function GET() {
  const db = getDatabase();
  return NextResponse.json({
    totalPodcasts: db.podcasts.length,
    playlists: PLAYLISTS.map((p) => ({ id: p.id, show: p.show })),
    lastSynced: new Date().toISOString(),
  });
}
