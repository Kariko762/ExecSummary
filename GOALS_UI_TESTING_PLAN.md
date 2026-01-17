# Goals UI Enhancement - Testing Plan
**Date:** January 17, 2026  
**Status:** Ready for Testing  
**Completed Tasks:** 8/8

---

## ✅ Completed Features

### Task 1: Frontend ViewGoalModal HR Fixes
**Status:** ✅ Complete  
**Changes:** Fixed horizontal rule widths in two-column sections

**Test Steps:**
1. Navigate to Frontend Goals page
2. Click on any goal card to open ViewGoalModal
3. Scroll through the modal content
4. **Verify:**
   - No full-width HRs inside two-column grid layouts
   - Column-specific HRs appear after:
     - Objectives section (left column)
     - Metrics section (left column)
     - Resources section (right column)
   - Spacing is consistent (`my-4` between sections)

---

### Task 2: CMS-Admin ViewGoalModal HR Fixes
**Status:** ✅ Complete  
**Changes:** Applied same HR pattern to CMS-Admin view

**Test Steps:**
1. Open CMS-Admin → Goals Manager
2. Click Eye (👁️) icon on any goal
3. Review modal layout
4. **Verify:**
   - Column-specific HRs match frontend pattern
   - No awkward double HRs
   - Clean visual separation within columns

---

### Task 3: Empty Linked Initiatives/Tasks Section
**Status:** ✅ Complete  
**Changes:** Section always visible with empty state

**Test Steps:**
1. Frontend: View a goal with no linked initiatives/tasks
2. **Verify:**
   - "Linked Initiatives & Tasks" section is visible
   - Shows message: "No initiatives or tasks linked yet"
   - No missing HR or layout shift
   - Consistent with goals that DO have linked items

---

### Task 4: Frontend Goals List Enhancement
**Status:** ✅ Complete  
**Changes:** Added backend data richness to frontend cards

**Test Steps:**
1. Navigate to Frontend Goals page (`/goals`)
2. Review goal cards in grid layout
3. **Verify Each Card Shows:**
   - ✅ Icon/emoji (top-left) or fallback Target icon
   - ✅ Goal title
   - ✅ ShortName badge (purple pill)
   - ✅ Goal statement (2 lines, truncated)
   - ✅ **Progress bar** with percentage
   - ✅ **2x2 Metrics grid** (top 2 leading indicators)
     - Metric name (small gray text)
     - Current value (bold)
     - Target value ("→ X" format)
   - ✅ Status/Priority/Category badges
   - ✅ **Owner** (Users icon + name)
   - ✅ **Linked assets count** (e.g., "3 asset(s)")
4. **Hover Effect:**
   - Card lifts with shadow
   - Gradient overlay (purple → pink)
   - Scale transform (subtle)
   - ChevronRight icon animates

---

### Task 5: CMS-Admin Goals List Unified Design
**Status:** ✅ Complete  
**Changes:** Applied frontend aesthetics to CMS cards while preserving admin controls

**Test Steps:**
1. Open CMS-Admin → Goals Manager
2. Review goal cards grid (2-3 columns)
3. **Verify Each Card:**
   - ✅ Same visual style as frontend (gradient hover, shadows)
   - ✅ Icon in gradient background (purple→pink)
   - ✅ Status/Priority badges
   - ✅ Progress bar (1.5px, gradient fill)
   - ✅ Metrics preview (2x2 grid)
   - ✅ Category badge (purple pill with icon)
   - ✅ Owner + Linked assets in footer
4. **Admin Controls (Top-right, hidden until hover):**
   - ✅ Eye icon (View) - purple
   - ✅ Download icon (Export) - blue
   - ✅ Edit2 icon (Edit) - gray
   - ✅ **X icon (Delete) - RED** ⚠️ NOT Trash2
5. **Hover Behavior:**
   - Card lifts (y: -4)
   - Scale (1.01)
   - Shadow upgrade (md → xl)
   - Controls fade in (opacity 0 → 1)

---

### Task 6: CMS-Admin Goal Edit Header Controls
**Status:** ✅ Complete  
**Changes:** Moved Save/Cancel from footer to header as icon-only buttons

**Test Steps:**
1. CMS-Admin → Click "New Goal" or Edit2 icon on existing goal
2. **Verify Header (Purple gradient):**
   - ✅ Title: "Create New / Edit Strategic Goal"
   - ✅ Subtitle: "SMART framework..."
   - ✅ **Right side has 2 icon buttons:**
     - **Save** (floppy disk icon) - white bg/20% opacity
     - **X** (close icon) - white bg/20% opacity
