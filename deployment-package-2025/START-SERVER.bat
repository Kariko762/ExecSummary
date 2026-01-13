@echo off
title Executive Summary Server
color 0A
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   EXECUTIVE SUMMARY - PRODUCTION SERVER                  ║
echo ║   Starting backend API + serving frontend...              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ ERROR: Node.js not found!
    echo.
    echo Please install Node.js v18 or higher from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js found

echo.
echo [2/3] Checking dependencies...
cd backend
if not exist "node_modules\" (
    echo ✗ ERROR: node_modules folder missing!
    echo This package should include node_modules pre-installed.
    pause
    exit /b 1
)
echo ✓ Dependencies bundled and ready

echo.
echo [3/3] Starting server...
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║   SERVER RUNNING                                          ║
echo ║                                                           ║
echo ║   Frontend:  http://localhost:3000                        ║
echo ║   CMS:       http://localhost:3000/cms-admin              ║
echo ║   API:       http://localhost:3001/api                    ║
echo ║                                                           ║
echo ║   Press Ctrl+C to stop the server                         ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

node server.js
