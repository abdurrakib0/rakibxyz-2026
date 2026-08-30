'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Post } from '@/lib/data';
import { compressImage, formatBytes } from '@/lib/image-compressor';

const DRAFT_STORAGE_KEY = 'abdur_rakib_post_draft_v1';

// Converts rich pasted HTML (from Word, Google Docs, Notion, Web) into clean Markdown
function htmlToMarkdown(html: string): string {
  let md = html;

  md = md.replace(/<head>[\s\S]*?<\/head>/gi, '');
  md = md.replace(/<style>[\s\S]*?<\/style>/gi, '');
  md = md.replace(/<script>[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<!--[\s\S]*?-->/g, '');

  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  md = md.replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, '\n\n#### $1\n\n');

  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/(strong|b)>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/(em|i)>/gi, '*$2*');

  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (match, p1) => {
    const text = p1.trim().replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '\n');
    return `\n\n> ${text.split('\n').join('\n> ')}\n\n`;
  });

  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n\n```\n$1\n```\n\n');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  md = md.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<img\s+(?:[^>]*?\s+)?src="([^"]*)"(?:\s+alt="([^"]*)")?[^>]*>/gi, '![$2]($1)');

  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '\n\n$1\n\n');
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '\n\n$1\n\n');

  md = md.replace(/<hr[^>]*>/gi, '\n\n---\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');

  md = md.replace(/<[^>]+>/g, '');

  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");

  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

interface EssayEditorClientProps {
  initialPost?: Post | null;
  isNew?: boolean;
}

