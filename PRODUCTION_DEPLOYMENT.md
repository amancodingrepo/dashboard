# 🚀 Production Deployment Guide

Complete step-by-step guide to deploy Flowbit to production.

---

## 📋 Architecture Overview

```
┌─────────────────────────────────┐
│   Vercel (Frontend)             │
│   https://yourapp.vercel.app   │
│   Next.js Application          │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│   Vercel (Backend API)          │
│   https://yourapp.vercel.app   │
│   Same domain, /api routes     │
└──────────────┬──────────────────┘
               │
               ├──────────────────┐
               ▼                  ▼
┌──────────────────────┐  ┌──────────────────────┐
│   PostgreSQL         │  │   Render (Vanna AI)  │
│   (Supabase/Neon)    │  │   https://vanna...   │
└──────────────────────┘  └──────────────────────┘
```

---

## 🎯 Quick Start Checklist

- [ ] PostgreSQL database provisioned
- [ ] GitHub repository ready
- [ ] Vercel account created
- [ ] Render account created
- [ ] Groq API key obtained

---

## 📦 Step 1: Database Setup

### Option A: Supabase (Recommended - Free Tier)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and name
   - Set database password (save it!)
   - Select region closest to you

2. **Get Connection String**
   - Go to Project Settings → Database
   - Copy "Connection string" → "URI"
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Run Migrations**
   ```bash
   cd apps/api
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

### Option B: Neon (Serverless PostgreSQL)

1. Create account at [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string
4. Run migrations as above

### Option C: Railway

1. Create account at [railway.app](https://railway.app)
2. New Project → Add PostgreSQL
3. Get DATABASE_URL from variables
4. Run migrations

---

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Prepare Repository

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

### 2.2 Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"

2. **Import Repository**
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build` (auto)
   - **Output Directory:** `.next` (auto)
   - **Install Command:** `npm install` (auto)

4. **Environment Variables**
   Add these in the Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://yourapp.vercel.app
   NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://yourapp.vercel.app`

---

## 🔧 Step 3: Deploy Backend API

### Option A: Next.js API Routes (Recommended - Same Domain)

Convert your Express API to Next.js API routes for seamless deployment.

**Benefits:**
- Same domain (no CORS issues)
- Automatic scaling
- No separate deployment needed

**Steps:**
1. Create `apps/web/app/api/` directory structure
2. Convert Express routes to Next.js route handlers
3. Deploy with frontend (automatic)

### Option B: Separate Vercel Serverless Function

1. **Create New Vercel Project**
   - Add New Project → Import same repository
   - **Root Directory:** `apps/api`

2. **Configure Build**
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install --legacy-peer-deps`

3. **Environment Variables**
   ```
   DATABASE_URL=postgresql://...
   VANNA_API_BASE_URL=https://your-vanna.onrender.com
   ALLOWED_ORIGINS=https://yourapp.vercel.app
   NODE_ENV=production
   ```

4. **Update Frontend API URL**
   In frontend Vercel project:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.vercel.app
   ```

---

## 🤖 Step 4: Deploy Vanna AI to Render

### 4.1 Create Render Account

