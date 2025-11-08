# Template Builder System - Complete Deep Dive

> **Last Updated:** November 8, 2025  
> **Current State:** Template Builder is operational with dynamic schema-based rendering  
> **Key Reference:** `summary-template-v2.json` is the only properly structured template currently

---

## Table of Contents

1. [System Overview](#system-overview)
2. [The Three-Layer Architecture](#the-three-layer-architecture)
3. [Data Flow: Template Builder → EditorModal → Frontend](#data-flow)
4. [JSON Structure Deep Dive](#json-structure-deep-dive)
5. [Component Breakdown](#component-breakdown)
6. [How Everything Connects](#how-everything-connects)
7. [Creating New Templates](#creating-new-templates)
8. [Current Issues & Solutions](#current-issues--solutions)

---

## System Overview

The Template Builder is a **visual drag-and-drop interface** that allows users to create JSON templates that drive both the CMS editing experience AND the frontend display. The system is **100% dynamic** - everything is data-driven.

### Core Principle: Configuration as Data

```
JSON Template File (Data + Config)
    ↓
Template Builder (Creates/Edits)
    ↓
EditorModalV2 (Edits Content)
    ↓
RenderFactory (Displays on Frontend)
```

**Key Insight:** The JSON file is BOTH:
- **Data**: The actual content (highlights, metrics, etc.)
- **Config**: Metadata that tells the system HOW to render each section

---

## The Three-Layer Architecture

### Layer 1: Asset Type Registry (The Blueprint Library)

**Location:** `src/schemas/assetTypeRegistry.ts`

**Purpose:** Defines ALL available UI building blocks (like a component library)

**What It Contains:**

```typescript
{
  type: 'nestedCards',           // Unique identifier
  label: 'Card List',            // Human-readable name
  description: 'Array of structured card objects',
  category: 'lists',             // Grouping for Template Builder UI
  defaultSchema: {               // Default configuration
    type: 'nestedCards',
    renderAs: 'nestedCards',
    required: false,
    fields: {                    // Structure for each card
      title: { label: 'Title', renderAs: 'text', required: false },
      value: { label: 'Value', renderAs: 'text', required: false }
    }
  }
}
```

**Available Asset Types:**

| Category | Asset Type | What It Renders | Use Cases |
|----------|-----------|-----------------|-----------|
| **basic** | text | Single-line input | Titles, names, IDs |
| | textarea | Multi-line input | Descriptions, outlook |
| | number | Numeric input | Counts, percentages, currency |
| | date | Date picker | Dates, deadlines |
| **lists** | list | Simple text array | Highlights, focus items |
| | listNoTitle | Array without header | Same, no section title |
| | nestedCards | Array of objects | Departments, initiatives, risks |
| **complex** | object | Nested structure | Complex configurations |
| **rich** | markdown | Rich text editor | Documentation (future) |
| | expression | Dynamic templates | Expression syntax (future) |

**Key Functions:**

```typescript
getAssetType(type: string)           // Get definition by type
getAssetTypesByCategory(category)    // Get all assets in category
buildFieldSchema(type, customFields) // Build complete schema for section
```

---

### Layer 2: Template Builder (The Visual Editor)

**Location:** `cms-admin/src/components/TemplateBuilder.tsx`

**Purpose:** Visual drag-and-drop interface to create templates

**UI Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header: [Back] Template Builder [Actions]             │
├──────────────┬──────────────────────┬───────────────────┤
│              │                      │                   │
│  Asset       │   Canvas             │   Properties      │
│  Library     │   (Drop Zones)       │   Inspector       │
│              │                      │                   │
│  Categories: │   [Standard Header]  │   Selected:       │
│  • Basic     │   • id               │   Field Key       │
│  • Lists     │   • quarter          │   Label           │
│  • Complex   │   • year             │   Render Type     │
│  • Rich      │   • date             │   Example Data    │
│              │   • title            │                   │
│  Assets:     │                      │   Schema JSON     │
│  📝 Text     │   [+ Add Section]    │                   │
│  📄 Textarea │                      │                   │
│  🔢 Number   │   [Section 2]        │                   │
│  📋 List     │   • field1           │                   │
│  📇 Cards    │   • field2           │                   │
│              │                      │                   │
└──────────────┴──────────────────────┴───────────────────┘
```

**Workflow:**

1. **Drag Asset** from left sidebar (Asset Library)
2. **Drop into Section** on center canvas
3. **Configure Field** in right sidebar (Properties Inspector)
4. **Add Example Data** for lists/cards (preview data)
5. **Save Template** → Validates and creates JSON file

**Data Structure (Internal State):**

```typescript
interface TemplateSection {
  id: string;              // e.g., 'section-header', 'section-123456'
  name: string;            // e.g., 'Highlights', 'Key Metrics'
  expanded: boolean;       // UI state
  fields: TemplateField[]; // Array of fields in this section
}

interface TemplateField {
  id: string;              // e.g., 'field-123456'
  key: string;             // JSON key (e.g., 'highlights', 'keyMetrics')
  label: string;           // Display label
  renderType: string;      // From Asset Registry (e.g., 'listNoTitle')
  schema: FieldSchema;     // Complete schema object
  exampleData?: any;       // Example data for preview
}
```

**Key Actions:**

```typescript
// Save Template
handleSaveClick() → validateTemplate() → performSave()

// Validation Checks:
✓ Has standard header section
✓ Required header fields present (id, quarter, year, date, title)
✓ At least one content section
✓ All sections have fields
✓ All field keys are unique
✓ All fields have valid schemas
```

**Save Output (What Gets Created):**

The Template Builder converts its internal state into the JSON structure format (see Layer 3).

---

### Layer 3: JSON Template Files (Data + Config)

**Location:** `cms-admin/src/templates/*.json`

**Reference:** `summary-template-v2.json` is the ONLY properly structured template currently

**Structure Breakdown:**

```json
{
  // ═══════════════════════════════════════════════════════
  // STANDARD HEADER (Always Required)
  // ═══════════════════════════════════════════════════════
  "id": "template-summary-v2",
  "quarter": "Month Day",
  "year": 2025,
  "date": "2025-01-01",
  "title": "Your Organization Name - Weekly Executive Update",
  
  // ═══════════════════════════════════════════════════════
  // SECTION 1: Highlights (Simple List)
  // ═══════════════════════════════════════════════════════
  
  // ACTUAL DATA (what gets displayed/edited)
  "highlights": [
    "Example: Key achievement or milestone accomplished this week",
    "Example: Important project completion or major progress update"
  ],
  
  // METADATA (tells system HOW to render)
  "_highlights_type": "listNoTitle",           // ← Render type from Asset Registry
  "_enabled_highlights": true,                  // ← Section enabled in CMS?
  "_completed_highlights": false,               // ← Section marked complete?
  
  // ═══════════════════════════════════════════════════════
  // SECTION 2: Key Metrics (Nested Cards - More Complex)
  // ═══════════════════════════════════════════════════════
  
  // ACTUAL DATA (array of card objects)
  "keyMetrics": [
    {
      "label": "Revenue",
      "value": "0",
      "unit": "$"
    },
    {
      "label": "Growth",
      "value": "0",
      "unit": "%"
    }
  ],
  
  // METADATA
  "_keyMetrics_type": "nestedCards",            // ← Render as array of cards
  "_keyMetrics_fields": {                       // ← Schema for EACH card
    "label": {
      "type": "text",
      "label": "Metric Name"
    },
    "value": {
      "type": "text",
      "label": "Value"
    },
    "unit": {
      "type": "text",
      "label": "Unit"
    }
  },
  "_enabled_keyMetrics": true,
  "_completed_keyMetrics": false,
  
  // ═══════════════════════════════════════════════════════
  // SECTION 3: Departments (Nested Cards with Sub-Array)
  // ═══════════════════════════════════════════════════════
  
  "departments": [
    {
      "name": "Example Department 1",
      "performance": 0,
      "budget": 0,
      "headcount": 0,
      "achievements": [                         // ← Array within object!
        "Example: Key accomplishment"
      ]
    }
  ],
  
  "_departments_type": "nestedCards",
  "_departments_fields": {
    "name": {
      "type": "text",
      "label": "Department Name"
    },
    "performance": {
      "type": "number",
      "label": "Performance Score"
    },
    "budget": {
      "type": "number",
      "label": "Budget"
    },
    "headcount": {
      "type": "number",
      "label": "Headcount"
    },
    "achievements": {                           // ← Nested list!
      "type": "list",
      "label": "Achievements"
    }
  },
  "_enabled_departments": true,
  "_completed_departments": false,
  
  // ═══════════════════════════════════════════════════════
  // SECTION 4: Outlook (Simple Textarea)
  // ═══════════════════════════════════════════════════════
  
  "outlook": "Example: Provide a brief 2-3 sentence overview of the week ahead.",
  "_outlook_type": "textarea",
  "_enabled_outlook": true,
  "_completed_outlook": false,
  
  // ═══════════════════════════════════════════════════════
  // GLOBAL METADATA
  // ═══════════════════════════════════════════════════════
  
  "status": "draft",                            // draft | published
  "protectionEnabled": false,                   // Prevent incomplete publish?
  
  "_template_name": "Executive Summary Template V2",
  "_template_description": "Comprehensive executive summary template",
  "_template_created": "2025-11-08T07:30:00.000Z",
  "_template_updated": "2025-11-08T07:30:00.000Z"
}
```

**Metadata Naming Convention:**

| Pattern | Purpose | Example |
|---------|---------|---------|
| `_<section>_type` | Render type from Asset Registry | `_highlights_type: "listNoTitle"` |
| `_<section>_fields` | Schema for nested objects/cards | `_departments_fields: { name: {...} }` |
| `_enabled_<section>` | Section enabled in CMS? | `_enabled_highlights: true` |
| `_completed_<section>` | Section marked complete? | `_completed_highlights: false` |
| `_locked_<section>` | Section locked from editing? | `_locked_highlights: false` |
| `_template_*` | Template-level metadata | `_template_name: "..."` |

**Critical Rules:**

1. ✅ **Every content section MUST have** `_<section>_type`
2. ✅ **NestedCards MUST have** `_<section>_fields` defining card structure
3. ✅ **Simple types** (text, textarea, number) only need `_<section>_type`
4. ✅ **Arrays/Lists** can have example data in the actual data field

---

## Data Flow: Template Builder → EditorModal → Frontend

### Step-by-Step Journey of a Template

#### 1️⃣ **Template Builder Creates JSON**

**User Actions:**
- Drags "Card List" asset into a new section
- Names section "Key Metrics"
- Configures card fields: label, value, unit
- Adds example data

**Builder Generates:**

```json
{
  "keyMetrics": [
    { "label": "Revenue", "value": "0", "unit": "$" }
  ],
  "_keyMetrics_type": "nestedCards",
  "_keyMetrics_fields": {
    "label": { "type": "text", "label": "Metric Name" },
    "value": { "type": "text", "label": "Value" },
    "unit": { "type": "text", "label": "Unit" }
  },
  "_enabled_keyMetrics": true,
  "_completed_keyMetrics": false
}
```

**Saved To:** `backend/uploads/templates/my-template.json`

---

#### 2️⃣ **User Creates New Summary from Template**

**CMS Admin UI:**
- User clicks "New Summary" button
- Modal appears with template options
- Selects template → Template Builder or API loads template JSON
- Creates new summary with auto-generated ID

**Process:**

```typescript
// Load template
const templateData = await fetch('/api/templates/my-template').then(r => r.json());

// Generate new ID
const newId = `week-${sanitize(userInputName)}-${formatDate(new Date())}`;

// Clone template with new ID
const newSummary = {
  ...templateData,
  id: newId,
  quarter: currentQuarter,
  year: currentYear,
  date: currentDate,
  title: userInputName,
  status: 'draft'
};

// Save new summary
await fetch('/api/summaries', {
  method: 'POST',
  body: JSON.stringify(newSummary)
});
```

---

#### 3️⃣ **EditorModalV2 Loads Summary**

**Location:** `cms-admin/src/components/EditorModalV2.tsx`

**Process:**

```typescript
// 1. Load summary data
const [editedData, setEditedData] = useState(summaryData);

// 2. Discover sections dynamically
const getSections = () => {
  const sections = [];
  
  // Always add standard header first
  sections.push({
    id: 'standard_header',
    title: 'Standard Header',
    enabled: true,
    completed: editedData._completed_standard_header === true
  });
  
  // Find all content sections
  Object.keys(editedData)
    .filter(key => {
      // Exclude metadata keys
      if (['id', 'quarter', 'year', 'date', 'title', 'status'].includes(key)) return false;
      // Exclude underscore-prefixed metadata
      if (key.startsWith('_')) return false;
      return true;
    })
    .forEach(key => {
      sections.push({
        id: key,
        title: formatSectionTitle(key),
        enabled: editedData[`_enabled_${key}`] !== false,
        completed: editedData[`_completed_${key}`] === true,
        content: editedData[key]
      });
    });
  
  return sections;
};

// 3. Render each section using RenderFactory
const renderSchemaSection = (sectionId: string) => {
  const sectionData = editedData[sectionId];
  const sectionType = editedData[`_${sectionId}_type`];      // ← Read metadata
  const customFields = editedData[`_${sectionId}_fields`];   // ← Read field schema
  
  if (!sectionType) {
    return <div>No schema defined for "{sectionId}"</div>;
  }
  
  // Build schema from Asset Registry + custom fields
  const baseSchema = buildFieldSchema(sectionType, customFields ? { fields: customFields } : {});
  
  const factorySchema = {
    label: formatSectionTitle(sectionId),
    renderAs: sectionType,                   // ← "nestedCards", "listNoTitle", etc.
    ...baseSchema
  };
  
  // Render using RenderFactory
  return (
    <RenderFactory
      fieldKey={sectionId}
      schema={factorySchema}
      value={sectionData}                    // ← Actual data
      onChange={(newValue) => {
        setEditedData(prev => ({
          ...prev,
          [sectionId]: newValue
        }));
        setIsDirty(true);
      }}
      mode="edit"                            // ← Edit mode for CMS
    />
  );
};
```

**Key Functions:**

| Function | Purpose |
|----------|---------|
| `getSections()` | Dynamically discovers all sections from JSON |
| `renderSchemaSection(sectionId)` | Renders a section using RenderFactory |
| `buildFieldSchema(type, fields)` | Builds complete schema from Asset Registry |
| `formatSectionTitle(key)` | Converts camelCase to Title Case |

---

#### 4️⃣ **RenderFactory Routes to Correct Renderer**

**Location:** `src/renderers/RenderFactory.tsx`

```typescript
export const RenderFactory: React.FC<RendererProps> = (props) => {
  const { schema } = props;

  switch (schema.renderAs) {
    case 'text':
      return <TextRenderer {...props} />;
    
    case 'textarea':
      return <TextareaRenderer {...props} />;
    
    case 'number':
      return <NumberRenderer {...props} />;
    
    case 'list':
    case 'listNoTitle':
      return <ListRenderer {...props} />;
    
    case 'nestedCards':
      return <NestedCardsRenderer {...props} />;
    
    case 'metricCards':
      return <MetricCardsRenderer {...props} />;
    
    default:
      return <div>Unknown renderer: {schema.renderAs}</div>;
  }
};
```

---

#### 5️⃣ **Renderer Displays in Edit Mode**

**Example: NestedCardsRenderer**

**Location:** `src/renderers/NestedCardsRenderer.tsx`

```typescript
export const NestedCardsRenderer: React.FC<RendererProps> = ({
  fieldKey,
  schema,
  value,
  onChange,
  mode,
  disabled
}) => {
  const cards = Array.isArray(value) ? value : [];

  if (mode === 'edit') {
    return (
      <div className="space-y-3">
        <label className={getClasses.label()}>
          {schema.label}
        </label>
        
        {/* Render each card */}
        {cards.map((card, index) => (
          <div key={index} className={getClasses.card()}>
            {/* Render each field in the card */}
            {schema.fields && Object.entries(schema.fields).map(([fieldKey, fieldSchema]) => (
              <div key={fieldKey}>
                <label className={getClasses.label()}>
                  {fieldSchema.label}
                </label>
                <input
                  type={fieldSchema.type === 'number' ? 'number' : 'text'}
                  value={card[fieldKey] || ''}
                  onChange={(e) => {
                    const newCards = [...cards];
                    newCards[index] = {
                      ...newCards[index],
                      [fieldKey]: e.target.value
                    };
                    onChange(newCards);
                  }}
                  className={getClasses.input()}
                />
              </div>
            ))}
            
            {/* Delete button */}
            <button onClick={() => {
              const newCards = cards.filter((_, i) => i !== index);
              onChange(newCards);
            }}>
              Delete Card
            </button>
          </div>
        ))}
        
        {/* Add new card button */}
        <button onClick={() => {
          const emptyCard = {};
          if (schema.fields) {
            Object.keys(schema.fields).forEach(key => {
              emptyCard[key] = '';
            });
          }
          onChange([...cards, emptyCard]);
        }}>
          Add Card
        </button>
      </div>
    );
  }
  
  // Display mode (frontend)
  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div key={index} className={getClasses.card()}>
          {/* Render card fields in display mode */}
        </div>
      ))}
    </div>
  );
};
```

---

#### 6️⃣ **User Edits Content**

**In EditorModalV2:**

1. User types in fields
2. `onChange` handler fires
3. `editedData` state updates
4. Re-render with new data
5. User clicks "Save Draft" or "Publish"
6. Data sent to backend API
7. JSON file updated

---

#### 7️⃣ **Frontend Displays Content**

**Location:** `src/components/SummaryDetail.tsx` (or similar)

**Process:**

```typescript
import { timelineItems } from '../data/timeline-loader';

