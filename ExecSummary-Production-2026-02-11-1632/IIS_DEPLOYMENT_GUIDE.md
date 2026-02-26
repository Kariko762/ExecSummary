# IIS Deployment Guide - Executive Summary Platform
**Windows Server 2016/2022 Deployment**

## Overview
This guide walks you through deploying the Executive Summary platform to Windows Server 2016 or 2022 using IIS (Internet Information Services). Includes main frontend, CMS admin frontend, and Node.js backend API.

---

## Prerequisites

### Server Requirements
- Windows Server 2016 or Windows Server 2022
- Administrator access to the server
- Minimum 4GB RAM (8GB recommended)
- 20GB free disk space
- Static IP address or domain name

### Required Software Downloads
Download these installers before starting:

1. **Node.js 18 LTS** (for backend API)
   - Download: https://nodejs.org/dist/v18.19.0/node-v18.19.0-x64.msi
   - File: `node-v18.19.0-x64.msi`

2. **IIS URL Rewrite Module** (for SPA routing)
   - Download: https://www.iis.net/downloads/microsoft/url-rewrite
   - File: `rewrite_amd64_en-US.msi`

3. **IIS Application Request Routing (ARR)** (for API reverse proxy)
   - Download: https://www.iis.net/downloads/microsoft/application-request-routing
   - File: `requestRouter_amd64.msi`

4. **iisnode** (to run Node.js in IIS)
   - Download: https://github.com/azure/iisnode/releases/latest
   - File: `iisnode-full-v0.2.26-x64.msi` (or latest version)

5. **Visual C++ Redistributable** (dependency for iisnode)
   - Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
   - File: `vc_redist.x64.exe`

---

## Phase 1: Install IIS and Required Components

### Step 1: Enable IIS on Windows Server

#### Option A: Using Server Manager (GUI)
1. Open **Server Manager**
2. Click **"Manage"** → **"Add Roles and Features"**
3. Click **"Next"** until you reach **"Server Roles"**
4. Check **"Web Server (IIS)"**
5. Click **"Add Features"** when prompted
6. Click **"Next"** until **"Role Services"** page
7. Expand **"Web Server"** → **"Application Development"**
8. Check the following:
   - ✅ **ASP.NET 4.8** (or latest)
   - ✅ **.NET Extensibility 4.8**
   - ✅ **WebSocket Protocol**
   - ✅ **Application Initialization**
9. Under **"Management Tools"**, ensure checked:
   - ✅ **IIS Management Console**
10. Click **"Next"** → **"Install"**
11. Wait for installation (5-10 minutes)
12. Click **"Close"**

#### Option B: Using PowerShell (Administrator)
```powershell
# Open PowerShell as Administrator
Install-WindowsFeature -name Web-Server -IncludeManagementTools
Install-WindowsFeature Web-WebSockets
Install-WindowsFeature Web-App-Init
Install-WindowsFeature Web-ASP-Net45
Install-WindowsFeature Web-Net-Ext45
```

**Verify IIS Installation:**
1. Open browser on the server
2. Navigate to: `http://localhost`
3. You should see the default IIS welcome page

### Step 2: Install Node.js

1. Run the Node.js installer: `node-v18.19.0-x64.msi`
2. Click **"Next"** through the wizard
3. Accept the license agreement
4. Leave default installation path: `C:\Program Files\nodejs\`
5. Make sure **"Add to PATH"** is checked
6. Click **"Next"** → **"Install"**
7. Wait for installation
8. Click **"Finish"**

**Verify Node.js Installation:**
```powershell
node --version
# Should show: v18.19.0

