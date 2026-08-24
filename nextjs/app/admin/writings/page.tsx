'use client';

import React, { useState, useEffect } from 'react';
import { Post } from '@/lib/data';

export default function AdminWritingsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreateNew = () => {
    const newPost: Post = {
      id: '',
      slug: '',
      title: '',
      subtitle: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      isoDate: new Date().toISOString().split('T')[0],
      readTime: '6 min read',
      tag: 'Leadership & Systems',
      published: true,
      content: '',
    };
    setEditingPost(newPost);
    setIsNew(true);
  };

  const handleEdit = (post: Post) => {
    setEditingPost({ ...post });
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this essay?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setSaving(true);
    setMessage('');

    try {
      const url = isNew ? '/api/posts' : `/api/posts/${editingPost.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPost),
      });

      if (res.ok) {
        setMessage('Post saved successfully!');
        setEditingPost(null);
        fetchPosts();
      } else {
        setMessage('Failed to save post.');
      }
    } catch (err) {
      setMessage('Error saving post.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="font-mono text-sm text-[var(--ink-muted)]">Loading writings...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--rule)] pb-6">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal">
            Writings & Essays Manager
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-muted)]">
            Write, edit, and publish essays on systems, hiring, and tech operations.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="bg-[var(--accent)] text-white px-5 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] hover:bg-[var(--ink)] transition-colors cursor-pointer"
        >
          + Write New Essay
        </button>
      </div>

      {message && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded font-mono text-xs">
          {message}
        </div>
      )}

      {/* Editor Form Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius-lg)] max-w-3xl w-full p-6 md:p-8 my-auto shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-4">
              <h2 className="font-serif text-[1.5rem] text-[var(--ink)] font-normal">
                {isNew ? 'Write New Essay' : 'Edit Essay'}
              </h2>
              <button
                onClick={() => setEditingPost(null)}
                className="w-8 h-8 rounded-full bg-[var(--surface)] border border-[var(--rule)] flex items-center justify-center text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Title</label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  placeholder="e.g. The quiet advantage of a system"
                  required
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.9375rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Subtitle / Excerpt</label>
                <textarea
                  value={editingPost.subtitle}
                  onChange={(e) => setEditingPost({ ...editingPost, subtitle: e.target.value })}
                  placeholder="Brief summary or hook..."
                  rows={2}
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.875rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Tag / Category</label>
                  <input
                    type="text"
                    value={editingPost.tag}
                    onChange={(e) => setEditingPost({ ...editingPost, tag: e.target.value })}
                    placeholder="e.g. Systems & Leadership"
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.875rem] font-mono text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Read Time</label>
                  <input
                    type="text"
                    value={editingPost.readTime}
                    onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                    placeholder="e.g. 6 min read"
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.875rem] font-mono text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Date</label>
                  <input
                    type="text"
                    value={editingPost.date}
                    onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })}
                    placeholder="e.g. Aug 19, 2026"
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.875rem] font-mono text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[0.75rem] uppercase text-[var(--ink)]">Full Content (Markdown / Text)</label>
                <textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  placeholder="Write your article content here in Markdown or plain text..."
                  rows={10}
                  required
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-3 text-[0.9375rem] leading-[1.6] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-sans"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={editingPost.published}
                  onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                  className="w-4 h-4 text-[var(--accent)] rounded border-[var(--rule)]"
                />
                <label htmlFor="published" className="font-mono text-[0.8125rem] text-[var(--ink)] cursor-pointer">
                  Publish to Live Site Immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[var(--rule)] pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 border border-[var(--rule)] rounded-[var(--radius)] font-mono text-[0.8125rem] hover:bg-[var(--surface)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[var(--ink)] text-white px-6 py-2 rounded-[var(--radius)] font-mono text-[0.8125rem] hover:bg-[var(--accent)] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save & Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Writings Table */}
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--rule)] font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)] bg-[var(--bg)]">
              <th className="p-4">Title & Excerpt</th>
              <th className="p-4 hidden sm:table-cell">Category</th>
              <th className="p-4 hidden md:table-cell">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--rule)] text-[0.875rem]">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-[var(--bg)]/70 transition-colors">
                <td className="p-4">
                  <div className="font-serif text-[1rem] text-[var(--ink)] font-medium">
                    {post.title}
                  </div>
                  <div className="text-[0.75rem] text-[var(--ink-muted)] line-clamp-1 mt-0.5">
                    {post.subtitle}
                  </div>
                </td>
                <td className="p-4 hidden sm:table-cell font-mono text-[0.75rem] text-[var(--ink-muted)]">
                  {post.tag}
                </td>
                <td className="p-4 hidden md:table-cell font-mono text-[0.75rem] text-[var(--ink-muted)]">
                  {post.date}
                </td>
                <td className="p-4">
                  <span className={`font-mono text-[0.6875rem] px-2 py-0.5 rounded ${post.published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="font-mono text-[0.75rem] text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <span className="text-[var(--rule)]">·</span>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="font-mono text-[0.75rem] text-red-600 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
