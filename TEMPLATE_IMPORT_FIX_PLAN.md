# Template Import Fix Plan - Multi-Column Layout Reconstruction

**Date:** November 10, 2025  
**Component:** `cms-admin/src/components/TemplateBuilder.tsx`  
**Function:** `loadTemplate()` (Lines 1017-1113)  
**Issue:** Import creates separate sections for multi-column fields instead of grouping them

---

## Problem Analysis

### Current Behavior (BROKEN)

When loading `test-template-a.json` with multi-column sections:

**Template JSON Structure:**
```json
{
  "lists_0": [...],
  "_lists_0_type": "list",
  "_enabled_lists": true,
  "_completed_lists": false,
  
  "lists_1": [...],
  "_lists_1_type": "list",
  
  "charts_0": [...],
  "_charts_0_type": "pieChart",
  
  "charts_1": [...],
  "_charts_1_type": "radialChart",
  
  "charts_2": [...],
  "_charts_2_type": "barChart",
  "_enabled_charts": true,
  "_completed_charts": false
}
```

**Current loadTemplate() Output:**
```typescript
[
  { id: 'section-1', name: 'Lists 0', fields: [{ key: 'lists_0' }] },
  { id: 'section-2', name: 'Lists 1', fields: [{ key: 'lists_1' }] },
  { id: 'section-3', name: 'Charts 0', fields: [{ key: 'charts_0' }] },
  { id: 'section-4', name: 'Charts 1', fields: [{ key: 'charts_1' }] },
  { id: 'section-5', name: 'Charts 2', fields: [{ key: 'charts_2' }] }
]
```

**❌ Result:** 5 separate sections instead of 2 multi-column sections

---

### Expected Behavior (CORRECT)

**Should Reconstruct As:**
```typescript
[
  {
    id: 'section-lists',
    name: 'Lists',
    sectionLayoutType: 'left-50',  // 2-column layout
    fields: [
      { key: 'lists_0', layoutZone: 'left-50', rowIndex: 0 },
      { key: 'lists_1', layoutZone: 'right-50', rowIndex: 0 }
    ]
  },
  {
    id: 'section-charts',
    name: 'Charts',
    sectionLayoutType: 'left-33',  // 3-column layout
    fields: [
      { key: 'charts_0', layoutZone: 'left-33', rowIndex: 0 },
      { key: 'charts_1', layoutZone: 'middle-33', rowIndex: 0 },
      { key: 'charts_2', layoutZone: 'right-33', rowIndex: 0 }
    ]
  }
]
```

**✅ Result:** 2 sections with proper multi-column layout

---

## Detection Logic

### Pattern Recognition

**Multi-column fields follow this naming pattern:**
- `baseKey_0`, `baseKey_1`, `baseKey_2` (indexed suffixes)
- Share common `_enabled_baseKey` and `_completed_baseKey` flags
- Sequential numeric indexes starting from 0

**Detection Algorithm:**
1. Extract base key by removing `_\d+$` pattern
2. Group all keys with same base key
3. Count: 1 field = single column, 2+ fields = multi-column
4. Infer layout type from count

### Layout Type Inference

| Field Count | Layout Type | Zones |
|-------------|-------------|-------|
| 1 | `'full'` | `['full']` |
| 2 | `'left-50'` | `['left-50', 'right-50']` |
| 3 | `'left-33'` | `['left-33', 'middle-33', 'right-33']` |

**Note:** Cannot distinguish between 70/30 and 30/70 layouts from JSON alone - default to left-heavy (70/30)

---

## Implementation Plan

### Step 1: Group Fields by Base Key

**Location:** Insert before `Object.keys(templateData).forEach()`

```typescript
// Group fields by base key (handle multi-column sections)
const fieldGroups = new Map<string, string[]>();

Object.keys(templateData).forEach(key => {
  if (key.startsWith('_') || ['id', 'quarter', 'year', 'date', 'title', 'status', 'protectionEnabled'].includes(key)) {
    return;
  }
  
  // Extract base key (remove _0, _1, _2 suffix)
  const baseKey = key.replace(/_\d+$/, '');
  
  if (!fieldGroups.has(baseKey)) {
    fieldGroups.set(baseKey, []);
  }
  fieldGroups.get(baseKey)!.push(key);
});
```

### Step 2: Infer Layout Type

**Location:** Inside field group processing loop

