# Content Tagging System

**Last Updated:** November 14, 2025  
**Status:** Complete and Production-Ready

---

## Overview

The Content Tagging System organizes summaries into 6 predefined categories, enabling quick filtering and navigation in both Grid and Table views.

**Added:** November 13-14, 2025

---

## Tag Categories

### 1. 📊 Weekly Summary (`weekly-summary`)
**Purpose:** Regular weekly executive updates  
**Icon:** Calendar (lucide-react)  
**Color:** Blue gradient (`from-blue-500 to-blue-600`)

**Typical Use:**
- Weekly team updates
- Recurring status reports
- Regular executive briefings

### 2. 🧠 Executive IQ (`executive-iq`)
**Purpose:** Strategic insights and analysis  
**Icon:** Brain (lucide-react)  
**Color:** Purple gradient (`from-purple-500 to-purple-600`)

**Typical Use:**
- Market analysis
- Competitive intelligence
- Strategic recommendations

### 3. 🏢 Organizations (`organizations`)
**Purpose:** Organizational structure and team information  
**Icon:** Building2 (lucide-react)  
**Color:** Green gradient (`from-green-500 to-green-600`)

**Typical Use:**
- Org charts
- Team profiles
- Department overviews

### 4. 📈 Performance (`performance`)
**Purpose:** Metrics, KPIs, and performance data  
**Icon:** TrendingUp (lucide-react)  
**Color:** Orange gradient (`from-orange-500 to-orange-600`)

**Typical Use:**
- Quarterly results
- Performance dashboards
- KPI tracking

### 5. 📚 Knowledge Base (`knowledge-base`)
**Purpose:** Documentation and reference materials  
**Icon:** BookOpen (lucide-react)  
**Color:** Indigo gradient (`from-indigo-500 to-indigo-600`)

**Typical Use:**
- Process documentation
- Best practices
- Reference guides

### 6. 🗂️ KB Categories (`kb-categories`)
**Purpose:** Knowledge base categorization and indexing  
**Icon:** FolderTree (lucide-react)  
**Color:** Teal gradient (`from-teal-500 to-teal-600`)

**Typical Use:**
- Category definitions
- Taxonomy structures
- Content organization schemas

---

## Technical Implementation

### Data Structure

Each summary JSON file contains a `_contentTag` metadata field:

```json
{
  "summaryName": "Q1 2025 Executive Summary",
  "_contentTag": "performance",
  "sections": [...]
}
```

### Backend API

**Endpoint:** `GET /api/content-tags`

**Response:**
```json
{
  "success": true,
  "tags": [
    {
      "id": "weekly-summary",
      "name": "Weekly Summary",
      "icon": "Calendar",
      "color": "from-blue-500 to-blue-600",
      "count": 8
    },
    // ... 5 more tags
  ]
}
```

**Implementation:** `/backend/server.js` (lines ~450-490)

### Frontend State

```typescript
// In cms-admin/src/App.tsx
const [availableTags, setAvailableTags] = useState<ContentTag[]>([]);
const [activeTagFilter, setActiveTagFilter] = useState<string>('');

// Load tags on mount
useEffect(() => {
  fetch('http://localhost:3001/api/content-tags')
    .then(res => res.json())
    .then(data => setAvailableTags(data.tags));
}, []);

// Filter items by tag
const filteredItems = allContent.filter(item => {
  if (activeTagFilter && item._contentTag !== activeTagFilter) {
    return false;
  }
  // ... other filters
  return true;
});
```

---

## User Interface

### Grid View

**Tag Badge Display:**
- Small pill badge at top-right of each card
- Gradient background matching tag color
- White text
- Icon + tag name

**Location:** Below quarter/year, above summary title

```tsx
<div className={`inline-flex items-center px-2 py-1 text-xs rounded-full bg-gradient-to-r ${tag.color} text-white`}>
  <TagIcon className="w-3 h-3 mr-1" />
  {tag.name}
</div>
```

### Table View (Default)

**Sidebar Navigation:**
- Vertical list of tag buttons
- "All Content" button at top (shows all)
- 6 tag buttons below
- Active tag has white background with shadow
- Inactive tags have transparent background

**Tag Column:**
- Dedicated column in data table
- Same pill badge style as Grid view
- Sortable

**Active State Blend:**
- Active button has `rounded-l-2xl` (enhanced left bevel)
- White background connects seamlessly to white table
- Gradient sidebar blends with rounded corners

---

## Migration Script

### Purpose
Automatically added `_contentTag` field to all 24 existing summary files.

**Location:** `/cms-admin/src/scripts/migrate-content-tags.ts`

### Tag Assignment Logic

```typescript
const assignTag = (fileName: string): string => {
  if (fileName.includes('weekly')) return 'weekly-summary';
  if (fileName.includes('executive-iq')) return 'executive-iq';
  if (fileName.includes('organizations')) return 'organizations';
  if (fileName.includes('performance')) return 'performance';
  if (fileName.includes('kb-cat')) return 'kb-categories';
  return 'knowledge-base'; // Default
};
```

### Running the Migration

```bash
cd cms-admin
npx ts-node src/scripts/migrate-content-tags.ts
```

**Output:**
```
Starting content tag migration...
Found 24 summary files
Processing q1-2025.json...
  ✓ Tagged as: performance
Processing executive-iq-market-analysis.json...
  ✓ Tagged as: executive-iq
...
Migration complete! Tagged 24 files
```

