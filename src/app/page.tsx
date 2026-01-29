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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated Background - Unique Emerald & Amber */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-400/15 via-teal-400/15 to-green-400/15 dark:from-emerald-600/8 dark:via-teal-600/8 dark:to-green-600/8 blur-3xl animate-pulse [animation-duration:8s]"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-amber-400/15 via-yellow-400/10 to-orange-400/10 dark:from-amber-600/8 dark:via-yellow-600/6 dark:to-orange-600/6 blur-3xl animate-pulse [animation-duration:10s] [animation-delay:1s]"></div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:py-20 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200 dark:border-emerald-800 mb-6 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Powered by Claude Sonnet 4.5
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              TubeDigest
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Transform YouTube videos into actionable knowledge
          </p>
          
          <p className="text-base text-slate-500 dark:text-slate-400 mb-8">
            AI-powered summaries with mind maps, full-text search, and GitHub sync
          </p>

          {/* Stats */}
          {stats.total > 0 && (
            <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-1">
                  {stats.total}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Total Summaries
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent mb-1">
                  {stats.thisWeek}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  This Week
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="p-6 sm:p-8 shadow-2xl border-2 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 hover:shadow-3xl transition-shadow duration-300">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="videoUrl" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  YouTube URL
                </label>
                <div className="relative group">
                  <Input
                    ref={inputRef}
                    id="videoUrl"
                    type="text"
                    placeholder="https://youtube.com/watch?v=... or paste any YouTube link"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={isProcessing}
                    className="text-base sm:text-lg h-14 pl-4 pr-20 border-2 focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-emerald-200 dark:focus:ring-emerald-800 transition-all duration-200 bg-white dark:bg-slate-800"
                    aria-label="YouTube video URL"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-slate-400">
                    <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 font-mono text-slate-600 dark:text-slate-300">
                      ⌘K
                    </kbd>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  💡 Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">⌘K</kbd> to quickly focus
                </p>
              </div>
              
              <Button
                type="submit"
                disabled={isProcessing || !videoUrl}
                className="w-full text-base sm:text-lg h-14 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 dark:from-emerald-500 dark:via-teal-500 dark:to-cyan-500 dark:hover:from-emerald-600 dark:hover:via-teal-600 dark:hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-emerald-500/50 dark:hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                aria-label={isProcessing ? 'Generating summary' : 'Summarize video'}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Generating Summary...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Summarize Video</span>
                  </div>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8">
            <Card className="p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-2 border-red-200 dark:border-red-800 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">Error</h3>
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Summary Display */}
        {summary && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="p-6 sm:p-10 shadow-2xl border-2 border-emerald-200/50 dark:border-emerald-800/50 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Summary</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Generated just now</p>
                </div>
              </div>
              <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-code:text-amber-600 dark:prose-code:text-amber-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-strong:text-slate-900 dark:prose-strong:text-slate-100">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary}
                </ReactMarkdown>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Start Guide */}
        {!summary && !isProcessing && (
          <div className="mt-12 text-center text-slate-500 dark:text-slate-400 space-y-4">
            <p className="text-sm font-medium">Try these examples:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700"
              >
                Sample Video 1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVideoUrl('https://www.youtube.com/watch?v=jNQXAC9IVRw')}
                className="border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-300 dark:hover:border-amber-700"
              >
                Sample Video 2
              </Button>
            </div>
          </div>
        )}

        {/* Recent Summaries Grid */}
        {recentSummaries.length > 0 && (
          <div className="mt-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                  {selectedTopic ? (
                    <span className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">Topic:</span>
                      <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                        {selectedTopic}
                      </span>
                    </span>
                  ) : searchQuery ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Results
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Recent Summaries
                    </span>
                  )}
                </h2>
                {selectedTopic && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500"
                    onClick={() => {
                      setSelectedTopic(null);
                      fetchRecentSummaries();
                    }}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filter
                  </Button>
                )}
              </div>
              <div className="w-full sm:max-w-md">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Input
                    type="text"
                    placeholder="Search summaries..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="w-full pl-10 h-11 border-slate-300 dark:border-slate-600 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>
            {isSearching && (
              <div className="flex items-center justify-center gap-2 py-8 text-slate-500 dark:text-slate-400">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Searching...</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {recentSummaries.map((item) => (
                <a
                  key={item.id}
                  href={`/summary/${item.id}`}
                  className="block group"
                >
                  <Card className="p-5 sm:p-6 hover:shadow-2xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer h-full border-2 border-slate-200/50 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:-translate-y-1">
                  {item.thumbnail_url && (
                    <div className="relative overflow-hidden rounded-lg mb-4 group-hover:shadow-lg transition-shadow duration-300 h-40">
                      <Image 
                        src={item.thumbnail_url} 
                        alt={item.title || 'Video thumbnail'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.title || 'Untitled Video'}
                  </h3>
                  {item.channel_name && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      {item.channel_name}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                    {item.summary_text.slice(0, 150)}...
                  </p>
                  
                  {/* Topic Tags */}
                  {item.topics && item.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.topics.slice(0, 3).map((topicItem: { id: string; topic: string }, index: number) => (
                        <button
                          key={topicItem.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            filterByTopic(topicItem.topic);
                          }}
                          className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                            index % 3 === 0
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800'
                              : index % 3 === 1
                              ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {topicItem.topic}
                        </button>
                      ))}
                      {item.topics.length > 3 && (
                        <span className="px-2.5 py-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          +{item.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  </Card>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
