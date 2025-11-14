# System Integration Test Plan 🧪

**Date:** November 10, 2025  
**Purpose:** Systematic testing of each component in the data flow to ensure unified system integrity

---

## 🎯 Architecture Overview

Your diagram shows the complete flow:

```
Style Schema (Fonts, Colors, Padding)
           ↓
    Asset Engine
           ↓
   Template Builder
           ↓
  Editor Engine (EditorModal) ← JSON
           ↓                       ↓
  Content Engine (ContentModal)    → Render Engine
           ↓                            ↓
      Frontend App ← ← ← ← ← ← ← ← ← ←
```

---

## 📦 Component Status

### ✅ 1. Asset Engine (Template Builder)
**Location:** `cms-admin/src/components/TemplateBuilder.tsx`

**Current State:** ✅ **IMPLEMENTED**

**Key Features:**
- Asset library with 7 categories:
  - Basic Inputs (text, textarea, number, date)
  - Lists & Arrays (simple list, list no labels, card list)
  - Complex (objects, key-value pairs)
  - Rich Content (markdown, expressions, code blocks, quotes)
  - Charts (pie, bar, line, radial)
  - Media (image, video, embedded video)
  - Layout (HR, status board/tables)

**Asset Structure:**
```typescript
interface AssetItem {
  id: string;
  name: string;
  renderType: string;
  description: string;
  schema: FieldSchema;
  icon?: typeof Type;
  iconColor?: string;
  exampleData?: any;
  supportsMultiColumn?: boolean;
}
```

**Outputs:**
- Section-based template structure
- Field schemas with `_type`, `_itemSchema`, `_chartConfig` metadata
- Example data for preview
- Layout information (snap zones, multi-column support)

**Test Points:**
- [ ] Drag asset from library to section
- [ ] Asset creates correct schema structure
- [ ] Multi-column layout works (50/50, 70/30, 30/70, 33/33/33)
- [ ] Example data populates correctly
- [ ] Export generates valid JSON

---

### ✅ 2. Template Builder
**Location:** `cms-admin/src/components/TemplateBuilder.tsx`

**Current State:** ✅ **IMPLEMENTED**

**Key Features:**
- Standard header section (id, quarter, year, date, title)
- Drag-and-drop asset placement
- Section management (add, remove, reorder)
- Field management within sections
- Snap layout system (optional multi-column)
- Save/Load/Export functionality

**Template Structure:**
```typescript
interface TemplateSection {
  id: string;
  name: string;
  expanded: boolean;
  fields: TemplateField[];
  sectionLayoutType?: LayoutZone;
}

interface TemplateField {
  id: string;
  key: string;
  label: string;
  renderType: string;
  schema: FieldSchema;
  exampleData?: any;
  layoutZone?: LayoutZone;
  rowIndex?: number;
}
```

**Outputs:**
- Flat JSON structure with metadata:
  - Top-level fields: `id`, `quarter`, `year`, `date`, `title`, `status`, `protectionEnabled`
  - Section data: `{sectionKey}: data`
  - Section metadata: `_enabled_{sectionKey}`, `_completed_{sectionKey}`
  - Type metadata: `_{sectionKey}_type`, `_{sectionKey}_itemSchema`, `_{sectionKey}_chartConfig`

**Test Points:**
- [ ] Create new template from scratch
- [ ] Add standard header
- [ ] Add multiple sections
- [ ] Drag assets into sections
- [ ] Test layout zones (full, 50/50, 70/30, etc.)
- [ ] Save template to backend
- [ ] Load existing template
- [ ] Export template as JSON
- [ ] Validate template structure

---

### ✅ 3. Editor Engine (EditorModal)
**Location:** `cms-admin/src/components/EditorModal.tsx`

**Current State:** ✅ **IMPLEMENTED**

**Key Features:**
- Section-based editing interface
- Lock/unlock sections
- Enable/disable sections
- Mark sections complete
- Weighted completion tracking
- Protection mode (prevents publishing until 100%)
- Expression engine integration
- Array/object field management
- Add/edit/delete items

