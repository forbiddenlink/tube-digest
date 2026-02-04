'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';

interface Topic {
  id: string;
  topic: string;
}

interface Summary {
  id: string;
  title: string | null;
  summary_text: string;
  video_url: string | null;
  thumbnail_url: string | null;
  channel_name: string | null;
  duration: string | null;
  created_at: string;
  topics?: Topic[];
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [recentSummaries, setRecentSummaries] = useState<Summary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch recent summaries and stats on mount
  useEffect(() => {
    fetchRecentSummaries();
    fetchStats();
    
    // Keyboard shortcut: Cmd/Ctrl + K to focus input
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchRecentSummaries = async () => {
    try {
      const response = await fetch('/api/summaries?limit=9');
      const data = await response.json();
      if (data.summaries) {
        setRecentSummaries(data.summaries);
      }
    } catch (err) {
      console.error('Failed to fetch recent summaries:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/summaries?limit=1000');
      const data = await response.json();
      if (data.summaries) {
        const total = data.summaries.length;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeek = data.summaries.filter(
          (s: Summary) => new Date(s.created_at) > oneWeekAgo
        ).length;
        setStats({ total, thisWeek });
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSelectedTopic(null);
      fetchRecentSummaries();
      return;
    }

    setIsSearching(true);
    setSelectedTopic(null);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.summaries) {
        setRecentSummaries(data.summaries);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const filterByTopic = (topic: string) => {
    setSelectedTopic(topic);
    setSearchQuery('');
    setIsSearching(true);
    
    fetch('/api/summaries?limit=50')
      .then(res => res.json())
      .then(data => {
        if (data.summaries) {
          const filtered = data.summaries.filter((s: Summary) => 
            s.topics?.some((t: { topic: string }) => t.topic === topic)
          );
          setRecentSummaries(filtered);
        }
      })
      .catch(err => console.error('Filter failed:', err))
      .finally(() => setIsSearching(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    setIsProcessing(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to summarize video');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let accumulatedText = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log('Raw chunk:', chunk); // Debug log
        
        // Just accumulate all text - the streaming format sends plain text
        accumulatedText += chunk;
        setSummary(accumulatedText);
      }
      
      console.log('Final summary:', accumulatedText); // Debug log
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
      fetchRecentSummaries();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="blob blob-brand absolute -top-1/2 -left-1/2 w-full h-full [animation-duration:8s]" />
        <div className="blob blob-warm absolute -bottom-1/2 -right-1/2 w-full h-full [animation-duration:10s] [animation-delay:1s]" />
      </div>

      <div className="container mx-auto px-4 py-16 sm:py-24 max-w-7xl">
        {/* Hero Section */}
        <header className="text-center mb-16 sm:mb-24">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-subtle mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Powered by Claude Sonnet 4.5
            </span>
          </div>

          {/* Title */}
          <h1 className="h1 mb-6">
            <span className="text-gradient-brand">TubeDigest</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl sm:text-2xl text-muted-foreground mb-3 max-w-2xl mx-auto leading-relaxed font-medium">
            Transform YouTube videos into actionable knowledge
          </p>
          <p className="text-base text-muted-foreground/70 mb-10 max-w-xl mx-auto">
            AI-powered summaries with mind maps, full-text search, and GitHub sync
          </p>

          {/* Stats */}
          {stats.total > 0 && (
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-gradient-brand mb-1 tabular-nums">
                  {stats.total}
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Summaries
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-gradient-warm mb-1 tabular-nums">
                  {stats.thisWeek}
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  This Week
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Input Form */}
        <section className="max-w-2xl mx-auto mb-16">
          <Card variant="glass" className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="videoUrl" className="block text-sm font-semibold text-foreground">
                  YouTube URL
                </label>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    id="videoUrl"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={isProcessing}
                    className="h-14 text-base pr-16"
                    aria-label="YouTube video URL"
                  />
                  <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isProcessing || !videoUrl}
                variant="brand"
                size="xl"
                className="w-full"
                aria-label={isProcessing ? 'Generating summary' : 'Summarize video'}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin size-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Summarize Video
                  </>
                )}
              </Button>
            </form>
          </Card>
        </section>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="p-6 bg-destructive/5 border-destructive/30">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <svg className="size-5 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-destructive mb-1">Something went wrong</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Summary Display */}
        {summary && (
          <section className="max-w-4xl mx-auto mb-16">
            <Card variant="glass" className="p-8 sm:p-12">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border/50">
                <div className="size-12 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-primary/20">
                  <svg className="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="h3 text-foreground">Summary</h2>
                  <p className="text-sm text-muted-foreground">Generated just now</p>
                </div>
              </div>
              <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-code:text-amber-600 dark:prose-code:text-amber-400 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal prose-pre:bg-muted prose-pre:border prose-pre:border-border">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary}
                </ReactMarkdown>
              </div>
            </Card>
          </section>
        )}

        {/* Quick Start Guide */}
        {!summary && !isProcessing && (
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm font-medium text-muted-foreground">Try an example:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="outline-brand"
                size="sm"
                onClick={() => setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
              >
                Sample Video 1
              </Button>
              <Button
                variant="outline-warm"
                size="sm"
                onClick={() => setVideoUrl('https://www.youtube.com/watch?v=jNQXAC9IVRw')}
              >
                Sample Video 2
              </Button>
            </div>
          </div>
        )}

        {/* Recent Summaries Grid */}
        {recentSummaries.length > 0 && (
          <section className="mt-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
              <div>
                <h2 className="h2 text-foreground mb-2">
                  {selectedTopic ? (
                    <span className="flex items-center gap-3">
                      <span className="text-muted-foreground font-normal">Topic:</span>
                      <span className="text-gradient-brand">{selectedTopic}</span>
                    </span>
                  ) : searchQuery ? (
                    <span className="flex items-center gap-3">
                      <svg className="size-7 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Results
                    </span>
                  ) : (
                    'Recent Summaries'
                  )}
                </h2>
                {selectedTopic && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSelectedTopic(null);
                      fetchRecentSummaries();
                    }}
                  >
                    <svg className="size-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear filter
                  </Button>
                )}
              </div>

              {/* Search Input */}
              <div className="w-full sm:w-80">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Input
                    type="search"
                    placeholder="Search summaries..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="pl-11"
                  />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isSearching && (
              <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                <svg className="animate-spin size-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </div>
            )}
            {/* Summary Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentSummaries.map((item) => (
                <a
                  key={item.id}
                  href={`/summary/${item.id}`}
                  className="block group"
                >
                  <Card variant="glass" interactive className="p-6 h-full">
                    {/* Thumbnail */}
                    {item.thumbnail_url && (
                      <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title || 'Video thumbnail'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {item.title || 'Untitled Video'}
                    </h3>

                    {/* Channel */}
                    {item.channel_name && (
                      <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
                        <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        {item.channel_name}
                      </p>
                    )}

                    {/* Summary Preview */}
                    <p className="text-sm text-muted-foreground/80 line-clamp-3 mb-4 leading-relaxed">
                      {item.summary_text.slice(0, 150)}...
                    </p>

                    {/* Topic Tags */}
                    {item.topics && item.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {item.topics.slice(0, 3).map((topicItem: { id: string; topic: string }, index: number) => (
                          <button
                            key={topicItem.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              filterByTopic(topicItem.topic);
                            }}
                            className={`tag ${
                              index % 3 === 0 ? 'tag-brand' : index % 3 === 1 ? 'tag-secondary' : 'tag-accent'
                            }`}
                          >
                            {topicItem.topic}
                          </button>
                        ))}
                        {item.topics.length > 3 && (
                          <span className="tag bg-muted text-muted-foreground border-transparent">
                            +{item.topics.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </Card>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
