# Asset Example Data Audit - Template Builder
**Date:** November 10, 2025  
**Component:** `cms-admin/src/components/TemplateBuilder.tsx`  
**Purpose:** Verify all 22 assets have instructional/dummy data AND ability to edit via Properties Panel  
**Status:** ⚠️ **CRITICAL GAPS IDENTIFIED - NO CHANGES MADE**

---

## Executive Summary

### ✅ **ASSETS WITH FULL SUPPORT (9/22):**
All have `exampleData` defined AND Properties Panel editing:
1. **array** (Simple List) - Lines 2391-2433
2. **arrayNoLabels** (List No Labels) - Lines 2391-2433
3. **nestedCards** (Card List) - Lines 2436-2509
4. **pieChart** - Lines 2512-2599
5. **barChart** - Lines 2512-2599
6. **lineChart** - Lines 2512-2599
7. **radialChart** - Lines 2512-2599
8. **image** - Has complex exampleData object (Line 476-483)
9. **video** - Has complex exampleData object (Line 507-518)

### ❌ **ASSETS MISSING PROPERTIES PANEL EDITING (13/22):**
Have `exampleData` but NO Properties Panel interface to edit it:
1. **text** (Text Input) - Has exampleData: `'Revenue Operations Team'` (Line 100)
2. **textarea** (Text Area) - Has exampleData (Line 116)
3. **number** (Number) - Has exampleData: `42500` (Line 127)
4. **date** (Date Picker) - Has exampleData: `'2025-01-15'` (Line 138)
5. **object** (Object) - Has exampleData: `{ team: 'RevOps', lead: 'Sarah Johnson', members: 12 }` (Line 224)
6. **keyValue** (Key-Value Pair) - Has exampleData: `{ key: 'Status', value: 'On Track' }` (Line 243)
7. **markdown** (Markdown Editor) - Has exampleData with markdown content (Line 262)
8. **expression** (Expression) - Has exampleData with template expression (Line 273)
9. **codeBlock** (Code Block) - Has exampleData with JavaScript code (Line 284)
10. **quote** (Quote) - Has exampleData with blockquote text (Line 295)
11. **embeddedVideo** - Has complex exampleData object (Line 539-546)
12. **hr** (Horizontal Rule) - Has `exampleData: null` (Line 575) - **INTENTIONAL**
13. **statusBoard** (Table Layout) - Has complex exampleData array (Line 647-678)

---

## Detailed Findings by Category

### 1. BASIC INPUTS (4 assets)

#### ✅ All have `exampleData` defined in ASSET_LIBRARY
#### ❌ NONE have Properties Panel editing UI

| Asset ID | Name | exampleData | Properties Panel Edit? | Line # |
|----------|------|-------------|----------------------|--------|
| `text` | Text Input | `'Revenue Operations Team'` | ❌ NO | 100 |
| `textarea` | Text Area | `'This quarter we focused...'` (long text) | ❌ NO | 116 |
| `number` | Number | `42500` | ❌ NO | 127 |
| `date` | Date Picker | `'2025-01-15'` | ❌ NO | 138 |

**Current Properties Panel Support:**
- Lines 2357-2366: Only shows Field Key, Label, Render Type (read-only)
- NO UI to edit the actual `exampleData` value
- User cannot customize the instructional/dummy data at template build time

**Impact:**
- When user drags these assets into template, they get the hardcoded example
- Cannot customize guidance text to match their specific use case
- Example: "Revenue Operations Team" may not be relevant for all templates

---

### 2. LISTS & ARRAYS (3 assets)

#### ✅ All have `exampleData` AND Properties Panel editing

| Asset ID | Name | exampleData | Properties Panel Edit? | Line # |
|----------|------|-------------|----------------------|--------|
| `array` | Simple List | Array of 4 strings | ✅ YES (Lines 2391-2433) | 157 |
| `arrayNoLabels` | List (No Labels) | Array of 3 strings | ✅ YES (Lines 2391-2433) | 168 |
| `nestedCards` | Card List | Array of 4 card objects | ✅ YES (Lines 2436-2509) | 191-197 |

