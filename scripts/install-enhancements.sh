#!/bin/bash

echo "🚀 Installing Enhancement Dependencies..."

# Navigate to API directory
cd apps/api

echo "📦 Installing backend dependencies..."
npm install json2csv @types/json2csv

echo "🔄 Regenerating Prisma Client..."
npx prisma generate

echo "📊 Creating database migration..."
npx prisma migrate dev --name add_user_chat_history

echo "✅ Backend dependencies installed!"

# Navigate to web directory
cd ../web

echo "📦 Checking frontend dependencies..."
npm install

echo "✅ Frontend dependencies verified!"

# Return to root
cd ../..

echo ""
echo "✨ All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the API: cd apps/api && npm run dev"
echo "2. Start the Web: cd apps/web && npm run dev"
echo "3. Test new features!"
