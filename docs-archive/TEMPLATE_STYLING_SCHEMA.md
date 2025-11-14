# Template Styling Schema

## Overview
This document defines how asset templates declare their visual design requirements. Templates use metadata fields to specify all styling decisions, eliminating the need for content creators to make visual choices.

## Design Philosophy
- **Template-Driven**: All styling decisions are defined in the template
- **Content-Agnostic**: Content creators only provide data
- **Renderer Intelligence**: Renderers read template metadata and apply design system values
- **Central Registry**: All design constants come from the design system

## Template Metadata Structure

### Current Metadata (Existing)
```json
{
  "sectionName": [...data...],
  "_sectionName_type": "pieChart",           // Content type
  "_sectionName_columnSpan": 2,              // Layout
  "_sectionName_fields": {...},              // Field schema
  "_sectionName_chartConfig": {...},         // Chart-specific config
  "_enabled_sectionName": true,              // Visibility
  "_completed_sectionName": false            // CMS status
}
```

### New Styling Metadata (Proposed)

#### 1. Typography Metadata
```json
{
  "_sectionName_typography": {
    "sectionTitle": "header",        // Design system typography key
    "sectionSubtitle": "subtitle",   // Design system typography key
    "cardTitle": "title",            // Design system typography key
    "cardLabel": "label",            // Design system typography key
    "cardBody": "body",              // Design system typography key
    "chartLabel": "label",           // Design system typography key
    "chartValue": "header"           // Design system typography key
  }
}
```

#### 2. Color Metadata
```json
{
  "_sectionName_colors": {
    "background": "surface",         // Design system color key
    "border": "border.default",      // Design system color key
    "title": "text.primary",         // Design system color key
    "accent": "brand.primary",       // Design system color key
    "chartColors": ["brand.primary", "brand.secondary", "accent.tertiary"]
  }
}
```

#### 3. Spacing Metadata
```json
{
  "_sectionName_spacing": {
    "container": "card",             // Design system spacing pattern
    "sectionGap": "section.gap",     // Design system spacing key
    "contentGap": "section.content", // Design system spacing key
    "itemGap": "component.gap"       // Design system spacing key
  }
}
```

#### 4. Layout Metadata (Enhanced)
```json
{
  "_sectionName_layout": {
    "columnSpan": 2,                 // Grid columns (1-4)
    "gridCols": 2,                   // Internal grid columns for content
    "alignment": "start",            // start | center | end
    "distribution": "space-between", // flex distribution
    "overflow": "auto"               // How to handle overflow
  }
}
```

#### 5. Visual Style Metadata
```json
{
  "_sectionName_style": {
    "variant": "elevated",           // flat | elevated | outlined | glass
    "shadow": "md",                  // sm | md | lg | xl | none
    "rounded": "lg",                 // sm | md | lg | xl | full | none
    "border": "default",             // none | default | strong | accent
    "opacity": 1.0                   // 0.0 - 1.0
  }
}
```

## Complete Example: Chart Section with Styling

```json
{
  "budgetAllocation": [
    {
      "name": "Engineering",
      "value": 450000
    },
    {
      "name": "Marketing",
      "value": 250000
    }
  ],
  
  // === CONTENT TYPE & STRUCTURE ===
  "_budgetAllocation_type": "pieChart",
  "_budgetAllocation_fields": {
    "name": {
      "type": "text",
      "label": "Category",
      "required": true
    },
    "value": {
      "type": "number",
      "label": "Amount",
      "required": true
    }
  },
  "_budgetAllocation_chartConfig": {
    "nameKey": "name",
    "dataKey": "value"
  },
  
  // === VISUAL DESIGN ===
  "_budgetAllocation_typography": {
    "sectionTitle": "header",
    "chartLabel": "label",
    "chartValue": "header",
    "tableHeader": "label",
    "tableBody": "body"
  },
  
  "_budgetAllocation_colors": {
    "background": "surface.card",
    "border": "border.subtle",
    "title": "text.primary",
    "chartColors": ["brand.primary", "brand.secondary", "accent.tertiary", "accent.quaternary"]
  },
  
  "_budgetAllocation_spacing": {
    "container": "card",
    "sectionGap": "section.gap",
    "contentGap": "component.gap",
    "chartTableGap": "component.tight"
  },
  
  "_budgetAllocation_layout": {
    "columnSpan": 2,
    "gridCols": 1,
    "alignment": "start"
  },
  
  "_budgetAllocation_style": {
    "variant": "elevated",
    "shadow": "md",
    "rounded": "lg",
    "border": "subtle"
  },
  
  // === CMS METADATA ===
  "_enabled_budgetAllocation": true,
  "_completed_budgetAllocation": false
}
```

## Complete Example: Nested Cards Section with Styling

