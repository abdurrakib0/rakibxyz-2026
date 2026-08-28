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
      // "25.4K subscribers" → "25.4K+"
      const cleaned = subText.replace(/\s*subscribers?/i, '').trim();
      if (cleaned) youtubeCount = cleaned + '+';
    }
  } catch (err) {
    console.warn('[social-counts] youtubei.js error, using fallback:', err);
    // Graceful fallback — use admin-set value
    youtubeCount = fallback;
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
