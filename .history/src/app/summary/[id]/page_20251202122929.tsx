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
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <p className="text-red-800 dark:text-red-200">{error || 'Summary not found'}</p>
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline mt-4 inline-block">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {summary.title}
          </h1>
          
          {summary.channel_name && (
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              by {summary.channel_name}
            </p>
          )}
          
          {summary.duration && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              Duration: {summary.duration}
            </p>
          )}

          {/* Topics */}
          {summary.topics && summary.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {summary.topics.map((topicItem: { id: string; topic: string }) => (
                <span
                  key={topicItem.id}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {topicItem.topic}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <Button
              onClick={() => setShowMindMap(!showMindMap)}
              variant="outline"
            >
              {showMindMap ? 'Hide Mind Map' : 'Show Mind Map'}
            </Button>
            <Button onClick={copyLink} variant="outline">
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button onClick={shareOnTwitter} variant="outline">
              Share on X
            </Button>
            <Button 
              onClick={syncToGitHub} 
              variant="outline"
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing...' : 'Sync to GitHub'}
            </Button>
            {summary.video_url && (
              <a
                href={summary.video_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">Watch Video</Button>
              </a>
            )}
          </div>

          {/* Sync Message */}
          {syncMessage && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                syncMessage.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}
            >
              {syncMessage.text}
            </div>
          )}
        </div>

        {/* Mind Map */}
        {showMindMap && (
          <div className="mb-8">
            <MindMapView summaryId={id} />
          </div>
        )}

        {/* Summary Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {summary.summary_text}
            </ReactMarkdown>
              
              return <br key={key} />;
            })}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          <p>
            Created: {new Date(summary.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
