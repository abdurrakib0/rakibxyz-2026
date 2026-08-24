'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Post } from '@/lib/data';

export default function AdminWritingsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts', { cache: 'no-store' });
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

  const calculateReadTime = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  const handleCreateNew = () => {
    const newPost: Post = {
      id: '',
      slug: '',
      title: '',
      subtitle: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      isoDate: new Date().toISOString().split('T')[0],
      readTime: '1 min read',
      tag: 'Systems & Leadership',
      published: true,
      content: '',
    };
    setEditingPost(newPost);
    setIsNew(true);
    setEditorMode('write');
  };

  const handleEdit = (post: Post) => {
    setEditingPost({ ...post });
    setIsNew(false);
    setEditorMode('write');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this essay?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
        setMessage('Post deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  // Visual Toolbar Insert Helper
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    if (!textareaRef.current || !editingPost) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = editingPost.content;

    const selectedText = currentText.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = currentText.substring(0, start) + replacement + currentText.substring(end);
    const newReadTime = calculateReadTime(newContent);

    setEditingPost({
      ...editingPost,
      content: newContent,
      readTime: newReadTime,
    });

    // Reset selection focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  const handleContentChange = (val: string) => {
    if (!editingPost) return;
    setEditingPost({
      ...editingPost,
      content: val,
      readTime: calculateReadTime(val),
    });
  };

  const handleTitleChange = (val: string) => {
    if (!editingPost) return;
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    setEditingPost({
      ...editingPost,
      title: val,
      slug: isNew || !editingPost.slug ? autoSlug : editingPost.slug,
    });
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

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Post saved & published successfully!');
        setEditingPost(null);
        fetchPosts();
      } else {
        setMessage(data.message || 'Failed to save post.');
      }
    } catch (err: any) {
      setMessage(`Error saving post: ${err.message || 'Network error'}`);
    } finally {
      setSaving(false);
    }
  };

  const wordCount = editingPost?.content
    ? editingPost.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  if (loading) {
    return <div className="font-mono text-sm text-[var(--ink-muted)]">Loading writings...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal tracking-tight">
            Writings &amp; Essays Manager
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-muted)] mt-1">
            Visual editor for writing, previewing, and publishing essays.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="bg-[var(--accent)] text-white px-5 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] hover:bg-[var(--ink)] transition-colors cursor-pointer self-start sm:self-auto"
        >
          + Write New Essay
        </button>
      </div>

      {message && (
        <div className="p-3.5 bg-green-50 border border-green-200 text-green-800 rounded font-mono text-xs">
          {message}
        </div>
      )}

      {/* Visual Editor Modal (Full WordPress / Notion style) */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius-lg)] max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--rule)] px-6 py-4 bg-[var(--surface)]">
              <div className="flex items-center gap-4">
                <h2 className="font-serif text-[1.375rem] text-[var(--ink)] font-medium">
                  {isNew ? 'Write New Essay' : 'Edit Essay'}
                </h2>
                <div className="flex items-center bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] p-0.5 font-mono text-[0.75rem]">
                  <button
                    type="button"
                    onClick={() => setEditorMode('write')}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      editorMode === 'write'
                        ? 'bg-[var(--ink)] text-[var(--bg)] font-medium'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    ✏️ Visual Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode('preview')}
                    className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                      editorMode === 'preview'
                        ? 'bg-[var(--ink)] text-[var(--bg)] font-medium'
                        : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                    }`}
                  >
                    👁️ Live Preview
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[0.6875rem] text-[var(--ink-muted)] hidden sm:inline">
                  {wordCount} words · {editingPost.readTime}
                </span>
                <button
                  onClick={() => setEditingPost(null)}
                  className="w-8 h-8 rounded-full bg-[var(--bg)] border border-[var(--rule)] flex items-center justify-center text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              {/* Meta Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">
                    Article Title
                  </label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. The quiet advantage of a system"
                    required
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-2.5 text-[1rem] font-serif text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">
                    URL Slug (Auto-generated)
                  </label>
                  <div className="flex items-center bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.8125rem] font-mono text-[var(--ink)]">
                    <span className="text-[var(--ink-muted)]">/writing/</span>
                    <input
                      type="text"
                      value={editingPost.slug}
                      onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                      placeholder="slug"
                      required
                      className="bg-transparent border-0 outline-none w-full text-[var(--ink)] font-mono ml-0.5"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">
                  Subtitle / Hook (Displays in list cards and lead paragraph)
                </label>
                <textarea
                  value={editingPost.subtitle}
                  onChange={(e) => setEditingPost({ ...editingPost, subtitle: e.target.value })}
                  placeholder="A clear 1-2 sentence overview or thesis of the essay..."
                  rows={2}
                  className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">
                    Category / Tag
                  </label>
                  <input
                    type="text"
                    value={editingPost.tag}
                    onChange={(e) => setEditingPost({ ...editingPost, tag: e.target.value })}
                    placeholder="e.g. Systems & Leadership"
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.8125rem] font-mono text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">
                    Date
                  </label>
                  <input
                    type="text"
                    value={editingPost.date}
                    onChange={(e) => setEditingPost({ ...editingPost, date: e.target.value })}
                    placeholder="e.g. Aug 24, 2026"
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.8125rem] font-mono text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">
                    Read Time (Auto-calculated)
                  </label>
                  <input
                    type="text"
                    value={editingPost.readTime}
                    onChange={(e) => setEditingPost({ ...editingPost, readTime: e.target.value })}
                    placeholder="e.g. 5 min read"
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.8125rem] font-mono text-[var(--ink)]"
                  />
                </div>
              </div>

              {/* EDITOR AREA: WRITE vs LIVE PREVIEW */}
              {editorMode === 'write' ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink-muted)]">
                      Article Content (Visual Editor &amp; Markdown)
                    </label>
                    <span className="font-mono text-[0.6875rem] text-[var(--ink-muted)]">
                      Use toolbar buttons or type Markdown directly
                    </span>
                  </div>

                  {/* WordPress-style Formatting Toolbar */}
                  <div className="flex items-center gap-1.5 flex-wrap bg-[var(--surface)] border border-[var(--rule)] rounded-t-[var(--radius)] p-2">
                    <button
                      type="button"
                      onClick={() => insertFormatting('## ', '', 'Section Heading')}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] font-bold cursor-pointer"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('### ', '', 'Sub-section Heading')}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] font-bold cursor-pointer"
                      title="Heading 3"
                    >
                      H3
                    </button>
                    <div className="w-px h-5 bg-[var(--rule)] mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**', 'bold text')}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] font-bold cursor-pointer"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('*', '*', 'italic text')}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] italic cursor-pointer"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('> ', '', 'Important quote or reflection')}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer"
                      title="Quote Block"
                    >
                      &ldquo; Quote
                    </button>
                    <div className="w-px h-5 bg-[var(--rule)] mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting('- ', '', 'List item')}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer"
                      title="Bullet List"
                    >
                      • Bullet
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('1. ', '', 'Numbered item')}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer"
                      title="Numbered List"
                    >
                      1. Numbered
                    </button>
                    <div className="w-px h-5 bg-[var(--rule)] mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting('`', '`', 'code')}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer"
                      title="Inline Code"
                    >
                      &lt;/&gt; Code
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('```\n', '\n```', '// Code snippet here')}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer"
                      title="Code Block"
                    >
                      &#123;&#125; Block
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('[', '](https://example.com)', 'Link text')}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer"
                      title="Insert Link"
                    >
                      🔗 Link
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('\n\n---\n\n')}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer"
                      title="Horizontal Divider"
                    >
                      ― Divider
                    </button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={editingPost.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Write your article here... Tip: Click the toolbar buttons above to format headings, quotes, bold, links, and code blocks."
                    rows={14}
                    required
                    className="bg-[var(--surface)] border border-[var(--rule)] rounded-b-[var(--radius)] p-4 text-[0.9375rem] leading-[1.7] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-sans border-t-0 resize-y"
                  />
                </div>
              ) : (
                /* LIVE VISUAL PREVIEW TAB */
                <div className="flex flex-col gap-4 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-6 md:p-8">
                  <div className="flex items-center justify-between border-b border-[var(--rule)] pb-4">
                    <span className="font-mono text-[0.75rem] uppercase tracking-wider text-[var(--accent)]">
                      {editingPost.tag || 'Systems & Leadership'} · {editingPost.date} · {editingPost.readTime}
                    </span>
                    <span className="font-mono text-[0.6875rem] text-[var(--ink-muted)]">
                      Live Design System Preview
                    </span>
                  </div>

                  <h1 className="font-serif text-[2.25rem] text-[var(--ink)] leading-[1.2] font-normal">
                    {editingPost.title || 'Untitled Essay'}
                  </h1>

                  {editingPost.subtitle && (
                    <p className="text-[1.125rem] text-[var(--ink-muted)] leading-[1.6]">
                      {editingPost.subtitle}
                    </p>
                  )}

                  <div className="h-px bg-[var(--rule)] my-2" />

                  {/* Rendered Body */}
                  <div className="modal-article-body flex flex-col gap-5 text-[1.0625rem] leading-[1.8] text-[var(--ink)]">
                    {editingPost.content ? (
                      editingPost.content.split('\n\n').map((paragraph, idx) => {
                        const trimmed = paragraph.trim();
                        if (trimmed.startsWith('## ')) {
                          return (
                            <h2
                              key={idx}
                              className="font-serif text-[1.625rem] text-[var(--ink)] font-normal mt-4"
                            >
                              {trimmed.replace('## ', '')}
                            </h2>
                          );
                        }
                        if (trimmed.startsWith('### ')) {
                          return (
                            <h3
                              key={idx}
                              className="font-serif text-[1.35rem] text-[var(--ink)] font-normal mt-3"
                            >
                              {trimmed.replace('### ', '')}
                            </h3>
                          );
                        }
                        if (trimmed.startsWith('> ')) {
                          return (
                            <blockquote
                              key={idx}
                              className="border-l-2 border-[var(--accent)] pl-4 italic text-[var(--ink-muted)] my-2"
                            >
                              {trimmed.replace('> ', '')}
                            </blockquote>
                          );
                        }
                        if (trimmed.startsWith('```')) {
                          const code = trimmed.replace(/```/g, '').trim();
                          return (
                            <pre
                              key={idx}
                              className="bg-[var(--bg)] border border-[var(--rule)] rounded p-4 font-mono text-[0.8125rem] overflow-x-auto text-[var(--ink)]"
                            >
                              <code>{code}</code>
                            </pre>
                          );
                        }
                        if (trimmed === '---') {
                          return <hr key={idx} className="border-[var(--rule)] my-4" />;
                        }
                        return <p key={idx}>{paragraph}</p>;
                      })
                    ) : (
                      <p className="italic text-[var(--ink-muted)] font-mono text-sm">
                        Content is empty. Click &quot;Visual Write&quot; above to compose your essay.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Publish Toggle & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[var(--rule)] pt-5 mt-auto">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={editingPost.published}
                    onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                    className="w-4 h-4 text-[var(--accent)] rounded border-[var(--rule)] cursor-pointer"
                  />
                  <label htmlFor="published" className="font-mono text-[0.8125rem] text-[var(--ink)] cursor-pointer">
                    Publish to Live Site Immediately ({editingPost.published ? 'Public' : 'Draft'})
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 border border-[var(--rule)] rounded-[var(--radius)] font-mono text-[0.8125rem] hover:bg-[var(--surface)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[var(--ink)] hover:bg-[var(--accent)] text-white px-7 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {saving ? 'Saving...' : isNew ? 'Publish Essay' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Writings Table List */}
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--rule)] font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)] bg-[var(--bg)]">
              <th className="p-4">Title &amp; Subtitle</th>
              <th className="p-4 hidden sm:table-cell">Category</th>
              <th className="p-4 hidden md:table-cell">Date &amp; Read Time</th>
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
                  {post.date} · {post.readTime}
                </td>
                <td className="p-4">
                  <span
                    className={`font-mono text-[0.6875rem] px-2 py-0.5 rounded ${
                      post.published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="font-mono text-[0.75rem] text-[var(--accent)] hover:underline cursor-pointer border-0 bg-transparent p-0"
                    >
                      Edit
                    </button>
                    <span className="text-[var(--rule)]">·</span>
                    <a
                      href={`/writing/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[0.75rem] text-[var(--ink)] hover:underline no-underline"
                    >
                      View ↗
                    </a>
                    <span className="text-[var(--rule)]">·</span>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="font-mono text-[0.75rem] text-red-600 hover:underline cursor-pointer border-0 bg-transparent p-0"
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
