# Snap Layout Feature - Template Builder

> **Implementation Date:** November 9, 2025  
> **Status:** BETA - Feature Flag Enabled  
> **Branch:** feature/api-backend-cms

---

## Overview

Windows-style Snap Layout system for the Template Builder that allows multi-column layouts with visual zone selection. Inspired by Windows 11's window snapping feature.

---

## Features

### Visual Zone Selection

When dragging assets from the library, a visual overlay appears showing available layout options:

**Row 1: Basic Layouts**
- **Single Box** - Full width (100%)
- **Two Equal Boxes** - 50/50 split
- **Three Equal Boxes** - 33/33/33 split

**Row 2: Asymmetric Layouts**
- **Wide + Small** - 70/30 split
- **Small + Wide** - 30/70 split

### Sequential Auto-Placement Logic

The snap layout intelligently places assets sequentially within the chosen layout pattern:

#### Example: Three Column Layout (33/33/33)

1. **First Asset** → Dropped on "Three Columns" zone → Goes to `left-33` (first column)
2. **Second Asset** → Dropped on "Three Columns" zone → Goes to `middle-33` (second column, same row)
3. **Third Asset** → Dropped on "Three Columns" zone → Goes to `right-33` (third column, same row)
4. **Fourth Asset** → Dropped on "Three Columns" zone → Goes to `left-33` (first column, new row)

#### Example: 70/30 Layout

1. **First Asset** → Dropped on "70/30" left zone → Goes to `left-70`
2. **Second Asset** → Dropped on "70/30" right zone → Goes to `right-30` (same row)
3. **Third Asset** → Dropped on "70/30" left zone → Goes to `left-70` (new row)

#### Example: 50/50 Layout

1. **First Asset** → Dropped on left 50% zone → Goes to `left-50`
2. **Second Asset** → Dropped on right 50% zone → Goes to `right-50` (same row)
3. **Third Asset** → Dropped on left 50% zone → Goes to `left-50` (new row)

---

## Implementation Details

### Data Model

```typescript
type LayoutZone = 
  | 'full' 
  | 'left-50' | 'right-50' 
  | 'left-70' | 'right-30' 
  | 'left-30' | 'right-70'
  | 'left-33' | 'middle-33' | 'right-33';

interface TemplateField {
  // ... existing properties
  layoutZone?: LayoutZone;  // Optional - defaults to 'full'
  rowIndex?: number;         // Optional - defaults to 0
}
```

### Zone Placement Logic

**File:** `cms-admin/src/components/TemplateBuilder.tsx`

```typescript
const handleZoneDrop = (sectionId: string, zone: LayoutZone) => {
  // Group existing fields by row
  const fieldsByRow = groupFieldsByRow(section.fields);
  
  // For multi-column zones:
  // 1. Check existing rows for available slots
  // 2. If row incomplete (e.g., only left-50 exists), fill it
  // 3. If all rows full, create new row
  
  // For full width zones:
  // Always create new row
  
  // Examples:
  // - Drop on left-50: Creates left-50 in new row
  // - Drop on right-50 when left-50 exists: Fills same row
  // - Drop on middle-33 when left-33 exists: Fills same row
  // - Drop on right-33 when left-33 + middle-33 exist: Fills same row
};
```

### Row-Based Rendering

```typescript
// Group fields by row
const groupFieldsByRow = (fields: TemplateField[]): Record<number, TemplateField[]> => {
  return fields.reduce((acc, field) => {
    const row = field.rowIndex ?? 0;
    if (!acc[row]) acc[row] = [];
    acc[row].push(field);
    return acc;
  }, {});
};

// Render in rows
{Object.entries(groupFieldsByRow(section.fields))
  .sort(([a], [b]) => Number(a) - Number(b))
  .map(([rowIndex, rowFields]) => (
    <div className="flex gap-4">
      {rowFields.map(field => (
        <div className={getWidthClass(field.layoutZone)}>
          {/* Field content */}
        </div>
      ))}
    </div>
  ))
}
```

### Width Mapping

```typescript
const getWidthClass = (zone?: LayoutZone): string => {
  const widthMap = {
    'full': 'w-full',           // 100%
    'left-50': 'w-1/2',         // 50%
    'right-50': 'w-1/2',        // 50%
    'left-70': 'w-[70%]',       // 70%
    'right-30': 'w-[30%]',      // 30%
    'left-30': 'w-[30%]',       // 30%
    'right-70': 'w-[70%]',      // 70%
    'left-33': 'w-1/3',         // 33.33%
    'middle-33': 'w-1/3',       // 33.33%
    'right-33': 'w-1/3',        // 33.33%
  };
  return widthMap[zone || 'full'] || 'w-full';
};
```

---

## UI/UX Details

### Visual Overlay

- **Appearance:** Translucent zones with dashed borders
- **Hover State:** Purple gradient background + scale animation
- **Size:** Extends beyond section bounds (`-inset-2`)
- **Height:** Taller zones (h-32) for easier targeting

