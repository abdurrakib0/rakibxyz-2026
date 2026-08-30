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

export interface SocialMetrics {
  linkedinFollowers?: string;
  linkedinLabel?: string;
  youtubeSubscribers?: string;
  youtubeLabel?: string;
  facebookFollowers?: string;
  facebookLabel?: string;
}

export interface SiteInfo {
  name: string;
  role: string;
  company: string;
  avatarUrl?: string;
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
  socialMetrics?: SocialMetrics;
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
  show?: string;
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

export interface Recommendation {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl?: string;
  content: string;
  linkedinUrl?: string;
  relation?: string;
  date?: string;
  sortOrder?: number;
}

export interface DatabaseSchema {
  siteInfo: SiteInfo;
  posts: Post[];
  podcasts: Podcast[];
  experience: ExperienceItem[];
  subscribers?: Subscriber[];
  recommendations?: Recommendation[];
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
    if (!data.recommendations) data.recommendations = [];
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
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase query timeout')), 1500)
    );

    const [postsRes, podcastsRes, siteInfoRes, expRes, recsRes] = await Promise.race([
      Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('podcasts').select('*').order('created_at', { ascending: false }),
        supabase.from('site_info').select('*').eq('id', 'default').single(),
        supabase.from('experience').select('*').order('sort_order', { ascending: true }),
        supabase.from('recommendations').select('*').order('sort_order', { ascending: true }),
      ]),
      timeoutPromise,
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
      ? podcastsRes.data.map((p) => {
          const localPod = localDb.podcasts.find((lp) => lp.id === p.id);
          const isBorderless =
            p.title?.includes('Omar') ||
            p.guest?.includes('Omar') ||
            (p.tag && p.tag.toLowerCase().includes('borderless')) ||
            localPod?.show === 'Borderless Bangladeshi';

          return {
            id: p.id,
            title: p.title,
            guest: p.guest,
            date: p.date,
            tag: p.tag || 'Tech & Career',
            show: p.show || (isBorderless ? 'Borderless Bangladeshi' : 'Career Crackerz'),
            youtubeUrl: p.youtube_url,
          };
        })
      : localDb.podcasts;

    const siteInfo: SiteInfo = siteInfoRes.data
      ? {
          name: siteInfoRes.data.name || localDb.siteInfo.name,
          role: siteInfoRes.data.role || localDb.siteInfo.role,
          company: siteInfoRes.data.company || localDb.siteInfo.company,
          avatarUrl: siteInfoRes.data.avatar_url || localDb.siteInfo.avatarUrl || '/img/Hero image.png',
          heroHeadline: siteInfoRes.data.hero_headline || localDb.siteInfo.heroHeadline,
          heroBio: siteInfoRes.data.hero_bio || localDb.siteInfo.heroBio,
          statsCaption: siteInfoRes.data.stats_caption || localDb.siteInfo.statsCaption,
          stats: siteInfoRes.data.stats || localDb.siteInfo.stats,
          philosophy: siteInfoRes.data.philosophy || localDb.siteInfo.philosophy,
          ecosystemLinks: siteInfoRes.data.ecosystem_links || localDb.siteInfo.ecosystemLinks,
          socialLinks: siteInfoRes.data.social_links || localDb.siteInfo.socialLinks,
          socialMetrics: siteInfoRes.data.social_metrics || siteInfoRes.data.socialMetrics || localDb.siteInfo.socialMetrics,
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

    // Merge Supabase recommendations with localDb recommendations seamlessly
    const dbRecs: Recommendation[] = (recsRes?.data && recsRes.data.length > 0)
      ? recsRes.data.map((d) => ({
          id: d.id,
          name: d.name,
          role: d.role,
          company: d.company,
          avatarUrl: d.avatar_url,
          content: d.content,
          linkedinUrl: d.linkedin_url,
          relation: d.relation,
          date: d.date,
          sortOrder: d.sort_order,
        }))
      : [];

    const localRecs: Recommendation[] = localDb.recommendations || [];
    
    // Combine both, matching by ID
    const mergedMap = new Map<string, Recommendation>();
    for (const r of localRecs) {
      mergedMap.set(r.id, r);
    }
    for (const r of dbRecs) {
      mergedMap.set(r.id, r);
    }
    const recommendations = Array.from(mergedMap.values()).sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );

    return {
      siteInfo,
      posts,
      podcasts,
      experience,
      subscribers: localDb.subscribers,
      recommendations,
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
// RECOMMENDATIONS CRUD METHODS
// ---------------------------------------------------------------------------

export async function getRecommendationsAsync(): Promise<Recommendation[]> {
  const localDb = getDatabase();
  const localList = (localDb.recommendations || []).sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        const dbList: Recommendation[] = data.map((d) => ({
          id: d.id,
          name: d.name,
          role: d.role,
          company: d.company,
          avatarUrl: d.avatar_url,
          content: d.content,
          linkedinUrl: d.linkedin_url,
          relation: d.relation,
          date: d.date,
          sortOrder: d.sort_order,
        }));

        const combined = new Map<string, Recommendation>();
        for (const lr of localList) {
          combined.set(lr.id, lr);
        }
        for (const dr of dbList) {
          combined.set(dr.id, dr);
        }
        return Array.from(combined.values()).sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        );
      }
    } catch (err) {
      console.error('Error fetching recommendations from Supabase:', err);
    }
  }

  return localList;
}

