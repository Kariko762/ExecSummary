# Template Builder Improvements Plan

**Date:** November 10, 2025  
**Status:** AWAITING APPROVAL  
**Change Control:** All changes require user approval before implementation

---

## Issues Identified

### 1. Asset Engine - Missing Alignment Options
**Issue:** No way to align assets (left/right/center)  
**Impact:** Limited layout flexibility for content positioning  
**Priority:** Medium

### 2. List Assets - Duplicate Functionality
**Issue:** `list` and `listNoTitle` are currently the same because `list` has no label rendering  
**Impact:** Redundant asset types, confusion about which to use  
**Priority:** High  
**Root Cause:** Both assets use same renderType logic, `list` doesn't show its label

### 3. NestedCards Properties - Limited Editing
**Issue:** Properties Panel only shows "Card 1", "Card 2", etc. Cannot edit card titles or see values  
**Impact:** Poor UX - users can't see what cards contain without expanding each field  
**Priority:** High  
**Current Behavior:**
- Shows card number only
- + Add Card creates sequential cards with empty fields
- No preview of card content in collapsed state

### 4. Object vs ObjectForm Confusion
**Issue:** What's the difference between `object` renderType and `objectForm` schema.renderAs?  
**Impact:** Unclear asset types, potential duplicate functionality  
**Priority:** Medium  
**Current State:**
- `object` asset: renderType='object', schema.renderAs='objectForm'
- `keyValue` asset: renderType='keyValue', schema.renderAs='objectForm'
- Both render the same way in EditorModal

### 5. Undo Functionality Missing
**Issue:** No way to undo changes to sections or properties  
**Impact:** Risky edits, no way to recover from mistakes  
**Priority:** High  
**Scope:** Track changes to:
- Section creation/deletion/reordering
- Field property changes
- ExampleData edits

### 6. MetricCards Preview - NaN Values
**Issue:** MetricCards show (NaN) (NaN) (NaN) (NaN) in Asset Preview  
**Impact:** Broken preview, can't see example before adding to template  
**Priority:** High

### 7. Markdown Preview - Shows Edit Version
**Issue:** Markdown preview shows raw markdown instead of parsed HTML  
**Impact:** Can't see what markdown will look like when rendered  
**Priority:** Medium  
**Current:** Shows `## Heading\n**bold**` instead of rendered HTML  
**Expected:** Should parse and render markdown in preview

### 8. Expression Preview - Shows Unrendered
**Issue:** Expression preview shows raw expression instead of evaluated result  
**Impact:** Can't see what expression will output  
**Priority:** Medium  
**Current:** Shows `{data.metrics.revenue}` instead of example value

### 9. Preview Blocked by +Add Button
**Issue:** Assets with +Add buttons can't be previewed properly  
**Impact:** Can't see what asset will look like before adding  
**Priority:** Low  
**Affected Assets:** nestedCards, charts, statusBoard, etc.

### 10. Template Reference Missing
**Issue:** No indication of which template was loaded to create current work  
**Impact:** Can't track template lineage or source  
**Priority:** Low  
**Desired:** Show loaded template filename somewhere on screen

### 11. Remove All Sections Missing
**Issue:** No quick way to clear all sections and start fresh  
**Impact:** Have to manually delete each section one by one  
**Priority:** Low

### 12. Back Button Inconsistency
**Issue:** "Back to CMS" button doesn't match Design System Manager pattern  
**Impact:** Inconsistent UX across admin tools  
**Priority:** Low  
**Current:** "← Back to CMS" (line 1907)  
**Expected:** Just "← Back" (check Design System Manager for exact pattern)

---

## Proposed Solutions

### SOLUTION 1: Add Asset Alignment Support
**Changes Required:**
1. Add `alignment` property to field schema: 'left' | 'center' | 'right'
2. Add alignment selector in Properties Panel (after renderType selector)
3. Update asset renderers to respect alignment property
4. Add alignment to template JSON export/import
5. Update ASSET_LIBRARY to include alignment metadata

**Files to Modify:**
- `TemplateBuilder.tsx` (add alignment UI + state)
- All renderer components in `src/renderers/`
- Template JSON schema

**Estimated Complexity:** Medium (affects rendering engine)

---

### SOLUTION 2: Fix List vs ListNoTitle Distinction
**Changes Required:**
1. **Option A (Recommended):** Add label rendering to `list` renderType
   - Modify list renderer to show `field.schema.label` above list items
   - Keep `listNoTitle` as-is (no label)
   - This creates clear distinction

2. **Option B:** Merge into single asset with "Show Label" toggle
   - Remove `listNoTitle` asset
   - Add `showLabel` boolean to list schema
   - Update Properties Panel with toggle

**Recommendation:** Option A - simpler, less breaking change

**Files to Modify:**
- List renderer component
- Asset preview logic

**Estimated Complexity:** Low

---

### SOLUTION 3: Enhance NestedCards Properties Editor
**Changes Required:**
1. Show card preview in collapsed state (first field value or title)
2. Add expand/collapse for each card
3. Show field labels + values in card header
4. Improve visual hierarchy

**Example UI:**
```
Card 1: "Project Alpha" - Status: Active
  [Collapse/Expand button]
  
Card 2: "Project Beta" - Status: Planning
  [Collapse/Expand button]
```

**Files to Modify:**
- `TemplateBuilder.tsx` lines 2763-2835 (nestedCards editor)

**Estimated Complexity:** Medium

---

### SOLUTION 4: Clarify Object vs ObjectForm
**Investigation Needed:**
1. Document difference between renderType and schema.renderAs
2. Check if objectForm is used for rendering or just metadata
3. Determine if consolidation is possible

