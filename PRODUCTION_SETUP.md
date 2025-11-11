# Production Setup Guide

This guide will help you set up the full-stack analytics dashboard application with Chat with Data functionality for production deployment.

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ database
- **Python** 3.10+ (for Vanna AI)
- **Vercel CLI** (for deployment)
- **Groq API Key** (for AI functionality)

---

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
cd apps/web && npm install
cd ../api && npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb buchhaltung_analytics

# Set DATABASE_URL in apps/api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/buchhaltung_analytics"

# Run Prisma migrations
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### 3. Ingest Test Data

```bash
# Run the data ingestion script
cd apps/api
npm run seed

# Or use the TypeScript import script
npx ts-node src/seed.ts
```

### 4. Start Development Servers

```bash
# Terminal 1: Start API server
cd apps/api
npm run dev
# Runs on http://localhost:4001

# Terminal 2: Start Web frontend
cd apps/web
npm run dev
# Runs on http://localhost:3000
```

---

## 📦 Project Structure

```
flowbit-app-final-groq/
├── apps/
│   ├── api/                    # Backend Express API
│   │   ├── src/
│   │   │   ├── routes/        # API route handlers
│   │   │   │   ├── dashboard.ts
│   │   │   │   ├── chat.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   └── stats.ts
│   │   │   ├── lib/           # Shared utilities
│   │   │   │   ├── prisma.ts
│   │   │   │   └── db.ts
│   │   │   └── index.ts       # Express app entry
│   │   ├── Analytics_Test_Data.json
│   │   └── package.json
│   │
│   └── web/                    # Frontend Next.js app
│       ├── components/
│       │   ├── chat/
│       │   │   └── ChatInterface.jsx
│       │   ├── charts/        # Chart components
│       │   ├── layout/        # Layout components
│       │   └── ui/            # UI components
│       ├── pages/
│       │   └── index.js       # Main dashboard page
│       └── package.json
│
├── prisma/
│   └── schema.prisma          # Database schema
│
├── vanna/                      # Vanna AI service (to be created)
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
│
└── package.json               # Root package.json
```

---

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

### Core Tables

**Document**
- Stores document metadata
- Links to invoices and line items

**Invoice**
- Invoice header information
- Linked to vendors and customers
- Payment tracking

**Vendor**
- Vendor master data
- Used for spend analysis

**Customer**
- Customer information

**LineItem**
- Invoice line items
- Detailed transaction data

**Analytics**
- Aggregated analytics data

---

## 🔧 Environment Variables

### Frontend (.env.local in apps/web/)

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env in apps/api/)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/buchhaltung_analytics

# API Configuration
PORT=4001
NODE_ENV=development

# Vanna AI Integration
VANNA_API_BASE_URL=http://localhost:8000
VANNA_API_KEY=your-vanna-api-key (optional)

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-production-domain.vercel.app
```

### Vanna AI (.env in vanna/)

```env
# Database Connection
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/buchhaltung_analytics

# AI Provider
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=mixtral-8x7b-32768

# Server
PORT=8000
HOST=0.0.0.0
```

---

## 📊 Data Ingestion

The application includes a comprehensive data ingestion script that:

1. Parses `Analytics_Test_Data.json`
2. Normalizes nested structures
3. Creates relational tables
4. Maintains referential integrity
5. Handles duplicate prevention

### Run Data Ingestion

```bash
cd apps/api
npm run seed
```

### Ingestion Process

1. **Vendors**: Extracted from invoice data
2. **Customers**: Extracted from invoice customer info
3. **Invoices**: Main invoice records
4. **Line Items**: Invoice line items with details
5. **Documents**: Document metadata

---

## 🎨 Frontend Features

### Dashboard Module

**Overview Cards**
- Total Spend (YTD)
- Total Invoices Processed
- Documents Uploaded
- Average Invoice Value

**Charts**
- Invoice Volume + Value Trend (Line Chart)
- Spend by Vendor Top 10 (Horizontal Bar)
- Spend by Category (Donut Chart)
- Cash Outflow Forecast (Vertical Bar)
- Invoices by Vendor (Data Table)

**Technology Stack**
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS (Pixel-perfect from Figma)
- Recharts for visualizations
- SWR for data fetching

### Chat with Data Module

**Features**
- Natural language query interface
- SQL generation via Vanna AI
- Results displayed as tables
- Query examples for users
- Fallback mode without Vanna AI

**Supported Queries**
- "Total spend in the last 90 days"
- "Top 5 vendors by spend"
- "Show overdue invoices"
- "Average invoice value"
- Custom queries via Vanna AI

---

## 🤖 Vanna AI Integration

Vanna AI is a self-hosted AI service that converts natural language to SQL queries.

### Setup Steps

1. **Create Vanna Service** (see VANNA_AI_SETUP.md)
2. **Deploy to Render/Railway/Fly.io**
3. **Configure Backend** with Vanna URL
4. **Enable CORS** for your domains

### Architecture

```
Frontend → Backend API → Vanna AI Service
                       ↓
                 PostgreSQL Database
