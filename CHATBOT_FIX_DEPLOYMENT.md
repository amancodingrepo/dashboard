# Chatbot Deployment Fix Guide

## Issues Identified and Fixed

### 1. API Response Format Mismatch ✅ FIXED
- **Problem**: Frontend expected different response fields than Vanna AI provided
- **Solution**: Updated `apps/api/src/routes/chatWithData.ts` to properly map responses

### 2. Frontend API URL Configuration ✅ FIXED  
- **Problem**: Frontend was using localhost fallback in production
- **Solution**: Updated `apps/web/components/chat/ChatInterface.tsx` to use current origin

### 3. CORS Configuration ✅ FIXED
- **Problem**: Vanna AI service might block cross-origin requests
- **Solution**: Updated `vanna/app.py` with proper CORS settings

## Required Environment Variables

### For Vercel (Frontend + API)
Set these in your Vercel dashboard:

```bash
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=https://your-app.vercel.app

# API Environment Variables  
DATABASE_URL=postgresql://user:password@host:5432/database
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
ALLOWED_ORIGINS=https://your-app.vercel.app
NODE_ENV=production
```

### For Render (Vanna AI Service)
Set these in your Render dashboard:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
GROQ_MODEL=mixtral-8x7b-32768
PORT=8000
HOST=0.0.0.0
```

## Deployment Steps

### 1. Update Render Environment Variables
1. Go to your Render dashboard
2. Find your `flowbit-vanna-ai` service
3. Go to Environment tab
4. Set the required variables above
5. Deploy the service

### 2. Update Vercel Environment Variables
1. Go to your Vercel dashboard
2. Find your project
3. Go to Settings > Environment Variables
4. Set the required variables above
5. Redeploy the project

### 3. Test the Integration
1. Open your deployed app
2. Navigate to the dashboard
3. Try the chatbot with a query like "Show top 5 vendors by spend"
4. Check browser console for any errors

## Common Issues and Solutions

### Issue: "API Error" in chatbot
- **Check**: VANNA_API_BASE_URL is set correctly in Vercel
- **Check**: Vanna service is running on Render
- **Check**: GROQ_API_KEY is set in Render

### Issue: CORS errors
- **Solution**: Already fixed in vanna/app.py
- **Check**: Redeploy Render service after the fix

### Issue: Database connection errors
- **Check**: DATABASE_URL is the same in both Vercel and Render
- **Check**: Database is accessible from both services

## Testing Commands

### Test Vanna AI Service Health
```bash
curl https://your-vanna-service.onrender.com/health
```

### Test API Endpoint
```bash
curl -X POST https://your-app.vercel.app/api/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"query": "Show top vendors"}'
```

## Next Steps

1. ✅ Code fixes applied
2. 🔄 Update environment variables in Render
3. 🔄 Update environment variables in Vercel  
4. 🔄 Redeploy both services
5. 🔄 Test chatbot functionality

The chatbot should work after completing steps 2-5!
