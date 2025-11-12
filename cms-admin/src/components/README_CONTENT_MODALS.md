# Content Modal Components

This directory contains two modal components for displaying content in different formats:

## 1. ContentModal.tsx (Original - Scrolling Experience)

**Use Case**: Single-page scrolling experience with all sections visible on one page
- ✅ Best for: Short content, comparative viewing, printing
- ✅ Features: Sticky header, smooth scrolling, validation tab (for drafts)
- ✅ Navigation: Scroll to view all sections

### Usage
```tsx
import { ContentModal } from './components/ContentModal';

<ContentModal
  content={organizationData} // JSON object with sections
  onClose={() => setModalOpen(false)}
/>
```

---

## 2. ContentModalFixedMenu.tsx (New - Fixed Menu Experience)

**Use Case**: Multi-page experience with fixed left-side navigation menu
- ✅ Best for: Long documentation, structured content, chapter-based reading
- ✅ Features: Fixed menu, page-per-section, markdown rendering
- ✅ Navigation: Click menu items to switch sections

### Usage
```tsx
import { ContentModalFixedMenu } from './components/ContentModalFixedMenu';

const sections = [
  {
    id: 'section-1',
    title: 'Introduction',
    content: '# Introduction\n\nMarkdown content here...',
    order: 1
  },
  {
    id: 'section-2',
    title: 'Features',
    content: '# Features\n\n- Feature 1\n- Feature 2',
    order: 2
  }
];

<ContentModalFixedMenu
  title="Documentation"
  subtitle="User guide and reference"
  sections={sections}
  onClose={() => setModalOpen(false)}
/>
```

### ContentSection Interface
```typescript
interface ContentSection {
  id: string;        // Unique identifier
  title: string;     // Section title (shown in menu)
  content: string;   // Markdown content
  order: number;     // Display order (sorted ascending)
}
```

---

## 3. ChangeManagementModal.tsx (Example Implementation)

**Use Case**: System Settings → Change Management page
- ✅ Demonstrates: Tab-based navigation + fixed menu
- ✅ Content Types: Release Notes, Changelog, Development Tasks
- ✅ Real-world: Complete example with actual project data

### Usage in System Settings
```tsx
import { ChangeManagementModal } from './components/ChangeManagementModal';

const [showChangeManagement, setShowChangeManagement] = useState(false);

// In System Settings menu
<button onClick={() => setShowChangeManagement(true)}>
  Change Management
</button>

{showChangeManagement && (
  <ChangeManagementModal onClose={() => setShowChangeManagement(false)} />
)}
```

### Features
- **3 Tabs**: Release Notes, Changelog, Development Tasks
- **Fixed Menu**: Navigate between sections in each tab
- **Markdown Content**: Fully rendered with custom styling
- **Dynamic Sections**: Each tab loads different content sections

---

## Component Comparison

| Feature | ContentModal | ContentModalFixedMenu |
|---------|-------------|----------------------|
| **Layout** | Single scrolling page | Fixed menu + content area |
| **Navigation** | Scroll | Click menu items |
| **Content Format** | JSON sections with RenderFactory | Markdown strings |
| **Best For** | Structured data (Orgs, Initiatives) | Documentation, guides, changelogs |
| **Validation** | ✅ Built-in validation tab | ❌ N/A |
| **JSON Preview** | ✅ Built-in JSON tab | ❌ N/A |
| **Markdown Rendering** | ❌ Via RenderFactory | ✅ Native ReactMarkdown |
| **Multi-Column** | ✅ Supports grid layouts | ❌ Single column |
| **Print Support** | ✅ Optimized | ⚠️ Standard |

---

## Loading Content from Markdown Files

### Option 1: Import Local Files
```tsx
import releaseNotes from './docs/release-notes.md?raw';
import changelog from './docs/changelog.md?raw';

const sections = [
  { id: 'release', title: 'Release Notes', content: releaseNotes, order: 1 },
  { id: 'changelog', title: 'Changelog', content: changelog, order: 2 }
];
```

### Option 2: Fetch from Server
```tsx
useEffect(() => {
  const loadContent = async () => {
    const response = await fetch('/api/docs/release-notes.md');
    const markdown = await response.text();
    setSections([
      { id: 'release', title: 'Release Notes', content: markdown, order: 1 }
    ]);
  };
  loadContent();
}, []);
```

