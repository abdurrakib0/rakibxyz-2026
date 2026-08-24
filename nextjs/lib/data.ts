import fs from 'fs';
import path from 'path';
import { supabase, supabaseAdmin, isSupabaseConfigured } from './supabase';

export interface StatItem {
  number: string;
  label: string;
}

export interface Philosophy {
  quote: string;
  reflection: string;
  tags: string[];
  decadeTarget: string;
  decadeTargetLabel: string;
  decadeNote: string;
  placedToDate: string;
  targetRate: string;
}

export interface SiteInfo {
  name: string;
  role: string;
  company: string;
  heroHeadline: string;
  heroBio: string;
  statsCaption: string;
  stats: StatItem[];
  philosophy: Philosophy;
  ecosystemLinks: { title: string; url: string }[];
  socialLinks: {
    linkedin: string;
    facebook: string;
    github: string;
    youtube: string;
    email: string;
  };
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  isoDate: string;
  readTime: string;
  tag: string;
  coverImage?: string;
  published: boolean;
  content: string;
}

export interface Podcast {
  id: string;
  title: string;
  guest: string;
  date: string;
  tag: string;
  youtubeUrl: string;
}

export interface ExperienceItem {
  id: string;
  period: string;
  role: string;
  company: string;
  details: string[];
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface DatabaseSchema {
  siteInfo: SiteInfo;
  posts: Post[];
  podcasts: Podcast[];
  experience: ExperienceItem[];
  subscribers?: Subscriber[];
}

const dataFilePath = path.join(process.cwd(), 'data', 'site-data.json');

// Local JSON file read/write
export function getDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(dataFilePath)) {
      throw new Error(`Data file not found at ${dataFilePath}`);
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    const data = JSON.parse(fileContent) as DatabaseSchema;
    if (!data.subscribers) data.subscribers = [];
    return data;
  } catch (error) {
    console.error('Error reading local database:', error);
    throw error;
  }
}

export function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error: any) {
    // In serverless environments like Vercel (/var/task), the local filesystem is read-only (EROFS).
    // Cloud persistence is handled by Supabase PostgreSQL.
    console.warn('Local filesystem write note (serverless/read-only):', error?.message || error);
  }
}

// ---------------------------------------------------------------------------
// SUPABASE / HYBRID ASYNC METHODS
// ---------------------------------------------------------------------------

export async function getDatabaseAsync(): Promise<DatabaseSchema> {
  if (!isSupabaseConfigured() || !supabase) {
    return getDatabase();
  }

  try {
    const [postsRes, podcastsRes, siteInfoRes, expRes] = await Promise.all([
      supabase.from('posts').select('*').order('created_at', { ascending: false }),
      supabase.from('podcasts').select('*').order('created_at', { ascending: false }),
      supabase.from('site_info').select('*').eq('id', 'default').single(),
      supabase.from('experience').select('*').order('sort_order', { ascending: true }),
    ]);

    const localDb = getDatabase();

    const posts: Post[] = postsRes.data && postsRes.data.length > 0
      ? postsRes.data.map((p) => {
          const localPost = localDb.posts.find((lp) => lp.id === p.id || lp.slug === p.slug);
          return {
            id: p.id,
            slug: p.slug,
            title: p.title || localPost?.title || '',
            subtitle: p.subtitle || localPost?.subtitle || '',
            date: p.date || localPost?.date || '',
            isoDate: p.iso_date || localPost?.isoDate || '',
            readTime: p.read_time || localPost?.readTime || '6 min read',
            tag: p.tag || localPost?.tag || 'Systems & Leadership',
            coverImage: p.cover_image || localPost?.coverImage || '',
            published: p.published ?? localPost?.published ?? true,
            content: p.content || localPost?.content || '',
          };
        })
      : localDb.posts;

    const podcasts: Podcast[] = podcastsRes.data && podcastsRes.data.length > 0
      ? podcastsRes.data.map((p) => ({
          id: p.id,
          title: p.title,
          guest: p.guest,
          date: p.date,
          tag: p.tag || 'Tech & Career',
          youtubeUrl: p.youtube_url,
        }))
      : localDb.podcasts;

    const siteInfo: SiteInfo = siteInfoRes.data
      ? {
          name: siteInfoRes.data.name,
          role: siteInfoRes.data.role,
          company: siteInfoRes.data.company,
          heroHeadline: siteInfoRes.data.hero_headline,
          heroBio: siteInfoRes.data.hero_bio,
          statsCaption: siteInfoRes.data.stats_caption,
          stats: siteInfoRes.data.stats || localDb.siteInfo.stats,
          philosophy: siteInfoRes.data.philosophy || localDb.siteInfo.philosophy,
          ecosystemLinks: siteInfoRes.data.ecosystem_links || localDb.siteInfo.ecosystemLinks,
          socialLinks: siteInfoRes.data.social_links || localDb.siteInfo.socialLinks,
        }
      : localDb.siteInfo;

    const experience: ExperienceItem[] = expRes.data && expRes.data.length > 0
      ? expRes.data.map((e) => ({
          id: e.id,
          period: e.period,
          role: e.role,
          company: e.company,
          details: Array.isArray(e.details) ? e.details : [],
        }))
      : localDb.experience;

    return {
      siteInfo,
      posts,
      podcasts,
      experience,
      subscribers: localDb.subscribers,
    };
  } catch (error) {
    console.error('Error querying Supabase, falling back to local JSON:', error);
    return getDatabase();
  }
}

