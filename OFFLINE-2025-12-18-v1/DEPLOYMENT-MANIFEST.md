# Deployment Manifest
**Build Date:** December 18, 2025  
**Version:** OFFLINE-2025-12-18-v1  
**Total Size:** ~132 MB

## 📦 Package Contents

### 1. Frontend Application (`/frontend`)
- **Type:** Static React build
- **Entry:** index.html
- **Assets:** Bundled CSS, JS, fonts, images
- **Features:**
  - Executive Summary viewer
  - Timeline visualization with note labels
  - Hero grid layouts
  - Content modal with 22 asset renderers
  - Dark/light mode toggle
  - Expression Engine support
  - Responsive design

### 2. CMS Admin Interface (`/cms-admin`)
- **Type:** Static React build
- **Entry:** index.html
- **Assets:** Bundled CSS, JS, fonts
- **Features:**
  - Template Builder (25+ templates)
  - Asset Library (22 asset types)
  - Timeline Notes Manager
  - Design System Injector
  - Hero Grid Builder
  - Real-time preview engine
  - JSON export/import

### 3. Backend Server (`/backend`)
- **Type:** Node.js Express server
- **Entry:** server.js
- **Port:** 3001
- **Dependencies:** Listed in package.json (auto-installed on first run)

#### API Endpoints:
- `/api/templates` - Template CRUD operations
- `/api/timeline-notes` - Notes management
- `/api/tags` - Tag system
- `/api/design-system` - Design tokens
- `/api/content` - Content management

#### Data Storage (`/backend/data`):
- `summaries.json` - Executive summaries
- `timeline-notes.json` - Timeline notes with categories
- `content-tags.json` - 14 operational tag categories
- `tags.json` - Legacy tag storage
- `announcements.json` - System announcements
- `design-system.json` - Design tokens and theme settings

### 4. Launcher Scripts
- **START-SERVER.bat** - Windows batch launcher
- **START-SERVER.ps1** - PowerShell launcher with enhanced features
- **SETUP-GUIDE.html** - Visual setup guide

## 🎯 New Features in This Build

### Timeline Note Labels (Dec 18, 2025)
**What's New:**
- Custom note labels can now be added above timeline milestones
- Supports plain text and Expression Engine syntax
- Visual styling: Purple rounded labels with arrow pointers
- Configurable per milestone in Asset Library

**Technical Implementation:**
- Added `note` field to timeline schema
- Expression rendering with `renderWithExpressions()`
- CSS styling in `assetRenderEngine.css`
- Updated in both frontend and CMS renderers

**Files Modified:**
- `/src/renderers/assetRenderComplex.tsx`
- `/src/assetRenderEngine.css`
- `/cms-admin/src/schemas/assetDataStore.ts`
- `/cms-admin/src/renderers/assetRenderComplex.tsx`
- `/cms-admin/src/renderers/assetRenderEngine.css`

### Asset Library Updates
- Updated description: "22 assets with live previews & note labels"
- Timeline asset example data showcases new note feature
- All assets support expression rendering

### Tag System Overhaul
**Replaced 6 generic categories with 14 operational tags:**

**Infrastructure (3):**
- Environment Health
- Data Operations
- Platform Integration

**Revenue Impact (4):**
- High-Value Deals
- POC/Trial Support
- Sales Enablement
- Expansion Ops

**Operational (3):**
- Process Automation
- Capacity Planning
- Documentation

**Strategic (4):**
- Revenue at Risk
- Critical Blocker
- Strategic Milestone
- Product Intelligence

**Files Updated:**
- `/backend/data/content-tags.json` - Complete tag replacement
- `/backend/data/timeline-notes.json` - Re-categorized existing notes
- `/cms-admin/src/components/TimelineNotesManager.tsx` - Updated UI
- `/cms-admin/src/components/AiWeeklySummaryModal.tsx` - Backward compatibility

## 🔧 Installation Instructions

### First-Time Setup:
1. Extract package to desired location
2. Run `START-SERVER.bat` (Windows) or `START-SERVER.ps1` (PowerShell)
3. Server will auto-install dependencies on first run
4. Access applications at http://localhost:3001

### Manual Installation:
```powershell
cd backend
npm install
npm start
```

## 📊 Asset Library - 22 Assets

### Basic (4):
- Text
- Textarea
- Rich Text
- Quote

### Lists (6):
- Highlights List
- Bullet List
- Checklist Items
- Progress Bar List
- Key-Value List
- Nested Cards

### Charts (4):
- Metric Card
- Radial Progress
- Pie Chart
- Bar Chart

### Complex (4):
- Status Board
- Timeline (with note labels!)
- Two Column Comparison
- Problem Solution Box

### Rich (3):
- Code Block
- HR
- Number

### Media (0):
- Placeholder category for future expansion

## 🎨 Design System

**Color Palette:**
- Primary: FIS Eggplant (`#622181`)
- Secondary: FIS Raspberry (`#C72765`)
- Accent: Blue, Green, Yellow, Red
- Semantic: Success, Warning, Error, Info

**Typography:**
- Primary: Roobert (Light, Regular, Medium, SemiBold, Bold, Heavy)
- Monospace: System fonts for code

**Spacing:**
- xs: 0.25rem, sm: 0.5rem, md: 1rem, lg: 1.5rem, xl: 2rem

## 🔒 Security Notes

- **No Authentication Required** - Fully offline, single-user system
- **Data Storage** - All data in local JSON files
- **No External Connections** - 100% offline capability
- **CORS Enabled** - For local development

## 📝 Backup Recommendations

**Critical Folders to Backup:**
- `/backend/data` - All user content
- `/backend/uploads` - Uploaded assets
- Templates stored in JSON format

**Backup Frequency:** After significant content changes

## 🚀 Performance

- **Frontend Build:** ~2.3 MB (gzipped: ~600KB)
- **CMS Admin Build:** ~3.4 MB (gzipped: ~900KB)
- **Backend:** ~130 MB (includes node_modules)
- **Startup Time:** ~2-3 seconds
- **Memory Usage:** ~100-150 MB

## 🔄 Version History

### v1 (December 18, 2025)
- ✅ Timeline note labels feature
- ✅ Asset Library updates
- ✅ Tag system overhaul (14 operational categories)
- ✅ Expression Engine in timeline notes
- ✅ Backward compatibility for legacy tags
- ✅ Updated CMS navigation descriptions
- ✅ Complete offline deployment

## 📞 Support

For technical issues:
1. Check README.md for troubleshooting
2. Review console logs in browser (F12)
3. Check backend terminal for errors
4. Verify port 3001 is available

## 🎯 Quick Test Checklist

After deployment, verify:
- [ ] Frontend loads at http://localhost:3001
- [ ] CMS Admin loads at http://localhost:3001/cms-admin
- [ ] Asset Library shows 22 assets
- [ ] Timeline asset displays note labels
- [ ] Notes Manager shows new categories
- [ ] Expression Engine renders icons
- [ ] Dark/light mode toggle works

---
**Package built on: December 18, 2025**  
**Platform: Node.js + React + Express**  
**Status: Production Ready** ✅
