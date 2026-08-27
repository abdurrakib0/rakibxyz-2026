'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Post } from '@/lib/data';
import { compressImage, formatBytes } from '@/lib/image-compressor';

const DRAFT_STORAGE_KEY = 'abdur_rakib_post_draft_v1';
const ITEMS_PER_PAGE = 10;

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

interface WritingsClientProps {
  initialPosts: Post[];
}

export default function WritingsClient({ initialPosts }: WritingsClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');

  // Button lifecycle state: 'idle' | 'saving' | 'success' | 'error'
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Auto-Save Draft state
  const [draftStatus, setDraftStatus] = useState<string>('');
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // Image Upload & Compression state
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingToolbar, setUploadingToolbar] = useState(false);
  const [compressionStats, setCompressionStats] = useState<string | null>(null);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const toolbarFileInputRef = useRef<HTMLInputElement | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if there is an unsaved draft stored
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        setHasSavedDraft(true);
      }
    } catch (e) {}
  }, []);

  // Auto-Save Draft watcher
  useEffect(() => {
    if (!editingPost) return;

    // Clear previous timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setDraftStatus('Saving draft...');

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            post: editingPost,
            savedAt: new Date().toISOString(),
            isNew,
          })
        );
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setDraftStatus(`Draft auto-saved at ${timeStr}`);
      } catch (e) {
        setDraftStatus('');
      }
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [editingPost, isNew]);

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
    setSaveStatus('idle');
    setCompressionStats(null);
  };

  const handleRestoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.post) {
          setEditingPost(parsed.post);
          setIsNew(parsed.isNew ?? true);
          setEditorMode('write');
          setSaveStatus('idle');
          const time = parsed.savedAt ? new Date(parsed.savedAt).toLocaleTimeString() : '';
          setDraftStatus(`Restored draft from ${time}`);
          setHasSavedDraft(false);
        }
      }
    } catch (e) {
      alert('Failed to restore draft.');
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost({ ...post });
    setIsNew(false);
    setEditorMode('write');
    setSaveStatus('idle');
    setCompressionStats(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this essay?')) return;
    // Instant optimistic update
    setPosts((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // Helper to handle client-side image compression and upload
  const compressAndUploadImage = async (file: File): Promise<string> => {
    // 1. Compress image to modern WebP format
    const compressedResult = await compressImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.85,
      format: 'image/webp',
    });

    const origStr = formatBytes(compressedResult.originalSize);
    const compStr = formatBytes(compressedResult.compressedSize);
    const percent = compressedResult.reductionPercent;

    if (percent > 0) {
      setCompressionStats(`⚡ Compressed: ${origStr} ➔ ${compStr} (${percent}% smaller WebP)`);
    }

    // 2. Upload compressed WebP to server / Supabase
    const formData = new FormData();
    formData.append('file', compressedResult.file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok && data.success && data.url) {
      return data.url;
    } else {
      throw new Error(data.message || 'Image upload failed');
    }
  };

  // Cover Image device file upload handler
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPost) return;

    setUploadingCover(true);
    setCompressionStats(null);
    try {
      const uploadedUrl = await compressAndUploadImage(file);
      if (uploadedUrl) {
        setEditingPost({ ...editingPost, coverImage: uploadedUrl });
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = '';
    }
  };

  // Cover Image drag and drop handler
  const handleCoverFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCover(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !editingPost) return;

    setUploadingCover(true);
    setCompressionStats(null);
    try {
      const uploadedUrl = await compressAndUploadImage(file);
      if (uploadedUrl) {
        setEditingPost({ ...editingPost, coverImage: uploadedUrl });
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setUploadingCover(false);
    }
  };

  // Toolbar Image device file upload handler (inserts Markdown image directly into content)
  const handleToolbarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPost) return;

    setUploadingToolbar(true);
    try {
      const uploadedUrl = await compressAndUploadImage(file);
      if (uploadedUrl) {
        insertMarkdownImage(uploadedUrl, file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setUploadingToolbar(false);
      if (toolbarFileInputRef.current) toolbarFileInputRef.current.value = '';
    }
  };

  // Inserts `![alt](url)` at the current cursor position in textarea
  const insertMarkdownImage = (url: string, alt: string = 'Image') => {
    if (!textareaRef.current || !editingPost) return;
    const textarea = textareaRef.current;
    const markdown = `\n\n![${alt}](${url})\n\n`;

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
      slug: isNew ? autoSlug : editingPost.slug,
    });
  };

  // Smart Paste Handler: Converts rich HTML to clean Markdown
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = e.clipboardData;
    const pastedHtml = clipboardData.getData('text/html');

    if (pastedHtml) {
      const convertedMarkdown = htmlToMarkdown(pastedHtml);

      if (convertedMarkdown && convertedMarkdown.length > 0) {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentVal = editingPost?.content || '';

        const nextVal = currentVal.substring(0, start) + convertedMarkdown + currentVal.substring(end);
        handleContentChange(nextVal);

        setTimeout(() => {
          textarea.setSelectionRange(
            start + convertedMarkdown.length,
            start + convertedMarkdown.length
          );
        }, 0);
      }
    }
  };

  // Main Submit Handler with 0ms Optimistic UI Feedback
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    setSaveStatus('saving');
    setStatusMessage('');

    try {
      const savedPost = {
        ...editingPost,
        id: editingPost.id || `post_${Date.now()}`,
      };

      // Instant optimistic update in 0ms
      if (isNew || !editingPost.id) {
        setPosts((prev) => [savedPost, ...prev]);
      } else {
        setPosts((prev) => prev.map((p) => (p.id === savedPost.id ? savedPost : p)));
      }

      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setHasSavedDraft(false);
      } catch (e) {}

      setEditingPost(null);
      setSaveStatus('idle');
      setStatusMessage('Essay saved and published successfully!');
      setTimeout(() => setStatusMessage(''), 3000);

      const url = isNew || !editingPost.id ? '/api/posts' : `/api/posts/${editingPost.id}`;
      const method = isNew || !editingPost.id ? 'POST' : 'PUT';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedPost),
      });
    } catch (err: any) {
      console.error('Error saving post:', err);
    }
  };

  const wordCount = editingPost?.content
    ? editingPost.content.trim().split(/\s+/).filter(Boolean).length
    : 0;

  // Filter & Pagination Calculations
  const filteredPosts = posts.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
      (p.tag && p.tag.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredPosts.length);
  const currentPosts = filteredPosts.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hidden file inputs for direct device uploads */}
      <input
        type="file"
        ref={coverFileInputRef}
        accept="image/*"
        onChange={handleCoverFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={toolbarFileInputRef}
        accept="image/*"
        onChange={handleToolbarFileChange}
        className="hidden"
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <h1 className="font-serif text-[2rem] text-[var(--ink)] font-normal tracking-tight">
            Writings &amp; Essays Manager
          </h1>
          <p className="text-[0.875rem] text-[var(--ink-muted)] mt-1">
            Auto-save Drafts · Smart WebP Image Compression · Instant 0ms Feedback.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {hasSavedDraft && !editingPost && (
            <button
              onClick={handleRestoreDraft}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-4 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>📋 Restore Auto-Saved Draft</span>
            </button>
          )}

          <button
            onClick={handleCreateNew}
            className="bg-[var(--accent)] text-white px-5 py-2.5 rounded-[var(--radius)] font-mono text-[0.8125rem] hover:bg-[var(--ink)] transition-colors cursor-pointer self-start sm:self-auto shadow-sm font-medium"
          >
            + Write New Essay
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-[var(--radius)] font-mono text-[0.8125rem] flex items-center gap-2">
          <span>✓</span>
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Visual Editor Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius-lg)] max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--rule)] px-6 py-4 bg-[var(--surface)]">
              <div className="flex items-center gap-4 flex-wrap">
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

                {/* Auto-save status pill */}
                {draftStatus && (
                  <span className="font-mono text-[0.6875rem] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {draftStatus}
                  </span>
                )}
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

              {/* Cover Image Upload with Smart WebP Compression */}
              <div className="flex flex-col gap-2 p-4 bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)]">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[0.6875rem] uppercase text-[var(--ink)] font-bold flex items-center gap-2">
                    <span>🖼️ Thumbnail / Cover Image</span>
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
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded font-mono text-[0.6875rem] text-emerald-800">
                    {compressionStats}
                  </div>
                )}

                {showUrlInput ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <input
                      type="text"
                      value={editingPost.coverImage || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                      placeholder="e.g. https://images.unsplash.com/... or /img/cover.jpg"
                      className="bg-[var(--bg)] border border-[var(--rule)] rounded-[var(--radius)] px-3 py-2 text-[0.8125rem] font-mono text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] flex-1 w-full"
                    />
                    {editingPost.coverImage && (
                      <button
                        type="button"
                        onClick={() => setEditingPost({ ...editingPost, coverImage: '' })}
                        className="px-3 py-2 border border-[var(--rule)] rounded font-mono text-[0.75rem] text-red-600 hover:bg-red-50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingCover(true);
                    }}
                    onDragLeave={() => setIsDraggingCover(false)}
                    onDrop={handleCoverFileDrop}
                    className={`border-2 border-dashed rounded-[var(--radius)] p-4 text-center transition-all cursor-pointer bg-[var(--bg)] flex flex-col items-center justify-center gap-2 ${
                      isDraggingCover
                        ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                        : 'border-[var(--rule)] hover:border-[var(--accent)]'
                    }`}
                  >
                    {uploadingCover ? (
                      <div className="py-4 flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                        <span className="font-mono text-xs text-[var(--accent)]">
                          Compressing &amp; Uploading WebP image...
                        </span>
                      </div>
                    ) : editingPost.coverImage ? (
                      <div className="relative group w-full max-h-48 overflow-hidden rounded flex flex-col items-center">
                        <img
                          src={editingPost.coverImage}
                          alt="Cover"
                          className="w-full h-40 object-cover rounded border border-[var(--rule)]"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <span className="text-white font-mono text-xs">Click or drop to replace</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPost({ ...editingPost, coverImage: '' });
                              setCompressionStats(null);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-mono text-xs cursor-pointer"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 rounded-full bg-[var(--surface)] border border-[var(--rule)] flex items-center justify-center text-lg">
                          📁
                        </div>
                        <div className="font-mono text-xs text-[var(--ink)] font-semibold">
                          Click to upload image from your device (PC / Phone)
                        </div>
                        <div className="font-mono text-[0.6875rem] text-[var(--ink-muted)]">
                          Auto-compressed to ultra-lightweight WebP format (typically 80-95% smaller)
                        </div>
                      </div>
                    )}
                  </div>
                )}
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

                    {/* Toolbar Direct Device Image Upload with Compression */}
                    <button
                      type="button"
                      disabled={uploadingToolbar}
                      onClick={() => toolbarFileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-[var(--bg)] hover:bg-[var(--ink)] hover:text-white border border-[var(--rule)] rounded font-mono text-[0.75rem] cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      title="Upload Image from Device (Auto-Compressed WebP)"
                    >
                      <span>🖼️ Upload Image</span>
                      {uploadingToolbar && <span className="animate-spin text-[0.625rem]">⏳</span>}
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
                              className="font-serif text-[1.375rem] text-[var(--ink)] font-normal mt-2"
                            >
                              {trimmed.replace('### ', '')}
                            </h3>
                          );
                        }
                        if (trimmed.startsWith('> ')) {
                          return (
                            <blockquote
                              key={idx}
                              className="border-l-2 border-[var(--accent)] pl-4 italic text-[var(--ink)] my-2 font-serif text-[1.125rem]"
                            >
                              {trimmed.replace('> ', '')}
                            </blockquote>
                          );
                        }
                        if (trimmed.startsWith('```')) {
                          return (
                            <pre
                              key={idx}
                              className="bg-[var(--bg)] border border-[var(--rule)] p-4 rounded font-mono text-[0.8125rem] overflow-x-auto my-2"
                            >
                              <code>{trimmed.replace(/```[a-z]*\n?/g, '')}</code>
                            </pre>
                          );
                        }
                        if (trimmed.startsWith('![')) {
                          const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
                          if (match) {
                            return (
                              <figure key={idx} className="my-4">
                                <img
                                  src={match[2]}
                                  alt={match[1]}
                                  className="w-full rounded-[var(--radius)] border border-[var(--rule)]"
                                />
                                {match[1] && (
                                  <figcaption className="text-center font-mono text-[0.75rem] text-[var(--ink-muted)] mt-1.5">
                                    {match[1]}
                                  </figcaption>
                                )}
                              </figure>
                            );
                          }
                        }
                        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                          const items = trimmed.split('\n').map((line) => line.replace(/^[-*]\s+/, ''));
                          return (
                            <ul key={idx} className="list-disc pl-6 space-y-1 my-2">
                              {items.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          );
                        }
                        if (/^\d+\.\s+/.test(trimmed)) {
                          const items = trimmed.split('\n').map((line) => line.replace(/^\d+\.\s+/, ''));
                          return (
                            <ol key={idx} className="list-decimal pl-6 space-y-1 my-2">
                              {items.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ol>
                          );
                        }
                        return <p key={idx}>{paragraph}</p>;
                      })
                    ) : (
                      <p className="text-[var(--ink-muted)] italic font-mono text-sm">
                        Content is empty. Switch to &ldquo;Visual Write&rdquo; tab to compose.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Publish / Draft Switch & Actions */}
              <div className="flex items-center justify-between border-t border-[var(--rule)] pt-4 mt-2 bg-[var(--surface)] p-4 rounded-[var(--radius)] flex-wrap gap-4">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingPost.published}
                    onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--rule)] accent-[var(--accent)] cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="font-mono text-[0.8125rem] text-[var(--ink)] font-medium">
                      Publish Live on Site
                    </span>
                    <span className="font-mono text-[0.6875rem] text-[var(--ink-muted)]">
                      {editingPost.published
                        ? 'Visible to all visitors in the Writing section'
                        : 'Saved as draft (only visible to admin)'}
                    </span>
                  </div>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 border border-[var(--rule)] rounded font-mono text-[0.8125rem] cursor-pointer hover:bg-[var(--bg)]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saveStatus === 'saving'}
                    className={`px-6 py-2.5 rounded font-mono text-[0.8125rem] transition-all duration-200 cursor-pointer flex items-center gap-1.5 font-medium ${
                      saveStatus === 'saving'
                        ? 'bg-[var(--ink)] text-white opacity-80 cursor-wait'
                        : saveStatus === 'success'
                        ? 'bg-emerald-600 text-white'
                        : saveStatus === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-[var(--accent)] hover:bg-[var(--ink)] text-white shadow-sm'
                    }`}
                  >
                    {saveStatus === 'saving' ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : saveStatus === 'success' ? (
                      <>
                        <span className="text-sm font-bold">✓</span>
                        <span>Saved &amp; Published!</span>
                      </>
                    ) : saveStatus === 'error' ? (
                      <>
                        <span>✕</span>
                        <span>Failed to Save</span>
                      </>
                    ) : (
                      <span>{isNew ? 'Publish Essay' : 'Save Changes'}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Pagination Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search essays by title, tag, or subtitle..."
            className="w-full bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius)] px-4 py-2.5 text-[0.875rem] text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] font-mono"
          />
        </div>

        <div className="font-mono text-[0.75rem] text-[var(--ink-muted)] shrink-0">
          Showing <span className="font-semibold text-[var(--ink)]">{filteredPosts.length === 0 ? 0 : startIndex + 1}–{endIndex}</span> of <span className="font-semibold text-[var(--ink)]">{filteredPosts.length}</span> essays (10 per page)
        </div>
      </div>

      {/* Writings Table List */}
      <div className="bg-[var(--surface)] border border-[var(--rule)] rounded-[var(--radius-lg)] overflow-hidden shadow-2xs">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center font-mono text-[0.875rem] text-[var(--ink-muted)] flex flex-col items-center gap-3">
            <span>{search ? 'No essays match your search filter.' : 'No essays published yet.'}</span>
            {!search && (
              <button
                onClick={handleCreateNew}
                className="bg-[var(--accent)] text-white px-4 py-2 rounded text-xs font-mono"
              >
                + Write First Essay
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--rule)] font-mono text-[0.75rem] uppercase tracking-wider text-[var(--ink-muted)] bg-[var(--bg)]">
                <th className="p-4 w-12">#</th>
                <th className="p-4">Cover &amp; Title</th>
                <th className="p-4 hidden sm:table-cell">Category</th>
                <th className="p-4 hidden md:table-cell">Date &amp; Read Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)] text-[0.875rem]">
              {currentPosts.map((post, idx) => {
                const globalIdx = startIndex + idx + 1;
                return (
                  <tr key={post.id} className="hover:bg-[var(--bg)]/70 transition-colors">
                    <td className="p-4 font-mono text-[0.75rem] text-[var(--ink-muted)]">
                      #{globalIdx}
                    </td>
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
                        className={`font-mono text-[0.6875rem] px-2.5 py-1 rounded-[var(--radius)] font-medium ${
                          post.published
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="font-mono text-[0.75rem] text-[var(--accent)] hover:underline cursor-pointer border-0 bg-transparent p-0 font-medium"
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
                );
              })}
            </tbody>
          </table>
        )}

        {/* 10-Item Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--rule)] bg-[var(--bg)] font-mono text-[0.75rem]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3.5 py-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer transition-colors ${
                    safePage === pageNum
                      ? 'bg-[var(--ink)] text-[var(--bg)] font-bold'
                      : 'border border-[var(--rule)] bg-[var(--surface)] hover:border-[var(--ink)] text-[var(--ink)]'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="border border-[var(--rule)] bg-[var(--surface)] hover:bg-[var(--bg)] px-3.5 py-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
