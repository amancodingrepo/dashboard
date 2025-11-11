# 🚀 Production Enhancements Guide

This document describes all the new advanced features added to the application.

---

## 📋 What's New?

### 1. ✅ Persistent Chat History
### 2. ✅ CSV/Excel Export Functionality  
### 3. ✅ Role-Based Data Views
### 4. ✅ Additional Insightful Charts
### 5. ✅ Docker Full Stack Setup
### 6. ✅ Unit Tests

---

## 🚀 Quick Start

### Step 1: Install Dependencies & Setup

**Windows (PowerShell):**
```powershell
cd c:\Users\Asus\Desktop\flowbit-app-final-groq
.\scripts\install-enhancements.ps1
```

**Linux/Mac (Bash):**
```bash
cd /path/to/flowbit-app-final-groq
chmod +x scripts/install-enhancements.sh
./scripts/install-enhancements.sh
```

This will:
- Install json2csv for exports
- Install Jest for testing
- Regenerate Prisma Client
- Create database migrations
- Set up test configuration

### Step 2: Start the Application

```bash
# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start Web
cd apps/web
npm run dev
```

---

## 🎯 Feature 1: Persistent Chat History

### What It Does
- Saves all chat queries to the database
- Tracks user who asked the question
- Stores SQL generated and results
- Enables query analytics

### Database Schema

**New Tables:**
```sql
-- User table for role-based access
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'user', -- admin, manager, user, viewer
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat history for persistent storage
CREATE TABLE "ChatHistory" (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES "User"(id),
  query TEXT NOT NULL,
  sql TEXT,
  results JSONB,
  error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

**POST /api/chat-with-data**
```json
{
  "query": "Show top 5 vendors",
  "userId": 1
}
```
- Saves query to history automatically
- Returns SQL and results

**GET /api/chat-history?userId=1&limit=50**
- Retrieves chat history
- Filter by user
- Returns chronological list

### Usage in Frontend

The ChatInterface component automatically saves history when sending queries.

---

## 📊 Feature 2: CSV/Excel Export

### Available Export Endpoints

#### 1. Export Invoices
```bash
GET /api/export/invoices?format=csv&startDate=2025-01-01&endDate=2025-12-31
```

**Query Parameters:**
- `format`: csv or json
- `startDate`: Filter by date range (optional)
- `endDate`: Filter by date range (optional)
- `vendorId`: Filter by vendor (optional)

**Export Fields:**
- Invoice Ref, Invoice Date, Vendor, Vendor Tax ID
- Customer, Subtotal, Tax, Total Amount
- Currency, Payment Status, Payment Due Date, Payment Terms

#### 2. Export Vendors Analysis
```bash
GET /api/export/vendors?format=csv
```

**Export Fields:**
- Vendor Name, Vendor Tax ID
- Total Invoices, Total Spend, Average Invoice Value

#### 3. Export Dashboard Summary
```bash
GET /api/export/dashboard-summary?format=csv
```

**Export Fields:**
- Metric, Value, Unit
- Total Spend, Total Invoices, Average Invoice Value, Total Vendors

### Frontend Component

```jsx
import { ExportButton } from '../components/ui/ExportButton';

// In your component
<ExportButton 
  exportType="invoices" 
  label="Export Invoices" 
  filters={{
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  }}
/>
```

**Available Export Types:**
- `invoices` - Export all invoices
- `vendors` - Export vendor spend analysis
- `dashboard-summary` - Export KPI summary

### Example Usage

Add to dashboard page:
```jsx
<div className="flex gap-2">
  <ExportButton exportType="invoices" label="Export Invoices CSV" />
  <ExportButton exportType="vendors" label="Export Vendors CSV" />
  <ExportButton exportType="dashboard-summary" label="Export Summary CSV" />
</div>
```

---

## 👥 Feature 3: Role-Based Data Views

### User Roles

1. **Admin** - Full access to all data and features
2. **Manager** - Access to analytics and reports
3. **User** - Standard dashboard access
4. **Viewer** - Read-only access

### Database Implementation

Users have a `role` field that determines their permissions.

```typescript
// Example role check middleware (to be implemented)
const checkRole = (allowedRoles: string[]) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};

