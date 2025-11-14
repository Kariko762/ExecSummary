# ⚡ Quick Reference - Feature → File Mapping

**Purpose:** Index of all major features with exact file locations and line numbers  
**Usage:** Find where a feature is implemented → Review KB docs → Examine code → Plan changes

**Last Updated:** November 11, 2025

---

## 🎯 How to Use This Guide

1. **Find your feature** in the index below
2. **Check the file location** and line numbers
3. **Read the KB documentation** (link provided)
4. **Review the actual code** to understand implementation
5. **Follow change control** if modifications needed

---

## Core Systems

### RenderEngine & Asset Types

| Feature | File Location | KB Documentation |
|---------|--------------|------------------|
| **RenderFactory (Router)** | `/src/renderers/RenderFactory.tsx` lines 1-150 | `knowledge-base/developer/adding-new-assets.md` lines 40-120 |
| **Type Definitions** | `/src/types/schema.ts` lines 1-500 | `knowledge-base/reference/metadata-schema.md` lines 1-602 |
| **Text Renderer** | `/src/renderers/TextRenderer.tsx` lines 1-80 | `knowledge-base/reference/metadata-schema.md` lines 50-100 |
| **Textarea Renderer** | `/src/renderers/TextareaRenderer.tsx` lines 1-90 | `knowledge-base/reference/metadata-schema.md` lines 101-150 |
| **Number Renderer** | `/src/renderers/NumberRenderer.tsx` lines 1-75 | `knowledge-base/reference/metadata-schema.md` lines 151-180 |
| **List Renderer** | `/src/renderers/ListRenderer.tsx` lines 1-200 | `knowledge-base/developer/adding-new-assets.md` lines 200-280 |
| **KeyValueList Renderer** | `/src/renderers/KeyValueListRenderer.tsx` lines 1-180 | `.github/copilot-instructions.md` lines 60-120 |
| **NestedCards Renderer** | `/src/renderers/NestedCardsRenderer.tsx` lines 1-250 | `knowledge-base/developer/adding-new-assets.md` lines 300-400 |
| **Object Renderer** | `/src/renderers/ObjectRenderer.tsx` lines 1-150 | `knowledge-base/reference/metadata-schema.md` lines 250-320 |
| **KeyValue Renderer** | `/src/renderers/KeyValueRenderer.tsx` lines 1-120 | `knowledge-base/reference/metadata-schema.md` lines 321-370 |
| **RichText Renderer** | `/src/renderers/RichTextRenderer.tsx` lines 1-100 | `knowledge-base/reference/metadata-schema.md` lines 371-420 |
| **Expression Renderer** | `/src/renderers/ExpressionRenderer.tsx` lines 1-90 | `knowledge-base/reference/metadata-schema.md` lines 421-470 |
| **CodeBlock Renderer** | `/src/renderers/CodeBlockRenderer.tsx` lines 1-80 | `knowledge-base/reference/metadata-schema.md` lines 471-510 |
| **Quote Renderer** | `/src/renderers/QuoteRenderer.tsx` lines 1-70 | `.github/copilot-instructions.md` lines 200-220 |
| **Pie Chart Renderer** | `/src/renderers/PieChartRenderer.tsx` lines 1-150 | `knowledge-base/developer/chart-system.md` lines 1-150 |
| **Bar Chart Renderer** | `/src/renderers/BarChartRenderer.tsx` lines 1-180 | `knowledge-base/developer/chart-system.md` lines 151-300 |
| **Line Chart Renderer** | `/src/renderers/LineChartRenderer.tsx` lines 1-170 | `knowledge-base/developer/chart-system.md` lines 301-450 |
| **Radial Chart Renderer** | `/src/renderers/RadialChartRenderer.tsx` lines 1-140 | `knowledge-base/developer/chart-system.md` lines 451-580 |
| **Image Renderer** | `/src/renderers/ImageRenderer.tsx` lines 1-120 | `knowledge-base/reference/metadata-schema.md` lines 511-550 |
| **Video Renderer** | `/src/renderers/VideoRenderer.tsx` lines 1-140 | `knowledge-base/reference/metadata-schema.md` lines 551-590 |
| **EmbeddedVideo Renderer** | `/src/renderers/EmbeddedVideoRenderer.tsx` lines 1-130 | `knowledge-base/reference/metadata-schema.md` lines 591-602 |
| **Horizontal Rule Renderer** | `/src/renderers/HorizontalRuleRenderer.tsx` lines 1-40 | `knowledge-base/developer/multi-column-layout.md` lines 200-230 |
| **StatusBoard Renderer** | `/src/renderers/StatusBoardRenderer.tsx` lines 1-300 | `knowledge-base/developer/adding-new-assets.md` lines 450-580 |

