# Asset Catalog - Complete Reference

**Total Assets:** 25 types across 5 categories  
**Last Updated:** December 15, 2025

---

## 📊 Chart Types (6 Assets)

### 1. Radial Progress Chart
- **Function:** Display multiple percentage-based metrics in circular progress rings
- **Data Type:** Array of objects `[{ name: string, value: number (0-100) }]`
- **Visual:** Concentric circular rings with percentage labels, color-coded by value (green/yellow/red thresholds)
- **Use Case:** KPI dashboards, performance metrics, goal tracking

### 2. Pie Chart
- **Function:** Show proportional breakdown of a whole into segments
- **Data Type:** Array of objects `[{ name: string, value: number }]`
- **Visual:** Circular chart divided into colored slices with percentage labels and bottom legend
- **Use Case:** Budget allocation, market share, time distribution

### 3. Line Chart
- **Function:** Display trends over time with multiple data series
- **Data Type:** Array of objects `[{ name: string, data: number[] }]`
- **Visual:** Multi-line chart with x-axis labels, y-axis values, colored lines, legend, and hover tooltips
- **Use Case:** Revenue trends, user growth, performance over time

### 4. Bar Chart
- **Function:** Compare values across categories using horizontal/vertical bars
- **Data Type:** Array of objects `[{ category: string, value: number }]`
- **Visual:** Colored bars with axis labels, grid lines, and value labels
- **Use Case:** Sales by region, feature comparison, survey results

### 5. Metric Card
- **Function:** Highlight a single key metric with trend indicator
- **Data Type:** Object `{ title: string, value: number, change?: number, icon?: string }`
- **Visual:** Card with large centered number, optional trend arrow (green ↑ / red ↓), icon, and description
- **Use Case:** Revenue, user count, conversion rate, response time

### 6. Radial Chart (Legacy Renderer)
- **Function:** Similar to Radial Progress but uses legacy rendering system
- **Data Type:** Object `{ title: string, percentage: number, color: string }`
- **Visual:** Single circular progress ring with center percentage display
- **Use Case:** Single metric visualization, completion percentage

---

## 📝 List Types (6 Assets)

### 7. Highlights List
- **Function:** Display numbered list of key points with circular badge icons
- **Data Type:** Array of strings `["item 1", "item 2", ...]`
- **Visual:** Numbered items with colored circular badges (purple→pink→blue→green rotation), Roobert-light font
- **Use Case:** Executive highlights, key achievements, action items

### 8. Bullet List
- **Function:** Simple unordered list with custom bullet points
- **Data Type:** Array of strings `["item 1", "item 2", ...]`
- **Visual:** Purple circular bullets with Roobert-light text
- **Use Case:** Feature lists, requirements, meeting notes

### 9. Checklist Items
- **Function:** Display completed tasks with green checkmarks
- **Data Type:** Array of strings `["completed task 1", ...]`
- **Visual:** Green checkmark icons with struck-through or normal text
- **Use Case:** Completed milestones, deliverables, acceptance criteria

### 10. Progress Bar List
- **Function:** Show multiple tasks/projects with individual progress bars
- **Data Type:** Array of objects `[{ title: string, subtitle: string, percentage: number, status: string }]`
- **Visual:** Card per item with title, colored progress bar (green/yellow/red), percentage, and status badge
- **Use Case:** Project tracking, sprint progress, OKR completion

### 11. Key-Value List
- **Function:** Display labeled data pairs in a clean list format
- **Data Type:** Object `{ "Label": "Value", "Label2": "Value2", ... }`
- **Visual:** Purple labels (Roobert-light) followed by values, format: "Label: Value"
- **Use Case:** Contact details, specifications, metadata, profile information

### 12. Nested Cards
- **Function:** Display structured data in small card format
- **Data Type:** Array of objects `[{ title: string, value: string }]`
- **Visual:** Grid of compact cards with title and value, subtle borders
- **Use Case:** Team structure, quick stats, summary data

---

## ✏️ Basic Text Types (4 Assets)

### 13. Text Input
- **Function:** Display single-line text content
- **Data Type:** String
- **Visual:** Plain text rendered with Roobert font, supports expression syntax
- **Use Case:** Short descriptions, labels, single-line content

