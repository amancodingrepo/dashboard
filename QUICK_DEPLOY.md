# 🚀 QUICK DEPLOYMENT GUIDE

## Your Configuration
- Database: postgresql://postgres.tvahytgzhwgdgisgctnv:aman@69@aman@aws-0-us-west-1.pooler.supabase.com:6543/postgres
- Supabase Project: https://tvahytgzhwgdgisgctnv.supabase.co
- Target: Frontend + Backend on Vercel, Vanna AI on Render

## STEP 1: Run SQL in Supabase (2 minutes)
1. Go to https://supabase.com/dashboard/project/tvahytgzhwgdgisgctnv/sql/new
2. Copy ALL content from `supabase-schema.sql`
3. Click "Run" button
4. ✅ You should see "Success. No rows returned"

## STEP 2: Deploy to Vercel (5 minutes)
Run in terminal:
```bash
vercel --prod
```

Answer prompts:
- Set up and deploy? → Y
- Which scope? → (Choose your account)
- Link to existing project? → N
- Project name → flowbit-dashboard
- Directory → . (press Enter)

You'll get a URL like: https://flowbit-dashboard-xxx.vercel.app

## STEP 3: Set Vercel Environment Variables
1. Go to https://vercel.com/dashboard
2. Click your project → Settings → Environment Variables
3. Add these (click "Add" for each):

```
DATABASE_URL
postgresql://postgres.tvahytgzhwgdgisgctnv:aman@69@aman@aws-0-us-west-1.pooler.supabase.com:6543/postgres

GROQ_API_KEY
(your groq api key)

ALLOWED_ORIGINS
https://flowbit-dashboard-xxx.vercel.app

NODE_ENV
production

LOG_LEVEL
info

PORT
4001
```

4. Click "Redeploy" after adding variables

## STEP 4: Deploy Vanna AI to Render (10 minutes)
1. Go to https://render.com/
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: flowbit-vanna-ai
   - Root Directory: vanna
   - Runtime: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: python app.py
6. Add Environment Variables:
   - DATABASE_URL: (same as above)
   - GROQ_API_KEY: (your key)
   - PORT: 8000
7. Click "Create Web Service"

You'll get URL: https://flowbit-vanna-ai.onrender.com

## STEP 5: Update Vanna URL in Vercel
1. Back to Vercel → Environment Variables
2. Add:
```
VANNA_API_BASE_URL
https://flowbit-vanna-ai.onrender.com
```
3. Redeploy

## FINAL RESULT
✅ Frontend: https://flowbit-dashboard-xxx.vercel.app
✅ Backend API: https://flowbit-dashboard-xxx.vercel.app/api
✅ Vanna AI: https://flowbit-vanna-ai.onrender.com

## Test Your Deployment
1. Open your Vercel URL
2. Try the dashboard
3. Test AI chat with natural language queries
