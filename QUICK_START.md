# ⚡ Quick Start Guide

Fast track to getting your enhanced application running.

---

## 🚀 30-Second Setup

### Prerequisites
- ✅ Dependencies installed (if not, run `.\scripts\install-deps-only.bat`)
- ✅ PostgreSQL running
- ✅ Environment variables set

### Start Development

```bash
# Terminal 1 - Backend API
cd apps/api
npm run dev
# → http://localhost:4001

# Terminal 2 - Frontend
cd apps/web  
npm run dev
# → http://localhost:3000
```

**That's it!** Open http://localhost:3000

---

## 🎯 Test New Features (2 minutes)

### 1. Chat History ✅
1. Go to Chat with Data tab
2. Ask: "Show top 5 vendors"
3. Your query is automatically saved to database!

### 2. Export Data ✅
Visit in browser (downloads CSV):
- http://localhost:4001/api/export/invoices?format=csv
- http://localhost:4001/api/export/vendors?format=csv

### 3. New Charts ✅
Add to your dashboard page:
```jsx
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { PaymentStatusChart } from '../components/charts/PaymentStatusChart';
```

### 4. Run Tests ✅
```bash
cd apps/api
npm test
```

---

## 📊 New API Endpoints

| Endpoint | Method | What It Does |
|----------|--------|--------------|
| `/api/chat-history` | GET | View saved chat queries |
| `/api/export/invoices` | GET | Download invoices CSV |
| `/api/export/vendors` | GET | Download vendors CSV |
| `/api/export/dashboard-summary` | GET | Download summary CSV |

---

## 🐳 Docker (One Command)

```bash
# Set Groq API key
$env:GROQ_API_KEY="gsk_your_key_here"

# Start everything
docker-compose -f docker-compose.full.yml up -d

# Access:
# - Frontend: http://localhost:3000
# - API: http://localhost:4001
# - Vanna: http://localhost:8000
# - DB: localhost:5432
```

---

## 📚 Documentation Quick Links

| Need | Read This |
|------|-----------|
| **What's new?** | [SETUP_COMPLETE.md](SETUP_COMPLETE.md) |
| **How to use features?** | [ENHANCEMENTS_GUIDE.md](ENHANCEMENTS_GUIDE.md) |
| **Deploy to production?** | [DEPLOYMENT.md](DEPLOYMENT.md) |
| **Complete overview?** | [MASTER_README.md](MASTER_README.md) |

---

## ⚡ Commands Cheat Sheet

```bash
# Install dependencies
.\scripts\install-deps-only.bat

# Regenerate Prisma
cd apps/api
npx prisma generate

# Run migration (optional)
npx prisma migrate dev --name add_user_chat_history

# Run tests
npm test

# Start dev servers
npm run dev  # In apps/api and apps/web

# Docker
docker-compose -f docker-compose.full.yml up -d
docker-compose -f docker-compose.full.yml down
docker-compose -f docker-compose.full.yml logs -f
```

---

## 🎊 You're Ready!

**Current Status**: ✅ All features installed and operational

**Next Steps**:
1. Test the features above
2. Add export buttons to your UI
3. Integrate new charts
4. Deploy to production

**Need Help?** Check [ENHANCEMENTS_GUIDE.md](ENHANCEMENTS_GUIDE.md) for detailed instructions.

---

**Version**: 2.1.0  
**Status**: Production Ready  
**Last Updated**: November 11, 2025
