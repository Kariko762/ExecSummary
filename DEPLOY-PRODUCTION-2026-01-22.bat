@echo off
echo ============================================================
echo Executive Summary - Production Deployment Package Creator
echo Date: January 22, 2026
echo ============================================================
echo.

REM Create deployment folder
set DEPLOY_DIR=ExecSummary-Production-2026-01-22
if exist %DEPLOY_DIR% rmdir /s /q %DEPLOY_DIR%
mkdir %DEPLOY_DIR%

echo [1/8] Creating directory structure...
mkdir %DEPLOY_DIR%\backend
mkdir %DEPLOY_DIR%\frontend
mkdir %DEPLOY_DIR%\cms-admin

echo [2/8] Building Frontend...
cd frontend-dist
if exist dist (
    echo Using existing frontend build...
    xcopy dist %DEPLOY_DIR%\frontend\ /E /I /Y
) else (
    echo ERROR: No frontend build found!
    cd ..
    goto :error
)
cd ..

echo [3/8] Building CMS-Admin...
cd cms-admin
call npm run build 2>nul
if exist dist (
    xcopy dist ..\%DEPLOY_DIR%\cms-admin\ /E /I /Y
) else (
    echo ERROR: CMS build failed!
    goto :error
)
cd ..

echo [4/8] Copying Backend files...
xcopy backend\*.js %DEPLOY_DIR%\backend\ /Y
xcopy backend\*.json %DEPLOY_DIR%\backend\ /Y
xcopy backend\*.md %DEPLOY_DIR%\backend\ /Y
xcopy backend\api %DEPLOY_DIR%\backend\api\ /E /I /Y
xcopy backend\data %DEPLOY_DIR%\backend\data\ /E /I /Y
xcopy backend\uploads %DEPLOY_DIR%\backend\uploads\ /E /I /Y 2>nul

echo [5/8] Installing Backend dependencies...
cd %DEPLOY_DIR%\backend
call npm install --production --no-optional
cd ..\..

echo [6/8] Creating startup scripts...
(
echo @echo off
echo echo Starting Executive Summary Backend Server...
echo cd backend
echo start cmd /k "node server.js"
echo echo.
echo echo Backend server started on http://localhost:3001
echo echo Frontend: http://localhost:3001
echo echo CMS Admin: http://localhost:3001/cms
echo echo.
echo pause
) > %DEPLOY_DIR%\START-SERVER.bat

(
echo Write-Host "Starting Executive Summary Backend Server..." -ForegroundColor Green
echo Set-Location backend
echo Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js"
echo Start-Sleep -Seconds 2
echo Write-Host ""
echo Write-Host "Backend server started!" -ForegroundColor Green
echo Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
echo Write-Host "CMS Admin: http://localhost:3001/cms" -ForegroundColor Cyan
echo Write-Host ""
echo Read-Host "Press Enter to exit"
) > %DEPLOY_DIR%\START-SERVER.ps1

echo [7/8] Creating README...
(
echo # Executive Summary - Production Package
echo.
echo ## Quick Start
echo.
echo 1. Double-click `START-SERVER.bat` (Windows) or run `START-SERVER.ps1` (PowerShell)
echo 2. Open browser to http://localhost:3001
echo 3. CMS Admin: http://localhost:3001/cms
echo.
echo ## What's Included
echo.
echo - **Frontend**: Pre-built executive summary viewer
echo - **CMS-Admin**: Content management system
echo - **Backend**: Node.js server with all data files
echo - **All Dependencies**: No installation required!
echo.
echo ## Requirements
echo.
echo - Node.js 18+ (already installed on this system)
echo - No other installation needed - everything is bundled!
echo.
echo ## Features
echo.
echo - Budget Management with right-panel modals
echo - Forecast Management with Year-on-Year charts
echo - Strategic Goals and Initiatives
echo - Full offline capability
echo - Green gradient headers with money pattern backgrounds
echo - Right-anchored detail modals (50%% viewport width)
echo.
echo ## Package Info
echo.
echo - Created: January 22, 2026
echo - Version: Production Ready
echo - All TypeScript compiled
echo - All dependencies installed
echo.
echo ## Troubleshooting
echo.
echo If the server doesn't start:
echo 1. Open Command Prompt in the backend folder
echo 2. Run: `node server.js`
echo 3. Check port 3001 is not in use
echo.
echo ## Support
echo.
echo For issues, check the backend/README.md file.
) > %DEPLOY_DIR%\README.md

echo [8/8] Creating manifest...
(
echo Production Package Manifest
echo ============================
echo.
echo Package: Executive Summary
echo Created: %DATE% %TIME%
echo.
echo Contents:
echo - Frontend (Pre-built React app)
echo - CMS-Admin (Pre-built React app)
echo - Backend (Node.js server + dependencies)
echo - All data files and uploads
echo - Startup scripts
echo.
echo Total Size: ~%DEPLOY_DIR% folder
echo.
echo No installation required - just run START-SERVER.bat!
) > %DEPLOY_DIR%\MANIFEST.txt

echo.
echo ============================================================
echo SUCCESS! Production package created: %DEPLOY_DIR%
echo ============================================================
echo.
echo Next steps:
echo 1. Copy the %DEPLOY_DIR% folder to your target location
echo 2. Run START-SERVER.bat to start the application
echo 3. Open http://localhost:3001 in your browser
echo.
pause
goto :eof

:error
echo.
echo ============================================================
echo ERROR: Build failed! Please check the errors above.
echo ============================================================
pause
exit /b 1
