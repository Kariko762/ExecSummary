#!/usr/bin/env pwsh
# Executive Summary Platform - Production Server Launcher (PowerShell)

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "  Executive Summary Platform" -ForegroundColor Green
Write-Host "  Production Server Launcher" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js $nodeVersion detected" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Start the server
Write-Host "Starting backend server on http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "The server will automatically open:" -ForegroundColor Cyan
Write-Host "- CMS Admin: http://localhost:3001/cms-admin/" -ForegroundColor White
Write-Host "- Frontend:  http://localhost:3001/" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location backend
node server.js
