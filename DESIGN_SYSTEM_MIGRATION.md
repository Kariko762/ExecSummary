# Design System Migration Plan

## Overview
Systematically migrate all components to use the centralized design system for consistency and maintainability.

## Phase 1: Core Renderers (Already Started! ✓)

### Status: In Progress
- [x] `ListRenderer.tsx` - Import added, ready to use `getClasses.label()`
- [x] `NestedCardsRenderer.tsx` - Labels updated to design system style
- [x] `ObjectFormRenderer.tsx` - Labels updated to design system style
- [ ] `TextRenderer.tsx` - Need to add design system
- [ ] `TextareaRenderer.tsx` - Need to add design system
- [ ] `NumberRenderer.tsx` - Need to add design system
- [ ] `MetricCardsRenderer.tsx` - Need to add design system

### Action Items:
1. Replace hardcoded classes with `getClasses` helpers
2. Test in Engine Glossary modal
3. Verify dark mode works correctly

---

## Phase 2: CMS Components

### Files to Update:
- [ ] `cms-admin/src/components/CMSHeader.tsx`
- [ ] `cms-admin/src/components/EditorModal.tsx`
- [ ] `cms-admin/src/components/PreviewModal.tsx`
- [ ] `cms-admin/src/components/EngineGlossaryModal.tsx`

### Pattern:
```tsx
// BEFORE
<span className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400">
  Label:
</span>

// AFTER
import { getClasses } from '../../design-system';

<span className={getClasses.label()}>
  Label:
</span>
```

---

## Phase 3: Main App Components

### High Priority (User-Facing):
- [ ] `src/components/Dashboard.tsx`
- [ ] `src/components/SummaryDetail.tsx`
- [ ] `src/components/SummaryCard.tsx`
- [ ] `src/components/Header.tsx`

### Medium Priority:
- [ ] `src/components/KeyActivityInsights.tsx`
- [ ] `src/components/ActivityHoursChart.tsx`
- [ ] `src/components/TopAssetsChart.tsx`
- [ ] `src/components/WeeklyFocus.tsx`
- [ ] `src/components/IssuesBlockers.tsx`
- [ ] `src/components/Timeline.tsx`

### Organization/Initiative Components:
- [ ] `src/components/OrganizationDashboard.tsx`
- [ ] `src/components/OrganizationTile.tsx`
- [ ] `src/components/OrganizationModal.tsx`
- [ ] `src/components/StrategicInitiativesDashboard.tsx`
- [ ] `src/components/StrategicInitiativeTile.tsx`
- [ ] `src/components/StrategicInitiativeModal.tsx`
- [ ] `src/components/ExecutiveIQDetail.tsx`

---

## Phase 4: Template System Integration

### Create Template Schemas with Design System

**File: `src/schemas/summarySchema.ts`**
```typescript
import { ContentSchema } from '../types/schema';
import { getClasses } from '../design-system';

export const summarySchema: ContentSchema = {
  sections: [
    {
      id: 'keyMetrics',
      title: 'Key Metrics',
      // Use design system for display hints
      displayClasses: {
        label: getClasses.label(),
        value: getClasses.valueHeavy(),
        container: getClasses.card(),
      },
      fields: {
        revenue: {
          label: 'Revenue',
          renderAs: 'number',
          // ... field config
        },
        // ... more fields
      }
    }
  ]
};
```

### Update RenderFactory
```typescript
// src/renderers/RenderFactory.tsx
import { getClasses } from '../design-system';

// Pass design system classes to all renderers
export const RenderFactory = ({ schema, value, onChange, mode }) => {
  const commonProps = {
    schema,
    value,
    onChange,
    mode,
    designSystem: getClasses, // Inject design system
  };
  
  // ... render logic
};
```

---

## Phase 5: Vite Alias Configuration

### Setup @shared alias for cleaner imports

**File: `cms-admin/vite.config.ts`**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../src'),
      '@design-system': path.resolve(__dirname, '../src/design-system'),
      '@renderers': path.resolve(__dirname, '../src/renderers'),
      '@types': path.resolve(__dirname, '../src/types'),
    },
  },
});
```

**Then update imports:**
```tsx
// BEFORE
import { getClasses } from '../../src/design-system';

// AFTER
import { getClasses } from '@design-system';
import { TextRenderer } from '@renderers/TextRenderer';
import { FieldSchema } from '@types/schema';
```

---

## Migration Script (Automated Search & Replace)

### Step 1: Find All Hardcoded Label Patterns
```bash
# Find all instances of hardcoded label styling
grep -r "text-xs.*font-roobert.*text-" src/ cms-admin/src/
grep -r "text-sm.*font-roobert.*text-" src/ cms-admin/src/
```

### Step 2: Create Migration Checklist
Run this to generate a list of files needing updates:
```bash
# PowerShell command to find files with hardcoded styles
Get-ChildItem -Path src,cms-admin\src -Recurse -Filter *.tsx | 
  Select-String -Pattern "text-(xs|sm|base|lg|xl|2xl)" | 
  Select-Object -ExpandProperty Path -Unique
