import { NextResponse } from 'next/server';
import { getDatabase, saveDatabase, Podcast } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { fetchPlaylistRss } from '@/lib/youtube-playlists';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const PLAYLISTS = [
  { id: 'PLMq1yVf8pLJY', show: 'Career Crackerz Podcast', tag: 'Tech & Career' },
  { id: 'PLK1lqIVem4B0', show: 'Borderless Bangladeshi', tag: 'Global Career' },
];

export async function POST() {
  try {
    const db = getDatabase();
    const existingIds = new Set(db.podcasts.map((p) => p.id));
    const newPodcasts: Podcast[] = [];

    // 1. Fetch each playlist using reliable YouTube RSS feed
    for (const playlist of PLAYLISTS) {
      try {
        const videos = await fetchPlaylistRss(playlist.id, playlist.show, playlist.tag, 20);

        for (const v of videos) {
          if (!v.id || existingIds.has(v.id)) continue;

          const podcast: Podcast = {
            id: v.id,
            title: v.title,
            guest: v.guest || '',
            date: v.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            tag: v.tag || playlist.tag,
            show: playlist.show,
            youtubeUrl: v.url || `https://www.youtube.com/watch?v=${v.id}`,
          };

          newPodcasts.push(podcast);
          existingIds.add(v.id);
        }
      } catch (err) {
        console.error(`[YouTube Sync] Error fetching playlist ${playlist.id}:`, err);
      }
    }

    // 2. Persist new podcasts to local database
    if (newPodcasts.length > 0) {
      db.podcasts = [...newPodcasts, ...db.podcasts];
      saveDatabase(db);

      // 3. Persist to Supabase if configured
      if (isSupabaseConfigured() && supabaseAdmin) {
        try {
          const rows = newPodcasts.map((p) => ({
            id: p.id,
            title: p.title,
            guest: p.guest || '',
            date: p.date,
            tag: p.tag,
            youtube_url: p.youtubeUrl,
          }));
          await supabaseAdmin.from('podcasts').upsert(rows, { onConflict: 'id' });
        } catch (err) {
          console.warn('[YouTube Sync] Supabase upsert error:', err);
        }
      }
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/admin/podcasts', 'page');
    } catch (_) {}

    return NextResponse.json({
      success: true,
      addedCount: newPodcasts.length,
      totalCount: db.podcasts.length,
      message:
        newPodcasts.length > 0
          ? `Synced ${newPodcasts.length} new video(s) from YouTube playlists!`
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

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({
    totalPodcasts: db.podcasts.length,
    playlists: PLAYLISTS.map((p) => ({ id: p.id, show: p.show })),
    lastSynced: new Date().toISOString(),
  });
}
