# Changelog

All notable changes to TubeDigest will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-02

### Added
- 🎬 AI-powered YouTube video summarization using Claude Sonnet 4.5
- ⚡ Real-time streaming of summary generation
- 💾 PostgreSQL database persistence via Supabase
- 🔍 Full-text search across all summaries
- 🏷️ Automatic topic extraction and tagging from summaries
- 🗺️ Interactive mind map visualization using React Flow
- 📄 Individual detail pages for each summary with full markdown rendering
- 🔄 GitHub sync feature to save summaries as markdown files
- 🎨 Modern, responsive UI with Next.js 16 and Tailwind CSS 4
- 🌙 Dark mode support
- 📱 Mobile-responsive design
- 🔗 Social sharing (Twitter/X, copy link)
- 🎯 Topic-based filtering
- 🔁 Exponential backoff retry logic for API reliability
- 📊 Structured 5-section summary format
- 🖼️ Video thumbnail and metadata display
- ⚙️ shadcn/ui component library integration

### Technical Features
- Next.js 16 with App Router
- TypeScript for type safety
- Supabase for database with RLS policies
- React Flow for mind map visualization
- Octokit for GitHub API integration
- youtubei.js for reliable YouTube transcript fetching
- Vercel AI SDK for streaming
- Full-text search with PostgreSQL websearch

### Documentation
- Comprehensive README with setup instructions
- GitHub sync setup guide
- Testing guide with complete test cases
- Deployment guide for multiple platforms
- API documentation in code comments

### Database Schema
- `summaries` table with full video metadata
- `topics` table with foreign key relationships
- `mind_maps` table with JSONB node/edge storage
- Full-text search indexes
- Automatic timestamp triggers

### Security
- Environment variable-based configuration
- Supabase Row Level Security (RLS)
- No hardcoded credentials
- Secure API key handling

## [Unreleased]

### Planned
- User authentication and personal accounts
- Summary history and favorites
- Export summaries to PDF
- Bulk summarization
- Custom summary templates
- AI-powered summary comparison
- Browser extension
- Mobile app (React Native)
- Collaborative features (share with team)
- Analytics dashboard
- API for third-party integrations

### Under Consideration
- Support for other video platforms (Vimeo, TikTok)
- Audio file summarization (podcasts)
- Multi-language support
- Voice-to-text summary playback
- Integration with note-taking apps (Notion, Obsidian)
- Automated summary scheduling
- Email digest of new summaries

---

## Version History

### [1.0.0] - 2025-12-02
**Initial Release** - Full-featured MVP with all core functionality

- AI summarization
- Database persistence
- Search and filtering
- Mind map visualization
- GitHub sync
- Complete documentation
