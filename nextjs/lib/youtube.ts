import { Podcast } from './data';

interface YouTubeFeedItem {
  id: string;
  title: string;
  guest: string;
  date: string;
  tag: string;
  show: string;
  youtubeUrl: string;
}

/**
 * Parses XML text from YouTube Channel RSS feed:
 * https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
 */
export function parseYouTubeRSS(xmlText: string): YouTubeFeedItem[] {
  const entries: YouTubeFeedItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xmlText)) !== null) {
    const entryBlock = match[1];

    const idMatch = entryBlock.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
    const titleMatch = entryBlock.match(/<title>(.*?)<\/title>/);
    const publishedMatch = entryBlock.match(/<published>(.*?)<\/published>/);

    if (idMatch && titleMatch) {
      const videoId = idMatch[1].trim();
      const rawTitle = titleMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      const publishedDate = publishedMatch
        ? new Date(publishedMatch[1]).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          })
        : new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

      // Extract Guest Name if pipe or separator exists (e.g. "Title | Guest Name")
      let guest = 'Abdur Rakib';
      if (rawTitle.includes('|')) {
        const parts = rawTitle.split('|');
        guest = parts[parts.length - 1].trim();
      }

      // Determine Show category: "Borderless Bangladeshi" vs "Career Crackerz"
      const isBorderless =
        rawTitle.toLowerCase().includes('borderless') ||
        rawTitle.toLowerCase().includes('bangladeshi') ||
        rawTitle.includes('ফেসবুক') ||
        rawTitle.includes('Omar');

      const show = isBorderless ? 'Borderless Bangladeshi' : 'Career Crackerz';
      const tag = isBorderless ? 'Global Leadership & Diaspora' : 'Career & Tech Systems';

      entries.push({
        id: videoId,
        title: rawTitle,
        guest,
        date: publishedDate,
        tag,
        show,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }
  }

  return entries;
}

/**
 * Fetches latest videos from YouTube using either:
 * 1. YouTube Data API v3 (if YOUTUBE_API_KEY is provided)
 * 2. YouTube Public RSS Feed (Free fallback, no API key needed)
 */
export async function fetchLatestYouTubeVideos(channelId?: string): Promise<Podcast[]> {
  const targetChannelId = channelId || process.env.YOUTUBE_CHANNEL_ID;
  const apiKey = process.env.YOUTUBE_API_KEY;

  // 1. If Official YouTube Data API Key is configured
  if (apiKey && targetChannelId) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${targetChannelId}&part=snippet,id&order=date&maxResults=15&type=video`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
          return data.items.map((item: any) => {
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const date = new Date(item.snippet.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            });

            let guest = 'Abdur Rakib';
            if (title.includes('|')) {
              const parts = title.split('|');
              guest = parts[parts.length - 1].trim();
            }

            const isBorderless =
              title.toLowerCase().includes('borderless') ||
              title.toLowerCase().includes('bangladeshi') ||
              title.includes('Omar');

            return {
              id: videoId,
              title,
              guest,
              date,
              tag: isBorderless ? 'Global Leadership & Diaspora' : 'Career & Tech Systems',
              show: isBorderless ? 'Borderless Bangladeshi' : 'Career Crackerz',
              youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
            };
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from YouTube API, attempting RSS fallback:', err);
    }
  }

  // 2. Free RSS Feed Fallback
  if (targetChannelId) {
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${targetChannelId}`;
      const res = await fetch(rssUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const xmlText = await res.text();
        const rssItems = parseYouTubeRSS(xmlText);
        if (rssItems.length > 0) {
          return rssItems;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from YouTube RSS feed:', err);
    }
  }

  return [];
}
