# Metadata Schema Reference

**Complete reference for the Executive Summary metadata system**

This document explains every metadata pattern, convention, and use case.

---

## Overview

The Executive Summary Platform uses a **metadata-driven architecture** where JSON files contain both **data** and **metadata** that defines how the data should be rendered.

### Core Principle

```json
{
  "sectionName": "actual data goes here",
  "_sectionName_type": "metadata about how to render",
  "_sectionName_config": "configuration for rendering"
}
```

All metadata keys start with underscore (`_`) to distinguish them from actual data.

---

## Metadata Patterns

### 1. Render Type (`_*_type`)

**Purpose:** Defines which renderer component to use

**Pattern:** `_<sectionKey>_type`

**Value:** One of the [RenderType values](#render-types)

**Examples:**
```json
{
  "highlights": ["Item 1", "Item 2"],
  "_highlights_type": "listNoTitle",
  
  "description": "Some text",
  "_description_type": "textarea",
  
  "budget": [{"name": "Engineering", "value": 45000}],
  "_budget_type": "pieChart"
}
```

**Required:** Yes (defaults to `text` if missing)

---

### 2. Field Definitions (`_*_fields`)

**Purpose:** Defines structure for complex types (nestedCards, objectForm)

**Pattern:** `_<sectionKey>_fields`

**Value:** Object mapping field names to field schemas

**Example:**
```json
{
  "departments": [
    {
      "name": "Engineering",
      "headcount": 45,
      "budget": 450000
    }
  ],
  "_departments_type": "nestedCards",
  "_departments_fields": {
    "name": {
      "type": "text",
      "label": "Department Name",
      "required": true
    },
    "headcount": {
      "type": "number",
      "label": "Team Size"
    },
    "budget": {
      "type": "number",
      "label": "Budget (USD)"
    }
  }
}
```

**Required:** Only for `nestedCards`, `objectForm`, and other complex types

---

### 3. Type-Specific Config (`_*_config`, `_*_chartConfig`, `_*_hrConfig`)

**Purpose:** Configuration specific to the render type

**Patterns:**
- `_<sectionKey>_config` - Generic config
- `_<sectionKey>_chartConfig` - Chart configuration
- `_<sectionKey>_hrConfig` - Horizontal rule configuration

**Chart Example:**
```json
{
  "revenue": [/* data */],
  "_revenue_type": "barChart",
  "_revenue_chartConfig": {
    "xAxisKey": "month",
    "dataKey": "amount",
    "barColor": "#6B1B5E"
  }
}
```

**HR Example:**
```json
{
  "divider1": null,
  "_divider1_type": "hr",
  "_divider1_hrConfig": {
    "thickness": 1,
    "color": "#E5E7EB",
    "marginTop": 24,
    "marginBottom": 24,
    "style": "solid"
  }
}
```

**Required:** Type-dependent (charts require chartConfig, HR requires hrConfig)

---

### 4. Column Span (`_*_columnSpan`)

**Purpose:** Controls grid layout width (1-4 columns)

**Pattern:** `_<sectionKey>_columnSpan`

**Value:** Integer (1, 2, 3, or 4)

**Default:** 1 (if not specified)

**Examples:**
```json
{
  "highlights": ["..."],
  "_highlights_columnSpan": 4,  // Full width
  
  "budgetChart": [/* ... */],
  "_budgetChart_columnSpan": 2,  // Half width
  
  "revenueChart": [/* ... */],
  "_revenueChart_columnSpan": 2  // Half width (side-by-side with budget)
}
```

**Grid Behavior:**
- Sections fill rows from left to right
- Row wraps when total span exceeds 4
- Responsive: stacks vertically on mobile

**Rendering:**
```
┌─────────────────────────────────────┐
│  Highlights (columnSpan: 4)         │
├──────────────────┬──────────────────┤
│  Budget (2)      │  Revenue (2)     │
└──────────────────┴──────────────────┘
```

---

### 5. Enabled Flag (`_enabled_*`)

**Purpose:** Controls section visibility

**Pattern:** `_enabled_<sectionKey>`

**Value:** Boolean (`true` | `false`)

**Default:** `true`

**Example:**
```json
{
  "risks": [/* data */],
  "_risks_type": "nestedCards",
  "_enabled_risks": false  // Section hidden in display
}
```

**Usage:**
- Template Builder: Users can toggle sections on/off
- EditorModalV2: Only enabled sections appear
- Frontend: Disabled sections are not rendered

---

### 6. Completed Flag (`_completed_*`)

**Purpose:** Tracks editing workflow state

**Pattern:** `_completed_<sectionKey>`

**Value:** Boolean (`true` | `false`)

**Default:** `false`

**Example:**
```json
{
  "weeklyFocus": ["..."],
  "_weeklyFocus_type": "listNoTitle",
  "_completed_weeklyFocus": true  // User marked as done editing
}
```

**Usage:**
- EditorModalV2: Progress tracking
- Visual indicators (checkmarks, progress bars)
- Does NOT affect rendering (only workflow state)

---

## Standard Metadata Keys

### Summary-Level Metadata

These apply to the entire summary (not specific sections):

```json
{
  "id": "week-2025-11-08",
  "quarter": "Nov 8",
  "year": 2025,
  "date": "2025-11-08",
  "title": "Organization Name - Weekly Executive Update",
  "status": "draft",
  "protectionEnabled": false
}
```

**Field Reference:**

| Key | Type | Description | Required |
|-----|------|-------------|----------|
| `id` | string | Unique identifier (used for filename) | Yes |
| `quarter` | string | Display label (e.g., "Nov 8", "Q4") | Yes |
| `year` | number | Year | Yes |
| `date` | string | ISO date (YYYY-MM-DD) | Yes |
| `title` | string | Summary title/headline | Yes |
| `status` | string | Workflow state: `draft` \| `published` | No |
| `protectionEnabled` | boolean | Prevents editing if true | No |

---

### Template Metadata

Additional metadata for template files:

```json
{
  "_template_name": "Executive Summary V3",
  "_template_description": "Multi-column layout with charts",
  "_template_created": "2025-11-08T12:00:00.000Z",
  "_template_updated": "2025-11-08T12:00:00.000Z"
}
```

**Field Reference:**

| Key | Type | Description |
|-----|------|-------------|
| `_template_name` | string | Template display name |
| `_template_description` | string | Template description |
| `_template_created` | string | ISO timestamp of creation |
| `_template_updated` | string | ISO timestamp of last update |

---

## Render Types

Complete list of available render types:

### Basic Types

| Type | Description | Example Use |
|------|-------------|-------------|
| `text` | Single-line text | Names, titles, labels |
| `textarea` | Multi-line text | Descriptions, summaries |
| `number` | Numeric input | Counts, amounts, scores |
| `date` | Date picker | Deadlines, milestones |

### List Types

| Type | Description | Example Use |
|------|-------------|-------------|
| `list` | Key-value pairs with labels | Metrics with labels |
| `listNoTitle` | Simple bullet list | Highlights, achievements |
| `nestedCards` | Expandable card array | Departments, projects |

### Complex Types

| Type | Description | Example Use |
|------|-------------|-------------|
| `objectForm` | Structured object fields | Configuration, settings |
| `keyValue` | Simple key-value pairs | Metadata, properties |

### Rich Content

| Type | Description | Example Use |
|------|-------------|-------------|
| `markdown` | Markdown-formatted text | Long-form content |
| `expression` | Expression syntax text | Formatted highlights |

### Chart Types

| Type | Description | Example Use |
|------|-------------|-------------|
| `pieChart` | Pie/donut chart | Budget allocation, market share |
| `barChart` | Bar/column chart | Revenue trends, comparisons |
| `lineChart` | Line graph | Growth over time, trends |
| `radialChart` | Radial/donut progress | Multi-metric progress |

### Layout Types

| Type | Description | Example Use |
|------|-------------|-------------|
| `hr` | Horizontal divider | Visual section separators |

---

## Field Schema Structure

For complex types (`nestedCards`, `objectForm`), fields are defined with this schema:

```typescript
{
  "fieldName": {
    "type": "text" | "number" | "date" | "textarea" | "list",
    "label": "Display Label",
    "placeholder"?: "Placeholder text",
    "required"?: boolean,
    "helpText"?: "Helpful description",
    "validation"?: [
      {
        "rule": "min" | "max" | "pattern",
        "value": any,
        "message": "Error message"
      }
    ]
  }
}
```

**Example:**
```json
{
  "_initiatives_fields": {
    "name": {
      "type": "text",
      "label": "Initiative Name",
      "required": true,
      "placeholder": "Enter initiative name"
    },
    "progress": {
      "type": "number",
      "label": "Progress %",
      "validation": [
        { "rule": "min", "value": 0, "message": "Must be >= 0" },
        { "rule": "max", "value": 100, "message": "Must be <= 100" }
      ]
    },
    "description": {
      "type": "textarea",
      "label": "Description",
      "helpText": "Provide a detailed description"
    }
  }
}
```

---

## Complete Example

Full summary with all metadata patterns:

```json
{
  "id": "week-2025-11-08",
  "quarter": "Nov 8",
  "year": 2025,
  "date": "2025-11-08",
  "title": "Demo Services - Weekly Update",
  "status": "draft",
  "protectionEnabled": false,
  
  "highlights": [
    "Completed Q4 infrastructure upgrade",
    "Revenue target exceeded by 15%"
  ],
  "_highlights_type": "listNoTitle",
  "_highlights_columnSpan": 4,
  "_enabled_highlights": true,
  "_completed_highlights": true,
  
  "keyMetrics": [
    { "label": "Revenue", "value": "$2.5M", "unit": "" },
    { "label": "Growth", "value": "15", "unit": "%" }
  ],
  "_keyMetrics_type": "nestedCards",
  "_keyMetrics_columnSpan": 4,
  "_keyMetrics_fields": {
    "label": { "type": "text", "label": "Metric Name" },
    "value": { "type": "text", "label": "Value" },
    "unit": { "type": "text", "label": "Unit" }
  },
  "_enabled_keyMetrics": true,
  "_completed_keyMetrics": true,
  
  "budgetAllocation": [
    { "name": "Engineering", "value": 450000 },
    { "name": "Marketing", "value": 250000 }
  ],
  "_budgetAllocation_type": "pieChart",
  "_budgetAllocation_columnSpan": 2,
  "_budgetAllocation_chartConfig": {
    "nameKey": "name",
    "dataKey": "value",
    "colors": ["#6B1B5E", "#B21A53"]
  },
  "_budgetAllocation_fields": {
    "name": { "type": "text", "label": "Category", "required": true },
    "value": { "type": "number", "label": "Amount", "required": true }
  },
  "_enabled_budgetAllocation": true,
  "_completed_budgetAllocation": false,
  
  "quarterlyRevenue": [
    { "month": "Jan", "revenue": 1200000 },
    { "month": "Feb", "revenue": 1450000 }
  ],
  "_quarterlyRevenue_type": "barChart",
  "_quarterlyRevenue_columnSpan": 2,
  "_quarterlyRevenue_chartConfig": {
    "xAxisKey": "month",
    "dataKey": "revenue",
    "barColor": "#6B1B5E"
  },
  "_quarterlyRevenue_fields": {
    "month": { "type": "text", "label": "Month" },
    "revenue": { "type": "number", "label": "Revenue" }
  },
  "_enabled_quarterlyRevenue": true,
  "_completed_quarterlyRevenue": false,
  
  "divider1": null,
  "_divider1_type": "hr",
  "_divider1_columnSpan": 4,
  "_divider1_hrConfig": {
    "thickness": 1,
    "color": "#E5E7EB",
    "marginTop": 24,
    "marginBottom": 24,
    "style": "solid"
  },
  "_enabled_divider1": true,
  "_completed_divider1": false,
  
  "weeklyFocus": [
    "Finalize Q1 roadmap",
    "Complete security audit"
  ],
  "_weeklyFocus_type": "listNoTitle",
  "_weeklyFocus_columnSpan": 4,
  "_enabled_weeklyFocus": true,
  "_completed_weeklyFocus": false,
  
  "_template_name": "Executive Summary V3 - Multi-Column",
  "_template_description": "Modern layout with charts and metrics",
  "_template_created": "2025-11-08T12:00:00.000Z",
  "_template_updated": "2025-11-08T12:00:00.000Z"
}
```

---

## Metadata Validation

### Required Metadata

Every section must have:
- `_sectionName_type` (render type)

### Type-Specific Requirements

**Charts:**
- Must have `_sectionName_chartConfig`
- Must have `_sectionName_fields` (defines data structure)

**NestedCards:**
- Must have `_sectionName_fields` (defines card structure)

**HR:**
- Must have `_sectionName_hrConfig`
- Data value can be `null`

### Optional Metadata

- `_sectionName_columnSpan` (defaults to 1)
- `_enabled_sectionName` (defaults to true)
- `_completed_sectionName` (defaults to false)

---

## Metadata Best Practices

### 1. Consistent Naming

Use camelCase for section keys:
```json
// Good
"weeklyFocus": [...],
"_weeklyFocus_type": "listNoTitle"

// Avoid
"weekly-focus": [...],
"_weekly-focus_type": "listNoTitle"
```

### 2. Explicit Types

Always specify `_type` even if it seems obvious:
```json
{
  "title": "My Summary",
  "_title_type": "text"  // Always specify
}
```

### 3. Complete Field Definitions

For `nestedCards`, define all fields:
```json
{
  "_departments_fields": {
    "name": { "type": "text", "label": "Name", "required": true },
    "budget": { "type": "number", "label": "Budget" },
    "headcount": { "type": "number", "label": "Headcount" }
    // Define ALL fields, even simple ones
  }
}
```

### 4. Default Values

Provide defaults in config:
```json
{
  "_chartConfig": {
    "barColor": "#6B1B5E",  // Always specify color
    "width": 600,            // Explicit dimensions
    "height": 300
  }
}
```

### 5. Column Span Logic

Plan your layout:
```json
// Row 1: Full width
"_highlights_columnSpan": 4,

// Row 2: Two halves
"_chart1_columnSpan": 2,
"_chart2_columnSpan": 2,

// Row 3: Three columns + one
"_metric1_columnSpan": 1,
"_metric2_columnSpan": 1,
"_metric3_columnSpan": 1,
"_summary_columnSpan": 1
```

---

## Related Documentation

- [Adding New Assets](../developer/adding-new-assets.md) - Creating new render types
- [Chart System](../developer/chart-system.md) - Chart-specific metadata
- [Multi-Column Layout](../developer/multi-column-layout.md) - Grid system details

---

*Last Updated: November 8, 2025*
