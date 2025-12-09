# 🎨 Design System Centralization - Deployment Plan

**Date Created:** December 9, 2025  
**Status:** Planning Phase  
**Priority:** High  
**Complexity:** Medium-High

---

## 📋 Executive Summary

**Objective:** Centralize color palette management so the CMS Design System Manager controls colors for both Light and Dark themes across the entire frontend application.

**Current State:**
- ✅ CMS has Design System Manager with CSS variable export (`--brand-primary`, etc.)
- ✅ CMS uses centralized design system (via `DesignSystemInjector.tsx`)
- ❌ Frontend has hardcoded CSS variables in `src/index.css`
- ❌ Frontend has 58 files with inline Tailwind color classes (`bg-white`, `dark:bg-gray-900`)
- ❌ No sync mechanism between CMS design system and Frontend

**Target State:**
- ✅ CMS Design System Manager = Single Source of Truth
- ✅ Frontend imports design system from backend API endpoint
- ✅ All frontend components use CSS variables instead of hardcoded colors
- ✅ Light/Dark theme changes in CMS instantly apply to frontend

---

## 🏗️ Architecture Overview

### Current Design System Flow (CMS Only)

```
┌─────────────────────────────────────────────────────────┐
│ CMS Admin (localhost:5174)                              │
│                                                          │
│  DesignSystemManager.tsx                                │
│  ├─ Edit colors (Light + Dark themes)                  │
│  ├─ Edit typography                                     │
│  ├─ Edit spacing                                        │
│  └─ Save to localStorage: 'design-system-v2'           │
│                                                          │
│  DesignSystemInjector.tsx (on app load)                 │
│  ├─ Read from localStorage: 'design-system-v2'          │
│  ├─ Inject CSS variables to :root                      │
│  │   • --brand-primary: #431C5B                         │
│  │   • --brand-secondary: #B21A53                       │
│  │   • --accent-green: #4BCD3E                          │
│  │   • etc. (74 total variables)                        │
│  └─ Generate light/dark variants                        │
│      • --semantic-success-light                         │
│      • --semantic-success-dark                          │
│                                                          │
│  Components use CSS variables:                          │
│  <div style="color: var(--brand-primary)">             │
└─────────────────────────────────────────────────────────┘
```

### Current Frontend Flow (Hardcoded)

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (localhost:5173)                               │
│                                                          │
│  src/index.css (HARDCODED)                             │
│  :root {                                                │
│    --brand-primary: #431C5B;  ← MANUAL ENTRY           │
│    --brand-secondary: #B21A53;                          │
│    ...                                                   │
│  }                                                       │
│                                                          │
│  Components use Tailwind classes (HARDCODED):           │
│  <div className="bg-white dark:bg-gray-900">           │
│  <p className="text-gray-900 dark:text-white">         │
│                                                          │
│  58 files × hundreds of inline color classes            │
└─────────────────────────────────────────────────────────┘
```

### **TARGET Architecture** (Centralized)

```
┌──────────────────────────────────────────────────────────────┐
│ BACKEND API (localhost:3001)                                 │
│                                                               │
│  📁 data/design-system.json                                  │
│  {                                                            │
│    "version": "1.0",                                          │
│    "light": {                                                 │
│      "colors": [...],  ← Brand, Accent, Semantic, etc.      │
│      "fonts": {...}                                           │
│    },                                                         │
│    "dark": {                                                  │
│      "colors": [...],  ← Dark theme variants                │
│      "fonts": {...}                                           │
│    }                                                          │
│  }                                                            │
│                                                               │
│  🔌 GET /api/design-system                                   │
│     Returns: design-system.json                              │
│                                                               │
│  🔌 POST /api/design-system                                  │
│     Saves: Updated design system from CMS                    │
└──────────────────────────────────────────────────────────────┘
                    ▲                           ▲
                    │                           │
         ┌──────────┘                           └──────────┐
         │                                                  │
         │ SAVE                                      LOAD   │
         │                                                  │
