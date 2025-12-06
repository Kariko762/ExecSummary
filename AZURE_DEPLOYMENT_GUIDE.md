# Azure Deployment Guide - Executive Summary Platform
**UI-Based Instructions (No CLI Required)**

## Overview
This guide walks you through deploying the Executive Summary platform to Microsoft Azure using the Azure Portal web interface and Azure Storage Explorer. No command-line tools required.

---

## Prerequisites

### Required Accounts & Tools
- [ ] Active Azure subscription (j.hanscomb@outlook.com)
- [ ] Azure Storage Explorer installed ✅
- [ ] Node.js 18+ installed
- [ ] Web browser (Chrome, Edge, or Firefox)

### Install Azure Storage Explorer
Already installed! Launch it from your Start menu.

---

## Phase 1: Azure Portal Setup

### Step 1: Login to Azure Portal
1. Open your web browser
2. Navigate to: **https://portal.azure.com**
3. Sign in with your Microsoft account: **j.hanscomb@outlook.com**
4. Wait for the Azure Portal dashboard to load
5. You should see the main dashboard with "Azure services" section

**Screenshot Location:** You'll see "Create a resource", "Resource groups", "All resources", etc.

### Step 2: Create Resource Group
1. In the Azure Portal, click **"Resource groups"** from the home page
2. Click **"+ Create"** button at the top
3. Fill in the details:
   - **Subscription:** Select your subscription from dropdown
   - **Resource group name:** `rg-executive-summary`
   - **Region:** `East US` (or your preferred region)
4. Click **"Review + create"** at the bottom
5. Click **"Create"**
6. Wait for "Deployment complete" notification (5-10 seconds)

**What you created:** A container to hold all your Azure resources together.

---

## Phase 2: Storage Setup (for Static Websites)

### Step 3: Create Storage Account for Main Frontend

#### 3A: Create Storage Account
1. Click **"Create a resource"** (top-left or home page)
2. Search for **"Storage account"** in the search box
3. Click **"Storage account"** from results
4. Click **"Create"**
5. Fill in the **Basics** tab:
   - **Subscription:** Your subscription
   - **Resource group:** `rg-executive-summary` (select from dropdown)
   - **Storage account name:** `execsummaryfrontend` (must be lowercase, no spaces/hyphens)
   - **Region:** `East US` (same as resource group)
   - **Performance:** Standard
   - **Redundancy:** `Locally-redundant storage (LRS)`
6. Click **"Review"** at the bottom
7. Click **"Create"**
8. Wait for deployment (30-60 seconds)
9. Click **"Go to resource"** when deployment completes

#### 3B: Enable Static Website Hosting
1. In the storage account page, scroll down the left menu
2. Under **"Data management"**, click **"Static website"**
3. Toggle **"Static website"** to **Enabled**
4. Set **Index document name:** `index.html`
5. Set **Error document path:** `index.html`
6. Click **"Save"** at the top
7. **IMPORTANT:** Copy the **"Primary endpoint"** URL that appears
   - Example: `https://execsummaryfrontend.z13.web.core.windows.net/`
   - Save this URL - you'll need it later!

**What you created:** A web hosting space for your main executive summary website.

### Step 4: Create Storage Account for CMS Admin Frontend

#### 4A: Create Second Storage Account
1. Click **"Home"** at the top breadcrumb
2. Click **"Create a resource"**
3. Search for **"Storage account"**
4. Click **"Create"**
5. Fill in the **Basics** tab:
   - **Subscription:** Your subscription
   - **Resource group:** `rg-executive-summary`
   - **Storage account name:** `execsummarycms` (lowercase, no spaces)
   - **Region:** `East US`
   - **Performance:** Standard
   - **Redundancy:** `Locally-redundant storage (LRS)`
6. Click **"Review"**
7. Click **"Create"**
8. Wait for deployment (30-60 seconds)
9. Click **"Go to resource"**

#### 4B: Enable Static Website Hosting
1. In the left menu, click **"Static website"** (under Data management)
2. Toggle to **Enabled**
3. Set **Index document name:** `index.html`
4. Set **Error document path:** `index.html`
5. Click **"Save"**
6. **IMPORTANT:** Copy the **"Primary endpoint"** URL
   - Example: `https://execsummarycms.z13.web.core.windows.net/`
   - Save this URL!

**What you created:** A web hosting space for your CMS admin panel.

---

