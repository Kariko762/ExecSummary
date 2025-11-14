# Template Builder - Internal Architecture Review 🔍

**Component:** `cms-admin/src/components/TemplateBuilder.tsx`  
**Lines:** 3,187 lines  
**Purpose:** Drag-and-drop template creation system with multi-column layout support

---

## 🏗️ Core Architecture

### State Management (Lines 792-883)

**Primary State:**
```typescript
const [sections, setSections] = useState<TemplateSection[]>([...])  // Main template structure
const [draggedAsset, setDraggedAsset] = useState<AssetItem | null>(null)
const [draggedField, setDraggedField] = useState<{ sectionId, fieldId } | null>(null)
const [headerDefaults, setHeaderDefaults] = useState({...})  // Standard header values
```

**Modal/UI State:**
```typescript
const [showSaveModal, setShowSaveModal] = useState(false)
const [showLoadTemplateModal, setShowLoadTemplateModal] = useState(false)
const [showTestEditor, setShowTestEditor] = useState(false)
const [previewAsset, setPreviewAsset] = useState<AssetItem | null>(null)
const [notification, setNotification] = useState<{type, message} | null>(null)
```

**Save State:**
```typescript
const [saveTemplateName, setSaveTemplateName] = useState<string>('')
const [saveTemplateDescription, setSaveTemplateDescription] = useState<string>('')
const [isSaving, setIsSaving] = useState(false)
const [validationResults, setValidationResults] = useState<Array<...>>([])
```

**Layout State:**
```typescript
const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['basic']))
const useSnapLayout = true  // Always enabled
```

---

## 📦 Data Structures

### TemplateSection
```typescript
interface TemplateSection {
  id: string;                      // Unique identifier
  name: string;                    // Display name
  expanded: boolean;               // UI state
  fields: TemplateField[];         // Array of fields
  sectionLayoutType?: LayoutZone;  // Layout pattern (full, 50/50, etc.)
}
```

### TemplateField
```typescript
interface TemplateField {
  id: string;                 // Unique identifier
  key: string;                // Data key (used in JSON output)
  label: string;              // Display label
  renderType: string;         // How to render (text, list, chart, etc.)
  schema: FieldSchema;        // Complete field schema
  exampleData?: any;          // Sample data for preview
  layoutZone?: LayoutZone;    // Column position (left-50, right-50, etc.)
  rowIndex?: number;          // Row number in section
}
```

### AssetItem (from ASSET_LIBRARY)
```typescript
interface AssetItem {
  id: string;                       // Asset identifier
  name: string;                     // Display name
  renderType: string;               // Render type
  description: string;              // Help text
  schema: FieldSchema;              // Template schema
  icon?: typeof Type;               // Icon component
  iconColor?: string;               // Icon color class
  exampleData?: any;                // Default example data
  supportsMultiColumn?: boolean;    // Can be used in layouts
}
```

---

## 🎨 Asset Library Structure (Lines 82-680)

**7 Categories with 22 Total Assets:**

### 1. Basic Inputs (4 assets)
- `text` - Single-line text input
- `textarea` - Multi-line text input
- `number` - Numeric input
- `date` - Date picker

### 2. Lists & Arrays (3 assets)
- `list` - Bullet list with labels
- `listNoTitle` - Simple bullet list
- `nestedCards` - Array of card objects

### 3. Complex (2 assets)
- `object` - Nested object structure
- `keyValue` - Key-value pairs

### 4. Rich Content (4 assets)
- `richText` - Markdown editor
- `expression` - Dynamic expressions
- `codeBlock` - Code with syntax highlighting
- `quote` - Blockquote with glassmorphism

### 5. Charts (4 assets)
- `pieChart` - Circular chart
- `barChart` - Bar chart (vertical/horizontal)
- `lineChart` - Line graph
- `radialChart` - Donut/progress

### 6. Media (3 assets)
- `image` - Image with auto-scale
- `video` - Video with controls
- `embeddedVideo` - YouTube/Vimeo embed