// Load summary
const summary = timelineItems.find(item => item.id === 'week-oct-31-2024');

// Render using same RenderFactory (display mode)
<RenderFactory
  fieldKey="keyMetrics"
  schema={{
    renderAs: summary._keyMetrics_type,
    fields: summary._keyMetrics_fields
  }}
  value={summary.keyMetrics}
  mode="display"  // ← Display mode for frontend
/>
```

**Key Difference:** Same renderer, different mode!

| Mode | Where | UI Style |
|------|-------|----------|
| `edit` | EditorModalV2 (CMS) | Forms, inputs, buttons |
| `display` | Frontend (public) | Cards, charts, formatted text |

---

## Component Breakdown

### Template Builder Components

#### 1. **Asset Library (Left Sidebar)**

```typescript
const ASSET_LIBRARY: AssetCategory[] = [
  {
    id: 'basic',
    name: 'Basic Inputs',
    icon: Type,
    color: 'blue',
    assets: [
      { id: 'text', name: 'Text Input', renderType: 'text', ... },
      { id: 'textarea', name: 'Text Area', renderType: 'textarea', ... },
      // ... more
    ]
  },
  // ... more categories
];
```

**Features:**
- Categorized assets (Basic, Lists, Complex, Rich)
- Drag source for adding fields to sections
- Visual preview of each asset type

#### 2. **Canvas (Center)**

```typescript
const [sections, setSections] = useState<TemplateSection[]>([...]);

