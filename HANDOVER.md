# 🤝 AI Handover Document

**Last Updated:** November 11, 2025  
**Current Phase:** Asset Library Implementation & Rendering Fixes

---

## Project Status

### ✅ Production-Ready Systems
- **Template Builder** - Visual template creation (LOCKED)
- **RenderEngine** - 23 asset types with shared renderers (LOCKED)
- **Backend API** - Express server for summaries/templates (STABLE)
- **KeyValueListRenderer** - New renderer completed Nov 10 (LOCKED)
- **Central Notifications** - Unified toast system (STABLE)

### 🔄 Currently Working
- **Asset Library** - Modern replacement for AssetTypeReferenceModal with live previews
- **Asset Render Engine** - Pattern-based rendering system with 22 assets across 6 pattern files
- **Rendering Fixes** - Systematic bug fixes for asset display issues

### 🐛 Known Issues (Pending Nov 12)
- Progress Bar List needs redesign (multiple tasks with individual bars)
- Pie Chart colors need primary palette mapping
- Bar Chart colors and legend labels need work
- Timeline display needs verification
- Two-Column Comparison purpose unclear

---

## Change Control Policy

**⚠️ MANDATORY PRE-APPROVAL PROCESS**

Before making ANY code changes, AI MUST:

1. **STOP and present change request** with:
   - Files to Modify (with reasons)
   - Systems Impacted
   - Connected Components
   - Risk Level (LOW/MEDIUM/HIGH)

2. **WAIT FOR USER APPROVAL** - Do not proceed until confirmed

3. **STICK TO APPROVED FILES ONLY** - No scope creep

4. **REQUEST NEW APPROVAL** for additional changes beyond scope

### Locked Components (No modifications without explicit approval)
- Template Builder (`/cms-admin/src/components/TemplateBuilder.tsx`)
- Engine Assets Preview (`/cms-admin/src/components/EngineAssetsPreview.tsx`)
- JSON Schema (`/src/types/schema.ts`)
- KeyValueListRenderer (`/src/renderers/KeyValueListRenderer.tsx`)
- RenderFactory (`/src/renderers/RenderFactory.tsx`)
- All Template JSON files (`/cms-admin/src/templates/*.json`)

---

## Architecture Overview

### Two-App System

