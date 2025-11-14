# Flowbit App Deployment Guide - Vercel + Vanna AI

## Prerequisites

- **GitHub Repository**: Code pushed to GitHub
- **Vercel Account**: [vercel.com](https://vercel.com)
- **Render Account**: [render.com](https://render.com) for Vanna AI service
- **Supabase/PostgreSQL**: Hosted PostgreSQL database
- **Groq API Key**: From [Groq Console](https://console.groq.com)

## Overview

This guide covers deploying the complete Flowbit Analytics stack:
- **Frontend**: Next.js app deployed to Vercel
- **Backend API**: Express.js API deployed to Render
- **AI Service**: Vanna AI service deployed to Render
- **Database**: PostgreSQL (Supabase recommended)

## Database Setup

### Option 1: Supabase (Recommended)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database → Connection string
4. Run SQL schema:
```sql
-- Run supabase-schema.sql in Supabase SQL Editor
-- Or use Prisma: npx prisma migrate deploy
```

### Option 2: Alternative PostgreSQL Services

- **Railway**: [railway.app](https://railway.app)
- **Neon**: [neon.tech](https://neon.tech)
- **ElephantSQL**: [elephantsql.com](https://elephantsql.com)

## Step 1: Deploy Vanna AI Service to Render

The Vanna AI service handles natural language to SQL conversion.

### 1.1 Create Render Web Service

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure service settings:
   - **Name**: `flowbit-vanna-ai`
   - **Root Directory**: `apps/vanna`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`

### 1.2 Environment Variables

Add these environment variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database  # Your PostgreSQL connection string
GROQ_API_KEY=gsk_your_groq_api_key_here                    # From Groq Console
GROQ_MODEL=mixtral-8x7b-32768                               # AI model for SQL generation
PORT=8000                                                  # Service port
```

### 1.3 Deploy and Verify

1. Click **Create Web Service**
2. Wait for build and deployment (may take 5-10 minutes)
3. Verify service at: `https://your-service-name.onrender.com/health`
4. Expected response:
```json
{
  "status": "ok",
  "groq_configured": true,
  "db_configured": true,
  "timestamp": "2024-11-14T..."
}
```

## Step 2: Deploy Backend API to Render

The Express API handles business logic and data processing.

### 2.1 Create Render Web Service

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure service settings:
   - **Name**: `flowbit-api`
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 2.2 Environment Variables

Add these environment variables:

```
NODE_ENV=production
PORT=4001
DATABASE_URL=postgresql://user:password@host:5432/database  # Same as Vanna
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com  # Vanna service URL
ALLOWED_ORIGINS=https://your-frontend.vercel.app            # Your Vercel URL
LOG_LEVEL=info
```

### 2.3 Database Migration

After deployment, run Prisma migrations:

```bash
# Via Render shell or SSH
npx prisma migrate deploy

# Optional: Seed with test data
npm run seed
```

### 2.4 Verify Deployment

Test endpoints:
- Health: `https://your-api.onrender.com/api/health`
- Dashboard: `https://your-api.onrender.com/api/dashboard`

## Step 3: Deploy Frontend to Vercel

The Next.js frontend provides the user interface.

### 3.1 Connect Repository

1. Go to Vercel Dashboard → New Project
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3.2 Environment Variables

Add these environment variables:

```
NEXT_PUBLIC_API_URL=https://your-api.onrender.com      # API service URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app        # Vercel domain
```

### 3.3 Deploy

1. Click **Deploy**
2. Wait for build completion
3. Access your application at the provided Vercel URL

## Configuration Reference

### All Services - Database Connection

```
DATABASE_URL=postgresql://postgres.xxx:password@host.region.supabase.co:5432/postgres
```

### Vanna AI Service - AI Configuration

```
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=mixtral-8x7b-32768
```

### API Service - External Services

```
VANNA_API_BASE_URL=https://flowbit-vanna-ai.onrender.com
ALLOWED_ORIGINS=https://flowbit-analytics.vercel.app
```

### Frontend - Service URLs

```
NEXT_PUBLIC_API_URL=https://flowbit-api.onrender.com
NEXT_PUBLIC_APP_URL=https://flowbit-analytics.vercel.app
```

## Testing Deployment

### 1. Frontend Access
- Visit your Vercel URL
- Should load dashboard without errors

### 2. API Connectivity
- Check browser Network tab for API calls
- All `/api/*` requests should return 200 status

### 3. Chat Functionality
- Go to dashboard
- Try chat queries like "Show top vendors"
- Should return data with generated SQL

### 4. Full Flow Test

```bash
# Test API directly
curl -X GET "https://your-api.onrender.com/api/dashboard"

# Test AI chat
curl -X POST "https://your-api.onrender.com/api/chat-with-data" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is total spend?"}'
```

## Troubleshooting

### Chat Not Working

1. **Check Vanna Service**:
   ```bash
   curl https://your-vanna-service.onrender.com/health
   ```
   Should return `"status": "ok"`

2. **Check API Configuration**:
   - Verify `VANNA_API_BASE_URL` in API service env vars
   - Check API service logs in Render

3. **Check Frontend**:
   - Verify `NEXT_PUBLIC_API_URL` matches your API service URL
   - Open browser DevTools → Network to see failed requests

### Database Connection Issues

1. **Verify Connection String**:
   - Ensure host, port, username, password are correct
   - Check if database allows external connections

2. **Test from Services**:
   - Check Render logs for connection errors
   - Verify database credentials in each service

### Build Failures

1. **Check Logs**: Review build logs in Vercel/Render dashboards
2. **Dependencies**: Ensure all packages are in `package.json` or `requirements.txt`
3. **Environment**: Verify all required environment variables are set

## Cost Estimates (Free Tier)

- **Vercel**: Free for personal projects (500GB bandwidth/month)
- **Render**: Free tier (750 hours/month) + $7/GB for additional usage
- **Supabase**: Free tier (500MB database, 50MB file storage)
- **Groq**: Pay-per-token usage (very reasonable for AI queries)

## Scaling Considerations

### Performance Optimization

1. **Enable Caching**:
   - Redis for session/cache storage
   - API response caching in Render

2. **Database Indexing**:
   - Ensure indexes on frequently queried columns:
   ```sql
   CREATE INDEX idx_invoice_vendor ON invoice(vendor_id);
   CREATE INDEX idx_invoice_date ON invoice(invoice_date);
   ```

3. **CDN & Static Assets**:
   - Vercel automatically serves static assets via CDN
   - Images and files optimized automatically

### Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Render Logs**: Application logs in dashboard
3. **Database**: Monitor query performance in Supabase dashboard
4. **Uptime**: Set up monitoring alerts for service availability

## Security Considerations

### API Security
- CORS configured for production domains only
- Rate limiting implemented (100 req/15min per IP)
- Future: Add JWT authentication for sensitive endpoints

### Environment Variables
- Never commit secrets to Git
- Use different secrets for staging/production
- Rotate API keys periodically

### Database Security
- Use connection pooling
- Enable Row Level Security (RLS) if required
- Regular backup schedule

## Next Steps

1. **Domain Configuration**: Connect custom domain to Vercel
2. **SSL/TLS**: Automatic with Vercel and Render
3. **CDN**: Global CDN enabled by default
4. **Analytics**: Integrate usage analytics (optional)
5. **Backup**: Configure automated database backups

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Groq Docs**: [console.groq.com/docs](https://console.groq.com/docs)