## Phase 3: Backend API Setup (App Service)

### Step 5: Create App Service Plan

1. Click **"Home"** at top
2. Click **"Create a resource"**
3. Search for **"App Service Plan"**
4. Click **"App Service Plan"** from results
5. Click **"Create"**
6. Fill in the details:
   - **Subscription:** Your subscription
   - **Resource group:** `rg-executive-summary`
   - **Name:** `asp-executive-summary`
   - **Operating System:** Linux
   - **Region:** `East US`
   - **Pricing Tier:** Click "Explore pricing plans"
     - Select **"Basic B1"** (costs ~$13/month)
     - Click **"Select"**
7. Click **"Review + create"**
8. Click **"Create"**
9. Wait for deployment (30-60 seconds)

**What you created:** A hosting plan that defines the compute resources for your backend API.

### Step 6: Create Web App for Backend API

1. Click **"Home"**
2. Click **"Create a resource"**
3. Search for **"Web App"**
4. Click **"Web App"**
5. Click **"Create"**
6. Fill in the **Basics** tab:
   - **Subscription:** Your subscription
   - **Resource group:** `rg-executive-summary`
   - **Name:** `execsummary-api` (must be globally unique)
     - This creates URL: `https://execsummary-api.azurewebsites.net`
   - **Publish:** Code
   - **Runtime stack:** `Node 18 LTS`
   - **Operating System:** Linux
   - **Region:** `East US`
   - **App Service Plan:** `asp-executive-summary` (should auto-select)
7. Click **"Review + create"**
8. Click **"Create"**
9. Wait for deployment (30-60 seconds)
10. Click **"Go to resource"**
11. **IMPORTANT:** Copy the **"Default domain"** from the overview page
    - Example: `https://execsummary-api.azurewebsites.net`
    - Save this URL!

---

## Phase 4: CORS Configuration (Enable Frontend-Backend Communication)

### Step 7: Configure CORS for Backend API

1. In Azure Portal, navigate to your **Web App** (`execsummary-api`)
   - Go to **Home** → **Resource groups** → `rg-executive-summary` → `execsummary-api`
2. In the left menu, scroll down to **API** section
3. Click **"CORS"**
4. In the **"Allowed Origins"** section, add the following URLs (one per line):
   - Your main frontend URL: `https://execsummaryfrontend.z13.web.core.windows.net`
   - Your CMS frontend URL: `https://execsummarycms.z13.web.core.windows.net`
   - For local testing: `http://localhost:5173`
   - For local testing: `http://localhost:5174`
5. Click **"Save"** at the top
6. Wait for "Successfully updated CORS rules" notification

**What this does:** Allows your frontend websites to communicate with your backend API.

---

## Phase 5: Configure Backend Settings

### Step 8: Set Environment Variables

1. Still in the **Web App** (`execsummary-api`) page
2. In the left menu, scroll to **Settings**
3. Click **"Environment variables"**
4. Click **"+ Add"** to add application settings:
   - **Name:** `NODE_ENV` | **Value:** `production`
   - **Name:** `PORT` | **Value:** `8080`
5. Click **"Apply"** at the bottom
6. Click **"Confirm"** when prompted
7. Wait for settings to save

**What this does:** Configures your Node.js backend to run in production mode.

---

## Phase 6: Build Your Applications Locally

### Step 9: Build Main Frontend

1. Open PowerShell on your computer
2. Navigate to your project:
   ```powershell
   cd C:\ExecSummary
   ```
3. Install dependencies (if not already done):
   ```powershell
   npm install
   ```
4. Update the API URL in your code:
   - Open `C:\ExecSummary\src\App.tsx` in your editor
   - Find the line: `const API_URL = 'http://localhost:3001';`
   - Change it to: `const API_URL = 'https://execsummary-api.azurewebsites.net';`
   - Save the file
5. Build the application:
   ```powershell
   npm run build
   ```
6. Wait for build to complete (creates `dist` folder)

**What you created:** Production-ready files in `C:\ExecSummary\dist\`

### Step 10: Build CMS Admin Frontend

1. In PowerShell, navigate to CMS admin:
   ```powershell
   cd C:\ExecSummary\cms-admin
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Update the API URL:
   - Open `C:\ExecSummary\cms-admin\src\App.tsx`
   - Find: `const API_URL = 'http://localhost:3001';`
   - Change to: `const API_URL = 'https://execsummary-api.azurewebsites.net';`
   - Save the file
