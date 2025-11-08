# Template Builder - Roadmap & Enhancements

> **Last Updated:** November 8, 2025  
> **Status:** Active Development - Feature Planning Phase

---

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Outstanding Work](#outstanding-work)
3. [Enhancement 1: Chart Assets](#enhancement-1-chart-assets)
4. [Enhancement 2: Multi-Column Layout System](#enhancement-2-multi-column-layout-system)
5. [Implementation Plan](#implementation-plan)
6. [Technical Specifications](#technical-specifications)

---

## Current State Assessment

### ✅ What We Have Built

#### Core Infrastructure
- ✅ **Asset Type Registry** - Defines 11 asset types across 4 categories
- ✅ **Template Builder UI** - Drag-and-drop interface with 3-panel layout
- ✅ **EditorModalV2** - Dynamic schema-driven rendering for CMS
- ✅ **RenderFactory** - Routes to appropriate renderer based on schema
- ✅ **7 Working Renderers** - Text, Textarea, Number, List, NestedCards, MetricCards, ObjectForm
- ✅ **Validation System** - 6-check validation before template save
- ✅ **Example Data System** - Preview/default data for lists and cards
- ✅ **Backend API** - Template CRUD operations via Express.js

#### Asset Types Available

| Category | Asset Type | Status | Multi-Column Support |
|----------|-----------|--------|---------------------|
| **basic** | text | ✅ Working | ❌ No |
| | textarea | ✅ Working | ❌ No |
| | number | ✅ Working | ✅ Yes (possible) |
| | date | 🟡 Defined, no renderer | ✅ Yes (possible) |
| **lists** | list | ✅ Working | ❌ No |
| | listNoTitle | ✅ Working | ❌ No |
| | nestedCards | ✅ Working | ✅ Yes |
| **complex** | object | ✅ Working | ✅ Yes (possible) |
| | keyValue | 🟡 Defined, no renderer | ✅ Yes (possible) |
| **rich** | markdown | 🟡 Defined, no renderer | ❌ No |
| | expression | 🟡 Defined, no renderer | ❌ No |

#### Template Structure
- ✅ **Metadata Pattern** - `_<section>_type`, `_<section>_fields`, `_enabled_`, `_completed_`
- ✅ **Standard Header** - Always required (id, quarter, year, date, title)
- ✅ **Dynamic Section Discovery** - EditorModal discovers sections from JSON
- ✅ **Reference Template** - `summary-template-v2.json` properly structured

---

## Outstanding Work

### 🟡 High Priority (Core Functionality)

#### 1. **Chart Renderers (NEW - Your Request)**
- [ ] Add chart asset types to Asset Type Registry
- [ ] Implement PieChartRenderer
- [ ] Implement BarChartRenderer
- [ ] Implement LineChartRenderer
- [ ] Implement RadialChartRenderer (donut chart)
- [ ] Add chart configuration UI in Template Builder
- [ ] Support dynamic data binding for charts

#### 2. **Multi-Column Layout System (NEW - Your Request)**
- [ ] Add Section/SubSection hierarchy
- [ ] Implement asset slots (1-3 per section)
- [ ] Add layout framing (33%/45%/30% widths)
- [ ] Add `multiColumnSupported` flag to assets
- [ ] Validation for asset placement rules
- [ ] Visual layout preview in Template Builder
- [ ] CSS Grid/Flexbox rendering for layouts

#### 3. **Missing Renderers**
- [ ] DateRenderer - Date picker with calendar UI
- [ ] KeyValueRenderer - Simple key-value pairs
- [ ] MarkdownRenderer - WYSIWYG markdown editor
- [ ] ExpressionRenderer - Expression syntax editor with preview

#### 4. **Template Migration**
- [ ] Migrate old templates to v2 structure
- [ ] Create migration script for bulk updates
- [ ] Add `_template_version` field
- [ ] Backwards compatibility layer

#### 5. **Frontend Integration**
- [ ] Update SummaryDetail to use RenderFactory (display mode)
- [ ] Update Dashboard to use RenderFactory
- [ ] Update OrganizationModal to use RenderFactory
- [ ] Remove hardcoded rendering logic

### 🟢 Medium Priority (Enhancements)

#### 6. **Template Builder UX**
- [ ] Template preview mode (live preview as you build)
- [ ] Template import/export (JSON file upload/download)
- [ ] Template duplication (clone existing template)
- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts
- [ ] Field search/filter

#### 7. **Validation Enhancements**
- [ ] Real-time validation during build
- [ ] Warning vs Error severity levels
- [ ] Suggested fixes for common issues
- [ ] Data type validation (ensure numbers are numbers, etc.)

#### 8. **Asset Library Expansion**
- [ ] Color picker asset
- [ ] Image upload asset
- [ ] File attachment asset
- [ ] Dropdown/Select asset with options
- [ ] Multi-select asset
- [ ] Toggle/Switch asset
- [ ] Slider/Range asset

### 🔵 Low Priority (Nice to Have)

#### 9. **Advanced Features**
- [ ] Conditional field visibility (show field if another field has value)
- [ ] Calculated fields (auto-compute based on other fields)
- [ ] Field validation rules in Template Builder
- [ ] Custom field types (user-defined assets)
- [ ] Template versioning and history
- [ ] Template sharing/marketplace

#### 10. **Developer Experience**
- [ ] TypeScript type generation from templates
- [ ] Schema documentation generator
- [ ] Template testing framework
- [ ] Visual regression testing for renderers

---

## Enhancement 1: Chart Assets

### Overview

Add 4 chart types as new assets with Recharts integration.

### Asset Type Definitions

```typescript
// Add to assetTypeRegistry.ts

{
  type: 'pieChart',
  label: 'Pie Chart',
  description: 'Circular chart showing proportions',
  category: 'charts',
  multiColumnSupported: true,  // ← NEW PROPERTY
  defaultSchema: {
    type: 'pieChart',
    renderAs: 'pieChart',
    required: false,
    chartConfig: {
      dataKey: 'value',
      nameKey: 'name',
      colors: ['#6B1B5E', '#B21A53', '#3B82F6', '#10B981', '#F59E0B'],
      showLegend: true,
      showTooltip: true,
      innerRadius: 0,      // 0 = pie, >0 = donut
      outerRadius: 80
    }
  }
},
{
  type: 'barChart',
  label: 'Bar Chart',
  description: 'Vertical or horizontal bar chart',
  category: 'charts',
  multiColumnSupported: true,
  defaultSchema: {
    type: 'barChart',
    renderAs: 'barChart',
    required: false,
    chartConfig: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      bars: [
        { dataKey: 'value', fill: '#6B1B5E', name: 'Value' }
      ],
      orientation: 'vertical',  // vertical | horizontal
      showGrid: true,
      showLegend: true,
      stacked: false
    }
  }
},
{
  type: 'lineChart',
  label: 'Line Chart',
  description: 'Line graph for trends over time',
  category: 'charts',
  multiColumnSupported: true,
  defaultSchema: {
    type: 'lineChart',
    renderAs: 'lineChart',
    required: false,
    chartConfig: {
      xAxisKey: 'month',
      lines: [
        { dataKey: 'value', stroke: '#6B1B5E', name: 'Trend' }
      ],
      showGrid: true,
      showLegend: true,
      showDots: true,
      curved: true
    }
  }
},
{
  type: 'radialChart',
  label: 'Radial Chart',
  description: 'Circular progress/donut chart',
  category: 'charts',
  multiColumnSupported: true,
  defaultSchema: {
    type: 'radialChart',
    renderAs: 'radialChart',
    required: false,
    chartConfig: {
      dataKey: 'value',
      maxValue: 100,
      colors: ['#6B1B5E', '#B21A53'],
      showPercentage: true,
      thickness: 20
    }
  }
}
```

### Data Structure for Charts

```json
{
  "revenueChart": [
    { "month": "Jan", "revenue": 45000, "expenses": 32000 },
    { "month": "Feb", "revenue": 52000, "expenses": 35000 },
    { "month": "Mar", "revenue": 48000, "expenses": 31000 }
  ],
  "_revenueChart_type": "lineChart",
  "_revenueChart_fields": {
    "month": { "type": "text", "label": "Month" },
    "revenue": { "type": "number", "label": "Revenue" },
    "expenses": { "type": "number", "label": "Expenses" }
  },
  "_revenueChart_chartConfig": {
    "xAxisKey": "month",
    "lines": [
      { "dataKey": "revenue", "stroke": "#10B981", "name": "Revenue" },
      { "dataKey": "expenses", "stroke": "#EF4444", "name": "Expenses" }
    ],
    "showGrid": true,
    "showLegend": true
  },
  "_enabled_revenueChart": true,
  "_completed_revenueChart": false
}
```

### Chart Renderer Example

```typescript
// src/renderers/LineChartRenderer.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RendererProps } from '../types/schema';
import { getClasses } from '../design-system';

export const LineChartRenderer: React.FC<RendererProps> = ({
  fieldKey,
  schema,
  value,
  onChange,
  mode,
  disabled
}) => {
  const data = Array.isArray(value) ? value : [];
  const config = schema.chartConfig || {};

  if (mode === 'edit') {
    // Edit Mode: Table editor for data points
    return (
      <div className="space-y-4">
        <label className={getClasses.label()}>{schema.label}</label>
        
        {/* Data Points Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                {schema.fields && Object.entries(schema.fields).map(([key, field]: [string, any]) => (
                  <th key={key} className="px-4 py-2 text-left text-xs font-roobert-semibold">
                    {field.label}
                  </th>
                ))}
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b dark:border-gray-700">
                  {schema.fields && Object.entries(schema.fields).map(([key, field]: [string, any]) => (
                    <td key={key} className="px-4 py-2">
                      <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={row[key] || ''}
                        onChange={(e) => {
                          const newData = [...data];
                          newData[rowIndex] = {
                            ...newData[rowIndex],
                            [key]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                          };
                          onChange?.(newData);
                        }}
                        className={getClasses.input()}
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <button
                      onClick={() => {
                        const newData = data.filter((_, i) => i !== rowIndex);
                        onChange?.(newData);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <button
          onClick={() => {
            const emptyRow: any = {};
            if (schema.fields) {
              Object.keys(schema.fields).forEach(key => {
                emptyRow[key] = schema.fields![key].type === 'number' ? 0 : '';
              });
            }
            onChange?.([...data, emptyRow]);
          }}
          className={getClasses.buttonSecondary()}
        >
          + Add Data Point
        </button>

        {/* Chart Preview */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxisKey || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.lines?.map((line: any, index: number) => (
                <Line
                  key={index}
                  type={config.curved ? 'monotone' : 'linear'}
                  dataKey={line.dataKey}
                  stroke={line.stroke}
                  name={line.name}
                  dot={config.showDots}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Display Mode: Full chart
  return (
    <div className="space-y-2">
      {schema.label && (
        <h3 className={getClasses.h2()}>{schema.label}</h3>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={config.xAxisKey || 'name'} />
          <YAxis />
          <Tooltip />
          {config.showLegend && <Legend />}
          {config.lines?.map((line: any, index: number) => (
            <Line
              key={index}
              type={config.curved ? 'monotone' : 'linear'}
              dataKey={line.dataKey}
              stroke={line.stroke}
              name={line.name}
              dot={config.showDots}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

---

## Enhancement 2: Multi-Column Layout System

### Overview

Your proposed system is **excellent**! It provides:
- ✅ Flexible layouts (1-column, 2-column, 3-column)
- ✅ Automatic width calculation
- ✅ Nested structure (Sections → SubSections)
- ✅ Validation rules for asset placement

### Conceptual Model

```
Section (Container)
├── Assets (1-3 max)
│   ├── Asset 1 (100% if alone, 45% if 2, 30% if 3)
│   ├── Asset 2 (45% or 30%)
│   └── Asset 3 (30%)
└── SubSections (unlimited)
    ├── SubSection 1
    │   ├── Assets (1-3 max)
    │   └── SubSections (recursive)
    └── SubSection 2
        └── Assets (1-3 max)
```

### Enhanced Data Structure

```typescript
interface TemplateSection {
  id: string;
  name: string;
  expanded: boolean;
  assets: TemplateAsset[];      // ← NEW: 1-3 assets per section
  subSections: TemplateSection[]; // ← NEW: Nested subsections
}

interface TemplateAsset {
  id: string;
  key: string;
  label: string;
  renderType: string;
  schema: FieldSchema;
  exampleData?: any;
  position: number;              // ← NEW: 0, 1, or 2 (for 3-column max)
}

// Add to AssetTypeDefinition
interface AssetTypeDefinition {
  type: string;
  label: string;
  description: string;
  category: 'basic' | 'lists' | 'complex' | 'rich' | 'charts';
  multiColumnSupported: boolean; // ← NEW PROPERTY
  defaultSchema: any;
}
```

### Layout Calculation

```typescript
const getAssetWidth = (assetCount: number, position: number): string => {
  const layouts = {
    1: ['100%'],                                    // 1 asset: full width
    2: ['calc(47.5% - 10px)', 'calc(47.5% - 10px)'], // 2 assets: 45% each + 10% padding
    3: ['calc(31.67% - 10px)', 'calc(31.67% - 10px)', 'calc(31.67% - 10px)'] // 3 assets: ~30% each
  };
  
  return layouts[assetCount as 1 | 2 | 3]?.[position] || '100%';
};
```

### JSON Structure for Layouts

```json
{
  // Standard header (unchanged)
  "id": "template-layout-demo",
  "quarter": "Nov 8",
  "year": 2025,
  "date": "2025-11-08",
  "title": "Multi-Column Layout Demo",
  
  // ═══════════════════════════════════════════════════════
  // SECTION WITH LAYOUT
  // ═══════════════════════════════════════════════════════
  
  // Section metadata
  "_section_dashboard": {
    "layout": "multi-column",
    "assetCount": 3,
    "subSections": ["dashboard_subsection_1"]
  },
  
  // Asset 1 in section (position 0)
  "dashboard_revenue": 1250000,
  "_dashboard_revenue_type": "number",
  "_dashboard_revenue_position": 0,
  "_dashboard_revenue_layoutSlot": "dashboard",
  
  // Asset 2 in section (position 1)
  "dashboard_growth": 48,
  "_dashboard_growth_type": "number",
  "_dashboard_growth_position": 1,
  "_dashboard_growth_layoutSlot": "dashboard",
  
  // Asset 3 in section (position 2)
  "dashboard_customers": 263,
  "_dashboard_customers_type": "number",
  "_dashboard_customers_position": 2,
  "_dashboard_customers_layoutSlot": "dashboard",
  
  // ═══════════════════════════════════════════════════════
  // SUBSECTION (nested under dashboard)
  // ═══════════════════════════════════════════════════════
  
  "_section_dashboard_subsection_1": {
    "parentSection": "dashboard",
    "layout": "multi-column",
    "assetCount": 2
  },
  
  "dashboard_sub_chart1": [...],
  "_dashboard_sub_chart1_type": "lineChart",
  "_dashboard_sub_chart1_position": 0,
  "_dashboard_sub_chart1_layoutSlot": "dashboard_subsection_1",
  
  "dashboard_sub_chart2": [...],
  "_dashboard_sub_chart2_type": "barChart",
  "_dashboard_sub_chart2_position": 1,
  "_dashboard_sub_chart2_layoutSlot": "dashboard_subsection_1"
}
```

### Template Builder UI Changes

#### New Button: "Add SubSection"

```tsx
// In Template Builder canvas
<div className="space-y-4">
  {/* Existing Add Section Button */}
  <button onClick={addSection} className="...">
    <Plus className="w-5 h-5" />
    Add Section
  </button>

  {/* Section with assets and subsections */}
  {sections.map(section => (
    <div key={section.id} className="...">
      {/* Section Header */}
      <div className="section-header">
        <h3>{section.name}</h3>
        <button onClick={() => addSubSection(section.id)}>
          <Plus className="w-4 h-4" />
          Add SubSection
        </button>
      </div>

      {/* Asset Slots (1-3 max) */}
      <div className="flex gap-4">
        {[0, 1, 2].map(slotIndex => (
          <div
            key={slotIndex}
            className={`asset-slot ${
              slotIndex < section.assets.length ? 'occupied' : 'empty'
            }`}
            style={{
              width: getAssetWidth(section.assets.length, slotIndex),
              display: slotIndex >= 3 ? 'none' : 'block'
            }}
            onDrop={(e) => handleAssetDrop(e, section.id, slotIndex)}
            onDragOver={handleDragOver}
          >
            {section.assets[slotIndex] ? (
              <AssetCard asset={section.assets[slotIndex]} />
            ) : (
              <div className="drop-zone">
                Drop asset here
                <span className="slot-info">
                  Slot {slotIndex + 1} of 3
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SubSections (nested) */}
      {section.subSections.map(subSection => (
        <SubSectionRenderer key={subSection.id} subSection={subSection} />
      ))}
    </div>
  ))}
</div>
```

#### Validation Rules

```typescript
const validateAssetDrop = (
  asset: AssetItem,
  section: TemplateSection,
  slotIndex: number
): { valid: boolean; message?: string } => {
  
  // Rule 1: Max 3 assets per section
  if (section.assets.length >= 3 && slotIndex >= section.assets.length) {
    return {
      valid: false,
      message: 'This section already has 3 assets (maximum reached)'
    };
  }
  
  // Rule 2: Check if asset supports multi-column
  const assetDef = getAssetType(asset.renderType);
  if (!assetDef?.multiColumnSupported && section.assets.length > 0) {
    return {
      valid: false,
      message: `"${asset.name}" doesn't support multi-column layouts`
    };
  }
  
  // Rule 3: Check if existing assets support multi-column
  if (section.assets.length > 0) {
    const existingAsset = section.assets[0];
    const existingDef = getAssetType(existingAsset.renderType);
    if (!existingDef?.multiColumnSupported) {
      return {
        valid: false,
        message: `Existing asset "${existingAsset.label}" doesn't support multi-column layouts`
      };
    }
  }
  
  return { valid: true };
};
```

### CSS Layout Rendering

```typescript
// EditorModalV2 rendering
const renderLayoutSection = (sectionId: string) => {
  const sectionMeta = editedData[`_section_${sectionId}`];
  const assetKeys = Object.keys(editedData)
    .filter(key => editedData[`_${key}_layoutSlot`] === sectionId)
    .sort((a, b) => {
      const posA = editedData[`_${a}_position`] || 0;
      const posB = editedData[`_${b}_position`] || 0;
      return posA - posB;
    });

  return (
    <div className="section-container">
      {/* Assets in flex row */}
      <div className="flex gap-4 mb-6">
        {assetKeys.map((assetKey, index) => {
          const assetType = editedData[`_${assetKey}_type`];
          const width = getAssetWidth(assetKeys.length, index);
          
          return (
            <div key={assetKey} style={{ width }}>
              <RenderFactory
                fieldKey={assetKey}
                schema={{
                  renderAs: assetType,
                  label: formatSectionTitle(assetKey),
                  ...buildFieldSchema(assetType, editedData[`_${assetKey}_fields`])
                }}
                value={editedData[assetKey]}
                onChange={(newValue) => {
                  setEditedData(prev => ({
                    ...prev,
                    [assetKey]: newValue
                  }));
                  setIsDirty(true);
                }}
                mode="edit"
              />
            </div>
          );
        })}
      </div>

      {/* SubSections (full width, stacked below) */}
      {sectionMeta?.subSections?.map((subSectionId: string) => (
        <div key={subSectionId} className="subsection-container ml-8 mt-4 border-l-4 border-fis-eggplant/20 pl-4">
          {renderLayoutSection(subSectionId)}
        </div>
      ))}
    </div>
  );
};
```

### Updated Asset Type Registry

```typescript
export const assetTypeRegistry: AssetTypeDefinition[] = [
  // Basic types
  {
    type: 'text',
    label: 'Text Field',
    description: 'Single line text input',
    category: 'basic',
    multiColumnSupported: true, // ✅ Can be side-by-side
    defaultSchema: { ... }
  },
  {
    type: 'number',
    label: 'Number',
    description: 'Numeric input',
    category: 'basic',
    multiColumnSupported: true, // ✅ Can be side-by-side
    defaultSchema: { ... }
  },
  
  // List types (typically full width)
  {
    type: 'list',
    label: 'Simple List',
    description: 'Array of text items',
    category: 'lists',
    multiColumnSupported: false, // ❌ Needs full width
    defaultSchema: { ... }
  },
  {
    type: 'nestedCards',
    label: 'Card List',
    description: 'Array of structured cards',
    category: 'lists',
    multiColumnSupported: true, // ✅ Cards can be in columns
    defaultSchema: { ... }
  },
  
  // Charts
  {
    type: 'pieChart',
    label: 'Pie Chart',
    description: 'Circular chart',
    category: 'charts',
    multiColumnSupported: true, // ✅ Charts can be side-by-side
    defaultSchema: { ... }
  },
  {
    type: 'barChart',
    label: 'Bar Chart',
    description: 'Bar chart',
    category: 'charts',
    multiColumnSupported: true, // ✅ Charts can be side-by-side
    defaultSchema: { ... }
  }
];
```

---

## Implementation Plan

### Phase 1: Chart Assets (Week 1)

**Day 1-2: Setup & Registry**
- [ ] Add 4 chart types to Asset Type Registry
- [ ] Add `multiColumnSupported` property to all existing assets
- [ ] Update TypeScript types for chart config

**Day 3-4: Renderers**
- [ ] Implement PieChartRenderer
- [ ] Implement BarChartRenderer
- [ ] Implement LineChartRenderer
- [ ] Implement RadialChartRenderer

**Day 5: Integration**
- [ ] Add charts to Template Builder asset library
- [ ] Test chart creation and editing
- [ ] Add example chart templates

### Phase 2: Multi-Column Layout (Week 2-3)

**Day 1-3: Data Structure**
- [ ] Update TemplateSection interface with assets array
- [ ] Add SubSection support (recursive structure)
- [ ] Update JSON metadata pattern for layouts
- [ ] Add `_section_<name>` metadata structure

**Day 4-5: Template Builder UI**
- [ ] Add "Add SubSection" button
- [ ] Implement asset slot drop zones (3 max)
- [ ] Visual layout preview (side-by-side assets)
- [ ] Drag-and-drop positioning

**Day 6-7: Validation**
- [ ] Implement asset drop validation
- [ ] Check `multiColumnSupported` flag
- [ ] Enforce 3-asset maximum
- [ ] Visual feedback for invalid drops

**Day 8-10: Rendering**
- [ ] EditorModalV2 layout section renderer
- [ ] CSS flexbox/grid implementation
- [ ] Width calculation based on asset count
- [ ] SubSection recursive rendering

**Day 11-12: Testing**
- [ ] Create test templates with layouts
- [ ] Test all combinations (1-col, 2-col, 3-col)
- [ ] Test nested subsections
- [ ] Validate JSON structure

### Phase 3: Polish & Documentation (Week 4)

**Day 1-2: UX Improvements**
- [ ] Layout visual guides (grid overlay)
- [ ] Asset reordering within section
- [ ] Copy/paste sections
- [ ] Template presets (common layouts)

**Day 3-4: Documentation**
- [ ] Update Template Builder docs
- [ ] Create layout examples
- [ ] Video tutorial (if needed)
- [ ] Best practices guide

**Day 5: Migration**
- [ ] Migrate existing templates to support layouts
- [ ] Backwards compatibility testing
- [ ] Update `summary-template-v2.json` with layout examples

---

## Technical Specifications

### Asset Configuration Properties

```typescript
interface AssetTypeDefinition {
  type: string;
  label: string;
  description: string;
  category: 'basic' | 'lists' | 'complex' | 'rich' | 'charts';
  
  // NEW: Layout support
  multiColumnSupported: boolean;
  preferredWidth?: 'full' | 'half' | 'third' | 'auto';
  minWidth?: number; // Minimum pixel width
  aspectRatio?: string; // For charts: '16:9', '4:3', '1:1'
  
  defaultSchema: any;
}
```

### Layout Metadata Pattern

```typescript
// Section with layout
interface LayoutSection {
  layout: 'single-column' | 'multi-column';
  assetCount: number;
  assets: string[];      // Array of asset keys in order
  subSections: string[]; // Array of subsection IDs
}

// In JSON
{
  "_section_<sectionId>": {
    "layout": "multi-column",
    "assetCount": 3,
    "assets": ["revenue", "growth", "customers"],
    "subSections": ["section_charts"]
  }
}
```

### Responsive Breakpoints

```typescript
const getResponsiveWidth = (
  assetCount: number,
  position: number,
  screenSize: 'mobile' | 'tablet' | 'desktop'
): string => {
  
  if (screenSize === 'mobile') {
    return '100%'; // Stack on mobile
  }
  
  if (screenSize === 'tablet') {
    // 2 columns max on tablet
    if (assetCount >= 2) {
      return 'calc(50% - 10px)';
    }
    return '100%';
  }
  
  // Desktop: Full layout
  return getAssetWidth(assetCount, position);
};
```

### Visual Feedback System

```typescript
// Template Builder drop zone states
const dropZoneStates = {
  idle: 'border-dashed border-gray-300',
  dragOver: 'border-solid border-fis-raspberry bg-fis-raspberry/10',
  invalid: 'border-solid border-red-500 bg-red-50',
  occupied: 'border-solid border-green-500 bg-green-50'
};

// Show validation message on hover
<div className="drop-zone-tooltip">
  {validation.message || 'Drop asset here'}
</div>
```

---

## Summary: Your Proposed System

### ✅ Strengths

1. **Simple Mental Model** - Section → Assets (1-3) → SubSections (recursive)
2. **Automatic Layout** - No manual width configuration needed
3. **Flexible** - Supports complex nested structures
4. **Validated** - Clear rules prevent user errors
5. **Extensible** - Easy to add 4-column or custom layouts later

### 🎯 Recommended Adjustments

#### 1. **Padding Calculation**
Your 10% padding is good, but I'd suggest fixed gap:

```css
/* Instead of percentage-based padding */
.flex { gap: 1rem; } /* 16px gap between assets */

/* Widths become */
1 asset:  100%
2 assets: calc(50% - 0.5rem) each
3 assets: calc(33.333% - 0.67rem) each
```

This ensures consistent spacing regardless of container width.

#### 2. **SubSection Visual Hierarchy**

Add visual nesting indicators:

```tsx
<div className="subsection indent-level-1 border-l-4 border-fis-eggplant/30 pl-6">
  {/* SubSection content */}
</div>
```

#### 3. **Asset Dragging Improvements**

Allow drag-to-reorder within section:

```tsx
// User can drag assets left/right to change position
onAssetDragStart(assetId, currentPosition);
onAssetDrop(newPosition);
// Automatically reorder and update positions
```

### 📋 Next Steps

1. **Approve approach** - Confirm the multi-column system design
2. **Prioritize charts vs layouts** - Which to implement first?
3. **Define chart data requirements** - What charts are most important?
4. **Test prototypes** - Build quick mockups to validate UX

---

## Questions for Consideration

1. **Should subsections support unlimited nesting?** Or limit to 2-3 levels deep?
2. **Do we need 4-column layouts?** Or is 3 the max?
3. **Custom widths?** (e.g., 1/3 + 2/3 instead of equal splits) or keep it simple?
4. **Mobile behavior?** Always stack to single column on small screens?
5. **Asset reordering?** Drag assets left/right to change position in row?

---

**This is an excellent enhancement that will make the Template Builder incredibly powerful!** 🚀

The system you proposed is clean, intuitive, and scalable. Let me know which phase you'd like to start with, and I can begin implementation!

