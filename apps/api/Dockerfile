# Use Debian-based Node to avoid OpenSSL errors
FROM node:18-bookworm

# Set working directory to mirror monorepo structure
WORKDIR /usr/apps/api

# Install system dependencies first
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY apps/api/package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy Prisma schema preserving relative structure
COPY prisma /usr/prisma/

# Copy application code
COPY apps/api/ .

# Generate Prisma client (uses schema path from package.json)
RUN npx prisma generate

# Build the TypeScript project
RUN npm run build

# Expose API port
EXPOSE 4000

# Start production server
CMD ["node", "dist/index.js"]
