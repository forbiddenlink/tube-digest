# Deployment Guide for TubeDigest

This guide walks you through deploying TubeDigest to production.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest option as it's built by the Next.js team and offers:
- Automatic deployments from Git
- Edge functions for API routes
- Free tier for personal projects
- Built-in CI/CD

#### Step-by-Step Vercel Deployment

1. **Prepare Your Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/tubedigest.git
   git push -u origin main
   ```

2. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

3. **Import Project**
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings

4. **Configure Environment Variables**
   
   Add these in Vercel project settings:
   
   ```bash
   # Required
   ANTHROPIC_API_KEY=your_anthropic_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Optional - GitHub Sync
   GITHUB_TOKEN=your_github_token
   GITHUB_OWNER=your_username
   GITHUB_REPO=your_repo
   GITHUB_BRANCH=main
   NEXT_PUBLIC_GITHUB_CONFIGURED=true
   NEXT_PUBLIC_GITHUB_OWNER=your_username
   NEXT_PUBLIC_GITHUB_REPO=your_repo
   NEXT_PUBLIC_GITHUB_BRANCH=main
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `https://your-project.vercel.app`

6. **Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

### Option 2: Railway

Railway offers simple deployment with database hosting:

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   railway init
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set ANTHROPIC_API_KEY=your_key
   railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
   # ... add all other variables
   ```

4. **Deploy**
   ```bash
   railway up
   ```

### Option 3: Self-Hosted (VPS)

For more control, deploy to your own server:

#### Requirements
- Ubuntu 22.04 or similar
- Node.js 18+
- Nginx
- PM2 for process management

#### Deployment Steps

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Clone and Build**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/tubedigest.git
   cd tubedigest
   npm install
   npm run build
   ```

3. **Create Environment File**
   ```bash
   nano .env.local
   # Add all your environment variables
   ```

4. **Start with PM2**
   ```bash
   pm2 start npm --name "tubedigest" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/tubedigest
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/tubedigest /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Post-Deployment Checklist

### 1. Verify Environment Variables
- [ ] All required variables are set
- [ ] API keys are valid
- [ ] Supabase credentials are correct

### 2. Test Core Features
- [ ] Homepage loads
- [ ] Can summarize a video
- [ ] Search works
- [ ] Detail pages load
- [ ] Mind maps generate

### 3. Database Connection
- [ ] Supabase connection works
- [ ] Summaries save correctly
- [ ] Topics extract properly

### 4. Security
- [ ] API keys are not exposed in client code
- [ ] HTTPS is enabled
- [ ] CORS is configured if needed
- [ ] Rate limiting is in place (Vercel auto-handles)

### 5. Performance
- [ ] Check Vercel analytics
- [ ] Verify edge function performance
- [ ] Monitor API rate limits
- [ ] Check database query performance

## Monitoring & Maintenance

### Vercel Monitoring

Vercel provides built-in analytics:
- Function execution times
- Edge network performance
- Error tracking
- Bandwidth usage

Access at: `https://vercel.com/your-username/tubedigest/analytics`

### Supabase Monitoring

Monitor your database:
- Database size and growth
- Query performance
- API usage
- Row counts

Access at: `https://supabase.com/dashboard/project/your-project`

### Error Tracking (Optional)

Consider adding Sentry for error tracking:

1. **Install Sentry**
   ```bash
   npm install @sentry/nextjs
   ```

2. **Initialize**
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Add DSN to Environment**
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   ```

## Scaling Considerations

### Database
- **Current**: Supabase Free Tier (500MB, 50,000 rows)
- **Scaling**: Upgrade to Pro ($25/month for 8GB)
- **Optimization**: Add database indexes, archive old summaries

### API Rate Limits
- **Anthropic**: Monitor usage, upgrade plan if needed
- **YouTube**: youtubei.js has no hard limits but be respectful
- **GitHub**: 5,000 requests/hour with token

### Caching Strategy

Add caching for better performance:

```typescript
// In API routes
export const runtime = 'edge';
export const revalidate = 3600; // Revalidate every hour
```

### CDN for Assets
- Use Vercel's CDN (automatic)
- Or configure Cloudflare for custom domain

## Troubleshooting Deployment

### Build Failures

**Error: TypeScript errors**
```bash
# Run locally first
npm run build
# Fix all errors before deploying
```

**Error: Missing environment variables**
```bash
# Verify all required vars are set in Vercel/Railway
# Check for typos in variable names
```

### Runtime Errors

**Error: 500 Internal Server Error**
- Check Vercel function logs
- Verify environment variables
- Check Supabase connection

**Error: API timeouts**
- Increase function timeout in Vercel settings
- Optimize database queries
- Add retry logic (already implemented)

### Performance Issues

**Slow API responses**
- Check Anthropic API status
- Verify database query performance
- Monitor Vercel function execution time

**High bandwidth usage**
- Optimize images (already using thumbnails)
- Enable compression in Vercel
- Implement client-side caching

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to main:

```bash
git add .
git commit -m "Add new feature"
git push origin main
# Vercel automatically deploys
```

### Preview Deployments

Vercel creates preview deployments for PRs:
- Every pull request gets a unique URL
- Test before merging
- Share with team for review

### Rollback

If something goes wrong:
1. Go to Vercel dashboard
2. Navigate to Deployments
3. Click "..." on previous deployment
4. Click "Promote to Production"

## Environment-Specific Configurations

### Development
```bash
npm run dev
# Uses .env.local
```

### Preview (Vercel)
```bash
# Uses Preview environment variables
# Separate from production
```

### Production (Vercel)
```bash
# Uses Production environment variables
# Accessed at your-project.vercel.app
```

## Cost Estimates

### Free Tier (Hobby Projects)
- **Vercel**: Free (100GB bandwidth, 100GB-hrs compute)
- **Supabase**: Free (500MB database, 2GB file storage)
- **Anthropic**: Pay-per-use (~$3-15 per 1M tokens)
- **Total**: ~$0-50/month depending on usage

### Paid Tier (Production Apps)
- **Vercel Pro**: $20/month (1TB bandwidth, 1000GB-hrs compute)
- **Supabase Pro**: $25/month (8GB database, 100GB file storage)
- **Anthropic**: Pay-per-use (volume discounts available)
- **Total**: ~$45-100/month

## Security Best Practices

1. **Never commit `.env.local`**
   - Already in `.gitignore`
   - Use environment variables in hosting platform

2. **Rotate API Keys Regularly**
   - Change keys every 90 days
   - Update in Vercel/Railway

3. **Enable Supabase RLS**
   - Already configured in migrations
   - Verify policies are active

4. **Use HTTPS Only**
   - Vercel provides automatic SSL
   - Redirect HTTP to HTTPS

5. **Monitor API Usage**
   - Set up alerts for unusual activity
   - Implement rate limiting

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Anthropic API**: https://docs.anthropic.com

---

**Ready to deploy! 🚀**
