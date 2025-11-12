# Executive Summary Website - Project Instructions

## 🚨 CHANGE CONTROL POLICY - PRODUCTION TESTING PHASE
**Effective: November 11, 2025**

### MANDATORY PRE-APPROVAL PROCESS
Before making ANY code changes, the AI MUST:

1. **STOP and ASK FOR APPROVAL** using this format:
   ```
   📋 CHANGE REQUEST
   
   Files to Modify:
   - /path/to/file1.tsx (reason)
   - /path/to/file2.ts (reason)
   
   Systems Impacted:
   - [System A] - How it's affected
   - [System B] - How it's affected
   
   Connected Components:
   - Component X (uses this file)
   - Component Y (imports from this)
   
   Risk Level: [LOW/MEDIUM/HIGH]
   
   Awaiting approval to proceed...
   ```

2. **WAIT FOR USER APPROVAL** - Do not proceed until user confirms
3. **STICK TO APPROVED FILES ONLY** - No scope creep
4. **REQUEST NEW APPROVAL** for any additional changes beyond original scope

### LOCKED COMPONENTS (No modifications without explicit approval)
- ✅ **Template Builder** (`/cms-admin/src/components/TemplateBuilder.tsx`) - Finalized Nov 10
- ✅ **Engine Assets Preview** (`/cms-admin/src/components/EngineAssetsPreview.tsx`) - Finalized Nov 10
- ✅ **JSON Schema** (`/src/types/schema.ts`) - Schema frozen
- ✅ **KeyValueListRenderer** (`/src/renderers/KeyValueListRenderer.tsx`) - Just completed
- ✅ **RenderFactory** (`/src/renderers/RenderFactory.tsx`) - Stable
- ✅ **All Template JSON files** (`/cms-admin/src/templates/*.json`) - Format locked

### CURRENT WORK SCOPE (November 11, 2025)
**Focus Area:** Asset Library Implementation & Rendering Fixes
**Allowed Modifications:** 
- Asset Library component (`/cms-admin/src/components/AssetLibrary.tsx`)
- Asset render patterns (`/cms-admin/src/renderers/assetRender*.tsx`)
- Asset render engine (`/cms-admin/src/renderers/assetRenderEngine.tsx`)
- Asset data store (`/cms-admin/src/schemas/assetDataStore.ts`)
- Asset styling (`/cms-admin/src/renderers/assetRenderEngine.css`)
- Bug fixes in rendering components

**Forbidden:**
- Schema changes (`/src/types/schema.ts`)
- Template Builder modifications
- JSON format changes

## Project Overview
Modern React + Vite executive summary website with premium UI/UX design.
- Pure frontend application (no backend/authentication)
- Fully offline-capable with all dependencies bundled
- Features: 3D cards, glassmorphism, animations, data visualizations, dark/light mode

## Tech Stack
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Recharts (data visualization)
- React Router (navigation)
- Lucide React (icons)

## Development Guidelines
- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Implement responsive design (mobile-first approach)
- Ensure all assets are bundled locally (offline requirement)
- Use modern ES6+ syntax
- Keep components modular and reusable

## Recent Changes (November 10-11, 2025)

### Asset Library System (November 11, 2025)
**Feature:** Complete asset library replacement for AssetTypeReferenceModal

**New Architecture:**
- **AssetLibrary.tsx** - Modern UI with live previews, category filtering, search, multi-column toggle
- **assetDataStore.ts** - Single source of truth for 22 asset definitions
- **assetRenderEngine.tsx** - Master orchestrator routing to pattern files
- **assetRenderEngine.css** - Complete styling using design system semantic variables
- **Pattern Files** - 6 specialized renderers:
  - `assetRenderText.tsx` - Text, Textarea, RichText, Quote, CodeBlock (5 assets)
  - `assetRenderLists.tsx` - HighlightsList, BulletList, ChecklistItems, ProgressBarList, KeyValueList (5 assets)
  - `assetRenderCards.tsx` - MetricCard, NestedCards, RiskCard, OutlookCard, CategoryList (5 assets)
  - `assetRenderCharts.tsx` - RadialProgress, PieChart, BarChart, LineChart (4 assets)
  - `assetRenderComplex.tsx` - StatusBoard, Timeline, TwoColumnComparison, ProblemSolutionBox (4 assets)
  - `assetRenderUtility.tsx` - Hr, Number (2 assets)

**Assets by Category (22 total):**
- **basic** (4): text, textarea, richText, quote
- **lists** (6): highlightsList, bulletList, checklistItems, progressBarList, keyValueList, nestedCards
- **charts** (4): metricCard, radialProgressChart, pieChart, barChart
- **complex** (4): statusBoard, timeline, twoColumnComparison, problemSolutionBox
- **rich** (3): codeBlock, hr, number
- **media** (0): placeholder category

**Design System Compliance:**
- All colors use semantic CSS variables: `var(--brand-primary)`, `var(--brand-secondary)`, `var(--accent-green)`, etc.
- NO hardcoded hex values allowed
- Pattern files contain ONLY logic/structure (no styling)
- Master engine applies design system classes

