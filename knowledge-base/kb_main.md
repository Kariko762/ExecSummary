# Executive Summary Platform - Knowledge Base

**Last Updated:** November 14, 2025  
**Version:** 2.0 - CMS Admin Knowledge Base

---

## 🎯 Welcome

This is the **official knowledge base** for the Executive Summary Platform CMS Admin system. All documentation has been rebuilt from scratch to reflect the November 2025 platform overhaul.

**For:** Content creators, CMS administrators, and developers working with the CMS Admin interface.

---

## 📚 CMS Admin Documentation

### Getting Started
- **[System Overview](./cms-admin/overview.md)** - Architecture, components, and features
- **[Asset Library System](./cms-admin/asset-library-system.md)** - Complete guide to the 22 asset types
- **[Content Tagging](./cms-admin/content-tagging.md)** - Tag system and filtering
- **[View Modes](./cms-admin/view-modes.md)** - Grid vs Table views

### Core Features
- **Template Builder** (coming soon) - Visual template creation
- **Content Editor** (coming soon) - EditorModalV2 guide
- **Publishing Workflow** (coming soon) - Draft to Live process

### Reference
- **Asset Definitions** (coming soon) - All 22 assets with examples
- **API Endpoints** (coming soon) - Backend API documentation
- **Design System** (coming soon) - Color variables and styling

---

## 🏗️ Quick Start

### I Want To...

#### Browse Summaries
1. Open CMS Admin at `http://localhost:5174`
2. Use **Table View** (default) with sidebar navigation
3. Click tags to filter by category
4. Or switch to **Grid View** for visual cards

→ [Full Guide: View Modes](./cms-admin/view-modes.md)

#### Create a New Summary
1. Click "+ New Summary"
2. Select a template or start blank
3. Edit sections in EditorModalV2
4. Save as Draft or Publish

→ Full Guide: Content Editor (coming soon)

#### Build a Custom Template
1. Open Template Builder
2. Browse **Asset Library** (22 asset types)
3. Drag assets to canvas
4. Configure sections and save

→ [Full Guide: Asset Library System](./cms-admin/asset-library-system.md)

#### Filter by Tag
1. Open CMS Admin
2. In **Table View**: Click tag button in sidebar
3. In **Grid View**: Use horizontal filter bar
4. Click "All Content" to reset

→ [Full Guide: Content Tagging](./cms-admin/content-tagging.md)

---

## 🔍 What's New (November 2025)

### November 14, 2025
✅ **Table View with Sidebar Navigation**
- Professional data table as default view
- Vertical tag filtering with gradient blend
- Live/Draft status badges
- Completion percentage tracking

✅ **Documentation Restructure**
- Complete KB rebuild from scratch
- CMS Admin focused documentation
- Legacy docs moved to `/legacy-md/`

### November 13, 2025
✅ **Content Tagging System**
- 6 tag categories (Weekly Summary, Executive IQ, Organizations, Performance, Knowledge Base, KB Categories)
- Backend endpoints for tag management
- Real-time filtering in both Grid and Table views
- Migration script tagged all 24 existing summaries

### November 11, 2025
✅ **Asset Library Overhaul**
- Complete replacement of AssetTypeReferenceModal
- Modern UI with live previews and category filtering
- **assetDataStore.ts** - Single source of truth for 22 assets
- **assetRenderEngine.tsx** - Master orchestrator
- 6 pattern files for specialized rendering
- Design system compliance (semantic CSS variables)

### November 10, 2025
✅ **KeyValueListRenderer**
- Dynamic key-value pair editor
- Add/remove pairs in edit mode
- Expression support with purple labels

---

## 🗂️ Knowledge Base Structure

```
knowledge-base/
├── kb_main.md (you are here)
│
├── cms-admin/
│   ├── overview.md                    # CMS Admin system overview
│   ├── asset-library-system.md        # Asset Library deep dive
│   ├── content-tagging.md             # Tagging system guide
│   ├── view-modes.md                  # Grid vs Table views
│   ├── template-builder.md            # (coming soon)
│   ├── content-editor.md              # (coming soon)
│   └── publishing-workflow.md         # (coming soon)
│
├── reference/
│   ├── asset-definitions.md           # (coming soon)
│   ├── api-endpoints.md               # (coming soon)
│   └── design-system.md               # (coming soon)
│
├── developer/ (legacy - needs update)
│   ├── adding-new-assets.md
│   ├── chart-system.md
│   ├── multi-column-layout.md
│   └── organizations-integration.md
│
└── user-guides/ (legacy - needs update)
    ├── engine-assets-preview.md
    ├── engine-assets-preview-update.md
    └── engine-assets-preview-summary.md
```

---

## 🚀 System Architecture

### Two-App System