```

---

## 🔒 Security Considerations

### Production Checklist

- [ ] Use environment variables for all secrets
- [ ] Enable CORS only for trusted domains
- [ ] Use HTTPS for all external communication
- [ ] Implement rate limiting on API endpoints
- [ ] Add authentication/authorization
- [ ] Sanitize all user inputs
- [ ] Use prepared statements for SQL queries
- [ ] Keep dependencies updated
- [ ] Enable database connection pooling
- [ ] Set up monitoring and logging

---

## 📈 API Endpoints

### Dashboard Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/stats` | GET | Overview statistics |
| `/api/dashboard/invoice-trends` | GET | Monthly invoice trends |
| `/api/dashboard/vendors/top10` | GET | Top 10 vendors |
| `/api/dashboard/category-spend` | GET | Spend by category |
| `/api/dashboard/cash-outflow` | GET | Cash flow forecast |
| `/api/dashboard/invoices` | GET | Invoices list with filters |

### Chat Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat-with-data` | POST | Natural language queries |

### Analytics Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/summary` | GET | Analytics summary |
| `/api/analytics/documents` | GET | Document list |

---

## 🧪 Testing

### Frontend Testing

```bash
cd apps/web
npm run dev
# Open http://localhost:3000
# Navigate through Dashboard and Chat tabs
```

### Backend Testing

```bash
# Test API endpoints
curl http://localhost:4001/api/dashboard/stats
curl http://localhost:4001/api/dashboard/invoice-trends
curl -X POST http://localhost:4001/api/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"query": "Total spend last 90 days"}'
```

### Vanna AI Testing

```bash
curl http://localhost:8000/generate-sql \
  -H "Content-Type: application/json" \
  -d '{"question": "Show top 5 vendors"}'
```

---

## 📝 Development Workflow

### Local Development

1. Start PostgreSQL database
2. Run migrations: `cd apps/api && npx prisma migrate dev`
3. Seed data: `npm run seed`
4. Start API: `cd apps/api && npm run dev`
5. Start frontend: `cd apps/web && npm run dev`
6. (Optional) Start Vanna: `cd vanna && python app.py`

### Code Structure

- **API Routes**: Follow REST conventions
- **Components**: Reusable React components
- **Prisma Models**: Single source of truth for DB schema
- **TypeScript**: Type safety across codebase

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```
Error: Can't reach database server
Solution: Check DATABASE_URL and PostgreSQL service
```

**Port Already in Use**
```
Error: Port 4001 already in use
Solution: Kill existing process or change PORT in .env
```

**Vanna AI Not Responding**
```
Error: Vanna AI timeout
Solution: Application falls back to local query processing
```

**Charts Not Loading**
```
Error: Cannot read property 'map' of undefined
Solution: Check API data structure matches expected format
```

---

## 📚 Additional Documentation

- **API_DOCUMENTATION.md** - Detailed API reference
- **VANNA_AI_SETUP.md** - Vanna AI configuration
- **DEPLOYMENT.md** - Production deployment guide
- **PIXEL_PERFECT_SPEC.md** - UI design specifications

---

## 💡 Tips for Production

1. **Database Indexing**: Add indexes on frequently queried columns
2. **Connection Pooling**: Configure Prisma connection pool
3. **Caching**: Implement Redis for frequently accessed data
4. **Monitoring**: Set up application monitoring (Sentry, DataDog)
5. **Backup**: Regular database backups
6. **CDN**: Use CDN for static assets
7. **Load Balancing**: If expecting high traffic

---

## 🎯 Next Steps

1. Complete Vanna AI setup (see VANNA_AI_SETUP.md)
2. Deploy to Vercel (see DEPLOYMENT.md)
3. Set up production database
4. Configure monitoring and alerts
5. Implement authentication (if required)
6. Add more custom queries to Chat interface

---

**Last Updated**: November 11, 2025  
**Version**: 1.0.0  
**Status**: Production Ready
