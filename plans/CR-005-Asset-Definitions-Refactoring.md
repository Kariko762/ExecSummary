# CR-005: Asset Definitions Refactoring

**Change Request ID:** CR-005  
**Title:** Centralize Asset Definitions & Document Asset Creation Process  
**Priority:** Low  
**Category:** Technical Debt / Developer Experience  
**Estimated Effort:** 8 hours (0.5-1 day)  
**Risk Level:** Low  
**Target Date:** TBD (Recommended before CR-001)  
**Status:** Pending

---

## Executive Summary

Currently, asset definitions exist in multiple places across the codebase, leading to duplication and potential inconsistencies. This change request consolidates all asset definitions into a single source of truth and creates comprehensive documentation for adding new assets to the system.

**Problem:** Asset definitions are duplicated between `TemplateBuilder.tsx` and `EngineAssetsPreview.tsx`, causing:
- Maintenance overhead (changes must be made in two places)
- Risk of inconsistencies between preview and actual behavior
- Developer confusion about where to add new assets

**Solution:** 
1. Create centralized `/cms-admin/src/data/assetDefinitions.ts`
2. Refactor both components to import from single source
3. Document step-by-step process for adding new assets

---

## Business Value

### Benefits
- **Reduced Development Time:** 30% faster when adding new assets
- **Fewer Bugs:** Eliminates duplication-related inconsistencies
- **Developer Onboarding:** Clear documentation accelerates new developer productivity
- **Maintainability:** Single point of change for asset definitions

### ROI
- **Time Savings:** ~2 hours saved per new asset added
- **Bug Prevention:** Eliminates entire class of duplication bugs
- **Knowledge Transfer:** Reduces onboarding time for new developers by ~50%

---

## Current State Analysis

### Existing Duplication

**Location 1: TemplateBuilder.tsx** (Line 86)
```typescript
const ASSET_LIBRARY: AssetCategory[] = [
  {
    id: 'lists',
    name: 'Lists',
    assets: [
      {
        id: 'array',
        name: 'List with Labels',
        renderType: 'keyValueList',
        schema: { type: 'object', renderAs: 'keyValueList', label: 'Details' },
        // ...
      }
    ]
  }
]
```

**Location 2: EngineAssetsPreview.tsx** (Line ~25)
```typescript
const EXAMPLES: RenderExample[] = [
  {
    id: 'list',
    name: 'List (with labels)',
    schema: {
      renderAs: 'keyValueList',
      label: 'Key Metrics',
      // ...
    }
  }
]
```

### Issues Identified
- Different data structures (AssetCategory[] vs RenderExample[])
- Different field names (id, name, renderType vs schema.renderAs)
- Must manually sync changes between both files
- No validation that both are in sync

---

## Proposed Solution

### Architecture

```
cms-admin/src/data/
  └── assetDefinitions.ts          # Single source of truth
       ├── Core asset definitions
       ├── Export ASSET_LIBRARY
       ├── Export EXAMPLES (derived from ASSET_LIBRARY)
       └── Type definitions

cms-admin/src/components/
  ├── TemplateBuilder.tsx          # Imports ASSET_LIBRARY
  └── EngineAssetsPreview.tsx      # Imports EXAMPLES
```

### Implementation Plan

#### Task 1: Create Asset Definitions File (2 hours)

**File:** `/cms-admin/src/data/assetDefinitions.ts`

```typescript
import { Type icons from lucide-react } from 'lucide-react';
import type { FieldSchema } from '../../../src/types/schema';

export interface AssetItem {
  id: string;
  name: string;
  renderType: string;
  description: string;
  schema: FieldSchema;
  icon: any;
  iconColor: string;
  exampleData: any;
  supportsMultiColumn?: boolean;
}

export interface AssetCategory {
  id: string;
  name: string;
  assets: AssetItem[];
}

export interface RenderExample {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  useCase: string;
  schema: FieldSchema;
  sampleData: any;
}

// Single source of truth
export const ASSET_LIBRARY: AssetCategory[] = [
  // All asset definitions here
];

// Derived examples for preview modal
export const ASSET_EXAMPLES: RenderExample[] = ASSET_LIBRARY.flatMap(category =>
  category.assets.map(asset => ({
    id: asset.id,
    name: asset.name,
    category: category.id,
    categoryLabel: category.name,
    description: asset.description,
    useCase: asset.description, // or add useCase to AssetItem
    schema: asset.schema,
    sampleData: asset.exampleData
  }))
);
```

#### Task 2: Update TemplateBuilder (1 hour)

