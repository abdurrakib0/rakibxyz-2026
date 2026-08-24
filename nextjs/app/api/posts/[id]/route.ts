import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, saveDatabase } from '@/lib/data';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updatedData = await req.json();

    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('posts')
          .update({
            title: updatedData.title,
            subtitle: updatedData.subtitle,
            date: updatedData.date,
            iso_date: updatedData.isoDate,
            read_time: updatedData.readTime,
            tag: updatedData.tag,
            published: updatedData.published,
            content: updatedData.content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', params.id);
      } catch (e) {
        console.error('Supabase error updating post:', e);
      }
    }

    const db = getDatabase();
    const postIndex = db.posts.findIndex((p) => p.id === params.id);
    if (postIndex === -1) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }

    db.posts[postIndex] = {
      ...db.posts[postIndex],
      ...updatedData,
    };

    saveDatabase(db);

    try {
      revalidatePath('/', 'layout');
    } catch (err) {
      console.warn('revalidatePath warning:', err);
    }

    return NextResponse.json({ success: true, post: db.posts[postIndex] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        await supabaseAdmin.from('posts').delete().eq('id', params.id);
      } catch (e) {
        console.error('Supabase error deleting post:', e);
      }
    }

    const db = getDatabase();
    const initialLength = db.posts.length;
    db.posts = db.posts.filter((p) => p.id !== params.id);

    if (db.posts.length === initialLength) {
      return NextResponse.json({ success: false, message: 'Post not found' }, { status: 404 });
    }

    saveDatabase(db);

    try {
      revalidatePath('/', 'layout');
    } catch (err) {
      console.warn('revalidatePath warning:', err);
    }

    return NextResponse.json({ success: true, message: 'Post deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to delete post' }, { status: 500 });
  }
}
