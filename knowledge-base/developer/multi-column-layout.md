# Multi-Column Layout System

**Complete guide to the responsive grid layout system**

Learn how the multi-column layout works, how to use it, and how it's implemented.

---

## Overview

The multi-column layout system allows sections to span 1-4 columns in a responsive grid, enabling sophisticated layouts like side-by-side charts, multi-column metrics, and full-width headers.

### Key Features
- ✅ 1-4 column spans per section
- ✅ Automatic row wrapping
- ✅ Responsive (stacks on mobile)
- ✅ Visual column selector in Template Builder
- ✅ Works with all render types

---

## How It Works

### Grid System

The layout uses a **4-column grid**:

```
┌───────────────────────────────────────┐
│  Col 1   │  Col 2   │  Col 3   │  Col 4  │
└───────────────────────────────────────┘
```

**Column Span Values:**
- `1` = 25% width (quarter)
- `2` = 50% width (half)
- `3` = 75% width (three-quarters)
- `4` = 100% width (full)

### Row Algorithm

Sections fill rows from left to right. When total span exceeds 4, a new row starts:

**Example:**
```json
{
  "section1_columnSpan": 4,  // Row 1: Full width
  "section2_columnSpan": 2,  // Row 2: Left half
  "section3_columnSpan": 2,  // Row 2: Right half (same row)
  "section4_columnSpan": 3,  // Row 3: Left 3/4
  "section5_columnSpan": 1   // Row 3: Right 1/4 (same row)
}
```

**Visual Layout:**
```
┌─────────────────────────────────────┐
│         Section 1 (4)                │ Row 1
├──────────────────┬──────────────────┤
│   Section 2 (2)  │   Section 3 (2)  │ Row 2
├─────────────────────────┬───────────┤
│    Section 4 (3)         │ Sec 5 (1) │ Row 3
└─────────────────────────┴───────────┘
```

---

## Using Multi-Column Layouts

### Method 1: Via JSON Metadata

Add `_sectionName_columnSpan` to your summary JSON:

```json
{
  "highlights": ["..."],
  "_highlights_type": "listNoTitle",
  "_highlights_columnSpan": 4,  // Full width
  
  "budgetChart": [/*...*/],
  "_budgetChart_type": "pieChart",
  "_budgetChart_columnSpan": 2,  // Half width
  
  "revenueChart": [/*...*/],
  "_revenueChart_type": "barChart",
  "_revenueChart_columnSpan": 2  // Half width (side-by-side)
}
```

### Method 2: Via Template Builder

1. Open CMS Admin → Template Builder
2. Add sections to canvas
3. In each section header, use the **Width** dropdown:
   ```
   Width: [1 col ▼]
          2 cols
          3 cols
          4 cols (full)
   ```
4. Select desired width
5. Save template

### Method 3: Via Template Import

When you import a summary, its columnSpan values are preserved:

1. CMS Admin → Summaries → Import
2. Select file with columnSpan metadata
3. Template Builder loads with correct widths
4. Modify as needed

---

## Layout Patterns

### Pattern 1: Dashboard Layout

**Use Case:** Executive summary with key metrics and charts

```json
{
  "_highlights_columnSpan": 4,      // Full-width header
  "_keyMetrics_columnSpan": 4,      // Full-width metrics bar
  "_budgetChart_columnSpan": 2,     // Left chart
  "_revenueChart_columnSpan": 2,    // Right chart (same row)
  "_weeklyFocus_columnSpan": 4      // Full-width footer
}
```

**Visual:**
```
┌─────────────────────────────────────┐
│         Highlights                   │
├─────────────────────────────────────┤
│         Key Metrics                  │
├──────────────────┬──────────────────┤
│  Budget Chart    │  Revenue Chart   │
├─────────────────────────────────────┤
│         Weekly Focus                 │
└─────────────────────────────────────┘
```

---

### Pattern 2: Sidebar Layout

**Use Case:** Main content with sidebar metrics

```json
{
  "_mainContent_columnSpan": 3,     // Main content (75%)
  "_sidebar_columnSpan": 1,         // Sidebar metrics (25%)
  "_footer_columnSpan": 4           // Full-width footer
}
```

**Visual:**
```
┌──────────────────────────┬─────────┐
│                          │         │
│    Main Content          │ Side    │
│                          │ bar     │
├──────────────────────────┴─────────┤
│            Footer                   │
└─────────────────────────────────────┘
```

---

### Pattern 3: Triple Column

**Use Case:** Three equal-width sections

