import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';

// ISR: cache result for 1 hour. After 1 hour, next request triggers a background re-fetch.
// New videos added to the playlist will appear within 1 hour automatically.
export const revalidate = 3600;

export interface PlaylistVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  show: string;
  tag: string;
}

export interface PlaylistsResponse {
  careerCrackerz: PlaylistVideo[];
  borderlessBangladeshi: PlaylistVideo[];
  fetchedAt: string;
}

const PLAYLISTS = [
  {
    id: 'PLMq1yVf8pLJY',
    show: 'Career Crackerz Podcast',
    tag: 'Tech & Career',
    key: 'careerCrackerz' as const,
  },
  {
    id: 'PLK1lqIVem4B0',
    show: 'Borderless Bangladeshi',
    tag: 'Global Career',
    key: 'borderlessBangladeshi' as const,
  },
];

async function fetchPlaylist(
  yt: Innertube,
  playlistId: string,
  show: string,
  tag: string,
  limit = 3
): Promise<PlaylistVideo[]> {
  try {
    const playlist = await yt.getPlaylist(playlistId);
    const videos = (playlist.videos || []).slice(0, limit);

    return videos
      .map((v: any) => {
        const id: string =
          v?.id ||
          v?.video_id ||
          v?.endpoint?.payload?.videoId ||
          v?.navigationEndpoint?.watchEndpoint?.videoId ||
          '';

        if (!id) return null;

        const title: string =
          v?.title?.text ||
          v?.title?.toString?.() ||
          v?.headline?.text ||
          'Untitled';

        // Best available thumbnail
        const thumbs: any[] =
          v?.thumbnails ||
          v?.thumbnail?.thumbnails ||
          v?.best_thumbnail?.thumbnails ||
          [];

        const thumbnail: string =
          thumbs.sort((a: any, b: any) => (b.width || 0) - (a.width || 0))[0]?.url ||
          `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

        return {
          id,
          title,
          thumbnail: thumbnail.startsWith('//') ? `https:${thumbnail}` : thumbnail,
          url: `https://www.youtube.com/watch?v=${id}`,
          show,
          tag,
        };
      })
      .filter(Boolean) as PlaylistVideo[];
  } catch (err) {
    console.error(`[playlists] Failed to fetch playlist ${playlistId}:`, err);
    return [];
  }
}

export async function GET() {
  try {
    const yt = await Innertube.create({ generate_session_locally: true });

    // Fetch both playlists in parallel
    const [careerCrackerz, borderlessBangladeshi] = await Promise.all([
      fetchPlaylist(yt, PLAYLISTS[0].id, PLAYLISTS[0].show, PLAYLISTS[0].tag, 3),
      fetchPlaylist(yt, PLAYLISTS[1].id, PLAYLISTS[1].show, PLAYLISTS[1].tag, 3),
    ]);

    const response: PlaylistsResponse = {
      careerCrackerz,
      borderlessBangladeshi,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        // s-maxage: CDN/edge caches for 1 hour
        // stale-while-revalidate: serve stale for up to 24h while re-fetching in background
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    console.error('[playlists] Fatal error:', err);
    return NextResponse.json(
      { error: err.message, careerCrackerz: [], borderlessBangladeshi: [] },
      { status: 500 }
    );
  }
}
