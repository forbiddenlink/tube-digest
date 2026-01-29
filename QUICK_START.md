# TubeDigest Quick Start Guide

Get TubeDigest up and running in 5 minutes! ⚡

## Prerequisites

- Node.js 18 or higher
- An Anthropic API key
- A Supabase account

## 1. Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/tubedigest.git
cd tubedigest

# Install dependencies
npm install
```

## 2. Set Up Supabase (2 minutes)

### Create a Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name it "tubedigest" and set a password
4. Wait for project creation (~2 minutes)

### Run SQL Setup
1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste this entire SQL script:

```sql
-- Create summaries table
CREATE TABLE IF NOT EXISTS public.summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id TEXT NOT NULL UNIQUE,
    video_url TEXT NOT NULL,
    title TEXT NOT NULL,
    channel_name TEXT,
    thumbnail_url TEXT,
    duration INTEGER,
    summary_text TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    summary_id UUID REFERENCES public.summaries(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create mind_maps table
CREATE TABLE IF NOT EXISTS public.mind_maps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    summary_id UUID REFERENCES public.summaries(id) ON DELETE CASCADE,
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    edges JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_summaries_video_id ON public.summaries(video_id);
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON public.summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_summary_id ON public.topics(summary_id);
CREATE INDEX IF NOT EXISTS idx_topics_topic ON public.topics(topic);
CREATE INDEX IF NOT EXISTS idx_mind_maps_summary_id ON public.mind_maps(summary_id);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_summaries_summary_text_fts 
ON public.summaries 
USING gin(to_tsvector('english', summary_text));

-- Enable Row Level Security (RLS)
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mind_maps ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on summaries" 
ON public.summaries FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access on topics" 
ON public.topics FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access on mind_maps" 
ON public.mind_maps FOR SELECT 
USING (true);

-- Create policies for insert access
CREATE POLICY "Allow public insert access on summaries" 
ON public.summaries FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public insert access on topics" 
ON public.topics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public insert access on mind_maps" 
ON public.mind_maps FOR INSERT 
WITH CHECK (true);
```

4. Click **RUN** or press `Ctrl+Enter`
5. You should see "Success. No rows returned"

## 3. Get Your API Keys (1 minute)

### Supabase
1. In Supabase, go to **Settings** → **API**
2. Copy these two values:
   - `Project URL` (e.g., `https://abc123.supabase.co`)
   - `anon public` key (under "Project API keys")

### Anthropic
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create account
3. Go to **API Keys**
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-`)

## 4. Configure Environment Variables

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit .env.local with your values
nano .env.local
```

Add your keys:

```env
# Required - Anthropic API
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional - GitHub Sync (skip for now)
# NEXT_PUBLIC_GITHUB_CONFIGURED=true
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`)

## 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

## First Test

1. Paste any YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
2. Click **Summarize**
3. Watch the AI-powered summary stream in real-time! ✨

## What's Next?

- **Add GitHub Sync** - See [GITHUB_SYNC_SETUP.md](./docs/GITHUB_SYNC_SETUP.md)
- **Deploy to Production** - See [DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Run Full Tests** - See [TESTING_GUIDE.md](./docs/TESTING_GUIDE.md)
- **Customize** - Edit `src/app/page.tsx` to change the UI

## Common Issues

### "Invalid API Key"
- Check your `ANTHROPIC_API_KEY` in `.env.local`
- Make sure there are no extra spaces
- Verify key starts with `sk-ant-`

### "Cannot connect to Supabase"
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **anon public** key
- Ensure you ran the SQL setup script

### "No transcript available"
- Some videos don't have captions/transcripts
- Try a different video
- Check that the video isn't private/unlisted

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## Need Help?

- 📖 [Full Documentation](./README.md)
- 🐛 [Report Issues](https://github.com/yourusername/tubedigest/issues)
- 💬 [Discussions](https://github.com/yourusername/tubedigest/discussions)

---

**Ready to digest some videos?** 🎬✨
