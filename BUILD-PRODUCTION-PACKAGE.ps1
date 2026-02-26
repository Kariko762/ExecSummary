# ============================================
# EXECUTIVE SUMMARY - PRODUCTION BUILD SCRIPT
# Creates complete offline-ready package for USB transfer
# ============================================

$ErrorActionPreference = "Stop"
$packageName = "ExecSummary-Production-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
$packagePath = "C:\ExecSummary\$packageName"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BUILDING PRODUCTION PACKAGE" -ForegroundColor Cyan
Write-Host "Package: $packageName" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Clean previous build
if (Test-Path $packagePath) {
    Write-Host "`n[1/8] Cleaning previous build..." -ForegroundColor Yellow
    Remove-Item $packagePath -Recurse -Force
}

# Create package structure
Write-Host "`n[2/8] Creating package structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $packagePath -Force | Out-Null
New-Item -ItemType Directory -Path "$packagePath\frontend" -Force | Out-Null
New-Item -ItemType Directory -Path "$packagePath\cms-admin" -Force | Out-Null
New-Item -ItemType Directory -Path "$packagePath\backend" -Force | Out-Null

# Build Frontend
Write-Host "`n[3/8] Building main frontend (skipping type checks)..." -ForegroundColor Yellow
Set-Location "C:\ExecSummary"
npx vite build --mode production
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }
Copy-Item -Path "C:\ExecSummary\dist\*" -Destination "$packagePath\frontend\" -Recurse -Force

# Build CMS Admin
Write-Host "`n[4/8] Building CMS admin (skipping type checks)..." -ForegroundColor Yellow
Set-Location "C:\ExecSummary\cms-admin"
npx vite build --mode production
if ($LASTEXITCODE -ne 0) { throw "CMS build failed" }
Copy-Item -Path "C:\ExecSummary\cms-admin\dist\*" -Destination "$packagePath\cms-admin\" -Recurse -Force

# Copy Backend with dependencies
Write-Host "`n[5/8] Copying backend with dependencies..." -ForegroundColor Yellow
Copy-Item -Path "C:\ExecSummary\backend\*" -Destination "$packagePath\backend\" -Recurse -Force -Exclude @('node_modules', '.env')

# Install production backend dependencies
Write-Host "`n[6/8] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "$packagePath\backend"
npm install --production --no-optional
if ($LASTEXITCODE -ne 0) { throw "Backend dependency installation failed" }

# Copy documentation
Write-Host "`n[7/8] Copying documentation..." -ForegroundColor Yellow
Copy-Item "C:\ExecSummary\README.md" "$packagePath\" -Force
Copy-Item "C:\ExecSummary\IIS_DEPLOYMENT_GUIDE.md" "$packagePath\" -Force

# Create startup scripts
Write-Host "`n[8/8] Creating startup scripts..." -ForegroundColor Yellow

# Windows startup script
@"
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
"@ | Out-File -FilePath "$packagePath\START-SERVER.bat" -Encoding ASCII

# Linux startup script
@"
#!/bin/bash
echo "========================================"
echo "Executive Summary - Production Server"
echo "========================================"
echo ""
echo "Starting backend server on port 3001..."
echo "Frontend accessible at: http://localhost:3001"
echo "CMS Admin accessible at: http://localhost:3001/cms-admin"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
cd backend
node server.js
"@ | Out-File -FilePath "$packagePath\start-server.sh" -Encoding UTF8

# Create README for deployment
@"
# Executive Summary - Production Deployment

## Package Contents
- frontend/     - Built React application (main app)
- cms-admin/    - Built CMS administration interface
- backend/      - Node.js server with all dependencies
- START-SERVER.bat - Windows startup script
- start-server.sh  - Linux startup script

## Quick Start (Windows)

1. Ensure Node.js 16+ is installed on target server
2. Double-click START-SERVER.bat
3. Open browser to http://localhost:3001

## Quick Start (Linux)

1. Ensure Node.js 16+ is installed: node --version
2. Make script executable: chmod +x start-server.sh
3. Run: ./start-server.sh
4. Open browser to http://localhost:3001

## Server Requirements

- Node.js 16.x or higher
- 2GB RAM minimum
- 500MB disk space
- No internet connection required (fully offline)

## Port Configuration

Default port: 3001
To change: Edit backend/server.js, line 14

## Endpoints

- Main App: http://localhost:3001
- CMS Admin: http://localhost:3001/cms-admin
- API: http://localhost:3001/api/*

## Data Storage

All data stored in: backend/data/
- initiatives/
- tasks/
- notes/
- goals/
- business-units/
- templates/

## Production Checklist

[ ] Node.js installed on server
[ ] Firewall allows port 3001
[ ] Sufficient disk space
[ ] Backend server starts successfully
[ ] Frontend loads in browser
[ ] CMS admin accessible
[ ] Can create/edit/delete data

## IIS Deployment (Optional)

See IIS_DEPLOYMENT_GUIDE.md for hosting with IIS as reverse proxy.

## Support

Built: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Version: Production Build $(Get-Date -Format 'yyyy.MM.dd')

"@ | Out-File -FilePath "$packagePath\DEPLOYMENT-README.txt" -Encoding UTF8

# Create version info
@"
{
  "version": "$(Get-Date -Format 'yyyy.MM.dd')",
  "buildDate": "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
  "buildType": "production",
  "offline": true,
  "components": {
    "frontend": "built",
    "cmsAdmin": "built",
    "backend": "production"
  },
  "nodeVersion": "$(node --version)",
  "features": [
    "Initiatives Management",
    "Tasks & Notes",
    "Goals (SMART Framework)",
    "Gantt Charts",
    "Business Units",
    "Template Builder",
    "Workflows",
    "Vendors Management",
    "Organization Charts"
  ]
}
"@ | Out-File -FilePath "$packagePath\version.json" -Encoding UTF8

# Create package summary
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "BUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Package location: $packagePath" -ForegroundColor White
Write-Host "`nPackage contents:" -ForegroundColor Yellow
Get-ChildItem $packagePath | Select-Object Name, @{Name="Size";Expression={"{0:N2} MB" -f ($_.Length / 1MB)}} | Format-Table -AutoSize

$totalSize = (Get-ChildItem $packagePath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "Total size: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Cyan

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Copy entire '$packageName' folder to USB stick" -ForegroundColor White
Write-Host "2. Transfer to target server" -ForegroundColor White
Write-Host "3. Run START-SERVER.bat (Windows) or start-server.sh (Linux)" -ForegroundColor White
Write-Host "4. Open browser to http://localhost:3001" -ForegroundColor White

Write-Host "`nPress any key to create ZIP archive..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Create ZIP archive
Write-Host "`nCreating ZIP archive..." -ForegroundColor Yellow
Compress-Archive -Path "$packagePath\*" -DestinationPath "C:\ExecSummary\$packageName.zip" -Force
Write-Host "ZIP created: C:\ExecSummary\$packageName.zip" -ForegroundColor Green

$zipSize = (Get-Item "C:\ExecSummary\$packageName.zip").Length / 1MB
Write-Host "ZIP size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "READY FOR USB TRANSFER!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