export default function EssayEditorClient({ initialPost, isNew = false }: EssayEditorClientProps) {
  const router = useRouter();

  const emptyPost: Post = {
    id: `post_${Date.now()}`,
    slug: '',
    title: '',
    subtitle: '',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    isoDate: new Date().toISOString().split('T')[0],
    readTime: '5 min read',
    tag: 'Systems & Leadership',
    coverImage: '',
    published: true,
    content: '',
  };

  const [post, setPost] = useState<Post>(initialPost || emptyPost);
  const [editorMode, setEditorMode] = useState<'write' | 'preview' | 'split'>('write');

  // Save status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Draft auto-save
  const [draftStatus, setDraftStatus] = useState<string>('');
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // Cover image upload
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingToolbar, setUploadingToolbar] = useState(false);
  const [compressionStats, setCompressionStats] = useState<string | null>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const toolbarFileInputRef = useRef<HTMLInputElement | null>(null);

  // Check saved draft on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title && isNew) {
          setHasSavedDraft(true);
        }
      }
    } catch (_) {}
  }, [isNew]);

  // Auto-save draft on changes
  useEffect(() => {
    if (!post.title && !post.content) return;
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(post));
        setDraftStatus('Draft saved locally');
        setTimeout(() => setDraftStatus(''), 2500);
      } catch (_) {}
    }, 1000);
    return () => clearTimeout(timeout);
  }, [post]);

  const handleRestoreDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPost(parsed);
        setHasSavedDraft(false);
        setStatusMessage('Draft restored from local backup.');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (_) {}
  };

  const handleTitleChange = (newTitle: string) => {
    const autoSlug = newTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    setPost((prev) => ({
      ...prev,
      title: newTitle,
      slug: isNew ? autoSlug : prev.slug || autoSlug,
    }));
  };

  const handleContentChange = (newContent: string) => {
    const words = newContent.trim() ? newContent.trim().split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setPost((prev) => ({
      ...prev,
      content: newContent,
      readTime: `${minutes} min read`,
    }));
  };

  const handleSmartPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData('text/html');
    if (html && (html.includes('<h') || html.includes('<strong') || html.includes('<ul') || html.includes('<p') || html.includes('<blockquote'))) {
      e.preventDefault();
      const markdown = htmlToMarkdown(html);
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const current = post.content || '';
        const updated = current.substring(0, start) + markdown + current.substring(end);
        handleContentChange(updated);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + markdown.length, start + markdown.length);
        }, 10);
      }
    }
  };

  const insertFormatting = (prefix: string, suffix = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = post.content || '';
    const selected = text.substring(start, end) || placeholder;

    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 10);
  };

  const handleCoverFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    setUploadingCover(true);
    setCompressionStats(null);

    try {
      const originalSize = file.size;
      const compressed = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1200,
        quality: 0.82,
        format: 'image/webp',
      });

      const stats = `Original: ${formatBytes(compressed.originalSize)} → WebP: ${formatBytes(compressed.compressedSize)} (${compressed.reductionPercent}% smaller)`;
      setCompressionStats(stats);

      const formData = new FormData();
      formData.append('file', compressed.file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setPost((prev) => ({ ...prev, coverImage: data.url }));
      } else {
        alert(data.message || 'Image upload failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Error compressing/uploading image:', err);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleToolbarImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploadingToolbar(true);

    try {
      const compressed = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1200,
        quality: 0.82,
        format: 'image/webp',
      });

      const formData = new FormData();
      formData.append('file', compressed.file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        insertFormatting(`\n\n![Image description](${data.url})\n\n`, '');
      } else {
        alert('Image upload failed.');
      }
    } catch (err) {
      console.error('Toolbar image upload error:', err);
    } finally {
      setUploadingToolbar(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!post.title.trim()) {
      alert('Please enter an essay title.');
      return;
    }

    if (!post.slug.trim()) {
      alert('Please enter a URL slug.');
      return;
    }

    setSaveStatus('saving');
    setStatusMessage('Saving essay...');

    try {
      const endpoint = isNew ? '/api/posts' : `/api/posts/${post.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus('success');
        setStatusMessage(isNew ? 'Essay published successfully!' : 'Essay updated successfully!');
        try {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch (_) {}

        setTimeout(() => {
          router.push('/admin/writings');
          router.refresh();
        }, 800);
      } else {
        setSaveStatus('error');
        setStatusMessage(data.message || 'Failed to save essay.');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage('Connection error. Please check your network.');
    }
  };

  const wordCount = post.content ? post.content.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
      {/* ── Top Bar Header (Substack / Notion style) ─────────────── */}
      <header className="sticky top-0 z-30 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--rule)] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/writings"
            className="flex items-center gap-1.5 font-mono text-[0.8125rem] text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline shrink-0 px-2.5 py-1.5 rounded border border-[var(--rule)] bg-[var(--bg)] hover:border-[var(--ink)] transition-colors"
          >
            <span>←</span>
            <span className="hidden sm:inline">All Writings</span>
          </Link>
          <div className="h-4 w-px bg-[var(--rule)] shrink-0 hidden sm:block" />
          <div className="min-w-0">
            <h1 className="font-serif text-[1.125rem] sm:text-[1.25rem] text-[var(--ink)] font-normal truncate leading-tight">
              {post.title || (isNew ? 'Untitled Essay' : 'Editing Essay')}
            </h1>
            <span className="font-mono text-[0.6875rem] text-[var(--ink-muted)] block mt-0.5">
              {wordCount} words · {post.readTime} · {post.published ? '🟢 Published' : '🟡 Draft'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] p-0.5 font-mono text-[0.75rem]">
            <button
              type="button"
              onClick={() => setEditorMode('write')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                editorMode === 'write'
                  ? 'bg-[var(--ink)] text-[var(--bg)] font-medium'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              ✏️ Write
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('split')}
              className={`hidden md:inline-block px-3 py-1.5 rounded transition-colors cursor-pointer ${
                editorMode === 'split'
                  ? 'bg-[var(--ink)] text-[var(--bg)] font-medium'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              🌓 Split
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('preview')}
              className={`px-3 py-1.5 rounded transition-colors cursor-pointer ${
                editorMode === 'preview'
                  ? 'bg-[var(--ink)] text-[var(--bg)] font-medium'
                  : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
              }`}
            >
              👁️ Preview
            </button>
          </div>

          {/* Draft Status Indicator */}
          {draftStatus && (
            <span className="font-mono text-[0.6875rem] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 hidden lg:inline">
              ✓ {draftStatus}
            </span>
          )}

          {/* Published Toggle */}
          <label className="flex items-center gap-1.5 font-mono text-[0.75rem] text-[var(--ink)] cursor-pointer px-2.5 py-1.5 rounded border border-[var(--rule)] bg-[var(--bg)]">
            <input
              type="checkbox"
              checked={post.published}
              onChange={(e) => setPost({ ...post, published: e.target.checked })}
              className="accent-[var(--accent)] cursor-pointer"
            />
            <span className="hidden sm:inline">{post.published ? 'Live' : 'Draft'}</span>
          </label>

          {/* Primary Save Button */}
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saveStatus === 'saving'}
            className={`px-5 py-2 rounded-[var(--radius)] font-mono text-[0.8125rem] font-medium text-white transition-all cursor-pointer shadow-sm ${
              saveStatus === 'saving'
                ? 'bg-amber-600 cursor-wait'
                : saveStatus === 'success'
                ? 'bg-emerald-600'
                : 'bg-[var(--accent)] hover:bg-[var(--ink)]'
            }`}
          >
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'success'
              ? '✓ Saved!'
              : isNew
              ? 'Publish Essay'
              : 'Save Changes'}
          </button>
        </div>
      </header>

      {/* ── Status message banner ───────────────────────────────── */}
      {statusMessage && (
        <div
          className={`px-6 py-2.5 font-mono text-[0.8125rem] flex items-center justify-between border-b ${
            saveStatus === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} className="text-sm cursor-pointer opacity-60 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* ── Draft Restore Prompt ────────────────────────────────── */}
      {hasSavedDraft && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between font-mono text-[0.75rem] text-amber-900">
          <span>📋 You have an uncommitted auto-saved draft from a previous session.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreDraft}
              className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 cursor-pointer font-semibold"
            >
              Restore Draft
            </button>
            <button
              onClick={() => {
                localStorage.removeItem(DRAFT_STORAGE_KEY);
                setHasSavedDraft(false);
              }}
              className="text-amber-700 hover:underline cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* ── Main Canvas ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
        {/* Title & Slug */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={post.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Essay Title..."
            required
            className="w-full font-serif text-[2rem] sm:text-[2.75rem] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/40 bg-transparent border-0 outline-none leading-tight font-normal"
          />

          <div className="flex items-center gap-2 font-mono text-[0.8125rem] text-[var(--ink-muted)] bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-2">
            <span className="shrink-0 font-medium">Permalink:</span>
            <span className="shrink-0 text-[var(--ink-muted)]">/writing/</span>
            <input
              type="text"
              value={post.slug}
              onChange={(e) => setPost({ ...post, slug: e.target.value })}
              placeholder="url-slug"
              required
              className="w-full bg-transparent border-0 outline-none text-[var(--ink)] font-mono font-semibold"
            />
          </div>
        </div>

        {/* Metadata Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] p-4 sm:p-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] font-medium">
              Category / Tag
            </label>
            <input
              type="text"
              value={post.tag}
              onChange={(e) => setPost({ ...post, tag: e.target.value })}
              placeholder="e.g. Systems & Leadership"
              className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.8125rem] font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] font-medium">
              Publish Date
            </label>
            <input
              type="text"
              value={post.date}
              onChange={(e) => setPost({ ...post, date: e.target.value })}
              placeholder="e.g. Aug 30, 2026"
              className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.8125rem] font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] font-medium">
              Read Time (Auto)
            </label>
            <input
              type="text"
              value={post.readTime}
              onChange={(e) => setPost({ ...post, readTime: e.target.value })}
              placeholder="e.g. 5 min read"
              className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.8125rem] font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
            />
          </div>

          <div className="sm:col-span-3 flex flex-col gap-1.5">
            <label className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink-muted)] font-medium">
              Subtitle / Lead Hook
            </label>
            <textarea
              value={post.subtitle}
              onChange={(e) => setPost({ ...post, subtitle: e.target.value })}
              placeholder="A clear 1-2 sentence overview that appears on list cards and in the article lead..."
              rows={2}
              className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] px-3.5 py-2 text-[0.875rem] text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
            />
          </div>
        </div>

        {/* Cover Image Upload (WebP Compressed) */}
        <div className="flex flex-col gap-3 p-5 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)]">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[0.6875rem] uppercase tracking-wider text-[var(--ink)] font-bold flex items-center gap-2">
              <span>🖼️ Cover / Thumbnail Image</span>
              {uploadingCover && (
                <span className="text-[var(--accent)] animate-pulse font-normal">
                  (Compressing &amp; Uploading WebP...)
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="font-mono text-[0.6875rem] text-[var(--accent)] hover:underline cursor-pointer"
            >
              {showUrlInput ? 'Switch to Device Upload' : 'or enter Image URL'}
            </button>
          </div>

          {compressionStats && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded font-mono text-[0.75rem] text-emerald-800">
              ✓ {compressionStats}
            </div>
          )}

          {showUrlInput ? (
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <input
                type="text"
                value={post.coverImage}
                onChange={(e) => setPost({ ...post, coverImage: e.target.value })}
                placeholder="https://images.unsplash.com/... or /uploads/..."
                className="w-full bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.8125rem] font-mono text-[var(--ink)]"
              />
              {post.coverImage && (
                <div className="shrink-0 w-24 h-16 rounded border border-[var(--rule)] overflow-hidden bg-black/5">
                  <img src={post.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingCover(true);
              }}
              onDragLeave={() => setIsDraggingCover(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingCover(false);
                if (e.dataTransfer.files?.[0]) handleCoverFileUpload(e.dataTransfer.files[0]);
              }}
              onClick={() => coverFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[var(--radius)] p-4 text-center cursor-pointer transition-all ${
                isDraggingCover
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                  : 'border-[var(--rule)] hover:border-[var(--ink)]/40 bg-[var(--bg)]'
              }`}
            >
              <input
                type="file"
                ref={coverFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleCoverFileUpload(e.target.files[0]);
                }}
              />

              {post.coverImage ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 rounded border border-[var(--rule)] overflow-hidden bg-black/5 shrink-0">
                      <img src={post.coverImage} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left">
                      <div className="font-mono text-xs text-[var(--ink)] font-semibold">
                        Image Attached &amp; Optimized
                      </div>
                      <div className="font-mono text-[0.6875rem] text-[var(--ink-muted)] truncate max-w-xs sm:max-w-md">
                        {post.coverImage}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        coverFileInputRef.current?.click();
                      }}
                      className="bg-[var(--surface)] hover:bg-[var(--bg)] text-[var(--ink)] border border-[var(--rule)] px-3 py-1 rounded font-mono text-xs cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPost({ ...post, coverImage: '' });
                        setCompressionStats(null);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-mono text-xs cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-3 flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--rule)] flex items-center justify-center text-lg">
                    📁
                  </div>
                  <div className="font-mono text-xs text-[var(--ink)] font-semibold">
                    Click to upload cover image from your device (PC / Phone)
                  </div>
                  <div className="font-mono text-[0.6875rem] text-[var(--ink-muted)]">
                    Auto-compressed to ultra-lightweight WebP format (typically 80-95% smaller)
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Visual Markdown Editor & Live Preview ────────────────── */}
        <div className="flex flex-col gap-2">
          {/* Formatting Toolbar */}
          <div className="sticky top-[4.25rem] z-20 flex items-center gap-1.5 flex-wrap bg-[var(--surface)] border border-[var(--rule)] rounded-t-[var(--radius)] p-2 backdrop-blur-md shadow-2xs">
            <button
              type="button"
              onClick={() => insertFormatting('## ', '', 'Section Heading')}
              className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] font-bold cursor-pointer transition-colors"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('### ', '', 'Sub-section Heading')}
              className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] font-bold cursor-pointer transition-colors"
              title="Heading 3"
            >
              H3
            </button>
            <div className="w-px h-5 bg-[var(--rule)] mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'bold text')}
              className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] font-bold cursor-pointer transition-colors"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'italic text')}
              className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] italic cursor-pointer transition-colors"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('> ', '', 'Important quote or reflection')}
              className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer transition-colors"
              title="Quote Block"
            >
              &ldquo; Quote
            </button>
            <div className="w-px h-5 bg-[var(--rule)] mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('- ', '', 'List item')}
              className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer transition-colors"
              title="Bullet List"
            >
              • Bullet
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('1. ', '', 'Numbered item')}
              className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer transition-colors"
              title="Numbered List"
            >
              1. Numbered
            </button>
            <div className="w-px h-5 bg-[var(--rule)] mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('`', '`', 'code')}
              className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer transition-colors"
              title="Inline Code"
            >
              &lt;/&gt; Code
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n\n```\n', '\n```\n', '// Code snippet here')}
              className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer transition-colors"
              title="Code Block"
            >
              Code Block
            </button>
            <div className="w-px h-5 bg-[var(--rule)] mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('[', '](https://example.com)', 'Link text')}
              className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer transition-colors"
              title="Link"
            >
              🔗 Link
            </button>
            <button
              type="button"
              onClick={() => toolbarFileInputRef.current?.click()}
              className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer transition-colors flex items-center gap-1"
              title="Upload Image into Article"
            >
              <span>🖼️</span>
              <span>{uploadingToolbar ? 'Uploading...' : 'Insert Image'}</span>
            </button>
            <input
              type="file"
              ref={toolbarFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleToolbarImageUpload(e.target.files[0]);
              }}
            />

            <div className="ml-auto flex items-center gap-2">
              <span className="font-mono text-[0.6875rem] text-[var(--accent)] font-medium hidden sm:inline">
                💡 Paste formatted text from Docs / Notion directly
              </span>
            </div>
          </div>

          {/* Editor Body: Write / Split / Preview */}
          {editorMode === 'write' && (
            <textarea
              ref={textareaRef}
              value={post.content}
              onChange={(e) => handleContentChange(e.target.value)}
              onPaste={handleSmartPaste}
              placeholder="Write your essay in Markdown or paste directly from Google Docs / Notion / Word...

## Section Title

Your paragraphs here. Support for **bold**, *italic*, blockquotes, and lists."
              className="w-full min-h-[600px] bg-[var(--surface)] border border-t-0 border-[var(--rule)] rounded-b-[var(--radius)] p-6 font-mono text-[0.9375rem] leading-relaxed text-[var(--ink)] focus:outline-none resize-y"
            />
          )}

          {editorMode === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-t-0 border-[var(--rule)] rounded-b-[var(--radius)] bg-[var(--surface)] p-4">
              <textarea
                ref={textareaRef}
                value={post.content}
                onChange={(e) => handleContentChange(e.target.value)}
                onPaste={handleSmartPaste}
                placeholder="Write markdown here..."
                className="w-full min-h-[600px] bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] p-4 font-mono text-[0.875rem] leading-relaxed text-[var(--ink)] focus:outline-none resize-none"
              />
              <div className="min-h-[600px] bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] p-6 overflow-y-auto prose prose-stone max-w-none">
                <h1 className="font-serif text-[2rem] font-normal leading-tight mb-2">{post.title || 'Untitled Essay'}</h1>
                {post.subtitle && <p className="text-lg text-[var(--ink-muted)] italic mb-6">{post.subtitle}</p>}
                {post.coverImage && (
                  <img src={post.coverImage} alt="Cover" className="w-full h-64 object-cover rounded mb-6" />
                )}
                <div className="whitespace-pre-wrap font-sans text-base leading-relaxed text-[var(--ink)]">
                  {post.content || 'Nothing to preview yet. Start typing on the left.'}
                </div>
              </div>
            </div>
          )}

          {editorMode === 'preview' && (
            <div className="border border-t-0 border-[var(--rule)] rounded-b-[var(--radius)] bg-[var(--surface)] p-8 sm:p-12">
              <div className="max-w-2xl mx-auto flex flex-col gap-6">
                <div className="flex items-center gap-2 font-mono text-[0.75rem] text-[var(--ink-muted)]">
                  <span className="text-[var(--accent)] font-semibold">{post.tag}</span>
                  <span>·</span>
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h1 className="font-serif text-[2.5rem] sm:text-[3.25rem] text-[var(--ink)] font-normal leading-tight">
                  {post.title || 'Untitled Essay'}
                </h1>
                {post.subtitle && (
                  <p className="font-serif text-[1.25rem] text-[var(--ink-muted)] leading-relaxed italic border-l-2 border-[var(--accent)] pl-4">
                    {post.subtitle}
                  </p>
                )}
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt="Cover preview"
                    className="w-full max-h-96 object-cover rounded-[var(--radius-lg)] border border-[var(--rule)] shadow-sm"
                  />
                )}
                <div className="whitespace-pre-wrap font-sans text-base leading-relaxed text-[var(--ink)] pt-4 border-t border-[var(--rule)]">
                  {post.content || 'No content written yet.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between gap-4 pt-6 border-t border-[var(--rule)]">
          <Link
            href="/admin/writings"
            className="font-mono text-[0.8125rem] text-[var(--ink-muted)] hover:text-[var(--ink)] no-underline"
          >
            ← Cancel &amp; Back to All Writings
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saveStatus === 'saving'}
              className="bg-[var(--accent)] hover:bg-[var(--ink)] text-white px-6 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] font-medium transition-colors cursor-pointer shadow-sm"
            >
              {isNew ? 'Publish Essay' : 'Save Changes'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
