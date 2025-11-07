# FIS Executive Summary - Design System

## Overview
Centralized design system for consistent styling across the application. No more guessing "what color should this be?" - the design system defines all UI patterns.

## Quick Start

```tsx
import { getClasses, DesignSystem } from '../design-system/colors';

// Use helper functions for common patterns
<span className={getClasses.label()}>Revenue:</span>
<span className={getClasses.value()}>$2.5M</span>

// Or use design system directly for custom combinations
<div className={`${DesignSystem.card.primary.combined} p-6`}>
  <h2 className={getClasses.h1()}>Dashboard</h2>
</div>
```

## Design Patterns

### Labels (Field Names)
**Use case:** "Demos Registered:", "Revenue:", "Support %", etc.

```tsx
<span className={getClasses.label()}>Field Name:</span>
// Renders: text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry
```

### Values (Data Display)
**Use case:** The actual data paired with labels

```tsx
<span className={getClasses.value()}>263</span>
// Renders: text-sm text-gray-900 dark:text-white font-roobert-medium

// For large metric values
<span className={getClasses.valueHeavy()}>$2.5M</span>
// Renders: text-2xl text-gray-900 dark:text-white font-roobert-heavy
```

### Headings

```tsx
// Primary heading (page titles, main sections)
<h1 className={getClasses.h1()}>Executive Summary</h1>

// Secondary heading (subsections)
<h2 className={getClasses.h2()}>Key Metrics</h2>
```

### Body Text

```tsx
// Regular body text
<p className={getClasses.text()}>This is regular content</p>

// Muted text (less important information)
<p className={getClasses.textMuted()}>Optional details</p>
```

### Buttons

```tsx
// Primary action button
<button className={getClasses.buttonPrimary()}>
  Save Changes
</button>

// Secondary action button
<button className={getClasses.buttonSecondary()}>
  Cancel
</button>
```

### Input Fields

```tsx
<input
  type="text"
  className={getClasses.input()}
  placeholder="Enter value..."
/>
```

### Cards & Containers

```tsx
// Primary card (white bg, shadow)
<div className={getClasses.card()}>
  Content here
</div>

// Glass effect card
<div className={DesignSystem.card.glass}>
  Content here
</div>
```

### Help Text & Hints

```tsx
<p className={getClasses.hint()}>
  This field is optional
</p>
```

## Direct DesignSystem Access

For more control, use `DesignSystem` directly:

### Labels
```tsx
DesignSystem.label.combined
// "text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry"
```

### Status Indicators
```tsx
// Success state
<div className={DesignSystem.status.success.bg}>
  <span className={DesignSystem.status.success.text}>✓ Complete</span>
</div>

// Error state
<div className={DesignSystem.status.error.bg}>
  <span className={DesignSystem.status.error.text}>✗ Failed</span>
</div>
```

### Badges
```tsx
<span className={`px-2 py-1 rounded ${DesignSystem.badge.primary}`}>
  New
</span>
```

### Borders
```tsx
<div className={`border ${DesignSystem.border.medium}`}>
  Content with border
</div>
```

## Color Tokens

For direct color access:

```tsx
import { Colors } from '../design-system/colors';

// Access brand colors
Colors.eggplant  // '#552583'
Colors.raspberry // '#e31c79'
Colors.navy      // '#002f6c'
Colors.green     // '#3bcd3e'

// Access gray scale
Colors.gray500   // '#6b7280'
```

## Renderer Usage Example

```tsx
import { getClasses, DesignSystem } from '../design-system/colors';

export const MyRenderer = ({ value, mode }) => {
  if (mode === 'display') {
    return (
      <div className="space-y-1.5">
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="flex items-baseline gap-2">
            {/* Label uses design system */}
            <span className={getClasses.label()}>{key}:</span>
            
            {/* Value uses design system */}
            <span className={getClasses.value()}>{val}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={getClasses.card()}>
      <input
        type="text"
        className={getClasses.input()}
        placeholder="Enter value"
      />
      <p className={getClasses.hint()}>Optional help text</p>
    </div>
  );
};
```

## Benefits

1. **Consistency** - All labels look the same everywhere
2. **Maintainability** - Change colors in one place, updates everywhere
3. **Documentation** - Clear purpose for each style
4. **Type Safety** - TypeScript autocomplete for all styles
5. **Dark Mode** - Automatically handled with `combined` variants

## Rules

### When to use what:

| Element | Use | Example |
|---------|-----|---------|
| Field labels | `getClasses.label()` | "Revenue:", "Demos Registered:" |
| Data values | `getClasses.value()` | "263", "$2.5M", "95%" |
| Section titles | `getClasses.h1()` or `h2()` | "Key Metrics", "Dashboard" |
| Help text | `getClasses.hint()` | "This field is required" |
| Buttons | `getClasses.buttonPrimary()` | Save, Submit, Create |
| Cancel buttons | `getClasses.buttonSecondary()` | Cancel, Back, Close |
| Input fields | `getClasses.input()` | All text inputs, textareas, selects |
| Cards | `getClasses.card()` | Container backgrounds |

### Don't:
- ❌ Hardcode colors: `text-purple-600`
- ❌ Mix inconsistent styles: `text-sm` in one place, `text-xs` in another for the same purpose
- ❌ Create custom label styles: Use `getClasses.label()` always

### Do:
- ✅ Use design system: `getClasses.label()`
- ✅ Be consistent: Same element type = same style
- ✅ Add new patterns to the design system if needed

## Extending the Design System

Need a new pattern? Add it to `colors.ts`:

```typescript
export const getClasses = {
  // ... existing classes ...
  
  // Add new pattern
  myNewPattern: () => `text-sm font-roobert-regular ${DesignSystem.body.primary.combined}`,
} as const;
```

Then document it here and use it everywhere!
