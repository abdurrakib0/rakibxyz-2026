'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Post } from '@/lib/data';

// Converts rich pasted HTML (from Word, Google Docs, Notion, Web) into clean Markdown
function htmlToMarkdown(html: string): string {
  let md = html;

  // Remove doc headers, styles, and scripts
  md = md.replace(/<head>[\s\S]*?<\/head>/gi, '');
  md = md.replace(/<style>[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<script>[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<!--[\s\S]*?-->/g, '');

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  md = md.replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, '\n\n#### $1\n\n');

  // Bold & Italic
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, p1) => {
    const text = p1.trim().replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '\n');
    return `\n\n> ${text.split('\n').join('\n> ')}\n\n`;
  });

  // Code blocks & inline code
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n\n```\n$1\n```\n\n');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Links & Images
  md = md.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img\s+(?:[^>]*?\s+)?src="([^"]*)"(?:\s+alt="([^"]*)")?[^>]*>/gi, '![$2]($1)');

  // Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '\n\n$1\n\n');
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '\n\n$1\n\n');

  // Paragraphs & Breaks
  md = md.replace(/<hr[^>]*>/gi, '\n\n---\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");

  // Clean excessive empty lines
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

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
      coverImage: '',
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

  // Smart Paste Handler: Converts copied rich formatted text into clean Markdown
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData('text/html');
    if (!html || html.trim() === '') return; // Let plain text paste normally

    e.preventDefault();
    const markdown = htmlToMarkdown(html);

    const textarea = textareaRef.current;
    if (!textarea || !editingPost) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = editingPost.content || '';

    const newContent = currentText.substring(0, start) + markdown + currentText.substring(end);
    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + markdown.length, start + markdown.length);
    }, 50);
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

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 50);
  };

  const handleInsertImage = () => {
    const url = prompt('Enter Image URL (e.g. https://images.unsplash.com/... or /img/photo.jpg):');
    if (!url) return;
    const alt = prompt('Enter Image Description / Caption (optional):', 'Featured image') || 'Image';
    insertFormatting(`\n\n![${alt}](`, `${url})\n\n`, '');
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
            Visual editor with Cover Image support, Rich-Text Paste preservation, and live preview.
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

      {/* Visual Editor Modal */}
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

              {/* Cover Image URL & Thumbnail Preview */}
              <div className="flex flex-col gap-2 p-4 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)]">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink)] font-bold">
                    Featured Thumbnail / Cover Image URL
                  </label>
                  <span className="font-mono text-[0.6875rem] text-[var(--ink-muted)]">
                    Direct Image URL (.jpg, .png, .webp) or Unsplash link
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <input
                    type="text"
                    value={editingPost.coverImage || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                    placeholder="e.g. https://images.unsplash.com/photo-... or /img/cover.jpg"
                    className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.8125rem] font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] flex-1 w-full"
                  />
                  {editingPost.coverImage && (
                    <div className="relative group w-24 h-14 rounded overflow-hidden border border-[var(--rule)] bg-black shrink-0">
                      <img
                        src={editingPost.coverImage}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingPost({ ...editingPost, coverImage: '' })}
                        className="absolute inset-0 bg-black/60 text-white font-mono text-[0.6875rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
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
                      Article Content (Smart Paste &amp; Visual Formatting Enabled)
                    </label>
                    <span className="font-mono text-[0.6875rem] text-[var(--accent)] font-medium">
                      💡 Pasting formatted text preserves headings, bold, italic &amp; lists
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
                      onClick={handleInsertImage}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer"
                      title="Insert Image"
                    >
                      🖼️ Image
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

                  {/* Textarea with smart onPaste handler */}
                  <textarea
                    ref={textareaRef}
                    value={editingPost.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Write or paste your article here... Formatted text copied from Word, Docs, Notion, or Web will automatically preserve bold, italic, headings, links, and lists."
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

                  {/* Live Preview Cover Image */}
                  {editingPost.coverImage && (
                    <div className="w-full max-h-[360px] rounded-[var(--radius)] overflow-hidden border border-[var(--rule)] bg-black my-2">
                      <img
                        src={editingPost.coverImage}
                        alt="Cover Preview"
                        className="w-full h-full object-cover max-h-[360px]"
                      />
                    </div>
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
                        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
                        if (imgMatch) {
                          return (
                            <div key={idx} className="rounded overflow-hidden border border-[var(--rule)] my-3">
                              <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full h-auto" />
                              {imgMatch[1] && (
                                <span className="block p-2 text-center text-xs font-mono text-[var(--ink-muted)] bg-[var(--bg)]">
                                  {imgMatch[1]}
                                </span>
                              )}
                            </div>
                          );
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
              <th className="p-4">Cover &amp; Title</th>
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
                  <div className="flex items-center gap-3">
                    {post.coverImage ? (
                      <div className="w-12 h-12 rounded overflow-hidden border border-[var(--rule)] bg-black shrink-0">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded border border-dashed border-[var(--rule)] bg-[var(--bg)] shrink-0 flex items-center justify-center font-mono text-[0.625rem] text-[var(--ink-muted)]">
                        No img
                      </div>
                    )}
                    <div>
                      <div className="font-serif text-[1rem] text-[var(--ink)] font-medium">
                        {post.title}
                      </div>
                      <div className="text-[0.75rem] text-[var(--ink-muted)] line-clamp-1 mt-0.5">
                        {post.subtitle}
                      </div>
                    </div>
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