**Proposed Documentation:**
- `renderType`: Used by Template Builder to determine Properties Panel UI
- `schema.renderAs`: Used by EditorModal/renderers for actual rendering
- `object` and `keyValue` both use objectForm renderer but different field structures

**Files to Review:**
- All renderer components
- EditorModal component
- Template execution engine

**Estimated Complexity:** Low (documentation) to High (if code changes needed)

---

### SOLUTION 5: Implement Undo/Redo System
**Changes Required:**
1. Create history stack state (array of template snapshots)
2. Track mutations to sections and fields
3. Add Undo/Redo buttons to toolbar
4. Limit history to last 50 actions (memory management)
5. Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)

**State Structure:**
```typescript
const [history, setHistory] = useState<TemplateState[]>([]);
const [historyIndex, setHistoryIndex] = useState(0);
```

**Files to Modify:**
- `TemplateBuilder.tsx` (add history state + undo/redo functions)
- Add undo/redo buttons to toolbar (around line 1900)

**Estimated Complexity:** High (complex state management)

---

### SOLUTION 6: Fix MetricCards Preview NaN
**Investigation Required:**
1. Check metricCards exampleData structure in ASSET_LIBRARY
2. Verify preview rendering logic for metricCards
3. Ensure data format matches renderer expectations

**Likely Cause:** Preview doesn't pass correct data structure to renderer

**Files to Investigate:**
- Asset preview rendering logic
- MetricCards renderer component

**Estimated Complexity:** Low (likely simple data structure fix)

---

### SOLUTION 7: Add Markdown Preview Parsing
**Changes Required:**
1. Install/use markdown parser (likely already in dependencies)
2. Update preview logic to parse markdown before rendering
3. Apply basic styling to parsed markdown

**Files to Modify:**
- Asset preview component
- Add markdown parsing utility

**Estimated Complexity:** Low

---

### SOLUTION 8: Add Expression Preview Evaluation
**Changes Required:**
1. Create mock data context for expression evaluation
2. Safely evaluate expressions in preview (sandbox)
3. Show evaluated result or "Expression: {expression}" if can't evaluate

**Security Note:** Must safely evaluate - no eval() on user input

**Files to Modify:**
- Asset preview component
- Expression evaluation utility

**Estimated Complexity:** Medium (security considerations)

---

### SOLUTION 9: Improve Preview for +Add Button Assets
**Changes Required:**
1. Show preview with sample data (ignore +Add button in preview)
2. Or: Add "Preview Mode" toggle that hides interactive elements

**Files to Modify:**
- Asset preview component logic

**Estimated Complexity:** Low

---

### SOLUTION 10: Add Template Reference Display
**Changes Required:**
1. Add `loadedTemplate` state to track source template filename
2. Display in header or footer
3. Update on template import
4. Clear on "New Template"

**UI Location Options:**
- Header subtitle: "Template: MASTER-TEMPLATE-ALL-ASSETS.json"
- Footer: "Based on: comprehensive-test-template-VALID.json"

**Files to Modify:**
- `TemplateBuilder.tsx` (add state + UI)

**Estimated Complexity:** Low

---

### SOLUTION 11: Add "Remove All Sections" Button
**Changes Required:**
1. Add button to toolbar (near Export/Import)
2. Show confirmation dialog before clearing
3. Clear all sections and reset state

**UI:**
```
[Remove All Sections] → Confirm: "This will delete all sections. Continue?"
```

**Files to Modify:**
- `TemplateBuilder.tsx` (add button + clear function)

**Estimated Complexity:** Low

---

### SOLUTION 12: Fix Back Button Text
**Changes Required:**
1. Find Design System Manager back button implementation
2. Copy pattern to Template Builder
3. Change "Back to CMS" to "Back" or match Design System pattern

**Files to Modify:**
- `TemplateBuilder.tsx` line 1907

**Estimated Complexity:** Very Low

---

## Implementation Todo List

### PRIORITY 1: Critical Fixes (Do First)
1. ☐ Fix metricCards preview NaN issue
2. ☐ Fix list vs listNoTitle distinction (add label to list)
3. ☐ Enhance nestedCards Properties editor (show card previews)

### PRIORITY 2: High Value Features (Do Next)
4. ☐ Implement Undo/Redo system
5. ☐ Add asset alignment support (left/center/right)
6. ☐ Clarify/document Object vs ObjectForm

### PRIORITY 3: UX Improvements (Do After)
7. ☐ Add markdown preview parsing
8. ☐ Add expression preview evaluation
9. ☐ Improve preview for +Add button assets

### PRIORITY 4: Polish (Do Last)
10. ☐ Add template reference display
11. ☐ Add "Remove All Sections" button
12. ☐ Fix back button consistency

---

## Questions for User

1. **Asset Alignment:** Should alignment be per-asset or per-section?
2. **List Assets:** Confirm Option A (add label to list, keep listNoTitle separate)?
3. **NestedCards:** What info should show in collapsed card preview (title field? first field? all fields condensed)?
4. **Object vs ObjectForm:** Do you know the intended difference, or should I investigate the rendering engine?
5. **Undo System:** How many levels of undo history (suggested: 50)?
6. **Template Reference:** Where should this display (header/footer/both)?
7. **Design System Manager:** Where is this component so I can check the back button pattern?

---

## Change Control Notes

- NO changes will be made without explicit approval
- Each solution will be implemented individually after review
- Testing required after each change
- Update todo list as items are completed

---

## Next Steps

1. User reviews this plan
2. User answers questions above
3. User approves specific solutions to implement
4. Implementation begins in priority order
5. Each change tested before moving to next