// Always starts with Standard Header
{
  id: 'section-header',
  name: 'Standard Header',
  expanded: false,
  fields: [
    { id: 'field-id', key: 'id', label: 'ID', renderType: 'text', ... },
    { id: 'field-quarter', key: 'quarter', label: 'Quarter', ... },
    // ... more header fields
  ]
}
```

**Features:**
- Drop zones for assets
- Section expand/collapse
- Field reordering (drag-and-drop)
- Add/remove sections
- Visual feedback during drag

#### 3. **Properties Inspector (Right Sidebar)**

```typescript
const [selectedField, setSelectedField] = useState<{
  sectionId: string;
  fieldId: string;
} | null>(null);

// When field selected
const field = sections
  .find(s => s.id === selectedField.sectionId)
  ?.fields.find(f => f.id === selectedField.fieldId);
```

**Editable Properties:**
- Field Key (JSON property name)
- Label (display name)
- Render Type (read-only, from asset)
- Example Data (for lists/cards)
- Schema Properties (advanced, JSON view)

**Special: Example Data Editor**

For **lists**:
```typescript
{
  exampleData: [
    "Item 1",
    "Item 2",
    "Item 3"
  ]
}
```

For **nestedCards**:
```typescript
{
  exampleData: [
    { label: "Revenue", value: "0", unit: "$" },
    { label: "Growth", value: "0", unit: "%" }
  ]
}
```

#### 4. **Validation System**

**6 Validation Checks:**

```typescript
const validateTemplate = () => {
  const results = [];

  // 1. Has standard header section
  const hasHeader = sections.some(s => s.id === 'section-header');
  results.push({
    check: 'Standard Header',
    passed: hasHeader,
    message: hasHeader ? '✓ Present' : '✗ Missing'
  });

  // 2. Header has required fields (id, quarter, year, date, title)
  const requiredFields = ['id', 'quarter', 'year', 'date', 'title'];
  const headerFields = headerSection?.fields.map(f => f.key) || [];
  const hasAllFields = requiredFields.every(f => headerFields.includes(f));
  
  // 3. Has at least one content section
  const contentSections = sections.filter(s => s.id !== 'section-header');
  const hasContent = contentSections.length > 0;
  
  // 4. All sections have fields
  const noEmptySections = sections.every(s => s.fields.length > 0);
  
  // 5. All field keys are unique
  const allKeys = sections.flatMap(s => s.fields.map(f => f.key));
  const uniqueKeys = new Set(allKeys);
  const allUnique = allKeys.length === uniqueKeys.size;
  
  // 6. All fields have valid schemas
  const allValid = sections.every(s => 
    s.fields.every(f => f.schema && f.schema.type)
  );
  
  return results;
};
```

**Validation UI:**

```
┌─────────────────────────────────────────────┐
│ ⚠ Validation                                │
├─────────────────────────────────────────────┤
│ ✓ Standard Header                           │
│   Template includes required header         │
│                                             │
│ ✓ Required Header Fields                   │
│   All fields present                        │
│                                             │
│ ✗ Content Sections                          │
│   Template needs at least one section       │
│                                             │
│ ✓ Section Fields                            │
│   All sections contain fields               │
│                                             │
│ ✓ Unique Field Keys                         │
│   All field keys are unique                 │
│                                             │
│ ✓ Field Schemas                             │
│   All fields have valid schemas             │
└─────────────────────────────────────────────┘
```

---

## How Everything Connects

### The Complete Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. TEMPLATE BUILDER                                             │
│    User drags assets, configures fields                         │
│    ↓                                                             │
│    Generates JSON with metadata                                 │
│    {                                                             │
│      "highlights": ["Example"],                                 │
│      "_highlights_type": "listNoTitle",                         │
│      "_enabled_highlights": true                                │
│    }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. BACKEND API (Express.js)                                     │
│    POST /api/templates                                          │
│    Saves JSON to: backend/uploads/templates/                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. CMS ADMIN (Create New Summary)                               │
│    User clicks "New Summary"                                    │
│    Selects template → Clones JSON → Creates new summary         │
│    POST /api/summaries                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. EDITORMODALV2                                                │
│    GET /api/summaries/:id                                       │
│    Loads JSON → Discovers sections dynamically                  │
│    ↓                                                             │
│    getSections() reads:                                         │
│    • All non-metadata keys → sections                           │
│    • _enabled_* flags → section visibility                      │
│    • _completed_* flags → section status                        │
│    ↓                                                             │
│    renderSchemaSection(sectionId) reads:                        │
│    • _<section>_type → render type                              │
│    • _<section>_fields → field schema                           │
│    ↓                                                             │
│    buildFieldSchema() looks up in assetTypeRegistry            │
│    ↓                                                             │
│    RenderFactory routes to correct renderer                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. RENDERER (Edit Mode)                                         │
│    NestedCardsRenderer, ListRenderer, etc.                      │
│    • Reads schema.fields for structure                          │
│    • Renders form inputs                                        │
│    • Calls onChange when user edits                             │
│    • Updates editedData state                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. SAVE                                                          │
│    User clicks "Save Draft" or "Publish"                        │
│    PUT /api/summaries/:id                                       │
│    Updates JSON file                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. FRONTEND DISPLAY                                             │
│    import.meta.glob() auto-loads all JSON                       │
│    RenderFactory (Display Mode)                                 │
│    • Same renderer, different UI                                │
│    • Cards, charts, formatted text                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Creating New Templates

### Method 1: Using Template Builder

1. **Open Template Builder**
   ```
   CMS Admin → Template Builder button
   ```

2. **Build Template**
   - Standard Header is auto-included
   - Click "+ Add Section" for new sections
   - Drag assets from left sidebar into sections
   - Configure fields in right sidebar
   - Add example data for lists/cards

3. **Configure Properties**
   - Section name → becomes JSON key (camelCase)
   - Field key → property name in card objects
   - Field label → display name
   - Example data → preview/default values

4. **Validate & Save**
   - Click "Save Template"
   - Enter template name and description
   - System validates (6 checks)
   - If valid → saves to backend

### Method 2: Manual JSON Creation

**Use `summary-template-v2.json` as reference!**

```json
{
  // 1. Standard header (required)
  "id": "template-new",
  "quarter": "Month Day",
  "year": 2025,
  "date": "2025-01-01",
  "title": "Organization Name",
  
  // 2. For each content section:
  
  // Simple list
  "sectionName": ["item1", "item2"],
  "_sectionName_type": "listNoTitle",
  "_enabled_sectionName": true,
  "_completed_sectionName": false,
  
  // Nested cards
  "anotherSection": [
    {
      "field1": "value",
      "field2": 123
    }
  ],
  "_anotherSection_type": "nestedCards",
  "_anotherSection_fields": {
    "field1": { "type": "text", "label": "Field 1" },
    "field2": { "type": "number", "label": "Field 2" }
  },
  "_enabled_anotherSection": true,
  "_completed_anotherSection": false,
  
  // 3. Global metadata
  "status": "draft",
  "protectionEnabled": false
}
```

**Critical Checklist:**

- [ ] Standard header fields present (id, quarter, year, date, title)
- [ ] Every section has `_<section>_type`
- [ ] Nested cards have `_<section>_fields`
- [ ] All `_enabled_<section>` flags present
- [ ] All `_completed_<section>` flags present
- [ ] `status` set to "draft"
- [ ] Example data matches field structure

---

## Current Issues & Solutions

### Issue 1: Old Templates Not Properly Structured

**Problem:**
- Only `summary-template-v2.json` has proper metadata structure
- Old templates missing `_type`, `_fields`, etc.
- EditorModalV2 falls back to hardcoded `summarySchema`

**Solution:**

1. **Migrate existing templates:**
   ```bash
   # For each template:
   - Add _<section>_type for all sections
   - Add _<section>_fields for nestedCards
   - Add _enabled_<section> flags
   - Add _completed_<section> flags
   ```

2. **Create migration script:**
   ```typescript
   // scripts/migrate-templates.ts
   async function migrateTemplate(templatePath: string) {
     const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
     
     // Detect sections
     const sections = Object.keys(template).filter(/* ... */);
     
     // Add metadata
     sections.forEach(section => {
       // Infer type from data structure
       if (Array.isArray(template[section])) {
         if (typeof template[section][0] === 'string') {
           template[`_${section}_type`] = 'listNoTitle';
         } else {
           template[`_${section}_type`] = 'nestedCards';
           template[`_${section}_fields`] = inferFieldsFromData(template[section][0]);
         }
       } else if (typeof template[section] === 'string') {
         template[`_${section}_type`] = 'textarea';
       } else {
         template[`_${section}_type`] = 'number';
       }
       
       template[`_enabled_${section}`] = true;
       template[`_completed_${section}`] = false;
     });
     
     fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
   }
   ```

### Issue 2: Frontend Doesn't Use Render Engine Yet

**Problem:**
- Frontend components have hardcoded rendering
- Not reading `_type` metadata
- Missing dynamic rendering benefits

**Solution:**

Update frontend components to use RenderFactory:

```typescript
// OLD (Hardcoded)
<SummaryDetail>
  <div className="highlights">
    {summary.highlights.map(h => <li>{h}</li>)}
  </div>
  <div className="metrics">
    {summary.keyMetrics.map(m => <Card>{m}</Card>)}
  </div>
