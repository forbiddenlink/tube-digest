import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const limit = Number.parseInt(searchParams.get('limit') || '12');
    
    // If ID is provided, fetch single summary
    if (id) {
      const { data: summary, error } = await supabase
        .from('summaries')
        .select(`
          *,
          topics (
            id,
            topic
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Failed to fetch summary:', error);
        return Response.json({ error: 'Failed to fetch summary' }, { status: 500 });
      }

      return Response.json([summary]);
    }
    
    // Otherwise fetch list of summaries
    const { data: summaries, error } = await supabase
      .from('summaries')
      .select(`
        *,
        topics (
          id,
          topic
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch summaries:', error);
      return Response.json({ error: 'Failed to fetch summaries' }, { status: 500 });
    }

    return Response.json({ summaries });
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
