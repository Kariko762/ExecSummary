# Legacy Documentation Index

**Created:** November 14, 2025  
**Purpose:** Historical reference for pre-November 2025 documentation

---

## ⚠️ Notice

All files in this folder represent **LEGACY** documentation that predates the November 2025 CMS Admin overhaul. The information may be outdated or incorrect.

**For current documentation**, see: [Knowledge Base](../knowledge-base/kb_main.md)

---

## Files in This Archive

### General Documentation
- **DOCS_INDEX.md** - Old documentation index (superseded by kb_main.md)
- **DOCS.md** - Old documentation guide
- **README.md** - Old project README (current README in root is active)

### Quick Guides
- **QUICK_START.md** - Old quick start guide
- **QUICK_REF.md** - Old quick reference
- **QUICK_TEST_GUIDE.md** - Old testing guide

### Deployment
- **DEPLOYMENT.md** - Old deployment checklist
- **DEPLOYMENT_GUIDE.md** - Old deployment guide
- **CUSTOMIZATION.md** - Old customization guide
- **LOGIN_SETUP_GUIDE.md** - Old authentication setup

### Technical Documentation
- **KNOWLEDGE_BASE.md** - Old knowledge base (superseded by knowledge-base/ folder)
- **SYSTEM_ARCHITECTURE_VERIFIED.md** - Architecture docs (pre-Asset Library overhaul)
- **SYSTEM_INTEGRATION_TEST_PLAN.md** - Test plan

### Feature Documentation
- **ASSET_EXAMPLE_DATA_AUDIT.md** - Old asset data audit (before assetDataStore)
- **CHANGELOG_TEMPLATE_BUILDER.md** - Template Builder changes (Nov 10)
- **INITIATIVE_JSON_RESTRUCTURE.md** - JSON restructure plan
- **TODO_NOV_12.md** - Old task list

### Planning Documents (plans/ folder)
- **CR-FOUNDATION-001-TEST-RESULTS.md** - Completed test results (Nov 9)
- **CR-005-Asset-Definitions-Refactoring.md** - Superseded by Asset Library overhaul (Nov 11)
- **PROJECT_COMPLETION_PLAN.md** - Outdated project plan (pre-Nov 11 overhaul)

---

## Why These Were Archived

### November 11-14, 2025 Overhaul

The CMS Admin underwent a **complete architecture overhaul** including:

1. **Asset Library System** (Nov 11)
   - AssetLibrary.tsx replaced AssetTypeReferenceModal
   - assetDataStore.ts became single source of truth
   - assetRenderEngine.tsx master orchestrator
   - 6 pattern files for specialized rendering
   - Design system semantic variables

2. **Content Tagging** (Nov 13-14)
   - 6 tag categories
   - Backend endpoints
   - Grid/Table view filtering
   - Migration script

3. **Table View** (Nov 14)
   - Professional data table
   - Sidebar navigation
   - Gradient blend technique
   - Default view mode

**Result:** Most documentation was outdated and needed complete rebuild.

---

## What Replaced These Docs

### New Knowledge Base Structure

```
knowledge-base/
├── kb_main.md (NEW - central hub)
└── cms-admin/
    ├── overview.md (NEW)
    ├── asset-library-system.md (NEW)
    ├── content-tagging.md (NEW)
    └── view-modes.md (NEW)
```

### Active Documentation (Still in Root)
- **README.md** - Current project overview (kept in root)
- **HANDOVER.md** - AI context document (kept in root)

---

## Using Legacy Docs

### When to Reference

✅ **Good Use Cases:**
- Historical context (what changed and when)
- Understanding old architecture decisions
- Migration references
- Deployment guides (some may still be relevant)

❌ **Don't Use For:**
- Current development (use knowledge-base/ instead)
- Asset definitions (use assetDataStore.ts)
- Architecture understanding (outdated)
- Template Builder (pre-Asset Library)

### If You Need Current Info

1. Check [Knowledge Base](../knowledge-base/kb_main.md) first
2. Check active root docs (README.md, HANDOVER.md)
3. Check source code comments
4. Check backend documentation
5. Only then reference legacy docs for historical context

---

## Timeline

**Pre-November 10, 2025:**
- Template Builder with manual asset definitions
- AssetTypeReferenceModal (text-only descriptions)
- Grid view only
- No content tagging
- Hardcoded colors

**November 10-14, 2025:**
- KeyValueListRenderer added
- Asset Library overhaul
- Content tagging system
- Table view with sidebar
- Design system semantic variables
- Documentation restructure

**Post-November 14, 2025:**
- New knowledge base structure
- CMS Admin focused documentation
- Legacy docs archived here

---

## Related

- **Current KB**: [knowledge-base/kb_main.md](../knowledge-base/kb_main.md)
- **CMS Admin Docs**: [knowledge-base/cms-admin/](../knowledge-base/cms-admin/)
- **Archive Folder**: [docs-archive/](../docs-archive/) (older docs from before)

---

*Legacy documentation archived November 14, 2025*
