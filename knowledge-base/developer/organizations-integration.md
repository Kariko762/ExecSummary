# Organizations Integration Guide

**CR-001: How Organizations were unified with the Executive Summary rendering system**

This document explains the Organizations integration architecture and how it shares rendering infrastructure with Executive Summaries.

---

## Overview

**Goal:** Unify Organizations and Executive Summaries to use the same metadata-driven rendering system.

**Before CR-001:**
- Organizations used custom rendering in `OrganizationModal.tsx`
- 271 lines of custom JSX for rendering 4 sections
- No expression parsing support
- Separate styling and layout logic from Summaries

**After CR-001:**
- Organizations use RenderFactory (same as SummaryDetailV2)
- 151 lines (-44% reduction)
- Full expression parsing support
- Shared rendering, styling, and expression engine

---

## Architecture Changes

### Data Structure

Organizations now follow the same metadata pattern as Summaries:

```json
{
  "id": "banking-na",
  "name": "Banking - North America",
  "lastUpdated": "2024-11-04T17:45:00Z",
  
  "keyHighlights": ["Item 1", "Item 2"],
  "_keyHighlights_type": "list",
  "_enabled_keyHighlights": true,
  "_completed_keyHighlights": false,
  
  "strategicProjects": [
    {
      "id": "proj-001",
      "name": "Project Name",
      "status": "on-track",
      "progress": 75,
      "owner": "John Doe",
      "dueDate": "2024-12-31",
      "executiveSummary": "Summary text with {{expressions}}"
    }
  ],
  "_strategicProjects_type": "nestedCards",
  "_strategicProjects_fields": {
    "name": { "type": "text", "label": "Project Name", "required": true },
    "status": { "type": "select", "label": "Status", "options": [...] },
    "progress": { "type": "number", "label": "Progress %", "min": 0, "max": 100 },
    "owner": { "type": "text", "label": "Owner" },
    "dueDate": { "type": "date", "label": "Due Date" },
    "executiveSummary": { "type": "textarea", "label": "Executive Summary" }
  },
  "_enabled_strategicProjects": true,
  "_completed_strategicProjects": false,
  
  "supportActivities": [ /* nestedCards */ ],
  "_supportActivities_type": "nestedCards",
  "_supportActivities_fields": { /* ... */ },
  
  "demoInsights": {
    "demosThisWeek": 16,
    "hoursInvested": 142,
    "topRequests": ["Request 1", "Request 2"],
    "wins": ["Win 1", "Win 2"]
  },
  "_demoInsights_type": "objectForm",
  "_demoInsights_fields": {
    "demosThisWeek": { "type": "number", "label": "Demos This Week" },
    "hoursInvested": { "type": "number", "label": "Hours Invested" },
    "topRequests": { "type": "list", "label": "Top Requests" },
    "wins": { "type": "list", "label": "Wins" }
  }
}
```

### Component Architecture

**Before (Custom Rendering):**

```tsx
// OrganizationModal.tsx - OLD
<section>
  <h3>Strategic Projects</h3>
  <div className="space-y-4">
    {organization.strategicProjects.map(project => (
      <div className="bg-white...">
        <h4>{project.name}</h4>
        <span className={getStatusColor(project.status)}>{project.status}</span>
        <div className="progress-bar">
          <div style={{ width: `${project.progress}%` }} />
        </div>
        <RichText>{project.executiveSummary}</RichText>
      </div>
    ))}
  </div>
</section>
```

**After (RenderFactory):**

```tsx
// OrganizationModal.tsx - NEW
<section>
  <h3>Strategic Projects</h3>
  <RenderFactory
    fieldKey="strategicProjects"
    value={organization.strategicProjects}
    onChange={() => {}} // Read-only in display mode
    mode="display"
    schema={{
      renderAs: organization._strategicProjects_type || 'nestedCards',
      fields: organization._strategicProjects_fields
    }}
  />
</section>
```

---

## Section Types

### 1. Key Highlights (List)

**Type:** `list`

**Data Structure:**
```json
{
  "keyHighlights": [
    "{{badge:success}} Achievement with {{bold:formatting}}",
    "{{trend:up}} Metric increased {{delta:15}}%"
  ],
  "_keyHighlights_type": "list",
  "_enabled_keyHighlights": true
}
```

