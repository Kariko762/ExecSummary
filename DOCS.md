# Executive Summary - Documentation Guide

## 📚 Quick Navigation

### For Users
- **[README.md](README.md)** - Project overview, features, and getting started
- **[QUICK_START.md](QUICK_START.md)** - Quick reference for adding executive summaries
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment instructions
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Detailed deployment guide
- **[CUSTOMIZATION.md](CUSTOMIZATION.md)** - Branding and customization options

### For Developers
- **[knowledge-base/kb_main.md](knowledge-base/kb_main.md)** - 🎯 **START HERE** - Central knowledge base hub
- **[knowledge-base/developer/adding-new-assets.md](knowledge-base/developer/adding-new-assets.md)** - How to add new render types
- **[knowledge-base/developer/chart-system.md](knowledge-base/developer/chart-system.md)** - Complete chart documentation
- **[knowledge-base/developer/multi-column-layout.md](knowledge-base/developer/multi-column-layout.md)** - Multi-column grid system
- **[knowledge-base/reference/metadata-schema.md](knowledge-base/reference/metadata-schema.md)** - Metadata reference

### Design System
- **[src/design-system/README.md](src/design-system/README.md)** - Design system documentation
- **[src/design-system/QUICK_REF.md](src/design-system/QUICK_REF.md)** - Quick reference for design tokens

### Quick References
- **[QUICK_REF.md](QUICK_REF.md)** - General quick reference guide

---

## 🏗️ Knowledge Base Structure

The **knowledge-base/** folder contains comprehensive, interconnected documentation:

```
knowledge-base/
├── kb_main.md                           # Central hub - start here
├── developer/
│   ├── adding-new-assets.md            # How to add new render types (5-step guide)
│   ├── chart-system.md                 # Chart types, configuration, customization
│   └── multi-column-layout.md          # Grid layout system documentation
├── reference/
│   └── metadata-schema.md              # Complete metadata reference
├── user-guides/                         # (Future user documentation)
└── workflows/                           # (Future workflow guides)
```

Each document includes:
- Complete examples
- Cross-references to related docs
- Troubleshooting sections
- Best practices

---

## 📦 Other Documentation

### Backend/CMS
- **[backend/README.md](backend/README.md)** - Backend server documentation
- **[cms-admin/README.md](cms-admin/README.md)** - CMS Admin interface documentation

### Configuration
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - GitHub Copilot project instructions

---

## 📁 Archived Documentation

Old documentation has been moved to **docs-archive/** for reference:
- Legacy architecture documents
- Migration guides (completed migrations)
- Old system documentation (superseded by knowledge base)

These are kept for historical reference but are no longer actively maintained.

---

## 🎯 Where to Start?

### I want to...

**Understand the project**
→ Start with [README.md](README.md)

**Add a new executive summary**
→ See [QUICK_START.md](QUICK_START.md)

**Deploy to production**
→ Follow [DEPLOYMENT.md](DEPLOYMENT.md)

**Develop new features**
→ Go to [knowledge-base/kb_main.md](knowledge-base/kb_main.md)

**Test render types interactively**
→ See [knowledge-base/user-guides/engine-assets-preview.md](knowledge-base/user-guides/engine-assets-preview.md)

**Add a new chart type**
→ See [knowledge-base/developer/chart-system.md](knowledge-base/developer/chart-system.md)

**Add a new asset/section type**
→ Follow [knowledge-base/developer/adding-new-assets.md](knowledge-base/developer/adding-new-assets.md)

**Understand the metadata system**
→ Read [knowledge-base/reference/metadata-schema.md](knowledge-base/reference/metadata-schema.md)

**Customize branding**
→ Check [CUSTOMIZATION.md](CUSTOMIZATION.md)

---

## 📝 Documentation Standards

All active documentation follows these principles:
- **Concise but complete** - No unnecessary detail, but nothing critical missing
- **Example-driven** - Every concept includes working examples
- **Cross-referenced** - Related docs link to each other
- **Up-to-date** - Reflects current implementation
- **Actionable** - Focuses on "how to" rather than "what is"

---

**Last Updated:** December 2024
