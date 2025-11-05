# Deployment Guide 🚀

Complete guide for deploying the Executive Summary Dashboard to various environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Building for Production](#building-for-production)
- [Deployment Options](#deployment-options)
  - [Windows IIS](#windows-iis)
  - [Apache (Linux)](#apache-linux)
  - [Nginx](#nginx)
  - [AWS S3 + CloudFront](#aws-s3--cloudfront)
  - [Azure Static Web Apps](#azure-static-web-apps)
  - [Local Network Server](#local-network-server)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- Git access to the repository
- Access to your deployment server/platform
- Admin/deployment credentials

---

## Building for Production

### 1. Clone the Repository
```bash
git clone https://github.com/Kariko762/ExecSummary.git
cd ExecSummary
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build the Application
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

**Build Output:**
```
dist/
├── index.html           # Main HTML file
├── assets/
│   ├── index-[hash].js  # Bundled JavaScript (~875 KB)
│   └── index-[hash].css # Bundled CSS (~43 KB)
└── RoobertFont/         # Font files
```

### 4. Test the Production Build (Optional)
```bash
npm run preview
```
Visit `http://localhost:4173` to verify the build works correctly.

---

## Deployment Options

### Windows IIS

Perfect for corporate environments running Windows Server.

#### Step 1: Prepare IIS
1. Open **Server Manager**
2. Add **Web Server (IIS)** role if not installed
3. Open **IIS Manager**

#### Step 2: Create Website
1. Right-click **Sites** → **Add Website**
2. Set **Site name**: `ExecutiveSummary`
3. Set **Physical path**: `C:\inetpub\wwwroot\executive-summary`
4. Set **Port**: `80` (or your preferred port)
5. Click **OK**

#### Step 3: Copy Build Files
```powershell
# Copy dist contents to IIS directory
Copy-Item -Path ".\dist\*" -Destination "C:\inetpub\wwwroot\executive-summary" -Recurse -Force
```

#### Step 4: Configure URL Rewriting (for React Router)
1. Install **URL Rewrite Module** from Microsoft
2. Create `web.config` in your site root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
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
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="font/woff" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>
  </system.webServer>
</configuration>
```

#### Step 5: Set Permissions
```powershell
# Grant IIS_IUSRS read permissions
icacls "C:\inetpub\wwwroot\executive-summary" /grant "IIS_IUSRS:(OI)(CI)R" /T
```

#### Step 6: Browse
Navigate to `http://localhost` or `http://your-server-ip`

---

### Apache (Linux)

For Linux servers running Apache.

#### Step 1: Install Apache
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install apache2

# RHEL/CentOS
sudo yum install httpd
sudo systemctl start httpd
sudo systemctl enable httpd
```

#### Step 2: Copy Build Files
```bash
# Create directory
sudo mkdir -p /var/www/executive-summary

# Copy dist contents
sudo cp -r dist/* /var/www/executive-summary/

# Set ownership
sudo chown -R www-data:www-data /var/www/executive-summary
```

#### Step 3: Create Virtual Host
Create `/etc/apache2/sites-available/executive-summary.conf`:

```apache
<VirtualHost *:80>
    ServerName executive-summary.yourdomain.com
    DocumentRoot /var/www/executive-summary

    <Directory /var/www/executive-summary>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # React Router support
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/executive-summary-error.log
    CustomLog ${APACHE_LOG_DIR}/executive-summary-access.log combined
</VirtualHost>
```

#### Step 4: Enable Site & Rewrite Module
```bash
# Enable mod_rewrite
sudo a2enmod rewrite

# Enable site
sudo a2ensite executive-summary.conf

# Reload Apache
sudo systemctl reload apache2
```

---

### Nginx

Modern, high-performance web server.

#### Step 1: Install Nginx
```bash
# Ubuntu/Debian
sudo apt install nginx

# RHEL/CentOS
sudo yum install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Step 2: Copy Build Files
```bash
sudo mkdir -p /var/www/executive-summary
sudo cp -r dist/* /var/www/executive-summary/
sudo chown -R nginx:nginx /var/www/executive-summary
```

#### Step 3: Configure Nginx
Create `/etc/nginx/sites-available/executive-summary`:

```nginx
server {
    listen 80;
    server_name executive-summary.yourdomain.com;
    root /var/www/executive-summary;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Step 4: Enable Site
```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/executive-summary /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### AWS S3 + CloudFront

For cloud deployment with CDN.

#### Step 1: Create S3 Bucket
```bash
# Using AWS CLI
aws s3 mb s3://executive-summary-prod

# Enable static website hosting
aws s3 website s3://executive-summary-prod \
  --index-document index.html \
  --error-document index.html
```

#### Step 2: Configure Bucket Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::executive-summary-prod/*"
    }
  ]
}
```

#### Step 3: Upload Build Files
```bash
# Sync dist folder to S3
aws s3 sync dist/ s3://executive-summary-prod/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# Upload index.html with no-cache
aws s3 cp dist/index.html s3://executive-summary-prod/ \
  --cache-control "no-cache"
```

#### Step 4: Create CloudFront Distribution
1. Go to CloudFront console
2. Create distribution with S3 bucket as origin
3. Set **Default Root Object**: `index.html`
4. Create custom error response: 404 → /index.html (for React Router)

---

### Azure Static Web Apps

Simple deployment with built-in CI/CD.

#### Step 1: Create Static Web App
```bash
# Install Azure CLI
az login

# Create resource group
az group create --name ExecutiveSummary --location eastus

# Create static web app
az staticwebapp create \
  --name executive-summary \
  --resource-group ExecutiveSummary \
  --source https://github.com/Kariko762/ExecSummary \
  --location eastus \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

#### Step 2: Configure Build
Azure will create a GitHub Actions workflow automatically. Verify `.github/workflows/azure-static-web-apps-*.yml` includes:

```yaml
app_build_command: 'npm run build'
output_location: 'dist'
```

#### Step 3: Deploy
Push to main branch - GitHub Actions will automatically build and deploy.

---

### Local Network Server

For internal corporate deployment without internet access.

#### Option 1: Simple HTTP Server (Python)
```bash
# Navigate to dist folder
cd dist

# Python 3
python -m http.server 8080

# Access at http://localhost:8080
```

#### Option 2: Node.js Serve
```bash
# Install serve globally
npm install -g serve

# Serve from dist folder
serve -s dist -p 8080
```

#### Option 3: Docker Container
Create `Dockerfile`:
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:
```bash
docker build -t executive-summary .
docker run -d -p 8080:80 executive-summary
```

---

## Post-Deployment

### 1. Verify Functionality
- ✅ Homepage loads correctly
- ✅ All routes work (Summary Timeline, Organizations, Strategic Initiatives)
- ✅ Dark/Light mode toggle works
- ✅ Charts and visualizations render
- ✅ Presentation mode functions
- ✅ Search functionality works

### 2. Performance Testing
```bash
# Use Lighthouse for performance audit
npm install -g lighthouse
lighthouse http://your-deployment-url --view
```

**Target Metrics:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### 3. Browser Testing
Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

### 4. Set Up Monitoring (Optional)
```bash
# Add analytics or monitoring
# Configure error tracking (e.g., Sentry)
# Set up uptime monitoring
```

---

## Troubleshooting

### Issue: Blank page or 404 errors on refresh

**Cause:** Server not configured for React Router (SPA routing)

**Solution:** 
- **IIS:** Add `web.config` with URL rewrite rules (see IIS section)
- **Apache:** Enable `mod_rewrite` and add `.htaccess`
- **Nginx:** Use `try_files $uri $uri/ /index.html;`

### Issue: Fonts not loading

**Cause:** MIME type not configured or CORS issue

**Solution:**
- Add MIME types for `.woff` and `.woff2`
- Ensure fonts are copied from `dist/RoobertFont/`
- Check browser console for 404 errors

### Issue: Charts not rendering

**Cause:** JavaScript errors or bundle not loading

**Solution:**
- Check browser console for errors
- Verify all files from `dist/assets/` are deployed
- Clear browser cache
- Check server Content-Type headers for `.js` files

### Issue: Dark mode not persisting

**Cause:** LocalStorage not accessible

**Solution:**
- Verify cookies/localStorage not blocked
- Check browser privacy settings
- Test in incognito/private mode

### Issue: Large bundle size / slow loading

**Solution:**
- Enable Gzip compression on server
- Use CDN (CloudFront, Cloudflare)
- Enable browser caching for static assets
- Consider lazy loading routes

### Issue: HTTPS mixed content warnings

**Cause:** Loading HTTP resources on HTTPS page

**Solution:**
- Ensure all assets use relative URLs
- Check for hardcoded HTTP URLs
- Enable HTTPS on your server

---

## SSL/HTTPS Setup (Recommended)

### Let's Encrypt (Free SSL)

For Apache/Nginx on Linux:
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d executive-summary.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Automated Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Build
echo "📦 Building application..."
npm install
npm run build

# Deploy to server (example for SCP)
echo "📤 Uploading to server..."
scp -r dist/* user@server:/var/www/executive-summary/

# Restart web server
echo "🔄 Restarting web server..."
ssh user@server "sudo systemctl reload nginx"

echo "✅ Deployment complete!"
```

Make executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Rebuild
npm install
npm run build

# Redeploy (based on your deployment method)
```

### Backup Strategy
- Back up `dist/` folder before each deployment
- Keep previous 3 versions for rollback
- Back up data files in `src/data/` directory

### Log Monitoring
```bash
# Apache
sudo tail -f /var/log/apache2/executive-summary-error.log

# Nginx
sudo tail -f /var/log/nginx/error.log

# IIS
Check Event Viewer → Windows Logs → Application
```

---

## Security Checklist

- ✅ HTTPS enabled
- ✅ Security headers configured (X-Frame-Options, CSP, etc.)
- ✅ Directory listing disabled
- ✅ Unnecessary ports closed
- ✅ Server software up to date
- ✅ Regular security audits
- ✅ Access logs monitored

---

## Support

For deployment issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review server logs for errors
3. Test the production build locally with `npm run preview`
4. Contact your IT/DevOps team for infrastructure support

---

**Deployment Complete! 🎉**

Your Executive Summary Dashboard is now live and ready for use!
