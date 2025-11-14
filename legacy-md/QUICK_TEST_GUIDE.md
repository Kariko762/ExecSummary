# Quick Testing Guide 🧪

**Your Architecture is VERIFIED ✅ - Now Let's Test It!**

---

## 🎯 Your System (As Built)

```
Style Schema → Asset Engine → Template Builder → Editor Engine → Content Engine → Render Engine → Frontend
                   ↓              ↓                   ↓               ↓              ↓
              (embedded)    (TemplateBuilder)   (EditorModal)  (ContentModal)  (RenderFactory)
```

---

## 🚀 5-Minute Quick Test

### Test 1: Asset Engine (Template Builder)
```bash
# Open CMS Admin
npm run dev:cms

# Go to Template Builder
1. Click "Template Builder" button
2. See asset library on left (7 categories)
3. Drag "Text Input" from "Basic Inputs" to canvas
4. See field appear in section
✅ PASS if field appears
```

### Test 2: Template Builder → Editor Modal
```bash
# In Template Builder
1. Add a few more fields
2. Click "Test" button
3. EditorModal opens with test data
4. Edit a field value
5. See changes reflected
✅ PASS if editing works
```

### Test 3: Editor Modal → Content Modal
```bash
# In EditorModal (via Test button)
1. Fill in some data
2. Mark a section "Complete" (checkmark)
3. Watch completion % increase
4. Try to "Publish" with <100%
✅ PASS if protection prevents publish
5. Complete all sections (100%)
6. Click "Publish"
✅ PASS if status changes to published
```

### Test 4: Content Modal Preview
```bash
# After publishing in Test 3
1. Close EditorModal
2. Should see ContentModal preview
3. Check "Visual" tab - see rendered content
4. Check "JSON" tab - see raw JSON
5. Check "Validation" tab - see green checks
✅ PASS if all tabs work
```

### Test 5: Frontend Integration
```bash
# Copy JSON to frontend
1. In ContentModal JSON tab, click "Copy JSON"
2. Create file: src/data/summaries/test-summary.json
3. Paste JSON
4. Open frontend: npm run dev
5. See new summary in timeline
6. Click to open detail view
✅ PASS if content renders correctly
```

---

## 📋 Systematic Test Checklist

### Phase 1: Asset Library ✅
- [ ] Open Template Builder
- [ ] Expand each category (7 total)
- [ ] See all assets listed
- [ ] Hover over asset - see description
- [ ] Click "Preview" icon - see modal with example
- [ ] Drag asset to section - field appears

**Asset Categories to Test:**
- [ ] Basic Inputs (4 assets)
- [ ] Lists & Arrays (3 assets)
- [ ] Complex (2 assets)
- [ ] Rich Content (4 assets)
- [ ] Charts (4 assets)
- [ ] Media (3 assets)
- [ ] Layout (2 assets - click "Add" button, not drag)

### Phase 2: Template Builder Operations ✅
- [ ] Add new section
- [ ] Choose layout (Full, 50/50, 70/30, etc.)
- [ ] Drag asset into section
- [ ] Reorder fields within section
- [ ] Move field to different section
- [ ] Delete field
- [ ] Delete section
- [ ] Collapse/expand sections
- [ ] Click "Save Template"
  - [ ] Enter name
  - [ ] Enter description
  - [ ] See validation modal
  - [ ] All checks pass
  - [ ] Template saves successfully
- [ ] Click "Load Template"
  - [ ] See list of saved templates
  - [ ] Click one
  - [ ] Template loads correctly
- [ ] Click "Export"
  - [ ] JSON file downloads
  - [ ] Open in text editor
  - [ ] Inspect structure

### Phase 3: Editor Modal Features ✅
- [ ] Load template via "Test" button
- [ ] See sections on left sidebar
- [ ] Click section - scrolls to content
- [ ] Edit text field
- [ ] Edit number field
- [ ] Edit array field (add/edit/delete items)
- [ ] Edit object field
- [ ] Lock section - fields become read-only
- [ ] Unlock section - can edit again
- [ ] Enable/disable section - visibility toggle
- [ ] Mark section complete - auto-locks
- [ ] Check completion % updates
- [ ] Click "Expression Engine"
  - [ ] See expression menu
  - [ ] Click expression - copies to clipboard
  - [ ] Paste in field
