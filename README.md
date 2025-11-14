# Flowbit Analytics Dashboard

> **A comprehensive data analytics platform with AI-powered natural language querying, built for modern invoice and vendor management.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amancodingrepo/dashboard.git)
[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://board-gamma-three.vercel.app)

## 🎯 Overview

Flowbit Analytics is a full-stack data analytics platform that transforms invoice and vendor data into actionable insights. Built with modern technologies and featuring AI-powered natural language queries, it provides an intuitive interface for business intelligence and financial analytics.

### Key Features

- 📊 **Interactive Dashboard** - Real-time charts, metrics, and KPIs
- 🤖 **AI-Powered Queries** - Natural language to SQL using Vanna AI + Groq
- 📄 **Invoice Management** - Complete CRUD operations with advanced filtering
- 📈 **Advanced Analytics** - Vendor performance, spend analysis, and trends
- 💬 **Chat Interface** - Conversational data exploration
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS + shadcn/ui
- 🔄 **Real-time Updates** - Live data synchronization
- 📤 **Data Export** - CSV/Excel export functionality
- 🔐 **Role-based Access** - Admin, manager, user, and viewer roles

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js Web   │    │   Express API   │    │  Vanna AI       │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│  (NL to SQL)    │
│   Port: 3000    │    │   Port: 4001    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                    ┌─────────────────┐
                    │  PostgreSQL     │
                    │  Database       │
                    │  Port: 5432     │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **PostgreSQL 15+** (local or hosted)
- **Git** for version control
- **Groq API Key** for AI functionality

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/amancodingrepo/dashboard.git
cd dashboard

# Install all dependencies
npm run install:all

# Or install individually:
npm install                    # Root dependencies
cd apps/web && npm install      # Frontend dependencies
cd ../api && npm install        # Backend dependencies
cd ../vanna && pip install -r requirements.txt # AI service dependencies
```

### 2. Environment Setup

Copy the environment template and configure:

```bash
# Root environment file
cp .env.example .env

# API service environment
cp apps/api/.env.example apps/api/.env

# Vanna AI service environment
cp apps/vanna/.env.example apps/vanna/.env

# Web app environment
cp apps/web/.env.example apps/web/.env
```

### 3. Database Setup

```bash
# Generate Prisma client and run migrations
npx prisma generate
npm run migrate:deploy

# Seed with test data (optional)
npm run seed
```

### 4. Start Development Servers

```bash
# Start all services simultaneously
npm run dev

# Or start services individually:
npm run dev:web      # Frontend (http://localhost:3000)
npm run dev:api      # Backend API (http://localhost:4001)
npm run dev:vanna    # AI Service (http://localhost:8000)
```

### 5. Verify Installation

Access the application at:
- **Web Dashboard**: http://localhost:3000
- **API Health**: http://localhost:4001/api/health
- **Vanna AI**: http://localhost:8000/health

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run API tests specifically
npm run test:api

# Run integration tests
npm run test:integration

# Run E2E tests (requires running app)
npm run test:e2e

# Test coverage report
npm run test:coverage
```

## 💬 Chat Workflow

The AI-powered chat system transforms natural language queries into SQL:

1. **User Query** → Question like "Show top 5 vendors by spend"
2. **AI Processing** → Vanna + Groq converts to SQL query
3. **Fallback System** → If AI unavailable, use predefined queries
4. **Database Execution** → Run SQL against PostgreSQL
5. **Results** → Return formatted data with generated SQL

**Supported Queries:**
- "Show top 5 vendors by spend"
- "What's the total spend in last 90 days?"
- "Which invoices are overdue?"
- "Show latest 5 invoices"

## 🌐 Deployment

### Environment Variables (Required)

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | All | PostgreSQL connection string |
| `GROQ_API_KEY` | vanna | AI service API key (get from [Groq Console](https://console.groq.com)) |
| `NEXT_PUBLIC_API_URL` | web | API endpoint URL |

### Option 1: Vercel + Render (Recommended)

1. **Deploy Frontend to Vercel**:
   ```bash
   # Connect GitHub to Vercel
   # Set environment: NEXT_PUBLIC_API_URL=https://your-api.onrender.com
   ```

2. **Deploy API to Render**:
   ```bash
   # Connect repo, set root: apps/api
   # Build: npm install && npm run build
   # Start: npm start
   # Add DATABASE_URL and other env vars
   ```

3. **Deploy Vanna to Render**:
   ```bash
   # New Web Service
   # Root: apps/vanna
   # Build: pip install -r requirements.txt
   # Start: python app.py
   # Add GROQ_API_KEY, DATABASE_URL
   ```

### Option 2: Docker Production

```bash
# Build and run production stack
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy
```

## 📋 Environment Variables Reference

### Core Database & API
- `DATABASE_URL`: PostgreSQL connection (required)
- `SHADOW_DATABASE_URL`: Prisma shadow database for migrations
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Service port (4001 for API, 8000 for Vanna)

### AI Service Configuration
- `GROQ_API_KEY`: Groq AI API key (required for AI queries)
- `GROQ_MODEL`: AI model name (default: mixtral-8x7b-32768)
- `VANNA_API_BASE_URL`: Vanna service URL

### Frontend Configuration
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_URL`: Frontend URL

### Optional Settings
- `REDIS_URL`: Redis connection for caching
- `JWT_SECRET`: JSON Web Token secret
- `UPLOAD_DIR`: File upload directory
- `MAX_FILE_SIZE`: Maximum upload size (bytes)

## 📁 Project Structure

```
flowbit-analytics/
├── apps/
│   ├── web/                    # Next.js Frontend (Port 3000)
│   │   ├── app/               # App Router pages
│   │   ├── components/        # React components
│   │   └── lib/              # Utilities & API clients
│   ├── api/                   # Express Backend (Port 4001)
│   │   ├── src/routes/       # API endpoints
│   │   ├── src/lib/          # Database & utilities
│   │   └── Dockerfile
│   └── vanna/                # Vanna AI Service (Port 8000)
├── prisma/                   # Database schema & migrations
├── docs/                     # Documentation
├── data/                     # Sample data & imports
├── scripts/                  # Build & deployment scripts
└── docker-compose.yml       # Development containers
```

## 📊 Database Schema Overview

The application uses PostgreSQL with the following core entities:

**Invoices** ←→ **Vendors** ←→ **Customers**
- Invoice processing with payment tracking
- Vendor management and analytics
- Customer relationship management

**Documents** ←→ **LineItems**
- File upload and processing
- Invoice line item details
- AI-powered data extraction

**Analytics** ←→ **ChatHistory**
- Processing metrics and reporting
- Query logging and history

For detailed schema information, see [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md).

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all development servers |
| `npm run dev:web` | Start Next.js frontend only |
| `npm run dev:api` | Start Express API only |
| `npm run dev:vanna` | Start Vanna AI service only |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed database with test data |
| `npm run test` | Run test suite |
| `npm run build` | Build for production |
| `docker:up` | Start development containers |
| `docker:down` | Stop containers |

## 📚 API Documentation

Complete API reference with examples: [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md)

## 🔐 Authentication

Currently uses API keys and session management. JWT tokens planned for future releases.

## 🤝 Contributing

1. Fork and clone: `git clone https://github.com/amancodingrepo/dashboard.git`
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test: `npm run test`
4. Commit: `git commit -m 'Add new feature'`
5. Push and create PR

## 📝 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Vanna AI** - Natural language to SQL conversion
- **Groq** - Fast LLM inference platform
- **Next.js** - React framework
- **Prisma** - Type-safe database ORM
- **Vercel** - Frontend deployment platform
- **Render** - Backend hosting
- **Supabase** - PostgreSQL hosting option
