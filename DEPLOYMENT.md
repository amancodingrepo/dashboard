# Production Deployment Guide

Complete guide for deploying the full-stack analytics dashboard to production.

---

## 🎯 Deployment Architecture

```
┌─────────────────┐
│   Vercel        │
│  (Frontend)     │
│  Next.js App    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Vercel        │
│  (Backend API)  │
│  Express/Next   │
└────────┬────────┘
         │
         ├──────────────────┐
         ▼                  ▼
┌─────────────────┐  ┌──────────────┐
│  PostgreSQL     │  │  Vanna AI    │
│  (Database)     │  │  (Render.com)│
└─────────────────┘  └──────────────┘
```

---

## 📋 Pre-Deployment Checklist

- [ ] PostgreSQL database provisioned (Supabase/Neon/Railway)
- [ ] Database migrated and seeded
- [ ] Groq API key obtained
- [ ] Vanna AI service deployed
- [ ] Environment variables prepared
- [ ] GitHub repository ready
- [ ] Vercel account created

---

## 🗄️ Step 1: Database Setup

### Option A: Supabase (Recommended)

1. **Create Project**
   - Visit [supabase.com](https://supabase.com)
   - Create new project
   - Note database password

2. **Get Connection String**
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

3. **Run Migrations**
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

### Option B: Neon

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string
3. Run migrations

### Option C: Railway

1. Create PostgreSQL service at [railway.app](https://railway.app)
2. Get DATABASE_URL from variables
3. Run migrations

---

## 🤖 Step 2: Deploy Vanna AI

### Using Render.com

1. **Create Account**
   - Sign up at [render.com](https://render.com)

2. **Create Web Service**
   - New → Web Service
   - Connect GitHub repository
   - Select `vanna` directory

3. **Configure Service**
   ```yaml
   Name: vanna-ai-service
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python app.py
   Instance Type: Free (or paid for production)
   ```

4. **Add Environment Variables**
   ```env
   DATABASE_URL=postgresql+psycopg://...
   GROQ_API_KEY=gsk_...
   GROQ_MODEL=mixtral-8x7b-32768
   PORT=8000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Note the service URL: `https://vanna-ai-service.onrender.com`

### Using Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
cd vanna
railway init

# Deploy
railway up

# Add environment variables via dashboard
```

---

## 🚀 Step 3: Deploy to Vercel

### Prepare Repository

1. **Create/Update vercel.json**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/api/dist/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "apps/web/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/api/dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "apps/web/$1"
    }
  ]
}
```

2. **Update package.json scripts**

```json
{
  "scripts": {
    "build": "npm run build:api && npm run build:web",
    "build:api": "cd apps/api && npm run build",
    "build:web": "cd apps/web && npm run build",
    "vercel-build": "npm run build"
  }
}
```

### Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from root directory)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: buchhaltung-analytics
# - Directory: ./
# - Build command: npm run build
# - Output directory: apps/web/.next
```

### Deploy via Vercel Dashboard

1. **Import Project**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import Git Repository
   - Select your GitHub repo

2. **Configure Build**
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**

**Frontend Variables:**
```env
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Backend Variables:**
```env
DATABASE_URL=postgresql://...
VANNA_API_BASE_URL=https://vanna-ai-service.onrender.com
GROQ_API_KEY=gsk_...
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app.vercel.app
```

4. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Test the application

---

## 🔧 Step 4: Configure API Routes

### Update API Base URL

In `apps/api/src/index.ts`, ensure proper CORS:

```typescript
import cors from 'cors';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

### Verify API Endpoints

Test each endpoint after deployment:

```bash
# Frontend
curl https://your-app.vercel.app

# API endpoints
curl https://your-app.vercel.app/api/dashboard/stats
curl https://your-app.vercel.app/api/dashboard/invoice-trends

# Chat endpoint
curl -X POST https://your-app.vercel.app/api/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"query": "Total spend last 90 days"}'
```

---

## 📊 Step 5: Post-Deployment Setup

### 1. Seed Production Database

```bash
# Connect to production database
DATABASE_URL="postgresql://production-url" npm run seed
```

### 2. Train Vanna AI

```bash
curl -X POST https://vanna-ai-service.onrender.com/train
```

### 3. Verify All Features

- [ ] Dashboard loads correctly
- [ ] All charts display data
- [ ] KPI cards show real data
- [ ] Chat with Data responds
- [ ] SQL queries execute
- [ ] Results display correctly

---

## 🔐 Security Configuration

### Enable Production Features

1. **Database Connection Pooling**

```typescript
// apps/api/src/lib/prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
});

// Connection pool settings
prisma.$connect();
```

2. **Rate Limiting**

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

3. **Helmet Security Headers**

```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

## 📈 Monitoring Setup

### 1. Add Vercel Analytics

```bash
npm install @vercel/analytics --workspace=apps/web
```

```jsx
// apps/web/pages/_app.js
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### 2. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs --workspace=apps/web
npm install @sentry/node --workspace=apps/api
```

**Frontend:** Create `sentry.client.config.js`
```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Backend:** Add to `apps/api/src/index.ts`
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 🧪 Testing Production

### Smoke Tests

```bash
# Test frontend
curl -I https://your-app.vercel.app
# Expected: 200 OK

# Test API health
curl https://your-app.vercel.app/api/version
# Expected: JSON with version info

# Test database connection
curl https://your-app.vercel.app/api/dashboard/stats
# Expected: JSON with statistics

# Test chat functionality
curl -X POST https://your-app.vercel.app/api/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"query": "Show total invoices"}'
# Expected: JSON with SQL and results
```

### Load Testing

```bash
# Install k6
brew install k6  # macOS
# or download from k6.io

# Create load-test.js
echo 'import http from "k6/http";
export default function() {
  http.get("https://your-app.vercel.app/api/dashboard/stats");
}' > load-test.js

# Run load test
k6 run --vus 10 --duration 30s load-test.js
```

---

## 🔄 Continuous Deployment

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🐛 Troubleshooting

### Common Deployment Issues

**Build Fails**
```
Error: Module not found
Solution: Check package.json dependencies and workspace configuration
```

**Database Connection Fails**
```
Error: Can't reach database
Solution: Verify DATABASE_URL and database accessibility from Vercel
```

**API 502 Error**
```
Error: Bad Gateway
Solution: Check API logs, ensure proper serverless function configuration
```

**Chat Not Working**
```
Error: Vanna AI timeout
Solution: Verify VANNA_API_BASE_URL and Vanna service status
```

### Debug Tools

```bash
# View Vercel logs
vercel logs [deployment-url]

# View Render logs
# Check Render dashboard → Your Service → Logs

# Check database connections
psql $DATABASE_URL -c "SELECT version();"
```

---

## 📝 Environment Variables Reference

### Complete List

**Frontend (`apps/web/.env.production`)**
```env
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SENTRY_DSN=https://...
```

**Backend (`apps/api/.env.production`)**
```env
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=4001
ALLOWED_ORIGINS=https://your-app.vercel.app
VANNA_API_BASE_URL=https://vanna-ai-service.onrender.com
VANNA_API_KEY=optional
SENTRY_DSN=https://...
```

**Vanna AI (`vanna/.env`)**
```env
DATABASE_URL=postgresql+psycopg://...
GROQ_API_KEY=gsk_...
GROQ_MODEL=mixtral-8x7b-32768
PORT=8000
HOST=0.0.0.0
```

---

## 🎯 Performance Optimization

### 1. Enable Vercel Edge Functions

```javascript
// apps/web/pages/api/stats.js
export const config = {
  runtime: 'edge',
};
```

### 2. Database Query Optimization

```typescript
// Add indexes
await prisma.$executeRaw`CREATE INDEX idx_invoice_date ON "Invoice"(invoice_date);`;
await prisma.$executeRaw`CREATE INDEX idx_vendor_id ON "Invoice"(vendor_id);`;
```

### 3. Caching Strategy

```typescript
// apps/api/src/routes/dashboard.ts
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });

router.get('/stats', async (req, res) => {
  // Try cache first
  const cached = await redis.get('dashboard:stats');
  if (cached) return res.json(JSON.parse(cached));
  
  // Fetch from database
  const data = await fetchStats();
  
  // Cache for 5 minutes
  await redis.setex('dashboard:stats', 300, JSON.stringify(data));
  
  res.json(data);
});
```

---

## 🚦 Status Page

Create a status endpoint:

```typescript
// apps/api/src/routes/status.ts
router.get('/status', async (req, res) => {
  const checks = {
    database: false,
    vanna: false,
    api: true,
  };
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (e) {}
  
  try {
    await axios.get(`${process.env.VANNA_API_BASE_URL}/health`);
    checks.vanna = true;
  } catch (e) {}
  
  const allHealthy = Object.values(checks).every(v => v);
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
});
```

---

**Last Updated**: November 11, 2025  
**Version**: 1.0.0  
**Deployment Status**: Production Ready