```json
{
  "_metric1_columnSpan": 1,   // 25%
  "_metric2_columnSpan": 1,   // 25%
  "_metric3_columnSpan": 1,   // 25%
  "_metric4_columnSpan": 1    // 25% (fills row)
}
```

**Visual:**
```
┌────────┬────────┬────────┬────────┐
│Metric 1│Metric 2│Metric 3│Metric 4│
└────────┴────────┴────────┴────────┘
```

---

### Pattern 4: Mixed Widths

**Use Case:** Varied content importance

```json
{
  "_mainChart_columnSpan": 3,      // Emphasized (75%)
  "_sideNote_columnSpan": 1,       // De-emphasized (25%)
  "_detail1_columnSpan": 2,        // Equal weight (50%)
  "_detail2_columnSpan": 2         // Equal weight (50%)
}
```

**Visual:**
```
┌─────────────────────────┬──────────┐
│     Main Chart          │ Side     │
│                          │ Note     │
├─────────────────┬────────┴──────────┤
│    Detail 1     │     Detail 2      │
└─────────────────┴───────────────────┘
```

---

## Implementation Details

### Frontend Rendering (`SummaryDetailV2.tsx`)

#### 1. Extract Column Spans

```typescript
const getContentSections = () => {
  return Object.keys(data)
    .filter(key => !key.startsWith('_') && !excludeKeys.includes(key))
    .map(key => {
      const columnSpan = data[`_${key}_columnSpan`] || 1;
      return {
        key,
        type: data[`_${key}_type`],
        columnSpan,
        data: data[key]
      };
    });
};
```

#### 2. Organize into Rows

```typescript
const organizeSectionsIntoRows = (sections: Section[]) => {
  const rows: Section[][] = [];
  let currentRow: Section[] = [];
  let currentRowSpan = 0;

  sections.forEach(section => {
    const span = section.columnSpan || 1;
    
    // If adding this section exceeds 4 columns, start new row
    if (currentRowSpan + span > 4 && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      currentRowSpan = 0;
    }
    
    currentRow.push(section);
    currentRowSpan += span;
  });
  
  // Add final row
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  
  return rows;
};
```

#### 3. Render Grid

```typescript
const rows = organizeSectionsIntoRows(sections);

return (
  <div className="space-y-4">
    {rows.map((row, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-4 gap-4">
        {row.map(section => (
          <div 
            key={section.key}
            className={`col-span-${section.columnSpan} md:col-span-${section.columnSpan}`}
          >
            <RenderFactory
              fieldKey={section.key}
              value={section.data}
              schema={/* ... */}
              mode="display"
            />
          </div>
        ))}
      </div>
    ))}
  </div>
);
```

### Tailwind Column Classes

The system uses Tailwind's grid column span utilities:

```css
.col-span-1 { grid-column: span 1 / span 1; }  /* 25% */
.col-span-2 { grid-column: span 2 / span 2; }  /* 50% */
.col-span-3 { grid-column: span 3 / span 3; }  /* 75% */
.col-span-4 { grid-column: span 4 / span 4; }  /* 100% */
```

### Responsive Behavior

On mobile (`< md` breakpoint), all sections stack vertically:

```typescript
className={`
  col-span-4          // Mobile: full width (stack)
  md:col-span-${section.columnSpan}  // Desktop: specified span
`}
```

---

## Template Builder Integration

### Section Header UI

Each section has a width selector:

```typescript
{!isHeaderSection && (
  <div className="flex items-center gap-2 ml-4">
    <span className="text-xs text-gray-500">Width:</span>
    <select
      value={section.columnSpan || 1}
      onChange={(e) => {
        const newSpan = parseInt(e.target.value);
        setSections(prev => prev.map(s =>
          s.id === section.id ? { ...s, columnSpan: newSpan } : s
        ));
      }}
      className="text-xs px-2 py-1 rounded border"
    >
      <option value={1}>1 col</option>
      <option value={2}>2 cols</option>
      <option value={3}>3 cols</option>
      <option value={4}>4 cols (full)</option>
    </select>
  </div>
)}
```

### Template Generation

When saving, columnSpan is written to metadata:

```typescript
// Enable the section by default
templateData[`_enabled_${sectionKey}`] = true;
templateData[`_completed_${sectionKey}`] = false;

// Add column span if specified
if (section.columnSpan) {
  templateData[`_${sectionKey}_columnSpan`] = section.columnSpan;
}
```

### Template Loading

When loading a template, columnSpan is restored:

