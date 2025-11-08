# Executive Summary Dashboard - System Architecture & Developer Guide

> **Complete technical documentation for developers picking up this project**

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Folder Structure](#folder-structure)
5. [Data Flow](#data-flow)
6. [Component Architecture](#component-architecture)
7. [Key Features & How They Work](#key-features--how-they-work)
8. [Expression Engine](#expression-engine)
9. [Adding New Content](#adding-new-content)
10. [State Management](#state-management)
11. [Styling System](#styling-system)
12. [Build & Deployment](#build--deployment)
13. [Common Tasks](#common-tasks)

---

## Project Overview

### What is this?
An interactive executive dashboard for displaying:
- **Weekly Executive Summaries** - Performance metrics, department data, strategic initiatives
- **ExecutiveIQ Articles** - Strategic insights, market analysis, thought leadership
- **Organization Dashboards** - Business unit performance and activities
- **Strategic Initiatives** - Detailed project proposals with ROI, timelines, SWOT analysis

### Key Capabilities
- 📊 **Data Visualization** - Charts, metrics, progress bars using Recharts
- 🎨 **Expression Engine** - Rich text formatting with custom syntax
- 📥 **Image Export** - Full-page PNG export using html2canvas
- 🎭 **Presentation Mode** - Clean view for executive presentations
- 🌓 **Dark/Light Mode** - Theme switching with localStorage persistence
- 🔍 **Search** - Filter summaries by keywords
- 📱 **Responsive** - Mobile-first design with Tailwind CSS

---

## Technology Stack

### Core Framework
- **React 18.2.0** - UI library with functional components and hooks
- **TypeScript 5.2.2** - Type safety and better developer experience
- **Vite 5.0.8** - Fast build tool and dev server with HMR (Hot Module Replacement)

### UI & Styling
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
- **Framer Motion 10.16.16** - Animation library for smooth transitions
- **Lucide React 0.294.0** - Icon library (modern, consistent icons)

### Data Visualization
- **Recharts 2.10.3** - React charting library (bar charts, radial charts, tooltips)

### Routing & Navigation
- **React Router DOM 6.20.0** - Client-side routing for multi-page navigation

### Image Export
- **html2canvas 1.4.1** - Capture DOM elements as high-resolution PNG images

### Development Tools
- **ESLint** - Code linting with TypeScript support
- **PostCSS + Autoprefixer** - CSS processing and browser compatibility

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Header  │  │ Timeline │  │Dashboard │  │  Modals  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      React Components                           │
│  • Stateful components with hooks (useState, useEffect)        │
│  • Framer Motion animations                                    │
│  • Context providers (Theme, Presentation)                     │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │  Summaries    │  │ ExecutiveIQ   │  │ Organizations │      │
│  │  (JSON files) │  │  (JSON files) │  │  (JSON files) │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Utility Services                           │
│  • Expression Parser (rich text rendering)                     │
│  • Data Loaders (file imports)                                 │
│  • Image Export (html2canvas)                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Pattern

```
JSON Files → Loaders → TypeScript Types → React Components → UI
     ↓
  Validation via TypeScript interfaces
     ↓
  Expression Parser transforms text
     ↓
  Recharts renders visualizations
     ↓
  User interactions (clicks, search)
     ↓
  State updates (useState hooks)
     ↓
  UI re-renders
```

---

## Folder Structure

```
ExecSummary/
├── public/                          # Static assets (served as-is)
│   ├── FIS-Logo.png                # Company logo (changeable)
│   └── ...other static files
│
├── src/                             # Source code
│   ├── components/                  # React components
│   │   ├── Dashboard.tsx           # Performance metrics dashboard
│   │   ├── Header.tsx              # Top navigation with search & theme
│   │   ├── Timeline.tsx            # Horizontal timeline of summaries
│   │   ├── SummaryCard.tsx         # Summary preview cards
│   │   ├── SummaryDetail.tsx       # Full summary modal
│   │   ├── ExecutiveIQDetail.tsx   # ExecutiveIQ article modal
│   │   ├── OrganizationDashboard.tsx  # Business unit tiles
│   │   ├── OrganizationModal.tsx   # Detailed organization view
│   │   ├── StrategicInitiativeModal.tsx  # Project proposal modal
│   │   ├── ActivityHoursChart.tsx  # Bar chart for hours by LOB
│   │   ├── TopAssetsChart.tsx      # Asset usage visualization
│   │   ├── KeyActivityInsights.tsx # Activity metrics cards
│   │   ├── WeeklyFocus.tsx         # Focus area checklist
│   │   ├── IssuesBlockers.tsx      # Issues and blockers list
│   │   └── StickyNav.tsx           # Jump navigation for sections
│   │
│   ├── contexts/                    # React Context providers
│   │   ├── ThemeContext.tsx        # Dark/light mode state
│   │   └── PresentationContext.tsx # Presentation mode state
│   │
│   ├── data/                        # JSON data files (the content)
│   │   ├── summaries/              # Weekly executive summaries
│   │   │   ├── week-oct-24-2024.json
│   │   │   ├── week-oct-31-2024.json
│   │   │   └── ...more summaries
│   │   │
│   │   ├── executive-iq/           # Strategic insight articles
│   │   │   ├── digital-first-ai-strategy-nov-2025.json
│   │   │   └── ...more articles
│   │   │
│   │   ├── organizations/          # Organization data
│   │   │   ├── banking-na.json
│   │   │   ├── capital-markets.json
│   │   │   ├── int-banking.json
│   │   │   └── payments.json
│   │   │
│   │   ├── initiatives/            # Strategic initiative proposals
│   │   │   └── ai-revops-demo-intelligence.json
│   │   │
│   │   ├── performance/            # Performance metrics by date
│   │   │   ├── performance-oct-24-2024.json
│   │   │   └── performance-oct-31-2024.json
│   │   │
│   │   ├── summaries-loader.ts     # Loads summary JSON files
│   │   ├── timeline-loader.ts      # Combines summaries + ExecutiveIQ
│   │   ├── organizations-loader.ts # Loads organization data
│   │   └── performance-loader.ts   # Loads performance metrics
│   │
│   ├── types/                       # TypeScript type definitions
│   │   └── index.ts                # All interfaces and types
│   │
│   ├── utils/                       # Utility functions
│   │   └── expressionParser.tsx    # Rich text expression engine
│   │
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # Application entry point
│   ├── index.css                    # Global styles + Tailwind
│   ├── print.css                    # Print-specific styles
│   └── vite-env.d.ts               # Vite environment types
│
├── RoobertFont/                     # Custom Roobert font files
│   ├── Roobert-Regular.woff2
│   ├── Roobert-Medium.woff2
│   ├── Roobert-SemiBold.woff2
│   ├── Roobert-Bold.woff2
│   ├── Roobert-Heavy.woff2
│   └── Roobert-Light.woff2
│
├── node_modules/                    # Dependencies (npm packages)
├── dist/                            # Production build output
│
├── package.json                     # Project dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── .gitignore                       # Git ignore rules
│
├── README.md                        # User-facing documentation
├── DEPLOYMENT.md                    # Deployment instructions
├── SYSTEM_ARCHITECTURE.md          # This file (developer guide)
└── ...other documentation files
```

---

## Data Flow

### How Data Moves Through the System

#### 1. **Data Creation (JSON Files)**
```json
// src/data/summaries/week-oct-31-2024.json
{
  "id": "week-oct-31-2024",
  "quarter": "Oct 31",
  "year": 2024,
  "title": "Demo Services Group - Weekly Executive Update",
  "keyMetrics": {
    "revenue": 1230000,
    "growth": 48
  },
  "departments": [...],
  "initiatives": [...]
}
```

#### 2. **Data Loading (Loaders)**
```typescript
// src/data/timeline-loader.ts
const summaryModules = import.meta.glob('./summaries/*.json', { eager: true });
const summaries: ExecutiveSummary[] = Object.values(summaryModules)
  .map((module: any) => module.default);

// Vite automatically imports all JSON files matching the pattern
```

#### 3. **Type Safety (TypeScript)**
```typescript
// src/types/index.ts
export interface ExecutiveSummary {
  id: string;
  quarter: string;
  year: number;
  title: string;
  keyMetrics: {
    revenue: number;
    growth: number;
  };
  // TypeScript validates data matches this structure
}
```

#### 4. **Component Consumption**
```typescript
// src/App.tsx
import { timelineItems } from './data/timeline-loader';

function App() {
  const [selectedSummary, setSelectedSummary] = useState<TimelineItem | null>(null);
  
  return (
    <Timeline 
      summaries={timelineItems}  // Pass data to component
      onSelectSummary={setSelectedSummary}  // Handle user interaction
    />
  );
}
```

#### 5. **Rendering**
```typescript
// src/components/Timeline.tsx
{summaries.map((summary) => (
  <SummaryCard 
    key={summary.id}
    summary={summary}
    onClick={() => onSelectSummary(summary)}
  />
))}
```

---

## Component Architecture

### Component Hierarchy

```
App.tsx (Root)
├── ThemeProvider (Context)
│   └── PresentationProvider (Context)
│       ├── Header
│       │   ├── Search
│       │   ├── Theme Toggle
│       │   ├── Presentation Mode Toggle
│       │   └── Export Dashboard Button
│       │
│       ├── StickyNav (section jump links)
│       │
│       ├── Router (React Router)
│       │   ├── Route: "/" (Dashboard)
│       │   │   ├── Timeline
│       │   │   │   └── SummaryCard (multiple)
│       │   │   │
│       │   │   ├── Dashboard
│       │   │   │   ├── ActivityHoursChart
│       │   │   │   ├── TopAssetsChart
│       │   │   │   └── KeyActivityInsights
│       │   │   │
│       │   │   ├── OrganizationDashboard
│       │   │   │   └── OrganizationTile (multiple)
│       │   │   │
│       │   │   ├── SummaryDetail (Modal)
│       │   │   │   ├── WeeklyFocus
│       │   │   │   ├── IssuesBlockers
│       │   │   │   └── Export Image Button
│       │   │   │
│       │   │   └── ExecutiveIQDetail (Modal)
│       │   │       └── Export Image Button
│       │   │
│       │   └── Route: "/strategic-initiatives"
│       │       └── StrategicInitiativesDashboard
│       │           └── StrategicInitiativeModal
│       │               └── Export Image Button
│       │
│       └── OrganizationModal (if selected)
```

### Component Communication Patterns

#### **1. Props Down (Parent → Child)**
```typescript
// Parent passes data to child
<SummaryCard 
  summary={summaryData}      // Data
  onClick={handleClick}       // Callback
  index={0}                   // Config
/>
```

#### **2. Callbacks Up (Child → Parent)**
```typescript
// Child notifies parent of user action
<Timeline
  summaries={data}
  onSelectSummary={(summary) => setSelectedSummary(summary)}
/>
```

#### **3. Context (Global State)**
```typescript
// Theme available to all descendants
const { theme, toggleTheme } = useTheme();
```

#### **4. Local State (Component-Specific)**
```typescript
// Each component manages its own state
const [isOpen, setIsOpen] = useState(false);
const [activeSection, setActiveSection] = useState('overview');
```

---

## Key Features & How They Work

### 1. **Timeline System**

**Purpose:** Display chronological mix of Executive Summaries and ExecutiveIQ articles

**How it works:**
```typescript
// 1. Loader combines both data types
export const timelineItems: TimelineItem[] = [...summaries, ...execIQArticles]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// 2. Type guards distinguish between types
export function isExecutiveSummary(item: TimelineItem): item is ExecutiveSummary {
  return 'departments' in item;  // Summaries have departments
}

export function isExecutiveIQ(item: TimelineItem): item is ExecutiveIQ {
  return 'category' in item;  // ExecutiveIQ has category field
}

// 3. Component renders differently based on type
{summaries.map((summary) => {
  const isIQ = isExecutiveIQ(summary);
  const Icon = isIQ ? Lightbulb : FileText;
  // ... render accordingly
})}
```

**Key files:**
- `src/data/timeline-loader.ts` - Combines data sources
- `src/components/Timeline.tsx` - Renders timeline
- `src/types/index.ts` - Type definitions

---

### 2. **Expression Engine (Rich Text)**

**Purpose:** Transform plain text into formatted content with colors, badges, metrics

**Syntax Examples:**
```
[[highlight]]important text[[/highlight]]  → Yellow background
[[bold]]strong text[[/bold]]                → Bold font
[[metric]]87%[[/metric]]                    → Colored number badge
[[positive]]good news[[/positive]]          → Green highlight
[[negative]]bad news[[/negative]]           → Red highlight

{{icon:rocket}}                             → 🚀 icon
{{badge:new}}                               → NEW badge
{{metric:241|demos|activity}}               → Metric card with icon
```

**How it works:**
```typescript
// 1. Parser finds expressions in text
const regex = /\[\[(\w+)\]\](.*?)\[\[\/\1\]\]/g;
const matches = text.matchAll(regex);

// 2. Converts to structured elements
parseExpression(text) → [
  { type: 'text', content: 'Normal text ' },
  { type: 'expression', expressionType: 'highlight', value: 'important' },
  { type: 'text', content: ' more text' }
]

// 3. Renders as React components
renderWithExpressions(text) → 
  <React.Fragment>
    Normal text 
    <span className="bg-yellow-200">important</span>
    more text
  </React.Fragment>
```

**Key file:** `src/utils/expressionParser.tsx`

**Usage in components:**
```typescript
import { renderWithExpressions } from '../utils/expressionParser';

<p>{renderWithExpressions(article.executiveSummary)}</p>
```

---

### 3. **Image Export (PNG Download)**

**Purpose:** Capture entire modal/dashboard as high-resolution PNG

**How it works:**
```typescript
const handleExportImage = async () => {
  // 1. Find the content container
  const contentDiv = document.querySelector('.summary-content') as HTMLElement;
  
  // 2. Temporarily expand to full height (remove scrolling)
  contentDiv.style.overflow = 'visible';
  contentDiv.style.maxHeight = 'none';
  
  // 3. Capture with html2canvas
  const canvas = await html2canvas(contentDiv, {
    scale: 2,                 // 2x resolution (high quality)
    useCORS: true,           // Allow cross-origin images
    backgroundColor: '#ffffff' // White background
  });
  
  // 4. Convert to blob and download
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `executive-summary-${date}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  });
  
  // 5. Restore original styles
  contentDiv.style.overflow = originalOverflow;
  contentDiv.style.maxHeight = originalMaxHeight;
};
```

**Implemented in:**
- `SummaryDetail.tsx` - Executive Summary export
- `ExecutiveIQDetail.tsx` - ExecutiveIQ export
- `StrategicInitiativeModal.tsx` - Strategic Initiative export
- `Header.tsx` - Dashboard export

---

### 4. **Theme System (Dark/Light Mode)**

**How it works:**
```typescript
// 1. Context stores theme state
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Load from localStorage on mount
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    // Apply to document and save to localStorage
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 2. Components use the hook
const { theme, toggleTheme } = useTheme();

// 3. Tailwind applies dark: variants
<div className="bg-white dark:bg-gray-900">
```

**Key file:** `src/contexts/ThemeContext.tsx`

---

### 5. **Presentation Mode**

**Purpose:** Clean view for executive presentations (hides header, nav, clutter)

**How it works:**
```typescript
// 1. Context stores presentation state
const [isPresentationMode, setIsPresentationMode] = useState(false);

// 2. Components conditionally hide elements
{!isPresentationMode && <Header />}

// 3. Tailwind utility class
<div className="no-print">  // Hidden in presentation mode
```

**Key file:** `src/contexts/PresentationContext.tsx`

---

### 6. **Search & Filtering**

**How it works:**
```typescript
// 1. Header captures search input
const [searchQuery, setSearchQuery] = useState('');
<input onChange={(e) => setSearchQuery(e.target.value)} />

// 2. App filters data
const filteredSummaries = timelineItems.filter(summary => {
  const searchLower = searchQuery.toLowerCase();
  return (
    summary.title.toLowerCase().includes(searchLower) ||
    summary.quarter.toLowerCase().includes(searchLower) ||
    (isExecutiveSummary(summary) && 
     summary.highlights.some(h => h.toLowerCase().includes(searchLower)))
  );
});

// 3. Pass filtered data to components
<Timeline summaries={filteredSummaries} />
```

---

### 7. **Scroll-Based Navigation**

**Purpose:** Highlight active section in sticky nav as user scrolls

**How it works:**
```typescript
useEffect(() => {
  const handleScroll = (e: Event) => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop;
    
    // Show sticky nav after scrolling 100px
    setShowNav(scrollTop > 100);
    
    // Detect which section is in view
    const sections = ['overview', 'implications', 'recommendations'];
    for (const sectionId of sections) {
      const element = document.getElementById(sectionId);
      const rect = element.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= 300) {
        setActiveSection(sectionId);  // Highlight in nav
        break;
      }
    }
  };

  const contentDiv = document.querySelector('.modal-content');
  contentDiv?.addEventListener('scroll', handleScroll);
  return () => contentDiv?.removeEventListener('scroll', handleScroll);
}, []);
```

**Used in:**
- `ExecutiveIQDetail.tsx`
- `SummaryDetail.tsx`
- `StrategicInitiativeModal.tsx`

---

### 8. **Data Visualization (Charts)**

**Technology:** Recharts library

**Example - Bar Chart:**
```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Banking', Support: 5234, Prep: 1892, Demo: 3481 },
  { name: 'Capital Markets', Support: 10942, Prep: 4913, Demo: 10447 }
];

<BarChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="Support" stackId="a" fill="#B21A53" />
  <Bar dataKey="Prep" stackId="a" fill="#431C5B" />
  <Bar dataKey="Demo" stackId="a" fill="#1D1F48" />
</BarChart>
```

**Chart components:**
- `ActivityHoursChart.tsx` - Stacked bar chart
- `TopAssetsChart.tsx` - Bar chart with counts
- `SummaryDetail.tsx` - Radial bar chart for department performance

---

## Expression Engine

### Complete Syntax Reference

| Expression | Syntax | Result | Use Case |
|------------|--------|--------|----------|
| **Highlight** | `[[highlight]]text[[/highlight]]` | <span style="background:yellow">text</span> | Important callouts |
| **Bold** | `[[bold]]text[[/bold]]` | **text** | Emphasis |
| **Metric** | `[[metric]]87%[[/metric]]` | <span style="color:#B21A53;font-weight:bold">87%</span> | Numbers, percentages |
| **Positive** | `[[positive]]good[[/positive]]` | <span style="background:lightgreen">good</span> | Success, growth |
| **Negative** | `[[negative]]bad[[/negative]]` | <span style="background:lightcoral">bad</span> | Issues, decline |
| **Icon** | `{{icon:rocket}}` | 🚀 | Visual indicators |
| **Badge** | `{{badge:new}}` | <span style="background:#B21A53;color:white;padding:2px 6px;border-radius:4px">NEW</span> | Status labels |
| **Full Metric** | `{{metric:241\|demos\|activity}}` | Card with icon | Detailed metrics |
| **Currency** | `{{currency:1200000}}` | $1.2M | Money values |
| **Percent** | `{{percent:44}}` | +44% | Percentages with +/- |
| **Trend** | `{{trend:up}}` | ↑ | Direction indicators |

### Parser Architecture

```typescript
// 1. Input text with expressions
const text = "Revenue grew [[positive]]48%[[/positive]] in Q3";

// 2. Parser identifies expressions
parseExpression(text) → [
  { type: 'text', content: 'Revenue grew ' },
  { type: 'expression', expressionType: 'positive', value: '48%' },
  { type: 'text', content: ' in Q3' }
]

// 3. Renderer converts to React elements
renderWithExpressions(text) → 
  <React.Fragment>
    Revenue grew 
    <span className="bg-green-100 text-green-800 px-1 rounded">48%</span>
    in Q3
  </React.Fragment>
```

### Adding New Expression Types

1. **Define regex pattern in parser:**
```typescript
// src/utils/expressionParser.tsx
const newTypeRegex = /\[\[newtype\]\](.*?)\[\[\/newtype\]\]/g;
```

2. **Create render function:**
```typescript
function renderNewType(value: string): React.ReactNode {
  return (
    <span className="your-custom-class">
      {value}
    </span>
  );
}
```

3. **Add to switch statement:**
```typescript
case 'newtype':
  return <React.Fragment key={key}>{renderNewType(element.value)}</React.Fragment>;
```

---

## Adding New Content

### Adding a New Executive Summary

**Step 1: Create JSON file**
```bash
# Create: src/data/summaries/week-nov-07-2024.json
```

**Step 2: Follow the schema**
```json
{
  "id": "week-nov-07-2024",
  "quarter": "Nov 7",
  "year": 2024,
  "date": "2024-11-07",
  "title": "Your Title Here",
  "highlights": [
    "Highlight 1 with {{icon:rocket}} expressions",
    "Highlight 2"
  ],
  "keyMetrics": {
    "revenue": 1500000,
    "growth": 52,
    "customers": 280,
    "satisfaction": 95
  },
  "departments": [
    {
      "name": "Department Name",
      "performance": 85,
      "budget": 500000,
      "headcount": 12,
      "achievements": ["Achievement 1", "Achievement 2"]
    }
  ],
  "initiatives": [
    {
      "name": "Initiative Name",
      "status": "on-track",
      "progress": 65,
      "owner": "Owner Name",
      "impact": "high"
    }
  ],
  "risks": [
    {
      "description": "Risk description",
      "severity": "medium",
      "mitigation": "How we're addressing it"
    }
  ],
  "outlook": "Future outlook paragraph"
}
```

**Step 3: No code changes needed!**
The loader automatically picks up the new file:
```typescript
// This glob pattern auto-imports all JSON files
const summaryModules = import.meta.glob('./summaries/*.json', { eager: true });
```

---

### Adding a New ExecutiveIQ Article

**Step 1: Create JSON file**
```bash
# Create: src/data/executive-iq/your-article-name.json
```

**Step 2: Follow the schema**
```json
{
  "id": "your-article-nov-2025",
  "quarter": "Nov 10",
  "year": 2025,
  "date": "2025-11-10",
  "title": "Article Title",
  "subtitle": "Article Subtitle",
  "category": "strategy",
  "executiveSummary": "Executive summary with [[highlight]]expressions[[/highlight]]",
  "keyTakeaways": [
    "Takeaway 1 with [[metric]]numbers[[/metric]]",
    "Takeaway 2"
  ],
  "strategicImplications": [
    "Implication 1",
    "Implication 2"
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2"
  ],
  "trendAnalysis": {
    "title": "Trend Analysis Title",
    "subtitle": "Subtitle",
    "categories": [
      {
        "name": "Category Name",
        "icon": "rocket",
        "trends": [
          {
            "metric": "Metric Name",
            "value2023": "Old Value",
            "value2024": "[[positive]]New Value[[/positive]]",
            "change": "↑ Change description",
            "impact": "high"
          }
        ]
      }
    ]
  },
  "outlook": "Future outlook"
}
```

**Available categories:**
- `strategy` - Strategic initiatives
- `innovation` - New technologies, approaches
- `market-insight` - Market analysis
- `thought-leadership` - Industry perspectives
- `transformation` - Change management

**Step 3: Auto-loaded!**
```typescript
const execIQModules = import.meta.glob('./executive-iq/*.json', { eager: true });
```

---

### Adding a New Organization

**Step 1: Create JSON file**
```bash
# Create: src/data/organizations/your-org.json
```

**Step 2: Follow the schema**
```json
{
  "id": "your-org",
  "name": "Organization Name",
  "lastUpdated": "2025-11-07",
  "keyHighlights": [
    "Highlight 1",
    "Highlight 2"
  ],
  "strategicProjects": [
    {
      "id": "project-1",
      "name": "Project Name",
      "status": "on-track",
      "description": "Project description",
      "impact": "high",
      "timeline": "Q4 2025",
      "owner": "Owner Name"
    }
  ],
  "supportActivities": [
    {
      "category": "Category Name",
      "count": 42,
      "trend": "up",
      "description": "Activity description"
    }
  ],
  "demoInsights": {
    "totalDemos": 150,
    "topAssets": ["Asset 1", "Asset 2"],
    "conversionRate": 45
  }
}
```

**Step 3: Auto-loaded!**

---

### Adding a New Strategic Initiative

**Step 1: Create JSON file**
```bash
# Create: src/data/initiatives/your-initiative.json
```

**Step 2: Use the comprehensive schema**
Reference `ai-revops-demo-intelligence.json` for the full structure including:
- Current status and progress
- Stakeholder engagement
- SMART goals
- Proposed solution
- ROI analysis (financial benefits, cost savings, revenue impact)
- SWOT analysis
- Budget breakdown
- Timeline with phases and milestones
- Resource requirements (staffing, vendors, tools)
- Risk assessment
- KPIs (leading and lagging indicators)
- Governance structure
- Dependencies and assumptions

**Step 3: Auto-loaded!**

---

## State Management

### Context Providers

#### **Theme Context**
```typescript
// Provider wraps entire app
<ThemeProvider>
  <App />
</ThemeProvider>

// Any component can access
const { theme, toggleTheme } = useTheme();
```

**Stored in:** `localStorage` (persists across sessions)

#### **Presentation Context**
```typescript
const { isPresentationMode, togglePresentationMode } = usePresentation();
```

**Not persisted** (resets on refresh)

### Local Component State

```typescript
// Modal visibility
const [selectedSummary, setSelectedSummary] = useState<TimelineItem | null>(null);

// Search query
const [searchQuery, setSearchQuery] = useState('');

// Active section (scroll tracking)
const [activeSection, setActiveSection] = useState('overview');

// UI states
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [isHeaderCompact, setIsHeaderCompact] = useState(false);
```

### State Flow Example

```
User clicks summary card
  ↓
onClick handler fires
  ↓
setSelectedSummary(summary) updates state
  ↓
React re-renders App
  ↓
Conditional rendering shows modal
  ↓
<SummaryDetail summary={selectedSummary} />
```

---

## Styling System

### Tailwind CSS Utility Classes

**Core concepts:**
- Utility-first: Apply styles directly in JSX
- Responsive: Use `sm:`, `md:`, `lg:` prefixes
- Dark mode: Use `dark:` prefix
- State variants: `hover:`, `focus:`, `active:`

**Example:**
```typescript
<div className="
  bg-white dark:bg-gray-900        /* Theme-aware background */
  rounded-xl                        /* Border radius */
  p-6                               /* Padding */
  shadow-lg                         /* Box shadow */
  hover:shadow-xl                   /* Hover effect */
  transition-all duration-300       /* Smooth transition */
  border-2 border-transparent       /* Border */
  hover:border-fis-eggplant        /* Hover border color */
  md:p-8                           /* Larger padding on medium screens */
">
```

### Custom Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'fis-eggplant': '#6B1B5E',     // Brand purple
        'fis-raspberry': '#B21A53',    // Brand red
        'fis-navy': '#002D5C',         // Brand blue
        'fis-green': '#006747',        // Brand green
      },
      fontFamily: {
        'roobert-light': ['Roobert-Light'],
        'roobert-regular': ['Roobert-Regular'],
        'roobert-medium': ['Roobert-Medium'],
        'roobert-semibold': ['Roobert-SemiBold'],
        'roobert-bold': ['Roobert-Bold'],
        'roobert-heavy': ['Roobert-Heavy'],
      }
    }
  }
}
```

### Custom CSS Classes

**Global styles** in `src/index.css`:
```css
/* Glass morphism effect */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.glass-strong {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
}

/* 3D card shadow */
.card-shadow {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-shadow-hover {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}
```

### Print Styles

**Separate print stylesheet** in `src/print.css`:
```css
@media print {
  .no-print { display: none !important; }
  
  @page {
    size: A4;
    margin: 1.2cm;
  }
  
  /* Color preservation */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
```

---

## Build & Deployment

### Development

```bash
# Start dev server with HMR
npm run dev

# Runs on: http://localhost:5173
# Hot Module Replacement: Changes reflect instantly
```

### Production Build

```bash
# Build optimized production bundle
npm run build

# Output: dist/ folder
# - Minified JavaScript
# - Optimized CSS
# - Compressed assets
# - Source maps (for debugging)
```

### Build Output

```
dist/
├── index.html                    # Entry point
├── assets/
│   ├── index-[hash].js          # Bundled JavaScript (~875 KB)
│   ├── index-[hash].css         # Bundled CSS (~43 KB)
│   └── [fonts and images]       # Copied assets
└── RoobertFont/                 # Font files
```

### Preview Production Build

```bash
# Test production build locally
npm run preview

# Runs on: http://localhost:4173
```

### Deployment Options

**See `DEPLOYMENT.md` for detailed instructions:**
- Windows IIS (corporate environments)
- Apache/Nginx (Linux servers)
- AWS S3 + CloudFront (cloud + CDN)
- Azure Static Web Apps (automated CI/CD)
- Docker container (portable deployment)
- Simple HTTP server (local network)

---

## Common Tasks

### Task 1: Change the Logo

**Files to modify:**
1. Replace `public/FIS-Logo.png` with your logo
2. Update logo reference in `Header.tsx`:
```typescript
<img 
  src="/FIS-Logo.png"  // Change filename if needed
  alt="Company Logo" 
  className="h-10 w-auto"
/>
```

### Task 2: Change Brand Colors

**Files to modify:**
1. `tailwind.config.js` - Update color definitions
```javascript
colors: {
  'brand-primary': '#YOUR_COLOR',
  'brand-secondary': '#YOUR_COLOR',
}
```

2. Update all instances of `fis-*` colors in components:
```typescript
// Find and replace:
'fis-eggplant' → 'brand-primary'
'fis-raspberry' → 'brand-secondary'
```

### Task 3: Add New Chart Type

**Example: Adding a Pie Chart**

1. Install if needed (Recharts already includes it):
```typescript
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
```

2. Prepare data:
```typescript
const data = [
  { name: 'Category A', value: 400 },
  { name: 'Category B', value: 300 }
];

const COLORS = ['#6B1B5E', '#B21A53', '#002D5C'];
```

3. Render:
```typescript
<PieChart width={400} height={400}>
  <Pie data={data} dataKey="value" nameKey="name">
    {data.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <Tooltip />
</PieChart>
```

### Task 4: Add New Expression Type

**See "Expression Engine" section above for detailed steps**

### Task 5: Debug TypeScript Errors

**Common issues:**

1. **Property doesn't exist:**
```typescript
// Check type definition in src/types/index.ts
// Ensure JSON data matches interface
```

2. **Type mismatch:**
```typescript
// Use type guards
if (isExecutiveSummary(item)) {
  // TypeScript knows item is ExecutiveSummary
  console.log(item.departments);
}
```

3. **Null/undefined:**
```typescript
// Use optional chaining and nullish coalescing
summary.keyMetrics?.revenue ?? 0
```

### Task 6: Optimize Performance

**Bundle size analysis:**
```bash
npm run build

# Check dist/assets/index-*.js size
# Target: < 1 MB for main bundle
```

**Optimization strategies:**
1. **Code splitting:** Use React.lazy() for routes
2. **Image optimization:** Compress images, use WebP
3. **Tree shaking:** Import only what you need
4. **Memoization:** Use React.memo() for expensive components

### Task 7: Add Custom Font

1. Place font files in `RoobertFont/` or `public/fonts/`

2. Define in `src/index.css`:
```css
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/YourFont-Regular.woff2') format('woff2');
  font-weight: 400;
}
```

3. Add to Tailwind config:
```javascript
fontFamily: {
  'your-font': ['YourFont', 'sans-serif']
}
```

4. Use in components:
```typescript
<div className="font-your-font">
```

### Task 8: Add Analytics Tracking

**Example: Google Analytics**

1. Install package:
```bash
npm install react-ga4
```

2. Initialize in `main.tsx`:
```typescript
import ReactGA from 'react-ga4';

ReactGA.initialize('YOUR_GA_ID');

// Track page views
ReactGA.send({ hitType: "pageview", page: window.location.pathname });
```

3. Track events:
```typescript
// In component
ReactGA.event({
  category: 'User Interaction',
  action: 'Clicked Export Button',
  label: 'Executive Summary'
});
```

### Task 9: Add Authentication

**If you need to add login:**

1. **Option A: JWT with Backend**
   - Add auth context provider
   - Store token in localStorage
   - Add protected routes
   - Send token in API headers

2. **Option B: OAuth (Google, Microsoft)**
   - Use library like `react-oauth/google`
   - Implement OAuth flow
   - Protect routes with auth check

3. **Simple approach:**
```typescript
// AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials: Credentials) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const data = await response.json();
    setUser(data.user);
    setIsAuthenticated(true);
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Task 10: Add Backend API Integration

**If you need to fetch data from API instead of JSON files:**

1. Create API service:
```typescript
// src/services/api.ts
export async function fetchSummaries(): Promise<ExecutiveSummary[]> {
  const response = await fetch('https://api.yourcompany.com/summaries');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}
```

2. Update component to use API:
```typescript
const [summaries, setSummaries] = useState<ExecutiveSummary[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetchSummaries()
    .then(data => setSummaries(data))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, []);

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage message={error} />;
```

---

## Troubleshooting

### Build Errors

**Error: "Cannot find module"**
```bash
# Solution: Install dependencies
npm install
```

**Error: "Type error in component"**
```bash
# Solution: Check TypeScript types
npm run build  # See detailed error
# Fix type mismatches in src/types/index.ts
```

### Runtime Errors

**Error: "Cannot read property of undefined"**
```typescript
// Solution: Add optional chaining
summary.keyMetrics?.revenue
```

**Error: "Invalid date"**
```typescript
// Solution: Validate date format in JSON
"date": "2024-11-07"  // Must be YYYY-MM-DD
```

### Styling Issues

**Tailwind classes not working:**
```bash
# Solution: Restart dev server
# Ctrl+C to stop
npm run dev
```

**Dark mode not persisting:**
```typescript
// Check localStorage access
console.log(localStorage.getItem('theme'));
// Ensure localStorage not blocked by browser
```

### Performance Issues

**Slow initial load:**
- Check bundle size: `npm run build`
- Optimize images (compress, use WebP)
- Enable code splitting

**Slow rendering:**
- Use React.memo() for expensive components
- Add keys to mapped elements
- Avoid inline function definitions in render

---

## Best Practices

### Code Style

1. **Use TypeScript types everywhere:**
```typescript
// Good
const summary: ExecutiveSummary = data;

// Bad
const summary: any = data;
```

2. **Functional components with hooks:**
```typescript
// Good
export function Component() {
  const [state, setState] = useState(initial);
  return <div>{state}</div>;
}

// Avoid class components
```

3. **Destructure props:**
```typescript
// Good
export function Card({ title, description }: CardProps) {

// Less clear
export function Card(props: CardProps) {
  return <div>{props.title}</div>;
}
```

### Component Organization

1. **One component per file**
2. **Group related components in folders**
3. **Extract reusable logic to hooks**
4. **Keep components small (< 300 lines)**

### Performance

1. **Memoize expensive calculations:**
```typescript
const expensiveValue = useMemo(() => {
  return computeExpensive(data);
}, [data]);
```

2. **Use React.memo for pure components:**
```typescript
export const Card = React.memo(function Card({ data }: CardProps) {
  return <div>{data}</div>;
});
```

3. **Lazy load routes:**
```typescript
const Dashboard = React.lazy(() => import('./Dashboard'));
```

### Accessibility

1. **Use semantic HTML:**
```typescript
<nav>, <main>, <article>, <button>
```

2. **Add ARIA labels:**
```typescript
<button aria-label="Close modal">
```

3. **Keyboard navigation:**
```typescript
onKeyDown={(e) => e.key === 'Escape' && onClose()}
```

---

## Additional Resources

### Documentation
- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Framer Motion:** https://www.framer.com/motion
- **Recharts:** https://recharts.org

### Project-Specific Docs
- `README.md` - User guide and quick start
- `DEPLOYMENT.md` - Deployment instructions
- `CUSTOMIZATION.md` - Customization guide (if exists)
- `QUICK_START.md` - Quick start guide (if exists)

### Getting Help

1. Check TypeScript errors: `npm run build`
2. Check console errors: Browser DevTools (F12)
3. Review component props: Use React DevTools extension
4. Search codebase: Use VS Code search (Ctrl+Shift+F)

---

## Summary

This project is a **modern React dashboard** built with:
- **TypeScript** for type safety
- **Tailwind** for styling
- **JSON files** for data storage
- **Vite** for fast builds
- **Expression engine** for rich text
- **html2canvas** for image export

**Key principles:**
- ✅ Data-driven (add JSON, no code changes)
- ✅ Type-safe (TypeScript catches errors)
- ✅ Modular (components are independent)
- ✅ Extensible (easy to add features)
- ✅ Performant (optimized bundle, lazy loading)

**For developers:**
- Clone repo → `npm install` → `npm run dev`
- Add data → Create JSON in `src/data/`
- Modify UI → Edit components in `src/components/`
- Change colors → Update `tailwind.config.js`
- Deploy → `npm run build` → Upload `dist/`

---

**Last Updated:** November 5, 2025  
**Version:** 1.0.0  
**Maintainer:** Original development team

For questions or contributions, refer to the repository's issue tracker on GitHub.
