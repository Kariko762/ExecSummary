# OrgIQ JSON Data Format Guide

## 📁 File Structure

### **core_data.json** - Your Organization Structure (Rarely Changes)

```json
{
  "productId": "unique-identifier",
  "productName": "Product or Team Name",
  "description": "Brief description",
  "lastUpdated": "2025-12-03T10:30:00Z",
  "organizationStructure": [...]
}
```

### **Required Fields for Each Person:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | ✅ Yes | Unique identifier | `"1"`, `"emp-123"` |
| `parentId` | string/null | ✅ Yes | ID of manager (null for CEO) | `"1"`, `null` |
| `name` | string | ✅ Yes | Full name | `"Jane Doe"` |
| `title` | string | ✅ Yes | Job title | `"VP of Engineering"` |
| `department` | string | ⚠️ Optional | Department name | `"Engineering"` |
| `email` | string | ⚠️ Optional | Email address | `"jane@company.com"` |
| `imageUrl` | string | ⚠️ Optional | Profile photo URL | `"https://..."` |
| `productRole` | string | ⚠️ Optional | Role in this product | `"Product Lead"` |
| `teamSize` | number | ⚠️ Optional | Direct reports count | `15` |

---

## 🎯 Data Overlay Files (Frequently Updated)

### **overlay-{name}.json** - Metric Overlays

```json
{
  "overlayId": "unique-overlay-id",
  "overlayName": "Display Name",
  "description": "What this overlay shows",
  "dataType": "category-name",
  "createdDate": "2025-12-03T10:30:00Z",
  "lastUpdated": "2025-12-03T10:30:00Z",
  
  "visualizationConfig": {
    "title": "Tab Name",
    "icon": "IconName",
    "primaryColor": "purple",
    "hotspotEnabled": true,
    "hotspotMetric": "fieldName",
    "hotspotLabel": "Display Label",
    "hotspotRanges": [...],
    "aggregateMetrics": [...]
  },
  
  "nodeMetrics": [...]
}
```

### **visualizationConfig Options:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | string | Tab button text | `"License Distribution"` |
| `icon` | string | Icon name (Users, Key, TicketCheck, Presentation) | `"Key"` |
| `primaryColor` | string | Theme color | `"purple"`, `"orange"`, `"green"` |
| `hotspotEnabled` | boolean | Show hotspot toggle | `true` |
| `hotspotMetric` | string | Field name to visualize | `"licenseCount"` |
| `hotspotLabel` | string | Legend title | `"Licenses"` |

### **hotspotRanges** - Color Coding:

```json
"hotspotRanges": [
  { "min": 0, "max": 50, "color": "#e0e7ff", "label": "Low (0-50)" },
  { "min": 51, "max": 100, "color": "#c7d2fe", "label": "Medium (51-100)" },
  { "min": 101, "max": 200, "color": "#a5b4fc", "label": "High (101-200)" },
  { "min": 201, "max": 999999, "color": "#818cf8", "label": "Very High (200+)" }
]
```

### **aggregateMetrics** - Summary Stats:

```json
"aggregateMetrics": [
  {
    "id": "totalLicenses",
    "label": "Total Licenses",
    "calculation": "sum",
    "field": "licenseCount",
    "format": "number"
  },
  {
    "id": "avgPerPerson",
    "label": "Avg Per Person",
    "calculation": "average",
    "field": "licenseCount",
    "format": "number"
  }
]
```

**Calculation Types:** `sum`, `average`, `count`, `max`, `min`  
**Format Types:** `number`, `percentage`, `currency`, `person`

### **nodeMetrics** - Per-Person Data:

```json
"nodeMetrics": [
  {
    "nodeId": "1",
    "licenseCount": 450,
    "utilizationRate": 87,
    "lastAudit": "2025-11-28",
    "customField1": "any value",
    "customField2": 123
  }
]
```

