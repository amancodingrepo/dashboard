@echo off
echo ========================================
echo Installing Enhancement Dependencies
echo ========================================
echo.

cd apps\api

echo [1/6] Installing backend dependencies...
call npm install json2csv @types/json2csv
if %errorlevel% neq 0 exit /b %errorlevel%

echo [2/6] Installing testing dependencies...
call npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
if %errorlevel% neq 0 exit /b %errorlevel%

echo [3/6] Setting up Jest configuration...
call npx ts-jest config:init

echo [4/6] Regenerating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 exit /b %errorlevel%

echo [5/6] Creating database migration...
call npx prisma migrate dev --name add_user_chat_history
if %errorlevel% neq 0 exit /b %errorlevel%

echo [6/6] Verifying frontend dependencies...
cd ..\web
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

cd ..\..

echo.
echo ========================================
echo ✅ All dependencies installed!
echo ========================================
echo.
echo Next steps:
echo 1. Start the API: cd apps\api ^&^& npm run dev
echo 2. Start the Web: cd apps\web ^&^& npm run dev
echo 3. Test new features!
echo.

pause
