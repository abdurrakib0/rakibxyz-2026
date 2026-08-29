/**
 * Server-only utility — fetches latest videos from YouTube playlists
 * using YouTube's public RSS feeds (no API key, no library needed, always works).
 *
 * RSS URL format: https://www.youtube.com/feeds/videos.xml?playlist_id=PLAYLIST_ID
 * Caches result for 1 hour; new videos appear automatically on next cache refresh.
 */

export interface PlaylistVideo {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  show: string;
  tag: string;
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

function parseRssFeed(xml: string, show: string, tag: string, limit: number): PlaylistVideo[] {
  const videos: PlaylistVideo[] = [];

  // Extract all <entry> blocks
  const entryMatches = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g));

  for (const match of entryMatches) {
    if (videos.length >= limit) break;
    const entry = match[1];

    // Use <yt:videoId> tag — most reliable
    const idMatch = entry.match(/<yt:videoId>([\w-]+)<\/yt:videoId>/);
    const id = idMatch?.[1] || '';
    if (!id) continue;

    // Title (may contain CDATA or HTML entities)
    const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
    const title = (titleMatch?.[1] || 'Untitled')
      .replace(/<!\[CDATA\[|\]\]>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    // Use media:thumbnail from RSS if available, otherwise fallback to img.youtube.com
    const thumbMatch = entry.match(/<media:thumbnail[^>]+url="([^"]+)"/);
    const thumbnail = thumbMatch?.[1] || `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

    videos.push({
      id,
      title,
      thumbnail,
      url: `https://www.youtube.com/watch?v=${id}`,
      show,
      tag,
    });
  }

  return videos;
}


async function fetchPlaylistRss(
  playlistId: string,
  show: string,
  tag: string,
  limit = 3,
): Promise<PlaylistVideo[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  try {
    const res = await fetch(rssUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour — new videos auto-appear on refresh
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const xml = await res.text();
    return parseRssFeed(xml, show, tag, limit);
  } catch (err) {
    console.error(`[youtube-playlists] RSS fetch failed for ${playlistId}:`, err);
    return [];
  }
}

export async function getYouTubePlaylists(): Promise<PlaylistsResult> {
  const [careerCrackerz, borderlessBangladeshi] = await Promise.all([
    fetchPlaylistRss(PLAYLISTS[0].id, PLAYLISTS[0].show, PLAYLISTS[0].tag, 3),
    fetchPlaylistRss(PLAYLISTS[1].id, PLAYLISTS[1].show, PLAYLISTS[1].tag, 3),
  ]);

  return {
    careerCrackerz,
    borderlessBangladeshi,
    fetchedAt: new Date().toISOString(),
  };
}