4. Build the application:
   ```powershell
   npm run build
   ```
5. Wait for build to complete (creates `cms-admin\dist` folder)

**What you created:** Production-ready files in `C:\ExecSummary\cms-admin\dist\`

---

## Phase 7: Deploy Frontends Using Azure Storage Explorer

### Step 11: Deploy Main Frontend

1. **Open Azure Storage Explorer** from your Start menu
2. In the left panel, click **"Add Account"** (plug icon) if not already signed in
3. Select **"Add an Azure Account"**
4. Click **"Sign in"**, use your Azure credentials
5. Once connected, expand the tree:
   - **Your Subscription**
   - **Storage Accounts**
   - **execsummaryfrontend**
   - **Blob Containers**
6. Right-click on **"$web"** container
7. Select **"Upload Files..."** or **"Upload Folder..."**
8. Click **"Select folder"**
9. Navigate to: `C:\ExecSummary\dist`
10. Select the **entire contents** of the `dist` folder (not the folder itself)
11. Make sure **"Upload to folder"** is empty (root of $web)
12. Click **"Upload"**
13. Wait for upload to complete (progress bar at bottom)
14. Verify files appear in the **$web** container

**What you deployed:** Your main executive summary website is now live!

### Step 12: Deploy CMS Admin Frontend

1. Still in **Azure Storage Explorer**
2. In the left panel, expand:
   - **Storage Accounts**
   - **execsummarycms**
   - **Blob Containers**
3. Right-click on **"$web"** container
4. Select **"Upload Files..."** or **"Upload Folder..."**
5. Click **"Select folder"**
6. Navigate to: `C:\ExecSummary\cms-admin\dist`
7. Select the **entire contents** of the `dist` folder
8. Make sure **"Upload to folder"** is empty
9. Click **"Upload"**
10. Wait for upload to complete
11. Verify files appear in the **$web** container

**What you deployed:** Your CMS admin panel is now live!

---

## Phase 8: Deploy Backend Using Azure Portal

### Step 13: Prepare Backend for Deployment

1. In PowerShell, navigate to backend:
   ```powershell
   cd C:\ExecSummary\backend
   ```
2. Install production dependencies:
   ```powershell
   npm install --production
   ```
3. Create a ZIP file of the backend folder:
   ```powershell
   Compress-Archive -Path .\* -DestinationPath ..\backend-deploy.zip -Force
   ```

**What you created:** `C:\ExecSummary\backend-deploy.zip` (deployment package)

### Step 14: Upload Backend to Azure

1. Go back to **Azure Portal** in your browser
2. Navigate to your **Web App** (`execsummary-api`)
3. In the left menu, scroll to **Deployment**
4. Click **"Deployment Center"**
5. Under **"Settings"** tab:
   - **Source:** Select **"Local Git"** or **"ZIP Deploy"**
6. **For ZIP Deploy:**
   - Scroll down and click **"Advanced Tools"** in left menu
   - Click **"Go →"** (opens Kudu console in new tab)
   - In the top menu, click **"Tools"** → **"Zip Push Deploy"**
   - Drag your `backend-deploy.zip` file into the window
   - Wait for deployment (you'll see files extracting)
7. **Alternative method (easier):**
   - In the left menu, click **"Advanced Tools"**
   - Click **"Go →"**
   - In Kudu console, click **"Debug console"** → **"CMD"**
   - Navigate to: `site/wwwroot`
   - Delete existing files (if any)
   - Drag `backend-deploy.zip` into the file area
   - Kudu will auto-extract it

**What you deployed:** Your Node.js backend API is now running on Azure!

### Step 15: Restart Web App

1. Go back to the **Web App** overview page in Azure Portal
2. Click **"Restart"** button at the top
3. Click **"Yes"** to confirm
4. Wait for restart (30-60 seconds)

---

## Phase 9: Testing & Verification

### Step 16: Get Your Application URLs

1. **Main Frontend URL:**
   - In Azure Portal, go to **Storage accounts**
   - Click **execsummaryfrontend**
   - Click **"Static website"** in left menu
   - Copy the **"Primary endpoint"** URL
   - Example: `https://execsummaryfrontend.z13.web.core.windows.net/`

2. **CMS Admin URL:**
   - Go to **Storage accounts**
   - Click **execsummarycms**
   - Click **"Static website"**
   - Copy the **"Primary endpoint"** URL
   - Example: `https://execsummarycms.z13.web.core.windows.net/`