- [ ] Save Draft - status remains 'draft'
- [ ] Try to Publish at <100% with protection ON - blocked
- [ ] Disable protection - can publish anytime
- [ ] Complete all sections (100%)
- [ ] Publish - status changes to 'published'

### Phase 4: Content Modal Views ✅
- [ ] **Visual Tab**
  - [ ] All sections render
  - [ ] Text displays correctly
  - [ ] Lists show bullets
  - [ ] Cards appear in grid
  - [ ] Charts display with data
  - [ ] Images load
  - [ ] Videos have controls
  - [ ] Multi-column layouts work

- [ ] **JSON Tab**
  - [ ] Raw JSON displays
  - [ ] Syntax highlighting works
  - [ ] "Copy JSON" button works
  - [ ] Structure matches template

- [ ] **Validation Tab**
  - [ ] Global checks show
  - [ ] Section checks show
  - [ ] Green checks for valid data
  - [ ] Red errors for missing data
  - [ ] JSON snippet shows next to checks

### Phase 5: RenderFactory Renderers ✅
Test each renderer by creating content with that type:

**Text Renderers:**
- [ ] `text` - Single line input
- [ ] `textarea` - Multi-line input
- [ ] `number` - Numeric input
- [ ] `richText` - Markdown editor (TODO)

**List Renderers:**
- [ ] `list` - Bullet list with labels
- [ ] `listNoTitle` - Simple bullet list
- [ ] `metricCards` - Grid of metric cards
- [ ] `nestedCards` - Array of card objects

**Object Renderers:**
- [ ] `objectForm` - Nested object fields

**Chart Renderers:**
- [ ] `pieChart` - Circular chart
- [ ] `barChart` - Bar chart (vertical/horizontal)
- [ ] `lineChart` - Line graph
- [ ] `radialChart` - Donut/progress

**Rich Content Renderers:**
- [ ] `codeBlock` - Code with syntax highlighting
- [ ] `quote` - Blockquote with glassmorphism

**Media Renderers:**
- [ ] `image` - Image with auto-scale
- [ ] `video` - Video with controls
- [ ] `embeddedVideo` - YouTube/Vimeo embed

**Layout Renderers:**
- [ ] `hr` - Horizontal divider
- [ ] `statusBoard` - Kanban-style table
- [ ] `progressBar` - Progress indicator (TODO)

### Phase 6: Frontend Integration ✅
- [ ] Place JSON in `src/data/summaries/`
- [ ] Refresh app - see in timeline
- [ ] Click to open detail
- [ ] All sections render correctly
- [ ] Click "Print" - print mode works
- [ ] Click dark mode toggle - theme switches
- [ ] Click "Export Image" - PNG downloads
- [ ] Test on mobile - responsive

### Phase 7: Expression Rendering ✅
Add expressions to content and verify they render:

- [ ] `{{currency:1500000}}` → $1.5M
- [ ] `{{short:2500}}` → 2.5K
- [ ] `{{percent:15.5}}` → ↗ 15.5%
- [ ] `{{delta:+12}}` → ↗ +12
- [ ] `{{badge:success}}` → ✓ Success
- [ ] `{{badge:warning}}` → ⚠ Warning
- [ ] `{{trend:up}}` → ↗
- [ ] `{{icon:rocket}}` → 🚀
- [ ] `[[bold]]text[[/bold]]` → **text**
- [ ] `[[highlight]]text[[/highlight]]` → highlighted text

---

## 🎯 End-to-End Scenario

**Create a Weekly Executive Summary from scratch:**

1. **Template Builder** (5 min)
   - [ ] Create new template
   - [ ] Add standard header
   - [ ] Add "Highlights" section (simple list)
   - [ ] Add "Key Metrics" section (metric cards)
   - [ ] Add "Performance" section (bar chart)
   - [ ] Add "Focus Areas" section (simple list)
   - [ ] Save as "weekly-summary-template"