```typescript
const inferLayoutType = (fieldCount: number): LayoutZone => {
  switch (fieldCount) {
    case 1: return 'full';
    case 2: return 'left-50';
    case 3: return 'left-33';
    default: return 'full'; // Fallback
  }
};

const getLayoutZones = (layoutType: LayoutZone): LayoutZone[] => {
  switch (layoutType) {
    case 'full': return ['full'];
    case 'left-50': return ['left-50', 'right-50'];
    case 'left-33': return ['left-33', 'middle-33', 'right-33'];
    case 'left-70': return ['left-70', 'right-30'];
    case 'left-30': return ['left-30', 'right-70'];
    default: return ['full'];
  }
};
```

### Step 3: Reconstruct Sections

**Location:** Replace existing `Object.keys(templateData).forEach()` block

```typescript
fieldGroups.forEach((fieldKeys, baseKey) => {
  const layoutType = inferLayoutType(fieldKeys.length);
  const zones = getLayoutZones(layoutType);
  const fields: Field[] = [];
  
  fieldKeys.forEach((key, index) => {
    const itemSchema = templateData[`_${key}_itemSchema`];
    const sectionType = templateData[`_${key}_type`];
    const chartConfig = templateData[`_${key}_chartConfig`];
    
    let renderType = sectionType;
    if (itemSchema?.renderAs) {
      renderType = itemSchema.renderAs;
    }
    
    if (renderType || itemSchema) {
      const field: Field = {
        id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        key: key,
        label: formatSectionTitle(key),
        renderType: renderType || 'text',
        schema: {
          type: itemSchema?.type || 'string',
          renderAs: renderType || 'text',
          label: itemSchema?.label || formatSectionTitle(key),
          ...(itemSchema?.itemSchema && { itemSchema: itemSchema.itemSchema }),
          ...(chartConfig && { chartConfig }),
          ...(itemSchema?.placeholder && { placeholder: itemSchema.placeholder }),
          ...(itemSchema?.suffix && { suffix: itemSchema.suffix }),
          ...(itemSchema?.options && { options: itemSchema.options })
        },
        layoutZone: zones[index] || zones[0],  // Assign zone based on index
        rowIndex: 0  // All in same row for now (multi-row support later)
      };
      
      fields.push(field);
    }
  });
  
  if (fields.length > 0) {
    newSections.push({
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: formatSectionTitle(baseKey),
      expanded: true,
      fields: fields,
      sectionLayoutType: layoutType  // Set layout type for section
    });
  }
});
```

### Step 4: Preserve Section Order

**Challenge:** `Map` iteration order may not match original template order

**Solution:** Track field order from original template

```typescript
// Extract field order from template
const fieldOrder: string[] = [];
Object.keys(templateData).forEach(key => {
  if (!key.startsWith('_') && !['id', 'quarter', 'year', 'date', 'title', 'status', 'protectionEnabled'].includes(key)) {
    fieldOrder.push(key);
  }
});

// Create ordered base keys list (deduplicated)
const orderedBaseKeys: string[] = [];
const seenBaseKeys = new Set<string>();

fieldOrder.forEach(key => {
  const baseKey = key.replace(/_\d+$/, '');
  if (!seenBaseKeys.has(baseKey)) {
    orderedBaseKeys.push(baseKey);
    seenBaseKeys.add(baseKey);
  }
});

// Process in order
orderedBaseKeys.forEach(baseKey => {
  const fieldKeys = fieldGroups.get(baseKey);
  if (!fieldKeys) return;
  
  // ... rest of reconstruction logic
});
```

---

## Edge Cases

### 1. Single Field Sections

**Example:** Single-column section exports as `outlook` (no `_0` suffix)

**Handling:** 
- Detect: No `_0` suffix on key
- Create section with `sectionLayoutType: 'full'`
- Single field with `layoutZone: 'full'`, `rowIndex: 0`

### 2. Multi-Column Sections

**Example:** Two-column section exports as `lists_0`, `lists_1`

**Handling:**
- Detect: Keys with `_0`, `_1` suffixes
- Group by base key (`lists`)
- Infer layout from count (2 = left-50/right-50)
- Create section with both fields

### 3. Non-Sequential Indexes

