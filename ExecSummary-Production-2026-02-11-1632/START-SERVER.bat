@echo off
echo ========================================
echo Executive Summary - Production Server
echo ========================================
echo.
echo Starting backend server on port 3001...
echo Frontend accessible at: http://localhost:3001
echo CMS Admin accessible at: http://localhost:3001/cms-admin
echo.
echo Press Ctrl+C to stop the server
echo ========================================
cd backend
node server.js
