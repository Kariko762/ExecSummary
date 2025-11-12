# Executive Summary Dashboard - Knowledge Base

**Last Updated**: November 8, 2025  
**Version**: 2.0.0

## 📚 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [CMS ContentIQ](#cms-contentiq)
5. [Design System](#design-system)
6. [Data Structure](#data-structure)
7. [API Reference](#api-reference)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Development Workflow](#development-workflow)

---

## System Overview

The Executive Summary Dashboard is a comprehensive content management and display system consisting of three main applications:

### 1. Executive Summary Dashboard (Parent App)
- **Port**: 5173
- **Purpose**: Display executive summaries, strategic initiatives, and organization performance
- **Features**: Timeline view, organization dashboards, strategic initiative tracking, dark mode, presentation mode
- **Authentication**: Optional JWT-based login

### 2. ContentIQ CMS Admin Panel
- **Port**: 5174
- **Purpose**: Content creation and management interface
- **Features**: Visual editor, draft/publish workflow, validation system, user management
- **Authentication**: Optional JWT-based login with role-based permissions

### 3. Backend API Server
- **Port**: 3001
- **Purpose**: RESTful API for data storage and authentication
- **Features**: CRUD operations, JWT authentication, file-based JSON storage
- **Stack**: Express.js, Node.js

---

## Architecture

### Frontend Stack
```
React 18 + TypeScript
├── Vite (Build Tool)
├── Tailwind CSS (Styling)
├── Framer Motion (Animations)
├── Recharts (Data Visualization)
└── React Router (Navigation)
```

### Backend Stack
```
Node.js + Express.js
├── bcryptjs (Password Hashing)
├── jsonwebtoken (JWT Authentication)
├── multer (File Upload)
├── express-validator (Validation)
└── CORS (Cross-Origin Support)
```

### Data Flow
```
User Input → CMS Admin → Backend API → JSON Files → Dashboard Display
                                            ↓
                                    Authentication Check
```

---

## Authentication System

### Overview
JWT-based authentication with bcrypt password hashing, role-based permissions, and 24-hour token expiry.

### Components

#### Backend (`backend/api/auth.js`)
- **Login Endpoint**: `POST /api/auth/login`
- **Token Verification**: `POST /api/auth/verify`
- **User Management**: CRUD operations for users (admin only)
- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Secret**: Configurable via `JWT_SECRET` environment variable

#### Frontend Auth Context (`cms-admin/src/contexts/AuthContext.tsx`)
- Auto-loads session from localStorage on mount
- Verifies token with backend on startup
- Manages login/logout operations
- Provides `useAuth()` hook for components

#### Protected Routes (`cms-admin/src/components/ProtectedRoute.tsx`)
- Wraps authenticated content
- Shows login page if auth required and not authenticated
- Shows loading state during verification

#### System Settings (`cms-admin/src/components/SystemSettingsManager.tsx`)
- Configure authentication requirements per app
- Stored in localStorage as `system-settings`
- JSON structure:
```json
{
  "authentication": {
    "parentApp": { "requireLogin": false },
    "cmsAdmin": { "requireLogin": false }
  }
}
```

### User Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Admin** | Full access: user management, settings, content editing | IT administrators, system owners |
| **Editor** | Content creation/editing, no admin features | Content creators, business analysts |
| **Viewer** | Read-only access | Stakeholders, reviewers |

### User Data Structure (`cms-admin/src/data/users.json`)
```json
{
  "users": [
    {
      "id": "1",
      "username": "admin",
      "passwordHash": "$2a$10$...",
      "email": "admin@example.com",
      "role": "admin",
      "permissions": {
        "parentApp": { "canView": true, "canEdit": false },
        "cmsAdmin": {
          "canView": true,
          "canEdit": true,
          "canManageUsers": true,
          "canManageSettings": true
        }
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastLogin": "2025-11-08T22:09:57.214Z",
      "isActive": true
    }
  ],
  "roles": { ... }
}
```

### Password Management

**Generate Password Hash:**
```bash
cd backend
node generate-password.js your-password
# Copy the output hash to users.json
```

**Change Default Password:**
1. Generate new hash: `node generate-password.js newpassword123`
2. Copy hash to `cms-admin/src/data/users.json`
3. Update the admin user's `passwordHash` field
4. Restart backend server

### Security Best Practices

1. **Change Default Credentials**: Update admin password immediately
2. **Use HTTPS in Production**: Protect tokens in transit
3. **Rotate JWT Secret**: Use environment variable `JWT_SECRET` in production
4. **Enable Authentication**: Toggle "Require Login" in System Settings
5. **Review Permissions**: Assign minimal necessary permissions per user
6. **Monitor Activity**: Check `lastLogin` timestamps in users.json

---

## CMS ContentIQ

### Asset Library System (November 11, 2025)

**Purpose:** Modern asset preview and selection interface for Template Builder

**Components:**
- **AssetLibrary.tsx** (`/cms-admin/src/components/AssetLibrary.tsx`)
  - Live preview component with interactive editing
  - Category filtering: All, basic, lists, complex, rich, charts, media
  - Search functionality across asset names and descriptions
  - Multi-column preview toggle (1, 2, or 3 columns)
  - Real-time data editing with JSON textarea
  - Collapsible code viewer for schema and exampleData

- **assetDataStore.ts** (`/cms-admin/src/schemas/assetDataStore.ts`)
  - Single source of truth for 22 asset definitions
  - Each asset contains: id, name, type, description, category, schema, exampleData
  - Categories: basic (4), lists (6), charts (4), complex (4), rich (3), media (0)

- **assetRenderEngine.tsx** (`/cms-admin/src/renderers/assetRenderEngine.tsx`)
  - Master orchestrator routing to 6 specialized pattern files
  - Applies design system wrapper classes
  - Handles mode switching (display vs edit)

- **assetRenderEngine.css** (`/cms-admin/src/renderers/assetRenderEngine.css`)
  - Complete styling using semantic design system variables
  - NO hardcoded hex values allowed
  - Uses `var(--brand-primary)`, `var(--accent-green)`, etc.

**Pattern Files (6 total):**
1. `assetRenderText.tsx` - Text, Textarea, RichText, Quote, CodeBlock (5 assets)
2. `assetRenderLists.tsx` - HighlightsList, BulletList, ChecklistItems, ProgressBarList, KeyValueList (5 assets)
3. `assetRenderCards.tsx` - MetricCard, NestedCards, RiskCard, OutlookCard, CategoryList (5 assets)
4. `assetRenderCharts.tsx` - RadialProgress, PieChart, BarChart, LineChart (4 assets)
5. `assetRenderComplex.tsx` - StatusBoard, Timeline, TwoColumnComparison, ProblemSolutionBox (4 assets)
6. `assetRenderUtility.tsx` - Hr, Number (2 assets)

**Design Principles:**
- Pattern files contain ONLY logic/structure (no styling)
- Master engine applies design system classes
- All colors use semantic CSS variables
- Single source of truth (assetDataStore)

### Editor Workflow

1. **Create New Summary**
   - Click "New Summary" button
   - Choose "Create from Template" or "Clone Existing"
   - All new content starts as "Draft" status

2. **Edit Content**
   - Click "Edit" on any summary tile
   - Modal editor opens with section navigation
   - Auto-save as you edit
   - Mark sections complete via checkboxes

3. **Validation**
   - Click "Validate" tab in draft mode
   - 12-section comprehensive validation
   - Auto-scroll to active check
   - Expand/collapse detailed results

4. **Publish**
   - Protection enabled by default (shield icon)
   - Must have 100% completion to publish (unless disabled)
   - Confirmation dialog for going live
   - Status changes from "Draft" to "Live"

### Protection System

**Weighted Completion Calculation:**
```javascript
Sections with weights (1-10):
- issuesAndBlockers: 10 (highest)
- departments: 9
- initiatives: 8
- activityMetrics: 8
- outlook: 7
- risks: 6
- highlights: 5
- weeklyFocus: 4
- topAssets: 3
- keyActivityInsights: 2
- keyMetrics: 1 (lowest)

Completion % = (Completed Weight / Total Weight) × 100
```

**Visual Indicators:**
- **Donut Chart**: Green (100%), Yellow (50-99%), Red (0-49%)
- **Status Badges**: "LIVE" (green), "DRAFT" (yellow)
- **Protection Badge**: Shield icon with completion %
- **Warning Banner**: Red alert when editing published content

### Section Management

**Enable/Disable Sections:**
```json
{
  "_enabled_highlights": true,
  "_enabled_risks": false,  // Section hidden from preview
  "_completed_highlights": true,
  "_completed_risks": false
}
```

**Section States:**
- ✅ **Enabled + Completed**: Counts toward completion, visible in preview
- ⚠️ **Enabled + Not Completed**: Counts toward completion, may be empty
- 🔵 **Disabled**: Skipped in validation, hidden from preview
- 🔒 **Locked**: Cannot edit (future feature)

### Validation System

**12 Validation Sections:**
1. **Header Metadata**: ID format, quarter/year, date validation
2. **Highlights**: Array validation, content checks
3. **Key Metrics**: Type checking for revenue, growth, customers, satisfaction
4. **Activity Metrics**: Demo Studio nested structure
5. **Key Activity Insights**: Banking and Capital Markets data
6. **Top Assets**: Asset counts and categories
7. **Weekly Focus**: Array of focus items
8. **Departments**: Performance ranges (0-100), achievements
9. **Initiatives**: Status values, progress validation
10. **Risks**: Severity levels, mitigation strategies
11. **Issues & Blockers**: Status, impact, owner fields
12. **Outlook**: String content validation

**Validation UI:**
- Two-column layout: Results (30%) | JSON (70%)
- Auto-scroll to active check
- Expand/collapse for detailed results
- Color coding: Green (pass), Yellow (warning), Red (error), Blue (disabled)

---

## Design System

### Centralized Design Tokens

Managed via `StyleSchemeManagerV2` component and stored in localStorage as `design-system-v2`.

#### Typography (`src/design-system/typography.ts`)
```typescript
{
  header: 'text-2xl font-bold text-gray-900 dark:text-gray-100',
  title: 'text-xl font-semibold text-gray-800 dark:text-gray-200',
  subtitle: 'text-lg font-medium text-gray-700 dark:text-gray-300',
  label: 'text-sm font-medium text-gray-600 dark:text-gray-400',
  fieldLabel: 'text-xs font-roobert-light text-fis-eggplant dark:text-fis-raspberry',
  body: 'text-base text-gray-700 dark:text-gray-300',
  // ... more styles
}
```

#### Colors (`src/design-system/colors.ts`)
```typescript
Brand Colors:
- Primary (Eggplant): #6B1B5E
- Secondary (Raspberry): #B21A53
- Tertiary: #8B2F5E

Accent Colors:
- Blue: #3B82F6
- Green: #10B981
- Yellow: #F59E0B
- Red: #EF4444

Semantic Colors:
- Info: #3B82F6
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
```

#### Spacing (`src/design-system/spacing.ts`)
```typescript
Container:
- Main: p-6
- Modal: p-8
- Card: p-6
- Tight: p-4

Section:
- Gap: space-y-6
- Header: mb-4
- Content: space-y-4

Component:
- Gap: space-y-3
- Tight: space-y-2
```

### Accessing Design System

**In React Components:**
```typescript
import { typography, colors, spacing } from '@/design-system';

// Use in className
<div className={typography.header}>Header Text</div>
<div className={spacing.container.main}>Content</div>
```

**In Templates:**
```json
{
  "rendering": {
    "typography": "header",
    "color": "brand.primary"
  }
}
```

### Customization

1. Open CMS Admin → Menu → Design System
2. Edit colors, typography, or spacing
3. Preview changes in real-time
4. Export/import design system as JSON
5. Click "Save Changes" to persist

---

## Data Structure

### Executive Summary Schema

**Complete Structure:**
```json
{
  "id": "week-nov-08-2024",
  "quarter": "Q4",
  "year": 2024,
  "date": "2024-11-08",
  "title": "Week of November 8, 2024",
  "status": "draft",
  "protectionEnabled": true,
  
  "highlights": ["Achievement 1", "Achievement 2"],
  
  "keyMetrics": {
    "revenue": 1230000,       // NUMBER not string
    "growth": 48,             // NUMBER not string
    "customers": 263,         // NUMBER not string
    "satisfaction": 92        // NUMBER not string
  },
  
  "activityMetrics": {
    "demoStudio": {
      "demosRegistered": 42,
      "demosLinkedToDeals": 28,
      "wonACV": 2100000,
      "conversionRate": 67
    }
  },
  
  "keyActivityInsights": {
    "banking": { "hours": 156, "percentage": 45 },
    "capitalMarkets": { "hours": 112, "percentage": 32 }
  },
  
  "topAssets": [
    { "name": "Asset Name", "count": 15, "category": "Demo" }
  ],
  
  "weeklyFocus": [
    "Focus item 1",
    "Focus item 2"
  ],
  
  "departments": [
    {
      "name": "Banking North America",
      "performance": 92,
      "trend": "up",
      "achievements": [
        "Achievement 1",
        "Achievement 2"
      ]
    }
  ],
  
  "initiatives": [
    {
      "title": "Initiative Name",
      "status": "In Progress",
      "progress": 65,
      "owner": "John Doe"
    }
  ],
  
  "risks": [
    {
      "risk": "Risk description",
      "severity": "high",
      "mitigation": "Mitigation strategy"
    }
  ],
  
  "issuesAndBlockers": [
    {
      "issue": "Issue description",
      "status": "Active",
      "impact": "High",
      "owner": "Jane Smith"
    }
  ],
  
  "outlook": "Future outlook text...",
  
  "_enabled_highlights": true,
  "_enabled_risks": true,
  "_completed_highlights": true,
  "_completed_risks": false
}
```

**Important Data Type Rules:**
1. All `keyMetrics` values MUST be numbers (not strings)
2. Dates in ISO format: `YYYY-MM-DD`
3. Status must be: `"draft"` or `"published"`
4. Department performance: 0-100 range
5. Initiative progress: 0-100 range
6. Risk severity: `"low"`, `"medium"`, `"high"`, `"critical"`

---

## API Reference

### Authentication Endpoints

#### POST /api/auth/login
**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "role": "admin",
    "permissions": { ... }
  },
  "expiresIn": "24h"
}
```

#### POST /api/auth/verify
**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": { ... }
}
```

### Content Endpoints

#### GET /api/summaries
**Response:**
```json
{
  "summaries": [ ... ]
}
```

#### POST /api/summaries
**Request:**
```json
{
  "id": "week-nov-08-2024",
  "quarter": "Q4",
  "year": 2024,
  ...
}
```

#### PUT /api/summaries/:id
**Request:**
```json
{
  "status": "published",
  "highlights": [ ... ],
  ...
}
```

#### DELETE /api/summaries/:id
**Response:**
```json
{
  "message": "Summary deleted successfully"
}
```

### Error Responses

**401 Unauthorized:**
```json
{
  "error": "Invalid credentials"
}
```

**403 Forbidden:**
```json
{
  "error": "Account is disabled"
}
```

**404 Not Found:**
```json
{
  "error": "Summary not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Deployment

### Production Checklist

**Security:**
- [ ] Change default admin password
- [ ] Set `JWT_SECRET` environment variable
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domains
- [ ] Enable authentication in System Settings
- [ ] Review user permissions

**Backend:**
- [ ] Set `NODE_ENV=production`
- [ ] Configure process manager (PM2, systemd)
- [ ] Set up log rotation
- [ ] Configure backup strategy for JSON files
- [ ] Test all API endpoints

**Frontend:**
- [ ] Build with `npm run build`
- [ ] Configure web server (nginx, IIS)
- [ ] Set up CDN (optional)
- [ ] Configure SSL/TLS
- [ ] Test all routes and features

**Monitoring:**
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure backup monitoring

### Environment Variables

```bash
# Backend (.env)
PORT=3001
NODE_ENV=production
JWT_SECRET=your-super-secret-production-key-here
CORS_ORIGIN=https://yourdomain.com
```

### PM2 Configuration

```json
{
  "apps": [{
    "name": "execsummary-backend",
    "script": "server.js",
    "cwd": "./backend",
    "env": {
      "NODE_ENV": "production",
      "PORT": 3001
    }
  }]
}
```

---

## Troubleshooting

### Authentication Issues

**Problem**: Login fails with "Invalid credentials"
- **Solution**: Check password hash in users.json matches generated hash
- **Verify**: Backend is running on port 3001
- **Check**: Browser console for network errors

**Problem**: Token expired error
- **Solution**: Tokens expire after 24 hours - log in again
- **Prevent**: Implement token refresh (future enhancement)

**Problem**: Login page not showing
- **Solution**: Check System Settings → Authentication is enabled
- **Verify**: `system-settings` exists in localStorage

### CMS Issues

**Problem**: Cannot publish (protection blocking)
- **Solution**: Mark all sections complete OR disable protection
- **Check**: Donut chart shows 100% completion
- **Verify**: All required sections have data

**Problem**: Validation errors
- **Solution**: Review validation tab, expand failed checks
- **Common**: keyMetrics values must be numbers, not strings
- **Fix**: Edit JSON directly or use form fields

**Problem**: Section not appearing in preview
- **Solution**: Check `_enabled_[section]` flag is true
- **Verify**: Section is not disabled in CMS

### Backend Issues

**Problem**: Backend won't start
- **Solution**: Check port 3001 not in use
- **Verify**: `npm install` completed successfully
- **Check**: Node.js version 18+

**Problem**: API returns 500 error
- **Solution**: Check backend console for error details
- **Verify**: JSON files are valid (not corrupted)
- **Fix**: Restore from backup if needed

### Build Issues

**Problem**: TypeScript errors during build
- **Solution**: Run `npm run lint` to see all errors
- **Fix**: Update imports, fix type errors
- **Check**: tsconfig.json is correct

**Problem**: Vite build fails
- **Solution**: Clear `node_modules` and reinstall
- **Command**: `rm -rf node_modules && npm install`
- **Try**: `npm run build -- --debug`

---

## Development Workflow

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Update types in `src/types/`
   - Add components in `src/components/`
   - Update backend API if needed

3. **Test Locally**
   ```bash
   npm run dev          # Frontend
   cd backend && npm run dev  # Backend
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: description of feature"
   git push origin feature/your-feature-name
   ```

### Code Standards

**TypeScript:**
- Use explicit types, avoid `any`
- Export types from `types/` directory
- Use interfaces for objects, types for unions

**React:**
- Functional components with hooks
- Use `const` for component declarations
- Extract reusable logic into custom hooks

**Styling:**
- Use Tailwind utility classes
- Reference design system tokens
- Support dark mode with `dark:` variants

**Commits:**
- Format: `type: description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat: add user management UI`

### Testing Checklist

- [ ] All TypeScript compiles without errors
- [ ] Components render correctly in light/dark mode
- [ ] Authentication flows work as expected
- [ ] API endpoints return correct data
- [ ] Validation catches errors appropriately
- [ ] Mobile/tablet responsive design
- [ ] Accessibility (keyboard navigation, screen readers)

---

## Quick Reference

### Default Ports
- Parent App: 5173
- CMS Admin: 5174
- Backend: 3001

### Default Credentials
- Username: `admin`
- Password: `admin123`

### Important Directories
- User Data: `cms-admin/src/data/users.json`
- Summaries: `src/data/summaries/`
- Design System: `src/design-system/`
- Backend API: `backend/api/`

### Key Commands
```bash
# Development
npm run dev                  # Start parent app
cd cms-admin && npm run dev  # Start CMS
cd backend && npm run dev    # Start backend

# Production
npm run build                # Build parent app
cd cms-admin && npm run build  # Build CMS
cd backend && npm start      # Start backend (prod)

# Utilities
node backend/generate-password.js password  # Generate hash
git status                   # Check git status
git log --oneline -10       # Recent commits
```

### Support Resources
- Main README: `README.md`
- Auth Guide: `LOGIN_SETUP_GUIDE.md`
- Auth API Docs: `backend/README_AUTH.md`
- Deployment Guide: `DEPLOYMENT_GUIDE.md`

---

**End of Knowledge Base**
