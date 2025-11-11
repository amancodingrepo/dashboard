@echo off
echo ========================================
echo Docker Full Stack Test
echo ========================================
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/5] Stopping any existing containers...
docker-compose -f docker-compose.full.yml down

echo.
echo [2/5] Checking for Groq API key...
if "%GROQ_API_KEY%"=="" (
    echo WARNING: GROQ_API_KEY environment variable not set!
    echo.
    echo Please set it:
    echo   $env:GROQ_API_KEY="gsk_your_key_here"
    echo.
    echo Or edit docker-compose.full.yml to add your key.
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

echo.
echo [3/5] Building Docker images...
docker-compose -f docker-compose.full.yml build

echo.
echo [4/5] Starting all services...
docker-compose -f docker-compose.full.yml up -d

echo.
echo [5/5] Waiting for services to start (30 seconds)...
timeout /t 30 /nobreak

echo.
echo ========================================
echo Services Status:
echo ========================================
docker-compose -f docker-compose.full.yml ps

echo.
echo ========================================
echo Access Points:
echo ========================================
echo - Frontend:  http://localhost:3000
echo - API:       http://localhost:4001
echo - Vanna AI:  http://localhost:8000
echo - Database:  localhost:5432
echo.
echo ========================================
echo Useful Commands:
echo ========================================
echo View logs:   docker-compose -f docker-compose.full.yml logs -f
echo Stop all:    docker-compose -f docker-compose.full.yml down
echo Restart:     docker-compose -f docker-compose.full.yml restart
echo.

echo Opening frontend in browser...
timeout /t 3 /nobreak
start http://localhost:3000

echo.
echo Press any key to view logs...
pause >nul

docker-compose -f docker-compose.full.yml logs -f
