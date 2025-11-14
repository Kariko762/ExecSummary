# CMS Admin - System Overview

**Last Updated:** November 14, 2025  
**Version:** 2.0 (Post Asset Library Overhaul)

---

## What is CMS Admin?

The CMS Admin is a comprehensive content management system for creating, editing, and managing executive summaries. It provides a visual interface for building templates and editing content without writing code.

**Access:** `http://localhost:5174` (development) | `/cms-admin/` (production)

---

## Core Components

### 1. Content Manager (Main Dashboard)
- **Grid View**: Card-based layout showing all summaries
- **Table View**: Professional data table with sidebar navigation (default)
- **Tag Filtering**: Filter by 6 content categories
- **Actions**: Create, Edit, Delete, Publish, Comment

### 2. Template Builder
Visual drag-and-drop template creator using 22 asset types from the Asset Library.

**Location:** `cms-admin/src/components/TemplateBuilder.tsx`

### 3. Content Editor (EditorModalV2)
Modal-based editor for creating/editing summaries using templates.

**Location:** `cms-admin/src/components/EditorModalV2.tsx`

### 4. Asset Library
Modern UI component providing live previews and examples for all 22 asset types.

**Location:** `cms-admin/src/components/AssetLibrary.tsx`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  CMS Admin Frontend (React + TypeScript + Vite)             │
│  Port: 5174                                                  │
│                                                              │
│  ┌─────────────────┐  ┌──────────────────┐                 │
│  │  App.tsx        │  │  TemplateBuilder │                 │
│  │  - Dashboard    │  │  - Visual Editor │                 │
│  │  - Grid View    │  │  - Asset Library │                 │
│  │  - Table View   │  │  - Drag & Drop   │                 │
│  │  - Tag Filter   │  └──────────────────┘                 │
│  └─────────────────┘                                         │
│                                                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │  EditorModalV2                                  │        │
│  │  - Section Editor                               │        │
│  │  - Live Preview                                 │        │
│  │  - Draft/Publish Workflow                       │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTP
┌─────────────────────────────────────────────────────────────┐
│  Backend API (Node.js + Express)                            │
│  Port: 3001                                                  │
│                                                              │
│  Endpoints:                                                  │
│  • GET/POST/PUT/DELETE /api/summaries                       │
│  • GET /api/summaries/:id                                   │
│  • GET/POST /api/templates                                  │
│  • GET /api/content-tags                                    │
│  • POST /api/upload                                         │
└─────────────────────────────────────────────────────────────┘
                          ↕ File System