npm --version
# Should show: 10.2.3 or similar
```

### Step 3: Install Visual C++ Redistributable

1. Run: `vc_redist.x64.exe`
2. Accept license agreement
3. Click **"Install"**
4. Wait for installation
5. Click **"Close"**

### Step 4: Install IIS URL Rewrite Module

1. Run: `rewrite_amd64_en-US.msi`
2. Accept license agreement
3. Click **"Install"**
4. Wait for installation
5. Click **"Finish"**

**This enables:** Single-page application routing (no 404s on refresh)

### Step 5: Install IIS Application Request Routing

1. Run: `requestRouter_amd64.msi`
2. Accept license agreement
3. Click **"Install"**
4. Wait for installation
5. Click **"Finish"**

**This enables:** Reverse proxy to Node.js backend API

### Step 6: Install iisnode

1. Run: `iisnode-full-v0.2.26-x64.msi`
2. Accept license agreement
3. Leave default path: `C:\Program Files\iisnode\`
4. Click **"Install"**
5. Wait for installation
6. Click **"Finish"**

**Verify iisnode Installation:**
```powershell
Test-Path "C:\Program Files\iisnode\iisnode.dll"
# Should return: True
```

---

## Phase 2: Prepare Application Files

### Step 7: Build Frontend Applications

On your **development machine** (where the code is):

#### Build Main Frontend
```powershell
# Open PowerShell
cd C:\ExecSummary

# Install dependencies
npm install

# Update API URL for production
# Edit src/App.tsx - change API_URL to your server's address
# Example: const API_URL = 'http://your-server-ip:3001';
# OR: const API_URL = 'http://your-domain.com/api';

# Build for production
npm run build
```

**Result:** `C:\ExecSummary\dist\` folder created

#### Build CMS Admin
```powershell
cd C:\ExecSummary\cms-admin

# Install dependencies
npm install

# Update API URL in cms-admin/src/App.tsx
# Same as above - match your server address

# Build for production
npm run build
```

**Result:** `C:\ExecSummary\cms-admin\dist\` folder created

### Step 8: Prepare Backend for Production

```powershell
cd C:\ExecSummary\backend

# Install production dependencies only
npm install --production

# Create web.config for iisnode (see next step)
```

### Step 9: Create web.config for Backend

Create a new file: `C:\ExecSummary\backend\web.config`

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    
    <!-- iisnode configuration -->
    <iisnode 
      nodeProcessCommandLine="C:\Program Files\nodejs\node.exe"
      debuggingEnabled="false"
      loggingEnabled="true"
      logDirectory="iisnode"
      node_env="production"
      watchedFiles="*.js;iisnode.yml"
    />

    <!-- URL rewriting rules for Node.js -->
    <rewrite>
      <rules>
        <rule name="NodeJS API" stopProcessing="true">
          <match url="/*" />
          <action type="Rewrite" url="server.js" />
        </rule>
      </rules>
    </rewrite>

    <!-- Make sure server.js is not served as static file -->
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
    </handlers>

    <!-- Security: Don't expose Node.js version -->
    <httpProtocol>
      <customHeaders>
        <remove name="X-Powered-By" />
      </customHeaders>
    </httpProtocol>

    <!-- Error pages -->
    <httpErrors existingResponse="PassThrough" />

  </system.webServer>
</configuration>
```

### Step 10: Create web.config for Frontends

Create: `C:\ExecSummary\dist\web.config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    
    <!-- URL Rewrite for SPA routing -->
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>

    <!-- MIME types for modern web assets -->
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
      <mimeMap fileExtension=".svg" mimeType="image/svg+xml" />
    </staticContent>

    <!-- Compression for better performance -->
    <httpCompression>
      <dynamicTypes>
        <add mimeType="application/json" enabled="true" />
      </dynamicTypes>
      <staticTypes>
        <add mimeType="application/javascript" enabled="true" />
        <add mimeType="text/css" enabled="true" />
      </staticTypes>
    </httpCompression>

  </system.webServer>
</configuration>
```

Copy this same file to: `C:\ExecSummary\cms-admin\dist\web.config`

### Step 11: Transfer Files to Server

Use one of these methods to copy files to your Windows Server:

