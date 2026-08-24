import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase, Post } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updatedData = await req.json();

    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            title: updatedData.title,
            subtitle: updatedData.subtitle,
            date: updatedData.date,
            iso_date: updatedData.isoDate,
            read_time: updatedData.readTime,
            tag: updatedData.tag,
            cover_image: updatedData.coverImage,
            published: updatedData.published,
            content: updatedData.content,
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${params.id},slug.eq.${params.id}`);

        if (updateError) {
          console.error('Supabase error updating post:', updateError);
        }
      } catch (e) {
        console.error('Supabase exception updating post:', e);
      }
    }

    const db = getDatabase();
    let postIndex = db.posts.findIndex(
      (p) =>
        String(p.id) === String(params.id) ||
        p.slug === params.id ||
        (updatedData.id && String(p.id) === String(updatedData.id)) ||
        (updatedData.slug && p.slug === updatedData.slug)
    );

    if (postIndex === -1) {
      // If the post was in Supabase or not found locally, create/upsert it
      const newPost: Post = {
        id: updatedData.id || params.id || Date.now().toString(),
        slug: updatedData.slug || params.id,
        title: updatedData.title || '',
        subtitle: updatedData.subtitle || '',
        date: updatedData.date || '',
        isoDate: updatedData.isoDate || '',
        readTime: updatedData.readTime || '6 min read',
        tag: updatedData.tag || 'Systems & Leadership',
        coverImage: updatedData.coverImage || '',
        published: updatedData.published ?? true,
        content: updatedData.content || '',
      };
      db.posts.unshift(newPost);
      postIndex = 0;
    } else {
      db.posts[postIndex] = {
        ...db.posts[postIndex],
        ...updatedData,
      };
    }

    saveDatabase(db);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/writing', 'page');
      const slug = db.posts[postIndex]?.slug;
      if (slug) {
        revalidatePath(`/writing/${slug}`, 'page');
      }
    } catch (err) {
      console.warn('revalidatePath warning:', err);
    }

    return NextResponse.json({ success: true, post: db.posts[postIndex] });
  } catch (error: any) {
    console.error('API PUT post error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('posts')
          .delete()
          .or(`id.eq.${params.id},slug.eq.${params.id}`);
      } catch (e) {
        console.error('Supabase error deleting post:', e);
      }
    }

    const db = getDatabase();
    const targetPost = db.posts.find(
      (p) => String(p.id) === String(params.id) || p.slug === params.id
    );
    db.posts = db.posts.filter(
      (p) => String(p.id) !== String(params.id) && p.slug !== params.id
    );

    saveDatabase(db);

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/', 'page');
      revalidatePath('/writing', 'page');
      if (targetPost?.slug) {
        revalidatePath(`/writing/${targetPost.slug}`, 'page');
      }
    } catch (err) {
      console.warn('revalidatePath warning:', err);
    }

    return NextResponse.json({ success: true, message: 'Post deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete post' },
      { status: 500 }
    );
  }
}
