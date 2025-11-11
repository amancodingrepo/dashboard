# Flowbit Deployment

## Prerequisites
- Docker and Docker Compose
- Postgres and Redis (or use the compose file)

## Steps
1. Create `.env` from `.env.example` and fill values.
2. Build & start:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
3. Run Prisma migrations:
   ```bash
   docker compose exec api npx prisma migrate deploy --schema /usr/src/prisma/schema.prisma
   ```
4. (Optional) Seed:
   ```bash
   docker compose exec api node dist/seed.js
   ```

## Healthchecks
- API: `http://<host>:4000/health`
- Web: `http://<host>:3001/`