**Properties Panel UI:**
- **Arrays:** "+ Add" button, editable text inputs for each item, delete button per item
- **Nested Cards:** "+ Add Card" button, expandable card editors with fields, delete button per card
- Fully functional and intuitive

---

### 3. COMPLEX (2 assets)

#### ✅ Both have `exampleData` defined
#### ❌ NEITHER have Properties Panel editing

| Asset ID | Name | exampleData | Properties Panel Edit? | Line # |
|----------|------|-------------|----------------------|--------|
| `object` | Object | `{ team: 'RevOps', lead: 'Sarah Johnson', members: 12 }` | ❌ NO | 224 |
| `keyValue` | Key-Value Pair | `{ key: 'Status', value: 'On Track' }` | ❌ NO | 243 |

**Current Properties Panel Support:**
- Same as Basic Inputs - only shows Key, Label, Render Type
- NO UI to edit the object fields or values
- User cannot customize the example object structure

**Impact:**
- Object structure is hardcoded
- Cannot provide template-specific example data (e.g., different team name)
- keyValue always shows same example regardless of template purpose

---

### 4. RICH CONTENT (4 assets)

#### ✅ All have `exampleData` defined
#### ❌ NONE have Properties Panel editing

| Asset ID | Name | exampleData | Properties Panel Edit? | Line # |
|----------|------|-------------|----------------------|--------|
| `markdown` | Markdown Editor | Multi-line markdown with headers/lists | ❌ NO | 262 |
| `expression` | Expression | Template expression string | ❌ NO | 273 |
| `codeBlock` | Code Block | JavaScript code snippet | ❌ NO | 284 |
| `quote` | Quote | Blockquote text | ❌ NO | 295 |

**Current Properties Panel Support:**
- Same as Basic Inputs - only shows Key, Label, Render Type
- NO textarea or code editor to customize example content

**Impact:**
- Markdown example is generic "Q1 2025 Highlights" - not customizable
- Expression example shows revenue calculation - may not fit all templates
- Code block shows growth calculation - hardcoded
- Quote text is fixed - cannot provide template-specific example

---

### 5. CHARTS (4 assets)

#### ✅ All have `exampleData` AND Properties Panel editing

| Asset ID | Name | exampleData | Properties Panel Edit? | Line # |
|----------|------|-------------|----------------------|--------|
| `pieChart` | Pie Chart | Array of 3 data points (name/value) | ✅ YES (Lines 2512-2599) | 335-340 |
| `barChart` | Bar Chart | Array of 4 data points | ✅ YES (Lines 2512-2599) | 370-376 |
| `lineChart` | Line Chart | Array of 6 data points | ✅ YES (Lines 2512-2599) | 406-414 |
| `radialChart` | Radial Chart | Array of 1 data point | ✅ YES (Lines 2512-2599) | 443-445 |

**Properties Panel UI:**
- "+ Add Point" button
- Two-column grid for each data point (Label + Value)
- Delete button per data point
- Fully functional chart data editor

---

### 6. MEDIA (3 assets)

#### ✅ All have `exampleData` (complex objects)
#### ⚠️ Likely NO Properties Panel editing (needs verification)

| Asset ID | Name | exampleData Structure | Properties Panel Edit? | Line # |
|----------|------|---------------------|----------------------|--------|
| `image` | Image | `{ src, alt, autoScale, width, height, caption }` | ⚠️ UNKNOWN | 476-483 |
| `video` | Video | `{ src, poster, autoScale, width, height, controls, autoplay, loop, muted }` | ⚠️ UNKNOWN | 507-518 |
| `embeddedVideo` | Embedded Video | `{ embedUrl, platform, autoScale, width, height, allowFullscreen, title }` | ⚠️ UNKNOWN | 539-546 |

