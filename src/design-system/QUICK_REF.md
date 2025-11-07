# Design System - Quick Reference

## Import Options

```tsx
// Option 1: Using alias (CMS app)
import { getClasses } from '@design-system';

// Option 2: Relative path (main app or if alias not working)
import { getClasses } from '../design-system';
import { getClasses } from '../../src/design-system';
```

## Common Patterns

### Label + Value Pair (Most Common!)
```tsx
<div className="flex items-baseline gap-2">
  <span className={getClasses.label()}>Revenue:</span>
  <span className={getClasses.value()}>$2.5M</span>
</div>
```

### Section Heading
```tsx
<h2 className={getClasses.h1()}>Key Metrics</h2>
```

### Input Field
```tsx
<input
  type="text"
  className={getClasses.input()}
  placeholder="Enter value..."
/>
```

### Button Group
```tsx
<div className="flex gap-2">
  <button className={getClasses.buttonPrimary()}>
    Save
  </button>
  <button className={getClasses.buttonSecondary()}>
    Cancel
  </button>
</div>
```

### Card Container
```tsx
<div className={getClasses.card()}>
  <h3 className={getClasses.h2()}>Card Title</h3>
  <p className={getClasses.text()}>Card content...</p>
</div>
```

### Help Text
```tsx
<p className={getClasses.hint()}>
  This field is optional
</p>
```

## Complete Class Reference

| Helper | Output Classes | Use For |
|--------|---------------|---------|
| `getClasses.label()` | `text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry` | Field labels |
| `getClasses.value()` | `text-sm text-gray-900 dark:text-white font-roobert-medium` | Data values |
| `getClasses.valueHeavy()` | `text-2xl text-gray-900 dark:text-white font-roobert-heavy` | Large metrics |
| `getClasses.h1()` | `text-2xl text-gray-900 dark:text-white font-roobert-heavy` | Page titles |
| `getClasses.h2()` | `text-xl text-gray-700 dark:text-gray-300 font-roobert-semibold` | Section titles |
| `getClasses.text()` | `text-sm text-gray-900 dark:text-white font-roobert-regular` | Body text |
| `getClasses.textMuted()` | `text-sm text-gray-500 dark:text-gray-400 font-roobert-light` | Less important text |
| `getClasses.input()` | Full input styling | Form inputs |
| `getClasses.card()` | Full card styling | Containers |
| `getClasses.buttonPrimary()` | Full primary button styling | Action buttons |
| `getClasses.buttonSecondary()` | Full secondary button styling | Cancel/back buttons |
| `getClasses.hint()` | `text-xs text-gray-500 dark:text-gray-400` | Help text |

## Combining with Other Classes

```tsx
// Add margin/padding/layout
<span className={`${getClasses.label()} mb-2 ml-4`}>
  Label:
</span>

// Add custom width
<div className={`${getClasses.card()} w-full max-w-2xl`}>
  Content
</div>

// Override specific parts (avoid unless necessary)
<span className={`${getClasses.label()} uppercase`}>
  Label:
</span>
```

## Migration Examples

### Before → After

**Labels:**
```tsx
// BEFORE
<span className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry">
  Revenue:
</span>

// AFTER
<span className={getClasses.label()}>
  Revenue:
</span>
```

**Buttons:**
```tsx
// BEFORE
<button className="px-4 py-2 rounded-lg font-roobert-medium bg-fis-eggplant hover:bg-fis-eggplant/90 dark:bg-fis-raspberry dark:hover:bg-fis-raspberry/90 text-white">
  Save
</button>

// AFTER
<button className={getClasses.buttonPrimary()}>
  Save
</button>
```

**Inputs:**
```tsx
// BEFORE
<input 
  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry"
/>

// AFTER
<input className={getClasses.input()} />
```

## Pro Tips

✅ **DO:**
- Always use design system for labels, values, headings, buttons
- Import once at top of file
- Use for new components immediately
- Combine with utility classes (spacing, layout)

❌ **DON'T:**
- Hardcode purple/raspberry colors
- Create custom label styles
- Mix different label styles in same component
- Forget dark mode testing

## Testing Checklist

After using design system:
- [ ] Check light mode appearance
- [ ] Toggle to dark mode and verify
- [ ] Test responsive breakpoints
- [ ] Verify no TypeScript errors
