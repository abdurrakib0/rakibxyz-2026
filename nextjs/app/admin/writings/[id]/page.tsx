import React from 'react';
import { getDatabaseAsync } from '@/lib/data';
import { notFound } from 'next/navigation';
import EssayEditorClient from '../EssayEditorClient';

export const dynamic = 'force-dynamic';

export default async function EditEssayPage({ params }: { params: { id: string } }) {
  const db = await getDatabaseAsync();
  const post = db.posts.find(
    (p) => String(p.id) === String(params.id) || p.slug === params.id
  );

  if (!post) {
    return (
      <div className="p-8 text-center font-mono">
        <h1 className="text-xl mb-4">Post not found</h1>
        <a href="/admin/writings" className="text-[var(--accent)] underline">
          ← Back to Writings
        </a>
      </div>
    );
  }

  return <EssayEditorClient initialPost={post} isNew={false} />;
}
