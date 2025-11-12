# Deployment Configuration Guide

## Environment Variables for Vercel

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### Backend API (Vercel Environment Variables)
```
NODE_ENV=production
PORT=4001
LOG_LEVEL=info
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://user:password@host:6379
ALLOWED_ORIGINS=https://your-app-name.vercel.app
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
GROQ_API_KEY=your-groq-api-key-here
```

## Environment Variables for Render (Vanna AI)
```
DATABASE_URL=postgresql://user:password@host:5432/database
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=mixtral-8x7b-32768
PORT=8000
HOST=0.0.0.0
```

## Deployment URLs Structure
- Frontend: https://your-app-name.vercel.app
- Backend API: https://your-app-name.vercel.app/api/*
- Vanna AI: https://your-vanna-service.onrender.com

## Next Steps
1. Deploy to Vercel
2. Deploy Vanna AI to Render
3. Update environment variables with actual URLs
4. Test functionality