---

## Filtering Behavior

### Grid View Filtering

1. User clicks tag in horizontal filter bar (if visible)
2. Cards filter in real-time
3. Unmatched cards fade out with animation
4. Matched cards stay visible
5. Click "All Content" to reset

### Table View Filtering

1. User clicks tag button in sidebar
2. Active button gets white background
3. Table rows filter instantly
4. No rows shown if no matches
5. Click "All Content" to show all

### Search + Tag Filtering

Both filters work together:
- Tag filter narrows to category
- Search filter within that category
- Both must match for item to show

**Example:**
- Tag filter: "Performance"
- Search: "Q1"
- Result: Only Q1 performance summaries

---

## Adding a New Tag

### Step 1: Update Backend Tags Array

**File:** `/backend/server.js`

```javascript
const contentTags = [
  // ... existing tags
  {
    id: 'new-tag-id',
    name: 'New Tag Name',
    icon: 'Star', // lucide-react icon
    color: 'from-pink-500 to-pink-600'
  }
];
```

### Step 2: Update Migration Script (if needed)

**File:** `/cms-admin/src/scripts/migrate-content-tags.ts`

```typescript
const assignTag = (fileName: string): string => {
  // ... existing logic
  if (fileName.includes('new-tag')) return 'new-tag-id';
  return 'knowledge-base';
};
```

### Step 3: Tag Existing Summaries

Run migration script or manually edit JSON files:

```json
{
  "_contentTag": "new-tag-id"
}
```

### Step 4: Verify

1. Restart backend: `npm run dev` (in `/backend`)
2. Refresh CMS Admin
3. Check sidebar/filter bar shows new tag
4. Verify filtering works

---

## Tag Badge Component

### Reusable Component

```tsx
interface TagBadgeProps {
  tag: ContentTag;
  size?: 'sm' | 'md' | 'lg';
}

export const TagBadge = ({ tag, size = 'sm' }: TagBadgeProps) => {
  const Icon = getIconComponent(tag.icon);
  
  return (
    <div className={`inline-flex items-center px-2 py-1 text-${size === 'sm' ? 'xs' : 'sm'} rounded-full bg-gradient-to-r ${tag.color} text-white`}>
      <Icon className={`w-${size === 'sm' ? '3' : '4'} h-${size === 'sm' ? '3' : '4'} mr-1`} />
      {tag.name}
    </div>
  );
};
```

### Usage

```tsx
// In Grid view card
<TagBadge tag={getTagById(item._contentTag)} size="sm" />

// In Table view cell
<td>
  <TagBadge tag={getTagById(item._contentTag)} size="md" />
</td>

// In sidebar button
<TagIcon className="w-4 h-4 mr-2" />
{tag.name}
```

---

## Statistics & Analytics

### Tag Count Display

Backend automatically counts summaries per tag:

```javascript
const tagCounts = {};
summaries.forEach(summary => {
  const tag = summary._contentTag || 'knowledge-base';
  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
});

// Add counts to tag objects
tags.forEach(tag => {
  tag.count = tagCounts[tag.id] || 0;
});
```

**Display:**
- Sidebar: "Performance (8)"
- Filter bar: Badge with count
- Analytics dashboard (future)

---

## Best Practices

### When Creating Summaries

1. **Always assign a tag** - Don't leave `_contentTag` empty
2. **Use most specific tag** - Choose the most relevant category
3. **Be consistent** - Same type of content → same tag

### When Adding Tags

1. **Keep it simple** - 6-8 tags max
2. **Clear purpose** - Each tag should have distinct use case
3. **Gradient colors** - Use matching color scheme
4. **Meaningful icons** - Icon should represent category

### For Developers

1. **Validate tag IDs** - Ensure tag exists before filtering
2. **Default to knowledge-base** - If tag missing or invalid
3. **Case-sensitive IDs** - Use lowercase-with-hyphens
4. **Icon names** - Must match lucide-react exports

---

## Troubleshooting

### Tag Not Showing in Sidebar

**Check:**
1. Backend running? (`localhost:3001`)
2. `/api/content-tags` endpoint returns tags?
3. Frontend fetches tags on mount?
4. Tag has valid icon name?

### Filtering Not Working

**Check:**
1. Summary has `_contentTag` field?
2. Tag ID matches exactly (case-sensitive)?
3. `activeTagFilter` state updating?
4. Filter logic in `filteredItems` correct?

### Tag Badge Not Displaying

**Check:**
1. `getTagById()` returns valid tag object?
2. Icon component imported correctly?
3. Gradient color class valid Tailwind?
4. Tag object has `color` and `icon` properties?

---

## Future Enhancements

- [ ] Custom tag creation UI (user-defined tags)
- [ ] Tag color picker
- [ ] Tag hierarchies (parent/child tags)
- [ ] Multi-tag support (summary can have 2+ tags)
- [ ] Tag-based permissions
- [ ] Tag analytics dashboard
- [ ] Export summaries by tag

---

## Related Documentation

- [View Modes (Grid vs Table) →](./view-modes.md)
- [CMS Dashboard Overview →](./overview.md)
- [Content Editor Guide →](./content-editor.md)

---

*Part of the CMS Admin Knowledge Base - November 14, 2025*
