import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length === 0) {
      return Response.json({ summaries: [] });
    }

    // Use PostgreSQL full-text search
    const { data: summaries, error } = await supabase
      .from('summaries')
      .select('*')
      .textSearch('summary_text', query, {
        type: 'websearch',
        config: 'english'
      })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Search error:', error);
      return Response.json({ error: 'Search failed' }, { status: 500 });
    }

    return Response.json({ summaries });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