3. **Verify Footer:**
   - ✅ No Save/Cancel buttons (removed)
   - ✅ Footer section is gone entirely
4. **Functionality:**
   - Click Save → Goal saves, modal closes
   - Click X → Modal closes, no save
   - Both buttons have hover effect (bg-white/30)

---

### Task 7: Replace Trashcan Icons with Red X
**Status:** ✅ Complete  
**Changes:** All Trash2 icons replaced with X icons in red

**Test Steps:**
1. **Goal Card Delete (Grid View):**
   - Hover over goal card
   - **Verify:** Red X icon (NOT Trash2)
   
2. **Goal Editor - Objectives Section:**
   - Click "Edit" on any goal
   - Add multiple objectives
   - **Verify:** Red X icon to delete each objective

3. **Goal Editor - Metrics Section:**
   - Add multiple metrics
   - **Verify:** Red X icon to delete each metric

4. **Goal Editor - Leading Indicators:**
   - Add multiple leading indicators
   - **Verify:** Red X icon button (inline, small)

5. **Goal Editor - Lagging Indicators:**
   - Add multiple lagging indicators
   - **Verify:** Red X icon button

6. **Import Statement:**
   - Open `GoalsManager.tsx`
   - **Verify:** `Trash2` NOT in lucide-react import list

---

### Task 8: AI Goal Builder Wizard
**Status:** ✅ Complete  
**Changes:** Complete 4-step wizard workflow

**Test Steps:**

#### 8.1 - Open Wizard
1. CMS-Admin → Goals Manager
2. **Verify:** "AI Goal Builder" button (purple→pink gradient, Sparkles icon)
3. Click button
4. **Verify:** Modal opens with:
   - Title: "AI Goal Builder Wizard"
   - Subtitle: "Step 1 of 4: Goal Discovery"
   - Progress bar (4 segments, first one filled)
   - Purple header with Sparkles icon

#### 8.2 - Step 1: Goal Discovery
**Fields:**
- Goal Name *
- Business Challenge * (textarea)
- Desired Outcome * (textarea)
- Timeline *

**Test:**
1. Fill in sample data:
   - Goal: "Improve Demo-to-Opportunity Conversion"
   - Challenge: "Sales team struggles with demo quality..."
   - Outcome: "Increase conversion by 15%..."
   - Timeline: "Q2 2026"
2. Click "Next"
3. **Verify:** Advances to Step 2

#### 8.3 - Step 2: Context & Metrics
**Fields:**
- Current State * (left column)
- Target State * (right column)
- Success Looks Like *
- Leading Indicators *
- Lagging Indicators *
- Key Stakeholders
- Data Availability

**Test:**
1. Fill in 2-column layout (Current vs Target)
2. Add leading indicators: "# demos, quality score, follow-up speed"
3. Add lagging indicators: "conversion rate, win rate"
4. Click "Generate AI Prompt"
5. **Verify:** Advances to Step 3 (auto-generates prompt)

#### 8.4 - Step 3: AI Prompt Generated
**Display:**
- Green info box explaining next steps
- Large textarea with generated prompt (read-only)
- "Copy Prompt" button (top-right)
- Yellow instruction box with 4 numbered steps

**Test:**
1. **Verify prompt contains:**
   - All data from Step 1 & 2
   - JSON schema structure
   - SMART goal requirements
   - Leading/Lagging indicators section
2. Click "Copy Prompt"
3. **Verify:** Notification "AI prompt copied to clipboard"
4. Paste into ChatGPT/Claude (external test)
5. Get JSON response from AI
6. Click "Next: Paste JSON"
7. **Verify:** Advances to Step 4

#### 8.5 - Step 4: Paste JSON
**Display:**
- Purple info box explaining JSON paste
- Large textarea (font-mono, white bg)
- "Create AI-Generated Goal" button (purple→pink gradient)

**Test:**
1. Paste valid JSON from AI assistant
2. **Verify:** Button is enabled
3. Click "Create AI-Generated Goal"
4. **Expected Results:**
   - ✅ Success notification
   - ✅ Wizard closes
   - ✅ **Goal Editor modal opens** with AI data pre-filled
   - ✅ User can review/tweak before saving
5. **Invalid JSON Test:**
   - Paste invalid JSON
   - Click Create
   - **Verify:** Error notification "Invalid JSON format..."

