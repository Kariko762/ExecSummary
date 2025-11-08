# Executive Summary CMS - Development Guide

## Project Overview

A WinForms-based Content Management System for editing Executive Summary JSON files with a tree structure interface, expression syntax toolbar, and file management capabilities.

---

## Table of Contents

1. [JSON File Structure](#json-file-structure)
2. [Expression Parser Syntax](#expression-parser-syntax)
3. [CMS Architecture](#cms-architecture)
4. [UI Components](#ui-components)
5. [File Management](#file-management)
6. [Validation & Error Handling](#validation--error-handling)
7. [Implementation Guidelines](#implementation-guidelines)

---

## JSON File Structure

### 1. Executive Summaries (`src/data/summaries/`)

**Filename Pattern:** `week-{mmm-dd-yyyy}.json` (e.g., `week-oct-31-2024.json`)

```json
{
  "id": "week-oct-31-2024",
  "week": "Week of October 31, 2024",
  "date": "2024-10-31",
  "executiveHighlights": [
    "Demo Studio registered {{currency:263}} demos with {{percent:48}} conversion rate",
    "Revenue target achieved: {{currency:1230000}} in won ACV",
    "{{badge:success}} Top performer: {{highlight:D1 Flex}} with 73 demos"
  ],
  "weeklyFocus": {
    "priorities": [
      "Complete {{highlight:D1 Microsite}} launch - Currently at {{percent:75}} completion",
      "Finalize Q4 revenue forecasting models"
    ],
    "challenges": [
      "Resource allocation for upcoming demos"
    ]
  },
  "organizationHighlights": [
    {
      "orgId": "digital-one",
      "summary": "{{trend:up}} Strong quarter with {{currency:1230000}} in wins"
    }
  ],
  "issuesBlockers": {
    "open": [
      {
        "id": "ib-001",
        "title": "Demo environment latency",
        "description": "Resolving network configuration issues",
        "severity": "high",
        "assignedTo": "Infrastructure Team"
      }
    ],
    "inProgress": [],
    "resolved": []
  },
  "risks": [
    {
      "id": "risk-001",
      "title": "Q4 Resource Constraints",
      "description": "Limited demo engineers for peak season",
      "probability": "medium",
      "impact": "high",
      "mitigation": "Hiring 2 contractors for Q4 coverage"
    }
  ]
}
```

**Key Fields:**
- **id**: Unique identifier (matches filename without extension)
- **week**: Display name shown in UI
- **date**: ISO date format (YYYY-MM-DD) for sorting
- **executiveHighlights**: Array of strings with expression syntax
- **weeklyFocus**: Object with priorities and challenges arrays
- **organizationHighlights**: Array linking to organization IDs
- **issuesBlockers**: Categorized issues (open, inProgress, resolved)
- **risks**: Array of risk objects with probability/impact assessment

---

### 2. Organizations (`src/data/organizations/`)

**Filename Pattern:** `{organization-id}.json` (e.g., `digital-one.json`)

```json
{
  "id": "digital-one",
  "name": "Digital One",
  "description": "Modern banking solutions for retail and commercial customers",
  "color": "#B21A53",
  "icon": "building-2",
  "metrics": {
    "activeDeals": 34,
    "wonACV": 1230000,
    "avgDealSize": 36176,
    "conversionRate": 48
  },
  "keyInitiatives": [
    "{{highlight:D1 Microsite}} - New demo landing page {{badge:in-progress}}",
    "Mobile banking demo refresh with {{highlight:Beacon}} integration"
  ],
  "recentWins": [
    {
      "client": "First National Bank",
      "product": "D1 Flex Mobile",
      "value": 125000,
      "date": "2024-10-15"
    }
  ],
  "teamComposition": {
    "solutionArchitects": 8,
    "demoEngineers": 12,
    "productManagers": 4
  },
  "upcomingMilestones": [
    {
      "title": "Q4 Product Launch",
      "date": "2024-12-01",
      "status": "on-track"
    }
  ]
}
```

**Key Fields:**
- **id**: Unique identifier (matches filename)
- **name**: Display name
- **description**: Brief overview
- **color**: Hex color for UI theming
- **icon**: Lucide icon name
- **metrics**: Key performance indicators
- **keyInitiatives**: Array with expression syntax
- **recentWins**: Array of deal objects
- **teamComposition**: Resource breakdown
- **upcomingMilestones**: Array of milestone objects

---

### 3. Performance Data (`src/data/performance/`)

**Filename Pattern:** `performance-{mmm-dd-yyyy}.json` (e.g., `performance-oct-31-2024.json`)

```json
{
  "id": "performance-oct-31-2024",
  "date": "2024-10-31",
  "displayName": "October 31, 2024",
  "demoStudio": {
    "demosRegistered": 263,
    "demosLinkedToDeals": 126,
    "wonACV": 1230000,
    "conversionRate": 48
  },
  "activityInsights": {
    "capitalMarkets": {
      "demoSupportHours": 1464,
      "demoPrepHours": 23358,
      "demoHours": 11057,
      "supportPercentage": 4,
      "prepPercentage": 65,
      "demoPercentage": 31
    },
    "banking": {
      "demoSupportHours": 684,
      "demoPrepHours": 8953,
      "demoHours": 6528,
      "supportPercentage": 4,
      "prepPercentage": 55,
      "demoPercentage": 41
    }
  },
  "topAssets": [
    { "name": "D1 Flex", "count": 73, "category": "Banking" },
    { "name": "D1 Flex Mobile 6.0", "count": 43, "category": "Banking" }
  ],
  "demosPerMonth": [
    { "month": "Jan", "demos": 37 },
    { "month": "Feb", "demos": 44 }
  ]
}
```

**Key Fields:**
- **id**: Unique identifier
- **date**: ISO date format (YYYY-MM-DD)
- **displayName**: Human-readable date
- **demoStudio**: Core metrics (demos, deals, revenue, conversion)
- **activityInsights**: LOB-specific hours and percentages
  - Hours: demoSupportHours, demoPrepHours, demoHours
  - Percentages: supportPercentage, prepPercentage, demoPercentage
- **topAssets**: Array of top demo products with counts
- **demosPerMonth**: Monthly demo counts for chart (Jan-Dec)

---

## Expression Parser Syntax

The application supports 12 expression types for rich text formatting:

### 1. **Currency** - `{{currency:value}}`
```
{{currency:1230000}} → $1,230,000
{{currency:50000}} → $50,000
```
**Rendering:** Green text with dollar sign and comma separators

---

### 2. **Percent** - `{{percent:value}}`
```
{{percent:48}} → 48%
{{percent:75.5}} → 75.5%
```
**Rendering:** Percentage symbol appended

---

### 3. **Icon** - `{{icon:iconName}}`
```
{{icon:check-circle}} → ✓ icon (Lucide React)
{{icon:alert-triangle}} → ⚠ icon
{{icon:trending-up}} → ↗ icon
```
**Rendering:** Inline SVG icon from Lucide React library

---

### 4. **Badge** - `{{badge:type}}`
```
{{badge:success}} → Green "Success" pill
{{badge:warning}} → Yellow "Warning" pill
{{badge:in-progress}} → Blue "In Progress" pill
{{badge:critical}} → Red "Critical" pill
```
**Rendering:** Colored rounded badge with text

**Badge Types:**
- `success` - Green background
- `warning` - Yellow background
- `in-progress` - Blue background
- `critical` - Red background
- `info` - Gray background

---

### 5. **Trend** - `{{trend:direction}}`
```
{{trend:up}} → ↑ (green arrow)
{{trend:down}} → ↓ (red arrow)
{{trend:flat}} → → (gray arrow)
```
**Rendering:** Colored arrow icon indicating direction

---

### 6. **Highlight** - `{{highlight:text}}`
```
{{highlight:D1 Microsite}} → "D1 Microsite" (purple highlighted)
{{highlight:Q4 Goals}} → "Q4 Goals" (purple highlighted)
```
**Rendering:** FIS eggplant purple text (#431C5B), semi-bold weight

---

### 7. **Bold** - `{{bold:text}}`
```
{{bold:Important Notice}} → **Important Notice**
```
**Rendering:** Font weight 600-700

---

### 8. **Link** - `{{link:url|text}}`
```
{{link:https://example.com|View Details}} → Clickable "View Details"
{{link:https://docs.fis.com|Documentation}} → Clickable "Documentation"
```
**Rendering:** Underlined link, opens in new tab

---

### 9. **Delta** - `{{delta:value}}`
```
{{delta:+12}} → +12 (green)
{{delta:-5}} → -5 (red)
{{delta:0}} → 0 (gray)
```
**Rendering:** Colored number with +/- prefix based on positive/negative

---

### 10. **Short** - `{{short:largeNumber}}`
```
{{short:1230000}} → 1.23M
{{short:45000}} → 45K
{{short:1500000000}} → 1.5B
```
**Rendering:** Abbreviated number format (K/M/B)

---

### 11. **Date** - `{{date:YYYY-MM-DD}}`
```
{{date:2024-10-31}} → October 31, 2024
{{date:2024-12-25}} → December 25, 2024
```
**Rendering:** Long date format (Month DD, YYYY)

---

### 12. **Metric** - `{{metric:label|value|unit}}`
```
{{metric:Revenue|1230000|dollars}} → Revenue: $1.23M
{{metric:Demos|263|count}} → Demos: 263
{{metric:Conversion|48|percent}} → Conversion: 48%
```
**Rendering:** Label + formatted value with appropriate unit

---

## CMS Architecture

### Technology Stack Recommendation

**Primary:** WinForms (C# .NET 6+)

**Alternative Options:**
- WPF (if more modern UI needed)
- Electron + React (cross-platform)
- Blazor Hybrid (web + desktop)

**Required Libraries:**
- **Newtonsoft.Json** or **System.Text.Json** - JSON parsing/serialization
- **Scintilla.NET** - Code editor control with syntax highlighting
- **TreeViewAdv** or **ObjectListView** - Enhanced tree/list controls

---

### Application Structure

```
ExecSummaryCMS/
├── Forms/
│   ├── MainForm.cs              // Main window with tree view + editor
│   ├── SummaryEditor.cs         // Weekly summary editor form
│   ├── OrganizationEditor.cs    // Organization editor form
│   ├── PerformanceEditor.cs     // Performance data editor form
│   └── ExpressionToolbar.cs     // Expression syntax toolbar control
├── Models/
│   ├── ExecutiveSummary.cs      // Summary data model
│   ├── Organization.cs          // Organization data model
│   ├── PerformanceData.cs       // Performance data model
│   └── ExpressionType.cs        // Expression syntax enum
├── Services/
│   ├── FileService.cs           // JSON file I/O operations
│   ├── ValidationService.cs     // Data validation logic
│   ├── ExpressionParser.cs      // Expression syntax parser
│   └── PreviewService.cs        // Live preview renderer
├── Utils/
│   ├── DateHelper.cs            // Date formatting utilities
│   ├── FileNamingHelper.cs      // Filename generation
│   └── BackupManager.cs         // Auto-backup system
└── Program.cs                   // Application entry point
```

---

## UI Components

### 1. Main Window Layout

```
┌─────────────────────────────────────────────────────────────┐
│  File  Edit  View  Tools  Help                              │
├─────────────┬───────────────────────────────────────────────┤
│             │  [New Summary] [New Org] [New Performance]    │
│   Tree      │  ┌─────────────────────────────────────────┐  │
│   View      │  │                                         │  │
│   ┌──┐      │  │    JSON Editor (Scintilla)              │  │
│   ├──Summaries│  │    - Syntax highlighting             │  │
│   │  ├─Oct 31│  │    - Line numbers                     │  │
│   │  ├─Oct 24│  │    - Auto-complete                    │  │
│   │  └─Oct 17│  │                                         │  │
│   ├──Organizations                                        │  │
│   │  ├─Digital One                                        │  │
│   │  ├─Capital Markets                                    │  │
│   │  └─Banking Solutions                                  │  │
│   └──Performance│                                         │  │
│      ├─Oct 31 │  │                                         │  │
│      └─Oct 24 │  └─────────────────────────────────────────┘  │
│             │                                                 │
│             │  Expression Toolbar:                            │
│             │  [Currency] [Percent] [Icon] [Badge] [Trend]   │
│             │  [Highlight] [Bold] [Link] [Delta] [Date]      │
│             │                                                 │
│             │  [Validate] [Preview] [Save] [Cancel]          │
└─────────────┴─────────────────────────────────────────────────┘
```

---

### 2. Tree View Structure

**Root Nodes:**
- 📋 **Summaries** (folder)
  - 📄 Week of October 31, 2024
  - 📄 Week of October 24, 2024
  - 📄 Week of October 17, 2024
- 🏢 **Organizations** (folder)
  - 📄 Digital One
  - 📄 Capital Markets Solutions
  - 📄 Banking Products
- 📊 **Performance** (folder)
  - 📄 October 31, 2024
  - 📄 October 24, 2024

**Features:**
- Double-click to open in editor
- Right-click context menu (Edit, Delete, Duplicate, Export)
- Drag-and-drop to reorder
- Color-coded icons by type
- Search/filter capability

---

### 3. Expression Toolbar

**Button Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  💰 Currency  │  % Percent  │  🎨 Icon  │  🏷️ Badge  │  📈 Trend│
├──────────────────────────────────────────────────────────────┤
│  ✨ Highlight │  B Bold  │  🔗 Link  │  △ Delta  │  📅 Date  │
├──────────────────────────────────────────────────────────────┤
│  📊 Short  │  📏 Metric  │              [ Insert Expression ] │
└──────────────────────────────────────────────────────────────┘
```

**Functionality:**
- Click button → Opens dialog for expression parameters
- Inserts `{{type:value}}` at cursor position
- Shows preview of rendered expression
- Auto-completes expression syntax

**Expression Dialog Example (Currency):**
```
┌─────────────────────────────┐
│  Insert Currency Expression │
├─────────────────────────────┤
│  Amount: [____________]     │
│                             │
│  Preview: $0                │
│                             │
│  [ Insert ]  [ Cancel ]     │
└─────────────────────────────┘
```

---

### 4. JSON Editor Features

**Requirements:**
- Syntax highlighting (JSON format)
- Line numbers
- Bracket matching
- Auto-indentation (2 spaces)
- Validation on-the-fly
- Expression syntax highlighting (custom)
- Auto-complete for expression types
- Undo/Redo (Ctrl+Z / Ctrl+Y)
- Find/Replace (Ctrl+F / Ctrl+H)

**Custom Syntax Highlighting:**
- Expression patterns `{{...}}` highlighted in purple
- Expression types (currency, percent, etc.) in bold
- Values within expressions in green
- Invalid expressions underlined in red

---

### 5. Preview Panel (Optional)

**Split-screen view:**
- Left: JSON editor
- Right: Live rendered preview showing how expressions will appear

**Preview Rendering:**
- Currency → $1,230,000 (green)
- Percent → 48% (normal)
- Badge → [Success] (green pill)
- Highlight → Purple text
- Trend → ↑ (green arrow)

---

## File Management

### 1. File Operations

**New File:**
1. User selects type (Summary / Organization / Performance)
2. Dialog prompts for date/name
3. Generate unique ID based on filename pattern
4. Create JSON with template structure
5. Open in editor

**Template Structures:**

```csharp
// Summary Template
{
  "id": "",
  "week": "",
  "date": "",
  "executiveHighlights": [],
  "weeklyFocus": {
    "priorities": [],
    "challenges": []
  },
  "organizationHighlights": [],
  "issuesBlockers": {
    "open": [],
    "inProgress": [],
    "resolved": []
  },
  "risks": []
}

// Organization Template
{
  "id": "",
  "name": "",
  "description": "",
  "color": "#431C5B",
  "icon": "building-2",
  "metrics": {},
  "keyInitiatives": [],
  "recentWins": [],
  "teamComposition": {},
  "upcomingMilestones": []
}

// Performance Template
{
  "id": "",
  "date": "",
  "displayName": "",
  "demoStudio": {},
  "activityInsights": {
    "capitalMarkets": {},
    "banking": {}
  },
  "topAssets": [],
  "demosPerMonth": []
}
```

---

### 2. File Naming Rules

**Summaries:**
- Pattern: `week-{mmm-dd-yyyy}.json`
- Example: `week-oct-31-2024.json`
- Auto-generate from selected date
- Lowercase month abbreviation

**Organizations:**
- Pattern: `{kebab-case-name}.json`
- Example: `digital-one.json`
- Convert spaces to hyphens
- All lowercase
- Remove special characters

**Performance:**
- Pattern: `performance-{mmm-dd-yyyy}.json`
- Example: `performance-oct-31-2024.json`
- Same date format as summaries

---

### 3. Auto-Loading System

**How It Works in React:**
```typescript
import.meta.glob('./summaries/*.json', { eager: true })
```

**What CMS Must Ensure:**
- All files follow naming conventions
- Files are in correct directories
- JSON is valid and parseable
- Required fields are present
- IDs match filenames (without extension)

**Validation Before Save:**
```csharp
public bool ValidateFile(string filePath, FileType type)
{
    // Check filename pattern
    if (!MatchesNamingPattern(filePath, type))
        return false;
    
    // Parse JSON
    var json = File.ReadAllText(filePath);
    var obj = JsonConvert.DeserializeObject<dynamic>(json);
    
    // Check required fields
    if (obj.id == null || obj.date == null)
        return false;
    
    // Check ID matches filename
    var expectedId = Path.GetFileNameWithoutExtension(filePath);
    if (obj.id != expectedId)
        return false;
    
    return true;
}
```

---

### 4. Backup System

**Auto-Backup Strategy:**
- Save original file to `.backup/` folder before editing
- Timestamp backup files: `{filename}.{timestamp}.bak`
- Keep last 5 backups per file
- Restore from backup option in File menu

**Implementation:**
```csharp
public void CreateBackup(string filePath)
{
    var backupDir = Path.Combine(
        Path.GetDirectoryName(filePath), 
        ".backup"
    );
    Directory.CreateDirectory(backupDir);
    
    var timestamp = DateTime.Now.ToString("yyyyMMdd-HHmmss");
    var backupFile = Path.Combine(
        backupDir,
        $"{Path.GetFileName(filePath)}.{timestamp}.bak"
    );
    
    File.Copy(filePath, backupFile);
    CleanOldBackups(filePath, 5); // Keep only 5 most recent
}
```

---

## Validation & Error Handling

### 1. JSON Schema Validation

**Required Field Checks:**

```csharp
// Summary Validation
public class SummaryValidator
{
    public ValidationResult Validate(ExecutiveSummary summary)
    {
        var errors = new List<string>();
        
        if (string.IsNullOrEmpty(summary.Id))
            errors.Add("ID is required");
            
        if (string.IsNullOrEmpty(summary.Week))
            errors.Add("Week is required");
            
        if (!DateTime.TryParse(summary.Date, out _))
            errors.Add("Invalid date format (must be YYYY-MM-DD)");
            
        if (summary.ExecutiveHighlights == null || 
            summary.ExecutiveHighlights.Length == 0)
            errors.Add("At least one executive highlight required");
            
        return new ValidationResult(errors);
    }
}
```

---

### 2. Expression Syntax Validation

**Parser Implementation:**

```csharp
public class ExpressionValidator
{
    private static readonly Dictionary<string, Func<string, bool>> Validators = new()
    {
        { "currency", ValidateCurrency },
        { "percent", ValidatePercent },
        { "icon", ValidateIcon },
        { "badge", ValidateBadge },
        { "trend", ValidateTrend },
        { "highlight", ValidateHighlight },
        { "bold", ValidateBold },
        { "link", ValidateLink },
        { "delta", ValidateDelta },
        { "short", ValidateShort },
        { "date", ValidateDate },
        { "metric", ValidateMetric }
    };
    
    public List<ExpressionError> ValidateExpressions(string text)
    {
        var errors = new List<ExpressionError>();
        var regex = new Regex(@"\{\{([^:]+):([^}]+)\}\}");
        
        foreach (Match match in regex.Matches(text))
        {
            var type = match.Groups[1].Value;
            var value = match.Groups[2].Value;
            
            if (!Validators.ContainsKey(type))
            {
                errors.Add(new ExpressionError
                {
                    Position = match.Index,
                    Message = $"Unknown expression type: {type}"
                });
                continue;
            }
            
            if (!Validators[type](value))
            {
                errors.Add(new ExpressionError
                {
                    Position = match.Index,
                    Message = $"Invalid value for {type}: {value}"
                });
            }
        }
        
        return errors;
    }
    
    private static bool ValidateCurrency(string value)
        => decimal.TryParse(value, out _);
        
    private static bool ValidatePercent(string value)
        => decimal.TryParse(value, out _);
        
    private static bool ValidateIcon(string value)
        => LucideIcons.Contains(value); // Check against icon list
        
    private static bool ValidateBadge(string value)
        => new[] { "success", "warning", "in-progress", "critical", "info" }
            .Contains(value);
            
    private static bool ValidateTrend(string value)
        => new[] { "up", "down", "flat" }.Contains(value);
        
    private static bool ValidateDate(string value)
        => DateTime.TryParseExact(value, "yyyy-MM-dd", null, 
            DateTimeStyles.None, out _);
            
    private static bool ValidateLink(string value)
    {
        var parts = value.Split('|');
        return parts.Length == 2 && Uri.IsWellFormedUriString(parts[0], UriKind.Absolute);
    }
    
    private static bool ValidateMetric(string value)
    {
        var parts = value.Split('|');
        return parts.Length == 3;
    }
}
```

---

### 3. Real-Time Validation UI

**Editor Features:**
- Red squiggly underlines for syntax errors
- Yellow warning icons for validation issues
- Error list panel showing all problems
- Click error to jump to line/position
- Auto-fix suggestions where possible

**Error Panel:**
```
┌───────────────────────────────────────────────────┐
│ ⚠ Errors (2)  ℹ Warnings (1)                      │
├───────────────────────────────────────────────────┤
│ ❌ Line 5: Unknown expression type: currancy      │
│ ❌ Line 12: Invalid date format (use YYYY-MM-DD)  │
│ ⚠️ Line 8: Consider using {{short:...}} for large│
│           numbers                                 │
└───────────────────────────────────────────────────┘
```

---

### 4. Save Validation

**Pre-Save Checklist:**
```csharp
public SaveResult SaveFile(string filePath, string content)
{
    // 1. JSON validation
    try
    {
        var json = JsonConvert.DeserializeObject<dynamic>(content);
    }
    catch (JsonException ex)
    {
        return SaveResult.Error($"Invalid JSON: {ex.Message}");
    }
    
    // 2. Required fields validation
    var validationResult = ValidateRequiredFields(content);
    if (!validationResult.IsValid)
    {
        return SaveResult.Error($"Validation failed: {validationResult.Errors}");
    }
    
    // 3. Expression syntax validation
    var expressionErrors = ValidateExpressions(content);
    if (expressionErrors.Any())
    {
        var proceed = MessageBox.Show(
            "File contains expression errors. Save anyway?",
            "Validation Warning",
            MessageBoxButtons.YesNo,
            MessageBoxIcon.Warning
        );
        
        if (proceed != DialogResult.Yes)
            return SaveResult.Cancelled();
    }
    
    // 4. Create backup
    CreateBackup(filePath);
    
    // 5. Save file
    File.WriteAllText(filePath, content);
    
    return SaveResult.Success();
}
```

---

## Implementation Guidelines

### Phase 1: Core Infrastructure (Week 1-2)

**Tasks:**
1. Set up WinForms project structure
2. Implement data models (ExecutiveSummary, Organization, PerformanceData)
3. Create FileService for JSON I/O
4. Build ValidationService with schema checks
5. Implement basic tree view navigation
6. Create simple text editor (before Scintilla integration)

**Deliverable:** Load existing JSON files, display in tree, edit as text, save changes

---

### Phase 2: Expression System (Week 3)

**Tasks:**
1. Build ExpressionParser class
2. Implement all 12 expression validators
3. Create ExpressionToolbar control
4. Add expression insertion dialogs
5. Implement syntax highlighting for expressions
6. Add real-time validation with error markers

**Deliverable:** Full expression syntax support with validation

---

### Phase 3: Advanced Editor (Week 4)

**Tasks:**
1. Integrate Scintilla.NET for code editing
2. Configure JSON syntax highlighting
3. Add custom expression highlighting
4. Implement auto-complete for expressions
5. Create live preview panel
6. Add find/replace functionality

**Deliverable:** Professional-grade JSON editor with live preview

---

### Phase 4: Polish & Features (Week 5)

**Tasks:**
1. Implement auto-backup system
2. Add file operations (new, duplicate, delete, export)
3. Create import/export functionality
4. Add keyboard shortcuts (Ctrl+S, Ctrl+N, etc.)
5. Implement search/filter in tree view
6. Add settings/preferences dialog
7. Create user documentation

**Deliverable:** Production-ready CMS application

---

### Phase 5: Testing & Deployment (Week 6)

**Tasks:**
1. Unit tests for validators and parsers
2. Integration tests for file operations
3. User acceptance testing
4. Bug fixes and optimizations
5. Create installer/deployment package
6. Write admin documentation

**Deliverable:** Tested and deployed CMS ready for use

---

## Technical Considerations

### Performance Optimization

**Large File Handling:**
- Lazy load tree nodes (load on expand)
- Async file operations to prevent UI freezing
- Cache parsed JSON in memory
- Debounce validation checks (500ms delay after typing)

**Memory Management:**
- Dispose file streams properly
- Clear editor content when switching files
- Use weak references for cached data
- Implement IDisposable pattern

---

### Error Recovery

**Auto-Save:**
- Save draft to temp file every 30 seconds
- Restore from temp file on crash recovery
- Clear temp file on successful save

**Crash Protection:**
```csharp
Application.ThreadException += (s, e) =>
{
    // Log error
    Logger.LogException(e.Exception);
    
    // Save current work
    AutoSaveCurrentFile();
    
    // Show friendly error message
    MessageBox.Show(
        "An error occurred. Your work has been saved.",
        "Error",
        MessageBoxButtons.OK,
        MessageBoxIcon.Error
    );
};
```

---

### Security Considerations

**File Access:**
- Validate all file paths to prevent directory traversal
- Restrict file operations to designated folders
- Sanitize filenames to prevent injection attacks
- Use safe JSON parsing (prevent deserialization attacks)

**Validation:**
- Never execute code from JSON files
- Sanitize all user input before saving
- Validate URLs in link expressions
- Limit file sizes (e.g., max 10MB per file)

---

## Future Enhancements

### Version 2.0 Features

1. **Multi-User Support**
   - File locking mechanism
   - Change tracking and history
   - User permissions and roles

2. **Advanced Features**
   - Diff viewer for comparing versions
   - Merge tool for resolving conflicts
   - Batch operations (update multiple files)
   - Template system for common patterns

3. **Integration**
   - Git integration for version control
   - REST API for external data import
   - Export to PDF/Excel
   - Email notifications for changes

4. **Analytics**
   - Usage statistics dashboard
   - Expression usage analytics
   - File change frequency reports
   - Validation error trends

---

## Appendix

### A. Lucide Icons Reference

Common icons used in the application:
- `building-2` - Organizations
- `trending-up` / `trending-down` - Trends
- `check-circle` - Success
- `alert-triangle` - Warning
- `x-circle` - Error
- `info` - Information
- `calendar` - Dates
- `dollar-sign` - Currency
- `percent` - Percentages
- `users` - Teams

Full list: https://lucide.dev/icons/

---

### B. Sample Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New file |
| Ctrl+O | Open file |
| Ctrl+S | Save file |
| Ctrl+Shift+S | Save all |
| Ctrl+W | Close file |
| Ctrl+F | Find |
| Ctrl+H | Replace |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+E | Insert expression |
| F5 | Refresh tree view |
| F12 | Validate current file |

---

### C. Expression Cheat Sheet

Quick reference for users:

```
Currency:   {{currency:1230000}}
Percent:    {{percent:48}}
Icon:       {{icon:check-circle}}
Badge:      {{badge:success}}
Trend:      {{trend:up}}
Highlight:  {{highlight:Important Text}}
Bold:       {{bold:Bold Text}}
Link:       {{link:https://example.com|Click Here}}
Delta:      {{delta:+12}}
Short:      {{short:1230000}}
Date:       {{date:2024-10-31}}
Metric:     {{metric:Revenue|1230000|dollars}}
```

---

## Contact & Support

For questions or issues with CMS development, refer to:
- Main project repository: `Kariko762/ExecSummary`
- Expression parser source: `src/utils/expressionParser.tsx`
- JSON examples: `src/data/` folders

---

**Document Version:** 1.0  
**Last Updated:** November 5, 2024  
**Author:** Development Team
