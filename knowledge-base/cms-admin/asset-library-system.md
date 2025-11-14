# Asset Library System

**Last Updated:** November 14, 2025  
**Status:** Complete and Production-Ready

---

## Overview

The Asset Library is a modern UI component that replaced the old AssetTypeReferenceModal on November 11, 2025. It provides live previews, category filtering, and search functionality for all 22 asset types.

**Key Improvement:** Centralized asset definitions with visual previews instead of text-only descriptions.

---

## Architecture

### Component Structure

```
AssetLibrary.tsx (UI Component)
         ↓
assetDataStore.ts (22 Asset Definitions)
         ↓
assetRenderEngine.tsx (Master Orchestrator)
         ↓
Pattern Files (6 Specialized Renderers)
├── assetRenderText.tsx (5 assets)
├── assetRenderLists.tsx (5 assets)
├── assetRenderCards.tsx (5 assets)
├── assetRenderCharts.tsx (4 assets)
├── assetRenderComplex.tsx (4 assets)
└── assetRenderUtility.tsx (2 assets)
         ↓
assetRenderEngine.css (Design System Styling)
```

---

## File Locations

### Core Files
- **AssetLibrary.tsx**: `/cms-admin/src/components/AssetLibrary.tsx`
- **assetDataStore.ts**: `/cms-admin/src/schemas/assetDataStore.ts`
- **assetRenderEngine.tsx**: `/cms-admin/src/renderers/assetRenderEngine.tsx`
- **assetRenderEngine.css**: `/cms-admin/src/renderers/assetRenderEngine.css`

### Pattern Files
All located in `/cms-admin/src/renderers/`:
- `assetRenderText.tsx`
- `assetRenderLists.tsx`
- `assetRenderCards.tsx`
- `assetRenderCharts.tsx`
- `assetRenderComplex.tsx`
- `assetRenderUtility.tsx`

---

## Asset Data Store

**Single source of truth** for all asset definitions.

### Asset Definition Structure

```typescript
export interface AssetDefinition {
  id: string;                    // Unique ID (e.g., 'text', 'pieChart')
  name: string;                  // Display name
  category: AssetCategory;       // 'basic' | 'lists' | 'charts' | 'complex' | 'rich' | 'media'
  icon: string;                  // Icon name (lucide-react)
  description: string;           // Short description
  renderType: string;            // Maps to RenderFactory types
  schema: any;                   // JSON schema definition
  exampleData: any;              // Sample data for preview
}
```

### Example Asset Definition

```typescript
{
  id: 'text',
  name: 'Text Input',
  category: 'basic',
  icon: 'Type',
  description: 'Single line text input',
  renderType: 'text',
  schema: {
    type: 'string',
    label: 'Text Field'
  },
  exampleData: 'Revenue Operations Team'
}
```

---

## 22 Asset Types

### Basic (4)
1. **text** - Single-line text input
2. **textarea** - Multi-line text area
3. **richText** - Rich text with formatting
4. **quote** - Blockquote with styling

### Lists (6)
5. **highlightsList** - Bulleted list with highlights
6. **bulletList** - Standard bulleted list
7. **checklistItems** - Checklist with checkboxes
8. **progressBarList** - List items with progress bars
9. **keyValueList** - Key-value pairs with labels
10. **nestedCards** - Expandable card list

### Charts (4)
11. **metricCard** - Single metric display
12. **radialProgressChart** - Circular progress chart
13. **pieChart** - Pie chart with segments
14. **barChart** - Vertical bar chart

### Complex (4)
15. **statusBoard** - Multi-column status board
16. **timeline** - Event timeline
17. **twoColumnComparison** - Side-by-side comparison
18. **problemSolutionBox** - Problem/solution layout

### Rich (3)
19. **codeBlock** - Syntax-highlighted code
20. **hr** - Horizontal rule divider
21. **number** - Numeric display with formatting

### Media (0)
*Placeholder category for future image/video assets*

---

## Asset Render Engine

**Master orchestrator** that routes asset IDs to their pattern renderers.

### How It Works

```typescript
export const renderAsset = (assetId: string, data?: any) => {
  // Find asset in datastore
  const asset = assets.find(a => a.id === assetId);
  
  // Route to pattern file based on category
  if (['text', 'textarea', 'richText', 'quote', 'codeBlock'].includes(assetId)) {
    return renderTextAsset(asset, data);
  }
  else if (['highlightsList', 'bulletList', ...].includes(assetId)) {
    return renderListAsset(asset, data);
  }
  // ... more routing logic
};
```

### Pattern File Responsibilities

Each pattern file:
1. ✅ Contains **ONLY** logic and structure (no styling)
2. ✅ Uses semantic class names from assetRenderEngine.css
3. ✅ Returns JSX for live preview
4. ✅ Uses asset.exampleData if no data provided

Example:
```typescript
// assetRenderText.tsx
export const renderTextAsset = (asset, data) => {
  if (asset.id === 'text') {
    return <div className="asset-text-preview">{data || asset.exampleData}</div>;
  }
  // ... more text assets
};
```

