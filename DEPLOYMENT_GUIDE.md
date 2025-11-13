# Flowbit App Deployment Guide

This guide provides instructions for deploying the Flowbit application with Vanna AI integration.

## Prerequisites

1. **Vercel Account** - For frontend deployment
2. **Render Account** - For backend API and Vanna service
3. **PostgreSQL Database** - For data storage
4. **Groq API Key** - For Vanna AI integration

## Environment Variables

### Frontend (Vercel)

Add these environment variables to your Vercel project:

```
NEXT_PUBLIC_API_URL=https://your-api-url.onrender.com
NEXT_PUBLIC_VANNA_URL=https://your-vanna-service.onrender.com
```

### API Service (Render)

Add these environment variables to your Render backend service:

```
NODE_ENV=production
PORT=4001
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
VANNA_API_BASE_URL=https://your-vanna-service.onrender.com
```

### Vanna Service (Render)

Create a new Web Service on Render with these environment variables:

```
PYTHON_VERSION=3.12
PORT=8000
DATABASE_URL=your_postgres_connection_string
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=mixtral-8x7b-32768
```

## Deployment Steps

### 1. Deploy Vanna Service

1. Create a new Web Service on Render
2. Connect to your GitHub repository
3. Set the root directory to `apps/vanna`
4. Set the build command to `pip install -r requirements.txt`
5. Set the start command to `gunicorn app:app --worker-class uvicorn.workers.UvicornWorker --workers 1`
6. Add the environment variables from the Vanna Service section above
7. Deploy the service

### 2. Deploy Backend API

1. Create a new Web Service on Render
2. Connect to your GitHub repository
3. Set the root directory to `apps/api`
4. Set the build command to `npm install && npm run build`
5. Set the start command to `npm start`
6. Add the environment variables from the API Service section above
7. Deploy the service

### 3. Deploy Frontend

1. Connect your GitHub repository to Vercel
2. Set the root directory to `apps/web`
3. Add the environment variables from the Frontend section
4. Deploy the application

## Verifying the Deployment

1. **Check Vanna Service**: Visit `https://your-vanna-service.onrender.com/health`
   - Should return a 200 status with service information

2. **Check API Service**: Visit `https://your-api-url.onrender.com/api/health`
   - Should return a 200 status with API information

3. **Test Chat Functionality**:
   - Log in to the application
   - Navigate to the chat interface
   - Try asking: "What's the total spend in the last 90 days?"

## Troubleshooting

### Chat Not Working

1. Check browser console for errors (F12 > Console)
2. Verify all environment variables are set correctly
3. Check the Vanna service logs on Render
4. Test the Vanna API directly using Postman or curl

### Database Connection Issues

1. Verify the database URL is correct
2. Check if the database is accessible from Render's network
3. Check the database logs for connection attempts

### Performance Issues

1. Consider upgrading the Render service plan
2. Add caching for frequent queries
3. Optimize database indexes for common queries

## Monitoring

1. Set up logging for both frontend and backend
2. Monitor error rates and response times
3. Set up alerts for service downtime

## Maintenance

1. Regularly update dependencies
2. Monitor database storage and performance
3. Review and rotate API keys periodically
