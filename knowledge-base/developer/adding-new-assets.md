# Adding New Asset Types - Complete Guide

**Learn how to add new render types to the Executive Summary Platform**

This guide walks through every step required to add a new asset type to both the frontend viewer and CMS admin.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Process](#step-by-step-process)
4. [Example: Adding a Progress Bar Asset](#example-adding-a-progress-bar-asset)
5. [Testing Your New Asset](#testing-your-new-asset)
6. [Troubleshooting](#troubleshooting)

---

## Overview

### What is an Asset Type?

An **asset type** (also called a "render type") defines how a piece of content is displayed. Examples:
- `text` - Simple text input
- `nestedCards` - Expandable card list
- `pieChart` - Pie chart visualization
- `hr` - Horizontal divider line

### System Components to Update

When adding a new asset type, you'll need to update **5 key areas**:

```
1. Type Definitions (TypeScript interfaces)
   ↓
2. Renderer Component (React component)
   ↓
3. RenderFactory (Routing logic)
   ↓
4. Template Builder (Asset Library)
   ↓
5. Engine Assets Modal (Examples)
```

---

## Prerequisites

**Required Knowledge:**
- React functional components
- TypeScript interfaces
- JSON schema structure

**Files You'll Be Editing:**
- `src/types/schema.ts`
- `src/renderers/[YourRenderer].tsx`
- `src/renderers/RenderFactory.tsx`
- `cms-admin/src/components/TemplateBuilder.tsx`
- `cms-admin/src/components/EngineAssetsModal.tsx`

---

## Step-by-Step Process

### Step 1: Define Type Interfaces

**File:** `src/types/schema.ts`

Add your new render type to the `RenderType` union and create a config interface if needed.

```typescript
// 1. Add to RenderType union
export type RenderType = 
  | 'text'
  | 'textarea'
  | 'number'
  // ... existing types
  | 'progressBar'  // ← Your new type
  | 'hr';

// 2. Create a config interface (if your type needs configuration)
export interface ProgressBarConfig {
  max: number;
  showPercentage: boolean;
  color?: string;
  height?: number;
}

// 3. Add config to FieldSchema interface
export interface FieldSchema {
  // ... existing properties
  progressBarConfig?: ProgressBarConfig;  // ← Add this
}
```

**When to create a config interface:**
- If your asset needs customization options
- Examples: chart colors, bar height, display format
- Simple types (like plain text) don't need configs

---

### Step 2: Create the Renderer Component

**File:** `src/renderers/ProgressBarRenderer.tsx` (new file)

Create a React component that renders your asset type.

```typescript
import React from 'react';
import type { RendererProps } from '../types';

export const ProgressBarRenderer: React.FC<RendererProps> = ({
  value,
  schema,
  mode = 'display'
}) => {
  // Extract configuration
  const config = schema.progressBarConfig || {
    max: 100,
    showPercentage: true,
    color: '#6B1B5E',
    height: 24
  };

  // Parse value (could be number or string)
  const numValue = typeof value === 'number' ? value : parseInt(value || '0');
  const percentage = Math.min((numValue / config.max) * 100, 100);

  // Edit mode: Show input
  if (mode === 'edit') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
          {schema.label}
        </label>
        <input
          type="number"
          value={numValue}
          className="w-full px-3 py-2 rounded border"
          readOnly
        />
      </div>
    );
  }

  // Display mode: Show progress bar
  return (
    <div className="space-y-2">
      {schema.label && (
        <div className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
          {schema.label}
        </div>
      )}
      <div 
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        style={{ height: config.height }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: config.color
          }}
        />
      </div>
      {config.showPercentage && (
        <div className="text-xs text-gray-600 dark:text-gray-400 text-right">
          {numValue} / {config.max} ({percentage.toFixed(0)}%)
        </div>
      )}
    </div>
  );
};
```

**Key Points:**
- Accept `RendererProps` with `value`, `schema`, `mode`
- Support both `edit` and `display` modes
- Use Tailwind classes for styling
- Extract config with defaults
- Handle dark mode with `dark:` classes

---

### Step 3: Register in RenderFactory

**File:** `src/renderers/RenderFactory.tsx`

Add routing logic to send your render type to the correct component.

```typescript
// 1. Import your renderer
import { ProgressBarRenderer } from './ProgressBarRenderer';

// 2. Add case in the switch statement
export const RenderFactory: React.FC<RendererProps> = (props) => {
  const renderType = props.schema.renderAs;

  switch (renderType) {
    case 'text':
      return <TextRenderer {...props} />;
    
    // ... existing cases
    
    case 'progressBar':
      return <ProgressBarRenderer {...props} />;  // ← Add this
    
    case 'hr':
      return <HorizontalRuleRenderer {...props} />;
    
    default:
      return <TextRenderer {...props} />;
  }
};
```

---

### Step 4: Add to Template Builder Asset Library

**File:** `cms-admin/src/components/TemplateBuilder.tsx`

Add your asset to the drag-and-drop library so users can add it to templates.

```typescript
const ASSET_LIBRARY: AssetCategory[] = [
  // ... existing categories
  {
    id: 'basic',
    name: 'Basic Inputs',
    icon: Type,
    color: 'blue',
    assets: [
      // ... existing assets
      {
        id: 'progressBar',
        name: 'Progress Bar',
        renderType: 'progressBar',
        description: 'Visual progress indicator',
        schema: {
          type: 'number',
          label: 'Progress',
          renderAs: 'progressBar',
          progressBarConfig: {
            max: 100,
            showPercentage: true,
            color: '#6B1B5E',
            height: 24
          }
        } as any  // Type assertion for custom schemas
      }
    ]
  }
];
```

**Choosing a Category:**
- `basic` - Simple inputs (text, number, date)
- `lists` - Array-based types (lists, nested cards)
- `complex` - Advanced structures (objects, key-value pairs)
- `rich` - Rich content (markdown, expressions)
- `charts` - Data visualizations
- `layout` - Structural elements (HR)

---

### Step 5: Add Example to Engine Assets Modal

**File:** `cms-admin/src/components/EngineAssetsModal.tsx`

Add a working example so users can see how your asset looks.

```typescript
const EXAMPLES: RenderExample[] = [
  // ... existing examples
  {
    id: 'progressBar',
    name: 'Progress Bar',
    category: 'basic',
    description: 'Visual progress indicator with percentage',
    useCase: 'Project completion, goals, milestones',
    schema: {
      renderAs: 'progressBar',
      label: 'Project Completion',
      progressBarConfig: {
        max: 100,
        showPercentage: true,
        color: '#6B1B5E',
        height: 24
      }
    },
    sampleData: 75  // Progress value
  }
];
```

The modal will automatically render your example using RenderFactory.

---

## Example: Adding a Progress Bar Asset

Let's walk through a complete real-world example.

### Goal
Add a progress bar component that shows completion percentage with a colored bar.

### Implementation

#### 1. Type Definition (`src/types/schema.ts`)

```typescript
export type RenderType = 
  | 'text'
  | 'progressBar'  // NEW
  | 'hr';

export interface ProgressBarConfig {
  max: number;
  showPercentage: boolean;
  color?: string;
  height?: number;
}

export interface FieldSchema {
  // ... existing
  progressBarConfig?: ProgressBarConfig;  // NEW
}
```

#### 2. Create Renderer (`src/renderers/ProgressBarRenderer.tsx`)

```typescript
import React from 'react';
import type { RendererProps } from '../types';

export const ProgressBarRenderer: React.FC<RendererProps> = ({
  value,
  schema,
  mode = 'display'
}) => {
  const config = schema.progressBarConfig || {
    max: 100,
    showPercentage: true,
    color: '#6B1B5E',
    height: 24
  };

  const numValue = typeof value === 'number' ? value : parseInt(value || '0');
  const percentage = Math.min((numValue / config.max) * 100, 100);

  if (mode === 'edit') {
    return (
      <input
        type="number"
        value={numValue}
        className="w-full px-3 py-2 rounded border"
        readOnly
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{schema.label}</div>
      <div 
        className="w-full bg-gray-200 rounded-full"
        style={{ height: config.height }}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: config.color
          }}
        />
      </div>
      {config.showPercentage && (
        <div className="text-xs text-gray-600">
          {numValue} / {config.max}
        </div>
      )}
    </div>
  );
};
```

#### 3. Update RenderFactory

```typescript
import { ProgressBarRenderer } from './ProgressBarRenderer';

// In switch statement:
case 'progressBar':
  return <ProgressBarRenderer {...props} />;
```

#### 4. Add to Template Builder

```typescript
{
  id: 'progressBar',
  name: 'Progress Bar',
  renderType: 'progressBar',
  description: 'Visual progress indicator',
  schema: {
    type: 'number',
    label: 'Progress',
    renderAs: 'progressBar',
    progressBarConfig: {
      max: 100,
      showPercentage: true
    }
  } as any
}
```

#### 5. Add Example to Engine Assets Modal

```typescript
{
  id: 'progressBar',
  name: 'Progress Bar',
  category: 'basic',
  description: 'Visual progress indicator',
  useCase: 'Completion tracking',
  schema: {
    renderAs: 'progressBar',
    label: 'Project Progress',
    progressBarConfig: { max: 100, showPercentage: true }
  },
  sampleData: 75
}
```

### Testing

1. **Template Builder:**
   - Open CMS Admin → Template Builder
   - Drag "Progress Bar" onto canvas
   - Verify it appears in section

2. **Editor:**
   - Create a test summary with progress bar
   - Enter a value (e.g., 75)
   - Verify it saves correctly

3. **Frontend:**
   - View the summary
   - Confirm progress bar displays correctly
   - Check dark mode rendering

---

## Testing Your New Asset

### Checklist

- [ ] TypeScript compiles without errors
- [ ] Asset appears in Template Builder asset library
- [ ] Can drag asset into template
- [ ] Example appears in Engine Assets Modal with live preview
- [ ] Edit mode works in EditorModalV2
- [ ] Display mode works in frontend viewer
- [ ] Dark mode styling looks correct
- [ ] Responsive design works on mobile
- [ ] JSON saves with correct metadata structure

### Test JSON Structure

Your asset should produce this metadata pattern:

```json
{
  "projectProgress": 75,
  "_projectProgress_type": "progressBar",
  "_projectProgress_config": {
    "max": 100,
    "showPercentage": true,
    "color": "#6B1B5E"
  },
  "_enabled_projectProgress": true,
  "_completed_projectProgress": false
}
```

---

## Troubleshooting

### Common Issues

#### Asset doesn't appear in Template Builder
- Check: Did you add it to `ASSET_LIBRARY` array?
- Check: Is the category ID correct?
- Check: Did you restart the dev server?

#### "Cannot find module" error
- Check: Did you export the renderer component?
- Check: Is the import path correct in RenderFactory?
- Check: Are there TypeScript errors in the renderer file?

#### Asset renders as plain text
- Check: Did you add the case to RenderFactory switch statement?
- Check: Is `schema.renderAs` set correctly?
- Check: Does the renderType match exactly (case-sensitive)?

#### Edit mode doesn't work
- Check: Does your renderer handle `mode === 'edit'`?
- Check: Are you using RendererProps correctly?

#### Dark mode styling broken
- Check: Did you add `dark:` variants to Tailwind classes?
- Check: Are colors defined for both light and dark modes?

---

## Advanced Topics

### Supporting CMS-Specific Renderers

Some assets need different behavior in the CMS. Create a separate CMS renderer:

**File:** `cms-admin/src/renderers/ProgressBarRenderer.tsx`

```typescript
import React from 'react';

interface Props {
  value: any;
  onChange: (value: any) => void;
  schema: any;
  isEditMode: boolean;
}

export const ProgressBarRenderer: React.FC<Props> = ({
  value,
  onChange,
  schema,
  isEditMode
}) => {
  // CMS-specific implementation with onChange support
  if (isEditMode) {
    return (
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        max={schema.progressBarConfig?.max || 100}
      />
    );
  }
  
  // Display mode (same as frontend)
  return <div>...</div>;
};
```

Then import the CMS version in CMS components.

### Configuration UI in Template Builder

Allow users to configure your asset in Template Builder:

```typescript
// Add configuration UI when field is selected
{selectedField && selectedField.renderType === 'progressBar' && (
  <div className="space-y-2">
    <label>Max Value</label>
    <input
      type="number"
      value={selectedField.schema.progressBarConfig?.max || 100}
      onChange={(e) => updateFieldConfig('max', parseInt(e.target.value))}
    />
    <label>
      <input
        type="checkbox"
        checked={selectedField.schema.progressBarConfig?.showPercentage}
        onChange={(e) => updateFieldConfig('showPercentage', e.target.checked)}
      />
      Show Percentage
    </label>
  </div>
)}
```

---

## Summary

Adding a new asset type requires updating **5 key files**:

1. ✅ **Type definitions** - `src/types/schema.ts`
2. ✅ **Renderer component** - `src/renderers/[Type]Renderer.tsx`
3. ✅ **RenderFactory routing** - `src/renderers/RenderFactory.tsx`
4. ✅ **Template Builder asset** - `cms-admin/src/components/TemplateBuilder.tsx`
5. ✅ **Engine Assets example** - `cms-admin/src/components/EngineAssetsModal.tsx`

Follow this pattern consistently and your new assets will integrate seamlessly!

---

**Related Guides:**
- [Metadata Schema Reference](../reference/metadata-schema.md)
- [Render Types Catalog](../reference/render-types.md)
- [Component Library](../reference/component-library.md)

---

*Last Updated: November 8, 2025*