**Requirements:**
- Must have `nodeId` matching a person's `id` from core_data.json
- Include your `hotspotMetric` field (e.g., `licenseCount`)
- Include all fields referenced in `aggregateMetrics`
- Add any custom fields you want (they'll appear in tooltips)

---

## 📋 Step-by-Step Setup

### **1. Create Your Core Organization File**

File: `cms-admin/public/orgiq-data/core_data.json`

```json
{
  "productId": "my-product",
  "productName": "My Product Team",
  "description": "Product team organizational structure",
  "lastUpdated": "2025-12-03T10:30:00Z",
  "organizationStructure": [
    {
      "id": "1",
      "parentId": null,
      "name": "CEO Name",
      "title": "Chief Executive Officer",
      "department": "Executive",
      "email": "ceo@company.com",
      "imageUrl": "https://example.com/ceo.jpg",
      "productRole": "Executive Sponsor",
      "teamSize": 100
    },
    {
      "id": "2",
      "parentId": "1",
      "name": "Manager Name",
      "title": "VP of Engineering",
      "department": "Engineering",
      "email": "vp@company.com",
      "imageUrl": "https://example.com/vp.jpg",
      "productRole": "Engineering Lead",
      "teamSize": 50
    }
    // ... add all your people
  ]
}
```

### **2. Create Metric Overlays**

File: `cms-admin/public/orgiq-data/overlay-licenses.json`

```json
{
  "overlayId": "licenses-2025",
  "overlayName": "License Distribution 2025",
  "description": "Software licenses per team member",
  "dataType": "license-metrics",
  "createdDate": "2025-12-03T10:30:00Z",
  "lastUpdated": "2025-12-03T10:30:00Z",
  
  "visualizationConfig": {
    "title": "Licenses",
    "icon": "Key",
    "primaryColor": "purple",
    "hotspotEnabled": true,
    "hotspotMetric": "licenseCount",
    "hotspotLabel": "License Count",
    "hotspotRanges": [
      { "min": 0, "max": 50, "color": "#e0e7ff", "label": "0-50" },
      { "min": 51, "max": 100, "color": "#c7d2fe", "label": "51-100" },
      { "min": 101, "max": 200, "color": "#a5b4fc", "label": "101-200" },
      { "min": 201, "max": 999999, "color": "#818cf8", "label": "200+" }
    ],
    "aggregateMetrics": [
      {
        "id": "total",
        "label": "Total Licenses",
        "calculation": "sum",
        "field": "licenseCount",
        "format": "number"
      }
    ]
  },
  
  "nodeMetrics": [
    {
      "nodeId": "1",
      "licenseCount": 450
    },
    {
      "nodeId": "2",
      "licenseCount": 180
    }
    // ... one entry per person
  ]
}
```

### **3. Register New Overlays**

Edit: `cms-admin/src/pages/OrgIQ.tsx` around line 140

```typescript
const overlayFiles = [
  'overlay-licenses.json',
  'overlay-tickets.json',
  'overlay-demos.json',
  'overlay-your-new-metric.json'  // Add your file here
];
```

---

## 🎨 Icon Options

Available icons (from Lucide React):
- `"Users"` - People/team icon
- `"Key"` - Licenses/access
- `"TicketCheck"` - Tickets/support
- `"Presentation"` - Demos/sales
- `"DollarSign"` - Revenue/financial
- `"Target"` - Goals/metrics
- `"TrendingUp"` - Growth/performance

---

## ✅ Validation Checklist

- [ ] All `id` values are unique
- [ ] All `parentId` values reference valid `id` (or null for top)
- [ ] CEO/top person has `parentId: null`
- [ ] No circular references (A → B → A)
- [ ] `nodeMetrics` have matching `nodeId` in `organizationStructure`
- [ ] `hotspotMetric` field exists in all `nodeMetrics`
- [ ] Aggregate metric `field` names exist in `nodeMetrics`
- [ ] Color ranges cover full value range

---

## 🔧 Tips

1. **Images**: Use `https://i.pravatar.cc/150?img=X` for placeholder photos (X = 1-70)
2. **IDs**: Use simple sequential IDs (`"1"`, `"2"`) or employee IDs (`"emp-123"`)
3. **Hierarchy**: Start with top person (CEO), then add direct reports, then their reports
4. **Testing**: Start small (5-10 people) then expand
5. **Updates**: Only edit `nodeMetrics` for metric changes, leave `core_data.json` stable

---

## 📞 Example: Full Minimal Setup

**core_data.json:**
```json
{
  "productId": "my-team",
  "productName": "My Team",
  "description": "Team structure",
  "lastUpdated": "2025-12-03T10:30:00Z",
  "organizationStructure": [
    {"id": "1", "parentId": null, "name": "Boss", "title": "CEO"},
    {"id": "2", "parentId": "1", "name": "Manager", "title": "Manager"},
    {"id": "3", "parentId": "2", "name": "Employee", "title": "Engineer"}
  ]
}
```

**overlay-simple.json:**
```json
{
  "overlayId": "simple",
  "overlayName": "Simple Metric",
  "description": "Basic metric overlay",
  "dataType": "metrics",
  "createdDate": "2025-12-03T10:30:00Z",
  "lastUpdated": "2025-12-03T10:30:00Z",
  "visualizationConfig": {
    "title": "My Metric",
    "icon": "Users",
    "primaryColor": "blue",
    "hotspotEnabled": true,
    "hotspotMetric": "score",
    "hotspotLabel": "Score",
    "hotspotRanges": [
      {"min": 0, "max": 50, "color": "#fef3c7", "label": "Low"},
      {"min": 51, "max": 100, "color": "#fbbf24", "label": "High"}
    ],
    "aggregateMetrics": [
      {"id": "total", "label": "Total", "calculation": "sum", "field": "score", "format": "number"}
    ]
  },
  "nodeMetrics": [
    {"nodeId": "1", "score": 100},
    {"nodeId": "2", "score": 75},
    {"nodeId": "3", "score": 50}
  ]
}
```

That's it! Replace with your data and you're ready to go! 🚀