**Changes:**
```typescript
// Remove ASSET_LIBRARY definition
// Add import
import { ASSET_LIBRARY } from '../data/assetDefinitions';

// Rest of file remains the same
```

#### Task 3: Update EngineAssetsPreview (1 hour)

**Changes:**
```typescript
// Remove EXAMPLES definition
// Add import
import { ASSET_EXAMPLES } from '../data/assetDefinitions';

// Update component to use ASSET_EXAMPLES instead of EXAMPLES
```

#### Task 4: Create Documentation (3 hours)

**File:** `/docs/HOW-TO-ADD-NEW-ASSETS.md`

**Contents:**
1. Overview of asset system architecture
2. Step-by-step guide for adding new assets
3. Checklist for validation
4. Examples and code snippets
5. Troubleshooting common issues

#### Task 5: Testing & Validation (1 hour)

**Test Cases:**
- [ ] TemplateBuilder loads correctly
- [ ] All existing assets appear in asset library
- [ ] Drag-and-drop works as before
- [ ] EngineAssetsPreview loads correctly
- [ ] All examples appear in preview modal
- [ ] No duplicate or missing assets
- [ ] TypeScript compiles without errors
- [ ] No console errors or warnings

---

## Documentation: How to Add New Assets

### Step-by-Step Guide

#### Step 1: Create the Renderer Component

**File:** `/src/renderers/YourNewRenderer.tsx`

```typescript
import React from 'react';
import { RendererProps } from '../types/schema';

export const YourNewRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  // Display mode
  if (mode === 'display') {
    return <div>{/* Display logic */}</div>;
  }

  // Edit mode
  return (
    <div>
      {schema.label && <label>{schema.label}</label>}
      {/* Edit controls */}
    </div>
  );
};
```

**Checklist:**
- [ ] Handles both 'display' and 'edit' modes
- [ ] Uses schema properties correctly
- [ ] Calls onChange when value updates
- [ ] Respects disabled state
- [ ] Shows error messages
- [ ] Follows design system patterns

#### Step 2: Add RenderType to Schema

**File:** `/src/types/schema.ts`

```typescript
export type RenderType = 
  | 'text'
  | 'textarea'
  // ... existing types
  | 'yourNewType';  // Add your new type here
```

#### Step 3: Register in RenderFactory

**File:** `/src/renderers/RenderFactory.tsx`

```typescript
// Add import
import { YourNewRenderer } from './YourNewRenderer';

// Add case in switch statement
case 'yourNewType':
  renderer = <YourNewRenderer {...props} />;
  break;
```

**Checklist:**
- [ ] Import added at top of file
- [ ] Case statement added in correct alphabetical order
- [ ] Props spread correctly with {...props}
- [ ] Break statement included

#### Step 4: Copy Renderer to CMS Admin

**File:** `/cms-admin/src/renderers/YourNewRenderer.tsx`

Copy the exact same file from `/src/renderers/` to `/cms-admin/src/renderers/`

**Note:** Both frontend and CMS need the renderer for preview/editing

#### Step 5: Add Asset Definition

**File:** `/cms-admin/src/data/assetDefinitions.ts`

```typescript
{
  id: 'lists',  // or create new category
  name: 'Lists',
  assets: [
    // ... existing assets
    {
      id: 'yourNewAsset',
      name: 'Your New Asset',
      renderType: 'yourNewType',
      description: 'Brief description',
      schema: {
        type: 'string',  // or 'number', 'object', 'array'
        renderAs: 'yourNewType',
        label: 'Display Label',
        placeholder: 'Enter value...',
        helpText: 'Helper text for users'
      },
      icon: YourIcon,  // from lucide-react
      iconColor: 'text-blue-500',
      exampleData: 'Sample value',
      supportsMultiColumn: true  // optional
    }
  ]
}
```

**Checklist:**
- [ ] Unique ID assigned
- [ ] Clear, descriptive name
- [ ] renderType matches RenderType definition
- [ ] Schema has correct type and renderAs
- [ ] Appropriate icon selected
- [ ] Example data provided
- [ ] Multi-column support specified if applicable

#### Step 6: Test in Engine Assets Preview