export async function saveRecommendationAsync(item: Recommendation): Promise<{ success: boolean; data?: Recommendation; message?: string }> {
  // 1. Always update local database file first for immediate sync
  try {
    const localDb = getDatabase();
    if (!localDb.recommendations) localDb.recommendations = [];
    const existsIndex = localDb.recommendations.findIndex((r) => r.id === item.id);
    if (existsIndex >= 0) {
      localDb.recommendations[existsIndex] = item;
    } else {
      localDb.recommendations.push(item);
    }
    saveDatabase(localDb);
  } catch (e: any) {
    console.error('Local recommendation save error:', e);
  }

  // 2. Also persist to Supabase if configured
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('recommendations')
        .upsert([{
          id: item.id,
          name: item.name,
          role: item.role,
          company: item.company,
          avatar_url: item.avatarUrl || '',
          content: item.content,
          linkedin_url: item.linkedinUrl || '',
          relation: item.relation || '',
          date: item.date || '',
          sort_order: item.sortOrder ?? 0,
        }], { onConflict: 'id' });

      if (error) console.error('Supabase recommendation save error:', error);
    } catch (err: any) {
      console.error('Error saving recommendation to Supabase:', err);
    }
  }

  return { success: true, data: item };
}

export async function updateRecommendationAsync(id: string, updates: Partial<Recommendation>): Promise<{ success: boolean; message?: string }> {
  // 1. Always update local database file first for immediate sync
  let fullRecord: Recommendation | null = null;
  try {
    const localDb = getDatabase();
    if (!localDb.recommendations) localDb.recommendations = [];
    const idx = localDb.recommendations.findIndex((r) => r.id === id);
    if (idx !== -1) {
      localDb.recommendations[idx] = { ...localDb.recommendations[idx], ...updates };
      fullRecord = localDb.recommendations[idx];
      saveDatabase(localDb);
    } else {
      const newItem: Recommendation = {
        id,
        name: updates.name || '',
        role: updates.role || '',
        company: updates.company || '',
        avatarUrl: updates.avatarUrl || '',
        content: updates.content || '',
        linkedinUrl: updates.linkedinUrl || '',
        relation: updates.relation || '',
        date: updates.date || '',
        sortOrder: updates.sortOrder ?? 0,
        ...updates,
      };
      localDb.recommendations.push(newItem);
      fullRecord = newItem;
      saveDatabase(localDb);
    }
  } catch (e: any) {
    console.error('Local recommendation update error:', e);
  }

  // 2. Also persist to Supabase if configured
  if (isSupabaseConfigured() && supabaseAdmin && fullRecord) {
    try {
      const dbPayload = {
        id: fullRecord.id,
        name: fullRecord.name,
        role: fullRecord.role,
        company: fullRecord.company,
        avatar_url: fullRecord.avatarUrl || '',
        content: fullRecord.content,
        linkedin_url: fullRecord.linkedinUrl || '',
        relation: fullRecord.relation || '',
        date: fullRecord.date || '',
        sort_order: fullRecord.sortOrder ?? 0,
      };

      const { error } = await supabaseAdmin
        .from('recommendations')
        .upsert([dbPayload], { onConflict: 'id' });

      if (error) {
        console.error('Supabase recommendation upsert error:', error);
      }
    } catch (err: any) {
      console.error('Error updating recommendation in Supabase:', err);
    }
  }

  return { success: true };
}

export async function deleteRecommendationAsync(id: string): Promise<boolean> {
  // 1. Always update local database file first
  try {
    const localDb = getDatabase();
    if (localDb.recommendations) {
      localDb.recommendations = localDb.recommendations.filter((r) => r.id !== id);
      saveDatabase(localDb);
    }
  } catch (e: any) {
    console.error('Local recommendation delete error:', e);
  }

  // 2. Also delete in Supabase
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      await supabaseAdmin.from('recommendations').delete().eq('id', id);
    } catch (err) {
      console.error('Error deleting recommendation from Supabase:', err);
    }
  }

  return true;
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

export async function updateSubscriberAsync(id: string, newEmail: string): Promise<{ success: boolean; message?: string }> {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('subscribers')
        .update({ email: newEmail })
        .eq('id', id);
      if (error) {
        if (error.code === '23505') {
          return { success: false, message: 'Email already exists in subscriber list.' };
        }
        throw error;
      }
      return { success: true };
    } catch (err: any) {
      console.error('Error updating subscriber in Supabase:', err);
      return { success: false, message: err.message || 'Failed to update subscriber' };
    }
  }

  const localDb = getDatabase();
  if (localDb.subscribers) {
    const exists = localDb.subscribers.find(
      (s) => s.email.toLowerCase() === newEmail.toLowerCase() && s.id !== id
    );
    if (exists) {
      return { success: false, message: 'Email already exists in subscriber list.' };
    }
    const sub = localDb.subscribers.find((s) => s.id === id);
    if (sub) {
      sub.email = newEmail;
      saveDatabase(localDb);
      return { success: true };
    }
  }
  return { success: false, message: 'Subscriber not found' };
}

