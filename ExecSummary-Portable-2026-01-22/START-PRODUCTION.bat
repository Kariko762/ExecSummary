@echo off
title Executive Summary - Production Server
color 0A
echo ============================================================
echo Executive Summary - Production Environment
echo Starting all services...
echo ============================================================
echo.

cd backend
start "Backend Server" cmd /k "node server.js"

timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo All services started!
echo ============================================================
echo.
echo Frontend: http://localhost:3001
echo CMS Admin: http://localhost:3001/cms
echo.
echo Press Ctrl+C in the Backend Server window to stop.
echo.
pause