**Notes:**
- These have complex object structures in `exampleData`
- Properties Panel code reviewed only shows special cases for:
  - Lists/Arrays (Lines 2391-2433)
  - Nested Cards (Lines 2436-2509)
  - Charts (Lines 2512-2599)
- NO conditional rendering found for `image`, `video`, or `embeddedVideo` renderTypes
- **Likely missing editing UI** - would fall through to generic Key/Label/Type display

**Impact:**
- User cannot customize placeholder image URLs, alt text, captions
- Video examples are hardcoded (w3schools.com sample video)
- Embedded video defaults to YouTube rickroll URL (Line 540)

---

### 7. LAYOUT (2 assets)

#### ⚠️ Mixed Status

| Asset ID | Name | exampleData | Properties Panel Edit? | Line # |
|----------|------|-------------|----------------------|--------|
| `hr` | Horizontal Rule | `null` | ❌ N/A (intentional) | 575 |
| `statusBoard` | Table Layout | Array of 3 issue objects | ⚠️ UNKNOWN | 647-678 |

**hr (Horizontal Rule):**
- `exampleData: null` is intentional - it's a visual divider with no content
- Has `hrConfig` in schema for styling (thickness, color, margins)
- **CORRECT AS-IS** - no example data needed

**statusBoard:**
- Has complex `exampleData` with 3 issue objects (title, description, priority, action, timeline, status)
- Each object has 6 fields
- NO Properties Panel UI found for editing this complex structure
- Falls through to generic Key/Label/Type display

**Impact for statusBoard:**
- Example data shows "Tiled Performance & Import Failures" issue
- User cannot customize example issues to match their template use case
- Example priorities/statuses are hardcoded

---

## Properties Panel Code Analysis

### Current Implementation (Lines 2264-2615)

```typescript
// Right Sidebar - Property Inspector
<div className="w-80 border-l border-gray-200...">
  
  {/* CASE 1: Header Section Selected */}
  {selectedSection === 'section-header' && !selectedField ? (
    // Lines 2272-2353: Edit header defaults (id, quarter, year, date, title)
  )}

  {/* CASE 2: Field Selected */}
  {selectedField ? (
    <>
      {/* Basic Properties - ALL ASSETS GET THIS */}
      <input type="text" value={field.key} ... />  {/* Field Key */}
      <input type="text" value={field.label} ... />  {/* Label */}
      <input type="text" value={field.renderType} disabled ... />  {/* Render Type (read-only) */}

      {/* Example Data Editors - ONLY SPECIFIC ASSETS */}
      
      {/* Lists/Arrays - Lines 2391-2433 */}
      {(field.renderType === 'list' || field.renderType === 'listNoTitle') && (
        // Array item editor with Add/Delete
      )}

      {/* Nested Cards - Lines 2436-2509 */}
      {field.renderType === 'nestedCards' && (
        // Card editor with field grids
      )}

      {/* Charts - Lines 2512-2599 */}
      {(field.renderType === 'pieChart' || field.renderType === 'barChart' || 
        field.renderType === 'lineChart' || field.renderType === 'radialChart') && (
        // Chart data point editor
      )}

      {/* Schema Properties (collapsible JSON) - Lines 2601-2613 */}
      <button onClick={() => setSchemaPropertiesOpen(!schemaPropertiesOpen)}>
        Schema Properties
      </button>
      {schemaPropertiesOpen && (
        <pre>{JSON.stringify(field.schema, null, 2)}</pre>
      )}
    </>
  ) : (
    // CASE 3: No Selection
    <div>Select a field to edit its properties</div>
  )}
</div>
```

### Missing Conditional Blocks