#### Option A: Remote Desktop Copy-Paste
1. Connect to server via **Remote Desktop (RDP)**
2. On local machine, copy `C:\ExecSummary\dist` folder
3. On server, paste to: `C:\inetpub\wwwroot\executive-summary\`
4. Copy `C:\ExecSummary\cms-admin\dist` folder
5. Paste to: `C:\inetpub\wwwroot\cms-admin\`
6. Copy entire `C:\ExecSummary\backend` folder
7. Paste to: `C:\inetpub\wwwroot\api\`

#### Option B: Network Share
1. On server, create folder: `C:\inetpub\wwwroot\executive-summary\`
2. Share the `wwwroot` folder on the network
3. From your dev machine, copy files over the network share

#### Option C: PowerShell Remote Copy (if enabled)
```powershell
# From your development machine
$session = New-PSSession -ComputerName YOUR-SERVER-IP -Credential (Get-Credential)

Copy-Item -Path "C:\ExecSummary\dist\*" `
  -Destination "C:\inetpub\wwwroot\executive-summary\" `
  -ToSession $session -Recurse

Copy-Item -Path "C:\ExecSummary\cms-admin\dist\*" `
  -Destination "C:\inetpub\wwwroot\cms-admin\" `
  -ToSession $session -Recurse

Copy-Item -Path "C:\ExecSummary\backend\*" `
  -Destination "C:\inetpub\wwwroot\api\" `
  -ToSession $session -Recurse
```

**Final Server Structure:**
```
C:\inetpub\wwwroot\
├── executive-summary\
│   ├── assets\
│   ├── index.html
│   └── web.config
├── cms-admin\
│   ├── assets\
│   ├── index.html
│   └── web.config
└── api\
    ├── node_modules\
    ├── server.js
    ├── package.json
    ├── web.config
    └── (all other backend files)
```

---

## Phase 3: Configure IIS Websites

### Step 12: Open IIS Manager

1. Press **Win + R**
2. Type: `inetmgr`
3. Press **Enter**
4. IIS Manager window opens

### Step 13: Create Website for Main Frontend

1. In IIS Manager, expand the server node (left panel)
2. Right-click **"Sites"**
3. Select **"Add Website..."**
4. Fill in the details:
   - **Site name:** `Executive-Summary`
   - **Physical path:** Click **"..."** → Browse to `C:\inetpub\wwwroot\executive-summary`
   - **Binding:**
     - Type: `http`
     - IP address: `All Unassigned` (or specific IP)
     - Port: `80`
     - Host name: `executive.yourcompany.com` (or leave blank for IP access)
5. Click **"OK"**

**Test:** Open browser to `http://localhost` or `http://your-server-ip`

### Step 14: Create Website for CMS Admin

1. Right-click **"Sites"** again
2. Select **"Add Website..."**
3. Fill in:
   - **Site name:** `CMS-Admin`
   - **Physical path:** `C:\inetpub\wwwroot\cms-admin`
   - **Binding:**
     - Type: `http`
     - Port: `8080` (different from main site!)
     - Host name: `cms.yourcompany.com` (or leave blank)
4. Click **"OK"**

**Test:** Open browser to `http://your-server-ip:8080`

### Step 15: Create Website for Backend API

1. Right-click **"Sites"**
2. Select **"Add Website..."**
3. Fill in:
   - **Site name:** `API-Backend`
   - **Physical path:** `C:\inetpub\wwwroot\api`
   - **Binding:**
     - Type: `http`
     - Port: `3001`
     - Host name: (leave blank)
4. Click **"OK"**

### Step 16: Configure Backend API Application Pool

1. In IIS Manager, click **"Application Pools"** (left panel)
2. Find **"API-Backend"** pool
3. Right-click → **"Advanced Settings..."**
4. Change the following:
   - **Enable 32-Bit Applications:** False
   - **.NET CLR Version:** No Managed Code
   - **Start Mode:** AlwaysRunning
   - **Idle Time-out (minutes):** 0 (keeps Node.js running)
