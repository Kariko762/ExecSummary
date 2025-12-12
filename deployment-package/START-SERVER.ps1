# Executive Summary - Production Server Starter
# OFFLINE VERSION - All dependencies included
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Executive Summary Production Server" -ForegroundColor Cyan  
Write-Host "  OFFLINE VERSION - No internet required" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location backend

Write-Host "Starting server on http://localhost:3001" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Green
Write-Host "CMS Admin: http://localhost:3001/cms-admin" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

node server.js