```json
{
  "departments": [
    {
      "name": "Engineering",
      "performance": 92,
      "budget": 450000,
      "achievements": [
        "Completed Q1 infrastructure upgrade",
        "Reduced deployment time by 40%"
      ]
    }
  ],
  
  // === CONTENT TYPE & STRUCTURE ===
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
    "achievements": {
      "type": "list",
      "label": "Achievements"
    }
  },
  
  // === VISUAL DESIGN ===
  "_departments_typography": {
    "sectionTitle": "header",
    "cardTitle": "title",
    "cardLabel": "label",
    "cardValue": "body",
    "listItem": "body"
  },
  
  "_departments_colors": {
    "background": "surface.card",
    "cardBackground": "surface.elevated",
    "border": "border.default",
    "title": "text.primary",
    "label": "text.secondary",
    "value": "text.primary",
    "accent": "brand.primary"
  },
  
  "_departments_spacing": {
    "container": "card",
    "sectionGap": "section.gap",
    "cardGap": "component.gap",
    "cardPadding": "card",
    "listGap": "component.tight"
  },
  
  "_departments_layout": {
    "columnSpan": 2,
    "gridCols": 2,
    "cardMinWidth": "280px",
    "alignment": "stretch"
  },
  
  "_departments_style": {
    "variant": "elevated",
    "shadow": "sm",
    "rounded": "lg",
    "border": "none",
    "cardShadow": "md",
    "cardRounded": "md"
  },
  
  // === CMS METADATA ===
  "_enabled_departments": true,
  "_completed_departments": false
}
```

## Renderer Implementation Pattern

### Current Pattern (Manual Styling)
```tsx
export const PieChartRenderer = ({ schema, data }) => {
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-gray-900">
        {schema.label}
      </h3>
      {/* Manual hardcoded styling */}
    </div>
  );
};
```

### New Pattern (Template-Driven Styling)
```tsx
import { getTypography, getColor, getSpacing, getStyle } from '@/design-system';

export const PieChartRenderer = ({ schema, data, metadata }) => {
  // Read styling from template metadata
  const typo = metadata._typography || {};
  const colors = metadata._colors || {};
  const spacing = metadata._spacing || {};
  const style = metadata._style || {};
  
  // Apply design system values based on template
  return (
    <div className={cn(
      getSpacing(spacing.container || 'card'),
      getStyle.variant(style.variant || 'elevated'),
      getStyle.shadow(style.shadow || 'md'),
      getStyle.rounded(style.rounded || 'lg')
    )}>
      <h3 className={cn(
        getTypography(typo.sectionTitle || 'header'),
        getColor(colors.title || 'text.primary')
      )}>
        {schema.label}
      </h3>
      {/* All styling from template metadata */}
    </div>
  );
};
```

## Design System Keys Reference

### Typography Keys
- `header` - Main section headers
- `title` - Card/component titles
- `subtitle` - Secondary headings
- `label` - Field labels
- `body` - Body text
- `info` - Info text (blue)
- `warning` - Warning text (yellow)
- `success` - Success text (green)
- `error` - Error text (red)

### Color Keys
- `brand.primary` - Primary brand color
- `brand.secondary` - Secondary brand color
- `accent.tertiary` - Tertiary accent
- `accent.quaternary` - Quaternary accent
- `surface.base` - Base surface
- `surface.card` - Card surface
- `surface.elevated` - Elevated surface
- `border.subtle` - Subtle border
- `border.default` - Default border
- `border.strong` - Strong border
- `text.primary` - Primary text
- `text.secondary` - Secondary text
- `text.tertiary` - Tertiary text

### Spacing Keys
- `container.main` - Main container padding
- `container.card` - Card container padding
- `section.gap` - Gap between sections
- `section.content` - Content spacing
- `component.gap` - Gap between components
- `component.tight` - Tight component spacing

### Style Variants
- `flat` - No elevation, flat design
- `elevated` - Shadow elevation
- `outlined` - Border outline
- `glass` - Glassmorphism effect

## Migration Strategy

### Phase 1: Extend Templates with Defaults
Add styling metadata to existing templates with sensible defaults that match current design.

### Phase 2: Update Renderers
Enhance renderers to read and apply template styling metadata.

### Phase 3: Enable Customization
Allow template authors to customize styling per section while content creators remain focused on data.

### Phase 4: Deprecate Hardcoded Styles
Remove hardcoded styling from renderers, making them pure template consumers.

## Benefits

1. **Consistency**: All styling decisions centralized in templates
2. **Flexibility**: Change entire look by updating template, not code
3. **Separation of Concerns**: Content creators focus on data, template authors focus on design
4. **Maintainability**: Single source of truth for visual design
5. **Scalability**: Easy to create new templates with different visual styles
6. **Theming**: Support light/dark themes by swapping design system values

## Template Validation

Templates should be validated to ensure styling metadata references valid design system keys:

```typescript
interface TemplateValidation {
  typography: string[];  // Valid typography keys
  colors: string[];      // Valid color keys
  spacing: string[];     // Valid spacing keys
  variants: string[];    // Valid style variants
}

validateTemplateMetadata(template, validationSchema);
```

## Next Steps

1. Complete design system implementation:
   - Typography schema
   - Color hierarchy
   - Style variants
   
2. Create template migration tool:
   - Add default styling metadata to existing templates
   
3. Enhance renderers:
   - Update to consume template styling metadata
   
4. Documentation:
   - Template authoring guide
   - Design system reference
   - Migration guide
