#!/bin/bash
set -euo pipefail

export PRISMA_SCHEMA=prisma/schema.prisma

echo "Running Prisma migrate deploy..."
npx prisma migrate deploy --schema "$PRISMA_SCHEMA"

echo "Seeding database..."
node apps/api/dist/seed.js || npx ts-node apps/api/src/seed.ts

echo "Starting Docker stack..."
docker compose -f docker-compose.prod.yml up -d

echo "Done."

