# View Modes: Grid vs Table

**Last Updated:** November 14, 2025  
**Status:** Complete and Production-Ready

---

## Overview

The CMS Admin provides two view modes for browsing summaries:
- **Grid View** - Visual card-based layout with hover effects
- **Table View** - Professional data table with sidebar navigation (default)

Users can toggle between views using the button in the top-right corner.

---

## Grid View

### Layout

**Structure:**
- 3-column grid on desktop
- 2-column on tablet
- 1-column on mobile
- Cards have glassmorphism effect
- Hover animations (lift + glow)

**Card Contents:**
- Quarter/Year badge (top-left)
- Tag badge (top-right)
- Summary title (large)
- Created date (formatted)
- Status badge (Live/Draft)
- Completion % (drafts only)
- Action buttons (hover reveal)

### Visual Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredItems.map(item => (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="glass rounded-2xl p-6 border-2 border-white/20"
    >
      {/* Card content */}
    </motion.div>
  ))}
</div>
```

### Features

1. **Visual Hierarchy**
   - Large summary title
   - Color-coded status badges
   - Prominent tag pills
   - Subtle metadata (date, completion)

2. **Hover Effects**
   - Card lifts slightly
   - Shadow intensifies
   - Action buttons fade in
   - Smooth transitions

3. **Quick Actions**
   - Edit button
   - Delete button
   - Appears on hover
   - Icon-only for cleanliness

4. **Tag Filtering**
   - Horizontal filter bar above grid (optional)
   - Click tag to filter
   - Smooth fade animations
   - "All Content" to reset

---

## Table View (Default)

### Layout

**Structure:**
- Left sidebar (256px fixed width)
- Right table (flexible width)
- Zero-gap flex container
- Gradient background with white table

**Sidebar:**
- Gradient background (purple → pink → navy)
- Vertical tag navigation
- "All Content" button at top
- 6 tag buttons below
- Active state with white bg

**Table:**
- White background on gradient container
- Rounded right corners only
- 6 columns: Name, Date, Status, % Complete, Tag, Actions
- Responsive overflow (horizontal scroll if needed)

### Visual Design

```tsx
<div className="flex gap-0 overflow-hidden rounded-2xl border-2 border-white/20">
  {/* Sidebar */}
  <div className="w-56 bg-gradient-to-b from-fis-eggplant via-fis-raspberry to-fis-navy pl-4 pr-0 py-4">
    <button className="bg-white text-fis-eggplant rounded-l-2xl px-6 py-3">
      All Content
    </button>
    {/* Tag buttons */}
  </div>
  
  {/* Table */}
  <div className="flex-1 bg-gradient-to-b from-fis-eggplant via-fis-raspberry to-fis-navy pl-0 pr-6 py-4">
    <div className="bg-white rounded-r-lg p-4">
      <table className="w-full">
        {/* Table content */}
      </table>
    </div>
  </div>
</div>
```

### Features

1. **Sidebar Navigation**
   - Vertical tag filtering
   - Active state blends with white table
   - Enhanced bevel on active button (rounded-l-2xl)
   - Icon + name for each tag
   - Gradient background

2. **Data Table**
   - Professional column layout
   - Sortable headers (future)
   - Centered actions and % complete
   - Status badges (Live green / Draft yellow)
   - Tag pills in dedicated column

3. **Column Structure**
   - **Name**: Quarter/Year or summary name
   - **Date**: Formatted creation date
   - **Status**: Live (green) / Draft (yellow) badge
   - **% Complete**: Completion percentage (drafts only), centered
   - **Tag**: Color-coded tag badge
   - **Actions**: Edit, Comments, Delete buttons, centered

4. **Active State Blend**
   - Sidebar: `pr-0` (zero right padding)
   - Table container: `pl-0` (zero left padding)
   - Active button: `rounded-l-2xl` (enhanced left bevel)
   - White button bg → white table bg (seamless blend)

---

## Toggle Functionality

### UI Component

```tsx
<div className="flex gap-2">
  <button
    onClick={() => setViewMode('grid')}
    className={viewMode === 'grid' ? 'bg-white text-fis-eggplant' : 'bg-fis-eggplant/20 text-white'}
  >
    <LayoutGrid className="w-5 h-5" />
  </button>
  
  <button
    onClick={() => setViewMode('table')}
    className={viewMode === 'table' ? 'bg-white text-fis-eggplant' : 'bg-fis-eggplant/20 text-white'}
  >
    <Table2 className="w-5 h-5" />
  </button>
</div>
```

### State Management

```typescript
// Default to table view
const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

// Persist to localStorage (future)
useEffect(() => {
  localStorage.setItem('cmsViewMode', viewMode);
}, [viewMode]);