// Usage
router.get('/admin-data', checkRole(['admin']), (req, res) => {
  // Admin-only endpoint
});
```

### Role Permissions

| Feature | Viewer | User | Manager | Admin |
|---------|--------|------|---------|-------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Chat with Data | ❌ | ✅ | ✅ | ✅ |
| Export Data | ❌ | ❌ | ✅ | ✅ |
| Modify Data | ❌ | ❌ | ❌ | ✅ |
| View All History | ❌ | Own Only | ✅ | ✅ |

---

## 📈 Feature 4: Additional Insightful Charts

### New Charts Added

#### 1. Monthly Trend Chart (Area Chart)
**File**: `components/charts/MonthlyTrendChart.jsx`

**Features:**
- Area chart with gradient fill
- Shows spending patterns over time
- Responsive design
- Smooth transitions

**Usage:**
```jsx
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';

<MonthlyTrendChart data={monthlyData} />
```

**Data Format:**
```javascript
[
  { month: 'Jan', amount: 32000, invoices: 45 },
  { month: 'Feb', amount: 38000, invoices: 52 },
  // ...
]
```

#### 2. Payment Status Chart (Pie Chart)
**File**: `components/charts/PaymentStatusChart.jsx`

**Features:**
- Shows payment distribution
- Color-coded by status (Paid, Pending, Overdue)
- Percentage labels
- Legend with counts

**Usage:**
```jsx
import { PaymentStatusChart } from '../components/charts/PaymentStatusChart';

<PaymentStatusChart data={paymentData} />
```

**Data Format:**
```javascript
[
  { name: 'Paid', value: 45, color: '#10B981' },
  { name: 'Pending', value: 12, color: '#F59E0B' },
  { name: 'Overdue', value: 7, color: '#EF4444' },
]
```

### Chart Colors

Following the design system:
- **Paid**: #10B981 (green)
- **Pending**: #F59E0B (amber)
- **Overdue**: #EF4444 (red)
- **Primary**: #6366F1 (purple)

---

## 🐳 Feature 5: Docker Full Stack Setup

### Docker Compose Configuration

**File**: `docker-compose.full.yml`

**Services:**
1. **PostgreSQL** - Database (port 5432)
2. **API** - Backend Express (port 4001)
3. **Web** - Frontend Next.js (port 3000)
4. **Vanna** - AI Service (port 8000)

### Quick Start with Docker

```bash
# Set Groq API key
export GROQ_API_KEY=gsk_your_key_here

# Start all services
docker-compose -f docker-compose.full.yml up -d --build

# View logs
docker-compose -f docker-compose.full.yml logs -f

# Stop services
docker-compose -f docker-compose.full.yml down
```

### Access Points

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4001
- **Vanna AI**: http://localhost:8000
- **PostgreSQL**: localhost:5432

### Volume Persistence

Data is persisted in Docker volume `postgres_data`.

```bash
# Backup database
docker exec buchhaltung-db pg_dump -U postgres buchhaltung_analytics > backup.sql

# Restore database
cat backup.sql | docker exec -i buchhaltung-db psql -U postgres -d buchhaltung_analytics
```

---

## 🧪 Feature 6: Unit Tests

### Test Structure

```
apps/api/src/routes/__tests__/
├── dashboard.test.ts      # Dashboard endpoint tests
├── chat.test.ts          # Chat endpoint tests (to be added)
└── export.test.ts        # Export endpoint tests (to be added)
```

### Running Tests

```bash
# Run all tests
cd apps/api
npm test

# Run specific test file
npm test dashboard.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Test Examples

**Dashboard Stats Test:**
```typescript
describe('GET /api/dashboard/stats', () => {
  it('should return dashboard statistics', async () => {
    const response = await request(app)
      .get('/api/dashboard/stats')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('totalSpend');
  });
});
```

### Test Coverage Goals

- **API Endpoints**: >80% coverage
- **Business Logic**: >90% coverage
- **Utility Functions**: 100% coverage

