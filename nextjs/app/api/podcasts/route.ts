import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase, Podcast } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const podcasts: Podcast[] = data.map((p) => ({
          id: p.id,
          title: p.title,
          guest: p.guest,
          date: p.date,
          tag: p.tag || 'Tech & Career',
          youtubeUrl: p.youtube_url,
        }));
        return NextResponse.json(podcasts);
      }
    } catch (e) {
      console.error('Supabase error fetching podcasts:', e);
    }
  }

  const db = getDatabase();
  return NextResponse.json(db.podcasts);
}

export async function POST(req: NextRequest) {
  try {
    const podcastData = await req.json();

    let videoId = podcastData.id;
    if (podcastData.youtubeUrl && !videoId) {
      const match = podcastData.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match) {
        videoId = match[1];
      }
    }

    const newPodcast: Podcast = {
      id: videoId || Date.now().toString(),
      title: podcastData.title,
      guest: podcastData.guest || 'Guest',
      date: podcastData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      tag: podcastData.tag || 'Tech & Career',
      youtubeUrl: podcastData.youtubeUrl || `https://www.youtube.com/watch?v=${videoId}`,
    };

    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        await supabaseAdmin.from('podcasts').upsert({
          id: newPodcast.id,
          title: newPodcast.title,
          guest: newPodcast.guest,
          date: newPodcast.date,
          tag: newPodcast.tag,
          youtube_url: newPodcast.youtubeUrl,
        });
      } catch (e) {
        console.error('Supabase error saving podcast:', e);
      }
    }

    const db = getDatabase();
    db.podcasts.unshift(newPodcast);
    saveDatabase(db);

    try {
      revalidatePath('/', 'layout');
    } catch (err) {
      console.warn('revalidatePath warning:', err);
    }

    return NextResponse.json({ success: true, podcast: newPodcast });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to add podcast' }, { status: 500 });
  }
}