5. Click **"OK"**

**Test Backend:** Open browser to `http://your-server-ip:3001/health`

Should see: `{"status":"ok"}` or similar

---

## Phase 4: Configure Firewall Rules

### Step 17: Open Firewall Ports

```powershell
# Open PowerShell as Administrator

# Allow HTTP (port 80) - Main Frontend
New-NetFirewallRule -DisplayName "Executive Summary - HTTP" `
  -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Allow CMS Admin (port 8080)
New-NetFirewallRule -DisplayName "CMS Admin - HTTP" `
  -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow

# Allow API Backend (port 3001)
New-NetFirewallRule -DisplayName "API Backend - HTTP" `
  -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow

# Verify rules created
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Executive*" -or $_.DisplayName -like "*CMS*" -or $_.DisplayName -like "*API*"}
```

**Alternative (GUI Method):**
1. Open **Windows Defender Firewall with Advanced Security**
2. Click **"Inbound Rules"** → **"New Rule..."**
3. Select **"Port"** → **"Next"**
4. Select **"TCP"**, enter port: `80` → **"Next"**
5. Select **"Allow the connection"** → **"Next"**
6. Check all profiles → **"Next"**
7. Name: `Executive Summary - HTTP` → **"Finish"**
8. Repeat for ports 8080 and 3001

---

## Phase 5: Configure CORS and Environment Variables

### Step 18: Update Backend API URLs in Frontends

If you didn't update before building, you need to rebuild:

1. On dev machine, edit `C:\ExecSummary\src\App.tsx`:
```typescript
const API_URL = 'http://YOUR-SERVER-IP:3001';
// OR if using domain:
const API_URL = 'http://api.yourcompany.com';
```

2. Edit `C:\ExecSummary\cms-admin\src\App.tsx` with same URL

3. Rebuild both frontends:
```powershell
cd C:\ExecSummary
npm run build

cd C:\ExecSummary\cms-admin
npm run build
```

4. Re-copy the `dist` folders to the server (overwrite existing files)

### Step 19: Configure CORS in Backend

Edit `C:\inetpub\wwwroot\api\server.js`:

Find the CORS configuration section and update allowed origins:

```javascript
app.use(cors({
  origin: [
    'http://YOUR-SERVER-IP',           // Main frontend
    'http://YOUR-SERVER-IP:8080',      // CMS admin
    'http://executive.yourcompany.com', // If using domain
    'http://cms.yourcompany.com',       // If using domain
    'http://localhost:5173',            // Local dev
    'http://localhost:5174'             // Local dev
  ],
  credentials: true
}));
```

Save and restart the API site in IIS:
1. IIS Manager → Sites → API-Backend
2. Right-click → **"Manage Website"** → **"Restart"**

---

## Phase 6: Setup SSL/HTTPS (Recommended)

### Step 20: Install SSL Certificate (Optional but Recommended)

#### Option A: Self-Signed Certificate (for testing)
```powershell
# Create self-signed certificate
New-SelfSignedCertificate -DnsName "your-server-name" `
  -CertStoreLocation "cert:\LocalMachine\My" `
  -FriendlyName "Executive Summary SSL"