```typescript
const sectionColumnSpan = templateData[`_${key}_columnSpan`];

newSections.push({
  id: `section-${Date.now()}-${key}`,
  name: formatSectionTitle(key),
  expanded: true,
  fields: [field],
  columnSpan: sectionColumnSpan || 1  // Restore or default to 1
});
```

---

## Advanced Techniques

### Conditional Column Spans

Adjust spans based on content:

```typescript
const columnSpan = section.data.length > 5 ? 4 : 2;
```

### Dynamic Grids

Change layout based on viewport:

```typescript
<div className={`
  grid 
  grid-cols-1           // Mobile: 1 column
  md:grid-cols-2        // Tablet: 2 columns
  lg:grid-cols-4        // Desktop: 4 columns
  gap-4
`}>
```

### Nested Grids

Grid within a grid section:

```typescript
<div className="col-span-4">
  <div className="grid grid-cols-2 gap-2">
    <SubComponent />
    <SubComponent />
  </div>
</div>
```

---

## Best Practices

### 1. Plan Your Layout

Sketch the grid before coding:

```
Row 1: [====== 4 ======]
Row 2: [== 2 ==][== 2 ==]
Row 3: [= 1 =][= 1 =][= 1 =][= 1 =]
```

### 2. Use Semantic Widths

Match span to content importance:
- Full width (4): Headers, summaries, major sections
- Half width (2): Charts, metrics (side-by-side)
- Quarter width (1): Small metrics, indicators

### 3. Test Responsiveness

Always check mobile view:
- Sections stack vertically
- Charts remain readable
- Text doesn't overflow

### 4. Consistent Gaps

Use the same gap throughout:

```typescript
<div className="grid grid-cols-4 gap-4">  // Always gap-4
```

### 5. Default to 1

If uncertain, start with 1 column and expand:

```json
{
  "_section_columnSpan": 1  // Conservative default
}
```

---

## Troubleshooting

### Sections Not Aligning

**Issue:** Sections in same row don't align

**Cause:** Row spans don't add up correctly

**Fix:** Verify total span per row ≤ 4:
```typescript
console.log('Row total:', row.reduce((sum, s) => sum + s.columnSpan, 0));
```

---

### Mobile View Broken

**Issue:** Sections overlap on mobile

**Cause:** Missing responsive classes

**Fix:** Use `col-span-4` for mobile, `md:col-span-*` for desktop:
```typescript
className="col-span-4 md:col-span-2"
```

---

### Template Not Saving Spans

**Issue:** ColumnSpan values not in generated JSON

**Cause:** Not added to template generation

**Fix:** Check `performSave()` includes columnSpan logic:
```typescript
if (section.columnSpan) {
  templateData[`_${sectionKey}_columnSpan`] = section.columnSpan;
}
```

---

### Rows Too Tall

**Issue:** Short content in wide sections leaves whitespace

**Solution:** Use narrower spans or fill with content:
```json
{
  "_shortSection_columnSpan": 2  // Instead of 4
}
```

---

## Examples

### Example 1: Classic Dashboard

```json
{
  "title": "Executive Dashboard",
  "_title_columnSpan": 4,
  
  "kpi1": "Revenue: $2.5M",
  "_kpi1_columnSpan": 1,
  
  "kpi2": "Growth: 15%",
  "_kpi2_columnSpan": 1,
  
  "kpi3": "Customers: 450",
  "_kpi3_columnSpan": 1,
  
  "kpi4": "NPS: 92",
  "_kpi4_columnSpan": 1,
  
  "mainChart": [/* data */],
  "_mainChart_type": "lineChart",
  "_mainChart_columnSpan": 3,
  
  "sideMetrics": [/* data */],
  "_sideMetrics_type": "nestedCards",
  "_sideMetrics_columnSpan": 1
}
```

---

### Example 2: Report Layout

```json
{
  "executiveSummary": "Summary text...",
  "_executiveSummary_columnSpan": 4,
  
  "leftChart": [/* data */],
  "_leftChart_type": "barChart",
  "_leftChart_columnSpan": 2,
  
  "rightChart": [/* data */],
  "_rightChart_type": "pieChart",
  "_rightChart_columnSpan": 2,
  
  "divider": null,
  "_divider_type": "hr",
  "_divider_columnSpan": 4,
  
  "details": "Detailed analysis...",
  "_details_columnSpan": 4
}
```

---

## Related Documentation

- [Metadata Schema Reference](../reference/metadata-schema.md) - Metadata patterns
- [Template System](./template-system.md) - Template creation
- [Adding New Assets](./adding-new-assets.md) - Custom components

---

*Last Updated: November 8, 2025*