┌─────────────────────────────────────────────────────────────┐
│  Data Storage (JSON Files)                                  │
│                                                              │
│  • /src/data/summaries/*.json (published summaries)         │
│  • /cms-admin/src/templates/*.json (templates)              │
│  • /backend/uploads/* (images)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Creating a New Summary

```
User clicks "+ New Summary" in CMS Admin
          ↓
Selects template from dropdown
          ↓
Backend API: GET /api/templates/:name
Returns: {success: true, template: {...}}
          ↓
Frontend extracts: data.template
          ↓
EditorModalV2 opens with template structure
          ↓
User edits sections using renderers
          ↓
Saves as Draft or Publishes
          ↓
Backend API: POST /api/summaries
Saves to: /src/data/summaries/[name].json
          ↓
Summary appears in dashboard
```

### Rendering Content

```
Data enters RenderFactory
          ↓
Factory reads _sectionName_type metadata
          ↓
Routes to appropriate renderer:
  • TextRenderer (text, textarea)
  • ListRenderer (bulletList, highlightsList)
  • ChartRenderer (pieChart, barChart, etc.)
  • NestedCardsRenderer (nestedCards)
  • StatusBoardRenderer (statusBoard)
  • TimelineRenderer (timeline)
  • ... (22 total asset types)
          ↓
Renderer displays content in View or Edit mode
```

---

## Key Features

### 1. Content Tagging System
**Added:** November 13-14, 2025

6 tag categories for organizing summaries:
- 📊 Weekly Summary
- 🧠 Executive IQ
- 🏢 Organizations
- 📈 Performance
- 📚 Knowledge Base
- 🗂️ KB Categories

**How it works:**
- Each summary has `_contentTag` metadata field
- Sidebar navigation filters by tag
- Tag badges display in Grid and Table views
- Migration script added tags to 24 existing summaries

### 2. Dual View Modes
**Added:** November 14, 2025

**Grid View (Cards):**
- 3-column card layout
- Large preview cards with hover effects
- Quick actions on hover
- Visual thumbnails

**Table View (Default):**
- Sidebar navigation with tag filtering
- Professional data table
- Columns: Name, Date, Status, % Complete, Tag, Actions
- Live/Draft badges
- Completion percentage for drafts
- Centered actions and completion columns

**Toggle:** Top-right button switches between views

### 3. Asset Library System
**Overhauled:** November 11, 2025

**Components:**
- **AssetLibrary.tsx**: Modern UI with live previews, category filtering, search
- **assetDataStore.ts**: Single source of truth for 22 asset definitions
- **assetRenderEngine.tsx**: Master orchestrator routing to pattern files
- **assetRenderEngine.css**: Design system compliant styling

**6 Pattern Files:**
1. `assetRenderText.tsx` - Text, Textarea, RichText, Quote, CodeBlock (5 assets)
2. `assetRenderLists.tsx` - HighlightsList, BulletList, ChecklistItems, ProgressBarList, KeyValueList (5 assets)
3. `assetRenderCards.tsx` - MetricCard, NestedCards, RiskCard, OutlookCard, CategoryList (5 assets)
4. `assetRenderCharts.tsx` - RadialProgress, PieChart, BarChart, LineChart (4 assets)
5. `assetRenderComplex.tsx` - StatusBoard, Timeline, TwoColumnComparison, ProblemSolutionBox (4 assets)
6. `assetRenderUtility.tsx` - Hr, Number (2 assets)

**22 Assets by Category:**
- **basic** (4): text, textarea, richText, quote
- **lists** (6): highlightsList, bulletList, checklistItems, progressBarList, keyValueList, nestedCards
- **charts** (4): metricCard, radialProgressChart, pieChart, barChart
- **complex** (4): statusBoard, timeline, twoColumnComparison, problemSolutionBox
- **rich** (3): codeBlock, hr, number
- **media** (0): placeholder category

### 4. Design System Compliance
**Implemented:** November 11, 2025

All colors use semantic CSS variables:
- `var(--brand-primary)` - Purple (#431C5B)
- `var(--brand-secondary)` - Pink (#B21A53)
- `var(--brand-tertiary)` - Navy (#1D1F48)
- `var(--accent-green)` - Success green
- `var(--accent-orange)` - Warning orange
- `var(--accent-red)` - Error red

**NO hardcoded hex values allowed** - all styling uses design system tokens.

---

## Recent Major Changes

### November 14, 2025
✅ **Table View with Sidebar Navigation**
- Professional data table as default view
- Vertical tag navigation with gradient blend
- Live/Draft status badges
- Completion percentage tracking
- Comments button (placeholder for future feature)

✅ **Content Tag Migration**
- All 24 existing summaries tagged automatically
- Migration script: `cms-admin/src/scripts/migrate-content-tags.ts`

### November 13, 2025
✅ **Content Tagging System**
- 6 tag categories added
- Backend endpoints created
- Frontend filtering implemented
- Tag badges in Grid/Table views

### November 11, 2025
✅ **Asset Library Overhaul**
- Complete replacement of AssetTypeReferenceModal
- Modern UI with live previews
- assetDataStore.ts as single source of truth
- assetRenderEngine.tsx pattern orchestration
- Design system compliance (semantic variables)

✅ **Template Loading Fix**
- Fixed corrupted data when loading Master Template
- Backend returns `{success: true, template: {...}}`
- Frontend now extracts nested `data.template` property

### November 10, 2025
✅ **KeyValueListRenderer**
- Dynamic key-value pair editor
- Add/remove pairs in edit mode
- Purple labels with expression support
- Used in MASTER template for executive details

---

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** (build tool)
- **Tailwind CSS** (styling with design system extensions)
- **Framer Motion** (animations)
- **Recharts** (data visualizations)
- **Lucide React** (icons)

### Backend
- **Node.js** with Express
- **JSON file storage** (no database)
- **Multer** (file uploads)

### Development
- **Hot Module Replacement** (instant updates)
- **TypeScript** (type safety)
- **ESLint** (code quality)

---

## Navigation

- [Asset Library System →](./asset-library-system.md)
- [Template Builder Guide →](./template-builder.md)
- [Content Editor Guide →](./content-editor.md)
- [Content Tagging System →](./content-tagging.md)
- [View Modes (Grid vs Table) →](./view-modes.md)

---

*Part of the CMS Admin Knowledge Base - November 14, 2025*
