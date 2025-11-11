# Flowbit Production Health Check Script
param()

$ErrorActionPreference = "Continue"
$composeFile = "docker-compose.prod.yml"
$basePath = Split-Path -Parent $PSScriptRoot
Set-Location $basePath

Write-Host "=== Flowbit Health Check ===" -ForegroundColor Cyan
Write-Host ""

# Check Docker Compose
Write-Host "[1/6] Checking Docker Compose..." -ForegroundColor Yellow
docker compose -f $composeFile ps | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Docker Compose accessible" -ForegroundColor Green
} else {
    Write-Host "  ✗ Docker Compose error" -ForegroundColor Red
    exit 1
}

# Check Container Status
Write-Host "[2/6] Checking Container Status..." -ForegroundColor Yellow
$services = @("db", "redis", "api", "web", "vanna")
$allHealthy = $true

foreach ($service in $services) {
    $status = docker compose -f $composeFile ps $service 2>&1
    if ($status -match "Up|healthy") {
        Write-Host "  ✓ $service : Running" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $service : Not healthy" -ForegroundColor Red
        $allHealthy = $false
    }
}

if (-not $allHealthy) {
    Write-Host ""
    Write-Host "⚠ Some containers are not healthy. Attempting restart..." -ForegroundColor Yellow
    docker compose -f $composeFile up -d
    Start-Sleep -Seconds 10
}

# Check API Health Endpoint
Write-Host "[3/6] Checking API Health..." -ForegroundColor Yellow
$apiHealth = $null
try {
    $apiHealth = Invoke-WebRequest -Uri "http://localhost:4000/health" -TimeoutSec 5 -UseBasicParsing
} catch {
    Write-Host "  ✗ API Health check failed: $_" -ForegroundColor Red
    Write-Host "    Attempting to restart API..." -ForegroundColor Yellow
    docker compose -f $composeFile restart api
    Start-Sleep -Seconds 5
    exit
}

if ($apiHealth -and $apiHealth.StatusCode -eq 200) {
    $health = $apiHealth.Content | ConvertFrom-Json
    Write-Host "  ✓ API Health: $($health.status)" -ForegroundColor Green
    Write-Host "    Environment: $($health.environment)" -ForegroundColor Gray
    Write-Host "    Uptime: $([math]::Round($health.uptime, 2))s" -ForegroundColor Gray
} else {
    Write-Host "  ✗ API returned status: $($apiHealth.StatusCode)" -ForegroundColor Red
}

# Check API Stats Endpoint
Write-Host "[4/6] Checking API Stats..." -ForegroundColor Yellow
$apiStats = $null
try {
    $apiStats = Invoke-WebRequest -Uri "http://localhost:4000/api/stats" -TimeoutSec 8 -UseBasicParsing
} catch {
    Write-Host "  ✗ API Stats check failed: $_" -ForegroundColor Red
}

if ($apiStats -and $apiStats.StatusCode -eq 200) {
    $stats = $apiStats.Content | ConvertFrom-Json
    Write-Host "  ✓ API Stats accessible" -ForegroundColor Green
    Write-Host "    Total Vendors: $($stats.summary.totalVendors)" -ForegroundColor Gray
    Write-Host "    Total Customers: $($stats.summary.totalCustomers)" -ForegroundColor Gray
    Write-Host "    Total Invoices: $($stats.summary.totalInvoices)" -ForegroundColor Gray
    Write-Host "    Total Spend: $($stats.summary.totalSpend)" -ForegroundColor Gray
    
    if ($stats.summary.totalInvoices -eq 0) {
        Write-Host "  ⚠ Database appears empty. Seeding..." -ForegroundColor Yellow
        docker compose -f $composeFile exec -T api node dist/seed.js 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ Seed completed" -ForegroundColor Green
        } else {
            Write-Host "    ✗ Seed failed" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  ✗ API Stats returned status: $($apiStats.StatusCode)" -ForegroundColor Red
}

# Check Web Endpoint
Write-Host "[5/6] Checking Web Frontend..." -ForegroundColor Yellow
$webResponse = $null
try {
    $webResponse = Invoke-WebRequest -Uri "http://localhost:3001/" -TimeoutSec 8 -UseBasicParsing
} catch {
    Write-Host "  ✗ Web Frontend check failed: $_" -ForegroundColor Red
    Write-Host "    Attempting to restart web..." -ForegroundColor Yellow
    docker compose -f $composeFile restart web
    Start-Sleep -Seconds 5
}

if ($webResponse -and $webResponse.StatusCode -eq 200) {
    Write-Host "  ✓ Web Frontend accessible" -ForegroundColor Green
    if ($webResponse.Content -match "Flowbit") {
        Write-Host "    ✓ Dashboard content detected" -ForegroundColor Green
    }
} else {
    Write-Host "  ✗ Web returned status: $($webResponse.StatusCode)" -ForegroundColor Red
}

# Check Database Connection
Write-Host "[6/6] Checking Database Schema..." -ForegroundColor Yellow
$result = docker compose -f $composeFile exec -T api npx prisma db push --schema /usr/src/prisma/schema.prisma --skip-generate 2>&1
if ($result -match "already in sync|Your database is now in sync") {
    Write-Host "  ✓ Database schema synced" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Database sync output available" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Health Check Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "  API:     http://localhost:4000" -ForegroundColor White
Write-Host "  Web:     http://localhost:3001" -ForegroundColor White
Write-Host "  Vanna:   http://localhost:8000" -ForegroundColor White
Write-Host ""
