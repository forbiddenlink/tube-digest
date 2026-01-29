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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-2 border-red-200 dark:border-red-800 rounded-lg p-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">Error</h3>
                <p className="text-red-700 dark:text-red-200 mb-4">{error || 'Summary not found'}</p>
                <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-400/10 via-teal-400/10 to-green-400/10 dark:from-emerald-600/5 dark:via-teal-600/5 dark:to-green-600/5 blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-amber-400/10 via-yellow-400/8 to-orange-400/8 dark:from-amber-600/5 dark:via-yellow-600/4 dark:to-orange-600/4 blur-3xl"></div>
      </div>
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mb-6 font-medium group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            {summary.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
            {summary.channel_name && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span className="font-medium">{summary.channel_name}</span>
              </div>
            )}
            
            {summary.duration && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{summary.duration}</span>
              </div>
            )}
          </div>

          {/* Topics */}
          {summary.topics && summary.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {summary.topics.map((topicItem: { id: string; topic: string }, index: number) => (
                <span
                  key={topicItem.id}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full border ${
                    index % 3 === 0
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : index % 3 === 1
                      ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {topicItem.topic}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8 flex-wrap">
            <Button
              onClick={() => setShowMindMap(!showMindMap)}
              variant="outline"
              className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {showMindMap ? 'Hide Mind Map' : 'Show Mind Map'}
            </Button>
            <Button 
              onClick={copyLink} 
              variant="outline"
              className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button 
              onClick={shareOnTwitter} 
              variant="outline"
              className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share on X
            </Button>
            <Button 
              onClick={syncToGitHub} 
              variant="outline"
              disabled={isSyncing}
              className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              {isSyncing ? 'Syncing...' : 'Sync to GitHub'}
            </Button>
            {summary.video_url && (
              <a
                href={summary.video_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  variant="outline"
                  className="border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-300 dark:hover:border-amber-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  Watch Video
                </Button>
              </a>
            )}
          </div>

          {/* Sync Message */}
          {syncMessage && (
            <div
              className={`mb-6 p-4 rounded-lg border-2 backdrop-blur-sm flex items-start gap-3 ${
                syncMessage.type === 'success'
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border-emerald-200 dark:border-emerald-800'
                  : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-red-200 dark:border-red-800'
              }`}
            >
              <svg className={`w-5 h-5 flex-shrink-0 ${syncMessage.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {syncMessage.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span className={syncMessage.type === 'success' ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}>
                {syncMessage.text}
              </span>
            </div>
          )}
        </div>

        {/* Mind Map */}
        {showMindMap && (
          <div className="mb-10">
            <MindMapView summaryId={id} />
          </div>
        )}

        {/* Summary Content */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-emerald-200/50 dark:border-emerald-800/50 p-6 sm:p-10">
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h1:mb-4 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-code:text-amber-600 dark:prose-code:text-amber-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-ul:my-4 prose-ol:my-4 prose-li:my-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {summary.summary_text}
            </ReactMarkdown>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-8 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>
      </div>
    </div>
  );
}