```
┌─────────────────────────────────────────────────────────────┐
│  MAIN APP (Public Viewer)                                   │
│  Port: 5173 (dev) | Dist: /dist/                           │
│  • Displays published executive summaries                   │
│  • Read-only, no editing features                          │
│  • Uses shared RenderEngine from /src/renderers/           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CMS ADMIN (Content Management)                             │
│  Port: 5174 (dev) | Dist: /cms-admin/dist/                 │
│  • Template Builder - Create/edit templates                 │
│  • Summary Editor - Create/edit summaries via EditorModalV2│
│  • Uses COPY of renderers from /cms-admin/src/renderers/   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  BACKEND API (Node.js + Express)                            │
│  Port: 3001 | Entry: /backend/server.js                    │
│  • GET/POST/PUT/DELETE /api/summaries                       │
│  • GET/POST /api/templates                                  │
│  • POST /api/upload (images)                                │
│  • File storage: JSON files + uploads/                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Creating New Summary:**
1. User clicks "+ New Summary" in CMS Admin
2. Selects template from dropdown (loaded from `/cms-admin/src/templates/*.json`)
3. Backend API returns: `{success: true, template: {...}}`
4. Frontend extracts `data.template` (FIXED Nov 11)
5. EditorModalV2 opens with template data
6. User edits sections, saves as draft or publishes
7. Saved to `/src/data/summaries/*.json`

**Rendering Content:**
1. Data enters RenderFactory
2. Factory checks `_sectionName_type` metadata
3. Routes to appropriate renderer (TextRenderer, ChartRenderer, etc.)
4. Renderer displays content based on mode (view/edit)
5. Same renderers used in both apps (main + cms-admin copies)

---

## Recent Fixes (November 11, 2025)

### Asset Library System (NEW - Nov 11)
**Feature:** Complete replacement for AssetTypeReferenceModal with modern UI  
**Components Created:**
- `AssetLibrary.tsx` - Live preview component with category filtering, search, multi-column toggle
- `assetDataStore.ts` - Single source of truth for 22 asset definitions
- `assetRenderEngine.tsx` - Master orchestrator routing to 6 pattern files
- `assetRenderEngine.css` - Complete styling using semantic design system variables
- 6 Pattern Files: `assetRenderText.tsx`, `assetRenderLists.tsx`, `assetRenderCards.tsx`, `assetRenderCharts.tsx`, `assetRenderComplex.tsx`, `assetRenderUtility.tsx`

**Assets by Category (22 total):**
- **basic** (4): text, textarea, richText, quote
- **lists** (6): highlightsList, bulletList, checklistItems, progressBarList, keyValueList, nestedCards
- **charts** (4): metricCard, radialProgressChart, pieChart, barChart
- **complex** (4): statusBoard, timeline, twoColumnComparison, problemSolutionBox
- **rich** (3): codeBlock, hr, number
- **media** (0): placeholder category

**Design System Compliance:**
- All colors use semantic variables: `var(--brand-primary)`, `var(--accent-green)`, etc.
- NO hardcoded hex values allowed
- Pattern files contain ONLY logic/structure (no styling)
- Master engine applies design system classes via CSS

**Status:** ✅ AssetLibrary functional, integrated into Template Builder  
**Pending:** 5 rendering bugs (progress bar, pie chart, bar chart, timeline, two-column)

### Rendering Fixes Applied (Nov 11)
1. **StatusBoard** - Fixed exampleData from flat array to columnar structure `{columns: [{title, items:[]}]}`
2. **HR Color** - Changed to `var(--brand-primary)` purple
3. **Number Display** - Added fallback `data?.value || data || 0`
4. **Code Block** - Wrapped in `.code-wrapper` container with card styling

### Template Loading Bug (FIXED Nov 11)
**Problem:** Master Template showed corrupted data in EditorModalV2  
**Root Cause:** Backend returns `{success: true, template: {...}}` but frontend used `await response.json()` directly  
**Fix:** Extract nested property: `sourceData = (await response.json()).template`  
**File:** `/cms-admin/src/App.tsx` line 347  
**Status:** ✅ Fixed, Master Template now loads correctly (25 sections displayed)

### Template Dropdown Made Dynamic (FIXED Nov 11)
**Problem:** Hardcoded "Default Template" options that don't exist as files  
**Fix:** Removed hardcoded options, made 100% dynamic from filesystem  
**Files:** `/cms-admin/src/App.tsx` lines 962-963 (deleted hardcoded options)  
**Status:** ✅ Fixed, dropdown populates from `/cms-admin/src/templates/` folder

### Template Names Too Long (IMPROVED Nov 11)
**Problem:** Full description showed in dropdown, too verbose  
**Fix:** Changed to `{template.name} ({template.sectionCount} sections)`  
**Status:** ✅ Improved, but section count still buggy (counts metadata)

---

## Key Files & Systems

**For detailed technical references, see QUICK_REF.md**

### Core Architecture
- **RenderEngine:** `/src/renderers/RenderFactory.tsx` + 23 individual renderers
- **Schema:** `/src/types/schema.ts` - TypeScript interfaces for all 23 asset types
- **Template Builder:** `/cms-admin/src/components/TemplateBuilder.tsx` (4300+ lines)
- **EditorModalV2:** `/cms-admin/src/components/EditorModalV2.tsx` - Main content editor

### Backend
- **Server:** `/backend/server.js` - Express API (504 lines)
- **Auth:** `/backend/api/auth.js` - JWT authentication (disabled in dev)
- **Storage:** File-based (JSON files + uploads folder)

### Templates & Data
- **Templates:** `/cms-admin/src/templates/*.json` (MASTER template = all 23 types)
- **Summaries:** `/src/data/summaries/*.json` (published content)

---

## Development Commands

```bash
# Main App (Viewer)
npm run dev              # http://localhost:5173
npm run build            # Creates /dist/

# CMS Admin
cd cms-admin
npm run dev              # http://localhost:5174
npm run build            # Creates /cms-admin/dist/

# Backend API
cd backend
npm start                # http://localhost:3001
```

---

## Knowledge Base Structure

**Master Index:** `/knowledge-base/kb_main.md`

**Categories:**
- **developer/** - Technical implementation guides
- **reference/** - Schema, API, component catalogs
- **user-guides/** - End-user documentation
- **workflows/** - (empty, needs creation)

**Key Documents:**
- `developer/adding-new-assets.md` - How to add new renderers (613 lines)
- `reference/metadata-schema.md` - Complete metadata patterns (602 lines)
- `developer/chart-system.md` - Chart configuration guide
- `developer/multi-column-layout.md` - Grid layout system

---

## Quick Context for New Chats

**When starting new chat, provide this context:**

"Continue EditorModalV2 production testing. Master Template (23 asset types) loads correctly after Nov 11 fix. Change control policy active - require approval before any code changes. See HANDOVER.md for current status, QUICK_REF.md for feature→file mappings, knowledge-base/ for detailed documentation."

---

## What's Next

### Immediate Priorities
1. Complete EditorModalV2 section-by-section testing (user providing feedback)
2. Fix ContentModalFixedMenu infinite re-render bug
3. Fix backend section count (exclude metadata fields)
4. Delete orphaned EditorModal.tsx

### Future Enhancements (See /plans/CR-*.md)
- Organizations Integration (CR-001) - COMPLETED
- ExecutiveIQ Integration (CR-002)
- Strategic Initiatives Integration (CR-003)
- Azure Deployment (CR-004)

---

## Emergency References

**If something breaks:**
1. Check QUICK_REF.md for file locations
2. Review knowledge-base/ docs for that system
3. Check `/cms-admin/public/change-management.json` for known issues
4. Look in `/docs-archive/` for historical context

**Critical Files (DO NOT MODIFY WITHOUT APPROVAL):**
- `/src/types/schema.ts` - Schema frozen
- `/src/renderers/RenderFactory.tsx` - Routing stable
- `/cms-admin/src/components/TemplateBuilder.tsx` - Finalized Nov 10
- All template JSON files - Format locked

---

*This document provides context for AI handovers. For technical details, see QUICK_REF.md and knowledge-base/.*