```

#### Option B: Commercial Certificate (for production)
1. Purchase SSL certificate from provider (GoDaddy, DigiCert, etc.)
2. Download certificate files (.pfx or .cer)
3. Double-click certificate file
4. Select **"Local Machine"** → **"Next"**
5. Enter password (if required)
6. Select **"Automatically select the certificate store"**
7. Click **"Finish"**

### Step 21: Bind SSL Certificate to Sites

1. In IIS Manager, select **"Executive-Summary"** site
2. In the right **"Actions"** panel, click **"Bindings..."**
3. Click **"Add..."**
4. Configure:
   - **Type:** https
   - **IP address:** All Unassigned
   - **Port:** 443
   - **SSL certificate:** Select your certificate
5. Click **"OK"**
6. Repeat for CMS-Admin (port 8443) and API-Backend (port 3002)

**Update firewall for HTTPS:**
```powershell
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
New-NetFirewallRule -DisplayName "CMS HTTPS" -Direction Inbound -Protocol TCP -LocalPort 8443 -Action Allow
New-NetFirewallRule -DisplayName "API HTTPS" -Direction Inbound -Protocol TCP -LocalPort 3002 -Action Allow
```

---

## Phase 7: Testing and Verification

### Step 22: Test All Components

**From the server's browser:**

1. **Main Frontend:**
   - Navigate to: `http://localhost` or `http://YOUR-SERVER-IP`
   - Should load the executive summary homepage
   - Check browser console (F12) for errors

2. **CMS Admin:**
   - Navigate to: `http://localhost:8080` or `http://YOUR-SERVER-IP:8080`
   - Should load the CMS login/dashboard
   - Verify no console errors

3. **Backend API:**
   - Navigate to: `http://localhost:3001/health` or `http://YOUR-SERVER-IP:3001/health`
   - Should see JSON response: `{"status":"ok"}`

**From a remote client:**

1. Open browser on different computer
2. Test same URLs using server's IP or domain name
3. Verify CORS works (no red errors in console)

### Step 23: Test File Upload (if applicable)

1. In CMS Admin, try uploading a file
2. Check that file appears in: `C:\inetpub\wwwroot\api\uploads\`
3. Verify permissions allow IIS to write files:

```powershell
# Grant IIS write permissions to uploads folder
$path = "C:\inetpub\wwwroot\api\uploads"
icacls $path /grant "IIS_IUSRS:(OI)(CI)M"
```

### Step 24: Monitor Logs

**IIS Logs:**
- Location: `C:\inetpub\logs\LogFiles\`
- Each site has a subfolder (W3SVC1, W3SVC2, etc.)

**Node.js Logs (iisnode):**
- Location: `C:\inetpub\wwwroot\api\iisnode\`
- Files: `node-stdout-*.txt` and `node-stderr-*.txt`

**Check for errors:**
```powershell
# View latest Node.js error log
Get-Content "C:\inetpub\wwwroot\api\iisnode\*.stderr.txt" -Tail 50
```

---

## Phase 8: Performance Optimization

### Step 25: Enable Output Caching

1. In IIS Manager, select **"Executive-Summary"** site
2. Double-click **"Output Caching"**
3. In the right panel, click **"Add..."**
4. Configure:
   - **File name extension:** `.js`
   - **User-mode caching:** Check "Kernel-mode caching"
5. Click **"OK"**
6. Repeat for: `.css`, `.png`, `.jpg`, `.woff`, `.woff2`

### Step 26: Enable HTTP Compression

1. In IIS Manager, select the server node (top level)
2. Double-click **"Compression"**
3. Check both:
   - ✅ **Enable dynamic content compression**
   - ✅ **Enable static content compression**
4. Click **"Apply"**

### Step 27: Configure Application Initialization

1. Select **"API-Backend"** site
2. Double-click **"Configuration Editor"**
3. Section: `system.webServer/applicationInitialization`
4. Set `doAppInitAfterRestart` to `True`
5. Click **"Apply"**

**This ensures:** Node.js backend starts immediately when IIS starts

---

## Phase 9: Automatic Startup and Monitoring

### Step 28: Configure IIS to Auto-Start

```powershell
# Ensure IIS service starts automatically
Set-Service -Name W3SVC -StartupType Automatic

# Start IIS if not running
Start-Service W3SVC
```

### Step 29: Create Monitoring Script

Create: `C:\Scripts\monitor-execsummary.ps1`

```powershell
# Executive Summary Health Monitor
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Check if sites are running
$sites = @("Executive-Summary", "CMS-Admin", "API-Backend")