</SummaryDetail>

// NEW (Dynamic)
<SummaryDetail>
  {Object.keys(summary)
    .filter(key => summary[`_${key}_type`])
    .map(key => (
      <RenderFactory
        key={key}
        fieldKey={key}
        schema={{
          renderAs: summary[`_${key}_type`],
          fields: summary[`_${key}_fields`],
          label: formatTitle(key)
        }}
        value={summary[key]}
        mode="display"
      />
    ))
  }
</SummaryDetail>
```

### Issue 3: Asset Type Registry Incomplete

**Problem:**
- Missing some render types (markdown, expression, charts)
- Renderers not implemented for all types

**Solution:**

1. **Add missing asset types:**
   ```typescript
   // assetTypeRegistry.ts
   {
     type: 'richText',
     label: 'Rich Text Editor',
     description: 'WYSIWYG markdown editor',
     category: 'rich',
     defaultSchema: { ... }
   },
   {
     type: 'barChart',
     label: 'Bar Chart',
     description: 'Data visualization',
     category: 'charts',
     defaultSchema: { chartConfig: {...} }
   }
   ```

2. **Implement renderers:**
   ```typescript
   // RichTextRenderer.tsx
   export const RichTextRenderer: React.FC<RendererProps> = ({...}) => {
     if (mode === 'edit') {
       return <MarkdownEditor value={value} onChange={onChange} />;
     }
     return <ReactMarkdown>{value}</ReactMarkdown>;
   };
   ```

### Issue 4: Template Versioning Not Implemented

**Problem:**
- No version control for templates
- Can't roll back changes
- No migration path for breaking changes

**Solution:**

1. **Add version field to templates:**
   ```json
   {
     "_template_version": "2.0",
     "_template_schema_version": "1.0"
   }
   ```

2. **Version compatibility checks:**
   ```typescript
   function loadTemplate(template: any) {
     const currentVersion = "2.0";
     if (template._template_version !== currentVersion) {
       template = migrateTemplate(template, currentVersion);
     }
     return template;
   }
   ```

---

## Best Practices

### For Template Builders

1. **Always start with Standard Header**
   - Required fields: id, quarter, year, date, title
   - Don't modify or remove

2. **Use descriptive field keys**
   ```typescript
   // Good
   keyMetrics, departmentPerformance, strategicInitiatives
   
   // Bad
   metrics, data, items
   ```

3. **Provide meaningful example data**
   ```json
   // Good
   "highlights": [
     "Example: Key achievement with specific metrics",
     "Example: Project milestone with timeline"
   ]
   
   // Bad
   "highlights": ["test", "example"]
   ```

4. **Group related fields**
   ```json
   // Good - grouped in nestedCards
   "departments": [
     {
       "name": "Sales",
       "performance": 85,
       "budget": 500000,
       "headcount": 12
     }
   ]
   
   // Bad - separate fields
   "departmentNames": ["Sales"],
   "departmentPerformance": [85],
   "departmentBudget": [500000]
   ```

### For Developers

1. **Never hardcode section names**
   ```typescript
   // Bad
   if (sectionId === 'highlights') { ... }
   
   // Good
   const sectionType = editedData[`_${sectionId}_type`];
   if (sectionType === 'listNoTitle') { ... }
   ```

2. **Always check for metadata first**
   ```typescript
   // Priority order:
   1. editedData._<section>_type (dynamic template)
   2. editedData._<section>_schema (legacy embedded)
   3. summarySchema.sections (fallback hardcoded)
   ```

3. **Use buildFieldSchema helper**
   ```typescript
   // Centralizes schema building logic
   const schema = buildFieldSchema(
     sectionType,
     customFields ? { fields: customFields } : {}
   );
   ```

4. **Test with `summary-template-v2.json`**
   - It's the reference implementation
   - All features working correctly
   - Use as template for new templates

---

## Debugging Guide

### Template Not Loading in EditorModal

**Check:**
1. Does JSON have `_<section>_type` for all sections?
2. Are `_enabled_<section>` flags set correctly?
3. Is JSON valid (use jsonlint.com)?
4. Check console for errors

### Renderer Not Displaying Correctly

**Check:**
1. Is `renderAs` value valid in RenderFactory switch?
2. Does renderer exist in `src/renderers/`?
3. For nestedCards: are `fields` defined in schema?
4. Check `mode` prop (edit vs display)

### Fields Not Editable

**Check:**
1. Is section locked? (`_locked_<section>` or `_completed_<section>`)
2. Is `onChange` handler wired correctly?
3. Is `disabled` prop set?

### Template Builder Save Fails

**Check:**
1. Run validation - which check fails?
2. Are all sections non-empty?
3. Are field keys unique?
4. Is backend API running?

---

## Summary: The Big Picture

The Template Builder system is a **meta-programming interface** - it creates the instructions (JSON metadata) that tell the rendering engine HOW to build UIs dynamically.

**Key Concepts:**

1. **Assets** = UI building blocks (defined in Asset Type Registry)
2. **Templates** = JSON files with data + metadata
3. **Metadata** = Instructions for rendering (\_type, \_fields)
4. **RenderFactory** = Router that picks the right renderer
5. **Renderers** = Dual-mode components (edit + display)
6. **EditorModal** = Dynamically discovers and renders sections

**The Magic:** Change one JSON file → entire CMS + Frontend updates automatically!

**Current State:**
- ✅ Template Builder operational
- ✅ EditorModalV2 reads dynamic schemas
- ✅ RenderFactory routes correctly
- ✅ 7 renderers working (text, textarea, number, list, nestedCards, metricCards, objectForm)
- ⚠️ Only `summary-template-v2.json` properly structured
- ⚠️ Frontend still using hardcoded components (needs migration)
- ⚠️ Asset Registry missing some types (charts, richText)

**Next Steps:**
1. Migrate all templates to v2 structure
2. Update frontend to use RenderFactory
3. Implement missing renderers
4. Add template versioning
5. Build template import/export tools

---

**Questions? Check:**
- `COMPLETE_ENGINE_ARCHITECTURE.md` - Overall system design
- `TEMPLATE_SYSTEM.md` - Template creation workflow
- `summary-template-v2.json` - Reference implementation
- Asset Type Registry - Available building blocks
- RenderFactory - Renderer routing logic