3. **Backend API URL:**
   - Go to **App Services**
   - Click **execsummary-api**
   - Copy the **"Default domain"** from overview
   - Example: `https://execsummary-api.azurewebsites.net`

### Step 17: Test Your Deployment

#### Test Checklist:

**Backend API Test:**
- [ ] Open browser to: `https://execsummary-api.azurewebsites.net/health`
- [ ] Should see: `{"status":"ok"}` or similar health check response
- [ ] If you get an error, wait 2-3 minutes for backend to fully start

**Main Frontend Test:**
- [ ] Open browser to your main frontend URL
- [ ] Page loads without errors
- [ ] No console errors (F12 → Console tab)
- [ ] Data loads from backend (check network tab F12)

**CMS Admin Test:**
- [ ] Open browser to your CMS admin URL
- [ ] Login page appears (if authentication enabled)
- [ ] Can navigate through interface
- [ ] Can load/edit templates

**Common Issues:**
- **White screen:** Check browser console (F12) for errors
- **CORS errors:** Verify CORS settings in Step 7
- **API not responding:** Wait 3-5 minutes after deployment, then restart Web App
- **404 errors on refresh:** Already configured with 404-document = index.html ✓

---

## Phase 10: Monitoring & Logging (Optional)

### Step 18: Enable Application Insights

1. In Azure Portal, click **"Create a resource"**
2. Search for **"Application Insights"**
3. Click **"Create"**
4. Fill in:
   - **Subscription:** Your subscription
   - **Resource group:** `rg-executive-summary`
   - **Name:** `execsummary-insights`
   - **Region:** `East US`
   - **Resource Mode:** `Workspace-based`
5. Click **"Review + create"**
6. Click **"Create"**
7. Once created, click **"Go to resource"**
8. Copy the **"Instrumentation Key"** from the overview page

#### Link to Web App:
1. Go to your **Web App** (`execsummary-api`)
2. Left menu → **Settings** → **Environment variables**
3. Click **"+ Add"**
   - **Name:** `APPINSIGHTS_INSTRUMENTATIONKEY`
   - **Value:** Paste your instrumentation key
4. Click **"Apply"**
5. Restart the Web App

**What this enables:** Real-time monitoring, performance metrics, error tracking.

### Step 19: View Backend Logs

1. In Azure Portal, go to **App Services** → **execsummary-api**
2. In left menu, click **"Log stream"** (under Monitoring)
3. You'll see live logs from your Node.js application
4. Keep this open while testing to see errors in real-time

**Alternative - Download Logs:**
1. In the **Web App**, click **"Advanced Tools"**
2. Click **"Go →"**
3. Click **"Tools"** → **"Download support package"**
4. Opens a ZIP with all log files

---

## Phase 11: Optional Enhancements

### Step 20: Enable HTTPS-Only (Recommended)

1. Go to your **Web App** (`execsummary-api`)
2. Left menu → **Settings** → **Configuration**
3. Click on **"General settings"** tab
4. Toggle **"HTTPS Only"** to **On**
5. Click **"Save"**

**What this does:** Redirects all HTTP traffic to HTTPS for security.

### Step 21: Configure Custom Domain (Optional)

**For Storage Accounts (Frontends):**
1. Purchase a domain (e.g., GoDaddy, Namecheap)
2. In Azure Portal, go to **Storage account** → **execsummaryfrontend**
3. Left menu → **Settings** → **Custom domain**
4. Enter your domain: `www.yourcompany.com`
5. Add CNAME record in your domain registrar:
   - **Host:** `www`
   - **Points to:** `execsummaryfrontend.z13.web.core.windows.net`
6. Click **"Save"** in Azure Portal

**For App Service (Backend):**
1. Go to **App Service** → **execsummary-api**
2. Left menu → **Settings** → **Custom domains**
3. Click **"+ Add custom domain"**
4. Enter: `api.yourcompany.com`
5. Add CNAME in your domain registrar:
   - **Host:** `api`
   - **Points to:** `execsummary-api.azurewebsites.net`
6. Click **"Validate"** → **"Add"**

---

## Cost Estimates (Approximate Monthly)

