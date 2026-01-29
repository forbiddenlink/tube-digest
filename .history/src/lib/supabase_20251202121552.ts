import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase client (uses service role key for full access)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database types
export interface Summary {
  id: string;
  video_id: string;
  video_url: string;
  title: string | null;
  channel_name: string | null;
  thumbnail_url: string | null;
  duration: number | null;
  summary_text: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  topics?: { id: string; topic: string }[];
}

export interface Topic {
  id: string;
  summary_id: string;
  topic: string;
  created_at: string;
}

export interface MindMap {
  id: string;
  summary_id: string;
  nodes: any[];
  edges: any[];
  created_at: string;
  updated_at: string;
}