### CMS Admin - Template Builder

| Feature | File Location | KB Documentation |
|---------|--------------|------------------|
| **Template Builder (Main)** | `/cms-admin/src/components/TemplateBuilder.tsx` lines 1-4300 | `docs-archive/TEMPLATE_BUILDER_DEEP_DIVE.md` |
| **Asset Library** | `/cms-admin/src/components/TemplateBuilder.tsx` lines 1-200 (ASSET_LIBRARY constant) | `knowledge-base/developer/adding-new-assets.md` lines 500-600 |
| **Drag & Drop Logic** | `/cms-admin/src/components/TemplateBuilder.tsx` lines 1500-1800 | `docs-archive/TEMPLATE_BUILDER_DEEP_DIVE.md` lines 200-350 |
| **Properties Panel** | `/cms-admin/src/components/TemplateBuilder.tsx` lines 2000-3500 | `docs-archive/TEMPLATE_BUILDER_DEEP_DIVE.md` lines 400-600 |
| **KeyValueList Editor** | `/cms-admin/src/components/TemplateBuilder.tsx` lines 2700-2757 | `.github/copilot-instructions.md` lines 100-120 |
| **Remove All Modal** | `/cms-admin/src/components/TemplateBuilder.tsx` lines 4107-4145 | `.github/copilot-instructions.md` lines 130-145 |
| **Notification Integration** | `/cms-admin/src/components/TemplateBuilder.tsx` lines 800-900 | `.github/copilot-instructions.md` lines 122-155 |
| **Save/Load Templates** | `/cms-admin/src/components/TemplateBuilder.tsx` lines 1200-1400 | `docs-archive/TEMPLATE_BUILDER_DEEP_DIVE.md` lines 700-850 |

### CMS Admin - Content Editor

| Feature | File Location | KB Documentation |
|---------|--------------|------------------|
| **EditorModalV2 (Main Editor)** | `/cms-admin/src/components/EditorModalV2.tsx` lines 1-1500 | `docs-archive/EDITOR_MODAL_V2_MIGRATION.md` |
| **Section Navigation** | `/cms-admin/src/components/EditorModalV2.tsx` lines 200-400 | `docs-archive/EDITOR_MODAL_V2_MIGRATION.md` lines 100-200 |
| **Edit Mode Routing** | `/cms-admin/src/components/EditorModalV2.tsx` lines 600-900 | `docs-archive/EDITOR_MODAL_V2_MIGRATION.md` lines 250-400 |
| **Save/Publish Logic** | `/cms-admin/src/components/EditorModalV2.tsx` lines 1000-1200 | `docs-archive/EDITOR_MODAL_V2_MIGRATION.md` lines 450-550 |
| **Protection Controls** | `/cms-admin/src/components/EditorModalV2.tsx` lines 100-150 | `docs-archive/EDITOR_MODAL_V2_MIGRATION.md` lines 50-100 |
| **Old Editor (ORPHANED)** | `/cms-admin/src/components/EditorModal.tsx` lines 1-2000 | N/A - Not used, can delete |

### CMS Admin - Main App

| Feature | File Location | KB Documentation |
|---------|--------------|------------------|
| **App Component** | `/cms-admin/src/App.tsx` lines 1-1091 | `README.md` |
| **Central Notifications** | `/cms-admin/src/App.tsx` line 115 (showNotification) | `.github/copilot-instructions.md` lines 122-145 |
| **Create New Summary** | `/cms-admin/src/App.tsx` lines 316-385 (handleCreateNewSummary) | HANDOVER.md lines 80-95 |
| **Template Loading Fix** | `/cms-admin/src/App.tsx` line 347 (data.template extraction) | HANDOVER.md lines 100-110 |
| **Template Dropdown** | `/cms-admin/src/App.tsx` lines 960-970 | HANDOVER.md lines 112-120 |
| **Summary List** | `/cms-admin/src/App.tsx` lines 400-600 | `README.md` |
| **Engine Assets Preview** | `/cms-admin/src/components/EngineAssetsPreview.tsx` lines 1-800 | `knowledge-base/user-guides/engine-assets-preview.md` |

