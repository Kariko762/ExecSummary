# Executive Summary Platform - Knowledge Base

**Welcome to the comprehensive knowledge base for the Executive Summary Platform.**  
This documentation covers the complete system architecture, usage guides, and development workflows.

---

## 🎯 Quick Navigation

### For End Users
- **[Getting Started Guide](./user-guides/getting-started.md)** - First-time setup and basic usage
- **[Creating Executive Summaries](./user-guides/creating-summaries.md)** - Step-by-step guide for content creation
- **[Using the Template Builder](./user-guides/template-builder-guide.md)** - Build custom templates
- **[Engine Assets Preview](./user-guides/engine-assets-preview.md)** - 🆕 Interactive playground for testing render types
- **[Expression Syntax Reference](./user-guides/expression-syntax.md)** - Text formatting and dynamic content

### For Developers
- **[System Architecture Overview](./developer/architecture-overview.md)** - High-level system design
- **[Organizations Integration](./developer/organizations-integration.md)** - 🆕 CR-001: Unified rendering system
- **[Adding New Asset Types](./developer/adding-new-assets.md)** - Complete guide for extending render types
- **[Chart System](./developer/chart-system.md)** - How charts work and how to modify them
- **[Multi-Column Layout System](./developer/multi-column-layout.md)** - Grid layout implementation
- **[Template System Deep Dive](./developer/template-system.md)** - How templates work internally

### Reference Materials
- **[Metadata Schema Reference](./reference/metadata-schema.md)** - All metadata patterns and conventions
- **[Render Type Catalog](./reference/render-types.md)** - Complete list of available render types
- **[API Endpoints](./reference/api-endpoints.md)** - Backend API documentation
- **[Component Library](./reference/component-library.md)** - Reusable React components

### Workflows & Procedures
- **[Content Publishing Workflow](./workflows/publishing-workflow.md)** - Draft → Review → Publish
- **[Template Management](./workflows/template-management.md)** - Creating, editing, and sharing templates
- **[Troubleshooting Guide](./workflows/troubleshooting.md)** - Common issues and solutions

---

## 🏗️ System Overview