┌────────▼────────────────┐            ┌─────────────────▼─────┐
│ CMS Admin               │            │ Frontend               │
│                         │            │                        │
│ DesignSystemManager     │            │ DesignSystemLoader     │
│ ├─ Edit colors          │            │ ├─ Fetch on app load  │
│ ├─ Edit themes          │            │ ├─ Inject to :root    │
│ └─ Save to Backend API  │            │ └─ Apply CSS vars     │
│                         │            │                        │
│ Components:             │            │ Components:            │
│ var(--brand-primary)    │            │ var(--brand-primary)   │
└─────────────────────────┘            └────────────────────────┘
```

---

## 📦 Deliverables

### Phase 1: Backend API (Foundation)
1. **`backend/data/design-system.json`** - Master design system file
2. **`backend/api/design-system.js`** - API endpoints (GET/POST)
3. **`backend/server.js`** - Register design-system routes

### Phase 2: CMS Integration
4. **Update `DesignSystemManager.tsx`** - Save to API instead of localStorage
5. **Update `DesignSystemInjector.tsx`** - Load from API instead of localStorage

### Phase 3: Frontend Integration
6. **`src/utils/designSystemLoader.ts`** - Fetch & inject design system
7. **`src/main.tsx`** - Initialize loader on app startup
8. **Update `src/index.css`** - Remove hardcoded CSS variables
9. **Create `src/styles/designSystem.css`** - CSS variable declarations (auto-populated)

### Phase 4: Component Migration
10. **Create utility functions** - `getColorClass()`, `getTypographyClass()`
11. **Migrate components** - Replace Tailwind classes with CSS variables (58 files)
12. **Update renderers** - Ensure all 33 renderers use variables

---

## 🔧 Implementation Details

### 1. Backend API Endpoint

**File:** `backend/api/design-system.js`

```javascript
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const DESIGN_SYSTEM_FILE = path.join(__dirname, '..', 'data', 'design-system.json');

// GET /api/design-system - Fetch current design system
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(DESIGN_SYSTEM_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return defaults
      res.json(getDefaultDesignSystem());
    } else {
      res.status(500).json({ error: 'Failed to load design system' });
    }
  }
});

// POST /api/design-system - Save updated design system
router.post('/', async (req, res) => {
  try {
    const designSystem = req.body;
    await fs.writeFile(
      DESIGN_SYSTEM_FILE,
      JSON.stringify(designSystem, null, 2),
      'utf8'
    );
    res.json({ success: true, message: 'Design system saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save design system' });
  }
});

export default router;
```

**Register in `backend/server.js`:**

```javascript
import designSystemRoutes from './api/design-system.js';
app.use('/api/design-system', designSystemRoutes);
```

---

### 2. Design System Data Structure

**File:** `backend/data/design-system.json`

```json
{
  "version": "1.0.0",
  "timestamp": "2025-12-09T00:00:00.000Z",
  "light": {
    "colors": [
      {
        "key": "brand-primary",
        "label": "Brand Primary",
        "value": "#431C5B",
        "description": "Primary brand color (Eggplant)"
      },
      {
        "key": "brand-secondary",
        "label": "Brand Secondary",
        "value": "#B21A53",
        "description": "Secondary brand color (Raspberry)"
      },
      {
        "key": "surface-base",
        "label": "Surface Base",
        "value": "#FFFFFF",
        "description": "Base background color"
      },
      {
        "key": "text-primary",
        "label": "Text Primary",
        "value": "#111827",
        "description": "Primary text color"
      }
    ],
    "fonts": {
      "primary": "Roobert, sans-serif",
      "header": "Roobert Heavy, sans-serif",
      "body": "Roobert, sans-serif"
    }
  },
  "dark": {
    "colors": [
      {
        "key": "brand-primary",
        "label": "Brand Primary",
        "value": "#B21A53",
        "description": "Dark mode primary (Raspberry)"
      },
      {
        "key": "surface-base",
        "label": "Surface Base",
        "value": "#111827",
        "description": "Dark mode background"
      },
      {
        "key": "text-primary",
        "label": "Text Primary",
        "value": "#F9FAFB",
        "description": "Dark mode text"
      }
    ],
    "fonts": {
      "primary": "Roobert, sans-serif",
      "header": "Roobert Heavy, sans-serif",
      "body": "Roobert, sans-serif"
    }
  },
  "activeTheme": "light"
}
```

---

### 3. Frontend Design System Loader

**File:** `src/utils/designSystemLoader.ts`

```typescript
const API_URL = 'http://localhost:3001/api/design-system';

