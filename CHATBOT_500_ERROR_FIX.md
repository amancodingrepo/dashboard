# Chatbot 500 Error Fix Guide

## 🎉 Progress: 404 → 500 (Routing Fixed!)

The error changed from **404 to 500**, which means the routing fix worked! Now we need to fix the server configuration.

## 🔍 Root Cause: Missing Environment Variables

The 500 error is caused by missing `VANNA_API_BASE_URL` in your Vercel deployment.

### Current Flow:
1. ✅ Frontend sends request to `/api/chat-with-data`
2. ✅ API receives request (no more 404)
3. ❌ API tries to connect to `localhost:8000` (fails in production)
4. ❌ Returns 500 error

## 🔧 Fix: Set Environment Variables in Vercel

### Step 1: Get Your Render URL
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your `flowbit-vanna-ai` service
3. Copy the service URL (should be like `https://your-service.onrender.com`)

### Step 2: Set Vercel Environment Variables
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project
3. Go to **Settings > Environment Variables**
4. Add these variables:

```bash
# Required for chatbot
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com

# Optional but recommended
DATABASE_URL=your_postgres_connection_string
ALLOWED_ORIGINS=https://your-app.vercel.app
NODE_ENV=production
```

### Step 3: Redeploy
After adding environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **"Redeploy"** on the latest deployment
3. Wait for deployment to complete

## 🧪 Testing After Fix

### Test 1: Environment Check
```bash
curl https://your-app.vercel.app/api/test
```
Expected: `{"message":"API is working","timestamp":"..."}`

### Test 2: Chatbot Endpoint
```bash
curl -X POST https://your-app.vercel.app/api/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"query": "Show top vendors"}'
```

### Expected Responses:

**If VANNA_API_BASE_URL not set:**
```json
{
  "error": "Vanna AI service not configured...",
  "answer": "The AI service is not available...",
  "success": false
}
```

**If Vanna service is unreachable:**
```json
{
  "error": "Cannot connect to Vanna AI service...",
  "answer": "The AI service is currently unavailable...",
  "success": false
}
```

**If working correctly:**
```json
{
  "answer": "I found X results for your query.",
  "sql": "SELECT ...",
  "results": [...],
  "success": true
}
```

## 🔍 Debugging Steps

### Check Vercel Function Logs
1. Go to Vercel Dashboard > Your Project > Functions
2. Click on the API function
3. Check logs for:
   - `VANNA_API_BASE_URL: Set` or `Not set`
   - Connection errors
   - Response details

### Verify Render Service
1. Test your Render service directly:
   ```bash
   curl https://your-vanna-service.onrender.com/health
   ```
2. Should return service status

## 📋 Complete Environment Variables Checklist

### Vercel (Frontend + API)
- ✅ `VANNA_API_BASE_URL` - Your Render service URL
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ⚠️ `ALLOWED_ORIGINS` - Your Vercel app URL
- ⚠️ `NODE_ENV=production`

### Render (Vanna AI Service)
- ✅ `DATABASE_URL` - Same PostgreSQL connection
- ✅ `GROQ_API_KEY` - Your Groq API key
- ✅ `GROQ_MODEL=mixtral-8x7b-32768`
- ✅ `PORT=8000`

## 🚀 Next Steps

1. **Set VANNA_API_BASE_URL in Vercel** (critical)
2. **Redeploy Vercel project**
3. **Test the chatbot**
4. **Check logs if issues persist**

The chatbot should work after setting the environment variable! 🎉
