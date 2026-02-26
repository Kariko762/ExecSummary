# Initiative Editor Modal - Styling Fixes Required

**File:** `cms-admin/src/components/InitiativeEditorModal.tsx`

---

## 🎨 Global Styling Standards

### **Button Colors**
- ✅ **Add Buttons:** `#4bcd3e` green with white text
- ✅ **Delete/Remove Buttons:** Transparent white background (`bg-white/10`) with white icon only (no text)
- ✅ **Save Buttons:** Keep existing blue/primary colors

### **Delete Button Standard**
```tsx
<button
  className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors"
  onClick={handleDelete}
>
  <X className="w-4 h-4 text-white" />
</button>
```

### **Add Button Standard**
```tsx
<button
  className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1 font-roobert-medium"
  onClick={handleAdd}
>
  <Plus className="w-3 h-3" />
  Add [Item Name]
</button>
```

### **Input/Select Background Fix**
All inputs and selects inside edit panels must have:
- Background: `bg-white/5` or `bg-[#0a0f1a]/50`
- Text: `text-white`
- Border: `border-white/10`
- NO `bg-gray-50` or `dark:bg-gray-800` (causes white backgrounds)

---

## 📋 Section-by-Section Fixes

### **1. Key Stakeholders (Lines ~600-670)**

**Issues:**
- White text on white background (`bg-gray-50 dark:bg-gray-800`)
- Delete button is full button with text

**Fixes:**
```tsx
// OLD (line ~604)
<div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">

// NEW
<div className="p-3 bg-white/5 rounded-lg border border-white/10">

// OLD Delete button (~662)
<button className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs flex items-center gap-1">
  <X className="w-3 h-3" />
  Remove
</button>

// NEW Delete button
<button className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors">
  <X className="w-4 h-4 text-white" />
</button>

// OLD Add button (~673)
<button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg flex items-center gap-1">

// NEW Add button
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1 font-roobert-medium">
```

---

### **2. Milestones Tab - Edit Gantt Button**

**Issues:**
- Button text unclear
- White text on white background in milestone edit boxes

**Fixes:**
```tsx
// Find "Edit Gantt" button - make it green
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg">

// Find milestone edit containers - fix background
// OLD
<div className="p-3 bg-gray-100 dark:bg-gray-800...">
// NEW  
<div className="p-3 bg-white/5 border border-white/10...">

// Add Milestone button
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Milestone
</button>
```

---

### **3. SMART Goals Section - Descriptive Button Text**

**Issues:**
- Buttons just say "+ Add" instead of "+ Add Objective"
- Not enough context for what's being added

**Fixes:**
```tsx
// Objectives section
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Objective
</button>

// Metrics section
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Metric
</button>

// CRO Alignment section
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Impact
</button>

// Strategic Themes section
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Theme
</button>
```

---

### **4. Dependencies Tab**

**Issues:**
- White text on white background in edit boxes
- Add buttons not green
- Remove buttons have text

**Fixes:**
```tsx
// Internal Dependencies edit box
<div className="p-3 bg-white/5 rounded-lg border border-white/10">
  // inputs here with bg-white/5 text-white
</div>

// Add Internal Dependency button
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Internal Dependency
</button>

// Add External Dependency button  
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add External Dependency
</button>

// Add Blocker button
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Blocker
</button>

// Remove buttons (icon only)
<button className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors">
  <X className="w-4 h-4 text-white" />
</button>
```

---

### **5. Performance Tab**

**Issues:**
- Same as Dependencies - white on white
- Add buttons not green

**Fixes:**
```tsx
// Leading Indicators Add button
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Leading Indicator
</button>

// Lagging Indicators Add button
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Lagging Indicator
</button>

// Edit boxes
<div className="p-3 bg-white/5 rounded-lg border border-white/10">
```

---

### **6. Resources Tab**

**Issues:**
- "+ Add Member" not green
- "+ Add Tool" not green
- Tools showing "[object Object]" instead of tool names
- White text on white background in member tiles
- Remove buttons have text

**Fixes:**
```tsx
// Add Member button
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Team Member
</button>

// Add Tool button
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Tool
</button>

// Tools rendering fix - find where tools are displayed
// OLD (likely showing object directly)
{tool}

// NEW (extract tool name property)
{typeof tool === 'string' ? tool : tool.tool || tool.name}

// Member tile background
<div className="p-3 bg-white/5 rounded-lg border border-white/10">

// Remove buttons (icon only)
<button className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors">
  <X className="w-4 h-4 text-white" />
</button>
```

---

### **7. Risks Tab**

**Issues:**
- "Add Risk" button not green
- Risk edit boxes white text on white background
- Remove buttons have text

**Fixes:**
```tsx
// Add Risk button
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Risk
</button>

// Add Success Criteria button
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Success Criteria
</button>

// Risk edit boxes
<div className="p-3 bg-white/5 rounded-lg border border-white/10">

// Remove buttons
<button className="p-2 rounded bg-white/10 hover:bg-white/20 transition-colors">
  <X className="w-4 h-4" text-white" />
</button>
```

---

### **8. Tasks Tab**

**Issues:**
- Tasks render as white boxes
- Should match dark theme

**Fixes:**
```tsx
// Task container
<div className="p-4 bg-white/5 rounded-lg border border-white/10">
  // Task content with text-white
</div>

// Add Task button
<button className="px-3 py-1.5 bg-[#4bcd3e] hover:bg-[#3db032] text-white text-sm rounded-lg flex items-center gap-1">
  <Plus className="w-3 h-3" />
  Add Task
</button>
```

---

### **9. Notes Field - Prevent Re-render on Every Keystroke**

**Issue:**
- Typing in notes field re-renders entire screen
- Likely using `onChange` that updates state on every letter

**Fix:**
```tsx
// Add state for tracking changes
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

// Update onChange handlers to set flag
onChange={(e) => {
  setEditData({ ...editData, notes: e.target.value });
  setHasUnsavedChanges(true);
}}

// Update onClose handler to warn
const handleClose = () => {
  if (hasUnsavedChanges) {
    if (confirm('You have unsaved changes. Are you sure you want to close?')) {
      onClose();
    }
  } else {
    onClose();
  }
};

// Update save handler to reset flag
const handleSave = () => {
  onSave(editData);
  setHasUnsavedChanges(false);
  onClose();
};
```

---

### **10. Goals Tab**

**Issues:**
- Goals are white on white
- Should be 2-column layout to fit more on screen

**Fixes:**
```tsx
// Goals grid - change from single column to 2 columns
<div className="grid grid-cols-2 gap-3">
  {goals.map((goal) => (
    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={editData.linkedGoals?.includes(goal.id)}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#4bcd3e]"
        />
        <span className="text-white font-roobert-medium">{goal.name}</span>
      </div>
    </div>
  ))}
</div>
```

---

## 🔧 Implementation Checklist

- [ ] Fix Key Stakeholders background and delete buttons
- [ ] Change all Add buttons to #4bcd3e green
- [ ] Fix Milestones white text issues
- [ ] Make button text descriptive (+ Add Objective, etc.)
- [ ] Standardize Delete buttons to icon-only
- [ ] Fix Dependencies white text issues
- [ ] Fix Performance tab styling
- [ ] Fix Resources tab + "[object Object]" bug
- [ ] Fix Risks tab styling
- [ ] Fix Tasks tab theme
- [ ] Implement unsaved changes warning
- [ ] Make Goals tab 2-column layout

---

**Total Estimated Changes:** ~50+ individual edits across the file
**Approach:** Use multi_replace_string_in_file for efficiency