foreach ($site in $sites) {
    $state = (Get-WebsiteState -Name $site).Value
    
    if ($state -ne "Started") {
        Write-Host "[$timestamp] WARNING: $site is $state - Attempting restart..."
        Start-Website -Name $site
        
        # Log to file
        Add-Content -Path "C:\Scripts\monitor.log" -Value "[$timestamp] Restarted $site"
    } else {
        Write-Host "[$timestamp] OK: $site is running"
    }
}

# Test API endpoint
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "[$timestamp] OK: API is responding"
    }
} catch {
    Write-Host "[$timestamp] ERROR: API not responding - $_"
    Restart-Website -Name "API-Backend"
}
```

### Step 30: Schedule Monitoring Task

```powershell
# Create scheduled task to run every 5 minutes
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
  -Argument "-File C:\Scripts\monitor-execsummary.ps1"

$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) `
  -RepetitionInterval (New-TimeSpan -Minutes 5) `
  -RepetitionDuration ([TimeSpan]::MaxValue)

$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" `
  -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName "Monitor Executive Summary" `
  -Action $action -Trigger $trigger -Principal $principal `
  -Description "Monitors and restarts Executive Summary sites if needed"
```

---

## Troubleshooting

### Common Issues

#### Issue: White screen on frontend
**Symptoms:** Browser shows blank page  
**Solutions:**
1. Check `web.config` exists in the site's root folder
2. Verify URL Rewrite module is installed
3. Check browser console (F12) for JavaScript errors
4. Ensure all files copied correctly (especially `index.html`)

#### Issue: 404 errors on page refresh
**Symptoms:** Works on first load, 404 when refreshing  
**Solutions:**
1. Verify URL Rewrite module is installed
2. Check `web.config` has the React Routes rewrite rule
3. Restart the site in IIS Manager

#### Issue: Backend API not responding
**Symptoms:** 502, 503, or connection refused errors  
**Solutions:**
1. Check Node.js is installed: `node --version`
2. Verify iisnode is installed and handler is configured
3. Check iisnode logs: `C:\inetpub\wwwroot\api\iisnode\`
4. Test Node.js directly:
   ```powershell
   cd C:\inetpub\wwwroot\api
   node server.js
   # Should start without errors
   ```
5. Check Application Pool is running (set to "No Managed Code")

#### Issue: CORS errors in browser
**Symptoms:** "Access to fetch... has been blocked by CORS policy"  
**Solutions:**
1. Verify CORS configuration in `server.js` includes your frontend URLs
2. Check that URLs match exactly (http vs https, trailing slash, etc.)
3. Restart API-Backend site after changing CORS settings

#### Issue: iisnode not loading
**Symptoms:** "Handler 'iisnode' has a bad module"  
**Solutions:**
1. Reinstall Visual C++ Redistributable
2. Reinstall iisnode
3. Verify handler in `web.config`:
   ```xml
   <add name="iisnode" path="server.js" verb="*" modules="iisnode" />
   ```

#### Issue: File upload permissions
**Symptoms:** Uploads fail with 403 or 500 errors  
**Solutions:**
```powershell
# Grant IIS write permissions
icacls "C:\inetpub\wwwroot\api\uploads" /grant "IIS_IUSRS:(OI)(CI)M"
icacls "C:\inetpub\wwwroot\api\data" /grant "IIS_IUSRS:(OI)(CI)M"
```

#### Issue: Port already in use
**Symptoms:** "The process cannot access the file because it is being used"  
**Solutions:**
```powershell
# Find what's using the port
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID 1234 /F
```

---

## Maintenance Tasks

### Updating the Application

**To update frontends:**
1. Build new version on dev machine
2. Copy new `dist` folder to server
3. Overwrite existing files in `C:\inetpub\wwwroot\executive-summary\`
4. No restart needed (static files)

**To update backend:**
1. Copy new backend files to server
2. Overwrite files in `C:\inetpub\wwwroot\api\`
3. In IIS Manager, restart "API-Backend" site

### Viewing Logs

```powershell
# IIS access logs
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\*.log" -Tail 100

