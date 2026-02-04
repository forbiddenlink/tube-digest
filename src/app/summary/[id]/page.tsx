'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Summary } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import MindMapView from '@/components/MindMapView';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function SummaryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMindMap, setShowMindMap] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await fetch(`/api/summaries?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch summary');
        }
        
        const data = await response.json();
        if (data.length > 0) {
          setSummary(data[0]);
        } else {
          setError('Summary not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load summary');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSummary();
    }
  }, [id]);

  const copyLink = () => {
    const url = globalThis.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = `Check out this summary: ${summary?.title}`;
    const url = globalThis.location.href;
    globalThis.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const syncToGitHub = async () => {
    if (!summary) return;

    // Check if GitHub env vars are configured
    const hasGitHubConfig = process.env.NEXT_PUBLIC_GITHUB_CONFIGURED === 'true';
    
    if (!hasGitHubConfig) {
      setSyncMessage({
        type: 'error',
        text: 'GitHub sync not configured. Please add GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO to your .env.local file.',
      });
      setTimeout(() => setSyncMessage(null), 5000);
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryId: id,
          owner: process.env.NEXT_PUBLIC_GITHUB_OWNER,
          repo: process.env.NEXT_PUBLIC_GITHUB_REPO,
          branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
          token: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSyncMessage({
          type: 'success',
          text: `✓ ${data.message}! View on GitHub`,
        });
      } else {
        setSyncMessage({
          type: 'error',
          text: data.error || 'Failed to sync to GitHub',
        });
      }
    } catch (error) {
      setSyncMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to sync to GitHub',
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 7000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-muted rounded-lg w-24" />
            <div className="h-12 bg-muted rounded-lg w-3/4" />
            <div className="h-4 bg-muted rounded-lg w-1/3" />
            <div className="space-y-3 pt-8">
              <div className="h-4 bg-muted rounded-lg" />
              <div className="h-4 bg-muted rounded-lg" />
              <div className="h-4 bg-muted rounded-lg w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl bg-destructive/5 border-2 border-destructive/20 p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 size-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg className="size-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-destructive text-lg mb-2">Something went wrong</h3>
                <p className="text-muted-foreground mb-6">{error || 'Summary not found'}</p>
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="blob blob-brand absolute -top-1/2 -left-1/2 w-full h-full [animation-duration:8s]" />
        <div className="blob blob-warm absolute -bottom-1/2 -right-1/2 w-full h-full [animation-duration:10s] [animation-delay:1s]" />
      </div>

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 font-medium transition-colors group"
          >
            <svg className="size-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          {/* Title */}
          <h1 className="h1 text-foreground mb-6">{summary.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground mb-6">
            {summary.channel_name && (
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full gradient-brand flex items-center justify-center">
                  <svg className="size-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <span className="font-medium text-foreground">{summary.channel_name}</span>
              </div>
            )}

            {summary.duration && (
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full gradient-warm flex items-center justify-center">
                  <svg className="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>{summary.duration}</span>
              </div>
            )}
          </div>

          {/* Topics */}
          {summary.topics && summary.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {summary.topics.map((topicItem: { id: string; topic: string }, index: number) => (
                <span
                  key={topicItem.id}
                  className={`tag ${
                    index % 3 === 0 ? 'tag-brand' : index % 3 === 1 ? 'tag-secondary' : 'tag-accent'
                  }`}
                >
                  {topicItem.topic}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8 flex-wrap">
            <Button onClick={() => setShowMindMap(!showMindMap)} variant="outline-brand">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {showMindMap ? 'Hide Mind Map' : 'Show Mind Map'}
            </Button>
            <Button onClick={copyLink} variant="outline">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button onClick={shareOnTwitter} variant="outline">
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </Button>
            <Button onClick={syncToGitHub} variant="outline" disabled={isSyncing}>
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {isSyncing ? 'Syncing...' : 'Sync to GitHub'}
            </Button>
            {summary.video_url && (
              <a href={summary.video_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline-warm">
                  <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  Watch Video
                </Button>
              </a>
            )}
          </div>

          {/* Sync Message */}
          {syncMessage && (
            <div
              className={`mb-8 p-4 rounded-xl border-2 flex items-start gap-4 ${
                syncMessage.type === 'success'
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-destructive/5 border-destructive/20'
              }`}
            >
              <div className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
                syncMessage.type === 'success' ? 'bg-primary/10' : 'bg-destructive/10'
              }`}>
                <svg className={`size-4 ${syncMessage.type === 'success' ? 'text-primary' : 'text-destructive'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {syncMessage.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              <span className={`text-sm font-medium ${syncMessage.type === 'success' ? 'text-primary' : 'text-destructive'}`}>
                {syncMessage.text}
              </span>
            </div>
          )}
        </header>

        {/* Mind Map */}
        {showMindMap && (
          <div className="mb-10">
            <MindMapView summaryId={id} />
          </div>
        )}

        {/* Summary Content */}
        <section className="glass-card rounded-2xl p-8 sm:p-12 mb-8">
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-amber-600 dark:prose-code:text-amber-400 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-ul:my-4 prose-ol:my-4 prose-li:my-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {summary.summary_text}
            </ReactMarkdown>
          </div>
        </section>

        {/* Metadata */}
        <footer className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            Created {new Date(summary.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </footer>
      </article>
    </div>
  );
}
