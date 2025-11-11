# 🐳 Start with Docker - Simple Instructions

## 📋 Prerequisites

1. ✅ Docker Desktop is installed and running
2. ✅ You have a Groq API key from https://console.groq.com

---

## 🚀 Quick Start (Copy & Paste)

### Option 1: Use the Test Script (Easiest)

**Open PowerShell and run:**

```powershell
# Step 1: Navigate to project
cd c:\Users\Asus\Desktop\flowbit-app-final-groq

# Step 2: Set your Groq API key
$env:GROQ_API_KEY="gsk_your_actual_key_here"

# Step 3: Run the test script
.\docker-test.bat
```

That's it! The script will:
- Stop any running containers
- Build all images
- Start all services
- Open the app in your browser

---

### Option 2: Manual Commands

**Open PowerShell and run:**

```powershell
# Step 1: Navigate to project
cd c:\Users\Asus\Desktop\flowbit-app-final-groq

# Step 2: Set your Groq API key
$env:GROQ_API_KEY="gsk_your_actual_key_here"

# Step 3: Start Docker services
docker-compose -f docker-compose.full.yml up -d --build

# Step 4: Wait 30 seconds for services to start
Start-Sleep -Seconds 30

# Step 5: Open browser
start http://localhost:3000
```

---

## 🌐 Access Your Application

Once running, access:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main dashboard |
| **API** | http://localhost:4001 | Backend API |
| **Vanna AI** | http://localhost:8000 | AI service |
| **Database** | localhost:5432 | PostgreSQL |

---

## 🧪 Quick Test

**Test if everything is working:**

```powershell
# Test frontend
curl http://localhost:3000

# Test API
curl http://localhost:4001/api/version

# Test Vanna AI
curl http://localhost:8000/health
```

---

## 📊 View Logs

```powershell
# See all logs
docker-compose -f docker-compose.full.yml logs -f

# See specific service
docker-compose -f docker-compose.full.yml logs -f web
```

---

## 🛑 Stop Docker

```powershell
# Stop all services
docker-compose -f docker-compose.full.yml down

# Stop and remove data
docker-compose -f docker-compose.full.yml down -v
```

---

## 🔧 Troubleshooting

### Can't connect to Docker daemon?
- Make sure Docker Desktop is running
- Check system tray for Docker icon

### Port already in use?
- Stop other services using ports 3000, 4001, 5432, 8000
- Or change ports in docker-compose.full.yml

### Build errors?
- Make sure you're in the project root directory
- Try: `docker system prune -a` then rebuild

### Vanna AI not working?
- Check Groq API key is set: `echo $env:GROQ_API_KEY`
- View logs: `docker-compose -f docker-compose.full.yml logs vanna`

---

## 📚 More Help

- **Detailed guide**: See [DOCKER_TEST_GUIDE.md](DOCKER_TEST_GUIDE.md)
- **Troubleshooting**: See troubleshooting section in guide
- **Docker basics**: See [Docker documentation](https://docs.docker.com)

---

## ✅ Success Checklist

After running Docker, verify:

- [ ] `docker ps` shows 4 running containers
- [ ] http://localhost:3000 loads the dashboard
- [ ] http://localhost:4001/api/version returns JSON
- [ ] http://localhost:8000/health returns healthy status
- [ ] No errors in `docker-compose logs`

---

**Ready to go!** 🎉

If you need more details, check [DOCKER_TEST_GUIDE.md](DOCKER_TEST_GUIDE.md)