**Properties Panel DOES NOT have editors for:**
1. `text` - needs simple text input
2. `textarea` - needs multi-line textarea
3. `number` - needs number input
4. `date` - needs date input
5. `object` - needs object field editor (like nested cards but for single object)
6. `keyValue` - needs two-field editor (key + value)
7. `markdown` - needs markdown textarea
8. `expression` - needs expression input
9. `codeBlock` - needs code textarea
10. `quote` - needs quote textarea
11. `image` - needs multi-field object editor (src, alt, caption, etc.)
12. `video` - needs multi-field object editor (src, poster, controls, etc.)
13. `embeddedVideo` - needs multi-field object editor (embedUrl, platform, etc.)
14. `statusBoard` - needs complex array-of-objects editor (like nested cards)

---

## How exampleData is Used

### At Template Build Time (handleSectionDrop, createSection)

When user drags asset from library into template:

```typescript
// Lines 1187, 1221, 1244, 1308
{
  id: uniqueId,
  key: generatedKey,
  label: asset.name,
  renderType: asset.renderType,
  schema: asset.schema,
  exampleData: draggedAsset.exampleData,  // <-- COPIED FROM ASSET_LIBRARY
  layoutZone: zone
}
```

**Result:** Field gets `exampleData` from ASSET_LIBRARY definition

### At Template Save Time (performSave)

When template is saved to JSON:

```typescript
// Lines 1718-1745
if (field.renderType === 'list' || field.renderType === 'listNoTitle') {
  if (field.exampleData && field.exampleData.length > 0) {
    templateData[fieldKey] = field.exampleData;  // <-- USE EXAMPLE DATA
  } else {
    templateData[fieldKey] = ['Example item 1', 'Example item 2', 'Example item 3'];
  }
}

// Charts
if (field.renderType === 'pieChart' || ...) {
  if (field.exampleData && field.exampleData.length > 0) {
    templateData[fieldKey] = field.exampleData;  // <-- USE EXAMPLE DATA
  } else {
    templateData[fieldKey] = [{ name: 'Example', value: 50 }];
  }
}

// Other types - no specific handling, exampleData not used in save
```

**Result:** 
- Lists/Arrays: `exampleData` becomes template content
- Charts: `exampleData` becomes template content
- Everything else: Falls back to default values OR may not populate at all

### At Content Build Time (EditorModal)

When user creates summary from template in EditorModal:
- Template JSON is loaded
- Fields populated with values from JSON (which may have come from `exampleData`)
- User edits these values to create actual content

**Result:** `exampleData` becomes initial guidance/dummy data that user replaces with real content

---

## Critical Analysis

### What Works Well ✅

1. **Arrays/Lists (3 assets):** Full editing capability, intuitive UI
2. **Charts (4 assets):** Full editing capability, good data point management
3. **Architecture:** `exampleData` pattern is sound - defined in library, copied to field, used at save time
4. **Consistent Definition:** All 22 assets have `exampleData` defined (except `hr` which intentionally has `null`)

### Critical Gaps ❌

1. **13 assets have NO Properties Panel editing** despite having `exampleData`
2. **Basic text/textarea/number** - Most fundamental types missing editing UI
3. **Rich content** - Cannot customize markdown, code, expression, quote examples
4. **Media assets** - Cannot customize placeholder URLs, captions, video settings
5. **Complex objects** - Object and keyValue need structured editors
6. **statusBoard** - Complex array-of-objects has no editing UI (similar to nestedCards)

### Impact on User Experience

**Current State:**
- User drags "Text Input" asset → gets "Revenue Operations Team" example
- User drags "Markdown Editor" → gets "Q1 2025 Highlights" example
- User drags "Image" → gets placeholder.com URL example
- **CANNOT CHANGE THESE** in Template Builder

**Problem:**
- Template builder creates template for "HR Weekly Update" but examples say "Revenue Operations"
- Examples are not contextual to the template being built
- User must remember to change all examples during content build time in EditorModal
- Defeats purpose of "instructional/dummy data" - it's generic, not template-specific

**Expected Behavior:**
- User drags "Text Input" → gets default example
- **User clicks field in canvas → Properties Panel shows text input to customize example**
- User changes to "Human Resources Team" to match their template
- When template saved, this custom example becomes the guidance data
- When content created from template, user sees "Human Resources Team" as placeholder

