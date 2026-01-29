# GitHub Sync Setup Guide

The GitHub sync feature allows you to automatically save your video summaries as markdown files to a GitHub repository.

## Prerequisites

1. A GitHub account
2. A GitHub repository where you want to store summaries
3. A GitHub Personal Access Token with appropriate permissions

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., `youtube-summaries`)
4. Choose whether it should be public or private
5. Initialize with a README (optional)
6. Click "Create repository"

## Step 2: Generate a Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Direct link: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give your token a descriptive name (e.g., "TubeDigest Sync")
4. Set an expiration date (or choose "No expiration" if preferred)
5. Select the following scopes:
   - ✅ `repo` (Full control of private repositories)
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
6. Click "Generate token"
7. **IMPORTANT:** Copy the token immediately - you won't be able to see it again!

## Step 3: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# GitHub Sync Configuration
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=youtube-summaries
GITHUB_BRANCH=main

# This tells the app that GitHub is configured
NEXT_PUBLIC_GITHUB_CONFIGURED=true
NEXT_PUBLIC_GITHUB_OWNER=your_github_username
NEXT_PUBLIC_GITHUB_REPO=youtube-summaries
NEXT_PUBLIC_GITHUB_BRANCH=main
NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_personal_access_token_here
```

### Example:

```bash
GITHUB_TOKEN=ghp_abcd1234efgh5678ijkl9012mnop3456qrst7890
GITHUB_OWNER=elizabethstein
GITHUB_REPO=youtube-summaries
GITHUB_BRANCH=main

NEXT_PUBLIC_GITHUB_CONFIGURED=true
NEXT_PUBLIC_GITHUB_OWNER=elizabethstein
NEXT_PUBLIC_GITHUB_REPO=youtube-summaries
NEXT_PUBLIC_GITHUB_BRANCH=main
NEXT_PUBLIC_GITHUB_TOKEN=ghp_abcd1234efgh5678ijkl9012mnop3456qrst7890
```

## Step 4: Restart Your Development Server

After adding the environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## Step 5: Test the Sync

1. Generate a summary for any YouTube video
2. Go to the summary detail page
3. Click the "Sync to GitHub" button
4. Check your GitHub repository - you should see a new file in the `summaries/` folder!

## File Structure

Summaries will be saved in the following format:

```
summaries/
  └── 2025-11-19-video-title-here.md
```

Each markdown file contains:
- Video title
- Video URL
- Channel name
- Duration
- Topics/tags
- Full summary text
- Timestamp

## Troubleshooting

### "Invalid GitHub token"
- Verify your token is correct in `.env.local`
- Ensure the token has the `repo` scope
- Generate a new token if needed

### "Repository not found"
- Check that `GITHUB_OWNER` and `GITHUB_REPO` are correct
- Verify the repository exists
- Ensure your token has access to the repository

### "Sync to GitHub" button shows error
- Make sure all environment variables are set
- Restart your development server after adding variables
- Check browser console for detailed error messages

## Security Notes

⚠️ **IMPORTANT:**
- Never commit your `.env.local` file to git
- Keep your GitHub token secret
- Regularly rotate your tokens for better security
- Use fine-grained tokens when possible (currently in beta)

## Advanced Configuration

### Custom Branch

To sync to a different branch:

```bash
GITHUB_BRANCH=summaries
NEXT_PUBLIC_GITHUB_BRANCH=summaries
```

### Multiple Repositories

You can change the repository in the UI by updating the environment variables and restarting the server.

---

**Need help?** Check the main README or open an issue on GitHub.