### Backend API

| Feature | File Location | KB Documentation |
|---------|--------------|------------------|
| **Express Server** | `/backend/server.js` lines 1-504 | `backend/README.md` |
| **GET /api/summaries** | `/backend/server.js` lines 100-150 | `backend/README.md` lines 50-100 |
| **POST /api/summaries** | `/backend/server.js` lines 151-200 | `backend/README.md` lines 101-150 |
| **PUT /api/summaries/:id** | `/backend/server.js` lines 201-250 | `backend/README.md` lines 151-200 |
| **DELETE /api/summaries/:id** | `/backend/server.js` lines 251-300 | `backend/README.md` lines 201-250 |
| **GET /api/templates** | `/backend/server.js` lines 457-493 | `backend/README.md` lines 300-350 |
| **GET /api/templates/:id** | `/backend/server.js` lines 494-504 | HANDOVER.md lines 103-108 |
| **POST /api/upload** | `/backend/server.js` lines 350-400 | `backend/README.md` lines 251-299 |
| **Auth Middleware** | `/backend/api/auth.js` lines 1-150 | `backend/README_AUTH.md` |

### Design System

| Feature | File Location | KB Documentation |
|---------|--------------|------------------|
| **Color Tokens** | `/tailwind.config.js` lines 10-50 | `src/design-system/QUICK_REF.md` |
| **FIS Brand Colors** | `/tailwind.config.js` lines 20-35 | `docs-archive/DESIGN_SYSTEM_MIGRATION.md` |
| **Typography** | `/src/index.css` lines 1-50 | `CUSTOMIZATION.md` lines 50-100 |
| **Roobert Font** | `/public/RoobertFont/` + `/src/index.css` lines 20-40 | `CUSTOMIZATION.md` lines 60-80 |

### Templates & Data

| Feature | File Location | KB Documentation |
|---------|--------------|------------------|
| **Master Template** | `/cms-admin/src/templates/MASTER-TEMPLATE-ALL-ASSETS.json` lines 1-456 | `.github/copilot-instructions.md` lines 165-175 |
| **Template Format** | All `/cms-admin/src/templates/*.json` | `knowledge-base/reference/metadata-schema.md` |
| **Summary Storage** | `/src/data/summaries/*.json` | `knowledge-base/reference/metadata-schema.md` |

### Configuration & Build

| Feature | File Location | KB Documentation |
|---------|--------------|------------------|
| **Vite Config (Main)** | `/vite.config.ts` lines 1-50 | `DEPLOYMENT.md` |
| **Vite Config (CMS)** | `/cms-admin/vite.config.ts` lines 1-50 | `DEPLOYMENT.md` |
| **Tailwind Config** | `/tailwind.config.js` lines 1-100 | `CUSTOMIZATION.md` |
| **TypeScript Config** | `/tsconfig.json` lines 1-30 | `README.md` |
| **Package.json (Main)** | `/package.json` lines 1-80 | `README.md` |
| **Package.json (CMS)** | `/cms-admin/package.json` lines 1-80 | `cms-admin/README.md` |
| **Package.json (Backend)** | `/backend/package.json` lines 1-30 | `backend/README.md` |

---

## Utility Functions & Helpers

| Feature | File Location | KB Documentation |
|---------|--------------|------------------|
| **Expression Parser** | `/src/utils/expressionParser.ts` lines 1-200 | `docs-archive/EXPRESSION_SYNTAX.md` |
| **MultiColumn Layout** | `/src/components/MultiColumnLayout.tsx` lines 1-150 | `knowledge-base/developer/multi-column-layout.md` |
| **Column Config UI** | `/cms-admin/src/components/ColumnConfigSelector.tsx` lines 1-100 | `knowledge-base/developer/multi-column-layout.md` lines 150-250 |

