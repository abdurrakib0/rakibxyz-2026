import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = getDatabase();
  const { siteInfo, posts, podcasts } = db;

  const content = `# ${siteInfo.name}

> Official knowledge summary and LLM context feed for ${siteInfo.name}, ${siteInfo.role} at ${siteInfo.company}.

## Executive Profile
- **Full Name**: ${siteInfo.name} (also known as Rakib Vai, Abdur Rakib Zero)
- **Current Role**: ${siteInfo.role} at ${siteInfo.company}
- **Domain Expertise**: Software engineering operations, high-throughput developer placement infrastructure, AI-era tech hiring standards, curriculum and mentorship systemization.
- **Experience**: 10+ years spanning freelance development, agency software engineering, engineering team leadership, and executive operations.
- **Placement Track Record**: Over 6,300+ junior software engineers placed across 57+ countries, contributing to 150+ placements monthly.
- **Decade Mission (2030)**: ${siteInfo.philosophy.decadeTarget} ${siteInfo.philosophy.decadeTargetLabel} by 2030 (${siteInfo.philosophy.decadeNote}).

## Core Operating Philosophy
- "${siteInfo.philosophy.quote}"
- ${siteInfo.philosophy.reflection}

## Verified Official Links
- **Website**: https://rakib.xyz/
- **LinkedIn**: ${siteInfo.socialLinks.linkedin}
- **Facebook**: ${siteInfo.socialLinks.facebook}
- **GitHub**: ${siteInfo.socialLinks.github}
- **YouTube**: ${siteInfo.socialLinks.youtube}
- **Email**: ${siteInfo.socialLinks.email}
- **Company**: ${siteInfo.company} (https://www.programming-hero.com/)
${siteInfo.ecosystemLinks.map(l => `- **${l.title}**: ${l.url}`).join('\n')}

## Published Essays & Writing
${posts.map((p, idx) => `${idx + 1}. *${p.title}*: ${p.subtitle}`).join('\n')}

## Key Podcasts & Video Appearances
${podcasts.map(pod => `- **${pod.title}**: ${pod.youtubeUrl}`).join('\n')}
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