interface ColorDefinition {
  key: string;
  label: string;
  value: string;
  description: string;
}

interface DesignSystemProfile {
  colors: ColorDefinition[];
  fonts: Record<string, string>;
}

interface DesignSystemData {
  version: string;
  timestamp: string;
  light: DesignSystemProfile;
  dark: DesignSystemProfile;
  activeTheme?: 'light' | 'dark';
}

export async function loadDesignSystem(): Promise<void> {
  try {
    const response = await fetch(API_URL);
    const data: DesignSystemData = await response.json();
    
    injectDesignSystem(data);
    console.log('✅ Design System loaded from API', data);
  } catch (error) {
    console.error('❌ Failed to load design system:', error);
    console.warn('⚠️ Using fallback default design system');
    injectDefaultDesignSystem();
  }
}

function injectDesignSystem(data: DesignSystemData): void {
  const root = document.documentElement;
  const theme = data.activeTheme || 'light';
  const profile = data[theme];
  
  // Inject color variables
  profile.colors.forEach((color) => {
    root.style.setProperty(`--${color.key}`, color.value);
    
    // Auto-generate light/dark variants for semantic colors
    if (color.key.startsWith('semantic-')) {
      const lightTint = generateLightTint(color.value);
      const darkShade = generateDarkShade(color.value);
      root.style.setProperty(`--${color.key}-light`, lightTint);
      root.style.setProperty(`--${color.key}-dark`, darkShade);
    }
  });
  
  // Inject font variables
  Object.entries(profile.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--font-${key}`, value);
  });
}

function generateLightTint(hex: string): string {
  // Mix with white 85%
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const white = 255;
  const mixedR = Math.round(r + (white - r) * 0.85);
  const mixedG = Math.round(g + (white - g) * 0.85);
  const mixedB = Math.round(b + (white - b) * 0.85);
  return `#${mixedR.toString(16).padStart(2, '0')}${mixedG.toString(16).padStart(2, '0')}${mixedB.toString(16).padStart(2, '0')}`;
}

function generateDarkShade(hex: string): string {
  // Darken by 30%
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const darkenedR = Math.round(r * 0.7);
  const darkenedG = Math.round(g * 0.7);
  const darkenedB = Math.round(b * 0.7);
  return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
}

function injectDefaultDesignSystem(): void {
  // Fallback to hardcoded defaults if API fails
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', '#431C5B');
  root.style.setProperty('--brand-secondary', '#B21A53');
  // ... etc
}
```

**Initialize in `src/main.tsx`:**

```typescript
import { loadDesignSystem } from './utils/designSystemLoader';

// Load design system before rendering app
loadDesignSystem().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
```

---

### 4. Component Migration Strategy

**From (Hardcoded Tailwind):**
```tsx
<div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Title</h2>
  <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
</div>
```

**To (CSS Variables):**
```tsx
<div style={{
  backgroundColor: 'var(--surface-base)',
  borderColor: 'var(--border-default)'
}} className="border rounded-lg">
  <h2 style={{ 
    fontSize: 'var(--text-2xl)',
    fontFamily: 'var(--font-header)',
    color: 'var(--text-primary)'
  }}>Title</h2>
  <p style={{ 
    fontSize: 'var(--text-sm)',
    color: 'var(--text-secondary)'
  }}>Description</p>
</div>
```

**Or use utility classes (create in CSS):**
```css
/* src/styles/utilities.css */
.surface-base { background-color: var(--surface-base); }
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.border-default { border-color: var(--border-default); }
```

```tsx
<div className="surface-base border-default border rounded-lg">
  <h2 className="text-2xl font-header text-primary">Title</h2>
  <p className="text-sm text-secondary">Description</p>
</div>
```

---

## 📊 Migration Checklist

### ✅ Phase 1: Backend Foundation
- [ ] Create `backend/data/design-system.json` with default values
- [ ] Create `backend/api/design-system.js` with GET/POST endpoints
- [ ] Register routes in `backend/server.js`
- [ ] Test API endpoints with Postman/curl
- [ ] Verify file permissions and data persistence

### ✅ Phase 2: CMS Integration
- [ ] Update `DesignSystemManager.tsx` - POST to API on save
- [ ] Update `DesignSystemInjector.tsx` - GET from API on load
- [ ] Test CMS → Backend save flow
- [ ] Test CMS → Backend → CMS load flow
- [ ] Verify localStorage migration (backup/restore)

### ✅ Phase 3: Frontend Loader
- [ ] Create `src/utils/designSystemLoader.ts`
- [ ] Add initialization to `src/main.tsx`
- [ ] Remove hardcoded values from `src/index.css`
- [ ] Create `src/styles/designSystem.css` (auto-populated)
- [ ] Test frontend loads design system on startup
- [ ] Test fallback behavior if API fails

### ✅ Phase 4: Component Migration (HIGH EFFORT - 58 files)

**Priority 1: Core Components (5 files)**
- [ ] `Header.tsx` - Navigation bar
- [ ] `Dashboard.tsx` - Main homepage
- [ ] `ContentModal.tsx` - Summary detail view
- [ ] `SummaryCard.tsx` - Summary cards
- [ ] `Timeline.tsx` - Timeline navigation

**Priority 2: Main Views (10 files)**
- [ ] `OrganizationDashboard.tsx`
- [ ] `OrganizationModal.tsx`
- [ ] `StrategicInitiativesDashboard.tsx`
- [ ] `StrategicInitiativeModal.tsx`
- [ ] `KnowledgeBaseDashboard.tsx`
- [ ] `ViewGoalModal.tsx`
- [ ] `LoginPage.tsx`
- [ ] `WeeklyFocus.tsx`
- [ ] `IssuesBlockers.tsx`
- [ ] `StickyNav.tsx`

**Priority 3: Chart Components (8 files)**
- [ ] `ActivityHoursChart.tsx`
- [ ] `TopAssetsChart.tsx`
- [ ] `renderers/BarChartRenderer.tsx`
- [ ] `renderers/LineChartRenderer.tsx`
- [ ] `renderers/PieChartRenderer.tsx`
- [ ] `renderers/RadialChartRenderer.tsx`
- [ ] `renderers/assetRenderCharts.tsx`
- [ ] `renderers/assetRenderForecast.tsx`

**Priority 4: Content Renderers (25 files)**
- [ ] `renderers/TextRenderer.tsx`
- [ ] `renderers/RichTextRenderer.tsx`
- [ ] `renderers/QuoteRenderer.tsx`
- [ ] `renderers/ListRenderer.tsx`
- [ ] `renderers/KeyValueListRenderer.tsx`
- [ ] `renderers/MetricCardsRenderer.tsx`
- [ ] `renderers/NestedCardsRenderer.tsx`
- [ ] `renderers/assetRenderText.tsx`
- [ ] `renderers/assetRenderLists.tsx`
- [ ] `renderers/assetRenderCards.tsx`
- [ ] `renderers/assetRenderComplex.tsx`
- [ ] `renderers/assetRenderUtility.tsx`
- [ ] `renderers/assetRenderBudget.tsx`
- [ ] `renderers/assetRenderEngine.tsx`
- [ ] `renderers/MarkdownRenderer.tsx`
- [ ] `renderers/CodeBlockRenderer.tsx`
- [ ] `renderers/NumberRenderer.tsx`
- [ ] `renderers/HorizontalRuleRenderer.tsx`
- [ ] `renderers/ImageRenderer.tsx`
- [ ] `renderers/VideoRenderer.tsx`
- [ ] `renderers/EmbeddedVideoRenderer.tsx`
- [ ] `renderers/OrgChartRenderer.tsx`
- [ ] `renderers/TableLayoutRenderer.tsx`
- [ ] `renderers/ObjectFormRenderer.tsx`
- [ ] `renderers/ExpressionRenderer.tsx`

**Priority 5: Utility Components (10 files)**
- [ ] `OrganizationTile.tsx`
- [ ] `StrategicInitiativeTile.tsx`
- [ ] `KnowledgeBaseTile.tsx`
- [ ] `CardStyleGallery.tsx`
- [ ] `PlatformOverview.tsx`
- [ ] `SchemaTest.tsx`
- [ ] `ContentModalFixedMenu.tsx`
- [ ] `KeyActivityInsights.tsx`
- [ ] `RenderFactory.tsx`
- [ ] `TextareaRenderer.tsx`

### ✅ Phase 5: Testing & Validation
- [ ] Test light theme applies correctly
- [ ] Test dark theme applies correctly
- [ ] Test theme switching (light ↔ dark)
- [ ] Test CMS color changes propagate to frontend
- [ ] Test all 58 components render correctly
- [ ] Test all 33 renderers use variables
- [ ] Cross-browser testing (Chrome, Firefox, Edge)
- [ ] Performance testing (load time impact)
- [ ] Accessibility testing (color contrast)

### ✅ Phase 6: Documentation & Deployment
- [ ] Update developer documentation
- [ ] Create design system usage guide
- [ ] Document API endpoints
- [ ] Create deployment runbook
- [ ] Tag release version
- [ ] Deploy to production

---

## 🎯 Success Criteria

1. ✅ CMS Design System Manager can edit colors and save to backend
2. ✅ Frontend loads design system from backend API on startup
3. ✅ All 58 components use CSS variables (no hardcoded colors)
4. ✅ Light/Dark theme changes in CMS apply to frontend without rebuild
5. ✅ Zero regression - all existing features work identically
6. ✅ Performance impact < 100ms on initial load

---

## 🚀 Deployment Timeline

| Phase | Duration | Complexity | Dependencies |
|-------|----------|------------|--------------|
| Phase 1: Backend | 2-4 hours | Low | None |
| Phase 2: CMS | 3-5 hours | Medium | Phase 1 |
| Phase 3: Frontend Loader | 2-3 hours | Low | Phase 1 |
| Phase 4: Component Migration | 20-30 hours | High | Phase 3 |
| Phase 5: Testing | 4-6 hours | Medium | Phase 4 |
| Phase 6: Deployment | 2-3 hours | Low | Phase 5 |
| **TOTAL** | **33-51 hours** | **High** | Sequential |

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking existing styling | High | Medium | Incremental migration, thorough testing |
| API downtime affects frontend | High | Low | Fallback to cached/default design system |
| Performance degradation | Medium | Low | Lazy load, cache design system |
| Browser compatibility | Medium | Low | Test on all major browsers |
| Color contrast accessibility | High | Medium | Automated contrast checker in CMS |

---

## 📖 Related Documentation

- `knowledge-base/cms-admin/design-system-manager.md` - CMS Design System Manager guide
- `knowledge-base/developer/css-variables.md` - CSS variable usage patterns
- `knowledge-base/workflows/theme-customization.md` - Theme customization workflow

---

**Next Steps:** Approve this plan, then proceed with Phase 1 implementation.
