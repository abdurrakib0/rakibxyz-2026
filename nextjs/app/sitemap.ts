import { MetadataRoute } from 'next';
import { getDatabaseAsync } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDatabaseAsync();
  const baseUrl = 'https://rakib.xyz';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/writing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/podcast`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/experience`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const essayRoutes: MetadataRoute.Sitemap = db.posts
    .filter((p) => p.published)
    .map((p) => ({
      url: `${baseUrl}/writing/${p.slug}`,
      lastModified: p.isoDate ? new Date(p.isoDate) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
    }));

  return [...staticRoutes, ...essayRoutes];
}
