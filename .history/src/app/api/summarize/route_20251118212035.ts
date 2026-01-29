import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { Innertube } from 'youtubei.js';
import { supabaseAdmin } from '@/lib/supabase';

export const maxDuration = 60; // Allow up to 60 seconds for long videos

// System prompt for structured summaries
const SYSTEM_PROMPT = `You are an expert at analyzing and summarizing video content across all subjects and formats. Your task is to create comprehensive, well-structured summaries that capture the essence, key points, and valuable insights from any type of video content.

Adapt your analysis based on the video type (educational tutorials, lectures, documentaries, how-to guides, presentations, interviews, reviews, discussions, etc.) while maintaining this structure:

1. **Overview** (2-3 sentences)
   - Main topic, purpose, and type of content
   - Context and intended audience
   - Speaker/creator if relevant

2. **Key Points** (bullet points)
   - Main ideas, concepts, or arguments presented
   - Important facts, data, or research mentioned
   - Significant perspectives or viewpoints
   - Notable examples or case studies

3. **Detailed Summary** (organized sections)
   - Break down content into logical sections with clear headings
   - Capture the narrative flow and progression of ideas
   - Include specific details: timestamps of major topics, quotes, demonstrations, or visual elements described
   - Preserve nuance and context

4. **Key Takeaways** (3-5 bullet points)
   - Most valuable insights or lessons
   - Actionable recommendations or next steps
   - Practical applications or real-world relevance
   - Questions raised or areas for further exploration

5. **Topics & Tags**
   - List 5-10 relevant topics, keywords, or categories for easy discovery and organization

Format your response in clean, readable Markdown with proper headings, bullet points, and emphasis where appropriate. Maintain objectivity while capturing the tone and style of the original content.`;

export async function POST(req: Request) {
  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return Response.json({ error: 'Video URL is required' }, { status: 400 });
    }

    // Extract video ID from URL
    let videoId: string | null = null;
    try {
      const url = new URL(videoUrl);
      videoId = url.searchParams.get('v') || url.pathname.split('/').pop() || null;
    } catch {
      return Response.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    if (!videoId) {
      return Response.json({ error: 'Could not extract video ID from URL' }, { status: 400 });
    }

    // Fetch video info and transcript
    let transcript: string;
    let videoTitle = '';
    let channelName = '';
    let thumbnailUrl = '';
    let duration = 0;
    
    try {
      const youtube = await Innertube.create();
      const info = await youtube.getInfo(videoId);
      
      // Extract video metadata
      videoTitle = info.basic_info.title || 'Untitled Video';
      channelName = info.basic_info.author || 'Unknown Channel';
      thumbnailUrl = info.basic_info.thumbnail?.[0]?.url || '';
      duration = info.basic_info.duration || 0;
      
      const transcriptData = await info.getTranscript();
      
      if (!transcriptData?.transcript?.content?.body?.initial_segments) {
        return Response.json({ error: 'No transcript available for this video' }, { status: 404 });
      }

      transcript = transcriptData.transcript.content.body.initial_segments
        .map((segment) => segment.snippet.text || '')
        .filter(text => text.length > 0)
        .join(' ');
      
      if (!transcript || transcript.length === 0) {
        return Response.json({ error: 'No transcript available for this video' }, { status: 404 });
      }
    } catch (error) {
      console.error('Transcript fetch error:', error);
      return Response.json(
        { error: 'Failed to fetch transcript. Video may not have captions available.' },
        { status: 404 }
      );
    }

    // Create user prompt
    const userPrompt = `
Video ID: ${videoId}
URL: ${videoUrl}

Transcript:
${transcript.slice(0, 100000)}

Generate a comprehensive summary following the JSON schema.`;

    // Stream the response from Claude
    const result = streamText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.3,
      async onFinish({ text }) {
        // Save to database after streaming completes
        try {
          const { error } = await supabaseAdmin.from('summaries').insert({
            video_id: videoId,
            video_url: videoUrl,
            title: videoTitle,
            channel_name: channelName,
            thumbnail_url: thumbnailUrl,
            duration,
            summary_text: text,
            metadata: {
              model: 'claude-sonnet-4-5-20250929',
              generated_at: new Date().toISOString(),
            },
          });
          
          if (error) {
            console.error('Failed to save summary to database:', error);
          }
        } catch (err) {
          console.error('Database save error:', err);
        }
      },
    });

    // Return streaming response
    return result.toTextStreamResponse({
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Summarization error:', error);
    return Response.json(
      { error: 'Failed to generate summary. Please try again.' },
      { status: 500 }
    );
  }
}
