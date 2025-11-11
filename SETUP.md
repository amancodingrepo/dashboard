# Setup Instructions

## Fixes Applied

I've resolved the following configuration issues in your project:

### 1. API Package.json
- Added missing TypeScript type definitions (@types/express, @types/cors, @types/node)
- Added ts-node dependency for proper TypeScript execution
- Fixed trailing comma syntax error in scripts section
- Added useful scripts: build, prisma:generate, prisma:migrate

### 2. API Dockerfile
- Added Prisma schema copy step
- Added Prisma client generation during build
- This ensures the Prisma client is available when the container starts

### 3. TypeScript Configuration
- Changed module system from "NodeNext" to "commonjs" for better compatibility
- Changed moduleResolution from "NodeNext" to "node" 
- Added resolveJsonModule, declaration, declarationMap, and sourceMap options
- Added "dist" to exclude list

### 4. Web Dockerfile
- Removed conflicting build step that was causing issues in development mode
- The build now happens when needed, not during container initialization

## How to Run the Project

1. **Install dependencies in API directory:**
   ```bash
   cd apps/api
   npm install
   cd ../..
   ```

2. **Install dependencies in Web directory:**
   ```bash
   cd apps/web
   npm install
   cd ../..
   ```

3. **Generate Prisma Client:**
   ```bash
   cd apps/api
   npx prisma generate
   cd ../..
   ```

4. **Start with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

5. **Run Prisma migrations (in a new terminal while containers are running):**
   ```bash
   docker-compose exec api npx prisma migrate dev
   ```

## Alternative: Run Without Docker

If you prefer to run without Docker:

1. **Start PostgreSQL locally** (make sure it's running on port 5432)

2. **Update .env file** to use localhost instead of container names:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flowbit
   VANNA_URL=http://localhost:8000
   ```

3. **Run API:**
   ```bash
   cd apps/api
   npm run dev
   ```

4. **Run Web (in another terminal):**
   ```bash
   cd apps/web
   npm run dev
   ```

5. **Run Vanna service (in another terminal):**
   ```bash
   cd services/vanna
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Common Issues

### Issue: "Cannot find module '@prisma/client'"
**Solution:** Run `npx prisma generate` in the apps/api directory

### Issue: TypeScript compilation errors
**Solution:** Make sure all dependencies are installed with `npm install`

### Issue: Database connection errors
**Solution:** Ensure PostgreSQL is running and the DATABASE_URL in .env is correct

### Issue: Port already in use
**Solution:** Check if another service is using ports 3000, 4000, 5432, or 8000 and stop them

## Project Structure

- `apps/api/` - Express API with TypeScript and Prisma
- `apps/web/` - Next.js frontend
- `services/vanna/` - Python FastAPI service for SQL query generation
- `prisma/` - Database schema and migrations
- `data/` - Data storage directory

## Accessing the Application

- Frontend: http://localhost:3000
- API: http://localhost:4000
- Vanna Service: http://localhost:8000
- Database: localhost:5432