### Section Auto-Expand

When dragging an asset over a collapsed section in snap mode, it automatically expands to show the zone overlay.

### Feature Toggle

Located in Template Builder header:
- **Off (Default):** Classic single-column layout
- **On:** Snap layout with zone overlay
- **Badge:** Shows "BETA" when enabled

### Minimum Height

Sections in snap mode have increased minimum height (`min-h-[500px]`) to accommodate the zone overlay.

---

## Backward Compatibility

### No Breaking Changes

- Fields without `layoutZone` default to `'full'`
- Fields without `rowIndex` default to `0`
- Existing templates render correctly in both modes
- Can toggle between classic and snap mode without data loss

### Migration Path

No migration required. Existing templates:
1. Load with all fields having `layoutZone: 'full'` and `rowIndex: 0`
2. Render in single column in classic mode
3. Render in single column in snap mode (all full width)
4. Can be edited to add multi-column layouts

---

## Testing Guide

### Basic Layout Tests

1. **Full Width**
   - Drag asset to single box zone
   - Should create full-width field

2. **50/50 Split**
   - Drag first asset to left 50% zone
   - Drag second asset to right 50% zone
   - Should create two fields side-by-side in same row

3. **Three Column**
   - Drag three assets to three-column zones (left, middle, right)
   - Should create three fields side-by-side in same row

4. **70/30 Split**
   - Drag first asset to 70% zone
   - Drag second asset to 30% zone
   - Should create asymmetric layout

5. **30/70 Split**
   - Drag first asset to 30% zone
   - Drag second asset to 70% zone
   - Should create reverse asymmetric layout

### Sequential Placement Tests

1. **Three Column Sequential**
   - Drop 5 assets all on three-column zones
   - Should create: Row 1 (3 cols), Row 2 (2 cols)

2. **50/50 Sequential**
   - Drop 5 assets all on 50/50 zones
   - Should create: Row 1 (2 cols), Row 2 (2 cols), Row 3 (1 col)

3. **Mixed Layouts**
   - Drop full width asset
   - Drop two 50/50 assets
   - Drop full width asset
   - Should create 4 rows with correct layouts

### Edge Cases

1. **Empty Section**
   - First drop should work in any zone

2. **Toggle Mode**
   - Create multi-column layout
   - Toggle to classic mode
   - Should show all fields in single column
   - Toggle back to snap mode
   - Should restore multi-column layout

3. **Template Save/Load**
   - Create template with multi-column layout
   - Save template
   - Load template
   - Should preserve exact layout

---

## Known Limitations (BETA)

1. **No Manual Zone Change**: Cannot change a field's zone after placement (must delete and re-add)
2. **No Row Reordering**: Cannot drag fields between rows (classic drag-drop only works within row)
3. **Fixed Zone Order**: Assets always fill left-to-right in sequential order
4. **No EditorModalV2 Support**: Multi-column rendering not yet implemented in editor modal preview
5. **No ContentModal Support**: Final rendered summaries don't yet support multi-column layouts

---

## Future Enhancements

### Phase 3: Advanced Editing
- [ ] Change field zone via dropdown
- [ ] Drag-and-drop between zones
- [ ] Row reordering

### Phase 4: Editor Modal Support
- [ ] Multi-column preview in EditorModalV2
- [ ] Zone-aware field editing

### Phase 5: Renderer Support
- [ ] ContentModal multi-column rendering
- [ ] Print layout optimization

### Phase 6: Template Patterns
- [ ] Save layout patterns as templates
- [ ] Quick apply layout to section
- [ ] Layout presets (dashboard, report, etc.)

---

## Files Modified

### Core Implementation
- `cms-admin/src/components/TemplateBuilder.tsx` (+400 lines)
  - LayoutZone type definitions
  - SnapZoneOverlay component
  - handleZoneDrop logic
  - Row-based rendering
  - Feature flag toggle

### Future Work Required
- `cms-admin/src/components/EditorModalV2.tsx` (not yet updated)
- `cms-admin/src/components/ContentModal.tsx` (not yet updated)
- Renderer components (not yet updated)

---

## Commit History

**Commit 1:** `feat: Add Windows-style snap layout zones to Template Builder (Beta)`
- Type definitions for LayoutZone
- SnapZoneOverlay component with visual zones
- Sequential placement logic
- Row-based field grouping and rendering
- Feature flag toggle in UI
- Backward compatible data model

---

## Support & Documentation

**Questions?** Check:
- Template Builder source code comments
- This documentation file
- TEMPLATE_BUILDER_NOV_2025_ENHANCEMENTS.md for related features

**Found a bug?** Look for these patterns:
- Flickering zones → Check `pointer-events` and `stopPropagation`
- Wrong zone placement → Check `handleZoneDrop` logic
- Rendering issues → Check `groupFieldsByRow` and `getWidthClass`