---

## Recommendations (NO CHANGES MADE - PLANNING ONLY)

### Priority 1: Basic Inputs (Highest Impact)
Add Properties Panel editors for:
- `text` → Simple text input for exampleData
- `textarea` → Multi-line textarea for exampleData
- `number` → Number input for exampleData
- `date` → Date input for exampleData

**Estimated Lines:** ~40-60 lines (similar to existing patterns)

### Priority 2: Rich Content
Add Properties Panel editors for:
- `markdown` → Textarea with markdown preview hint
- `expression` → Text input with expression syntax hint
- `codeBlock` → Textarea with monospace font
- `quote` → Textarea for quote text

**Estimated Lines:** ~60-80 lines

### Priority 3: Complex Objects
Add Properties Panel editors for:
- `object` → Dynamic field editor based on schema.fields
- `keyValue` → Two-field editor (key input + value input)

**Estimated Lines:** ~80-100 lines (more complex logic)

### Priority 4: Media Assets
Add Properties Panel editors for:
- `image` → Multi-field form (src, alt, caption, width, height, autoScale)
- `video` → Multi-field form (src, poster, controls, autoplay, loop, muted, width, height, autoScale)
- `embeddedVideo` → Multi-field form (embedUrl, platform, title, width, height, allowFullscreen, autoScale)

**Estimated Lines:** ~120-150 lines (most complex)

### Priority 5: Layout
Add Properties Panel editor for:
- `statusBoard` → Array-of-objects editor (reuse nestedCards pattern)

**Estimated Lines:** ~80-100 lines (similar to nestedCards)

---

## Implementation Pattern

**Based on existing chart editor (Lines 2512-2599):**

```typescript
{/* Example Data for [ASSET_TYPE] */}
{field.renderType === 'text' && (
  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
    <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-2 block">
      Example Text
    </label>
    <input
      type="text"
      value={field.exampleData || ''}
      onChange={(e) => {
        updateFieldProperty(
          selectedField.sectionId,
          selectedField.fieldId,
          'exampleData',
          e.target.value
        );
      }}
      className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      placeholder="Enter example text..."
    />
  </div>
)}
```

**Key elements:**
1. Conditional rendering based on `field.renderType`
2. Section header with descriptive label
3. Appropriate input type (text, textarea, number, etc.)
4. Uses `updateFieldProperty` to modify `exampleData`
5. Styled to match existing Properties Panel UI
6. Placeholder text for guidance

---

## Testing Checklist (When Changes Are Made)

For each asset type:
1. ✅ Drag asset from library to canvas
2. ✅ Click field to select it
3. ✅ Verify Properties Panel shows exampleData editor
4. ✅ Edit exampleData value
5. ✅ Verify field updates in sections state
6. ✅ Save template
7. ✅ Verify exampleData in saved JSON
8. ✅ Load template in EditorModal
9. ✅ Verify exampleData appears as initial value
10. ✅ Publish content and verify rendering

---

## Conclusion

**Status:** ⚠️ **INCOMPLETE IMPLEMENTATION**

**Summary:**
- 9 of 22 assets (41%) have full exampleData editing support
- 13 of 22 assets (59%) have exampleData defined but NO editing UI
- All assets correctly copy exampleData from library to field
- Editing UI exists only for: arrays, nested cards, charts

**Change Control:**
- NO CHANGES MADE during this audit
- This is a documentation-only review
- Implementation requires careful addition of Properties Panel conditional blocks
- Must preserve existing functionality for working assets
- Must follow existing patterns for consistency

**Next Steps:**
1. Review this audit with team
2. Prioritize which assets need editing UI first
3. Implement one asset category at a time
4. Test thoroughly before moving to next category
5. Update this document as changes are made

---

**Audit Completed By:** GitHub Copilot  
**Date:** November 10, 2025  
**File Version:** cms-admin/src/components/TemplateBuilder.tsx (3,187 lines)
