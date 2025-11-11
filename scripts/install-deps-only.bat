@echo off
echo ========================================
echo Installing Enhancement Dependencies
echo ========================================
echo.

cd apps\api

echo [1/3] Installing backend dependencies...
call npm install json2csv @types/json2csv
if %errorlevel% neq 0 exit /b %errorlevel%

echo [2/3] Installing testing dependencies...
call npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
if %errorlevel% neq 0 exit /b %errorlevel%

echo [3/3] Regenerating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 exit /b %errorlevel%

cd ..\..

echo.
echo ========================================
echo ✅ Dependencies installed successfully!
echo ========================================
echo.
echo TypeScript errors should now be fixed!
echo.
echo Optional: Run database migration separately:
echo   cd apps\api
echo   npx prisma migrate dev --name add_user_chat_history
echo.
echo Next steps:
echo 1. Restart your dev servers to clear TypeScript errors
echo 2. Test the new features!
echo.

pause