```

### Step 3: Batch Update (Careful!)
Use VS Code's Search & Replace across workspace:

**Pattern 1: Labels**
- Find: `text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry`
- Replace: `{getClasses.label()}`
- Files: `src/**/*.tsx, cms-admin/**/*.tsx`

**Pattern 2: Values**
- Find: `text-sm text-gray-900 dark:text-white font-roobert-medium`
- Replace: `{getClasses.value()}`

**Pattern 3: Cards**
- Find: `bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md`
- Replace: `{getClasses.card()}`

---

## Testing Checklist

After each migration phase:

- [ ] **Visual Test**: Compare before/after screenshots
- [ ] **Dark Mode**: Toggle dark mode, verify all colors
- [ ] **Responsive**: Test mobile, tablet, desktop
- [ ] **Print**: Check print styles (if applicable)
- [ ] **Accessibility**: Verify contrast ratios maintained
- [ ] **Build**: Run `npm run build` - no errors
- [ ] **TypeScript**: No type errors (`npm run type-check`)

---

## Rollout Strategy

### Week 1: Foundation
- ✅ Design system created
- [ ] Update all renderers to use design system
- [ ] Test in Engine Glossary
- [ ] Setup Vite aliases

### Week 2: CMS
- [ ] Migrate CMS components
- [ ] Update EditorModal to use design system
- [ ] Test full CMS workflow

### Week 3: Main App (Part 1)
- [ ] Dashboard and SummaryDetail
- [ ] Test main user flows
- [ ] Fix any visual regressions

### Week 4: Main App (Part 2)
- [ ] All remaining components
- [ ] Organization/Initiative dashboards
- [ ] Executive IQ pages

### Week 5: Templates & Schemas
- [ ] Create all schema files with design system
- [ ] Refactor EditorModal to be schema-driven
- [ ] Test content creation workflow

### Week 6: Polish & Documentation
- [ ] Remove all old hardcoded styles
- [ ] Update component documentation
- [ ] Create style guide page in CMS
- [ ] Final testing and QA

---

## Benefits After Migration

### For Developers:
- ✅ **No More Guessing**: Just use `getClasses.label()` instead of remembering exact classes
- ✅ **Type Safety**: TypeScript autocomplete for all styles
- ✅ **Faster Development**: Copy-paste style decisions are already made
- ✅ **Easier Refactoring**: Change one place, updates everywhere

### For Users:
- ✅ **Visual Consistency**: All labels look the same across the app
- ✅ **Better UX**: Predictable interface patterns
- ✅ **Dark Mode**: Perfect dark mode automatically
- ✅ **Accessibility**: Consistent contrast ratios

### For Maintenance:
- ✅ **Single Source of Truth**: All colors/styles in one file
- ✅ **Easy Rebranding**: Update design system, entire app changes
- ✅ **Documentation**: Clear purpose for each style
- ✅ **Reduced CSS**: Less duplication

---

## Quick Start for Next Component

When updating a component:

1. **Add Import**:
```tsx
import { getClasses, DesignSystem } from '@design-system';
```

2. **Replace Patterns**:
- Labels → `className={getClasses.label()}`
- Values → `className={getClasses.value()}`
- Headings → `className={getClasses.h1()}`
- Buttons → `className={getClasses.buttonPrimary()}`
- Inputs → `className={getClasses.input()}`

3. **Test**: Verify light/dark mode

4. **Commit**: Clear commit message like "refactor: migrate Dashboard to design system"

---

## Questions?

- **What if I need custom spacing?** Combine design system with Tailwind utilities:
  ```tsx
  <span className={`${getClasses.label()} mb-4`}>Label:</span>
  ```

- **What if a style doesn't exist?** Add it to `design-system/colors.ts` and document it!

- **Can I use design system in new components?** YES! Always use design system for new code.

- **Breaking changes?** This is non-breaking - old styles still work, we're just replacing them gradually.

---

## Next Steps

**Immediate actions:**
1. [ ] Setup Vite aliases for cleaner imports
2. [ ] Update remaining renderers (Text, Textarea, Number, MetricCards)
3. [ ] Start migration with one high-traffic component (Dashboard or SummaryDetail)
4. [ ] Test thoroughly
5. [ ] Document any issues or new patterns needed

**Long term:**
- Create visual style guide page in CMS showing all design system patterns
- Add Storybook for component library (optional)
- Enforce design system usage with ESLint rules (optional)