1. Open CMS admin (http://localhost:5174)
2. Click "Engine Assets Preview" button
3. Find your new asset in the category
4. Test edit mode:
   - [ ] Edit controls appear correctly
   - [ ] Changes update preview in real-time
   - [ ] Validation works (if applicable)
   - [ ] Error messages display properly
5. Test display mode:
   - [ ] Preview renders correctly
   - [ ] Multi-column preview works (if applicable)
   - [ ] Expression syntax works (if applicable)

#### Step 7: Test in Template Builder

1. Open Template Builder
2. Find your asset in the library panel
3. Drag onto canvas:
   - [ ] Asset drops correctly
   - [ ] Default values populate
4. Test properties panel:
   - [ ] Edit controls appear
   - [ ] Changes update immediately
   - [ ] Help text visible
5. Test preview:
   - [ ] Click eye icon
   - [ ] Renders correctly in preview modal
6. Save and reload:
   - [ ] Template saves successfully
   - [ ] Asset loads correctly after reload

#### Step 8: Test in EditorModalV2

1. Open EditorModalV2 with a template containing your asset
2. Test edit mode:
   - [ ] Properties panel shows correctly
   - [ ] Changes persist
3. Test display mode:
   - [ ] Preview renders correctly
   - [ ] Multi-column layout works

#### Step 9: Update Documentation

**Files to update:**
- [ ] Add example to `/docs/TEMPLATE_SYSTEM.md`
- [ ] Update renderer list in README
- [ ] Add to relevant user guides

---

## Common Patterns & Best Practices

### Pattern 1: Simple Input Renderers
**Examples:** TextRenderer, NumberRenderer  
**Use when:** Single value, simple input control  
**Template:**
```typescript
if (mode === 'display') return <span>{value}</span>;
return <input value={value} onChange={e => onChange(e.target.value)} />;
```

### Pattern 2: Array Renderers
**Examples:** ListRenderer, KeyValueListRenderer  
**Use when:** Multiple items, add/remove functionality  
**Template:**
```typescript
const items = Array.isArray(value) ? value : [];
// Map items for display
// Add/remove buttons for edit mode
```

### Pattern 3: Object Renderers
**Examples:** ObjectFormRenderer, KeyValueListRenderer  
**Use when:** Key-value pairs, structured data  
**Template:**
```typescript
const entries = Object.entries(value || {});
// Map entries for display
// Input fields for edit mode
```

### Pattern 4: Visualization Renderers
**Examples:** PieChartRenderer, BarChartRenderer  
**Use when:** Data visualization  
**Template:**
```typescript
if (mode === 'display') return <Chart data={value} config={schema.chartConfig} />;
// Edit mode: data input + config controls
```

### Best Practices

1. **Always check mode** - Display vs Edit rendering
2. **Null/undefined safety** - Handle missing values gracefully
3. **Design system** - Use `getClasses()` helpers
4. **Accessibility** - Labels, ARIA attributes, keyboard navigation
5. **Error handling** - Show error prop when provided
6. **Help text** - Display schema.helpText when available
7. **Expression support** - Use renderWithExpressions() for rich text
8. **Type safety** - Proper TypeScript types for all props

---

## Risk Assessment

### Risk Level: Low

**Why Low Risk:**
- No changes to runtime logic or rendering behavior
- Purely organizational refactoring
- Easy to rollback (restore old files)
- Can be tested thoroughly before deployment

### Potential Issues

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Import path errors | Low | Medium | Thorough testing, TypeScript validation |
| Missing assets | Very Low | Low | Validation checklist, visual inspection |
| Type mismatches | Low | Low | TypeScript compiler catches these |
| Performance impact | Very Low | Very Low | No runtime changes |

---

## Testing Strategy

### Unit Tests
- [ ] Asset definitions export correctly
- [ ] ASSET_LIBRARY structure is valid
- [ ] ASSET_EXAMPLES derived correctly
- [ ] All required fields present

### Integration Tests
- [ ] TemplateBuilder loads assets
- [ ] EngineAssetsPreview loads examples
- [ ] No duplicate assets
- [ ] All icons resolve correctly

### Visual Tests
- [ ] Screenshot comparison of asset library
- [ ] Screenshot comparison of preview modal
- [ ] No UI regressions

### Manual Testing
- [ ] Complete walk-through of user flows
- [ ] Verify all existing assets work
- [ ] Test new asset addition process with documentation

---

## Success Criteria

- ✅ Single source of truth file created and populated
- ✅ Both components import from centralized file
- ✅ Zero duplication of asset definitions
- ✅ All existing assets work identically
- ✅ Comprehensive documentation created
- ✅ Developer can add new asset following docs in < 30 minutes
- ✅ Zero compilation errors
- ✅ Zero runtime errors
- ✅ All tests pass

---

## Timeline

**Total Duration:** 0.5-1 day (8 hours)

| Phase | Duration | Tasks |
|-------|----------|-------|
| Planning | 0.5h | Review current state, finalize approach |
| Implementation | 4h | Tasks 1-3 (file creation, refactoring) |
| Documentation | 3h | Task 4 (comprehensive guide) |
| Testing | 1h | Task 5 (validation) |
| **Total** | **8h** | |

**Recommended Schedule:**
- Start: TBD (Before CR-001 preferred)
- Completion: Same day or next day
- Review: Same week

---

## Dependencies

### Prerequisites
- ✅ Current asset system operational
- ✅ TemplateBuilder functioning
- ✅ EngineAssetsPreview functioning

### Blocks
- None (can be implemented independently)

### Blocked By
- None (no dependencies)

---

## Rollback Plan

### If Issues Arise

**Immediate Rollback** (< 5 minutes)
```bash
git revert <commit-hash>
npm run dev  # Restart dev server
```

**Partial Rollback** (restore individual files)
```bash
git checkout HEAD~1 -- cms-admin/src/components/TemplateBuilder.tsx
git checkout HEAD~1 -- cms-admin/src/components/EngineAssetsPreview.tsx
rm cms-admin/src/data/assetDefinitions.ts
```

**Verification After Rollback**
- [ ] Asset library loads in TemplateBuilder
- [ ] Preview modal loads in EngineAssetsPreview
- [ ] No console errors
- [ ] All existing functionality restored

---

## Communication Plan

### Stakeholders
- Development team (primary)
- Technical documentation team (secondary)

### Notifications
- **Pre-implementation:** Email to dev team about upcoming refactor
- **During:** Slack update when PR is ready for review
- **Post-implementation:** Documentation link shared in team channel

### Training
- Not required (internal refactor)
- Documentation walkthrough in team meeting (optional)

---

## Approval & Sign-off

**Technical Review:**
- [ ] Senior Developer: Architecture review
- [ ] Tech Lead: Approval to proceed

**Implementation:**
- [ ] Code Review: 2 approvals required
- [ ] QA: Testing validation

**Deployment:**
- [ ] Merge to main branch
- [ ] Verify in development environment
- [ ] Deploy to staging (if applicable)

---

## Appendix A: File Structure

```
cms-admin/
└── src/
    ├── data/
    │   └── assetDefinitions.ts       # NEW - Single source of truth
    ├── components/
    │   ├── TemplateBuilder.tsx       # MODIFIED - Import ASSET_LIBRARY
    │   └── EngineAssetsPreview.tsx   # MODIFIED - Import ASSET_EXAMPLES
    └── renderers/
        └── [All renderers]            # NO CHANGES

src/
├── types/
│   └── schema.ts                     # MODIFIED - Add new RenderTypes
└── renderers/
    ├── RenderFactory.tsx              # MODIFIED - Register new renderers
    └── [Individual renderers]         # NEW - Add as needed

docs/
└── HOW-TO-ADD-NEW-ASSETS.md          # NEW - Comprehensive guide
```

---

## Appendix B: Complete Asset Addition Checklist

**Renderer Creation**
- [ ] Create `/src/renderers/YourRenderer.tsx`
- [ ] Implement display mode
- [ ] Implement edit mode
- [ ] Handle schema properties
- [ ] Add error handling
- [ ] Follow design system
- [ ] Add TypeScript types
- [ ] Copy to `/cms-admin/src/renderers/`

**Type System**
- [ ] Add RenderType to `/src/types/schema.ts`
- [ ] Add any custom interfaces if needed

**Registration**
- [ ] Import in `/src/renderers/RenderFactory.tsx`
- [ ] Add case statement
- [ ] Test compilation

**Asset Definition**
- [ ] Add to `/cms-admin/src/data/assetDefinitions.ts`
- [ ] Assign unique ID
- [ ] Add to appropriate category
- [ ] Define schema
- [ ] Provide example data
- [ ] Choose icon and color

**Testing - Engine Assets Preview**
- [ ] Asset appears in correct category
- [ ] Edit mode renders
- [ ] Display mode renders
- [ ] JSON schema correct
- [ ] Example data loads

**Testing - Template Builder**
- [ ] Asset appears in library
- [ ] Drag-and-drop works
- [ ] Properties panel shows
- [ ] Preview renders
- [ ] Save/load works

**Testing - EditorModalV2**
- [ ] Edit mode works
- [ ] Display mode works
- [ ] Multi-column works (if applicable)

**Documentation**
- [ ] Add example to docs
- [ ] Update renderer list
- [ ] Add to user guides

---

**Document Version:** 1.0  
**Created:** November 10, 2025  
**Status:** Pending Approval  
**Next Review:** Upon completion