### Architecture Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Viewer     │  │  CMS Admin   │  │   Template   │         │
│  │   (Public)   │  │   (Editor)   │  │   Builder    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend API (Node.js + Express)                    │
│  • CRUD operations for summaries, templates, uploads           │
│  • File system management                                       │
│  • Image upload handling                                        │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Storage (JSON Files)                    │
│  • src/data/summaries/*.json                                    │
│  • cms-admin/src/templates/*.json                               │
│  • backend/uploads/* (images)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Features
- **Dynamic Rendering System** - Content sections adapt based on metadata
- **Multi-Column Layouts** - Responsive grid system (1-4 columns)
- **Chart Visualizations** - Pie, Bar, Line, and Radial charts
- **Template Builder** - Visual drag-and-drop template creation
- **Expression Engine** - Rich text formatting with custom syntax
- **Live Preview** - Real-time preview while editing

---

## 📚 Core Concepts

### 1. Metadata-Driven Architecture
Every content section uses metadata to define its structure:

```json
{
  "sectionName": ["actual", "data"],
  "_sectionName_type": "listNoTitle",
  "_sectionName_fields": { /* field definitions */ },
  "_sectionName_columnSpan": 2,
  "_enabled_sectionName": true,
  "_completed_sectionName": false
}
```

**Key Metadata Patterns:**
- `_*_type` - Defines the render type (text, nestedCards, pieChart, etc.)
- `_*_fields` - Field definitions for complex types
- `_*_config` / `_*_chartConfig` - Type-specific configuration
- `_*_columnSpan` - Grid column width (1-4)
- `_enabled_*` - Section visibility toggle
- `_completed_*` - Editor workflow state

### 2. Render Factory Pattern
The RenderFactory routes data to the appropriate renderer based on type:

```
RenderFactory
├── TextRenderer (type: text, textarea)
├── NumberRenderer (type: number)
├── ListRenderer (type: list, listNoTitle)
├── NestedCardsRenderer (type: nestedCards)
├── ChartRenderer (type: pieChart, barChart, lineChart, radialChart)
└── HorizontalRuleRenderer (type: hr)
```

### 3. Template System
Templates define the structure of summaries:
- Stored as JSON files with metadata
- Created via Template Builder (drag-and-drop)
- Can be imported/exported
- Include example data to guide users

---

## 🚀 Quick Start Tasks

### I want to...

#### Create a New Summary
1. Open CMS Admin → Summaries
2. Click "+ New Summary"
3. Choose a template or start blank
4. Edit sections using EditorModalV2
5. Save as Draft → Publish when ready

→ [Full Guide: Creating Summaries](./user-guides/creating-summaries.md)

#### Add a New Chart Type
1. Define chart config interface in `src/types/schema.ts`
2. Create renderer in `src/renderers/[ChartType]Renderer.tsx`
3. Add case to RenderFactory
4. Add asset to Template Builder ASSET_LIBRARY
5. Add example to Engine Assets Modal

→ [Full Guide: Adding New Assets](./developer/adding-new-assets.md)

#### Customize a Chart's Appearance
1. Locate the chart section in your summary JSON
2. Modify the `_sectionName_chartConfig` object
3. Adjust colors, labels, axis keys, etc.
4. Save and preview changes

→ [Full Guide: Chart System](./developer/chart-system.md)

#### Create a Custom Template
1. Open CMS Admin → Template Builder
2. Drag assets from sidebar to canvas
3. Configure sections (names, column spans, fields)
4. Add sample data for each section
5. Save template with name/description
6. Use template for new summaries

→ [Full Guide: Template Builder](./user-guides/template-builder-guide.md)

---

## 📖 Documentation Structure

### User Guides (`./user-guides/`)
Step-by-step instructions for common tasks, written for non-technical users.

### Developer Guides (`./developer/`)
Technical documentation for developers extending or maintaining the system.

### Reference Documentation (`./reference/`)
Comprehensive API, schema, and component references for lookup.

### Workflows (`./workflows/`)
Process documentation for content publishing, template management, and troubleshooting.

---

## 🔄 Recent Updates

### November 2025
- ✅ **CR-001: Organizations Integration** - Unified rendering with Executive Summaries
  - All 4 organization JSON files migrated to metadata standard
  - OrganizationModal refactored to use RenderFactory (44% code reduction)
  - Expression parsing enabled in ListRenderer, NestedCardsRenderer, ObjectFormRenderer
  - Organizations and Summaries now share the same rendering engine
- ✅ **Multi-Column Layout System** - Sections can span 1-4 columns
- ✅ **Horizontal Rule Component** - Visual dividers between sections
- ✅ **Section Reordering** - Drag-and-drop section repositioning
- ✅ **Column Configuration UI** - Visual column width selector
- ✅ **Chart System** - Full suite of data visualizations
- ✅ **Template Builder** - Visual template creation tool

---

## 🆕 Recent Updates (November 10, 2025)

### KeyValueListRenderer
- **New Renderer**: Dynamic key-value pair editor with add/remove functionality
- **Display Mode**: Purple labels with Roobert-light font, expression support
- **Edit Mode**: Label/Value inputs, Add Pair button, delete on hover
- **Usage**: Perfect for executive details, contact info, role descriptions
- **Example**: `{ "Role": "CEO", "Department": "Executive Leadership" }`

### Notification System
- **Central System**: All notifications now use unified `showNotification()` from App.tsx
- **Confirmation Modals**: Styled modals for destructive actions (Remove All, Unsaved Changes)
- **Pattern**: AlertCircle icon, two-button layout, smooth animations
- **Auto-dismiss**: Success/error messages disappear after 5 seconds

### Template Updates
- **MASTER Template**: Updated to 23 asset types including keyValueList
- **Bar Charts**: Added axis labels and custom legends
- **List Renderer**: Now supports both arrays (bullets) and objects (key-value pairs)

---

## 📞 Support & Contributing

### Getting Help
- Check the [Troubleshooting Guide](./workflows/troubleshooting.md)
- Review existing documentation
- Check TypeScript errors in the console

### Contributing
When adding new features:
1. Update relevant KB documentation
2. Add examples to Engine Assets Modal
3. Update metadata schema reference
4. Test in both frontend and CMS admin

---

## 📋 Document Index

All knowledge base documents are organized by category:

**User Guides:**
- Getting Started Guide
- Creating Summaries
- Template Builder Guide
- Expression Syntax Reference

**Developer Guides:**
- Architecture Overview
- Adding New Assets
- Chart System
- Multi-Column Layout
- Template System

**Reference:**
- Metadata Schema
- Render Types Catalog
- API Endpoints
- Component Library

**Workflows:**
- Publishing Workflow
- Template Management
- Troubleshooting Guide

---

*Last Updated: November 10, 2025*