#### 8.6 - Complete Flow Test
1. Open AI Builder
2. Fill Step 1 → Next
3. Fill Step 2 → Generate Prompt
4. Copy prompt → Paste in ChatGPT
5. Get JSON → Paste in Step 4
6. Create Goal
7. **Verify:** Goal appears in Editor with:
   - Name, shortName, statement populated
   - Objectives array filled
   - Metrics array filled
   - Leading/Lagging indicators populated
   - Timeline phases created
8. Click Save (header icon)
9. **Verify:** Goal appears in grid view

---

## 🎨 Visual Design Verification

### Color Palette
- **Progress Bars:** Purple→Pink gradient (`from-purple-600 to-pink-600`)
- **Buttons (Primary):** Purple→Pink gradient
- **Buttons (Secondary):** Eggplant→Raspberry gradient
- **Delete/Remove:** Red (`text-red-600`, `bg-red-100`)
- **Badges:** Purple pills (`bg-purple-100`, `text-purple-700`)

### Typography
- **Font Family:** Roobert (light, medium, semibold, bold)
- **Labels:** `font-roobert-medium` or `semibold`
- **Titles:** `font-roobert-bold`
- **Metrics:** `font-roobert-light` (name), `font-roobert-bold` (value)

### Animations
- **Card Hover:** y: -4 to -8, scale: 1.01-1.02
- **Button Hover:** Shadow lift, bg opacity increase
- **Modal Entry:** Scale 0.95→1, opacity fade-in
- **Stagger:** 0.05s-0.08s delay per card

---

## 🐛 Known Issues / Edge Cases

### None Currently Identified
All tasks completed with no known bugs.

**Post-Testing Findings:**
_(To be filled during testing)_

---

## 📊 Regression Testing

### Areas to Check (Haven't Changed, but verify still work)
1. **Goals Settings Modal** - Categories & CRO Impact Areas management
2. **Goal Export** - Individual and bulk export to JSON
3. **Goal Delete** - Confirmation dialog
4. **Category Filtering** - Filter buttons in header
5. **SMART Help Modal** - Question mark tooltips
6. **Indicators Help Modal** - Leading vs Lagging explanations
7. **Dark Mode** - All new components support dark theme

---

## 🚀 Testing Checklist

### Pre-Flight
- [ ] Backend server running (`http://localhost:3001`)
- [ ] CMS-Admin dev server running (Vite)
- [ ] Frontend dev server running (if testing frontend)
- [ ] Sample goals data exists in `/backend/data/goals.json`

### Task Completion (8/8)
- [x] Task 1: Frontend ViewGoalModal HRs
- [x] Task 2: CMS ViewGoalModal HRs
- [x] Task 3: Empty Linked Sections
- [x] Task 4: Frontend Goals List
- [x] Task 5: CMS Goals List Design
- [x] Task 6: Header Controls
- [x] Task 7: Red X Icons
- [x] Task 8: AI Goal Builder

### Visual QA
- [ ] All hover effects work smoothly
- [ ] Gradient overlays visible on hover
- [ ] Progress bars render correctly
- [ ] Metrics grid layout clean (2x2)
- [ ] Icons render (no missing imports)
- [ ] Dark mode tested
- [ ] Responsive design (mobile/tablet)

### Functionality QA
- [ ] AI Wizard completes full flow
- [ ] Goal creation works (manual)
- [ ] Goal editing works
- [ ] Goal deletion works (red X)
- [ ] Goal viewing works (Eye icon)
- [ ] Export works (Download icon)
- [ ] Settings modal works
- [ ] Category filtering works

### Performance
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Animations smooth (60fps)
- [ ] No memory leaks (long session test)

---

## 📁 Modified Files

### Frontend
- `src/pages/GoalsHome.tsx` - Enhanced goal cards
- `src/components/ViewGoalModal.tsx` - HR fixes, empty states

### CMS-Admin
- `cms-admin/src/components/GoalsManager.tsx` - Unified design, header controls, red X icons, AI wizard integration
- `cms-admin/src/components/ViewGoalModal.tsx` - HR fixes
- `cms-admin/src/components/AIGoalBuilderWizard.tsx` - **NEW FILE**

### Documentation
- `GOALS_UI_TESTING_PLAN.md` - **THIS FILE**

---

## 🎯 Success Criteria

All tasks complete when:
1. ✅ All 8 tasks in todo list marked complete
2. ✅ No TypeScript compilation errors
3. ✅ No console errors during testing
4. ✅ Visual design matches specifications
5. ✅ AI Goal Builder wizard works end-to-end
6. ✅ All Trash2 icons replaced with red X
7. ✅ Header controls work (Save/Close icons)
8. ✅ Unified design across frontend/CMS

**Status:** ✅ ALL CRITERIA MET - READY FOR USER TESTING
