# 📝 Executive Summary Template System

## How to Add New Executive Summaries

### Quick Start
1. **Copy the template**: Use `TEMPLATE_SUMMARY.json` as your starting point
2. **Edit the JSON file**: Fill in your data (see guide below)
3. **Save with unique filename**: Use format `week-MMM-DD-YYYY.json` or `qX-YYYY.json`
4. **SFTP to server**: Upload to `src/data/summaries/` folder
5. **Rebuild**: Run `npm run build` on the server
6. **Done!** Your summary appears automatically in the timeline

---

## File Naming Convention

### Weekly Updates
```
week-oct-31-2024.json
week-nov-07-2024.json
week-dec-15-2024.json
```

### Quarterly Updates
```
q1-2024.json
q2-2024.json
q3-2024.json
q4-2024.json
```

---

## Template Field Guide

### Required Fields

#### Basic Info
```json
"id": "week-nov-07-2024",           // Unique identifier (use filename without .json)
"quarter": "Week of Nov 07",        // Display name (e.g., "Week of Nov 07" or "Q1")
"year": 2024,                       // Year (number)
"date": "2024-11-07",               // ISO date format (YYYY-MM-DD)
"title": "Your Title Here"          // Summary title
```

#### Highlights (Array of 3-5 items)
```json
"highlights": [
  "First key achievement or update",
  "Second key achievement or update",
  "Third key achievement or update"
]
```

#### Key Metrics
```json
"keyMetrics": {
  "revenue": 1230000,               // Dollar amount (number, no commas)
  "growth": 48,                     // Growth percentage (number)
  "customers": 263,                 // Customer count (number)
  "satisfaction": 0                 // NPS or satisfaction score
}
```

### Optional Fields (for Demo Services Group)

#### Activity Metrics
```json
"activityMetrics": {
  "demoStudio": {
    "demosRegistered": 263,
    "demosLinkedToDeals": 126,
    "wonACV": 1230000,
    "conversionRate": 48
  },
  "hoursByLOB": {
    "capitalMarkets": { "support": 1464, "prep": 23358, "demo": 11057 },
    "banking": { "support": 684, "prep": 8953, "demo": 6528 }
  },
  "activityMixPercentages": {
    "capitalMarkets": { "support": 4, "prep": 65, "demo": 31 },
    "banking": { "support": 4, "prep": 55, "demo": 41 }
  }
}
```

#### Top Assets (for Demo Studio metrics)
```json
"topAssets": [
  { "name": "Asset Name", "count": 73, "category": "Banking" }
]
```

#### Weekly Focus
```json
"weeklyFocus": [
  "Focus item 1",
  "Focus item 2",
  "Focus item 3"
]
```

#### Issues & Blockers
```json
"issuesAndBlockers": [
  {
    "title": "Issue Title",
    "description": "Brief description",
    "impact": "high",                    // Options: "critical", "high", "medium", "low"
    "action": "Current action",
    "remediation": "Remediation plan",
    "timeline": "Timeline",
    "outcome": "Desired outcome",
    "status": "in-progress"              // Options: "open", "in-progress", "resolved"
  }
]
```

---

## Status & Impact Values

### Initiative Status
- `"completed"` - Green checkmark
- `"on-track"` - Blue trending up
- `"at-risk"` - Yellow warning
- `"delayed"` - Red clock

### Impact Level
- `"high"` - Red badge
- `"medium"` - Yellow badge
- `"low"` - Green badge

### Issue Status
- `"open"` - Red, needs attention
- `"in-progress"` - Yellow, being worked on
- `"resolved"` - Green, completed

### Severity
- `"high"` - Red indicator
- `"medium"` - Yellow indicator
- `"low"` - Green indicator

---

## Tips

✅ **Do's**
- Use ISO date format (YYYY-MM-DD) for the `date` field
- Keep highlights to 3-5 bullet points
- Use single quotes inside JSON strings (e.g., `"Banking 'Run, Grow' Microsite"`)
- Test your JSON validity at jsonlint.com before uploading

❌ **Don'ts**
- Don't use commas in numbers (use `1230000` not `1,230,000`)
- Don't forget commas between array items
- Don't use double quotes inside double-quoted strings
- Don't reuse `id` values - they must be unique

---

## SFTP Workflow

1. **Edit template on your laptop**
   ```
   TEMPLATE_SUMMARY.json → week-nov-07-2024.json
   ```

2. **Upload via SFTP**
   ```
   Local:  C:\YourFolder\week-nov-07-2024.json
   Remote: /src/data/summaries/week-nov-07-2024.json
   ```

3. **Rebuild on server**
   ```bash
   cd /path/to/ExecSummary
   npm run build
   ```

4. **Refresh browser** - Your new summary appears!

---

## Validation

Before uploading, validate your JSON:
1. Copy your JSON content
2. Go to https://jsonlint.com
3. Paste and click "Validate JSON"
4. Fix any errors shown
5. Upload when valid

---

## Examples

See `src/data/summaries/week-oct-31-2024.json` for a complete real-world example.

---

## Timeline Sorting

Summaries automatically sort by the `date` field (newest first). The timeline will display them chronologically.

---

## Need Help?

Check the existing files in `src/data/summaries/` for working examples!
