# PowerShell script for Windows
Write-Host "🚀 Installing Enhancement Dependencies..." -ForegroundColor Green

# Navigate to API directory
Set-Location apps/api

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
npm install json2csv @types/json2csv
npm install --save-dev jest @types/jest ts-jest supertest @types/supertest

Write-Host "🧪 Setting up Jest configuration..." -ForegroundColor Yellow
npx ts-jest config:init

Write-Host "🔄 Regenerating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "📊 Creating database migration..." -ForegroundColor Yellow
npx prisma migrate dev --name add_user_chat_history

Write-Host "✅ Backend dependencies installed!" -ForegroundColor Green

# Navigate to web directory
Set-Location ../web

Write-Host "📦 Checking frontend dependencies..." -ForegroundColor Yellow
npm install

Write-Host "✅ Frontend dependencies verified!" -ForegroundColor Green

# Return to root
Set-Location ../..

Write-Host ""
Write-Host "✨ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the API: cd apps/api; npm run dev"
Write-Host "2. Start the Web: cd apps/web; npm run dev"
Write-Host "3. Test new features!"
