# EditorModalV2 Complete Rendering Flow Documentation

## Summary
**EditorModalV2 uses TWO DIFFERENT rendering systems depending on the view:**

1. **Edit View** (inline editing) → CMS Admin AssetRenderEngine
2. **Preview View** (Preview button) → Viewer App AssetRenderEngine

---

## 1. EDIT VIEW (Inline Section Editing)

### Import Chain:
```
EditorModalV2.tsx (line 6)
  ↓
import { AssetRenderEngine } from '../renderers/assetRenderEngine'
  ↓
/cms-admin/src/renderers/assetRenderEngine.tsx
  ↓
imports patterns from /cms-admin/src/renderers/assetRenderLists.tsx
```

### Usage Locations in EditorModalV2:
- **Line 381**: Asset preview in properties panel
- **Line 575**: Section content rendering (left side)
- **Line 611**: Section content rendering (alternative)
- **Line 643**: Section content rendering (another location)

### CSS File:
- `/cms-admin/src/renderers/assetRenderEngine.css` (imported line 7)
- Loaded via: `import '../renderers/assetRenderEngine.css'`

### Components Used:
- KeyValueListPattern from `/cms-admin/src/renderers/assetRenderLists.tsx`
  - Outputs: `<div class="keyvalue-list"><div class="keyvalue-item"><span class="keyvalue-label">...<span class="keyvalue-value">...</div></div>`

---

## 2. PREVIEW VIEW (When "Preview" Button Clicked)

### Import Chain:
```
EditorModalV2.tsx (line 9)
  ↓
import PreviewModal from './PreviewModal'
  ↓
/cms-admin/src/components/PreviewModal.tsx (line 1)
  ↓
import { ContentModal } from '../../../src/components/ContentModal'
  ↓
/src/components/ContentModal.tsx (line 3)
  ↓
import { AssetRenderEngine } from '../renderers/assetRenderEngine'
  ↓
/src/renderers/assetRenderEngine.tsx
  ↓
imports patterns from /src/renderers/assetRenderLists.tsx
```

### Usage Location in EditorModalV2:
- **Line 1896-1901**: PreviewModal component render

### CSS File:
- `/src/index.css` (main stylesheet for viewer app)
- Loaded automatically when viewer app components load

### Components Used:
- KeyValueListPattern from `/src/renderers/assetRenderLists.tsx`
  - Outputs: `<dl><div><dt>Label:</dt><dd>Value</dd></div></dl>`

---

## 3. KEY DIFFERENCES

| Aspect | Edit View | Preview View |
|--------|-----------|--------------|
| **Location** | `/cms-admin/src/renderers/` | `/src/renderers/` |
| **AssetRenderEngine** | CMS Admin version | Viewer App version |
| **CSS File** | `assetRenderEngine.css` | `index.css` |
| **KeyValueList HTML** | `<div class="keyvalue-list">` | `<dl><div>` |
| **KeyValueList Classes** | `.keyvalue-label`, `.keyvalue-value` | `<dt>`, `<dd>` |
| **ProgressBarList HTML** | `<div class="progress-item">` | Same |
| **Top5List HTML** | `.top5-list`, `.top5-item` | Same structure |

---

## 4. WHY THIS MATTERS

When you click **"Preview"** in EditorModalV2:
1. showPreview state becomes true
2. PreviewModal renders
3. PreviewModal wraps data in ThemeProvider/PresentationProvider
4. PreviewModal renders **ContentModal** from `/src` (viewer app)
5. ContentModal uses **AssetRenderEngine** from `/src/renderers`
6. AssetRenderEngine calls patterns from `/src/renderers/assetRenderLists.tsx`
7. CSS comes from `/src/index.css`

**This is NOT the CMS admin rendering system!**

---

## 5. FILE PATHS TO EDIT

### For EDIT VIEW (inline editing):
- `/cms-admin/src/renderers/assetRenderEngine.css`
- `/cms-admin/src/renderers/assetRenderLists.tsx`
- `/cms-admin/src/renderers/assetRenderEngine.tsx`

### For PREVIEW VIEW (Preview button):
- `/src/index.css`
- `/src/renderers/assetRenderLists.tsx`
- `/src/renderers/assetRenderEngine.tsx`

---

## 6. CURRENT STYLING STATUS

### KeyValueList:

**Edit View** (CMS Admin):
- CSS: `/cms-admin/src/renderers/assetRenderEngine.css` lines 375-401
- Classes: `.keyvalue-label`, `.keyvalue-value`
- Status: ✅ STYLED (0.875rem, purple label, same line)

**Preview View** (Viewer):
- CSS: `/src/index.css` lines 330-358
- Elements: `<dt>`, `<dd>`
- Status: ✅ STYLED (0.875rem, #431C5B purple label, same line)

### ProgressBarList:

**Both views use same structure** but CSS is in different files:
- Edit: `/cms-admin/src/renderers/assetRenderEngine.css`
- Preview: `/src/index.css`
- Status: ✅ BOTH STYLED

### Top5List:

**Both views use same structure** but CSS is in different files:
- Edit: `/cms-admin/src/renderers/assetRenderEngine.css`
- Preview: `/src/index.css` (needs verification)
- Status: Edit ✅ / Preview ❓

---

## 7. DEBUGGING CHECKLIST

When styling isn't working:

1. **Where are you viewing?**
   - Edit view (left panel) → CMS Admin files
   - Preview modal (after clicking Preview) → Viewer files

2. **Check the HTML in browser inspector:**
   - `<div class="keyvalue-list">` → CMS Admin
   - `<dl><dt><dd>` → Viewer App

3. **Check CSS file is loaded:**
   - Edit: Look for `assetRenderEngine.css` in Network tab
   - Preview: Look for `index.css` in Network tab

4. **Clear build cache:**
   - Stop servers
   - Delete `node_modules/.vite` in both `/cms-admin` and root
   - Restart: `npm run dev`

---

## 8. RENDERING COMPONENTS MAP

```
┌─────────────────────────────────────────────────────┐
│          EditorModalV2.tsx                          │
│                                                     │
│  ┌────────────────┐      ┌────────────────────┐   │
│  │   EDIT VIEW    │      │   PREVIEW VIEW     │   │
│  │                │      │                    │   │
│  │ AssetRender    │      │  PreviewModal      │   │
│  │ Engine         │      │    ↓               │   │
│  │ (CMS Admin)    │      │  ContentModal      │   │
│  │    ↓           │      │    (Viewer)        │   │
│  │ assetRender    │      │    ↓               │   │
│  │ Lists.tsx      │      │  AssetRender       │   │
│  │ (CMS Admin)    │      │  Engine            │   │
│  │    ↓           │      │  (Viewer)          │   │
│  │ assetRender    │      │    ↓               │   │
│  │ Engine.css     │      │  assetRender       │   │
│  │                │      │  Lists.tsx         │   │
│  │                │      │  (Viewer)          │   │
│  │                │      │    ↓               │   │
│  │                │      │  index.css         │   │
│  └────────────────┘      └────────────────────┘   │
└─────────────────────────────────────────────────────┘
```
