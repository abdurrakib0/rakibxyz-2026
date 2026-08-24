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
          .from('podcasts')
          .update({
            title: updatedData.title,
            guest: updatedData.guest,
            date: updatedData.date,
            tag: updatedData.tag,
            youtube_url: updatedData.youtubeUrl,
          })
          .eq('id', params.id);
      } catch (e) {
        console.error('Supabase error updating podcast:', e);
      }
    }

    const db = getDatabase();
    const podcastIndex = db.podcasts.findIndex((p) => p.id === params.id);
    if (podcastIndex === -1) {
      return NextResponse.json({ success: false, message: 'Podcast not found' }, { status: 404 });
    }

    db.podcasts[podcastIndex] = {
      ...db.podcasts[podcastIndex],
      ...updatedData,
    };

    saveDatabase(db);

    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');

    return NextResponse.json({ success: true, podcast: db.podcasts[podcastIndex] });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update podcast' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (isSupabaseConfigured() && supabaseAdmin) {
      try {
        await supabaseAdmin.from('podcasts').delete().eq('id', params.id);
      } catch (e) {
        console.error('Supabase error deleting podcast:', e);
      }
    }

    const db = getDatabase();
    const initialLength = db.podcasts.length;
    db.podcasts = db.podcasts.filter((p) => p.id !== params.id);

    if (db.podcasts.length === initialLength) {
      return NextResponse.json({ success: false, message: 'Podcast not found' }, { status: 404 });
    }

    saveDatabase(db);

    revalidatePath('/', 'layout');
    revalidatePath('/', 'page');

    return NextResponse.json({ success: true, message: 'Podcast deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete podcast' }, { status: 500 });
  }
}