**Renderer:** `ListRenderer`

**Expressions Supported:** All (badge, icon, trend, delta, bold, highlight, currency, etc.)

---

### 2. Strategic Projects (Nested Cards)

**Type:** `nestedCards`

**Data Structure:**
```json
{
  "strategicProjects": [
    {
      "id": "proj-001",
      "name": "Project Name",
      "status": "on-track" | "at-risk" | "delayed" | "completed",
      "progress": 75,
      "owner": "Owner Name",
      "dueDate": "2024-12-31",
      "executiveSummary": "Description with {{expressions}}"
    }
  ],
  "_strategicProjects_type": "nestedCards",
  "_strategicProjects_fields": {
    "name": { "type": "text", "label": "Project Name", "required": true },
    "status": { 
      "type": "select", 
      "label": "Status", 
      "options": ["on-track", "at-risk", "delayed", "completed"] 
    },
    "progress": { "type": "number", "label": "Progress %", "min": 0, "max": 100 },
    "owner": { "type": "text", "label": "Owner" },
    "dueDate": { "type": "date", "label": "Due Date" },
    "executiveSummary": { "type": "textarea", "label": "Executive Summary" }
  }
}
```

**Renderer:** `NestedCardsRenderer`

**Features:**
- Card header shows `name` field
- All other fields displayed in card body
- Expression parsing in text fields
- Status badges automatically styled

---

### 3. Support Activities (Nested Cards)

**Type:** `nestedCards`

**Data Structure:**
```json
{
  "supportActivities": [
    {
      "id": "sup-001",
      "type": "incident" | "request" | "enhancement",
      "title": "Activity title",
      "priority": "critical" | "high" | "medium" | "low",
      "status": "active" | "resolved" | "blocked",
      "description": "Description text",
      "impact": "Impact statement"
    }
  ],
  "_supportActivities_type": "nestedCards",
  "_supportActivities_fields": {
    "type": { 
      "type": "select", 
      "label": "Type", 
      "options": ["incident", "request", "enhancement"] 
    },
    "title": { "type": "text", "label": "Title", "required": true },
    "priority": { 
      "type": "select", 
      "label": "Priority", 
      "options": ["critical", "high", "medium", "low"] 
    },
    "status": { 
      "type": "select", 
      "label": "Status", 
      "options": ["active", "resolved", "blocked"] 
    },
    "description": { "type": "textarea", "label": "Description" },
    "impact": { "type": "text", "label": "Impact" }
  }
}
```

**Renderer:** `NestedCardsRenderer`

---

### 4. Demo Insights (Object Form)

**Type:** `objectForm`

**Data Structure:**
```json
{
  "demoInsights": {
    "demosThisWeek": 16,
    "hoursInvested": 142,
    "topRequests": [
      "Request type 1",
      "Request type 2"
    ],
    "wins": [
      "Win description 1",
      "Win description 2"
    ]
  },
  "_demoInsights_type": "objectForm",
  "_demoInsights_fields": {
    "demosThisWeek": { "type": "number", "label": "Demos This Week" },
    "hoursInvested": { "type": "number", "label": "Hours Invested" },
    "topRequests": { "type": "list", "label": "Top Requests" },
    "wins": { "type": "list", "label": "Wins" }
  }
}
```

**Renderer:** `ObjectFormRenderer`

**Note:** Uses `objectForm` instead of `nestedCards` because the data is a single object, not an array.

---

## Expression Parsing Integration

### Renderer Updates

Three renderers were updated to parse expressions in display mode:

#### ListRenderer

```tsx
// Before
<span>{item}</span>

// After
<span>{renderWithExpressions(item)}</span>
```

#### NestedCardsRenderer

```tsx
// Before
<p>{String(fieldValue)}</p>

// After
<p>{renderWithExpressions(String(fieldValue))}</p>
```

#### ObjectFormRenderer

```tsx
// Before
<p>{String(fieldValue)}</p>

// After
<p>{renderWithExpressions(String(fieldValue))}</p>
```

### Expression Parser

The expression parser (`src/utils/expressionParser.tsx`) already supported both syntaxes:
- `{{type:value}}` - Organizations syntax
- `[[type]]value[[/type]]` - Summaries syntax

