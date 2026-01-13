# Data Engine - Parameterized Query Syntax

## Overview
The Data Engine supports dynamic, parameterized queries for flexible date-based analysis with apples-to-apples comparisons.

---

## API Endpoint
```
GET /api/data-engine/query/:source
```

### Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `range` | string | Single date range | `11.1-11.16` or `8` |
| `range1` | string | First period for comparison | `11.1-11.16` |
| `range2` | string | Second period for comparison | `12.1-12.16` |
| `field` | string | Field to aggregate (default: `hours`) | `hours` |
| `categories` | string | Comma-separated category filter | `Demo Prep,Support` |
| `operation` | string | Aggregation operation (`sum`) | `sum` |

---

## Date Range Formats

### 1. **Month.Day Range** (Precise day-level comparison)
```
11.1-11.16  → November 1-16
12.1-12.16  → December 1-16
8.15-9.15   → August 15 to September 15
```

### 2. **Full Month** (Single month number)
```
8   → All of August
11  → All of November
1   → All of January
```

### 3. **Quarter.Month** (Named month within quarter)
```
Q3.Aug  → August (3rd month of Q3)
Q4.Nov  → November (2nd month of Q4)
```

---

## Query Examples

### **Same-Day Comparison (Apples-to-Apples)**
Compare first 16 days of November vs December:
```
GET /api/data-engine/query/activity-insights?range1=11.1-11.16&range2=12.1-12.16&operation=sum
```

**Response:**
```json
{
  "data": {
    "period1": 2645,
    "period2": 503,
    "change": -81
  }
}
```

---

### **Category-Specific Trend**
Preparation hours only, Nov 1-16 vs Dec 1-16:
```
GET /api/data-engine/query/activity-insights?range1=11.1-11.16&range2=12.1-12.16&field=hours&categories=Demo / Presentation Preparation,Demo Preparation Activities
```

**Response:**
```json
{
  "data": {
    "period1": 807,
    "period2": 322,
    "change": -60
  }
}
```

---

### **Full Month Total**
All August activity:
```
GET /api/data-engine/query/activity-insights?range=8&operation=sum
```

**Response:**
```json
{
  "data": 2869
}
```

---

### **Specific Period Aggregation**
Demo delivery hours in December 1-16:
```
GET /api/data-engine/query/activity-insights?range=12.1-12.16&operation=sum&categories=Demo Presentation – Virtual / Hybrid,Demo Presentation – Onsite
```

---

## Expression Syntax (For Templates)

### Basic Syntax
```
{{data:source.query(params).metric}}
```

### Examples

**1. Same-day comparison:**
```
{{data:activityInsights.trend(11.1-11.16, 12.1-12.16).preparation}}
```
Returns: `-60` (percent change)

**2. Full month value:**
```
{{data:activityInsights.range(11).total}}
```
Returns: `2645` (total hours in November)

**3. Category-specific:**
```
{{data:activityInsights.range(12.1-12.16).demo}}
```
Returns: `178` (demo delivery hours Dec 1-16)

---

## Category Groupings

### **Preparation**
- Demo / Presentation Preparation
- Demo Preparation Activities

### **Support (Fix)**
- Demo Enhancement (Inc. Script / Data / Collateral)
- Demo Environment Support

### **Delivery (Demo)**
- Demo Presentation – Virtual / Hybrid
- Demo Presentation – Onsite

---

## Use Cases

### ✅ **Apples-to-Apples Monthly Trends**
```
Nov 1-16 vs Dec 1-16  → Fair comparison (same # of days)
Oct vs Nov vs Dec      → Understand seasonal patterns
```

### ✅ **Quarter Position Analysis**
```
Q3.Aug vs Q4.Nov  → Same position in different quarters
```

### ✅ **Trailing Windows**
```
Last 30 days vs Previous 30 days
Week-over-week comparisons
```

### ✅ **Category Efficiency**
```
Prep hours per period
Support vs Delivery ratio
Virtual vs Onsite split
```

---

## Implementation Notes

- **Year:** Currently defaults to 2025 (configurable)
- **Date Parsing:** Handles "Wednesday, January 1, 2025" format from source data
- **Month Boundaries:** Full month queries use day 1-31
- **Category Matching:** Exact string match (case-sensitive)
- **Zero Handling:** Returns 0% change if previous period = 0

---

## Next Steps

1. **Expression Integration:** Wire `{{data:...}}` expressions to query endpoint
2. **View Builder UI:** Visual interface for building parameterized queries
3. **Presets:** Common patterns (MTD, QTD, YTD, Last 30 Days)
4. **YoY Support:** Compare 2024 vs 2025 same periods
