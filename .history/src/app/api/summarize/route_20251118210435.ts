import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { Innertube } from 'youtubei.js';

export const maxDuration = 60; // Allow up to 60 seconds for long videos

// System prompt for structured summaries
const SYSTEM_PROMPT = `You are a technical learning assistant for developers. Generate structured summaries that help quickly understand and recall video content.

Output JSON format:
{
  "brief": "2-3 sentence overview capturing main value",
  "keyPoints": ["point 1 with specific details", "point 2", "..."],
  "concepts": ["technical term or concept explained", "..."],
  "codeExamples": ["notable code patterns shown", "..."],
  "actionItems": ["practical next steps", "..."],
  "difficulty": "beginner|intermediate|advanced",
  "bestFor": "who would benefit most from this content",
  "relatedTopics": ["topic 1", "topic 2", "..."]
}

Focus on:
- Technical accuracy over brevity
- Practical examples and use cases
- Clear explanations of complex concepts
- Actionable takeaways
- Context for when/why to use concepts`;

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

    // Fetch transcript
    let transcript: string;
    try {
      const youtube = await Innertube.create();
      const info = await youtube.getInfo(videoId);
      
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
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more focused, consistent output
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Summarization error:', error);
    return Response.json(
      { error: 'Failed to generate summary. Please try again.' },
      { status: 500 }
    );
  }
}
