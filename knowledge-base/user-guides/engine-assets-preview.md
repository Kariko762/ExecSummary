# Engine Assets Preview System

## Overview

The Engine Assets Preview System provides an interactive playground for testing and experimenting with all available render types in the Executive Summary application. It consists of two complementary modals:

1. **Engine Assets Modal** - Static documentation and schema reference
2. **Engine Assets Preview** - Interactive playground with live editing

## Components

### 1. Engine Assets Modal

**Location:** `cms-admin/src/components/EngineAssetsModal.tsx`

**Purpose:** Display-only reference documentation for all render types.

**Features:**
- Category-based navigation (Basic, Lists, Complex, Rich Content, Charts)
- Display examples of each render type
- JSON schema viewing (collapsible)
- Use case descriptions
- Launch button for Interactive Preview

**When to use:**
- Quick reference for available render types
- View JSON schema structure
- Understand use cases for each asset type

### 2. Engine Assets Preview (NEW)

**Location:** `cms-admin/src/components/EngineAssetsPreview.tsx`

**Purpose:** Interactive testing environment for render types.

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Header: Engine Assets Preview                     │
├───────────┬─────────────────────────────────────────┤
│           │  Asset Info Bar                         │
│  Tree     ├─────────────────────────────────────────┤
│  Nav      │                                         │
│           │  Rendered Preview                       │
│  ● Basic  │  (Live display of selected asset)      │
│  ● Lists  │                                         │
│  ● Charts │                                         │
│           ├─────────────────────────────────────────┤
│           │  Sample Data (JSON Editor)              │
│           │  [Refresh Preview] button               │
└───────────┴─────────────────────────────────────────┘
```

**Features:**

#### Left Sidebar - Tree Navigation
- Expandable/collapsible categories
- All render types organized by category
- Click to select and preview
- Visual highlight for active selection

#### Top Section - Rendered Preview
- Asset information (name, description, use case)
- **Copy Schema** button (copies JSON schema to clipboard)
- Live rendered output of selected asset
- Updates when you refresh with edited data

#### Bottom Section - Data Editor
- Editable JSON textarea
- Syntax highlighting (dark theme)
- **Refresh Preview** button to apply changes
- Real-time JSON validation with error messages
- Edit sample data and see how it affects rendering

## User Workflow

### Exploring Assets

1. Open **CMS Admin**
2. Click **Engine Assets** button in header
3. Browse through categories to see all available render types
4. Click **Interactive Preview** button

### Testing Assets

1. In the **Interactive Preview** modal:
   - Select an asset from the left sidebar tree
   - View how it renders in the preview area
   - Click **Copy Schema** to get the JSON schema
   - Edit the sample data in the bottom editor
   - Click **Refresh Preview** to see changes

### Example Use Cases

#### Testing a Chart Configuration

```javascript
// 1. Select "Pie Chart" from Charts category
// 2. See default rendering with sample data
// 3. Edit the data:
[
  { name: 'Q1', value: 100 },
  { name: 'Q2', value: 150 },
  { name: 'Q3', value: 200 },
  { name: 'Q4', value: 250 }
]
// 4. Click "Refresh Preview" to see updated chart
// 5. Click "Copy Schema" to use in your template
```

#### Testing Metric Cards

```javascript
// 1. Select "Metric Cards" from Complex category
// 2. View default KPI display
// 3. Edit values to match your data:
{
  revenue: 5000000,
  satisfaction: 88,
  growth: 22
}
// 4. Refresh to see how large numbers format
// 5. Copy schema to implement in your section
```

## Technical Details

### State Management

**EngineAssetsPreview State:**
```typescript
const [selectedExample, setSelectedExample] = useState<RenderExample>(EXAMPLES[0]);
const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set(['basic', 'lists', 'complex', 'rich', 'charts']));
const [editableData, setEditableData] = useState<string>(JSON.stringify(EXAMPLES[0].sampleData, null, 2));
const [currentData, setCurrentData] = useState<any>(EXAMPLES[0].sampleData);
const [jsonError, setJsonError] = useState<string>('');
const [copied, setCopied] = useState(false);
```

### Key Functions

#### selectExample()
Switches to a new asset and resets editor state:
```typescript
const selectExample = (example: RenderExample) => {
  setSelectedExample(example);
  setEditableData(JSON.stringify(example.sampleData, null, 2));
  setCurrentData(example.sampleData);
  setJsonError('');
};
```

#### refreshPreview()
Parses edited JSON and updates the rendered preview:
```typescript
const refreshPreview = () => {
  try {
    const parsed = JSON.parse(editableData);
    setCurrentData(parsed);
    setJsonError('');
  } catch (err) {
    setJsonError((err as Error).message);
  }
};
```

#### copySchema()
Copies the schema to clipboard with visual feedback:
```typescript
const copySchema = () => {
  navigator.clipboard.writeText(JSON.stringify(selectedExample.schema, null, 2));
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

### Data Flow

```
User Selects Asset
    ↓
selectExample() called
    ↓
Updates: selectedExample, editableData, currentData
    ↓
RenderFactory renders currentData
    ↓
User Edits JSON in textarea
    ↓
User Clicks "Refresh Preview"
    ↓
refreshPreview() parses JSON
    ↓
Updates currentData (or shows error)
    ↓
RenderFactory re-renders with new data
```

## Examples Data Structure

Each example includes:

```typescript
interface RenderExample {
  id: string;              // Unique identifier
  name: string;            // Display name (e.g., "Pie Chart")
  category: Category;      // 'basic' | 'lists' | 'complex' | 'rich' | 'charts'
  categoryLabel: string;   // Display label for category
  description: string;     // What it does
  useCase: string;         // When to use it
  schema: FieldSchema;     // Complete JSON schema for Template Builder
  sampleData: any;         // Example data to demonstrate rendering
}
```

## Integration Points

### Opening the Preview

From **Engine Assets Modal**:
```tsx
<button onClick={() => setShowPreview(true)}>
  <PlayCircle className="w-4 h-4" />
  Interactive Preview
</button>

<EngineAssetsPreview
  isOpen={showPreview}
  onClose={() => setShowPreview(false)}
/>
```

### Using Copied Schema

After copying a schema from the preview:

1. **In Template Builder:**
   - Paste into the JSON schema field when adding a section
   
2. **In Custom Templates:**
   - Add to your `summary-template-*.json` file
   - Use in `_fields` metadata

3. **In Code:**
   - Reference in custom renderers
   - Use for validation

## Styling

### Dark Mode Support
Both modals support dark mode with proper theme classes:
```tsx
className="dark:bg-gray-900 dark:text-white dark:border-gray-700"
```

### FIS Branding
- Purple accent color: `#6B1B5E`
- Raspberry accent: `#B21A53`
- Roobert font family
- Consistent card styling

### Layout Dimensions
- **Modal Size:** Full screen with 2rem margin
- **Sidebar Width:** 280px fixed
- **Preview Height:** 60% of modal height
- **Editor Height:** 40% of modal height

## Error Handling

### JSON Validation
```tsx
try {
  const parsed = JSON.parse(editableData);
  setCurrentData(parsed);
  setJsonError('');
} catch (err) {
  setJsonError((err as Error).message);
}
```

Error display:
```tsx
{jsonError && (
  <div className="bg-red-50 border border-red-200 text-red-600">
    <strong>JSON Error:</strong> {jsonError}
  </div>
)}
```

### Render Failures
If RenderFactory fails to render:
- Check console for detailed error
- Verify schema matches render type
- Ensure data structure matches schema expectations

## Best Practices

### For Users

1. **Start with Examples:** Use the provided sample data as a template
2. **Test Incrementally:** Make small changes and refresh often
3. **Copy Schema First:** Get the schema before customizing data
4. **Check JSON Syntax:** Use the error message to fix JSON formatting
5. **Explore Categories:** Try different render types to find the best fit

### For Developers

1. **Add New Examples:** Update `EXAMPLES` array in both modals
2. **Maintain Consistency:** Keep example data realistic and useful
3. **Document Use Cases:** Clear descriptions help users choose correctly
4. **Test Edge Cases:** Include examples with edge case data
5. **Schema Completeness:** Ensure schemas include all required fields

## Future Enhancements

### Potential Features

1. **Save Custom Examples:** Allow users to save their own test data
2. **Export Options:** Export rendered preview as image or PDF
3. **Schema Editor:** Visual schema builder instead of JSON editing
4. **Diff View:** Compare changes between original and edited data
5. **History:** Undo/redo for data edits
6. **Split View:** Side-by-side comparison of multiple renders
7. **Keyboard Shortcuts:** Quick navigation and actions
8. **Search:** Filter assets by name or description

## Troubleshooting

### Preview Not Updating
**Symptom:** Changes to JSON don't reflect in preview
**Solution:** Click "Refresh Preview" button (automatic update disabled for performance)

### JSON Parse Error
**Symptom:** Red error message below editor
**Solution:** Check JSON syntax - missing commas, quotes, brackets

### Render Not Displaying
**Symptom:** Blank preview area
**Solution:** 
- Verify render type is registered in RenderFactory
- Check browser console for errors
- Ensure data structure matches schema

### Copy Schema Not Working
**Symptom:** Schema doesn't copy to clipboard
**Solution:** 
- Ensure browser has clipboard permissions
- Try clicking the button again
- Check browser console for errors

## See Also

- [Adding New Assets](./adding-new-assets.md) - How to add new render types
- [Chart System](./chart-system.md) - Chart-specific documentation
- [Metadata Schema](../reference/metadata-schema.md) - Complete schema reference
- [Template System](../../TEMPLATE_SYSTEM.md) - Template building guide

---

**Last Updated:** December 2024