1. Sign up at [render.com](https://render.com)
2. Connect GitHub account

### 4.2 Deploy Web Service

1. **New Web Service**
   - Click "New +" → "Web Service"
   - Connect your repository

2. **Configure Service**
   - **Name:** `vanna-ai-service`
   - **Environment:** `Python 3`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `vanna`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`
   - **Plan:** Free (or paid for production)

3. **Environment Variables**
   Add in Render dashboard:
   ```
   DATABASE_URL=postgresql://...
   GROQ_API_KEY=your_groq_api_key_here
   GROQ_MODEL=mixtral-8x7b-32768
   PORT=8000
   HOST=0.0.0.0
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (takes 2-5 minutes)
   - Your service will be at: `https://vanna-ai-service.onrender.com`

### 4.3 Update API Configuration

In your backend API (Vercel), update:
```
VANNA_API_BASE_URL=https://vanna-ai-service.onrender.com
```

---

## 🔗 Step 5: Connect Everything

### 5.1 Update Environment Variables

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_URL=https://yourapp.vercel.app
```

**Backend API (Vercel):**
```
DATABASE_URL=postgresql://...
VANNA_API_BASE_URL=https://vanna-ai-service.onrender.com
ALLOWED_ORIGINS=https://yourapp.vercel.app
NODE_ENV=production
```

**Vanna AI (Render):**
```
DATABASE_URL=postgresql://...
GROQ_API_KEY=your_groq_key
GROQ_MODEL=mixtral-8x7b-32768
```

### 5.2 Run Database Migrations

```bash
# Set your production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
cd apps/api
npx prisma migrate deploy

# Optional: Seed database
node dist/seed.js
```

---

## ✅ Step 6: Verify Deployment

### 6.1 Test Frontend
- Visit: `https://yourapp.vercel.app`
- Check dashboard loads
- Verify charts display

### 6.2 Test API
```bash
curl https://yourapp.vercel.app/api/health
curl https://yourapp.vercel.app/api/dashboard/stats
```

### 6.3 Test Vanna AI
```bash
curl https://vanna-ai-service.onrender.com/health
```

### 6.4 Test Chat Feature
1. Open your deployed frontend
2. Navigate to Dashboard
3. Try asking: "What's the total spend?"
4. Verify it works end-to-end

---

## 🔒 Security Checklist

- [x] All environment variables set (never commit to git)
- [x] CORS configured correctly
- [x] Database credentials secure
- [x] API keys not exposed
- [x] HTTPS enabled (automatic on Vercel/Render)
- [x] Rate limiting enabled
- [x] Error messages don't expose sensitive info

---

## 📊 Monitoring & Logs

### Vercel
- **Dashboard:** View deployments, logs, analytics
- **Logs:** Real-time function logs
- **Analytics:** Performance metrics

### Render
- **Dashboard:** Service status, logs
- **Logs:** Real-time application logs
- **Metrics:** CPU, memory usage

---

## 🔄 Continuous Deployment

Both platforms auto-deploy on git push:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Automatic Deployment**
   - Vercel detects changes → builds → deploys
   - Render detects changes → builds → deploys

3. **Check Status**
   - Vercel: Dashboard shows deployment status
   - Render: Dashboard shows build logs

---

## 🐛 Troubleshooting

### Frontend Can't Connect to API

**Problem:** CORS errors or connection refused

**Solution:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Ensure API is deployed and accessible

### API Can't Connect to Database

**Problem:** Database connection errors

**Solution:**
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Run migrations: `npx prisma migrate deploy`
- Check database is not paused (Supabase free tier)

### Vanna AI Not Working

**Problem:** Chat feature fails

**Solution:**
- Check `GROQ_API_KEY` is set in Render
- Verify `VANNA_API_BASE_URL` is correct in API
- Check Render service logs
- Ensure service is not sleeping (free tier sleeps after inactivity)

### Build Failures

**Problem:** Deployment fails

**Solution:**
- Check build logs in Vercel/Render
- Verify all dependencies in `package.json`
- Ensure Node.js/Python versions compatible
- Check for TypeScript errors

---

## 💰 Cost Estimation

### Free Tier (Development/Small Projects)

- **Vercel:** Free (generous limits)
- **Render:** Free (services sleep after inactivity)
- **Supabase:** Free (500MB database, 2GB bandwidth)
- **Total:** $0/month

### Production Tier (Recommended)

- **Vercel Pro:** $20/month (better performance)
- **Render:** $7/month per service (no sleep)
- **Supabase Pro:** $25/month (8GB database)
- **Total:** ~$52/month

---

## 📝 Quick Reference

| Service | URL | Environment Variables |
|---------|-----|----------------------|
| Frontend | `https://yourapp.vercel.app` | `NEXT_PUBLIC_API_URL` |
| Backend API | `https://yourapp.vercel.app/api` | `DATABASE_URL`, `VANNA_API_BASE_URL` |
| Vanna AI | `https://vanna-ai-service.onrender.com` | `GROQ_API_KEY`, `DATABASE_URL` |
| Database | Your PostgreSQL URL | Connection string |

---

## 🎉 Success!

Your application is now live in production! 🚀

**Next Steps:**
1. Set up custom domain (optional)
2. Configure monitoring alerts
3. Set up backup strategy
4. Enable analytics

---

**Last Updated:** November 2025

