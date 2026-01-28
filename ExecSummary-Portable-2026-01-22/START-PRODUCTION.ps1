Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Executive Summary - Production Environment" -ForegroundColor Green
Write-Host "Starting all services..." -ForegroundColor Yellow
Write-Host "============================================================
" -ForegroundColor Cyan

Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js; Write-Host 'Backend server stopped' -ForegroundColor Red"

Start-Sleep -Seconds 3

Write-Host "
============================================================" -ForegroundColor Cyan
Write-Host "All services started!" -ForegroundColor Green
Write-Host "============================================================
" -ForegroundColor Cyan
Write-Host "Frontend: " -NoNewline; Write-Host "http://localhost:3001" -ForegroundColor Cyan
Write-Host "CMS Admin: " -NoNewline; Write-Host "http://localhost:3001/cms" -ForegroundColor Cyan
Write-Host "
Press Ctrl+C in the Backend Server window to stop.
" -ForegroundColor Yellow

Read-Host "Press Enter to exit this window"
