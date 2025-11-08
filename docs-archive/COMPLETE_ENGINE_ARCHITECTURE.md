# Complete Rendering Engine Architecture

## Overview
A fully integrated, theme-driven, schema-based rendering system that automatically generates consistent UIs from JSON configurations.

---

## Layer 1: Style Theme (Design System)

**Purpose:** Single source of truth for ALL visual styling

**Location:** `src/design-system/colors.ts`

**What It Defines:**

```typescript
{
  // Typography Roles
  header: {
    size: 'text-2xl',
    font: 'font-roobert-heavy',
    color: 'text-gray-900 dark:text-white'
  },
  title: {
    size: 'text-xl',
    font: 'font-roobert-semibold',
    color: 'text-gray-700 dark:text-gray-300'
  },
  subtitle: {
    size: 'text-base',
    font: 'font-roobert-medium',
    color: 'text-gray-600 dark:text-gray-400'
  },
  label: {
    size: 'text-xs',
    font: 'font-roobert-medium',
    color: 'text-fis-eggplant dark:text-fis-raspberry'
  },
  value: {
    size: 'text-sm',
    font: 'font-roobert-medium',
    color: 'text-gray-900 dark:text-white'
  },
  listItem: {
    size: 'text-sm',
    font: 'font-roobert-regular',
    color: 'text-gray-700 dark:text-gray-300'
  },
  // ... etc
}
```

**Key Principle:** Every UI element maps to a theme role. Change the theme, entire app updates.

---

## Layer 2: Glossary (Pre-Defined Render Types)

**Purpose:** Library of reusable UI building blocks with style mappings

**Location:** `src/types/schema.ts` + Engine Glossary Modal

**Available Blocks:**

| Block Name | What It Renders | Style Theme Mapping | Display Mode | Edit Mode |
|------------|-----------------|---------------------|--------------|-----------|
| **text** | Single line text | label + value | Plain text | Text input |
| **textarea** | Multi-line text | label + value | Formatted text | Textarea |
| **number** | Numeric input | label + value | Formatted number | Number input |
| **list** | Key-value pairs | label (keys) + value (vals) | Vertical list | Add/remove items |
| **listNoTitle** | Simple array | listItem | Bulleted list | Add/remove items |
| **metricCards** | Metric grid | label + valueHeavy | Card grid | Number inputs |
| **nestedCards** | Object array | label + value | Expandable cards | Inline edit forms |
| **objectForm** | Single object | label + value | Key-value display | Form inputs |

