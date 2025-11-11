## Flowbit — Production Guide

### Services
- API (Express + TypeScript + Prisma)
- Web (Next.js)
- Vanna (FastAPI)
- Postgres 15
- Redis 7

### Quickstart (Local)
1. Set `DATABASE_URL` to a Postgres instance.
2. `npx prisma db push --schema prisma/schema.prisma`
3. Seed: `cd apps/api && npx ts-node src/seed.ts`
4. API: `cd apps/api && npm run dev`
5. Web: `cd apps/web && npm run dev`

### Production (Docker)
```
docker compose -f docker-compose.prod.yml up -d --build
```

### Environment
See `.env.example` for required variables.

### API
- `GET /health`
- `GET /api/version`
- `GET /api/stats` → returns summary, monthlySpend, spendByVendor, recentInvoices


