import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface MindMapNode {
  id: string;
  type: 'heading' | 'topic' | 'root';
  data: {
    label: string;
    level?: number;
  };
  position: { x: number; y: number };
}

interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  type: 'default' | 'smoothstep';
}

function generateMindMapFromSummary(
  summaryText: string,
  topics: { topic: string }[]
): { nodes: MindMapNode[]; edges: MindMapEdge[] } {
  const nodes: MindMapNode[] = [];
  const edges: MindMapEdge[] = [];

  // Add root node
  nodes.push({
    id: 'root',
    type: 'root',
    data: { label: 'Summary' },
    position: { x: 400, y: 50 },
  });

  // Parse markdown headings
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;

  while ((match = headingRegex.exec(summaryText)) !== null) {
    const level = match[1].length;
    const text = match[2].replaceAll('**', '').trim();
    const id = `heading-${headings.length}`;
    headings.push({ level, text, id });
  }

  // Create nodes for headings in a circular layout
  const radius = 300;
  for (let index = 0; index < headings.length; index++) {
    const heading = headings[index];
    const angle = (index / headings.length) * 2 * Math.PI;
    const x = 400 + radius * Math.cos(angle);
    const y = 300 + radius * Math.sin(angle);

    nodes.push({
      id: heading.id,
      type: 'heading',
      data: { label: heading.text, level: heading.level },
      position: { x, y },
    });

    // Connect to root
    edges.push({
      id: `edge-root-${heading.id}`,
      source: 'root',
      target: heading.id,
      type: 'smoothstep',
    });
  }

  // Add topic nodes in a separate ring
  const topicRadius = 500;
  for (let index = 0; index < topics.length; index++) {
    const topic = topics[index];
    const angle = (index / topics.length) * 2 * Math.PI;
    const x = 400 + topicRadius * Math.cos(angle);
    const y = 300 + topicRadius * Math.sin(angle);
    const topicId = `topic-${index}`;

    nodes.push({
      id: topicId,
      type: 'topic',
      data: { label: topic.topic },
      position: { x, y },
    });

    // Connect topics to the closest heading (root if no headings)
    if (headings.length > 0) {
      const closestHeading = headings[index % headings.length];
      edges.push({
        id: `edge-${closestHeading.id}-${topicId}`,
        source: closestHeading.id,
        target: topicId,
        type: 'default',
      });
    } else {
      edges.push({
        id: `edge-root-${topicId}`,
        source: 'root',
        target: topicId,
        type: 'default',
      });
    }
  }

  return { nodes, edges };
}

export async function POST(request: NextRequest) {
  try {
    const { summaryId } = await request.json();

    if (!summaryId) {
      return NextResponse.json(
        { error: 'Summary ID is required' },
        { status: 400 }
      );
    }

    // Fetch summary and topics
    const { data: summary, error: summaryError } = await supabaseAdmin
      .from('summaries')
      .select('*, topics(topic)')
      .eq('id', summaryId)
      .single();

    if (summaryError || !summary) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      );
    }

    // Generate mind map
    const { nodes, edges } = generateMindMapFromSummary(
      summary.summary_text,
      summary.topics || []
    );

    // Save to database
    const { error: insertError } = await supabaseAdmin
      .from('mind_maps')
      .upsert({
        summary_id: summaryId,
        nodes,
        edges,
      });

    if (insertError) {
      console.error('Error saving mind map:', insertError);
      return NextResponse.json(
        { error: 'Failed to save mind map' },
        { status: 500 }
      );
    }

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error('Error generating mind map:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const summaryId = searchParams.get('summaryId');

    if (!summaryId) {
      return NextResponse.json(
        { error: 'Summary ID is required' },
        { status: 400 }
      );
    }

    // Check if mind map exists
    const { data: existingMap, error: fetchError } = await supabaseAdmin
      .from('mind_maps')
      .select('*')
      .eq('summary_id', summaryId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch mind map' },
        { status: 500 }
      );
    }

    if (existingMap) {
      return NextResponse.json({
        nodes: existingMap.nodes,
        edges: existingMap.edges,
      });
    }

    // Generate new mind map if it doesn't exist
    const { data: summary, error: summaryError } = await supabaseAdmin
      .from('summaries')
      .select('*, topics(topic)')
      .eq('id', summaryId)
      .single();

    if (summaryError || !summary) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      );
    }

    const { nodes, edges } = generateMindMapFromSummary(
      summary.summary_text,
      summary.topics || []
    );

    // Save for future use
    await supabaseAdmin.from('mind_maps').insert({
      summary_id: summaryId,
      nodes,
      edges,
    });

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    console.error('Error fetching mind map:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
