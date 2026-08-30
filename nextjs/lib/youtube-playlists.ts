import fs from 'fs';
import path from 'path';

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

// Fallback seed data in case file read is unavailable
const SEED_CACHE = {
  careerCrackerz: [
    {
      id: 'cGeqbDG1ulg',
      title: 'বাংলাদেশের Gaming ইন্ডাস্ট্রির বাস্তবতা | Ershadul Hoque',
      thumbnail: 'https://img.youtube.com/vi/cGeqbDG1ulg/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=cGeqbDG1ulg',
      show: 'Career Crackerz Podcast',
      tag: 'Tech & Career',
    },
    {
      id: '5vnU8j3UT1Y',
      title: 'রাস্তায় কাপড় বিক্রি থেকে ১৬ হাজার কর্মীর বিশাল প্রতিষ্ঠান গড়ার গল্প | Waeez R Hossain',
      thumbnail: 'https://img.youtube.com/vi/5vnU8j3UT1Y/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=5vnU8j3UT1Y',
      show: 'Career Crackerz Podcast',
      tag: 'Tech & Career',
    },
    {
      id: 'o4sLGPZMxkc',
      title: 'আগামী ৫ বছরে কোন চাকরিগুলো থাকবে? | Sadman Sadik',
      thumbnail: 'https://img.youtube.com/vi/o4sLGPZMxkc/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=o4sLGPZMxkc',
      show: 'Career Crackerz Podcast',
      tag: 'Tech & Career',
    },
  ],
  borderlessBangladeshi: [
    {
      id: 'qnTA0Obkrq8',
      title: 'বাংলাদেশ থেকে Global Software Engineer হওয়ার পথ | Saad Bin Amjad',
      thumbnail: 'https://img.youtube.com/vi/qnTA0Obkrq8/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=qnTA0Obkrq8',
      show: 'Borderless Bangladeshi',
      tag: 'Global Career',
    },
    {
      id: 'OZSgWq_OKr8',
      title: 'এই ১ টা এপিসোড বাংলাদেশের প্রত্যেক ইউনিভার্সিটি স্টুডেন্টের দেখা উচিত | Omar Faroque',
      thumbnail: 'https://img.youtube.com/vi/OZSgWq_OKr8/hqdefault.jpg',
      url: 'https://www.youtube.com/watch?v=OZSgWq_OKr8',
      show: 'Borderless Bangladeshi',
      tag: 'Global Career',
    },
  ],
};

function getCacheFilePath(): string {
  return path.join(process.cwd(), 'data', 'youtube-cache.json');
}

function loadCachedPlaylists(): { careerCrackerz: PlaylistVideo[]; borderlessBangladeshi: PlaylistVideo[] } {
  try {
    const filePath = getCacheFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data.careerCrackerz) && data.careerCrackerz.length > 0) {
        return {
          careerCrackerz: data.careerCrackerz,
          borderlessBangladeshi: data.borderlessBangladeshi || [],
        };
      }
    }
  } catch (e) {
    // ignore read error
  }
  return SEED_CACHE;
}

function saveCachedPlaylists(career: PlaylistVideo[], borderless: PlaylistVideo[]) {
  try {
    const filePath = getCacheFilePath();
    const data = {
      updatedAt: new Date().toISOString(),
      careerCrackerz: career,
      borderlessBangladeshi: borderless,
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    // Vercel serverless read-only is fine; in-memory cache handles runtime
  }
}

function parseRssFeed(xml: string, show: string, tag: string, limit = 6): PlaylistVideo[] {
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
  limit = 6,
): Promise<PlaylistVideo[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  try {
    const res = await fetch(rssUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour — auto updates when new videos are added
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
    const xml = await res.text();
    return parseRssFeed(xml, show, tag, limit);
  } catch (err) {
    console.warn(`[youtube-playlists] RSS fetch failed for ${playlistId}, using persistent cache:`, err);
    return [];
  }
}

export async function getYouTubePlaylists(): Promise<PlaylistsResult> {
  const cached = loadCachedPlaylists();

  // Fetch live RSS feeds in parallel
  const [liveCareer, liveBorderless] = await Promise.all([
    fetchPlaylistRss(PLAYLISTS[0].id, PLAYLISTS[0].show, PLAYLISTS[0].tag, 6),
    fetchPlaylistRss(PLAYLISTS[1].id, PLAYLISTS[1].show, PLAYLISTS[1].tag, 6),
  ]);

  // Use fresh RSS videos if available, otherwise use cached videos
  const careerCrackerz = liveCareer.length > 0 ? liveCareer.slice(0, 3) : (cached.careerCrackerz || []).slice(0, 3);
  const borderlessBangladeshi = liveBorderless.length > 0 ? liveBorderless.slice(0, 3) : (cached.borderlessBangladeshi || []).slice(0, 3);

  // If live data was fetched, persist to cache file
  if (liveCareer.length > 0 || liveBorderless.length > 0) {
    saveCachedPlaylists(
      liveCareer.length > 0 ? liveCareer : cached.careerCrackerz,
      liveBorderless.length > 0 ? liveBorderless : cached.borderlessBangladeshi
    );
  }

  return {
    careerCrackerz,
    borderlessBangladeshi,
    fetchedAt: new Date().toISOString(),
  };
}
