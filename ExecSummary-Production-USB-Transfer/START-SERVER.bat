@echo off
title Executive Summary Platform - Production Server
color 0A

echo ========================================
echo   Executive Summary Platform
echo   Production Server Launcher
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Display Node version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% detected
echo.

:: Start the server
echo Starting backend server on http://localhost:3001
echo.
echo The server will automatically open:
echo - CMS Admin: http://localhost:3001/cms-admin/
echo - Frontend:  http://localhost:3001/
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd backend
node server.js

pause
