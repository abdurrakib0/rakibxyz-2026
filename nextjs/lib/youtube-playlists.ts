import { Podcast } from './data';

export interface PlaylistVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  show: string;
  tag: string;
  date?: string;
  guest?: string;
}

export interface PlaylistsResult {
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

function extractVideoId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
  return match?.[1] || '';
}

function parseRssFeed(xml: string, show: string, tag: string, limit = 10): PlaylistVideo[] {
  const videos: PlaylistVideo[] = [];

  const entryMatches = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g));

  for (const match of entryMatches) {
    if (videos.length >= limit) break;
    const entry = match[1];

    const idMatch = entry.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/);
    const id = idMatch?.[1] || '';
    if (!id) continue;

    const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
    const title = (titleMatch?.[1] || 'Untitled')
      .replace(/<!\[CDATA\[|\]\]>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    const thumbMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/);
    const thumbnail = thumbMatch?.[1] || `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

    const pubMatch = entry.match(/<published>([^<]+)<\/published>/);
    let date = '';
    if (pubMatch && pubMatch[1]) {
      try {
        date = new Date(pubMatch[1]).toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });
      } catch (_) {}
    }

    videos.push({
      id,
      title,
      thumbnail,
      url: `https://www.youtube.com/watch?v=${id}`,
      show,
      tag,
      date,
    });
  }

  return videos;
}

export async function fetchPlaylistRss(
  playlistId: string,
  show: string,
  tag: string,
  limit = 10,
): Promise<PlaylistVideo[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  try {
    const res = await fetch(rssUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const xml = await res.text();
    return parseRssFeed(xml, show, tag, limit);
  } catch (err) {
    console.warn(`[youtube-playlists] RSS fetch failed for ${playlistId}, using database fallback:`, err);
    return [];
  }
}

function convertDbPodcasts(podcasts: Podcast[], showKeyword: string, showName: string, defaultTag: string): PlaylistVideo[] {
  return (podcasts || [])
    .filter((p) => {
      const show = (p.show || '').toLowerCase();
      const title = (p.title || '').toLowerCase();
      const tag = (p.tag || '').toLowerCase();
      if (showKeyword === 'career') {
        return !p.show || show.includes('career') || tag.includes('career') || (!show.includes('borderless') && !title.includes('borderless'));
      }
      return show.includes('borderless') || tag.includes('borderless') || title.includes('borderless') || title.includes('omar') || (p.guest && p.guest.toLowerCase().includes('omar'));
    })
    .map((p) => ({
      id: p.id,
      title: p.title,
      thumbnail: `https://img.youtube.com/vi/${p.id}/hqdefault.jpg`,
      url: p.youtubeUrl || `https://www.youtube.com/watch?v=${p.id}`,
      show: p.show || showName,
      tag: p.tag || defaultTag,
      date: p.date,
      guest: p.guest,
    }));
}

function mergeVideos(liveVideos: PlaylistVideo[], dbVideos: PlaylistVideo[], limit = 3): PlaylistVideo[] {
  const seenIds = new Set<string>();
  const merged: PlaylistVideo[] = [];

  // 1. Add fresh live videos from RSS
  for (const v of liveVideos) {
    if (v.id && !seenIds.has(v.id)) {
      seenIds.add(v.id);
      merged.push(v);
    }
  }

  // 2. Backfill with persistent database videos
  for (const v of dbVideos) {
    if (v.id && !seenIds.has(v.id)) {
      seenIds.add(v.id);
      merged.push(v);
    }
  }

  return merged.slice(0, limit);
}

export async function getYouTubePlaylists(dbPodcasts?: Podcast[]): Promise<PlaylistsResult> {
  // Convert local DB podcasts to fallbacks
  const dbCareer = convertDbPodcasts(dbPodcasts || [], 'career', 'Career Crackerz Podcast', 'Tech & Career');
  const dbBorderless = convertDbPodcasts(dbPodcasts || [], 'borderless', 'Borderless Bangladeshi', 'Global Career');

  // Fetch live YouTube RSS feeds in parallel
  const [liveCareer, liveBorderless] = await Promise.all([
    fetchPlaylistRss(PLAYLISTS[0].id, PLAYLISTS[0].show, PLAYLISTS[0].tag, 6),
    fetchPlaylistRss(PLAYLISTS[1].id, PLAYLISTS[1].show, PLAYLISTS[1].tag, 6),
  ]);

  // Merge live videos + persistent database fallback so section is NEVER empty
  const careerCrackerz = mergeVideos(liveCareer, dbCareer, 3);
  const borderlessBangladeshi = mergeVideos(liveBorderless, dbBorderless, 3);

  return {
    careerCrackerz,
    borderlessBangladeshi,
    fetchedAt: new Date().toISOString(),
  };
}
