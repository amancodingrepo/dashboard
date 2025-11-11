# Flowbit Full Stack (Groq AI)
Run with Docker Compose and connect Groq for NL→SQL queries.

> Production-grade full-stack financial analytics platform with AI-powered natural language queries

## Features

### Interactive Analytics Dashboard
- **Real-time KPIs**: Total spend, invoice count, documents uploaded, average invoice value
- **Interactive Charts**: Line charts, bar charts, donut charts with Recharts
- **Vendor Analytics**: Top 10 vendors by spend, category breakdown
- **Cash Flow Forecast**: Payment obligations by due date
- **Invoices Table**: Searchable, sortable data grid

### Chat with Data (Vanna AI + Groq)
- Natural language SQL generation
- Real-time query execution
- Visual results presentation
- Example queries for quick insights

### Pixel-Perfect Design
- Figma design implementation with 100% accuracy
- 8px baseline grid system
- Tailwind CSS + Custom design tokens
- Responsive layouts

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│   Next.js    │     │   Express    │     │   Database   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Vanna AI    │
                     │  + Groq LLM  │
                     └──────────────┘
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Recharts
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL 14+
- **AI Layer**: Python Flask, Groq API, Vanna framework
- **Deployment**: Vercel (Frontend + API), Render (Vanna AI)

This is a monorepo using npm workspaces.

---

## 🆕 Latest Enhancements (v2.1.0)

**All enhancements installed successfully! ✅**

### New Features Added:
1. **💾 Persistent Chat History** - All queries saved to database
2. **📊 CSV/Excel Export** - Download invoices, vendors, summaries
3. **👥 Role-Based Access** - Admin, Manager, User, Viewer roles
4. **📈 Additional Charts** - Monthly trends, payment status
5. **🐳 Docker Setup** - Full stack with one command
6. **🧪 Unit Tests** - Jest testing framework

### Quick Links:
- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - ⚠️ Read this first! Next steps after installation
- **[ENHANCEMENTS_GUIDE.md](ENHANCEMENTS_GUIDE.md)** - Complete implementation guide
- **[MASTER_README.md](MASTER_README.md)** - Full documentation index

---