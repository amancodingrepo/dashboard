# 🐳 Docker Testing Guide

Complete guide to test your application with Docker.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Set Groq API Key

**PowerShell:**
```powershell
$env:GROQ_API_KEY="gsk_your_api_key_here"
```

**CMD:**
```cmd
set GROQ_API_KEY=gsk_your_api_key_here
```

**Or create .env file:**
```bash
# Create .env.docker file
copy .env.docker.example .env.docker
# Edit and add your Groq API key
```

### Step 2: Run Test Script

```bash
.\docker-test.bat
```

This will:
1. Stop any existing containers
2. Build all Docker images
3. Start all services
4. Open the application in your browser
5. Show logs

### Step 3: Access Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4001
- **Vanna AI**: http://localhost:8000
- **Database**: localhost:5432

---

## 📋 Manual Docker Commands

### Start Everything
```bash
docker-compose -f docker-compose.full.yml up -d --build
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.full.yml logs -f

# Specific service
docker-compose -f docker-compose.full.yml logs -f web
docker-compose -f docker-compose.full.yml logs -f api
docker-compose -f docker-compose.full.yml logs -f vanna
docker-compose -f docker-compose.full.yml logs -f postgres
```

### Check Status
```bash
docker-compose -f docker-compose.full.yml ps
```

### Stop Everything
```bash
docker-compose -f docker-compose.full.yml down
```

### Stop and Remove Volumes
```bash
docker-compose -f docker-compose.full.yml down -v
```

### Restart Services
```bash
docker-compose -f docker-compose.full.yml restart
```

---

## 🧪 Testing Checklist

### 1. Check Services Are Running
```bash
docker-compose -f docker-compose.full.yml ps
```

Expected output: All services should show "Up" status.

### 2. Test Frontend
```bash
curl http://localhost:3000
```
Or open http://localhost:3000 in browser.

### 3. Test API
```bash
# Health check
curl http://localhost:4001/api/version

# Dashboard stats
curl http://localhost:4001/api/dashboard/stats
```

### 4. Test Vanna AI
```bash
curl http://localhost:8000/health
```

### 5. Test Database
```bash
docker exec buchhaltung-db psql -U postgres -d buchhaltung_analytics -c "SELECT version();"
```

### 6. Test Chat with Data
```bash
curl -X POST http://localhost:4001/api/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"query": "Show total invoices"}'
```

### 7. Test Export
Open in browser:
- http://localhost:4001/api/export/invoices?format=csv

---

## 🐛 Troubleshooting

### Problem: Containers Won't Start

**Check Docker is running:**
```bash
docker --version
docker ps
```

**Check ports are available:**
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :4001
netstat -ano | findstr :5432
netstat -ano | findstr :8000
```

### Problem: API Can't Connect to Database

**Check database is healthy:**
```bash
docker-compose -f docker-compose.full.yml logs postgres
```

**Wait for database to be ready:**
Database takes ~10 seconds to start. Wait and then restart API:
```bash
docker-compose -f docker-compose.full.yml restart api
```

### Problem: Vanna AI Errors

**Check Groq API key is set:**
```bash
docker-compose -f docker-compose.full.yml logs vanna
```

Look for: "GROQ_API_KEY not set" errors.

**Solution:**
```powershell
$env:GROQ_API_KEY="gsk_your_key_here"
docker-compose -f docker-compose.full.yml restart vanna
```

### Problem: Frontend Shows API Connection Error

**Check API logs:**
```bash
docker-compose -f docker-compose.full.yml logs api
```

**Check API is accessible:**
```bash
curl http://localhost:4001/api/version
```

### Problem: Build Failures

**Clean and rebuild:**
```bash
docker-compose -f docker-compose.full.yml down -v
docker system prune -a
docker-compose -f docker-compose.full.yml up -d --build
```

---

## 📊 Service Details

### PostgreSQL Container
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Database**: buchhaltung_analytics
- **User**: postgres
- **Password**: postgres
- **Volume**: postgres_data (persists data)

### API Container
- **Built from**: apps/api/Dockerfile
- **Port**: 4001
- **Environment**: Production mode
- **Dependencies**: PostgreSQL (waits for health check)

### Web Container
- **Built from**: apps/web/Dockerfile
- **Port**: 3000
- **Environment**: Production build
- **Dependencies**: API service

### Vanna AI Container
- **Built from**: vanna/Dockerfile
- **Port**: 8000
- **Environment**: Production mode
- **Dependencies**: PostgreSQL, Groq API key

---

## 🔍 Inspect Containers

### Enter Container Shell
```bash
# API container
docker exec -it buchhaltung-api sh