# Node.js stdout logs
Get-Content "C:\inetpub\wwwroot\api\iisnode\*.stdout.txt" -Tail 100

# Node.js error logs
Get-Content "C:\inetpub\wwwroot\api\iisnode\*.stderr.txt" -Tail 100
```

### Backup Strategy

```powershell
# Create backup script: C:\Scripts\backup-execsummary.ps1
$date = Get-Date -Format "yyyy-MM-dd"
$backupPath = "C:\Backups\ExecSummary\$date"

New-Item -ItemType Directory -Path $backupPath -Force

# Backup websites
Copy-Item "C:\inetpub\wwwroot\executive-summary" `
  -Destination "$backupPath\frontend" -Recurse

Copy-Item "C:\inetpub\wwwroot\cms-admin" `
  -Destination "$backupPath\cms-admin" -Recurse

Copy-Item "C:\inetpub\wwwroot\api" `
  -Destination "$backupPath\api" -Recurse

# Backup IIS configuration
& "$env:windir\system32\inetsrv\appcmd.exe" add backup "$date"

Write-Host "Backup completed: $backupPath"
```

Schedule this script to run daily via Task Scheduler.

---

## Security Recommendations

### Step 31: Harden Security

1. **Remove default IIS website:**
   - IIS Manager → Sites → "Default Web Site" → Remove

2. **Disable directory browsing:**
   - Select each site → Double-click "Directory Browsing" → Disable

3. **Configure request filtering:**
   - Select site → "Request Filtering"
   - Add file extension denials: `.env`, `.config`, `.log`

4. **Enable HTTPS redirect:**
   - Install URL Rewrite rule to force HTTPS
   - Edit `web.config` to add redirect rule

5. **Update Windows regularly:**
   ```powershell
   # Check for updates
   Install-Module PSWindowsUpdate
   Get-WindowsUpdate
   Install-WindowsUpdate -AcceptAll -AutoReboot
   ```

6. **Configure Windows Firewall to allow only necessary ports**

7. **Use strong authentication for CMS admin** (implement in code)

---

## Quick Reference

### Service URLs (Default Configuration)

| Service | URL | Port |
|---------|-----|------|
| Main Frontend | `http://YOUR-SERVER-IP` | 80 |
| CMS Admin | `http://YOUR-SERVER-IP:8080` | 8080 |
| Backend API | `http://YOUR-SERVER-IP:3001` | 3001 |

### Important File Locations

| Component | Path |
|-----------|------|
| Main Frontend | `C:\inetpub\wwwroot\executive-summary\` |
| CMS Admin | `C:\inetpub\wwwroot\cms-admin\` |
| Backend API | `C:\inetpub\wwwroot\api\` |
| IIS Logs | `C:\inetpub\logs\LogFiles\` |
| Node.js Logs | `C:\inetpub\wwwroot\api\iisnode\` |
| Backend Data | `C:\inetpub\wwwroot\api\data\` |
| Uploaded Files | `C:\inetpub\wwwroot\api\uploads\` |

### PowerShell Quick Commands

```powershell
# Restart all sites
Restart-Website -Name "Executive-Summary"
Restart-Website -Name "CMS-Admin"
Restart-Website -Name "API-Backend"

# Check site status
Get-Website | Select-Object Name, State, Bindings

# View recent errors
Get-Content "C:\inetpub\wwwroot\api\iisnode\*.stderr.txt" -Tail 50

# Test API health
Invoke-WebRequest -Uri "http://localhost:3001/health"
```

---

**Document Version:** 1.0  
**Last Updated:** November 17, 2025  
**Branch:** v1-deploy-to-azure  
**Supported OS:** Windows Server 2016, Windows Server 2019, Windows Server 2022