---

## Key Metadata Patterns

### Render Type Metadata
**File:** Any `*.json` in `/cms-admin/src/templates/` or `/src/data/summaries/`  
**Pattern:** `_sectionName_type`  
**KB Doc:** `knowledge-base/reference/metadata-schema.md` lines 20-50

### Chart Configuration
**File:** Any chart section in templates/summaries  
**Pattern:** `_sectionName_chartConfig`  
**KB Doc:** `knowledge-base/developer/chart-system.md` lines 50-150

### Column Span
**File:** Any section in templates/summaries  
**Pattern:** `_sectionName_columnSpan`  
**KB Doc:** `knowledge-base/developer/multi-column-layout.md` lines 1-100

### Field Definitions
**File:** Complex types (nestedCards, object, statusBoard)  
**Pattern:** `_sectionName_fields`  
**KB Doc:** `knowledge-base/reference/metadata-schema.md` lines 200-350

---

## Change Management

| Feature | File Location | KB Documentation |
|---------|--------------|------------------|
| **Change Control Policy** | `.github/copilot-instructions.md` lines 1-60 | HANDOVER.md lines 20-50 |
| **Locked Components List** | `.github/copilot-instructions.md` lines 30-40 | HANDOVER.md lines 40-48 |
| **Change Tasks (JSON)** | `/cms-admin/public/change-management.json` | N/A - Read via System Settings |
| **Known Issues** | `/cms-admin/public/change-management.json` + HANDOVER.md lines 15-20 | HANDOVER.md |

---

## Documentation Files

| Document | Purpose | Lines |
|----------|---------|-------|
| **HANDOVER.md** | AI context for new chat sessions | ~220 |
| **QUICK_REF.md** | This file - Feature→File index | ~300 |
| **README.md** | Project overview & getting started | ~500 |
| **DEPLOYMENT.md** | Build & deployment instructions | ~300 |
| **CUSTOMIZATION.md** | Styling & branding guide | ~250 |
| **knowledge-base/kb_main.md** | KB master index | ~400 |
| **knowledge-base/developer/adding-new-assets.md** | How to add renderers | 613 |
| **knowledge-base/reference/metadata-schema.md** | Complete metadata reference | 602 |
| **knowledge-base/developer/chart-system.md** | Chart configuration | ~400 |
| **knowledge-base/developer/multi-column-layout.md** | Grid layout system | ~300 |
| **docs-archive/TEMPLATE_BUILDER_DEEP_DIVE.md** | Template Builder architecture | ~1000 |
| **docs-archive/EDITOR_MODAL_V2_MIGRATION.md** | EditorModalV2 design | ~600 |
| **docs-archive/EXPRESSION_SYNTAX.md** | Expression parser docs | ~400 |

---

## Workflow Example

**Scenario:** User wants to modify how pie charts display

1. **Find Feature:** Look up "Pie Chart Renderer" in this file
2. **Location:** `/src/renderers/PieChartRenderer.tsx` lines 1-150
3. **KB Doc:** Read `knowledge-base/developer/chart-system.md` lines 1-150
4. **Config Pattern:** Check `knowledge-base/reference/metadata-schema.md` for `_*_chartConfig`
5. **Request Approval:** Follow change control policy (`.github/copilot-instructions.md` lines 1-28)
6. **Make Changes:** Modify PieChartRenderer.tsx after approval
7. **Test:** Use Master Template to verify all pie charts work

---

## Emergency Quick Reference

**System broken? Start here:**

1. **Check console errors** (F12 in browser)
2. **Find the component** in this QUICK_REF.md
3. **Read the KB doc** for that feature
4. **Review actual code** at specified line numbers
5. **Check HANDOVER.md** for known issues
6. **Check `/cms-admin/public/change-management.json`** for documented bugs

**Common Issues:**
- EditorModalV2 won't open → Check App.tsx line 347 (template loading)
- Renderer not working → Check RenderFactory.tsx case statement
- Chart not displaying → Check `_*_chartConfig` metadata structure
- Template Builder crash → Check TemplateBuilder.tsx notification integration (lines 800-900)

---

*Last Updated: November 11, 2025 - Production Testing Phase*
