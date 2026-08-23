'use client';

import * as React from 'react';
import { MicroExpander } from '@/components/ui/micro-expander';
import { Heart, MessageCircle, Share2, Send, Check } from 'lucide-react';

interface CommentItem {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface BlogInteractionsProps {
  slug: string;
  initialLikes?: number;
  initialComments?: CommentItem[];
}

export function BlogInteractions({
  slug,
  initialLikes = 0,
  initialComments = []
}: BlogInteractionsProps) {
  const [likes, setLikes] = React.useState<number>(initialLikes);
  const [comments, setComments] = React.useState<CommentItem[]>(initialComments);
  const [isLiking, setIsLiking] = React.useState(false);
  const [hasLiked, setHasLiked] = React.useState(false);
  const [showComments, setShowComments] = React.useState(false);
  const [author, setAuthor] = React.useState('');
  const [text, setText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  // Fetch public comments & likes on mount
  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (typeof data.likes === 'number') setLikes(data.likes);
          if (Array.isArray(data.comments)) setComments(data.comments);
        }
      } catch (err) {
        console.error('Failed to load blog interactions:', err);
      }
    }
    loadData();
  }, [slug]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action: 'like' })
      });
      const data = await res.json();
      if (res.ok && typeof data.likes === 'number') {
        setLikes(data.likes);
        setHasLiked(true);
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'comment',
          author: author.trim(),
          text: text.trim()
        })
      });

      const data = await res.json();
      if (res.ok && Array.isArray(data.comments)) {
        setComments(data.comments);
        setText('');
      } else {
        setErrorMsg(data.error || 'Failed to submit comment');
      }
    } catch (err) {
      setErrorMsg('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full my-12 border-t border-b border-white/[0.08] py-8">
      {/* Toolbar containing MicroExpander controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2">
          <MicroExpander
            text={likes > 0 ? `Like (${likes})` : 'Like'}
            variant="ghost"
            isLoading={isLiking}
            icon={
              <Heart
                className={`h-5 w-5 transition-colors ${
                  hasLiked ? 'fill-red-500 text-red-500' : 'text-zinc-300 group-hover:text-red-400'
                }`}
              />
            }
            onClick={handleLike}
            className="text-zinc-300 hover:text-red-400 hover:bg-red-500/10"
          />

          <MicroExpander
            text={comments.length > 0 ? `Discussion (${comments.length})` : 'Discussion'}
            variant="ghost"
            icon={<MessageCircle className="h-5 w-5 text-zinc-300 group-hover:text-blue-400" />}
            onClick={() => setShowComments(!showComments)}
            className="text-zinc-300 hover:text-blue-400 hover:bg-blue-500/10"
          />

          <MicroExpander
            text={copied ? 'Link Copied!' : 'Share'}
            variant="ghost"
            icon={
              copied ? (
                <Check className="h-5 w-5 text-emerald-400" />
              ) : (
                <Share2 className="h-5 w-5 text-zinc-300 group-hover:text-emerald-400" />
              )
            }
            onClick={handleShare}
            className="text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10"
          />
        </div>

        <div className="text-xs font-mono text-zinc-500 px-3">
          {likes} {likes === 1 ? 'like' : 'likes'} &middot; {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs font-mono text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Public Comments Section */}
      {showComments && (
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 space-y-6">
          <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <span>Public Discussion</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-mono text-zinc-400">
              {comments.length}
            </span>
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Your name (optional)"
                maxLength={50}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-950/60 px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            <textarea
              placeholder="Join the discussion... (HTML sanitized, stored on server)"
              rows={3}
              maxLength={1000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-zinc-950/60 p-3.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">
                {text.length}/1000 characters
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !text.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-950 transition-colors hover:bg-white disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="mt-6 space-y-4 border-t border-white/[0.06] pt-6">
            {comments.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">
                No public comments yet. Be the first to join the conversation!
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-xs text-zinc-200 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                        {c.author.charAt(0).toUpperCase()}
                      </span>
                      {c.author}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {formatTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-zinc-300 pl-8">
                    {c.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