**Fixes Applied:**
1. StatusBoard - Changed exampleData from flat array to columnar structure `{columns: [{title, items:[]}]}`
2. HR Color - Changed to `var(--brand-primary)` purple
3. Number Display - Added fallback `data?.value || data || 0`
4. Code Block - Wrapped in `.code-wrapper` container with card styling

**Pending Issues (for Nov 12):**
- Progress Bar List needs redesign (multiple tasks with individual bars)
- Pie Chart colors need primary palette mapping
- Bar Chart colors and legend labels
- Timeline display verification
- Two-Column Comparison purpose clarification

### Template Loading Fix (November 11, 2025)
**Bug:** Master Template showed corrupted data when loaded into EditorModalV2  
**Root Cause:** Backend returns `{success: true, template: {...}}` but frontend used `await response.json()` directly  
**Fix:** Extract nested property in App.tsx line 347: `sourceData = (await response.json()).template`  
**Status:** ✅ Fixed - Master Template now loads correctly with all 25 sections

### Dynamic Template Dropdown (November 11, 2025)
**Change:** Removed hardcoded "Default Template" options that didn't exist as files  
**Files Modified:** `/cms-admin/src/App.tsx` lines 962-963 (deleted hardcoded entries)  
**Result:** Dropdown now 100% dynamic, populated from `/cms-admin/src/templates/` folder  
**Template Display:** Changed to `{template.name} ({template.sectionCount} sections)`

### Documentation Restructure (November 11, 2025)
**New Files Created:**
- `HANDOVER.md` - AI context document for new chat sessions (220 lines)
- `QUICK_REF.md` - Feature→File mapping index with line numbers (300 lines)

**Purpose:**
- HANDOVER.md: Brief project status, architecture, recent fixes for AI handovers
- QUICK_REF.md: Index mapping features to exact file locations + KB docs
- Knowledge Base: Complete technical documentation (source of truth)

**Workflow:** Find feature in QUICK_REF → Read KB docs → Review code → Plan changes

### KeyValueListRenderer Implementation (November 10, 2025)
**Feature:** Dynamic key-value pair editor with add/remove functionality

**Files Modified:**
1. `/src/renderers/KeyValueListRenderer.tsx` - NEW renderer component
2. `/cms-admin/src/renderers/KeyValueListRenderer.tsx` - CMS copy of renderer
3. `/src/renderers/RenderFactory.tsx` - Registered 'keyValueList' case
4. `/src/types/schema.ts` - Added 'keyValueList' to RenderType
5. `/cms-admin/src/components/TemplateBuilder.tsx` - Added keyValueList example data editor (lines 2700-2757)
6. `/cms-admin/src/components/EngineAssetsPreview.tsx` - Updated "List (with labels)" to use renderAs: 'keyValueList'

**Asset Definition:**
```typescript
{
  id: 'array',
  name: 'List with Labels',
  renderType: 'keyValueList',
  description: 'Key-value pairs with labels',
  schema: { type: 'object', renderAs: 'keyValueList', label: 'Details' },
  exampleData: {
    'Role': 'Chief Executive Officer',
    'Department': 'Executive Leadership',
    'Location': 'New York, NY',
    'Reports To': 'Board of Directors'
  }
}
```

**Display Mode:**
- Purple labels (`text-fis-eggplant dark:text-fis-raspberry`)
- Roobert-light font for labels
- Expression support via renderWithExpressions()
- Format: "Label: Value"

**Edit Mode:**
- Two input fields: Label + Value
- "+ Add Pair" button
- Delete button on hover for each pair
- Enter key support
- Object-based storage

**Properties Panel Editor:**
- Located in TemplateBuilder lines 2700-2757
- Allows editing label and value for each pair
- Add/remove pairs dynamically
- Updates exampleData as object: `{ "Key": "Value" }`

### Central Notification System Integration
**Feature:** Unified notification system across Template Builder

**Implementation:**
- App.tsx (line 115): Central `showNotification(type, message)` function
- TemplateBuilder receives `showNotification` prop from App.tsx
- All local notification state removed from TemplateBuilder
- Success/error messages appear at top of screen with 5-second auto-dismiss

**Confirmation Modals:**
- Local modals for destructive actions (Remove All, Unsaved Changes)
- Styled with AlertCircle icon, two-button layout, smooth animations
- Pattern: `showRemoveAllModal` state triggers modal, separate confirm function executes action
- Success notifications use central system after action completes

**Files Modified:**
1. `/cms-admin/src/components/TemplateBuilder.tsx`:
   - Added `showRemoveAllModal` state (line 879)
   - Added `confirmRemoveAll()` function (lines 1632-1639)
   - Added Remove All confirmation modal (lines 4107-4145)
   - Removed local notification state, useEffect, and toast UI
   - All notifications now use central `showNotification()` prop

### MASTER Template Update
- **MASTER-TEMPLATE-ALL-ASSETS.json**: Updated to 23 asset types
- Added `executiveDetails` field using keyValueList renderer
- Example data: Role, Department, Location, Reports To

### Other Recent Renderer Updates
- **BarChartRenderer**: Added axis labels and custom legend (November 10)
- **ListRenderer**: Fixed to support both arrays and objects with purple label styling (November 10)
- **QuoteRenderer**: Border on both sides, no quote marks (Previous)
- **ExpressionRenderer**: Icon alignment fixes (Previous)