2. **Editor Modal** (10 min)
   - [ ] Click "Load Template"
   - [ ] Choose "weekly-summary-template"
   - [ ] Fill header: id, quarter, year, date, title
   - [ ] Add 5 highlights
   - [ ] Add 4 metric cards:
     - Revenue: $2.4M
     - Growth: +35%
     - Customers: 1,250
     - Retention: 94%
   - [ ] Add bar chart data (6 months)
   - [ ] Add 3 focus areas
   - [ ] Mark all sections complete
   - [ ] Publish

3. **Content Modal** (2 min)
   - [ ] Visual tab: preview looks good
   - [ ] JSON tab: copy JSON
   - [ ] Validation tab: all green

4. **Frontend** (3 min)
   - [ ] Create `src/data/summaries/week-nov-10-2024.json`
   - [ ] Paste JSON
   - [ ] Refresh app
   - [ ] See summary in timeline
   - [ ] Click to open
   - [ ] Verify:
     - [ ] Header displays
     - [ ] Highlights show as bullet list
     - [ ] Metrics show as 4 cards in grid
     - [ ] Chart displays with correct data
     - [ ] Focus areas show as list
   - [ ] Test print mode
   - [ ] Test dark mode
   - [ ] Export as image

✅ **If all steps pass, system is FULLY FUNCTIONAL!**

---

## 🐛 Troubleshooting

### Problem: Asset won't drag
- **Solution:** Some assets use "Add" button (Layout category)

### Problem: Field doesn't appear after drag
- **Solution:** Check if section has layout type set (should auto-detect on first asset)

### Problem: Can't publish in Editor Modal
- **Solution:** Check protection mode and completion % (must be 100% to publish with protection ON)

### Problem: Validation shows errors
- **Solution:** Check JSON structure - missing `_type` or `_enabled` metadata

### Problem: Frontend doesn't show new content
- **Solution:** 
  1. Check file is in correct folder
  2. Refresh browser (Ctrl+Shift+R)
  3. Check browser console for errors

### Problem: Chart doesn't render
- **Solution:** Check chartConfig has correct keys (dataKey, xAxisKey, etc.)

### Problem: Expression doesn't render
- **Solution:** Check syntax (must be exact, e.g., `{{currency:123}}` not `{{ currency: 123 }}`)

---

## 📊 Test Results Template

```
COMPONENT TEST RESULTS
=====================

Asset Engine (Template Builder)
- [ ] Asset library loads
- [ ] Can drag assets
- [ ] Assets create correct schema
- [ ] Multi-column layouts work
Status: ____

Template Builder
- [ ] Create template
- [ ] Save template
- [ ] Load template
- [ ] Export template
Status: ____

Editor Modal
- [ ] Edit fields
- [ ] Section controls
- [ ] Protection mode
- [ ] Publish workflow
Status: ____

Content Modal
- [ ] Visual preview
- [ ] JSON view
- [ ] Validation view
Status: ____

RenderFactory
- [ ] All renderers work
- [ ] Edit mode works
- [ ] Display mode works
Status: ____

Frontend App
- [ ] Auto-load works
- [ ] Detail views work
- [ ] Expressions render
- [ ] Print/export works
Status: ____

OVERALL SYSTEM: ____
```

---

## ✅ Success Criteria

System is **COMPLETE** and **PRODUCTION READY** when:

1. ✅ All asset types can be added to templates
2. ✅ Templates can be saved and loaded
3. ✅ Editor Modal can edit all field types
4. ✅ Protection mode prevents incomplete publishes
5. ✅ Content Modal shows correct previews
6. ✅ Validation catches schema errors
7. ✅ Frontend auto-loads new content
8. ✅ All 20+ renderers work correctly
9. ✅ Expressions render properly
10. ✅ End-to-end scenario completes successfully

**Current Status:** System is architecturally sound and ready for testing! 🎉
