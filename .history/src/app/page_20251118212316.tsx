'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import type { Summary } from '@/lib/supabase';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [recentSummaries, setRecentSummaries] = useState<Summary[]>([]);

  // Fetch recent summaries on mount and after new summary
  useEffect(() => {
    fetchRecentSummaries();
  }, []);

  const fetchRecentSummaries = async () => {
    try {
      const response = await fetch('/api/summaries?limit=6');
      const data = await response.json();
      if (data.summaries) {
        setRecentSummaries(data.summaries);
      }
    } catch (err) {
      console.error('Failed to fetch recent summaries:', err);
    }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🎥 TubeDigest
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Transform YouTube videos into actionable knowledge in 30 seconds
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Powered by Claude 3.5 Sonnet • Built with Next.js 15
          </p>
        </div>

        {/* Input Form */}
        <Card className="p-8 shadow-xl mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium mb-2">
                Paste YouTube URL
              </label>
              <Input
                id="videoUrl"
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={isProcessing}
                className="text-lg"
              />
            </div>
            <Button
              type="submit"
              disabled={isProcessing || !videoUrl}
              className="w-full text-lg py-6"
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
                  Generating Summary...
                </>
              ) : (
                '⚡ Summarize Video'
              )}
            </Button>
          </form>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 mb-8">
            <p className="text-red-600 dark:text-red-400">❌ {error}</p>
          </Card>
        )}

        {/* Summary Display */}
        {summary && (
          <Card className="p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-4">📝 Summary</h2>
            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {summary}
              </pre>
            </div>
          </Card>
        )}

        {/* Quick Start Guide */}
        {!summary && !isProcessing && (
          <div className="mt-12 text-center text-gray-500 dark:text-gray-400 space-y-4">
            <p className="text-sm">Try these examples:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
              >
                Sample Video 1
              </Button>
              <Button
                variant="outline"
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
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-center">📚 Recent Summaries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentSummaries.map((item) => (
                <Card key={item.id} className="p-6 hover:shadow-xl transition-shadow cursor-pointer">
                  {item.thumbnail_url && (
                    <img 
                      src={item.thumbnail_url} 
                      alt={item.title || 'Video thumbnail'}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {item.title || 'Untitled Video'}
                  </h3>
                  {item.channel_name && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {item.channel_name}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-3 mb-4">
                    {item.summary_text.slice(0, 150)}...
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSummary(item.summary_text);
                      setVideoUrl(item.video_url);
                    }}
                  >
                    View Summary
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