**Section Structure:**
```typescript
interface Section {
  id: string;
  title: string;
  locked: boolean;
  enabled: boolean;
  completed: boolean;
  weight: number;
  content: any;
}
```

**Data Flow:**
```
JSON Input → Initialize Sections → Edit Fields → Save Draft/Publish
```

**Test Points:**
- [ ] Load template data from Template Builder
- [ ] Edit text fields
- [ ] Edit arrays (add/remove items)
- [ ] Edit objects (nested structures)
- [ ] Lock/unlock sections
- [ ] Enable/disable sections
- [ ] Mark sections complete
- [ ] Check weighted completion calculation
- [ ] Test protection mode (can't publish at <100%)
- [ ] Save as draft
- [ ] Publish (changes status to 'published')
- [ ] Expression engine works (copy expressions)

---

### ✅ 4. Content Engine (ContentModal)
**Location:** `src/components/ContentModal.tsx`

**Current State:** ✅ **IMPLEMENTED**

**Key Features:**
- Visual preview of published/draft content
- JSON view
- Validation view with schema checks
- Section-based rendering
- Multi-field support (indexed fields like `section2_0`, `section2_1`)
- RenderFactory integration

**Preview Tabs (Draft Mode):**
1. **Visual** - Rendered preview using RenderFactory
2. **JSON** - Raw JSON with copy button
3. **Validation** - Schema-based validation checks

**Validation Checks:**
- Global metadata (ID, title/name)
- Section `_type` metadata
- Section `_enabled` metadata
- Schema-driven field validation

**Test Points:**
- [ ] Open content in visual mode
- [ ] Verify all sections render correctly
- [ ] Switch to JSON view
- [ ] Copy JSON successfully
- [ ] Switch to validation view
- [ ] Check validation passes for complete data
- [ ] Check validation flags missing fields
- [ ] Test multi-field sections (2-column, 3-column, etc.)
- [ ] Close modal

---

### ✅ 5. Render Engine (RenderFactory)
**Location:** `src/renderers/RenderFactory.tsx`

**Current State:** ✅ **IMPLEMENTED** (based on your architecture)

**Supported Render Types:**
- `text`, `textarea`, `number`, `date`
- `list`, `listNoTitle`
- `metricCards`, `nestedCards`
- `pieChart`, `barChart`, `lineChart`, `radialChart`
- `richText`, `expression`, `codeBlock`, `quote`
- `image`, `video`, `embeddedVideo`
- `hr`, `statusBoard`
- `objectForm`

**Modes:**
- `edit` - Form inputs for editing
- `display` - Read-only formatted display

**Test Points:**
- [ ] Render text fields correctly
- [ ] Render lists (bulleted)
- [ ] Render metric cards in grid
- [ ] Render charts with data
- [ ] Render markdown/rich text
- [ ] Render images with auto-scale
- [ ] Render videos with controls
- [ ] Render status boards/tables
- [ ] Edit mode shows inputs
- [ ] Display mode shows formatted content

---

### 🔄 6. Frontend App
**Location:** `src/` (multiple components)

**Current State:** ✅ **IMPLEMENTED**

**Key Components:**
- `Dashboard.tsx` - Main landing page with performance metrics
- `ExecutiveIQDetail.tsx` - Article detail view
- `StrategicInitiativeModal.tsx` - Initiative detail view
- `ContentModal.tsx` - Generic content preview

**Data Flow:**
```
JSON files → Auto-loaders → React Context → Components → Render
```

**Auto-Loaders:**
- `summaries-loader.ts` - Loads all `data/summaries/*.json`
- `organizations-loader.ts` - Loads all `data/organizations/*.json`
- `initiatives-loader.ts` - Loads all `data/initiatives/*.json`
- `performance-loader.ts` - Loads all `data/performance/*.json`

**Test Points:**
- [ ] Place JSON from Editor in correct folder
- [ ] Auto-loader picks up new file
- [ ] Data appears in timeline/dashboard
- [ ] Click to open detail view
- [ ] All sections render correctly
- [ ] Charts display with data
- [ ] Expressions render (currency, badges, icons)
- [ ] Dark/light mode works
- [ ] Print mode works
- [ ] Export as image works

---

## 🧪 End-to-End Test Scenarios

### Scenario 1: Create New Executive Summary
1. **Template Builder**
   - [ ] Create new template
   - [ ] Add standard header
   - [ ] Add "Highlights" section with simple list
   - [ ] Add "Key Metrics" section with metric cards
   - [ ] Add "Performance Chart" section with bar chart
   - [ ] Save template as "weekly-summary-template"

2. **Editor Modal**
   - [ ] Load "weekly-summary-template"
   - [ ] Fill in header (id, quarter, year, date, title)
   - [ ] Add 5 highlight items
   - [ ] Add 4 metric cards (revenue, growth, customers, satisfaction)
   - [ ] Add chart data (monthly performance)
   - [ ] Mark all sections complete
   - [ ] Publish

3. **Frontend App**
   - [ ] Copy JSON to `src/data/summaries/`
   - [ ] Refresh app
   - [ ] See new summary in timeline
   - [ ] Click to open detail view
   - [ ] Verify highlights render as bullet list
   - [ ] Verify metrics render as cards
   - [ ] Verify chart displays correctly
   - [ ] Test print mode
   - [ ] Test dark mode

### Scenario 2: Create Organization Profile
1. **Template Builder**
   - [ ] Create new template
   - [ ] Add metadata section (name, description, color)
   - [ ] Add "Metrics" section (active deals, won ACV, conversion rate)
   - [ ] Add "Key Initiatives" section (list with expressions)
   - [ ] Add "Recent Wins" section (nested cards)
   - [ ] Save as "organization-template"

2. **Editor Modal**
   - [ ] Load "organization-template"
   - [ ] Fill in organization details
   - [ ] Add metric values
   - [ ] Add 3-5 initiatives with expression syntax
   - [ ] Add recent wins with client/product/value
   - [ ] Mark complete and publish

3. **Frontend App**
   - [ ] Copy to `src/data/organizations/`
   - [ ] Verify appears in Organizations section
   - [ ] Open detail view
   - [ ] Check metrics display
   - [ ] Check expressions render (badges, currency, etc.)
   - [ ] Check wins render as cards

### Scenario 3: Multi-Column Layout
1. **Template Builder**
   - [ ] Create new section
   - [ ] Choose 50/50 layout
   - [ ] Drag pie chart to left column
   - [ ] Drag bar chart to right column
   - [ ] Save template

2. **Editor Modal**
   - [ ] Load template
   - [ ] Add data to both charts
   - [ ] Publish

3. **Content Modal**
   - [ ] Preview in visual mode
   - [ ] Verify charts are side-by-side
   - [ ] Check responsive behavior

4. **Frontend App**
   - [ ] Verify multi-column renders correctly
   - [ ] Check mobile responsiveness

---

## 🐛 Known Issues / Gaps

### AssetEngine Status
- ❓ No standalone `AssetEngine.tsx` file found
- ✅ Asset library embedded in `TemplateBuilder.tsx` (ASSET_LIBRARY constant)
- This is actually **fine** - the assets are defined inline

### Data Flow Concerns
1. **Template → Editor consistency**
   - Template Builder creates: `_{key}_type`, `_{key}_itemSchema`, `_{key}_chartConfig`
   - Editor Modal expects: `_{key}_type`, `_{key}_fields` (legacy), or `_{key}_itemSchema` (new)
   - ⚠️ **VERIFY:** Both systems handle itemSchema correctly

2. **Multi-field sections**
   - Template Builder can create indexed fields: `section2_0`, `section2_1`
   - Content Modal groups these: `sectionGroups.set(baseName, [key1, key2])`
   - ⚠️ **VERIFY:** This pattern works end-to-end

3. **Chart configuration**
   - Charts need `chartConfig` with dataKey, colors, etc.
   - ⚠️ **VERIFY:** Chart assets pre-populate correct chartConfig

4. **Expression rendering**
   - Editor Modal has expression menu
   - Frontend uses `renderWithExpressions()` function
   - ⚠️ **VERIFY:** Both systems use same expression syntax

---

## ✅ Testing Checklist

### Phase 1: Template Builder
- [ ] Open Template Builder in CMS Admin
- [ ] Create template with all asset types
- [ ] Test each asset category (7 total)
- [ ] Test multi-column layouts
- [ ] Export JSON and inspect structure
- [ ] Save to backend
- [ ] Load saved template

### Phase 2: Editor Modal
- [ ] Load template from Phase 1
- [ ] Edit each field type
- [ ] Test add/edit/delete for arrays
- [ ] Test add/edit/delete for objects
- [ ] Test section controls (lock, enable, complete)
- [ ] Test protection mode
- [ ] Test expression engine
- [ ] Save as draft
- [ ] Publish (verify status changes)

### Phase 3: Content Modal
- [ ] Open published content
- [ ] Visual tab: verify rendering
- [ ] JSON tab: inspect structure
- [ ] Validation tab: check all green
- [ ] Create incomplete data
- [ ] Validation tab: check errors show
- [ ] Copy JSON successfully

### Phase 4: Frontend Integration
- [ ] Place JSON in correct data folder
- [ ] Verify auto-load works
- [ ] Open detail view
- [ ] Test all render types
- [ ] Test expressions
- [ ] Test charts
- [ ] Test dark mode
- [ ] Test print mode
- [ ] Test export image

### Phase 5: Cross-Component Tests
- [ ] Create in Template Builder → Edit in Editor Modal → View in Content Modal → Display in Frontend
- [ ] Modify existing content and verify changes propagate
- [ ] Test backwards compatibility (old JSON format)
- [ ] Test schema validation across all components

---

## 📊 Component Alignment Matrix

| Component | Outputs | Expected By | Status |
|-----------|---------|-------------|--------|
| **Template Builder** | Flat JSON with `_type`, `_itemSchema`, `_chartConfig` | Editor Modal | ✅ |
| **Editor Modal** | Updated JSON with edited data, `status` field | Content Modal, Frontend | ✅ |
| **Content Modal** | N/A (display only) | - | ✅ |
| **RenderFactory** | Rendered React components | Content Modal, Frontend | ✅ |
| **Frontend App** | N/A (consumes JSON) | - | ✅ |

---

## 🎯 Next Steps

1. ✅ **Inventory Complete** - All components located and documented
2. **Run Phase 1 Tests** - Template Builder end-to-end
3. **Run Phase 2 Tests** - Editor Modal end-to-end  
4. **Run Phase 3 Tests** - Content Modal preview
5. **Run Phase 4 Tests** - Frontend integration
6. **Run Phase 5 Tests** - Cross-component flow
7. **Document Issues** - Track any misalignments
8. **Fix Gaps** - Address schema inconsistencies
9. **Final Validation** - Complete end-to-end scenario
10. **Production Ready** - Sign off on unified system

---

## 📝 Notes

- **No AssetEngine.tsx file** - Assets are defined in TemplateBuilder as `ASSET_LIBRARY`
- **Legacy support** - Both `_fields` (old) and `_itemSchema` (new) are supported
- **Multi-field sections** - Indexed fields like `section2_0` get grouped by Content Modal
- **Validation** - Schema-based validation in ContentModal matches template structure

**This is a SOLID architecture!** The components are well-defined and the data flow is clear. The main testing focus should be ensuring the metadata (`_type`, `_itemSchema`, `_chartConfig`) flows correctly through all layers.
