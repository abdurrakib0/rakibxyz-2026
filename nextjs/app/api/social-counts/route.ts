import { NextResponse } from 'next/server';

// Cache response for 1 hour — revalidates automatically on next request after expiry
export const revalidate = 3600;

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  const result = {
    youtube: null as string | null,
    youtubeRaw: null as number | null,
    cached: false,
    updatedAt: new Date().toISOString(),
    apiKeyMissing: !apiKey,
  };

  if (!apiKey) {
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  }

  try {
    // Fetch YouTube channel stats by channel handle
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=abdurrakib0&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (ytRes.ok) {
      const ytData = await ytRes.json();
      const stats = ytData?.items?.[0]?.statistics;

      if (stats?.subscriberCount) {
        const count = parseInt(stats.subscriberCount, 10);
        result.youtubeRaw = count;

        // Format nicely: 25400 → "25.4K", 1200000 → "1.2M"
        if (count >= 1_000_000) {
          result.youtube = (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M+';
        } else if (count >= 1_000) {
          result.youtube = (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'K+';
        } else {
          result.youtube = count.toLocaleString() + '+';
        }
      }
    } else {
      console.error('YouTube API error:', ytRes.status, await ytRes.text());
    }
  } catch (err) {
    console.error('YouTube fetch error:', err);
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
