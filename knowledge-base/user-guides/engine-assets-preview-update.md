# Engine Assets Preview - Layout Update

## Changes Made

### 1. **Categories Collapsed by Default**
```typescript
const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set([]));
// Was: new Set(['basic', 'lists', 'complex', 'rich', 'charts'])
```

### 2. **New Two-Column Layout**

**Previous Layout:**
```
[        Rendered Preview        ]
[     Sample Data (Bottom 40%)   ]
```

**New Layout:**
```
┌─────────────────────────────────────────────────────┐
│  [  Sample Data Editor  ] [ Rendered Output    ]    │
│  [   with Refresh      ] [  (Live Preview)    ]     │
├─────────────────────────────────────────────────────┤
│  ▶ JSON Schema (Collapsible - Full Width)          │
└─────────────────────────────────────────────────────┘
```

### 3. **Chart Rendering Fixed**
- **Problem:** Recharts library was not installed in cms-admin package
- **Solution:** Added `recharts` to cms-admin dependencies
- **Command:** `npm install recharts`

### 4. **Improved Space Utilization**
- **Left Column (50%):** JSON editor with 300px height + Refresh button
- **Right Column (50%):** Rendered preview with centered content
- **Bottom:** Collapsible JSON schema section (full width)

## Layout Breakdown

### Left Panel - Sample Data Editor
- Background: Light gray (#f9fafb)
- Contains:
  - Title: "Sample Data Editor"
  - Textarea (300px height, monospace, dark theme)
  - Error display (if JSON invalid)
  - Full-width "Refresh Preview" button

### Right Panel - Rendered Output
- Background: White
- Contains:
  - Live rendered asset
  - Centered display
  - Matches height of left panel (300px min)

### Bottom Panel - JSON Schema
- Collapsible section
- Click to expand/collapse
- Shows complete schema when expanded
- Full width across both columns
- Dark code block styling

## Benefits

✅ **Better Space Usage** - Side-by-side editing and preview
✅ **Cleaner Navigation** - Collapsed categories by default
✅ **Charts Working** - Recharts dependency installed
✅ **Less Scrolling** - Content fits better on screen
✅ **Clear Workflow** - Edit → Refresh → See Result

## Files Modified

1. **`cms-admin/src/components/EngineAssetsPreview.tsx`**
   - Changed default expanded categories to empty set
   - Added `jsonExpanded` state
   - Restructured preview area with grid layout
   - Moved JSON editor to left column
   - Added collapsible schema section

2. **`cms-admin/package.json`**
   - Added `recharts` dependency

---

**Status:** ✅ Complete - Charts now render, better layout
