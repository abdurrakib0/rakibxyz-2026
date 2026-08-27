import { NextResponse } from 'next/server';
import { fetchLatestYouTubeVideos } from '@/lib/youtube';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId') || process.env.YOUTUBE_CHANNEL_ID;

    const latestVideos = await fetchLatestYouTubeVideos(channelId || undefined);

    if (!latestVideos || latestVideos.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No videos found. Ensure YOUTUBE_CHANNEL_ID is configured or pass ?channelId=UC...',
        },
        { status: 400 }
      );
    }

    // If Supabase is connected, automatically upsert into podcasts table
    if (isSupabaseConfigured() && supabaseAdmin) {
      for (const video of latestVideos) {
        await supabaseAdmin.from('podcasts').upsert({
          id: video.id,
          title: video.title,
          guest: video.guest,
          date: video.date,
          tag: video.tag,
          youtube_url: video.youtubeUrl,
        });
      }
    }

    return NextResponse.json({
      success: true,
      syncedCount: latestVideos.length,
      videos: latestVideos,
      message: `Successfully synced ${latestVideos.length} episodes from YouTube.`,
    });
  } catch (error: any) {
    console.error('Error syncing YouTube podcasts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync with YouTube' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
