# 🚀 Vercel Deployment Guide

Complete guide to deploy your Flowbit app to Vercel (Frontend + Backend API).

---

## 📋 Prerequisites

- [ ] GitHub account with your code pushed
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] PostgreSQL database (Supabase/Neon/Railway)
- [ ] Groq API key
- [ ] Vanna AI service URL (deployed on Render)

---

## 🎯 Step 1: Prepare Your Repository

### 1.1 Update Environment Variables

Create a `.env.production` file (don't commit this):

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# API Configuration
NODE_ENV=production
PORT=4001
ALLOWED_ORIGINS=https://yourapp.vercel.app

# Vanna AI
VANNA_API_BASE_URL=https://your-vanna.onrender.com

# Groq (for Vanna AI - set on Render)
GROQ_API_KEY=your_groq_key_here
```

### 1.2 Update API URL in Frontend

The frontend should use the Vercel deployment URL. Update `apps/web/components/chat/ChatInterface.tsx`:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://yourapp.vercel.app'
```

---

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Connect Repository

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Select the repository

### 2.2 Configure Project

**Root Directory:** `apps/web`

**Build Settings:**
- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install`

### 2.3 Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Frontend
NEXT_PUBLIC_API_URL=https://yourapp.vercel.app
NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app

# Backend API (if deploying API separately)
DATABASE_URL=postgresql://...
VANNA_API_BASE_URL=https://your-vanna.onrender.com
ALLOWED_ORIGINS=https://yourapp.vercel.app
NODE_ENV=production
```

### 2.4 Deploy

Click **"Deploy"** and wait for the build to complete.

Your frontend will be available at: `https://yourapp.vercel.app`

---

## 🔧 Step 3: Deploy Backend API to Vercel

### Option A: Deploy API as Separate Vercel Project (Recommended)

1. **Create New Vercel Project**
   - Add New Project → Import Repository
   - **Root Directory:** `apps/api`

2. **Configure Build Settings**
   - Framework Preset: **Other**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install --legacy-peer-deps`

3. **Add Environment Variables**
   ```env
   DATABASE_URL=postgresql://...
   VANNA_API_BASE_URL=https://your-vanna.onrender.com
   ALLOWED_ORIGINS=https://yourapp.vercel.app
   NODE_ENV=production
   PORT=4001
   ```

4. **Update vercel.json for API**
   Create `apps/api/vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/index.js"
       }
     ]
   }
   ```

5. **Update Frontend API URL**
   In Vercel Dashboard → Frontend Project → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.vercel.app
   ```

### Option B: Deploy API as Next.js API Routes

Convert your Express API to Next.js API routes in `apps/web/app/api/`.

---

## 🤖 Step 4: Deploy Vanna AI to Render

### 4.1 Create Render Account

1. Sign up at [render.com](https://render.com)
2. Connect your GitHub account

### 4.2 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your repository
3. Select the repository

### 4.3 Configure Service

**Settings:**
- **Name:** `vanna-ai-service`
- **Environment:** `Python 3`
- **Root Directory:** `vanna`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `python app.py`
- **Instance Type:** Free (or paid for production)

### 4.4 Environment Variables

Add in Render Dashboard → Environment:

```env
DATABASE_URL=postgresql://...
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=mixtral-8x7b-32768
PORT=8000
HOST=0.0.0.0
```

### 4.5 Deploy

Click **"Create Web Service"** and wait for deployment.

Your Vanna AI will be available at: `https://your-vanna.onrender.com`

---

## 🔗 Step 5: Update All URLs

### 5.1 Update Frontend Environment Variables

In Vercel Dashboard → Frontend Project → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
```

### 5.2 Update Backend API Environment Variables

In Vercel Dashboard → API Project → Environment Variables:

```env
VANNA_API_BASE_URL=https://your-vanna.onrender.com
ALLOWED_ORIGINS=https://yourapp.vercel.app
```

### 5.3 Update CORS Settings

Make sure your API allows requests from your Vercel frontend domain.

---

## 🗄️ Step 6: Database Setup

### 6.1 Run Migrations

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migrations
cd apps/api
npx prisma migrate deploy
```

### 6.2 Seed Database (Optional)

```bash
node dist/seed.js
```

---

## ✅ Step 7: Verify Deployment

### 7.1 Test Frontend

Visit: `https://yourapp.vercel.app`

### 7.2 Test API

```bash
curl https://your-api.vercel.app/api/version
curl https://your-api.vercel.app/api/dashboard/stats
```

### 7.3 Test Vanna AI

```bash
curl https://your-vanna.onrender.com/health
```

### 7.4 Test Chat Feature

1. Open your Vercel frontend
2. Navigate to Dashboard
3. Try the chat feature
4. Verify it connects to your API

---

## 🔒 Step 8: Security Checklist

- [ ] All environment variables set in Vercel/Render
- [ ] CORS configured correctly
- [ ] Database credentials secure
- [ ] API keys not exposed in code
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Rate limiting configured
- [ ] Error messages don't expose sensitive info

---

## 📊 Monitoring

### Vercel Analytics

- View deployment logs in Vercel Dashboard
- Monitor API usage and performance
- Set up alerts for errors

### Render Monitoring

- View logs in Render Dashboard
- Monitor service health
- Set up health checks

---

## 🔄 Continuous Deployment

Both Vercel and Render automatically deploy on git push to main branch.

**Workflow:**
1. Push code to GitHub
2. Vercel builds and deploys frontend
3. Vercel builds and deploys API (if separate)
4. Render builds and deploys Vanna AI

---

## 🐛 Troubleshooting

### Frontend Can't Connect to API

- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify API is deployed and accessible
- Check CORS settings in API

### API Can't Connect to Database

- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- Run migrations: `npx prisma migrate deploy`

### Vanna AI Not Working

- Check `GROQ_API_KEY` is set in Render
- Verify `VANNA_API_BASE_URL` is correct in API
- Check Render service logs

### Build Failures

- Check build logs in Vercel/Render
- Verify all dependencies are in `package.json`
- Ensure Node.js/Python versions are compatible

---

## 📝 Quick Reference

**Frontend URL:** `https://yourapp.vercel.app`  
**API URL:** `https://your-api.vercel.app`  
**Vanna AI URL:** `https://your-vanna.onrender.com`  
**Database:** Your PostgreSQL connection string

---

## 🎉 Success!

Your application is now live in production! 🚀

---

**Last Updated:** November 2025

