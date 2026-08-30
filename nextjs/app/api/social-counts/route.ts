import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';
import { getDatabase } from '@/lib/data';

// Cache for 1 hour server-side
export const revalidate = 3600;

export async function GET() {
  const db = getDatabase();
  const fallback = db.siteInfo.socialMetrics?.youtubeSubscribers || '25,000+';

  let youtubeCount: string | null = null;

  try {
    const yt = await Innertube.create({ generate_session_locally: true });
    const channel = await yt.getChannel('@abdurrakib0');

    const subText: string =
      (channel as any)?.metadata?.subscriber_count_text ||
      (channel as any)?.header?.subscriber_count?.text ||
      (channel as any)?.header?.author?.subscriber_count?.text ||
      '';

    if (subText) {
      const cleaned = subText.replace(/\s*subscribers?/i, '').trim();
      if (cleaned) youtubeCount = cleaned.endsWith('+') ? cleaned : cleaned + '+';
    }
  } catch (err) {
    // Secondary fallback: Direct lightweight HTML scrape
    try {
      const res = await fetch('https://www.youtube.com/@abdurrakib0', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const html = await res.text();
        const match = html.match(/([0-9.]+[KM]?)\s+subscribers/i);
        if (match && match[1]) {
          youtubeCount = match[1] + '+';
        }
      }
    } catch (_) {}

    if (!youtubeCount) {
      youtubeCount = fallback;
    }
  }

  return NextResponse.json(
    {
      youtube: youtubeCount || fallback,
      youtubeRaw: null,
      apiKeyMissing: false, // youtubei.js never needs an API key
      updatedAt: new Date().toISOString(),
    },
    {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    }
  );
}
