# Git Setup and Push Script for Flowbit Analytics
Write-Host "🚀 Setting up Git repository for Flowbit Analytics..." -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Add all files
Write-Host "📁 Adding all files to Git..." -ForegroundColor Yellow
git add .

# Create commit
Write-Host "💾 Creating commit..." -ForegroundColor Yellow
$commitMessage = "feat: Complete project refactoring for submission

- Cleaned up vibecoded files and restructured project
- Added comprehensive documentation (API docs, database schema)
- Implemented proper folder structure (/apps/web, /apps/api, /apps/vanna)
- Added database seeding script with test data
- Created Docker Compose setup for local development
- Updated environment configuration with production URLs
- Added professional README with deployment instructions
- Implemented error handling and fallback systems
- Ready for production deployment on Vercel + Render"

git commit -m "$commitMessage"

Write-Host "🎯 Git setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a new repository on GitHub" -ForegroundColor White
Write-Host "2. Copy the repository URL" -ForegroundColor White
Write-Host "3. Run: git remote add origin <your-repo-url>" -ForegroundColor White
Write-Host "4. Run: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Example:" -ForegroundColor Yellow
Write-Host "git remote add origin https://github.com/yourusername/flowbit-analytics.git" -ForegroundColor Gray
Write-Host "git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "🌟 Your project is ready for submission!" -ForegroundColor Green
