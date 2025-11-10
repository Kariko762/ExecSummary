# Executive Summary Website - Project Instructions

## Project Overview
Modern React + Vite executive summary website with premium UI/UX design.
- Pure frontend application (no backend/authentication)
- Fully offline-capable with all dependencies bundled
- Features: 3D cards, glassmorphism, animations, data visualizations, dark/light mode

## Tech Stack
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Recharts (data visualization)
- React Router (navigation)
- Lucide React (icons)

## Development Guidelines
- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Implement responsive design (mobile-first approach)
- Ensure all assets are bundled locally (offline requirement)
- Use modern ES6+ syntax
- Keep components modular and reusable

## Recent Changes (November 10, 2025)

### KeyValueListRenderer Implementation
**Feature:** Dynamic key-value pair editor with add/remove functionality

**Files Modified:**
1. `/src/renderers/KeyValueListRenderer.tsx` - NEW renderer component
2. `/cms-admin/src/renderers/KeyValueListRenderer.tsx` - CMS copy of renderer
3. `/src/renderers/RenderFactory.tsx` - Registered 'keyValueList' case
4. `/src/types/schema.ts` - Added 'keyValueList' to RenderType
5. `/cms-admin/src/components/TemplateBuilder.tsx` - Added keyValueList example data editor (lines 2700-2757)
6. `/cms-admin/src/components/EngineAssetsPreview.tsx` - Updated "List (with labels)" to use renderAs: 'keyValueList'

**Asset Definition:**
```typescript
{
  id: 'array',
  name: 'List with Labels',
  renderType: 'keyValueList',
  description: 'Key-value pairs with labels',
  schema: { type: 'object', renderAs: 'keyValueList', label: 'Details' },
  exampleData: {
    'Role': 'Chief Executive Officer',
    'Department': 'Executive Leadership',
    'Location': 'New York, NY',
    'Reports To': 'Board of Directors'
  }
}
```

**Display Mode:**
- Purple labels (`text-fis-eggplant dark:text-fis-raspberry`)
- Roobert-light font for labels
- Expression support via renderWithExpressions()
- Format: "Label: Value"

**Edit Mode:**
- Two input fields: Label + Value
- "+ Add Pair" button
- Delete button on hover for each pair
- Enter key support
- Object-based storage

**Properties Panel Editor:**
- Located in TemplateBuilder lines 2700-2757
- Allows editing label and value for each pair
- Add/remove pairs dynamically
- Updates exampleData as object: `{ "Key": "Value" }`

### Central Notification System Integration
**Feature:** Unified notification system across Template Builder

**Implementation:**
- App.tsx (line 115): Central `showNotification(type, message)` function
- TemplateBuilder receives `showNotification` prop from App.tsx
- All local notification state removed from TemplateBuilder
- Success/error messages appear at top of screen with 5-second auto-dismiss

**Confirmation Modals:**
- Local modals for destructive actions (Remove All, Unsaved Changes)
- Styled with AlertCircle icon, two-button layout, smooth animations
- Pattern: `showRemoveAllModal` state triggers modal, separate confirm function executes action
- Success notifications use central system after action completes

**Files Modified:**
1. `/cms-admin/src/components/TemplateBuilder.tsx`:
   - Added `showRemoveAllModal` state (line 879)
   - Added `confirmRemoveAll()` function (lines 1632-1639)
   - Added Remove All confirmation modal (lines 4107-4145)
   - Removed local notification state, useEffect, and toast UI
   - All notifications now use central `showNotification()` prop

### MASTER Template Update
- **MASTER-TEMPLATE-ALL-ASSETS.json**: Updated to 23 asset types
- Added `executiveDetails` field using keyValueList renderer
- Example data: Role, Department, Location, Reports To

### Other Recent Renderer Updates
- **BarChartRenderer**: Added axis labels and custom legend (November 10)
- **ListRenderer**: Fixed to support both arrays and objects with purple label styling (November 10)
- **QuoteRenderer**: Border on both sides, no quote marks (Previous)
- **ExpressionRenderer**: Icon alignment fixes (Previous)