// Load from localStorage on mount (future)
useEffect(() => {
  const saved = localStorage.getItem('cmsViewMode');
  if (saved) setViewMode(saved as 'grid' | 'table');
}, []);
```

---

## When to Use Each View

### Use Grid View When:

✅ **Browsing visually** - Looking for specific quarter/summary by appearance  
✅ **Quick overview** - Want to see many summaries at a glance  
✅ **Design focus** - Emphasizing visual presentation  
✅ **Touch devices** - Larger tap targets, better mobile experience  

### Use Table View When:

✅ **Sorting/filtering** - Need to filter by specific criteria  
✅ **Data focus** - Comparing dates, status, completion %  
✅ **Dense information** - Need to see many items in compact form  
✅ **Professional context** - Formal business environment  
✅ **Tag-based workflow** - Navigating primarily by content tags  

---

## Comparison Table

| Feature | Grid View | Table View |
|---------|-----------|------------|
| **Layout** | 3-column cards | Sidebar + data table |
| **Density** | Lower (large cards) | Higher (compact rows) |
| **Navigation** | Horizontal filter bar | Vertical sidebar |
| **Visual Impact** | High (animations, glass) | Professional (data-focused) |
| **Mobile** | Excellent (stacks) | Good (horizontal scroll) |
| **Sorting** | None (future) | Columns (future) |
| **Tag Filtering** | Horizontal bar | Sidebar buttons |
| **Active State** | N/A | Seamless blend |
| **Status Display** | Badge on card | Badge in column |
| **Actions** | Hover reveal | Always visible |
| **Completion %** | On card | Dedicated column |
| **Default** | No | Yes |

---

## Technical Implementation

### Grid View Code

**Location:** `cms-admin/src/App.tsx` lines ~645-769

**Key Classes:**
- Container: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Card: `glass rounded-2xl p-6 border-2 border-white/20`
- Hover: `whileHover={{ scale: 1.02, y: -5 }}`

### Table View Code

**Location:** `cms-admin/src/App.tsx` lines ~773-945

**Key Classes:**
- Container: `flex gap-0 overflow-hidden rounded-2xl`
- Sidebar: `w-56 bg-gradient-to-b from-fis-eggplant via-fis-raspberry to-fis-navy pl-4 pr-0 py-4`
- Active button: `bg-white text-fis-eggplant shadow-lg rounded-l-2xl px-6 py-3`
- Table container: `flex-1 bg-gradient-to-b ... pl-0 pr-6 py-4 min-h-full`
- Table wrapper: `bg-white rounded-r-lg p-4 min-h-full`

### Conditional Rendering

```typescript
{viewMode === 'grid' ? (
  // Grid view JSX
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Cards */}
  </div>
) : (
  // Table view JSX
  <div className="flex gap-0 overflow-hidden rounded-2xl">
    {/* Sidebar + Table */}
  </div>
)}
```

---

## Styling Details

### Grid View Glassmorphism

```css
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### Table View Gradient Blend

```css
/* Sidebar gradient */
.bg-gradient-to-b.from-fis-eggplant.via-fis-raspberry.to-fis-navy {
  background: linear-gradient(to bottom, #431C5B, #B21A53, #1D1F48);
}

/* Active button seamlessly blends with white table */
.rounded-l-2xl {
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;
}

/* Table only has right corners rounded */
.rounded-r-lg {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
```

### Padding Alignment

```
Sidebar:   pl-4  pr-0  py-4  (zero right padding)
Table:     pl-0  pr-6  py-4  (zero left padding)
Result:    Seamless visual connection
```

---

## Status Badges

### Live Badge

```tsx
<span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-500 text-white">
  Live
</span>
```

### Draft Badge

```tsx
<span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-yellow-500 text-gray-900">
  Draft
</span>
```

---

## Completion Percentage

**Display Logic:**

```typescript
{item.status === 'draft' ? (
  <span className="text-gray-600">
    {calculateSummaryCompletion(item)}%
  </span>
) : (
  <span className="text-gray-400">-</span>
)}
```

**Calculation:**
```typescript
const calculateSummaryCompletion = (summary: any): number => {
  const totalSections = Object.keys(summary)
    .filter(key => key.startsWith('_enabled_')).length;
  
  const completedSections = Object.keys(summary)
    .filter(key => key.startsWith('_completed_') && summary[key] === true).length;
  
  return Math.round((completedSections / totalSections) * 100);
};
```

---

## Future Enhancements

### Grid View
- [ ] Infinite scroll / pagination
- [ ] Card size toggle (small/medium/large)
- [ ] Custom card layouts
- [ ] Drag-and-drop reordering

### Table View
- [ ] Column sorting (click header to sort)
- [ ] Column hiding/showing
- [ ] Column reordering (drag headers)
- [ ] Row selection (checkboxes)
- [ ] Bulk actions (delete, publish, tag)
- [ ] Export to CSV
- [ ] Saved filters

### Both Views
- [ ] View preference persistence (localStorage)
- [ ] Custom view configurations
- [ ] Keyboard shortcuts (G for grid, T for table)
- [ ] Search highlighting in results

---

## Related Documentation

- [Content Tagging System →](./content-tagging.md)
- [CMS Dashboard Overview →](./overview.md)
- [Content Editor Guide →](./content-editor.md)

---

*Part of the CMS Admin Knowledge Base - November 14, 2025*
