# Expression Syntax Guide

The Executive Summary Dashboard supports rich text expressions that add visual elements to your JSON content without HTML.

## 📝 Basic Syntax

Use double curly braces with a colon separator:
```
{{expressionType:value}}
```

## 💰 Currency Expression

Format numbers as currency with automatic scaling (K/M) and dollar icon.

**Syntax:** `{{currency:amount}}`

**Examples:**
```
{{currency:2100000}}  → $2.1M 💲
{{currency:450000}}   → $450K 💲
{{currency:1500}}     → $1,500 💲
```

## 📊 Percent Expression

Display percentages with trend indicators (up/down arrows).

**Syntax:** `{{percent:number}}`

**Examples:**
```
{{percent:35}}   → ↗ 35% (green)
{{percent:-12}}  → ↘ 12% (red)
{{percent:0}}    → ↗ 0%
```

## 📈 Delta Expression

Show change indicators with +/- and color coding.

**Syntax:** `{{delta:number}}`

**Examples:**
```
{{delta:15}}   → ↗ +15 (green)
{{delta:-3}}   → ↘ -3 (red)
{{delta:0}}    → → 0 (gray)
```

**Use Cases:**
```
Revenue {{delta:15}} this quarter
Team size {{delta:-2}} due to restructure
Performance {{delta:8}} vs last month
```

## 🔢 Short Number Expression

Smart number abbreviation (K/M/B).

**Syntax:** `{{short:number}}`

**Examples:**
```
{{short:1200000}}   → 1.2M
{{short:450000}}    → 450.0K
{{short:8700000}}   → 8.7M
{{short:2500000000}} → 2.5B
```

**Use Cases:**
```
Pipeline value: {{short:8700000}}
Active users: {{short:1200000}}
Total revenue: {{short:45000000}}
```

## 📅 Date Expression

Format dates in a readable way.

**Syntax:** `{{date:ISO-date}}`

**Examples:**
```
{{date:2024-12-15}}           → Dec 15, 2024
{{date:2024-11-04T17:45:00Z}} → Nov 4
Due: {{date:2024-12-31}}      → Due: Dec 31, 2024
```

## 📊 Metric Expression

Inline stat block with icon and label.

**Syntax:** `{{metric:value|label|icon}}`

**Examples:**
```
{{metric:18|demos|rocket}}     → [🚀 18 demos]
{{metric:92|progress|target}}  → [🎯 92 progress]
{{metric:156|hours|activity}}  → [📊 156 hours]
```

**Use Cases:**
```
This week we delivered {{metric:22|demos|rocket}} across all LOBs
Project is at {{metric:85|complete|target}} with {{metric:3|days remaining|clock}}
```

## 🎯 Icon Expression

Insert inline icons from the Lucide icon library.

**Syntax:** `{{icon:iconName}}`

**Available Icons:**
- `check` - Checkmark
- `alert` - Alert triangle
- `error` - X circle
- `info` - Info circle
- `zap` - Lightning bolt
- `target` - Target
- `award` - Award/trophy
- `rocket` - Rocket
- `star` - Star
- `heart` - Heart
- `thumbsup` - Thumbs up
- `bell` - Bell
- `flag` - Flag
- `activity` - Activity
- `chart` - Bar chart
- `trending` - Trending up

**Examples:**
```
{{icon:rocket}} Launched new feature
{{icon:award}} Won major deal
{{icon:check}} Task completed
```

## 🏷️ Badge Expression

Display status badges with icons and colored backgrounds.

**Syntax:** `{{badge:badgeType}}`

**Available Badges:**
- `success` - Green badge with checkmark
- `completed` - Green badge with checkmark
- `warning` - Yellow badge with alert icon
- `critical` - Red badge with alert icon
- `info` - Blue badge with info icon
- `new` - Raspberry badge with zap icon
- `priority` - Purple badge with flag icon

**Examples:**
```
{{badge:completed}} Project delivered
{{badge:critical}} Urgent issue
{{badge:new}} Latest feature
```

## 📈 Trend Expression

Show trend arrows without text.

**Syntax:** `{{trend:direction}}`

**Directions:**
- `up` - Green up arrow ↗
- `down` - Red down arrow ↘
- `flat` - Gray horizontal line →

**Examples:**
```
{{trend:up}} Performance improved
{{trend:down}} Metrics decreased
Sales {{trend:flat}} remained stable
```

## ✨ Highlight Expression

Add yellow background highlight to emphasize text.

**Syntax:** `{{highlight:text}}`

**Examples:**
```
Completed {{highlight:ahead of schedule}}
{{highlight:Critical milestone}} achieved
```

## 💪 Bold Expression

Make text bold and stand out.

**Syntax:** `{{bold:text}}`

**Examples:**
```
Delivered for {{bold:3 high-priority}} clients
{{bold:Q4 target}} exceeded by 20%
```

## 🔗 Link Expression

Create clickable links (opens in new tab).

**Syntax:** `{{link:url|text}}`

**Examples:**
```
{{link:https://docs.example.com|View Documentation}}
See {{link:https://jira.company.com/PROJ-123|PROJ-123}} for details
```

## 🎨 Combining Expressions

You can use multiple expressions in a single string:

```json
{
  "keyHighlights": [
    "{{icon:award}} Secured {{currency:2100000}} deal - {{badge:completed}}",
    "{{trend:up}} {{percent:35}} increase in demo engagement",
    "{{icon:rocket}} Launched {{highlight:ahead of schedule}} with {{bold:zero defects}}"
  ]
}
```

## 💡 Best Practices

1. **Don't overuse** - Too many expressions can make text cluttered
2. **Be consistent** - Use similar expressions for similar content types
3. **Test locally** - Preview changes before SFTP upload
4. **Keep it readable** - Text should make sense even without the visual enhancements

## 📋 Complete Example

```json
{
  "keyHighlights": [
    "{{icon:rocket}} Delivered Horizon 2.0 demo environment for {{bold:3 high-priority}} prospects",
    "{{badge:completed}} Completed integration with new Trade Reporting API {{highlight:ahead of Q4 deadline}}",
    "{{icon:award}} Secured {{currency:2100000}} deal with demo supporting final presentation"
  ],
  "strategicProjects": [
    {
      "executiveSummary": "Complete overhaul with {{highlight:new UI}} and real-time data feeds. {{trend:up}} Client feedback has been exceptional. {{percent:45}} increase in user engagement."
    }
  ]
}
```

## 🚫 What NOT to Do

❌ Don't nest expressions: `{{bold:{{icon:star}}}}`
❌ Don't use spaces in expression types: `{{ currency : 1000 }}`
❌ Don't forget closing braces: `{{currency:1000}`
❌ Don't use invalid icon names: `{{icon:invalidname}}`

## 🆘 Troubleshooting

**Expression not rendering?**
- Check for typos in expression type
- Ensure proper `{{}}` syntax
- Verify icon/badge names are valid
- Check for proper colon separator

**Seeing raw text like `{{currency:1000}}`?**
- Component may not be using `RichText` or `renderWithExpressions`
- Check console for parsing errors

---

For support or questions, contact the dev team or check the GitHub repository.