| Service | Tier | Estimated Cost |
|---------|------|----------------|
| Storage Account (Frontend) | Standard LRS | $1-5 |
| Storage Account (CMS) | Standard LRS | $1-5 |
| App Service Plan (B1) | Basic | $13 |
| Application Insights (Optional) | Pay-as-you-go | $0-5 |
| **Total** | | **~$15-25/month** |

**Cost Monitoring:**
1. In Azure Portal, click **"Cost Management + Billing"**
2. Click **"Cost analysis"** to see current spending
3. Set up budget alerts to avoid surprises

**Notes:**
- Costs increase with traffic and storage usage
- First 5GB of bandwidth is free per month
- Consider B2 tier (~$25/month) for production workloads
- Add CDN for better global performance (~$10-20/month)

---

## Troubleshooting

### Common Issues

#### Issue: White screen or blank page
**Symptoms:** Frontend loads but shows nothing  
**Solutions:**
1. Open browser console (F12) → Check for errors
2. Verify `index.html` exists in $web container
3. Check that API_URL was updated in App.tsx before build
4. Clear browser cache (Ctrl+Shift+Delete)

#### Issue: CORS errors in browser console
**Symptoms:** "Access to fetch... has been blocked by CORS policy"  
**Solutions:**
1. Go to Web App → **CORS** settings
2. Verify your frontend URLs are listed EXACTLY (including https://)
3. Make sure there's no trailing slash difference
4. Save and wait 1-2 minutes for changes to apply

#### Issue: Backend not responding
**Symptoms:** 502/503 errors when visiting backend URL  
**Solutions:**
1. Wait 3-5 minutes after deployment (cold start)
2. Check **Log stream** for errors
3. Verify `package.json` has correct start script
4. Restart the Web App
5. Check that PORT=8080 is set in Environment variables

#### Issue: Upload fails in Azure Storage Explorer
**Symptoms:** Upload times out or fails  
**Solutions:**
1. Check your internet connection
2. Try uploading files in smaller batches
3. Right-click $web container → **Refresh** and try again
4. Verify you have write permissions (should if you're the subscription owner)

#### Issue: File uploads not working in application
**Symptoms:** Users can't upload files through the app  
**Solutions:**
1. Check Web App → **Configuration** → file size limits
2. Verify backend has write permissions to storage
3. Check logs for specific error messages

---

## Next Steps After Deployment

### Immediate Actions:
- [ ] Bookmark your three application URLs
- [ ] Test all major features (create content, upload files, etc.)
- [ ] Set up cost alerts in Azure Portal
- [ ] Document any custom configurations

### Recommended Enhancements:
1. **CDN Integration** - Add Azure CDN for faster global access
2. **Custom Domain** - Use your own domain name (see Step 21)
3. **Automated Backups** - Schedule storage account backups
4. **CI/CD Pipeline** - Automate deployment with GitHub Actions
5. **Scaling** - Configure auto-scaling rules for traffic spikes
6. **Security** - Add Azure AD authentication for CMS admin
7. **Monitoring Alerts** - Set up alerts for errors/downtime

---

## Support Resources

- [Azure Portal](https://portal.azure.com)
- [Azure Storage Explorer Documentation](https://docs.microsoft.com/azure/vs-azure-tools-storage-manage-with-storage-explorer)
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service)
- [Azure Storage Static Website](https://docs.microsoft.com/azure/storage/blobs/storage-blob-static-website)

---

## Quick Reference - Your URLs

After deployment, save these URLs:

| Service | URL | Purpose |
|---------|-----|---------|
| Main Frontend | `https://execsummaryfrontend.z13.web.core.windows.net/` | Public executive summary site |
| CMS Admin | `https://execsummarycms.z13.web.core.windows.net/` | Content management panel |
| Backend API | `https://execsummary-api.azurewebsites.net` | REST API server |
| Azure Portal | `https://portal.azure.com` | Manage all resources |

### Quick Actions in Azure Portal:

**View all resources:**
- Home → Resource groups → `rg-executive-summary`

**Update frontend:**
- Use Azure Storage Explorer → Upload to $web container

**Update backend:**
- App Service → Advanced Tools → Kudu → Upload ZIP

**View backend logs:**
- App Service → Log stream

**Check costs:**
- Cost Management + Billing → Cost analysis

**Delete everything (if needed):**
- Resource groups → `rg-executive-summary` → Delete resource group

---

**Document Version:** 1.0  
**Last Updated:** November 16, 2025  
**Branch:** v1-deploy-to-azure