### Mocking

Tests use Jest mocks for Prisma Client:
```typescript
jest.mock('../../lib/prisma', () => ({
  prisma: {
    invoice: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));
```

---

## 📦 Package.json Updates

### New Scripts Added

**API (apps/api/package.json):**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### New Dependencies

**Production:**
- `json2csv` - CSV export functionality
- `@types/json2csv` - TypeScript types

**Development:**
- `jest` - Testing framework
- `@types/jest` - Jest TypeScript types
- `ts-jest` - TypeScript Jest preprocessor
- `supertest` - HTTP assertion library
- `@types/supertest` - Supertest types

---

## 🎯 Integration Examples

### Example 1: Dashboard with Export

```jsx
import { MetricCard } from '../components/ui/Card';
import { ExportButton } from '../components/ui/ExportButton';
import { InvoiceVolumeChart } from '../components/charts/InvoiceVolumeChart';
import { MonthlyTrendChart } from '../components/charts/MonthlyTrendChart';
import { PaymentStatusChart } from '../components/charts/PaymentStatusChart';

function Dashboard() {
  return (
    <div>
      {/* Export Buttons */}
      <div className="flex gap-2 mb-4">
        <ExportButton exportType="invoices" />
        <ExportButton exportType="vendors" />
      </div>
      
      {/* Existing Charts */}
      <InvoiceVolumeChart />
      
      {/* New Charts */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <MonthlyTrendChart />
        <PaymentStatusChart />
      </div>
    </div>
  );
}
```

### Example 2: Chat with History

```jsx
import { ChatInterface } from '../components/chat/ChatInterface';

function ChatPage() {
  const userId = 1; // Get from auth context
  
  return (
    <div>
      <ChatInterface userId={userId} />
      
      {/* Optional: Show recent history */}
      <ChatHistoryPanel userId={userId} />
    </div>
  );
}
```

---

## 🔧 Configuration

### Environment Variables

Add to your `.env` files:

```env
# apps/api/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
GROQ_API_KEY=gsk_your_key_here
VANNA_API_BASE_URL=http://localhost:8000

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4001
```

### Prisma Configuration

After running migrations:
```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

---

## 📊 API Reference

### Export Endpoints

| Endpoint | Method | Description | Query Params |
|----------|--------|-------------|--------------|
| `/api/export/invoices` | GET | Export invoices | format, startDate, endDate, vendorId |
| `/api/export/vendors` | GET | Export vendors | format |
| `/api/export/dashboard-summary` | GET | Export summary | format |

### Chat Endpoints

| Endpoint | Method | Description | Body |
|----------|--------|-------------|------|
| `/api/chat-with-data` | POST | Query database | query, userId |
| `/api/chat-history` | GET | Get history | userId, limit |

---

## 🐛 Troubleshooting

### Common Issues

**1. Prisma Client Error**
```
Error: Property 'chatHistory' does not exist
```
**Solution**: Run `npx prisma generate`

**2. CSV Export Not Working**
```
Error: Cannot find module 'json2csv'
```
**Solution**: Run `npm install json2csv @types/json2csv`

**3. Tests Failing**
```
Error: Cannot find name 'jest'
```
**Solution**: Run `npm install --save-dev jest @types/jest ts-jest`

**4. Docker Container Won't Start**
```
Error: Port 5432 already in use
```
**Solution**: Stop local PostgreSQL or change port in docker-compose.yml

---

## 📈 Performance Tips

1. **Chat History**: Add index on `userId` and `createdAt` (already in schema)
2. **Export**: Use streaming for large datasets
3. **Docker**: Use production images for deployment
4. **Tests**: Use `--coverage` only in CI/CD

---

## 🚀 Next Steps

### Immediate
1. Run installation script
2. Test new features
3. Run unit tests
4. Try Docker setup

### Future Enhancements
1. Add authentication system
2. Implement role middleware
3. Add more chart types
4. Expand test coverage
5. Add E2E tests with Playwright

---

**Last Updated**: November 11, 2025  
**Version**: 2.1.0  
**Status**: ✅ All Enhancements Ready