**No converter needed** - both syntaxes work in the same files.

---

## Migration Process

### Step 1: Add Metadata to JSON Files

For each organization file, add metadata after each data section:

```json
{
  "keyHighlights": [ /* data */ ],
  "_keyHighlights_type": "list",
  "_enabled_keyHighlights": true,
  "_completed_keyHighlights": false,
  
  "strategicProjects": [ /* data */ ],
  "_strategicProjects_type": "nestedCards",
  "_strategicProjects_fields": { /* field definitions */ },
  "_enabled_strategicProjects": true,
  "_completed_strategicProjects": false
}
```

### Step 2: Update Component

Replace custom rendering with RenderFactory:

```tsx
{/* Old: Custom rendering */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {organization.keyHighlights.map((highlight, index) => (
    <div key={index} className="...">
      <p><RichText>{highlight}</RichText></p>
    </div>
  ))}
</div>

{/* New: RenderFactory */}
<RenderFactory
  fieldKey="keyHighlights"
  value={organization.keyHighlights}
  onChange={() => {}}
  mode="display"
  schema={{
    renderAs: organization._keyHighlights_type || 'list',
    fields: organization._keyHighlights_fields
  }}
/>
```

### Step 3: Test

1. Open organization in browser
2. Verify all sections render correctly
3. Check expression parsing works (badges, icons, etc.)
4. Test all 4 organizations

---

## Files Modified

### Data Files (4)
- `src/data/organizations/banking-na.json`
- `src/data/organizations/payments.json`
- `src/data/organizations/int-banking.json`
- `src/data/organizations/capital-markets.json`

### Components (1)
- `src/components/OrganizationModal.tsx` (271 → 151 lines)

### Renderers (3)
- `src/renderers/ListRenderer.tsx` (added expression parsing)
- `src/renderers/NestedCardsRenderer.tsx` (added expression parsing)
- `src/renderers/ObjectFormRenderer.tsx` (added expression parsing)

---

## Benefits

### Code Reduction
- **44% reduction** in OrganizationModal code
- Removed duplicate rendering logic
- Removed helper functions (getStatusColor, getPriorityColor)

### Unified Architecture
- Organizations and Summaries use same renderers
- One change updates both systems
- Consistent styling and behavior

### Expression Support
- All expression types now work in Organizations
- Badges, icons, trends, deltas, metrics, currency
- Same parser handles both `{{}}` and `[[]]` syntax

### Future-Proof
- New render types automatically available
- Chart support ready to add
- Template Builder integration possible

---

## Future Enhancements

### CMS Integration (Optional)

Organizations could be edited via CMS Admin:

1. **Create Template:** `organization-template-v1.json`
2. **Add to Template Builder:** Organization asset type
3. **Enable Editing:** Add organizations to CMS editor

### Additional Render Types

Organizations could use other render types:

```json
{
  "projectTimeline": [ /* data */ ],
  "_projectTimeline_type": "lineChart",
  "_projectTimeline_chartConfig": { /* ... */ }
}
```

### Custom Fields

Add organization-specific fields:

```json
{
  "region": "North America",
  "_region_type": "text",
  
  "teamSize": 45,
  "_teamSize_type": "number"
}
```

---

## Troubleshooting

### Section Not Rendering

**Check:**
1. `_enabled_sectionName` is not `false`
2. `_sectionName_type` is specified
3. Data structure matches render type (array for nestedCards, object for objectForm)

### Expressions Not Parsing

**Check:**
1. Renderer calls `renderWithExpressions()` in display mode
2. Expression syntax is valid: `{{type:value}}`
3. Import statement: `import { renderWithExpressions } from '../utils/expressionParser'`

### Fields Not Displaying

**Check:**
1. `_sectionName_fields` is defined for complex types
2. Field names in `_fields` match data keys
3. Field types are valid (text, number, date, textarea, list)

---

## Related Documentation

- [Metadata Schema Reference](../reference/metadata-schema.md)
- [Render Type Catalog](../reference/render-types.md)
- [Expression Syntax Reference](../user-guides/expression-syntax.md)
- [Adding New Assets](./adding-new-assets.md)

---

*Last Updated: November 8, 2025*
*Change Request: CR-001*