### 7. Layout (2 assets)
- `hr` - Horizontal rule/divider
- `statusBoard` - Kanban-style table

---

## 🔄 Key Functions

### 1. **handleSectionDrop** (Lines 1156-1253)
**Purpose:** Handle dropping an asset into a section

**Logic Flow:**
```
1. Check if section is empty
   └─ If empty → Use first zone from sectionLayoutType
   └─ If not empty → Get next zone in sequence

2. Create new TemplateField
   ├─ Generate unique ID
   ├─ Set key (assetId + timestamp)
   ├─ Copy schema from asset
   ├─ Copy exampleData
   └─ Set layoutZone and rowIndex

3. Update sections state
   └─ Add field to section's fields array
```

**Multi-Column Logic:**
```typescript
if (section.fields.length === 0) {
  // First asset - sets the layout pattern
  const sequence = getLayoutSequence(section.sectionLayoutType);
  const firstZone = sequence[0];
  newField.layoutZone = firstZone;
  newField.rowIndex = 0;
} else {
  // Sequential placement
  const nextPlacement = getNextZoneInSequence(section);
  newField.layoutZone = nextPlacement.zone;
  newField.rowIndex = nextPlacement.row;
}
```

### 2. **getLayoutSequence** (Lines 954-971)
**Purpose:** Convert base zone to full sequence

**Examples:**
```typescript
'full' → ['full']
'left-50' → ['left-50', 'right-50']
'left-70' → ['left-70', 'right-30']
'left-33' → ['left-33', 'middle-33', 'right-33']
```

### 3. **getNextZoneInSequence** (Lines 973-993)
**Purpose:** Determine where next asset should go

**Logic:**
```
1. Get layout sequence for section
2. Group existing fields by rowIndex
3. Check if current row has space
   └─ If space → Return next zone in sequence
   └─ If full → Start new row with first zone
```

### 4. **performSave** (Lines 1665-1815)
**Purpose:** Convert sections to flat JSON structure

**Output Structure:**
```json
{
  // Standard header (top-level)
  "id": "...",
  "quarter": "...",
  "year": 2025,
  "date": "...",
  "title": "...",
  
  // Section data
  "sectionName": [...],
  
  // Section metadata
  "_enabled_sectionName": true,
  "_completed_sectionName": false,
  "_sectionName_type": "renderType",
  "_sectionName_itemSchema": {...},
  "_sectionName_chartConfig": {...},
  
  // Global metadata
  "status": "draft",
  "protectionEnabled": false
}
```

**Key Logic:**
```typescript
// Multi-field sections use indexed keys
const fieldKey = section.fields.length > 1 
  ? `${sectionKey}_${fieldIndex}`  // e.g., "charts_0", "charts_1"
  : sectionKey;                     // e.g., "highlights"

// Save metadata
templateData[`_${fieldKey}_type`] = fieldType;
templateData[`_${fieldKey}_itemSchema`] = field.schema.itemSchema;
templateData[`_${fieldKey}_chartConfig`] = field.schema.chartConfig;

// Save data
templateData[fieldKey] = field.exampleData || defaultValue;

// Save group-level flags (for multi-field sections)
templateData[`_enabled_${sectionKey}`] = true;
templateData[`_completed_${sectionKey}`] = false;
```

### 5. **loadTemplate** (Lines 1011-1108)
**Purpose:** Load saved template back into builder

**Logic:**
```
1. Fetch template from backend
2. Create standard header section
3. Loop through all top-level keys
4. For each key with _type metadata:
   ├─ Extract itemSchema, chartConfig
   ├─ Create TemplateField
   └─ Create TemplateSection with field
5. Update sections state
```