```
┌─────────────────────────────────────────────────────────────┐
│  CMS ADMIN (Content Management)                             │
│  Port: 5174                                                  │
│  • Template Builder - Create/edit templates                 │
│  • Content Editor - Create/edit summaries                   │
│  • Asset Library - 22 asset types with live previews       │
│  • Dual Views - Grid (cards) | Table (data table)          │
│  • Tag Filtering - 6 content categories                     │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP API
┌─────────────────────────────────────────────────────────────┐
│  BACKEND API (Node.js + Express)                            │
│  Port: 3001                                                  │
│  • Summaries: GET/POST/PUT/DELETE /api/summaries           │
│  • Templates: GET/POST /api/templates                       │
│  • Tags: GET /api/content-tags                             │
│  • Uploads: POST /api/upload                                │
└─────────────────────────────────────────────────────────────┘
                          ↕ File System
┌─────────────────────────────────────────────────────────────┐
│  DATA STORAGE (JSON Files)                                  │
│  • /src/data/summaries/*.json (published)                   │
│  • /cms-admin/src/templates/*.json (templates)              │
│  • /backend/uploads/* (images)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 Key Concepts

### 1. Asset Library System
**Single source of truth** for all content types (text, charts, lists, etc.)

**Components:**
- **AssetLibrary.tsx** - Modern UI with live previews
- **assetDataStore.ts** - 22 asset definitions
- **assetRenderEngine.tsx** - Master orchestrator
- 6 pattern files (Text, Lists, Cards, Charts, Complex, Utility)

→ [Full Guide: Asset Library System](./cms-admin/asset-library-system.md)

### 2. Content Tags
**6 predefined categories** for organizing summaries:
- 📊 Weekly Summary
- 🧠 Executive IQ
- 🏢 Organizations
- 📈 Performance
- 📚 Knowledge Base
- 🗂️ KB Categories

→ [Full Guide: Content Tagging](./cms-admin/content-tagging.md)

### 3. View Modes
**Grid View** - Visual card layout with glassmorphism  
**Table View** - Professional data table with sidebar navigation (default)

→ [Full Guide: View Modes](./cms-admin/view-modes.md)

### 4. Design System Compliance
All colors use **semantic CSS variables**:
- `var(--brand-primary)` - Purple
- `var(--brand-secondary)` - Pink
- `var(--accent-green)` - Success
- `var(--accent-orange)` - Warning
- `var(--accent-red)` - Error

**NO hardcoded hex values allowed** in Asset Library or renderers.

---

## 🔗 External Documentation

### Active Core Docs (Still in Root)
- **[README.md](../README.md)** - Project overview and setup
- **[HANDOVER.md](../HANDOVER.md)** - AI context document

### Backend Docs
- **[backend/README.md](../backend/README.md)** - Backend API documentation
- **[backend/README_AUTH.md](../backend/README_AUTH.md)** - Authentication system

### Legacy Documentation
All legacy MD files have been moved to **`/legacy-md/`** for historical reference:
- Old guides, deployment docs, and changelogs
- Pre-November 2025 architecture documents
- Superseded by this Knowledge Base

→ [Legacy Documentation Index](../legacy-md/LEGACY_INDEX.md)

---

## 🧭 Navigation

### For Content Creators
1. Start: [System Overview](./cms-admin/overview.md)
2. Learn: [Content Tagging](./cms-admin/content-tagging.md)
3. Explore: [View Modes](./cms-admin/view-modes.md)

### For Template Builders
1. Start: [Asset Library System](./cms-admin/asset-library-system.md)
2. Build: Template Builder Guide (coming soon)
3. Reference: Asset Definitions (coming soon)

### For Developers
1. Start: [System Overview](./cms-admin/overview.md)
2. Deep Dive: [Asset Library System](./cms-admin/asset-library-system.md)
3. Extend: Adding New Assets (legacy doc - needs update)

---

## 🆘 Getting Help

### Common Tasks
- **Create Summary**: Content Editor guide (coming soon)
- **Filter Content**: [Content Tagging](./cms-admin/content-tagging.md)
- **Build Template**: [Asset Library System](./cms-admin/asset-library-system.md)
- **Switch Views**: [View Modes](./cms-admin/view-modes.md)

### Troubleshooting
- Check browser console (F12) for errors
- Verify backend is running: `http://localhost:3001/api/summaries`
- Review TypeScript errors in VS Code
- Check network tab for API failures

---

## 📅 Roadmap

### Phase 1: CMS Admin KB (CURRENT)
- ✅ System Overview
- ✅ Asset Library System
- ✅ Content Tagging
- ✅ View Modes
- ⏳ Template Builder Guide
- ⏳ Content Editor Guide
- ⏳ Publishing Workflow

### Phase 2: Reference Docs
- ⏳ Asset Definitions (all 22 assets)
- ⏳ API Endpoints
- ⏳ Design System
- ⏳ Metadata Schema

### Phase 3: Developer Docs
- ⏳ Update legacy developer guides
- ⏳ Adding new assets guide
- ⏳ Chart system update
- ⏳ Renderer architecture

### Phase 4: Frontend Viewer KB
- ⏳ Main frontend documentation
- ⏳ Public viewer guides
- ⏳ Expression syntax
- ⏳ Customization guide

---

## 📝 Contributing

When adding new features to CMS Admin:
1. Update relevant KB documentation
2. Add examples to Asset Library if new asset type
3. Update this main KB index if new doc created
4. Test in both Grid and Table views
5. Ensure design system compliance

---

**🏠 Home**: You are at the Knowledge Base home  
**📊 CMS Admin**: [System Overview](./cms-admin/overview.md)  
**🔖 Legacy Docs**: [Legacy Index](../legacy-md/LEGACY_INDEX.md)

---

*CMS Admin Knowledge Base - Rebuilt November 14, 2025*