**Each Block Defines:**
1. **Schema structure** (what fields it needs)
2. **Display renderer** (how it looks on frontend)
3. **Edit renderer** (how it's edited in CMS)
4. **Style mapping** (which theme roles to use)

---

## Layer 3: JSON Content Files (Schema Instances)

**Purpose:** Actual content data built from Glossary blocks

**Location:** `src/data/summaries/*.json`, `src/data/initiatives/*.json`, etc.

**Example:**

```json
{
  "keyMetrics": {
    "_renderAs": "metricCards",
    "_schema": {
      "revenue": { "renderAs": "number", "label": "Revenue" },
      "growth": { "renderAs": "number", "label": "Growth" },
      "customers": { "renderAs": "number", "label": "Customers" },
      "satisfaction": { "renderAs": "number", "label": "NPS Score" }
    },
    "revenue": 2500000,
    "growth": 15,
    "customers": 1200,
    "satisfaction": 92
  },
  
  "demoStudio": {
    "_renderAs": "list",
    "_schema": { "renderAs": "list", "label": "Demo Studio" },
    "Demos Registered": "263",
    "Demos Linked To Deals": "126",
    "Won ACV": "1230000",
    "Conversion Rate": "48"
  },
  
  "highlights": {
    "_renderAs": "listNoTitle",
    "_schema": { "renderAs": "listNoTitle", "label": "Key Highlights" },
    "value": [
      "Achieved 95% customer satisfaction",
      "Completed Phase 1 migration ahead of schedule",
      "Reduced operational costs by 12%"
    ]
  }
}
```

**Pattern:** 
- `_renderAs` → Which Glossary block to use
- `_schema` → Configuration for that block
- Actual data → Content to display/edit

---

## Layer 4: Rendering Engine (The Magic!)

**Purpose:** Connects JSON + Glossary + Theme → Generates UI

**Location:** `src/renderers/RenderFactory.tsx` + Individual renderers

**How It Works:**

```typescript
// 1. Read JSON content
const data = {
  "revenue": {
    "_renderAs": "number",
    "value": 2500000
  }
};

// 2. Engine routes to correct renderer
RenderFactory({
  schema: { renderAs: "number", label: "Revenue" },
  value: 2500000,
  mode: "display" // or "edit"
});

// 3. NumberRenderer applies theme
return (
  <div>
    <label className={getClasses.label()}>  {/* ← From Theme */}
      Revenue:
    </label>
    <span className={getClasses.valueHeavy()}>  {/* ← From Theme */}
      $2,500,000
    </span>
  </div>
);
```

**Dual Render Modes:**

Every renderer has TWO views:

### **Display Mode** (Executive Summary Frontend)
- **Purpose:** Beautiful, polished, read-only presentation
- **Style:** Full theme application (cards, colors, icons)
- **Interactivity:** None (just display)
- **Example:** Metric cards with icons and colors

### **Edit Mode** (CMS EditorModal)
- **Purpose:** Functional, editable forms
- **Style:** Form inputs with labels (still theme-styled)
- **Interactivity:** Add, edit, delete, validate
- **Example:** Input fields with add/remove buttons

**Same renderer, different behavior based on `mode` prop!**

---

## How Everything Connects

### **Step-by-Step Flow:**

1. **User creates content in CMS**
   - EditorModal renders form using Glossary blocks in EDIT mode
   - User fills in data using styled inputs (theme-based)
   
2. **Data saved as JSON**
   - Content file stores: `_renderAs` + `_schema` + data
   - Schema links to Glossary block
   
3. **Frontend loads JSON**
   - Reads `_renderAs` to know which block to use
   - RenderFactory routes to correct renderer
   
4. **Renderer displays content**
   - Uses DISPLAY mode
   - Applies theme styles
   - Renders beautiful UI

5. **User edits content**
   - Same renderer switches to EDIT mode
   - Shows forms instead of static display
   - Still uses same theme for consistency

---

## The EditorModal Question

**Current State:** EditorModal has hardcoded sections with custom rendering

**Target State:** EditorModal should be ENGINE-DRIVEN!

```typescript
// Instead of hardcoded sections, EditorModal should:
const schema = getSummarySchema(); // ← Loads schema definition

schema.sections.map(section => (
  <RenderFactory
    schema={section}
    value={data[section.id]}
    mode="edit"  // ← EditorModal always uses edit mode
  />
));
```

**Benefits:**
- ✅ EditorModal automatically supports new content types
- ✅ Consistent styling (theme-based)
- ✅ No hardcoded UI - everything from schema
- ✅ Add/remove sections by editing schema file

---

## Implementation Roadmap

### **Phase 1: Complete Style Theme** ✅ DONE
- [x] Create design system with all theme roles
- [x] Define helpers: `getClasses.label()`, `getClasses.value()`, etc.
- [x] Document usage patterns

### **Phase 2: Update All Renderers** ✅ DONE
- [x] TextRenderer uses theme
- [x] TextareaRenderer uses theme
- [x] NumberRenderer uses theme
- [x] ListRenderer uses theme
- [x] MetricCardsRenderer uses theme
- [x] NestedCardsRenderer uses theme
- [x] ObjectFormRenderer uses theme

### **Phase 3: Create Schema Definitions** 🔄 IN PROGRESS
- [ ] `src/schemas/summarySchema.ts` - Executive summary structure
- [ ] `src/schemas/executiveIQSchema.ts` - Article/blog structure
- [ ] `src/schemas/organizationSchema.ts` - Organization data
- [ ] `src/schemas/initiativeSchema.ts` - Strategic initiative structure
- [ ] Each schema includes `_renderAs` + theme mappings

### **Phase 4: Refactor JSON Files** 📋 TODO
- [ ] Add `_renderAs` and `_schema` to existing JSON
- [ ] Example: `week-oct-31-2024.json` → includes render instructions
- [ ] Backward compatible (old format still works)

### **Phase 5: Engine-Driven EditorModal** 📋 TODO
- [ ] Load schema instead of hardcoded sections
- [ ] Use RenderFactory for all fields
- [ ] Remove hardcoded rendering logic
- [ ] Test full create/edit workflow

### **Phase 6: Frontend Integration** 📋 TODO
- [ ] Update SummaryDetail to use engine
- [ ] Update Dashboard to use engine
- [ ] Update all display components
- [ ] Theme applies automatically everywhere

---

## Benefits of Complete System

### **For Developers:**
1. **Add new content types** → Just create schema file
2. **Change styling** → Edit theme once, updates everywhere
3. **Consistent code** → Same patterns everywhere
4. **Less code** → Engine does the work
5. **Type safety** → TypeScript autocomplete for schemas

### **For Content Creators:**
1. **Consistent CMS** → All content edited the same way
2. **Predictable** → Same blocks work the same everywhere
3. **Validated** → Schema enforces correct structure
4. **Templates** → Reuse schemas for similar content

### **For End Users:**
1. **Consistent UI** → Everything looks cohesive
2. **Dark mode** → Automatic everywhere
3. **Responsive** → Mobile-first built-in
4. **Accessible** → Theme enforces contrast ratios

---

## Example: Complete Flow

**User wants to add "Team Metrics" section:**

1. **Define in schema:**
```typescript
// src/schemas/summarySchema.ts
{
  sections: [
    // ... existing sections
    {
      id: 'teamMetrics',
      title: 'Team Metrics',
      renderAs: 'metricCards',
      fields: {
        headcount: { renderAs: 'number', label: 'Headcount' },
        retention: { renderAs: 'number', label: 'Retention Rate' },
        satisfaction: { renderAs: 'number', label: 'Team NPS' }
      }
    }
  ]
}
```

2. **Engine automatically:**
   - ✅ Adds to EditorModal (edit mode forms)
   - ✅ Renders on frontend (display mode cards)
   - ✅ Applies theme styling
   - ✅ Validates data structure
   - ✅ Enables/disables section
   - ✅ Shows in validation checks

3. **Zero UI code written!** Just schema config.

---

## Current Status

**What We Have:**
- ✅ Complete design system (theme)
- ✅ 7 working renderers with dual modes
- ✅ RenderFactory routing
- ✅ Engine Glossary documentation
- ✅ Vite aliases for clean imports

**What We Need:**
- 📋 Schema definition files
- 📋 Update JSON files with `_renderAs`
- 📋 Refactor EditorModal to be schema-driven
- 📋 Update frontend components to use engine
- 📋 Test end-to-end workflow

---

## Questions & Answers

**Q: Does EditorModal have its own formatting engine?**
A: Currently NO - it has hardcoded sections. We SHOULD make it use the same engine with `mode="edit"`.

**Q: Can I change the theme?**
A: YES! Edit `src/design-system/colors.ts` and entire app updates.

**Q: How do I add a new render type?**
A: 
1. Create renderer in `src/renderers/NewRenderer.tsx`
2. Add to RenderFactory switch statement
3. Add to Engine Glossary modal
4. Document in schema types

**Q: What if I need custom styling for one instance?**
A: Combine theme with Tailwind utilities: `className={`${getClasses.label()} ml-4`}`

**Q: Is this overkill?**
A: For small projects, yes. For a CMS managing multiple content types with consistent styling? Perfect fit! 🎯

---

## Next Immediate Steps

1. **Create schema files** (summarySchema.ts, etc.)
2. **Test schema → renderer → display flow**
3. **Refactor one section of EditorModal** to prove concept
4. **If successful, migrate all of EditorModal**
5. **Update frontend components**
6. **Profit!** 🚀