**Example:** `field_0`, `field_2` (missing `field_1` - shouldn't happen)

**Handling:**
- Template Builder never exports this pattern
- If encountered: Still group by base key, assign zones in order
- Visual gap acceptable for malformed data

### 4. Mixed Layout Types in Same Template

**Example:** Template has both 2-column and 3-column sections

**Handling:**
- Each section independently calculates layout type
- No conflicts - each section has own `sectionLayoutType`

---

## Testing Plan

### Test Case 1: Two-Column Layout

**Input:**
```json
{
  "lists_0": [...],
  "_lists_0_type": "list",
  "lists_1": [...],
  "_lists_1_type": "list",
  "_enabled_lists": true
}
```

**Expected Output:**
```typescript
{
  name: 'Lists',
  sectionLayoutType: 'left-50',
  fields: [
    { key: 'lists_0', layoutZone: 'left-50', rowIndex: 0 },
    { key: 'lists_1', layoutZone: 'right-50', rowIndex: 0 }
  ]
}
```

### Test Case 2: Three-Column Layout

**Input:**
```json
{
  "charts_0": [...],
  "charts_1": [...],
  "charts_2": [...],
  "_enabled_charts": true
}
```

**Expected Output:**
```typescript
{
  name: 'Charts',
  sectionLayoutType: 'left-33',
  fields: [
    { key: 'charts_0', layoutZone: 'left-33', rowIndex: 0 },
    { key: 'charts_1', layoutZone: 'middle-33', rowIndex: 0 },
    { key: 'charts_2', layoutZone: 'right-33', rowIndex: 0 }
  ]
}
```

### Test Case 3: Single-Column Sections

**Input:**
```json
{
  "outlook": "...",
  "_outlook_type": "textarea",
  "_enabled_outlook": true
}
```

**Expected Output:**
```typescript
{
  name: 'Outlook',
  sectionLayoutType: 'full',
  fields: [
    { key: 'outlook', layoutZone: 'full', rowIndex: 0 }
  ]
}
```

### Test Case 4: Mixed Sections

**Input:** Combination of single, 2-column, and 3-column sections

**Expected:** Each section correctly reconstructed with appropriate layout

---

## Implementation Checklist

- [ ] Add field grouping logic before forEach loop
- [ ] Implement `inferLayoutType()` helper function
- [ ] Implement `getLayoutZones()` helper function
- [ ] Preserve field order with ordered base keys
- [ ] Replace forEach loop with ordered processing
- [ ] Assign `layoutZone` to each field
- [ ] Assign `sectionLayoutType` to each section
- [ ] Test with test-template-a.json (has multi-column)
- [ ] Test with single-column-only template (backward compat)
- [ ] Test with comprehensive-test-template-fixed.json
- [ ] Verify sections render correctly in UI
- [ ] Verify drag-drop still works
- [ ] Verify save/export maintains multi-column structure

---

## Code Location

**File:** `cms-admin/src/components/TemplateBuilder.tsx`  
**Function:** `loadTemplate()`  
**Lines:** 1017-1113  
**Specific Section:** Lines 1049-1101 (forEach loop)

---

## Template Builder Export Format (SOURCE OF TRUTH)

**Single-Column Section:**
```json
{
  "outlook": "Looking ahead...",
  "_outlook_type": "textarea",
  "_enabled_outlook": true,
  "_completed_outlook": false
}
```
→ Key has NO numeric suffix

**Multi-Column Section (2 columns):**
```json
{
  "lists_0": [...],
  "_lists_0_type": "list",
  "lists_1": [...],
  "_lists_1_type": "list",
  "_enabled_lists": true,
  "_completed_lists": false
}
```
→ Keys have `_0`, `_1` suffixes, metadata uses base name

**Multi-Column Section (3 columns):**
```json
{
  "charts_0": [...],
  "_charts_0_type": "pieChart",
  "charts_1": [...],
  "_charts_1_type": "barChart",
  "charts_2": [...],
  "_charts_2_type": "radialChart",
  "_enabled_charts": true,
  "_completed_charts": false
}
```
→ Keys have `_0`, `_1`, `_2` suffixes

**Import Rule:** Only support this exact format (what Template Builder exports)

---

## Future Enhancements

1. **Multi-Row Support:** Currently assigns all fields to `rowIndex: 0`. Future: detect multiple rows in same section.
2. **70/30 vs 30/70 Detection:** Currently defaults to left-heavy. Future: store layout preference in metadata.
3. **4+ Column Layouts:** Currently only supports 1-3 columns. Future: extend zone types.

---

## Risk Assessment

**Low Risk:**
- Pure reconstruction logic, doesn't affect save/export
- No schema changes
- Only supports Template Builder's export format (single source of truth)
- Self-contained in loadTemplate function

**Testing Required:**
- `test-template-a.json` (builder-exported) must load correctly
- Multi-column sections must render in correct layout
- Section editing must preserve layout
- Re-saving must maintain structure
- Round-trip test: export → import → export → compare JSONs

---

## Success Criteria

1. ✅ `test-template-a.json` (builder-exported) loads with correct section count
2. ✅ `lists` section shows 2-column layout (left-50/right-50)
3. ✅ `charts` section shows 3-column layout (left-33/middle-33/right-33)
4. ✅ Single-column sections (no `_0` suffix) remain full-width
5. ✅ Section order matches original template
6. ✅ Save/export preserves multi-column structure
7. ✅ No errors in console
8. ✅ Round-trip test passes: export → import → export produces identical JSON