### 14. Text Area
- **Function:** Display multi-line text content
- **Data Type:** String (can include newlines)
- **Visual:** Multi-paragraph text with preserved line breaks, Roobert-light font
- **Use Case:** Descriptions, summaries, multi-line content

### 15. Rich Text
- **Function:** Display formatted text with bold, italic, highlights, and expressions
- **Data Type:** String with markup: `[[bold]]`, `[[italic]]`, `[[highlight]]`, `{{expressions}}`
- **Visual:** Styled text with formatting applied, expressions in purple
- **Use Case:** Formatted content, styled descriptions, rich summaries

### 16. Quote
- **Function:** Display a quote or callout with visual emphasis
- **Data Type:** String
- **Visual:** Text with border on both sides, italic styling, distinct visual treatment
- **Use Case:** Testimonials, key quotes, important callouts

---

## 🎯 Complex Types (5 Assets)

### 17. Status Board
- **Function:** Display categorized items in a kanban-style board
- **Data Type:** Object `{ columns: [{ title: string, items: string[] }] }`
- **Visual:** Multi-column layout with colored headers (green/yellow/red), cards per item
- **Use Case:** Sprint boards, risk tracking, initiative status

### 18. Risk Card
- **Function:** Highlight risks with severity levels and mitigation plans
- **Data Type:** Array of objects `[{ type: string, title: string, description: string, mitigation: string }]`
- **Visual:** Colored card (red/yellow) with icon, risk description, and mitigation steps
- **Use Case:** Project risks, issues, blockers

### 19. Timeline
- **Function:** Display chronological events with expandable details
- **Data Type:** Array of objects `[{ date: string, title: string, description: string, completed: boolean, metadata?: object }]`
- **Visual:** Vertical timeline with dots, connecting lines, expandable cards, metadata badges
- **Use Case:** Project roadmap, milestones, historical events

### 20. Two-Column Comparison (Four Block Grid)
- **Function:** Display 2x2 grid of related information blocks
- **Data Type:** Object `{ topLeftTitle: string, topLeftContent: string, topRightTitle: string, ... }`
- **Visual:** Four equal-sized cards in grid layout with titles and content
- **Use Case:** Problem/Solution, Context grids, comparative analysis

### 21. Problem-Solution Box
- **Function:** Display problem statement with proposed solution
- **Data Type:** Object `{ problem: string, solution: string }`
- **Visual:** Two-section card with red (problem) and green (solution) headers
- **Use Case:** Issue resolution, strategic recommendations

---

## 💰 Financial Types (2 Assets)

### 22. Budget Breakdown
- **Function:** Display detailed budget with categories, line items, and variance analysis
- **Data Type:** Complex nested object with categories, line items, budgeted vs actual amounts
- **Visual:** Expandable category cards with financial tables, variance indicators (green/red), metadata
- **Use Case:** Budget planning, financial reporting, cost analysis

### 23. Forecast Breakdown
- **Function:** Display multi-year financial forecasts with categories
- **Data Type:** Similar to budget breakdown but with yearly projections
- **Visual:** Expandable categories with year-over-year projections, trend indicators
- **Use Case:** Financial planning, revenue forecasts, long-term budgeting

---

## 📋 Executive Summary Formats (4 Assets)

### 24. CPSAR Format
- **Function:** Structured executive summary using Context → Problem → Solution → Action → Recommendation framework
- **Data Type:** Object `{ context: string, problem: string, solution: string, recommendation: string, asks: [{ text, owner, dueDate }] }`
- **Visual:** Sectioned card with labeled fields, purple headers, action items with owner/due date badges
- **Use Case:** Strategic proposals, project approvals, decision memos

### 25. BLUF Format (Bottom Line Up Front)
- **Function:** Military-style executive summary leading with conclusion
- **Data Type:** Object `{ bottomLine: string, background: string, assessment: string, recommendation: string, asks: [] }`
- **Visual:** Similar to CPSAR with BLUF-specific section labels
- **Use Case:** Urgent decisions, crisis communication, time-sensitive proposals