**Note:** Loads one field per section (doesn't reconstruct multi-field sections)

### 6. **handleExport** (Lines 1113-1128)
**Purpose:** Export template as JSON file

```typescript
const templateData = await performSave(true);  // Dry run
const blob = new Blob([JSON.stringify(templateData, null, 2)]);
// Download file
```

### 7. **handlePreview** (Lines 1131-1137)
**Purpose:** Test template in EditorModalV2

```typescript
const templateData = await performSave(true);
setTestData(templateData);
setShowTestEditor(true);
```

---

## 🎯 Critical Flows

### Flow 1: Creating a Template
```
User clicks "Add Section"
  ↓
Choose layout (full, 50/50, 70/30, etc.)
  ↓
createSectionWithLayout(layoutType)
  ├─ Creates new TemplateSection
  ├─ Sets sectionLayoutType
  └─ Adds to sections array
  ↓
Drag asset from library
  ↓
handleSectionDrop(sectionId)
  ├─ Creates TemplateField
  ├─ Sets layoutZone based on sequence
  ├─ Sets rowIndex
  └─ Adds to section.fields
  ↓
Repeat dragging assets
  ↓
Each asset fills next zone in sequence
```

### Flow 2: Saving a Template
```
User clicks "Save Template"
  ↓
setShowSaveModal(true)
  ↓
User enters name/description
  ↓
saveTemplate()
  ├─ Validates name
  └─ Calls performSave(false)
      ├─ Loops through sections
      ├─ Converts to flat structure
      ├─ Generates metadata keys
      ├─ POSTs to backend
      └─ Returns success/error
```

### Flow 3: Multi-Column Section Creation
```
Section has sectionLayoutType = 'left-50'
  ↓
getLayoutSequence('left-50') → ['left-50', 'right-50']
  ↓
First asset dropped
  ├─ layoutZone = 'left-50'
  ├─ rowIndex = 0
  └─ key = 'section_0'
  ↓
Second asset dropped
  ├─ layoutZone = 'right-50'
  ├─ rowIndex = 0
  └─ key = 'section_1'
  ↓
Third asset dropped
  ├─ Row 0 is full (2 zones used)
  ├─ Start new row
  ├─ layoutZone = 'left-50'
  ├─ rowIndex = 1
  └─ key = 'section_2'
```

### Flow 4: JSON Output for Multi-Field Section
```
Section: "charts"
Fields: [
  { key: "charts_0", renderType: "pieChart" },
  { key: "charts_1", renderType: "radialChart" },
  { key: "charts_2", renderType: "barChart" }
]

Output:
{
  "charts_0": [...],
  "_charts_0_type": "pieChart",
  "_charts_0_itemSchema": {...},
  "_charts_0_chartConfig": {...},
  
  "charts_1": [...],
  "_charts_1_type": "radialChart",
  "_charts_1_itemSchema": {...},
  "_charts_1_chartConfig": {...},
  
  "charts_2": [...],
  "_charts_2_type": "barChart",
  "_charts_2_itemSchema": {...},
  "_charts_2_chartConfig": {...},
  
  "_enabled_charts": true,
  "_completed_charts": false
}
```

---

## ⚙️ Helper Functions

### getWidthClass (Lines 903-920)
Maps LayoutZone to Tailwind width class:
```typescript
'full' → 'w-full'
'left-50' → 'w-1/2'
'left-70' → 'w-[70%]'
'left-33' → 'w-1/3'
```

### getZoneLabel (Lines 922-938)
Maps LayoutZone to display name:
```typescript
'left-50' → 'Left 50%'
'left-70' → 'Left 70%'
```

### groupFieldsByRow (Lines 940-947)
Groups fields by rowIndex for rendering:
```typescript
{
  0: [field1, field2],  // Row 0
  1: [field3]            // Row 1
}
```

### formatSectionTitle (Lines 1101-1106)
Converts snake_case to Title Case:
```typescript
'key_metrics' → 'Key Metrics'
'activityMetrics' → 'Activity Metrics'
```

---

## 🎨 UI Components

### Asset Library (Left Sidebar)
- Accordion-style categories (one open at a time)
- Draggable asset cards with:
  - Icon and color
  - Name and renderType
  - Description
  - Preview button (opens AssetPreviewModal)
  - "MULTI" badge for multi-column support

### Canvas (Center)
- Standard Header (always first, non-removable)
- Draggable sections
- Collapsible sections
- Fields grouped by row
- Visual layout indicators

### Actions (Top Bar)
- Back button
- Load Template
- Export
- Test (preview in EditorModal)
- Save Template

---

## 🚨 Current Limitations & Known Issues

### 1. **Load Template Doesn't Reconstruct Multi-Field Sections**
```typescript
// loadTemplate creates ONE section per data key
// Doesn't group "charts_0", "charts_1", "charts_2" back into "charts" section

// Current behavior:
{
  "charts_0": [...],  → Creates "Charts 0" section with 1 field
  "charts_1": [...],  → Creates "Charts 1" section with 1 field
  "charts_2": [...]   → Creates "Charts 2" section with 1 field
}

// Expected behavior:
{
  "charts_0": [...],
  "charts_1": [...],  → Should create "Charts" section with 3 fields
  "charts_2": [...]
}
```

### 2. **Section Name to Key Conversion**
```typescript
// sectionKey generation uses name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
// Can create collisions if names differ only in punctuation

"My Section!" → "my_section"
"My Section?" → "my_section"  // COLLISION!
```

### 3. **No Field Key Editing**
- Field keys are auto-generated: `${assetId}_${timestamp}`
- User cannot customize the JSON key name
- Can lead to ugly keys like: `text_1731218201827`

### 4. **Standard Header Not Editable**
- Header fields are fixed
- User cannot add/remove header fields
- Values only editable via headerDefaults state

### 5. **No Layout Type Change After First Asset**
- Once first asset is dropped, sectionLayoutType is locked
- User cannot switch from 50/50 to 70/30 without deleting section

---

## 💡 Potential Enhancements

### Priority 1: Fix Multi-Field Section Loading
**Problem:** Loaded templates don't reconstruct multi-column sections  
**Solution:** Update `loadTemplate()` to group indexed fields

```typescript
// Group keys by base name
const fieldGroups = new Map<string, string[]>();
Object.keys(templateData).forEach(key => {
  const match = key.match(/^(.+)_(\d+)$/);
  if (match) {
    const [, baseName, index] = match;
    if (!fieldGroups.has(baseName)) fieldGroups.set(baseName, []);
    fieldGroups.get(baseName).push(key);
  }
});

// Create sections with multiple fields
fieldGroups.forEach((keys, baseName) => {
  const fields = keys.map(key => createFieldFromKey(key, templateData));
  newSections.push({
    id: generateId(),
    name: formatSectionTitle(baseName),
    fields: fields,
    sectionLayoutType: detectLayoutType(fields)
  });
});
```

### Priority 2: Field Key Editor
**Addition:** Allow editing field.key in UI  
**UI:** Double-click field key to edit inline

### Priority 3: Section Rename
**Addition:** Allow renaming sections (updates all field keys)  
**UI:** Pencil icon next to section name

### Priority 4: Layout Switcher
**Addition:** Allow changing sectionLayoutType after creation  
**Warning:** "This will reset field positions. Continue?"

### Priority 5: Header Field Customization
**Addition:** Make header fields editable/removable  
**UI:** Same drag-and-drop as regular sections

---

## 📊 Statistics

**Total Lines:** 3,187  
**Asset Categories:** 7  
**Asset Types:** 22  
**Layout Types:** 10 (full, 50/50, 70/30, 30/70, 33/33/33, etc.)  
**State Variables:** ~25  
**Major Functions:** ~15  
**Imports:** 35 icons, 3 external components  

---

## 🎯 What Functionality Do You Want to Add?

Based on this review, here are common requests:

1. **Field key editing** - Let users customize JSON keys
2. **Section renaming** - Change section name (updates all keys)
3. **Multi-field loading fix** - Reconstruct multi-column sections correctly
4. **Layout switcher** - Change layout type after creation
5. **Field reordering** - Drag to reorder within section
6. **Copy/duplicate field** - Clone existing field
7. **Section templates** - Pre-built section patterns
8. **Validation warnings** - Show issues before save
9. **Field preview** - Preview individual field rendering
10. **Bulk operations** - Select multiple fields, move/delete

**What feature would you like to add?** 🤔
