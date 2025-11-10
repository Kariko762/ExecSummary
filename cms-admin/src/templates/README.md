# Template JSON Files

This directory contains production-ready template JSON files for the Executive Summary CMS Template Builder.

## Active Templates

### MASTER-TEMPLATE-ALL-ASSETS.json
**Purpose:** Comprehensive reference template showcasing ALL 22 valid asset types

**Contains:**
- All 22 asset types from ASSET_LIBRARY with example data
- Single-column sections for each asset type
- Proper metadata structure (`_type`, `_itemSchema`, `_chartConfig`, etc.)
- Example content data for each field type

**Use Case:** Import this template to see examples of every available asset type

**Valid Asset Types (22):**
1. text
2. textarea
3. number
4. date
5. list
6. listNoTitle
7. nestedCards
8. object
9. keyValue
10. richText
11. expression
12. codeBlock
13. quote
14. pieChart
15. barChart
16. lineChart
17. radialChart
18. image
19. video
20. embeddedVideo
21. hr
22. statusBoard

---

### comprehensive-test-template-VALID.json
**Purpose:** Multi-column layout testing template

**Contains:**
- Multi-column sections (2-column and 3-column layouts)
- Examples of indexed field naming (`charts_0`, `charts_1`, `charts_2`)
- All 22 valid asset types
- Proper multi-column metadata

**Use Case:** Import to test multi-column section reconstruction and layout features

**Multi-Column Examples:**
- `charts` section: 3-column layout (bar/pie/line charts)
- `cards` section: 2-column layout (nestedCards)
- `lists` section: 2-column layout (list + listNoTitle)
- `textTest` section: 2-column layout (text + textarea)

---

### test-template-a.json
**Purpose:** Template Builder generated test template

**Contains:**
- Real-world template created via drag-and-drop in Template Builder
- Multi-column sections
- Charts with full chartConfig
- StatusBoard with complex itemSchema

**Use Case:** Reference for Template Builder output format

**Note:** Contains `metricCards` type which should be replaced with `nestedCards` (to be fixed)

---

### kb-article-template.json
**Purpose:** Knowledge Base article template

**Contains:**
- Structured template for KB article content
- Specific schema for knowledge base use case

**Use Case:** Template for creating knowledge base articles

---

## Archive

Old/deprecated templates moved to `archive/` folder:
- `action-cardsv2.json` - Legacy action cards template
- `comprehensive-test-template.json` - AI-generated (had invalid asset types)
- `comprehensive-test-template-fixed.json` - Partially fixed version
- `summary-template-v2.json` - Old version 2
- `summary-template-v3-multicolumn.json` - Old version 3
- `summary-template-v4-styled.json` - Old version 4
- `summary_default_charts.json` - Old default charts template

---

## JSON Structure Reference

### Standard Template Format

```json
{
  "id": "template-id",
  "quarter": "Month Day",
  "year": 2025,
  "date": "2025-11-10",
  "title": "Template Title",
  "_enabled_standard_header": true,
  "_completed_standard_header": false,
  
  "_sectionName_type": "renderType",
  "_sectionName_itemSchema": { ... },
  "_sectionName_chartConfig": { ... },
  "sectionName": "actual data or array",
  "_enabled_sectionName": true,
  "_completed_sectionName": false,
  
  "status": "draft",
  "protectionEnabled": false,
  "_template_name": "Template Display Name",
  "_template_description": "Template description",
  "_template_created": "2025-11-10T08:00:00.000Z",
  "_template_updated": "2025-11-10T08:00:00.000Z"
}
```

### Multi-Column Section Format

For multi-column sections, use indexed field names:

```json
{
  "_charts_0_type": "pieChart",
  "_charts_0_itemSchema": { ... },
  "_charts_0_chartConfig": { ... },
  "charts_0": [...],
  
  "_charts_1_type": "barChart",
  "_charts_1_itemSchema": { ... },
  "_charts_1_chartConfig": { ... },
  "charts_1": [...],
  
  "_charts_2_type": "lineChart",
  "_charts_2_itemSchema": { ... },
  "_charts_2_chartConfig": { ... },
  "charts_2": [...],
  
  "_enabled_charts": true,
  "_completed_charts": false
}
```

**Import Result:** Creates ONE section named "Charts" with 3 fields in 3-column layout

---

## Invalid Asset Types

**DO NOT USE** - These are not in ASSET_LIBRARY:
- ❌ `metricCards` - Use `nestedCards` instead
- ❌ `objectForm` - This is a `renderAs` value, not a `renderType`

---

## Template Builder Workflow

1. **Create Template:**
   - Drag assets from Asset Library
   - Configure sections and fields
   - Set up multi-column layouts
   - Save template

2. **Export Template:**
   - Click "Export" button
   - Downloads JSON file with all metadata
   - File contains field definitions + example data

3. **Import Template:**
   - Click "Load Template" button
   - Select template JSON file
   - Template Builder reconstructs sections and fields
   - Multi-column sections are properly grouped

4. **Edit Template:**
   - Modify field properties in Properties Panel
   - Rearrange sections via drag-and-drop
   - Change multi-column layouts
   - Update exampleData for preview

---

## Maintenance Notes

- Keep templates folder clean - archive old versions
- Validate all templates contain only valid asset types
- Test multi-column import/export before deploying
- Document any new template patterns in this README

---

**Last Updated:** November 10, 2025
**Maintained By:** CMS Development Team