export async function getPostBySlugAsync(slug: string): Promise<Post | null> {
  const db = await getDatabaseAsync();
  const found = db.posts.find((p) => p.slug === slug || p.id === slug);
  return found || null;
}

export async function getRelatedPostsAsync(currentId: string, limit = 3): Promise<Post[]> {
  const db = await getDatabaseAsync();
  return db.posts.filter((p) => p.id !== currentId && p.published).slice(0, limit);
}

// ---------------------------------------------------------------------------
// SUBSCRIBER MANAGEMENT METHODS
// ---------------------------------------------------------------------------

export async function getSubscribersAsync(): Promise<Subscriber[]> {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data.map((d) => ({
          id: String(d.id),
          email: d.email,
          created_at: d.created_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.error('Error fetching subscribers from Supabase:', err);
    }
  }

  const localDb = getDatabase();
  return (localDb.subscribers || []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function saveNewsletterSubscriber(email: string): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('subscribers')
        .insert([{ email }]);
      if (error) {
        if (error.code === '23505') {
          return { success: true, message: 'Already subscribed!' };
        }
        throw error;
      }
      return { success: true, message: 'Subscribed successfully!' };
    } catch (err: any) {
      console.error('Error saving subscriber to Supabase:', err);
      return { success: false, message: err.message || 'Subscription failed' };
    }
  }

  // Local fallback save
  try {
    const localDb = getDatabase();
    if (!localDb.subscribers) localDb.subscribers = [];
    const exists = localDb.subscribers.find(
      (s) => s.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return { success: true, message: 'Already subscribed!' };
    }
    localDb.subscribers.unshift({
      id: `sub_${Date.now()}`,
      email,
      created_at: new Date().toISOString(),
    });
    saveDatabase(localDb);
  } catch (e) {
    console.error('Local subscriber save error:', e);
  }

  console.log(`[Local Fallback] Subscriber recorded: ${email}`);
  return { success: true, message: 'Subscribed successfully!' };
}

export async function deleteSubscriberAsync(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('subscribers')
        .delete()
        .eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.error('Error deleting subscriber from Supabase:', err);
    }
  }

  const localDb = getDatabase();
  if (localDb.subscribers) {
    localDb.subscribers = localDb.subscribers.filter((s) => s.id !== id);
    saveDatabase(localDb);
    return true;
  }
  return false;
}
