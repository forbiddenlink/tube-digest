# Testing Guide for TubeDigest

This guide will help you test all features of TubeDigest to ensure everything is working correctly.

## Pre-Testing Setup

1. **Verify environment variables are set**
   ```bash
   cat .env.local | grep -E "(ANTHROPIC|SUPABASE|GITHUB)" | sed 's/=.*/=***/'
   ```

2. **Ensure dev server is running**
   ```bash
   npm run dev
   ```
   Should see: `✓ Ready on http://localhost:3000`

3. **Check database connection**
   - Open Supabase dashboard
   - Verify `summaries`, `topics`, and `mind_maps` tables exist
   - Check that RLS policies are enabled

## Feature Testing Checklist

### ✅ 1. Basic Summarization

**Test Case 1.1: Valid YouTube Video**
- [ ] Navigate to http://localhost:3000
- [ ] Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
- [ ] Click "Summarize"
- [ ] Verify streaming text appears in real-time
- [ ] Confirm summary has 5 sections:
  - Overview
  - Key Points
  - Detailed Summary
  - Actionable Takeaways
  - Topics & Tags
- [ ] Check that summary is saved (appears in "Recent Summaries" after refresh)

**Test Case 1.2: Invalid URL**
- [ ] Enter invalid URL: `https://youtube.com/invalid`
- [ ] Verify error message appears
- [ ] Confirm no summary is created

**Test Case 1.3: Video Without Transcript**
- [ ] Try a video that doesn't allow transcripts
- [ ] Verify appropriate error message

### ✅ 2. Database Persistence

**Test Case 2.1: Summary Saved**
- [ ] After summarizing, check Supabase dashboard
- [ ] Verify record in `summaries` table with:
  - `video_id`
  - `video_url`
  - `title`
  - `channel_name`
  - `thumbnail_url`
  - `duration`
  - `summary_text`
  - `created_at` timestamp

**Test Case 2.2: Topics Extracted**
- [ ] Check `topics` table in Supabase
- [ ] Verify multiple topic records exist
- [ ] Confirm `summary_id` matches the summary

**Test Case 2.3: Data Retrieval**
- [ ] Refresh the homepage
- [ ] Verify recent summaries load from database
- [ ] Confirm thumbnails, titles, and previews display

### ✅ 3. Search Functionality

**Test Case 3.1: Keyword Search**
- [ ] Enter a keyword in search bar (e.g., "javascript")
- [ ] Press Enter or click search
- [ ] Verify results contain the keyword
- [ ] Check that results update in real-time

**Test Case 3.2: No Results**
- [ ] Search for nonsense keyword: "xyzabc123"
- [ ] Verify "No results found" message
- [ ] Confirm empty state is displayed

**Test Case 3.3: Clear Search**
- [ ] After searching, clear the search field
- [ ] Verify all summaries return

### ✅ 4. Topic Filtering

**Test Case 4.1: Click Topic Tag**
- [ ] Click a topic tag on any summary card
- [ ] Verify grid filters to show only summaries with that topic
- [ ] Confirm header shows "Topic: [topic name]"
- [ ] Check "Clear Filter" button appears

**Test Case 4.2: Clear Topic Filter**
- [ ] After filtering, click "Clear Filter"
- [ ] Verify all summaries return
- [ ] Confirm header returns to "Recent Summaries"

**Test Case 4.3: Multiple Topics**
- [ ] Find summary with multiple topics
- [ ] Verify first 3 topics shown as tags
- [ ] Confirm "+X more" appears if >3 topics

### ✅ 5. Summary Detail Pages

**Test Case 5.1: Navigation**
- [ ] Click any summary card
- [ ] Verify navigation to `/summary/[id]`
- [ ] Confirm URL contains correct summary ID

**Test Case 5.2: Content Display**
- [ ] Verify full summary text displays
- [ ] Check video metadata (title, channel, duration)
- [ ] Confirm topic tags appear
- [ ] Verify markdown formatting (headings, bold, lists)

**Test Case 5.3: Copy Link**
- [ ] Click "Copy Link" button
- [ ] Verify "Copied!" appears
- [ ] Paste in new tab - should navigate to same page

**Test Case 5.4: Share on X (Twitter)**
- [ ] Click "Share on X" button
- [ ] Verify new window opens
- [ ] Confirm tweet draft contains title and link

**Test Case 5.5: Watch Video**
- [ ] Click "Watch Video" button
- [ ] Verify YouTube opens in new tab
- [ ] Confirm correct video plays

### ✅ 6. Mind Map Visualization

**Test Case 6.1: Toggle Mind Map**
- [ ] On detail page, click "Show Mind Map"
- [ ] Verify mind map component loads
- [ ] Check for loading state during generation
- [ ] Confirm button changes to "Hide Mind Map"

**Test Case 6.2: Mind Map Content**
- [ ] Verify nodes appear:
  - Purple root node: "Summary"
  - Blue heading nodes (H2, H3 from summary)
  - Orange topic nodes
