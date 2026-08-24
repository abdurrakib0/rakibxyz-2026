import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase, Post } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (isSupabaseConfigured() && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const posts: Post[] = data.map((p) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          subtitle: p.subtitle || '',
          date: p.date,
          isoDate: p.iso_date || '',
          readTime: p.read_time || '6 min read',
          tag: p.tag || 'Systems & Leadership',
          published: p.published ?? true,
          content: p.content,
        }));
        return NextResponse.json(posts);
      }
    } catch (e) {
      console.error('Supabase error fetching posts:', e);
    }
  }

  const db = getDatabase();
  return NextResponse.json(db.posts);
}

export async function POST(req: NextRequest) {
  try {
    const postData = await req.json();
    const id = postData.id || Date.now().toString();
    const slug =
      postData.slug ||
      postData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

    const newPost: Post = {
      id,
      slug,
      title: postData.title,
      subtitle: postData.subtitle || '',
      date: postData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      isoDate: postData.isoDate || new Date().toISOString().split('T')[0],
      readTime: postData.readTime || '6 min read',
      tag: postData.tag || 'Systems & Leadership',
      published: postData.published ?? true,
      content: postData.content || '',
    };

    // Save to Supabase if configured
    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        await supabaseAdmin.from('posts').insert({
          id: newPost.id,
          slug: newPost.slug,
          title: newPost.title,
          subtitle: newPost.subtitle,
          date: newPost.date,
          iso_date: newPost.isoDate,
          read_time: newPost.readTime,
          tag: newPost.tag,
          published: newPost.published,
          content: newPost.content,
          updated_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Supabase error inserting post:', e);
      }
    }

    // Always keep local JSON updated
    const db = getDatabase();
    db.posts.unshift(newPost);
    saveDatabase(db);

    // Invalidate caches instantly
    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');
    revalidatePath('/writing', 'page');
    revalidatePath(`/writing/${newPost.slug}`, 'page');

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to create post' }, { status: 500 });
  }
}
