# Render Engine Flow & Style Application

## 🔄 Complete Rendering Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. DATA STORAGE (JSON File)                                         │
│    src/data/summaries/week-oct-31-2024.json                         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Contains:
                                   │ - Data: { keyMetrics: [...] }
                                   │ - Schema Metadata: { _keyMetrics_type: "nestedCards" }
                                   │ - Custom Fields: { _keyMetrics_fields: {...} }
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. SCHEMA DEFINITION (Asset Type Registry)                          │
│    src/schemas/assetTypeRegistry.ts                                 │
│                                                                      │
│    {                                                                 │
│      type: 'barChart',                                              │
│      defaultSchema: {                                               │
│        renderAs: 'barChart',                                        │
│        chartConfig: {                                               │
│          bars: [{ dataKey: 'value', fill: '#6B1B5E' }]  ← OLD WAY  │
│        }                                                             │
│      }                                                               │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Schema passed to...
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. RENDER FACTORY (Router)                                          │
│    src/renderers/RenderFactory.tsx                                  │
│                                                                      │
│    switch (schema.renderAs) {                                       │
│      case 'barChart': return <BarChartRenderer {...props} />       │
│      case 'lineChart': return <LineChartRenderer {...props} />     │
│      case 'text': return <TextRenderer {...props} />               │
│    }                                                                 │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Props include:
                                   │ - schema (with renderAs, chartConfig, fields)
                                   │ - value (actual data)
                                   │ - mode ('display' or 'edit')
                                   │ - onChange, disabled, error
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. SPECIFIC RENDERER (e.g., BarChartRenderer)                       │
│    src/renderers/BarChartRenderer.tsx                               │
│                                                                      │
│    ┌───────────────────────────────────────────────────────────┐   │
│    │ OLD WAY (Hardcoded):                                      │   │
│    │                                                            │   │
│    │ const {                                                    │   │
│    │   bars = [{ fill: '#6B1B5E' }]  ← Hardcoded hex color    │   │
│    │ } = schema.chartConfig;                                   │   │
│    │                                                            │   │
│    │ <CartesianGrid stroke="#e5e7eb" />  ← Hardcoded          │   │
│    │ <XAxis stroke="#6b7280" />          ← Hardcoded          │   │
│    └───────────────────────────────────────────────────────────┘   │
│                                                                      │
│    ┌───────────────────────────────────────────────────────────┐   │
│    │ NEW WAY (Design System):                                  │   │
│    │                                                            │   │
│    │ import { ChartColors } from '../design-system';           │   │
│    │                                                            │   │
│    │ const {                                                    │   │
│    │   bars = [{                                               │   │
│    │     fill: ChartColors.series.eggplantLight  ← Token!     │   │
│    │   }]                                                       │   │
│    │ } = schema.chartConfig;                                   │   │
│    │                                                            │   │
│    │ <CartesianGrid stroke={ChartColors.ui.grid} />           │   │
│    │ <XAxis stroke={ChartColors.ui.axis} />                   │   │
│    └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ Renders to DOM
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. VISUAL OUTPUT                                                     │
│                                                                      │
│    ┌─────────────────────────────────────────────────┐             │
│    │  [Bar Chart]                                    │             │
│    │  ╔═══════════════════════════════╗             │             │
│    │  ║ █████████████ Q1: 150         ║             │             │
│    │  ║ ██████████████████ Q2: 200    ║  ← Styled  │             │
│    │  ║ █████████ Q3: 120              ║             │             │
│    │  ╚═══════════════════════════════╝             │             │
│    └─────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

## 🎨 Style Application Layers

### **Layer 1: Design System Constants**
```typescript
// src/design-system/colors.ts
export const ChartColors = {
  series: {
    eggplant: '#431C5B',
    eggplantLight: '#6B1B5E',
    raspberry: '#B21A53',
  },
  ui: {
    grid: '#e5e7eb',    // gray-200
    axis: '#6b7280',    // gray-500
  },
  palette: ['#431C5B', '#1D1F48', '#B21A53', '#3bcd3e'],
};
```

### **Layer 2: Asset Type Schema (Template Defaults)**
```typescript
// src/schemas/assetTypeRegistry.ts
{
  type: 'barChart',
  defaultSchema: {
    renderAs: 'barChart',
    chartConfig: {
      bars: [{ 
        dataKey: 'value', 
        fill: ChartColors.series.eggplantLight,  // ← Design system token
        name: 'Value' 
      }],
      showGrid: true,
      showLegend: true
    }
  }
}
```

### **Layer 3: Content-Specific Overrides (JSON Data)**
```json
// src/data/summaries/week-oct-31-2024.json
{
  "salesData": [...],
  "_salesData_type": "barChart",
  "_salesData_chartConfig": {
    "bars": [
      { "dataKey": "q1", "fill": "#431C5B", "name": "Q1 Sales" },
      { "dataKey": "q2", "fill": "#B21A53", "name": "Q2 Sales" }
    ]
  }
}
```
**Note:** Content can override colors, but should use design system values!

### **Layer 4: Renderer Logic (Runtime)**
```typescript
// src/renderers/BarChartRenderer.tsx
const {
  bars = [{ dataKey: 'value', fill: ChartColors.series.eggplantLight }],
  showGrid = true
} = schema.chartConfig || {};

// Render with design system fallbacks
<CartesianGrid stroke={ChartColors.ui.grid} />
<XAxis stroke={ChartColors.ui.axis} />
{bars.map(bar => (
  <Bar dataKey={bar.dataKey} fill={bar.fill} />
))}
```

## ✅ Current State vs Future State

### **CURRENT (Before Migration)**
```
┌──────────────┐
│ JSON Data    │ → Hardcoded hex colors (#6B1B5E)
└──────────────┘
       ↓
┌──────────────┐
│ Registry     │ → Hardcoded defaults (#e5e7eb)
└──────────────┘
       ↓
┌──────────────┐
│ Renderer     │ → Hardcoded fallbacks ('#6b7280')
└──────────────┘
       ↓
🚫 Problem: Colors scattered everywhere, no central source of truth!
```

### **FUTURE (After Migration)**
```
┌─────────────────────┐
│ Design System       │ ← SINGLE SOURCE OF TRUTH
│ ChartColors.series  │
│ ChartColors.ui      │
│ ChartColors.palette │
└─────────────────────┘
       ↓
┌──────────────┐
│ JSON Data    │ → Uses ChartColors.series.eggplant
└──────────────┘
       ↓
┌──────────────┐
│ Registry     │ → Uses ChartColors.series.eggplantLight
└──────────────┘
       ↓
┌──────────────┐
│ Renderer     │ → Uses ChartColors.ui.grid/axis
└──────────────┘
       ↓
✅ Benefit: Change ChartColors once, updates everywhere!
```

## 🔧 Where We're Applying Styles NOW

### **Priority 1: Renderer Defaults** ✅ DONE
- BarChartRenderer.tsx → ChartColors.ui.grid, .axis, .series.eggplantLight
- LineChartRenderer.tsx → ChartColors.ui.grid, .axis, .series.eggplantLight
- HorizontalRuleRenderer.tsx → Colors.gray200

### **Priority 2: Asset Type Registry** (NEXT)
Update `assetTypeRegistry.ts` to use ChartColors in `defaultSchema.chartConfig`:
```typescript
{
  type: 'barChart',
  defaultSchema: {
    chartConfig: {
      bars: [{ 
        fill: ChartColors.series.eggplantLight  // Instead of '#6B1B5E'
      }]
    }
  }
}
```

### **Priority 3: Existing JSON Data** (LATER)
Replace hardcoded colors in existing content files:
```json
// Before
"_salesChart_chartConfig": {
  "bars": [{ "fill": "#6B1B5E" }]
}

// After (ideally reference design system, but hex is OK if it matches)
"_salesChart_chartConfig": {
  "bars": [{ "fill": "#6B1B5E" }]  // ← OK if matches ChartColors.series.eggplantLight
}
```

## 🎯 The Key Point

**Style schemas are applied in 3 places:**

1. **Renderer Defaults** (when no chartConfig provided)
   - `const { bars = [{ fill: ChartColors.series.eggplantLight }] } = chartConfig || {};`
   
2. **Asset Type Registry** (template defaults when creating new content)
   - `defaultSchema.chartConfig.bars[0].fill = ChartColors.series.eggplantLight`
   
3. **JSON Data** (content-specific overrides)
   - `_salesChart_chartConfig.bars[0].fill = "#6B1B5E"` (can override if needed)

**Right now we're fixing #1 (Renderer Defaults).** This ensures all charts use design system colors unless explicitly overridden!

## 🚀 Migration Status

- [x] Create ChartColors in design system
- [x] Update BarChartRenderer defaults
- [x] Update LineChartRenderer defaults  
- [x] Update HorizontalRuleRenderer defaults
- [ ] Update PieChartRenderer defaults
- [ ] Update RadialChartRenderer defaults
- [ ] Update assetTypeRegistry chartConfig defaults
- [ ] Update EngineAssetsPreview.tsx examples
- [ ] Test in light/dark mode