### 26. SBAR Format (Situation, Background, Assessment, Recommendation)
- **Function:** Healthcare/Operations-style structured communication
- **Data Type:** Object `{ situation: string, background: string, assessment: string, recommendation: string, asks: [] }`
- **Visual:** Four-section card with distinct headers, action items table
- **Use Case:** Operational decisions, incident reports, escalations

### 27. Pyramid Principle Format (McKinsey Style)
- **Function:** Consulting-style executive summary with main argument → supporting points → details
- **Data Type:** Object `{ mainArgument: string, keyPoints: string[], supportingDetails: string, nextSteps: string, asks: [] }`
- **Visual:** Pyramid structure with bold main argument, bullet points, detailed sections, action table
- **Use Case:** Consulting deliverables, strategic recommendations, board presentations

---

## 🎨 Utility Assets (2 Assets)

### 28. Gauge (Single Metric)
- **Function:** Display single percentage or metric with circular gauge
- **Data Type:** Object `{ value: number, label: string, suffix?: string, color?: string, size?: 'small'|'medium'|'large' }`
- **Visual:** Circular progress ring with large centered value, color-coded by threshold (80%+=green, 60-79%=yellow, <60%=red)
- **Use Case:** Hero banners - Overall Adoption Rate 82%, Success Rate, Completion Percentage
- **Supports:** Hero layout

### 29. Horizontal Rule (HR)
- **Function:** Visual separator between sections
- **Data Type:** None (presentational only)
- **Visual:** Horizontal purple line using brand-primary color
- **Use Case:** Section dividers, visual breaks

### 30. Number Display
- **Function:** Display a standalone number with optional formatting
- **Data Type:** Number or object `{ value: number }`
- **Visual:** Large formatted number with fallback to 0
- **Use Case:** Standalone metrics, counts, statistics
- **Supports:** Hero layout

---

---

## 🦸 HERO Layout System

**Purpose:** Full-width purple banner at top of content for key metrics

**Allowed Assets in Hero:**
- Metric Card (with connected/full-width display mode)
- Gauge
- Number Display

**Display Modes:**
- **Spaced** (default): Cards separated with gaps
- **Connected**: Seamless full-width cards without gaps

**Visual:** Purple gradient background (`from-brand-primary to-brand-secondary`), white text, no borders between items when connected

**Use Case:** Dashboard headers, KPI banners, executive summaries

---

## 🔧 Legacy Renderers (4 Components)

These are maintained for backward compatibility with older content:

1. **RadialChartRenderer** - Single radial progress ring
2. **PieChartRenderer** - Legacy pie chart implementation  
3. **LineChartRenderer** - Legacy line chart implementation
4. **BarChartRenderer** - Legacy bar chart implementation

**Note:** New content should use the modern AssetRenderEngine versions (assets 1-4 above).

---

## Expression Syntax Support

Many text-based assets support rich expression syntax:

- `[[bold]]text[[/bold]]` - Bold formatting
- `[[italic]]text[[/italic]]` - Italic formatting  
- `[[highlight]]text[[/highlight]]` - Purple highlighted text
- `{{variable}}` - Dynamic variable substitution
- `\n` - Line breaks (with whitespace-pre-wrap)

Supported in: Text, Textarea, Rich Text, Quote, Executive Summaries (all text fields)

---

## D30 assets (26 modern + 4 legacy) can be tested at:  
**URL:** `http://localhost:5173/design-test`

This page demonstrates each asset with realistic example data and supports theme switching.

**Hero Layout Testing:**
Hero layouts can be tested in Template Builder by:
1. Creating a new section
2. Setting layout zone to "hero"
3. Adding metric cards, gauges, or numbers
4. Toggling display mode to "connected" for seamless appearance
**Brand Colors:**
- `--brand-primary` (Purple #431C5B)
- `--brand-secondary` (Pink #B21A53)
- `--brand-tertiary` (Navy #003366)

**Accent Colors:**
- `--accent-blue`, `--accent-green`, `--accent-yellow`, `--accent-red`

**Semantic Colors:**
- `--semantic-success`, `--semantic-warning`, `--semantic-error`

All colors are theme-aware (light/dark mode) and globally configurable.

---

## Testing

All 29 assets (25 modern + 4 legacy) can be tested at:  
**URL:** `http://localhost:5173/design-test`

This page demonstrates each asset with realistic example data and supports theme switching.
