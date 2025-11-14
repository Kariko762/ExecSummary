# TODO - November 12, 2025
## Asset Library Rendering Fixes

### 🚨 Priority Issues (Need User Decisions)

#### 1. Progress Bar List Redesign
**Current:** Single percentage bar  
**Expected:** Multiple tasks each with individual progress bars  
**Example Structure:**
```json
{
  "tasks": [
    { "name": "Database Migration", "progress": 85 },
    { "name": "API Integration", "progress": 60 },
    { "name": "UI Testing", "progress": 40 }
  ]
}
```
**Action:** Redesign pattern to show task list with individual bars

#### 2. Two-Column Comparison Purpose
**Current:** Unclear what this asset is for  
**Questions:**
- Is this for Before/After comparisons?
- Problem vs Solution?
- Old vs New?
- Side-by-side feature comparison?

**Action:** Clarify use case with user, then design appropriate structure

---

### 🐛 Rendering Bugs to Fix

#### 3. Pie Chart Colors
**Issue:** Colors should use primary color palette  
**Fix Needed:** Map data to design system semantic colors
```css
/* Use these semantic variables: */
var(--brand-primary)     /* #431C5B - Purple */
var(--brand-secondary)   /* #B21A53 - Raspberry */
var(--accent-blue)       /* #1B82FE */
var(--accent-green)      /* #3BCD3E */
var(--accent-yellow)     /* #F59E0B */
```
**File:** `assetRenderCharts.tsx` - PieChartPattern

#### 4. Bar Chart Colors & Legend
**Issue 1:** All bars same color (should be different colors)  
**Issue 2:** Legend shows "Value" instead of X-axis labels  
**Fix Needed:** 
- Each bar different semantic color
- Legend should display actual data labels (e.g., "Jan", "Feb", "Mar")

**File:** `assetRenderCharts.tsx` - BarChartPattern

#### 5. Timeline Display Verification
**Status:** Vertical layout confirmed correct  
**Action:** Test with real data to verify:
- Dates display correctly
- Titles show properly
- Descriptions render
- Completed vs pending states styled correctly

**File:** `assetRenderComplex.tsx` - TimelinePattern

---

### ✅ Completed (Nov 11)

- [x] Status Board - Fixed data structure to columnar format
- [x] HR Color - Changed to `var(--brand-primary)` purple
- [x] Number Display - Added fallback for proper value display
- [x] Code Block - Wrapped in `.code-wrapper` container with card styling
- [x] All hardcoded hex colors migrated to semantic design system variables

---

### 📋 Testing Checklist

After fixes, test each asset in AssetLibrary:

**basic (4):**
- [ ] text - Plain text display
- [ ] textarea - Multi-line text
- [ ] richText - Formatted text
- [ ] quote - Blockquote styling

**lists (6):**
- [ ] highlightsList - Numbered badges with text
- [ ] bulletList - Bullet points
- [ ] checklistItems - Checkboxes with items
- [ ] progressBarList - Multiple tasks with bars ⚠️ NEEDS REDESIGN
- [ ] keyValueList - Label: Value pairs
- [ ] nestedCards - Cards within cards

**charts (4):**
- [ ] metricCard - Single metric display
- [ ] radialProgressChart - Circular progress
- [ ] pieChart - Pie chart with colors ⚠️ NEEDS FIX
- [ ] barChart - Bar chart with legend ⚠️ NEEDS FIX

**complex (4):**
- [ ] statusBoard - Kanban board with 4 columns ✅ FIXED
- [ ] timeline - Vertical timeline ⚠️ NEEDS VERIFICATION
- [ ] twoColumnComparison - Side-by-side ⚠️ UNCLEAR PURPOSE
- [ ] problemSolutionBox - Problem/Solution layout

**rich (3):**
- [ ] codeBlock - Code display ✅ FIXED
- [ ] hr - Horizontal rule ✅ FIXED
- [ ] number - Large number display ✅ FIXED

**media (0):**
- (Placeholder category for future image/video assets)

---

### 🎯 Success Criteria

1. All 22 assets render correctly in AssetLibrary preview
2. All colors use semantic design system variables
3. No hardcoded hex values in any file
4. Edit mode works for all assets
5. Display mode shows proper formatting
6. Data structures match pattern expectations
7. No console errors when previewing assets
8. Mobile responsive (all column layouts work)

---

### 📁 Files to Modify (Nov 12)

- `cms-admin/src/renderers/assetRenderLists.tsx` - Fix ProgressBarList pattern
- `cms-admin/src/renderers/assetRenderCharts.tsx` - Fix PieChart colors, BarChart colors/legend
- `cms-admin/src/renderers/assetRenderComplex.tsx` - Verify Timeline, clarify TwoColumnComparison
- `cms-admin/src/schemas/assetDataStore.ts` - Update exampleData for fixed patterns
- `cms-admin/src/renderers/assetRenderEngine.css` - Add/update styles as needed (semantic vars only)

---

### 🚫 DO NOT MODIFY

- `/src/types/schema.ts` - Schema frozen
- `/cms-admin/src/components/TemplateBuilder.tsx` - Locked component
- `/cms-admin/src/components/EngineAssetsPreview.tsx` - Locked component
- Any hardcoded color values - Use semantic variables only

---

### 📚 Reference

**Design System Semantic Colors:**
```css
/* Brand Colors */
--brand-primary: #431C5B;      /* Eggplant (Purple) */
--brand-secondary: #B21A53;    /* Raspberry (Pink) */
--brand-tertiary: #1D1F48;     /* Navy */

/* Accent Colors */
--accent-blue: #1B82FE;
--accent-green: #3BCD3E;
--accent-yellow: #F59E0B;
--accent-red: #EF4444;

/* Status Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #1B82FE;

/* Background Colors */
--background-base: #FFFFFF;
--background-elevated: #F9FAFB;

/* Text Colors */
--text-primary: #1F2937;
--text-secondary: #6B7280;

/* Border Colors */
--border-primary: #E5E7EB;
--border-secondary: #D1D5DB;
```

**Pattern Architecture:**
```
assetDataStore.ts → assetRenderEngine.tsx → Pattern File → assetRenderEngine.css
     (data)              (router)            (logic)           (styling)
```