# Web container
docker exec -it buchhaltung-web sh

# Database container
docker exec -it buchhaltung-db psql -U postgres -d buchhaltung_analytics
```

### Check Container Logs
```bash
# Last 100 lines
docker logs --tail 100 buchhaltung-api

# Follow logs
docker logs -f buchhaltung-web
```

### Check Container Resources
```bash
docker stats
```

---

## 📦 Data Management

### Database Backup
```bash
docker exec buchhaltung-db pg_dump -U postgres buchhaltung_analytics > backup.sql
```

### Database Restore
```bash
cat backup.sql | docker exec -i buchhaltung-db psql -U postgres -d buchhaltung_analytics
```

### View Database Data
```bash
docker exec -it buchhaltung-db psql -U postgres -d buchhaltung_analytics

# Then run queries:
SELECT COUNT(*) FROM "Invoice";
SELECT * FROM "Vendor" LIMIT 10;
```

### Seed Database
```bash
# If database is empty, seed it
docker exec -it buchhaltung-api npm run seed
```

---

## 🚀 Performance Tips

### 1. Use Docker Volumes for Development
For faster rebuilds during development, you can mount source code:
```yaml
volumes:
  - ./apps/api:/app
  - /app/node_modules
```

### 2. Multi-Stage Builds
The Dockerfiles use multi-stage builds to keep image sizes small.

### 3. Health Checks
PostgreSQL has a health check. Other services wait for it to be ready.

### 4. Network Optimization
All services are on the same Docker network for fast communication.

---

## 🔧 Environment Variables

### Required
- `GROQ_API_KEY` - Your Groq API key

### Optional
- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_PASSWORD` - Database password (default: postgres)
- `POSTGRES_DB` - Database name (default: buchhaltung_analytics)

### Set in docker-compose.full.yml
- `DATABASE_URL` - PostgreSQL connection string
- `VANNA_API_BASE_URL` - Vanna AI service URL
- `NEXT_PUBLIC_API_URL` - API URL for frontend
- `ALLOWED_ORIGINS` - CORS allowed origins

---

## 📈 Monitoring

### Real-time Logs
```bash
# All services
docker-compose -f docker-compose.full.yml logs -f

# Specific service with timestamps
docker-compose -f docker-compose.full.yml logs -f --timestamps api
```

### Container Stats
```bash
docker stats buchhaltung-api buchhaltung-web buchhaltung-db buchhaltung-vanna
```

### Service Health
```bash
# Check all containers
docker-compose -f docker-compose.full.yml ps

# Check specific service
docker inspect buchhaltung-api --format='{{.State.Health.Status}}'
```

---

## 🎯 Testing Scenarios

### Scenario 1: Fresh Start
```bash
# Clean everything
docker-compose -f docker-compose.full.yml down -v
docker system prune -a

# Rebuild and start
docker-compose -f docker-compose.full.yml up -d --build

# Wait 30 seconds
timeout /t 30

# Test
curl http://localhost:3000
curl http://localhost:4001/api/version
```

### Scenario 2: Quick Restart
```bash
# Restart without rebuilding
docker-compose -f docker-compose.full.yml restart

# Or restart specific service
docker-compose -f docker-compose.full.yml restart api
```

### Scenario 3: Update Code and Rebuild
```bash
# Stop services
docker-compose -f docker-compose.full.yml down

# Rebuild with latest code
docker-compose -f docker-compose.full.yml up -d --build

# Or rebuild specific service
docker-compose -f docker-compose.full.yml up -d --build api
```

---

## ✅ Success Checklist

- [ ] Docker Desktop is running
- [ ] GROQ_API_KEY environment variable is set
- [ ] All containers are running (`docker-compose ps`)
- [ ] Frontend accessible at http://localhost:3000
- [ ] API responding at http://localhost:4001
- [ ] Vanna AI healthy at http://localhost:8000
- [ ] Database accepting connections
- [ ] Chat with Data working
- [ ] Export endpoints working
- [ ] All charts displaying data

---

## 🎊 Next Steps

Once Docker is working:
1. Test all features in the browser
2. Try Chat with Data
3. Test CSV exports
4. Check database has data
5. Review logs for any errors

---

**Last Updated**: November 11, 2025  
**Docker Compose Version**: 3.8  
**Services**: PostgreSQL, API, Web, Vanna AI  
**Status**: ✅ Ready for Testing
