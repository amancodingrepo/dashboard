# ✅ Deployment Checklist

Quick checklist for deploying to production.

---

## 📋 Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database provisioned
- [ ] Groq API key obtained

---

## 🗄️ Database Setup

- [ ] PostgreSQL database created (Supabase/Neon/Railway)
- [ ] Connection string copied
- [ ] Migrations run: `npx prisma migrate deploy`
- [ ] Database seeded (optional): `node dist/seed.js`

---

## 🌐 Vercel - Frontend

- [ ] Vercel account created
- [ ] Repository connected
- [ ] Project configured:
  - Root Directory: `apps/web`
  - Framework: Next.js
- [ ] Environment variables set:
  - `NEXT_PUBLIC_API_URL=https://yourapp.vercel.app`
  - `NEXT_PUBLIC_APP_URL=https://yourapp.vercel.app`
- [ ] Deployed successfully
- [ ] URL verified: `https://yourapp.vercel.app`

---

## 🔧 Vercel - Backend API

**Option A: Next.js API Routes (Recommended)**
- [ ] API routes created in `apps/web/app/api/`
- [ ] Deployed with frontend (automatic)

**Option B: Separate Vercel Project**
- [ ] New Vercel project created
- [ ] Root Directory: `apps/api`
- [ ] Environment variables set:
  - `DATABASE_URL=postgresql://...`
  - `VANNA_API_BASE_URL=https://vanna-ai-service.onrender.com`
  - `ALLOWED_ORIGINS=https://yourapp.vercel.app`
- [ ] Deployed successfully

---

## 🤖 Render - Vanna AI

- [ ] Render account created
- [ ] GitHub connected
- [ ] Web service created:
  - Name: `vanna-ai-service`
  - Root Directory: `vanna`
  - Build: `pip install -r requirements.txt`
  - Start: `python app.py`
- [ ] Environment variables set:
  - `DATABASE_URL=postgresql://...`
  - `GROQ_API_KEY=your_key`
  - `GROQ_MODEL=mixtral-8x7b-32768`
- [ ] Deployed successfully
- [ ] Health check: `curl https://vanna-ai-service.onrender.com/health`

---

## 🔗 Integration

- [ ] Frontend API URL updated
- [ ] Backend Vanna URL updated
- [ ] CORS configured correctly
- [ ] All services communicating

---

## ✅ Testing

- [ ] Frontend loads: `https://yourapp.vercel.app`
- [ ] API health check: `curl https://yourapp.vercel.app/api/health`
- [ ] Dashboard displays data
- [ ] Charts render correctly
- [ ] Chat feature works
- [ ] Vanna AI responds: `curl https://vanna-ai-service.onrender.com/health`

---

## 🔒 Security

- [ ] All secrets in environment variables (not in code)
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS enabled (automatic)
- [ ] Error messages don't expose sensitive info

---

## 📊 Post-Deployment

- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team notified

---

## 🎉 Done!

Your application is live! 🚀

**URLs:**
- Frontend: `https://yourapp.vercel.app`
- API: `https://yourapp.vercel.app/api` (or separate URL)
- Vanna AI: `https://vanna-ai-service.onrender.com`