### Option 3: Embed Inline (Current Approach)
```tsx
const CONTENT = `
# Title
Content here...
`;

const sections = [
  { id: 'section', title: 'Section', content: CONTENT, order: 1 }
];
```

---

## Styling & Theming

Both components use the design system:
- **Glass Morphism**: `glass-strong` class
- **Color Palette**: `fis-eggplant`, `fis-raspberry`, `fis-navy`
- **Typography**: Roobert font family
- **Dark Mode**: Full support with `dark:` variants
- **Animations**: Framer Motion transitions

### Customizing Markdown Styles
Edit the `ReactMarkdown` components in `ContentModalFixedMenu.tsx`:
```tsx
<ReactMarkdown
  components={{
    h1: ({ node, ...props }) => (
      <h1 className="text-4xl font-roobert-heavy" {...props} />
    ),
    // ... customize other elements
  }}
>
  {content}
</ReactMarkdown>
```

---

## Benefits of This Approach

### 1. **Consolidates Documentation**
- Replace scattered MD files with centralized content
- Single source of truth for project documentation
- Easy to update and maintain

### 2. **User-Friendly Access**
- Beautiful UI instead of raw markdown files
- Fixed menu for easy navigation
- Consistent with application design system

### 3. **Version Control Integration**
- Content stored in Git repository
- Track changes over time
- Easy to reference historical versions

### 4. **Future Extensibility**
- Add search functionality
- Implement content export (PDF, HTML)
- Add collaborative editing
- Version comparison views

---

## Next Steps

### Integrate into System Settings
1. Add "Change Management" button to System Settings menu
2. Import `ChangeManagementModal` component
3. Add state management for modal open/close

### Create Content Repository
1. Create `docs/` folder in project root
2. Organize markdown files by category:
   - `release-notes/` - User-facing releases
   - `changelogs/` - Developer changelogs
   - `development/` - Task tracking and metrics

### Implement Content Loading
1. Choose loading strategy (import vs fetch vs inline)
2. Create content loading utility functions
3. Add loading states and error handling

### Enhance with Features
- Add search/filter to fixed menu
- Implement table of contents auto-generation
- Add breadcrumb navigation
- Include print/export functionality
- Add sharing links with deep-linking to sections

---

## File Structure

```
cms-admin/src/components/
├── ContentModal.tsx                    # Original scrolling modal
├── ContentModalFixedMenu.tsx           # New fixed menu modal
├── ChangeManagementModal.tsx           # Example implementation
└── README_CONTENT_MODALS.md           # This file

docs/ (future)
├── release-notes/
│   ├── v2.0.0.md
│   ├── v1.5.0.md
│   └── v1.0.0.md
├── changelogs/
│   ├── 2025-11.md
│   └── 2025-10.md
└── development/
    ├── completed-tasks.md
    ├── pending-tasks.md
    └── metrics.md
```

---

## Example: System Settings Integration

```tsx
// In SystemSettings.tsx or similar

import { useState } from 'react';
import { ChangeManagementModal } from './components/ChangeManagementModal';
import { FileText } from 'lucide-react';

export const SystemSettings = () => {
  const [showChangeManagement, setShowChangeManagement] = useState(false);

  return (
    <div className="system-settings">
      {/* Other settings... */}
      
      <div className="setting-section">
        <h3 className="text-xl font-roobert-bold mb-4">Documentation</h3>
        
        <button
          onClick={() => setShowChangeManagement(true)}
          className="glass-strong p-6 rounded-xl hover:scale-105 transition-transform flex items-center gap-4"
        >
          <FileText className="w-8 h-8 text-fis-eggplant" />
          <div className="text-left">
            <div className="font-roobert-semibold text-lg">Change Management</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Release notes, changelog, and development tasks
            </div>
          </div>
        </button>
      </div>

      {/* Modal */}
      {showChangeManagement && (
        <ChangeManagementModal onClose={() => setShowChangeManagement(false)} />
      )}
    </div>
  );
};
```

---

## Questions & Support

For questions about these components, reference:
- `CHANGELOG_TEMPLATE_BUILDER.md` - Recent changes
- `KNOWLEDGE_BASE.md` - General project documentation
- Design System Manager in CMS - Component styling reference
