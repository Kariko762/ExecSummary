#!/usr/bin/env pwsh
# Executive Summary Production Server Launcher
# PowerShell version for cross-platform support

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   EXECUTIVE SUMMARY - PRODUCTION SERVER                  ║" -ForegroundColor Green
Write-Host "║   Starting backend API + serving frontend...              ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

# Check Node.js
Write-Host "[1/3] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "`nPlease install Node.js v18 or higher from:" -ForegroundColor Yellow
    Write-Host "https://nodejs.org/`n" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
    exit 1
}

# Check dependencies
Write-Host "`n[2/3] Checking dependencies..." -ForegroundColor Yellow
Set-Location backend

if (!(Test-Path "node_modules")) {
    Write-Host "✗ ERROR: node_modules folder missing!" -ForegroundColor Red
    Write-Host "This package should include node_modules pre-installed." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Dependencies bundled and ready" -ForegroundColor Green

# Start server
Write-Host "`n[3/3] Starting server...`n" -ForegroundColor Yellow
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   SERVER RUNNING                                          ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║   Frontend:  http://localhost:3000                        ║" -ForegroundColor White
Write-Host "║   CMS:       http://localhost:3000/cms-admin              ║" -ForegroundColor White
Write-Host "║   API:       http://localhost:3001/api                    ║" -ForegroundColor White
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║   Press Ctrl+C to stop the server                         ║" -ForegroundColor Yellow
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

node server.js