- [ ] Check edges connect nodes appropriately
- [ ] Verify circular layout

**Test Case 6.3: Mind Map Interactions**
- [ ] Drag nodes around canvas
- [ ] Use zoom controls (+/-)
- [ ] Pan the canvas (click and drag background)
- [ ] Check minimap in corner
- [ ] Verify legend displays node types

**Test Case 6.4: Mind Map Persistence**
- [ ] After generating mind map, refresh page
- [ ] Show mind map again
- [ ] Verify it loads quickly (from database)
- [ ] Check Supabase `mind_maps` table for record

### ✅ 7. GitHub Sync (Optional)

**Prerequisites:**
- GitHub token configured in `.env.local`
- Test repository exists

**Test Case 7.1: Configuration Check**
- [ ] If not configured, click "Sync to GitHub"
- [ ] Verify error message about missing configuration
- [ ] Confirm link to setup documentation

**Test Case 7.2: Successful Sync**
- [ ] Configure GitHub credentials
- [ ] Click "Sync to GitHub"
- [ ] Verify "Syncing..." state
- [ ] Confirm success message with GitHub link
- [ ] Check GitHub repo for new file in `summaries/` folder

**Test Case 7.3: File Content**
- [ ] Open synced markdown file on GitHub
- [ ] Verify contains:
  - Title as H1
  - Video URL
  - Channel name
  - Duration
  - Topics list
  - Full summary text
  - Footer with generation date

**Test Case 7.4: Update Sync**
- [ ] Sync same summary again
- [ ] Verify file updates (not creates duplicate)
- [ ] Check commit message says "Update summary"

**Test Case 7.5: Error Handling**
- [ ] Use invalid GitHub token
- [ ] Verify error message: "Invalid GitHub token"
- [ ] Try non-existent repo
- [ ] Confirm error: "Repository not found"

### ✅ 8. Error Handling

**Test Case 8.1: API Overload**
- [ ] If Claude API is overloaded
- [ ] Verify retry attempts occur (check console)
- [ ] Confirm user-friendly error message
- [ ] Check exponential backoff delays

**Test Case 8.2: Network Issues**
- [ ] Disable network briefly
- [ ] Attempt to summarize
- [ ] Verify timeout error appears
- [ ] Re-enable network and retry

**Test Case 8.3: Invalid API Keys**
- [ ] Temporarily use invalid Anthropic key
- [ ] Attempt summarization
- [ ] Verify specific error about API key
- [ ] Restore correct key

### ✅ 9. UI/UX

**Test Case 9.1: Responsive Design**
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1920px)
- [ ] Verify cards stack appropriately
- [ ] Check mind map scales correctly

**Test Case 9.2: Dark Mode**
- [ ] Toggle system dark mode
- [ ] Verify all components adapt
- [ ] Check contrast ratios
- [ ] Confirm readability

**Test Case 9.3: Loading States**
- [ ] Verify spinner during summarization
- [ ] Check skeleton screens on detail page
- [ ] Confirm "Searching..." message
- [ ] Verify "Syncing..." button state

**Test Case 9.4: Empty States**
- [ ] With no summaries, verify empty state
- [ ] Search with no results - check message
- [ ] Filter with no matches - verify feedback

### ✅ 10. Performance

**Test Case 10.1: Streaming Speed**
- [ ] Time streaming response
- [ ] Verify text appears within 2-3 seconds
- [ ] Check consistent stream (no long pauses)

**Test Case 10.2: Search Speed**
- [ ] Search executes in <500ms
- [ ] No lag when typing in search bar

**Test Case 10.3: Mind Map Generation**
- [ ] First generation: <3 seconds
- [ ] Cached load: <1 second
- [ ] Canvas interactions: smooth 60fps

**Test Case 10.4: Page Load**
- [ ] Homepage loads in <2 seconds
- [ ] Detail page loads in <1.5 seconds
- [ ] Images lazy load appropriately

## Bug Reporting Template

If you find issues, report them with:

```markdown
**Bug Title:** Brief description

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Environment:**
- Browser: Chrome/Firefox/Safari/Edge
- OS: macOS/Windows/Linux
- Screen size: Desktop/Tablet/Mobile

**Console Errors:**
```
Paste any console errors here
```

**Screenshots:**
[Attach if relevant]
```

## Success Criteria

All features pass testing when:
- ✅ Summaries generate correctly with streaming
- ✅ Database persistence works reliably
- ✅ Search returns accurate results
- ✅ Topic filtering works as expected
- ✅ Detail pages display complete information
- ✅ Mind maps visualize correctly
- ✅ GitHub sync saves files properly
- ✅ Error handling is graceful
- ✅ UI is responsive and accessible
- ✅ Performance meets targets

## Automated Testing (Future)

Consider adding:
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Playwright
- API tests with Supertest
- Performance tests with Lighthouse

---

**Happy Testing! 🧪**