---

## Design System Compliance

### Semantic CSS Variables

All colors in `assetRenderEngine.css` use design system tokens:

```css
.asset-card {
  background: var(--brand-primary);  /* Purple */
  border: 1px solid var(--brand-secondary);  /* Pink */
}

.asset-success {
  color: var(--accent-green);
}

.asset-warning {
  color: var(--accent-orange);
}

.asset-error {
  color: var(--accent-red);
}
```

**❌ FORBIDDEN:** Hardcoded hex values like `#431C5B`  
**✅ REQUIRED:** Semantic variables like `var(--brand-primary)`

---

## AssetLibrary Component

### Features

1. **Category Filtering**
   - Tabs for each category (All, Basic, Lists, Charts, Complex, Rich, Media)
   - Active tab highlighted
   - Counts displayed per category

2. **Search**
   - Real-time filtering by asset name or description
   - Case-insensitive
   - Highlights matching text

3. **View Toggle**
   - Grid view (default): 2-column asset cards
   - List view: Compact single-column list
   - Preference saved to localStorage

4. **Live Previews**
   - Each asset shows example data rendered
   - Uses assetRenderEngine for consistent display
   - Updates when hovering/selecting

5. **Asset Selection**
   - Click asset to select
   - Selected state highlighted
   - Returns asset definition to parent

### Usage in Template Builder

```typescript
import { AssetLibrary } from './components/AssetLibrary';

// In TemplateBuilder.tsx
const [showAssetLibrary, setShowAssetLibrary] = useState(false);
const [selectedAsset, setSelectedAsset] = useState(null);

<AssetLibrary
  onSelect={(asset) => {
    setSelectedAsset(asset);
    setShowAssetLibrary(false);
    // Add asset to template
  }}
  onClose={() => setShowAssetLibrary(false)}
/>
```

---

## Adding a New Asset

### Step 1: Add to assetDataStore.ts

```typescript
{
  id: 'newAssetType',
  name: 'New Asset Type',
  category: 'basic', // or 'lists', 'charts', etc.
  icon: 'FileText', // lucide-react icon
  description: 'Description of what this asset does',
  renderType: 'newAssetType', // Must match RenderFactory type
  schema: {
    type: 'string', // or 'array', 'object', etc.
    label: 'Asset Label'
  },
  exampleData: 'Example data here'
}
```

### Step 2: Add Pattern Renderer

Choose appropriate pattern file (or create new one):

```typescript
// In assetRenderText.tsx (or relevant file)
export const renderTextAsset = (asset, data) => {
  // ... existing assets
  
  if (asset.id === 'newAssetType') {
    return (
      <div className="asset-new-preview">
        {data || asset.exampleData}
      </div>
    );
  }
};
```

### Step 3: Add CSS Styling

```css
/* In assetRenderEngine.css */
.asset-new-preview {
  padding: var(--spacing-md);
  background: var(--brand-primary);
  color: var(--text-light);
  border-radius: var(--radius-md);
}
```

### Step 4: Update assetRenderEngine.tsx Routing

```typescript
if (['text', 'textarea', 'newAssetType'].includes(assetId)) {
  return renderTextAsset(asset, data);
}
```

### Step 5: Test in Asset Library

1. Open Template Builder
2. Click "Add Asset" or similar
3. Asset Library opens
4. Filter to your category
5. Verify asset appears with live preview
6. Select asset and verify it adds to template

---

## Known Issues & Future Work

### Pending Fixes (as of Nov 14)
1. **Progress Bar List** - Needs redesign for multiple tasks with individual bars
2. **Pie Chart** - Colors need primary palette mapping
3. **Bar Chart** - Colors and legend labels need refinement
4. **Timeline** - Display verification needed
5. **Two-Column Comparison** - Purpose/usage clarification needed

### Future Enhancements
- [ ] Drag-and-drop asset sorting
- [ ] Custom asset creation UI
- [ ] Asset presets/templates
- [ ] Import/export asset definitions
- [ ] Media category population (images, videos, embeds)

---

## Troubleshooting

### Asset Not Showing in Library

**Check:**
1. Asset defined in `assetDataStore.ts`?
2. Category is valid? ('basic', 'lists', 'charts', 'complex', 'rich', 'media')
3. Icon name exists in lucide-react?

### Asset Preview Not Rendering

**Check:**
1. Pattern file has case for this asset ID?
2. assetRenderEngine.tsx routes to correct pattern file?
3. CSS classes defined in assetRenderEngine.css?
4. Using semantic variables (not hex colors)?

### Asset Selection Not Working

**Check:**
1. AssetLibrary has `onSelect` prop?
2. Parent component handles selected asset?
3. Console errors when clicking?

---

## Related Documentation

- [Template Builder Guide →](./template-builder.md)
- [Adding New Assets →](../developer/adding-new-assets.md)
- [Design System Reference →](../reference/design-system.md)

---

*Part of the CMS Admin Knowledge Base - November 14, 2025*
