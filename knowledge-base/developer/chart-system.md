# Chart System - Developer Guide

**Complete guide to the chart visualization system**

Learn how charts work, how to modify them, and how to add new chart types.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Available Chart Types](#available-chart-types)
3. [Chart Configuration](#chart-configuration)
4. [How Charts Work](#how-charts-work)
5. [Modifying Chart Appearance](#modifying-chart-appearance)
6. [Adding a New Chart Type](#adding-a-new-chart-type)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Executive Summary Platform uses **Recharts** (React wrapper for D3.js) for data visualizations. Charts are treated as first-class render types with their own metadata and configuration.

### Architecture

```
Data (JSON) → ChartConfig → ChartRenderer → Recharts Component
```

### Key Features
- 🎨 Customizable colors, sizes, and styling
- 📊 Four chart types: Pie, Bar, Line, Radial
- 🔧 Configurable via metadata (no code changes needed)
- 📱 Responsive and mobile-friendly
- 🌓 Dark mode support
- 🎯 Interactive tooltips

---

## Available Chart Types

### 1. Pie Chart
**Use Case:** Part-to-whole relationships, budget allocation, market share

**Render Type:** `pieChart`

**Data Structure:**
```json
{
  "budgetAllocation": [
    { "name": "Engineering", "value": 450000 },
    { "name": "Marketing", "value": 250000 },
    { "name": "Operations", "value": 180000 }
  ],
  "_budgetAllocation_type": "pieChart",
  "_budgetAllocation_chartConfig": {
    "nameKey": "name",
    "dataKey": "value",
    "colors": ["#6B1B5E", "#B21A53", "#3B82F6", "#10B981"]
  }
}
```

**Visual:**
```
   Engineering (450k)
   ╱────────╲
  │  37.5%  │
   ╲────────╱
```

---

### 2. Bar Chart
**Use Case:** Comparing values across categories, revenue trends, performance metrics

**Render Type:** `barChart`

**Data Structure:**
```json
{
  "quarterlyRevenue": [
    { "month": "Jan", "revenue": 1200000 },
    { "month": "Feb", "revenue": 1450000 },
    { "month": "Mar", "revenue": 1680000 }
  ],
  "_quarterlyRevenue_type": "barChart",
  "_quarterlyRevenue_chartConfig": {
    "xAxisKey": "month",
    "dataKey": "revenue",
    "barColor": "#6B1B5E"
  }
}
```

**Visual:**
```
Revenue
   │     ▆▆
   │     ▆▆
   │  ▆▆ ▆▆
   │  ▆▆ ▆▆
   └────────── Month
    Jan Feb Mar
```

---

### 3. Line Chart
**Use Case:** Trends over time, growth patterns, user activity

**Render Type:** `lineChart`

**Data Structure:**
```json
{
  "userGrowth": [
    { "month": "Jan", "users": 1500 },
    { "month": "Feb", "users": 2100 },
    { "month": "Mar", "users": 3200 }
  ],
  "_userGrowth_type": "lineChart",
  "_userGrowth_chartConfig": {
    "xAxisKey": "month",
    "dataKey": "users",
    "lineColor": "#B21A53",
    "strokeWidth": 2
  }
}
```

**Visual:**
```
Users
   │         ●
   │       ╱
   │     ●
   │   ╱
   │ ●
   └────────── Month
```

---

### 4. Radial Chart
**Use Case:** Progress tracking, multi-metric completion, nested percentages

**Render Type:** `radialChart`

**Data Structure:**
```json
{
  "projectCompletion": [
    { "name": "Infrastructure", "value": 85 },
    { "name": "Frontend", "value": 92 },
    { "name": "Backend", "value": 78 }
  ],
  "_projectCompletion_type": "radialChart",
  "_projectCompletion_chartConfig": {
    "dataKey": "value",
    "maxValue": 100,
    "colors": ["#6B1B5E", "#B21A53", "#3B82F6"],
    "showPercentage": true
  }
}
```

**Visual:**
```
    ╭─────────╮
   │  ◉  85%  │  Infrastructure
   │  ◉  92%  │  Frontend
   │  ◉  78%  │  Backend
    ╰─────────╯
```

---

## Chart Configuration

### Common Configuration Properties

All charts support these base properties:

```typescript
interface BaseChartConfig {
  // Chart dimensions (optional)
  width?: number;      // Default: responsive
  height?: number;     // Default: 300

  // Styling
  colors?: string[];   // Color palette (hex codes)
  
  // Interactivity
  showTooltip?: boolean;  // Default: true
  showLegend?: boolean;   // Default: true
}
```

### Chart-Specific Configuration

#### Pie Chart Config
```typescript
interface PieChartConfig extends BaseChartConfig {
  nameKey: string;      // Field for slice labels
  dataKey: string;      // Field for slice values
  innerRadius?: number; // For donut charts (0-100)
  outerRadius?: number; // Pie size (default: 80)
}
```

**Example:**
```json
{
  "_chartConfig": {
    "nameKey": "category",
    "dataKey": "amount",
    "colors": ["#6B1B5E", "#B21A53"],
    "innerRadius": 0,
    "outerRadius": 80
  }
}
```

#### Bar Chart Config
```typescript
interface BarChartConfig extends BaseChartConfig {
  xAxisKey: string;   // Field for X-axis labels
  dataKey: string;    // Field for bar heights
  barColor: string;   // Bar fill color
  orientation?: 'vertical' | 'horizontal';  // Default: vertical
}
```

**Example:**
```json
{
  "_chartConfig": {
    "xAxisKey": "month",
    "dataKey": "sales",
    "barColor": "#6B1B5E",
    "orientation": "vertical"
  }
}
```

#### Line Chart Config
```typescript
interface LineChartConfig extends BaseChartConfig {
  xAxisKey: string;     // Field for X-axis labels
  dataKey: string;      // Field for Y-axis values
  lineColor: string;    // Line stroke color
  strokeWidth?: number; // Line thickness (default: 2)
  showDots?: boolean;   // Show data point markers
}
```

**Example:**
```json
{
  "_chartConfig": {
    "xAxisKey": "date",
    "dataKey": "value",
    "lineColor": "#B21A53",
    "strokeWidth": 3,
    "showDots": true
  }
}
```

#### Radial Chart Config
```typescript
interface RadialChartConfig extends BaseChartConfig {
  dataKey: string;          // Field for progress values
  maxValue: number;         // Maximum value (e.g., 100 for percentage)
  showPercentage: boolean;  // Display percentage labels
  thickness?: number;       // Ring thickness (default: 20)
}
```

**Example:**
```json
{
  "_chartConfig": {
    "dataKey": "completion",
    "maxValue": 100,
    "colors": ["#6B1B5E", "#B21A53", "#3B82F6"],
    "showPercentage": true,
    "thickness": 25
  }
}
```

---

## How Charts Work

### 1. Metadata Structure

Charts use a specific metadata pattern:

```json
{
  "sectionName": [ /* chart data */ ],
  "_sectionName_type": "pieChart",
  "_sectionName_chartConfig": { /* config */ },
  "_sectionName_fields": { /* field definitions */ },
  "_sectionName_columnSpan": 2
}
```

### 2. Rendering Pipeline

```
JSON Data
  ↓
RenderFactory (checks type === 'pieChart')
  ↓
PieChartRenderer.tsx
  ↓
Extract chartConfig + data
  ↓
Recharts <PieChart> component
  ↓
Rendered chart in browser
```

### 3. Code Flow Example

**JSON:**
```json
{
  "revenue": [
    { "month": "Jan", "amount": 1200000 }
  ],
  "_revenue_type": "barChart",
  "_revenue_chartConfig": {
    "xAxisKey": "month",
    "dataKey": "amount"
  }
}
```

**RenderFactory routing:**
```typescript
case 'barChart':
  return <BarChartRenderer value={data} schema={schema} />;
```

**BarChartRenderer:**
```typescript
const chartConfig = schema.chartConfig;
const data = value as Array<any>;

return (
  <BarChart data={data}>
    <XAxis dataKey={chartConfig.xAxisKey} />
    <Bar dataKey={chartConfig.dataKey} fill={chartConfig.barColor} />
  </BarChart>
);
```

---

## Modifying Chart Appearance

### Change Colors

**Location:** `_sectionName_chartConfig.colors` or `barColor`/`lineColor`

**Example:**
```json
{
  "_budgetAllocation_chartConfig": {
    "colors": [
      "#6B1B5E",  // FIS Eggplant
      "#B21A53",  // FIS Raspberry
      "#3B82F6",  // Blue
      "#10B981"   // Green
    ]
  }
}
```

**Brand Colors:**
- FIS Eggplant: `#6B1B5E`
- FIS Raspberry: `#B21A53`
- FIS Cream: `#FAF6F1`

### Change Chart Size

**Method 1: Config (affects all instances)**
```json
{
  "_chartConfig": {
    "width": 600,
    "height": 400
  }
}
```

**Method 2: Renderer (affects all charts of this type)**

Edit `src/renderers/[ChartType]Renderer.tsx`:

```typescript
<BarChart 
  width={chartConfig.width || 800}   // Default width
  height={chartConfig.height || 350} // Default height
  data={data}
>
```

### Customize Tooltips

**Edit:** Chart renderer component

```typescript
// Add custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow">
        <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Use in chart
<BarChart data={data}>
  <Tooltip content={<CustomTooltip />} />
</BarChart>
```

### Add Grid Lines

**Edit:** Chart renderer

```typescript
import { CartesianGrid } from 'recharts';

<BarChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />  {/* Add this */}
  <XAxis dataKey="month" />
  <Bar dataKey="value" />
</BarChart>
```

### Dark Mode Styling

All chart renderers support dark mode through Tailwind classes:

```typescript
<div className="bg-white dark:bg-gray-900">
  <BarChart>
    {/* Charts automatically adapt colors */}
  </BarChart>
</div>
```

**Axis styling:**
```typescript
<XAxis 
  stroke={isDarkMode ? '#9CA3AF' : '#374151'}  // Gray for dark mode
  tick={{ fill: isDarkMode ? '#D1D5DB' : '#1F2937' }}
/>
```

---

## Adding a New Chart Type

### Example: Adding a Scatter Plot

#### Step 1: Define Config Interface

**File:** `src/types/schema.ts`

```typescript
export interface ScatterPlotConfig {
  xAxisKey: string;
  yAxisKey: string;
  dotColor: string;
  dotSize?: number;
}

export interface ChartConfig {
  // ... existing types
  scatterPlot?: ScatterPlotConfig;
}
```

#### Step 2: Create Renderer

**File:** `src/renderers/ScatterPlotRenderer.tsx`

```typescript
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { RendererProps } from '../types';

export const ScatterPlotRenderer: React.FC<RendererProps> = ({ value, schema }) => {
  const data = value as Array<any>;
  const config = schema.chartConfig?.scatterPlot || {
    xAxisKey: 'x',
    yAxisKey: 'y',
    dotColor: '#6B1B5E',
    dotSize: 5
  };

  return (
    <div className="w-full">
      {schema.label && (
        <h3 className="text-lg font-roobert-semibold mb-4">{schema.label}</h3>
      )}
      <ScatterChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={config.xAxisKey} />
        <YAxis dataKey={config.yAxisKey} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter 
          data={data} 
          fill={config.dotColor}
          radius={config.dotSize}
        />
      </ScatterChart>
    </div>
  );
};
```

#### Step 3: Add to RenderFactory

```typescript
import { ScatterPlotRenderer } from './ScatterPlotRenderer';

case 'scatterPlot':
  return <ScatterPlotRenderer {...props} />;
```

#### Step 4: Add to Template Builder

```typescript
{
  id: 'scatterPlot',
  name: 'Scatter Plot',
  renderType: 'scatterPlot',
  description: 'X-Y data point visualization',
  schema: {
    type: 'scatterPlot',
    label: 'Scatter Plot',
    renderAs: 'scatterPlot',
    chartConfig: {
      scatterPlot: {
        xAxisKey: 'x',
        yAxisKey: 'y',
        dotColor: '#6B1B5E'
      }
    }
  } as any
}
```

#### Step 5: Add Example

```typescript
{
  id: 'scatterPlot',
  name: 'Scatter Plot',
  category: 'charts',
  description: 'X-Y coordinate visualization',
  useCase: 'Correlation analysis, data distribution',
  schema: {
    renderAs: 'scatterPlot',
    label: 'Performance vs Budget',
    chartConfig: {
      scatterPlot: {
        xAxisKey: 'budget',
        yAxisKey: 'performance',
        dotColor: '#B21A53'
      }
    }
  },
  sampleData: [
    { budget: 100000, performance: 85 },
    { budget: 150000, performance: 92 },
    { budget: 200000, performance: 78 }
  ]
}
```

---

## Troubleshooting

### Chart doesn't render

**Check:**
- Is data an array? `console.log(Array.isArray(data))`
- Are dataKey fields present in objects?
- Is Recharts imported correctly?

**Debug:**
```typescript
console.log('Chart data:', data);
console.log('Chart config:', chartConfig);
```

### Colors not applying

**Issue:** Wrong config property name

**Fix:**
```typescript
// Wrong:
chartConfig.color  

// Right:
chartConfig.barColor    // For bar charts
chartConfig.lineColor   // For line charts
chartConfig.colors      // For multi-color charts (array)
```

### Chart too small/large

**Solution 1:** Set responsive width
```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    ...
  </BarChart>
</ResponsiveContainer>
```

**Solution 2:** Configure in metadata
```json
{
  "_chartConfig": {
    "width": 800,
    "height": 400
  }
}
```

### Tooltip not showing

**Fix:** Add Tooltip component
```typescript
import { Tooltip } from 'recharts';

<BarChart>
  <Tooltip />  {/* Add this */}
  <Bar ... />
</BarChart>
```

---

## Best Practices

### 1. Use Responsive Containers
```typescript
import { ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <BarChart>{/* ... */}</BarChart>
</ResponsiveContainer>
```

### 2. Provide Default Configs
```typescript
const config = schema.chartConfig?.barChart || {
  xAxisKey: 'name',
  dataKey: 'value',
  barColor: '#6B1B5E'  // Always provide defaults
};
```

### 3. Handle Empty Data
```typescript
if (!data || data.length === 0) {
  return (
    <div className="text-gray-500 text-center p-8">
      No data available
    </div>
  );
}
```

### 4. Format Tooltip Values
```typescript
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload[0]) {
    return (
      <div className="bg-white p-2 rounded shadow">
        <p>${payload[0].value.toLocaleString()}</p>  {/* Format currency */}
      </div>
    );
  }
};
```

---

## Related Documentation

- [Adding New Assets](./adding-new-assets.md) - General asset creation guide
- [Metadata Schema Reference](../reference/metadata-schema.md) - Metadata patterns
- [Multi-Column Layout](./multi-column-layout.md) - Layout system for charts

---

*Last Updated: November 8, 2025*
