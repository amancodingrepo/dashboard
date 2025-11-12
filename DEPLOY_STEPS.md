# 🚀 Deployment Steps for Flowbit App

## Prerequisites
- [x] Groq API Key (you have this)
- [ ] Database URL (PostgreSQL) - **YOU NEED TO GET THIS**
- [ ] GitHub account
- [ ] Vercel account
- [ ] Render account

## Step 1: Set Up Database (YOU NEED TO DO THIS)

Choose one of these **FREE** database providers:

### Option A: Supabase (Recommended)
1. Go to https://supabase.com
2. Sign up with GitHub
3. Create new project
4. Go to Settings > Database
5. Copy connection string (starts with `postgresql://`)

### Option B: Neon
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create database
4. Copy connection string

### Option C: Railway
1. Go to https://railway.app
2. Sign up with GitHub
3. Create PostgreSQL database
4. Copy connection string

## Step 2: Deploy Frontend + Backend to Vercel

1. **Push to GitHub first:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```
   
3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add these environment variables:
     - `DATABASE_URL`: Your database connection string
     - `GROQ_API_KEY`: Your Groq API key
     - `ALLOWED_ORIGINS`: Your Vercel app URL
     - `NODE_ENV`: production

## Step 3: Deploy Vanna AI to Render

1. **Create Render account** at https://render.com
2. **Create new Web Service**
3. **Connect your GitHub repo**
4. **Configure:**
   - Root Directory: `vanna`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
5. **Set environment variables:**
   - `DATABASE_URL`: Same as Vercel
   - `GROQ_API_KEY`: Same as Vercel
   - `PORT`: 8000

## Step 4: Update URLs

After both deployments, update environment variables with actual URLs:
- Update `VANNA_API_BASE_URL` in Vercel with your Render URL
- Update `ALLOWED_ORIGINS` in Vercel with your actual Vercel URL

## What I'll Help You With

Once you get the database URL, I can:
1. Help configure the environment variables
2. Test the deployments
3. Debug any issues
4. Set up the database schema

## Current Status
- ✅ Project structure ready
- ✅ Vanna AI service ready
- ✅ Vercel configuration ready
- ⏳ Waiting for database URL
- ⏳ Ready to deploy once you have database
