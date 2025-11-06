# Executive Summary Dashboard 🚀

A premium, modern executive summary website built with React, TypeScript, and cutting-edge UI/UX design. Features include 3D cards, glassmorphism effects, smooth animations, interactive data visualizations, full offline capability, and a powerful ContentIQ CMS for managing all content.

## ✨ Features

### Dashboard Features
- **🎨 Premium Design**: Glassmorphism effects, 3D card animations, and smooth transitions
- **📊 Data Visualizations**: Beautiful charts with Recharts showing revenue, growth, and customer metrics
- **📅 Interactive Timeline**: Horizontal timeline navigation through quarterly summaries
- **🏢 Organization Dashboard**: Track performance across business units with KPIs and insights
- **🚀 Strategic Initiatives**: Comprehensive initiative tracking with 14+ flexible sections
- **🎭 Presentation Mode**: Full-screen mode perfect for board meetings
- **🌓 Dark/Light Mode**: Elegant theme switching with persistent preferences
- **🔍 Smart Search**: Instant search across all summaries and highlights
- **📱 Fully Responsive**: Mobile-first design that looks great on all devices
- **💾 100% Offline**: All assets bundled locally - no internet required
- **🖨️ Print Support**: Generate beautiful PDF reports
- **⚡ Lightning Fast**: Built with Vite for optimal performance
- **🧩 Flexible Data**: Optional sections - publish incrementally as initiatives mature

### ContentIQ CMS Features 🎯
- **📝 Visual Editor**: Beautiful modal-based content editor with real-time preview
- **🛡️ Protection System**: Weighted completion tracking prevents incomplete publishing
- **📊 Completion Donut**: Visual progress indicator with color-coded status (Green/Yellow/Red)
- **🎨 Section Management**: Enable/disable, lock/unlock, and mark sections complete
- **📋 Template System**: Create from instructional templates or clone existing summaries
- **🔄 Draft/Live Status**: Clear visual indicators (badges, warnings) for content state
- **⚖️ Weighted Sections**: Smart completion calculation based on section complexity (1-10)
- **🎯 List Management**: Dynamic add/edit/delete for highlights, risks, issues, initiatives, departments
- **🔢 Smart Forms**: Auto-detected field types (text, numeric, arrays) with specialized inputs
- **✨ Card-Based UI**: Consistent, beautiful card styling across all sections
- **🎨 FIS Branding**: Purple/raspberry gradients, Roobert font, corporate colors
- **💾 Auto-Save**: Draft saving with dirty state tracking
- **🚨 Live Warnings**: Multiple protection layers when editing published content

## 🎯 Key Components

### 1. **Dashboard**
- Real-time styled KPIs with animated counters
- Revenue and customer growth charts
- Performance metrics at a glance

### 2. **Summary Cards**
- 3D card effects with hover animations
- Key metrics display (Revenue, Customers, Growth, NPS)
- Quick preview of highlights

### 3. **Timeline Navigation**
- Horizontal scroll timeline
- Visual representation of quarterly progress
- Quick navigation to any period

### 4. **Organization Dashboard**
- Track multiple business units (Banking, Capital Markets, Payments, etc.)
- KPI tiles with status indicators (At Risk, All On Track)
- Projects, demos, and hours tracking
- Expression Engine for rich text formatting with badges and icons
- Modal view with strategic projects and support activities

### 5. **Strategic Initiatives**
- Comprehensive initiative tracking with 14+ flexible sections
- **Progressive disclosure**: Publish with partial data, add sections over time
- Dynamic navigation that adapts to available sections
- Tag-based filtering (AI/ML, Digital Transformation, etc.)
- Sections include:
  - Current Status & Executive Summary
  - Problem Statement & SMART Goals
  - Proposed Solution with alternatives analysis
  - Success Metrics & Timeline with milestones
  - Risk Assessment & Resource Requirements
  - Stakeholder Map & Dependencies
  - Change Management & Governance
  - Resources & Documentation
- Rich text support with Expression Engine
- Conditional rendering - no empty sections shown
- Example initiatives included (AI Demo Automation, Client Portal Modernization)

### 6. **Detail View**
- Comprehensive summary information
- Department performance radial charts
- Strategic initiatives with progress tracking
- Risk assessment and mitigation strategies
- Future outlook section

### 7. **Presentation Mode**
- Full-screen display
- Perfect for executive meetings
- Clean, distraction-free interface

### 8. **ContentIQ CMS** 🎯
A powerful, user-friendly content management system for non-technical users:

#### Protection & Quality Control
- **Weighted Completion System**: Each section assigned complexity weight (1-10)
  - `issuesAndBlockers`: 10 (most time-consuming)
  - `departments`: 9, `initiatives`: 8, `activityMetrics`: 8
  - `outlook`: 7, `risks`: 6, `highlights`: 5, etc.
- **Completion Donut Chart**: Beautiful SVG circular indicator with percentage
  - Green (100%), Yellow (50-99%), Red (0-49%)
  - Shows X/Y sections completed count
- **Protection Toggle**: Shield icon in editor header (ON by default)
  - Blocks publishing when protection ON and completion < 100%
  - Flexible override for power users
  - Alert shows current completion % when blocked

#### Content Creation & Management
- **Template System**: 
  - Create new summaries from instructional templates
  - Clone existing summaries as new drafts
  - Auto-generates unique IDs with timestamps
  - All new content starts as "Draft" status
- **Section Management**:
  - Enable/disable sections (show/hide from dashboard)
  - Lock/unlock sections (prevent editing)
  - Mark sections complete (updates completion %)
  - Purple label styling for consistency
- **List Management**: Dynamic UI for array-based sections
  - Add/Edit/Delete buttons for highlights, risks, issues
  - Specialized card-based rendering
  - Special handling for nested arrays (department achievements)

#### Visual Indicators & Warnings
- **Status Badges**: LIVE (green) and DRAFT (yellow) on all tiles
- **Protection Badges**: Shield icons with completion % on tiles
- **Warning Systems**:
  - Confirmation dialog when editing live content
  - Red warning banner in editor for published summaries
  - Multiple protection layers prevent accidents

#### Editor Features
- **Smart Forms**: Auto-detected field types
  - Text inputs for strings
  - Numeric inputs for performance/budget/headcount
  - Array management for lists (add/remove dynamically)
  - Nested object rendering with proper spacing
- **Card-Based UI**: Consistent styling across sections
  - Solid borders and backgrounds
  - Purple/raspberry labels
  - Edit/Delete buttons (hidden when not needed)
- **Modal Interface**: 
  - Full-screen modal with sticky navigation
  - Scroll spy (highlights active section)
  - Collapsible sections for large documents
  - Dark/light mode support

#### Backend Integration
- **Express.js API**: RESTful endpoints for all data types
  - Summaries, ExecutiveIQ, Organizations, Performance
  - Full CRUD operations (Create, Read, Update, Delete)
  - File-based JSON storage for simplicity
- **Import System**: Upload JSON templates directly
- **Real-time Updates**: Changes reflect immediately on dashboard

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe code
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Lucide React** - Beautiful icons
- **Roobert Font** - Corporate typography

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Dashboard Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5173`

### ContentIQ CMS Installation

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start backend server:**
   ```bash
   npm start
   ```
   Backend runs on `http://localhost:3001`

3. **Install CMS frontend dependencies:**
   ```bash
   cd cms-admin
   npm install
   ```

4. **Start CMS development server:**
   ```bash
   npm run dev
   ```
   CMS runs on `http://localhost:5173`

5. **Access the CMS:**
   - Navigate to `http://localhost:5173`
   - Click "New Summary" to create from template or clone existing
   - Edit sections, mark complete, and publish when ready

### Build for Production

**Dashboard:**
```bash
npm run build
```

**CMS:**
```bash
cd cms-admin
npm run build
```

**Backend:**
```bash
cd backend
npm start
```

The production builds will be in the `dist` folders, ready for deployment.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
ExecSummary/
├── RoobertFont/          # Corporate fonts
├── src/
│   ├── components/       # React components
│   │   ├── Header.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── SummaryDetail.tsx
│   │   ├── Timeline.tsx
│   │   ├── OrganizationDashboard.tsx
│   │   ├── OrganizationTile.tsx
│   │   ├── OrganizationModal.tsx
│   │   ├── StrategicInitiativesDashboard.tsx
│   │   ├── StrategicInitiativeTile.tsx
│   │   ├── StrategicInitiativeModal.tsx
│   │   ├── ActivityHoursChart.tsx
│   │   ├── TopAssetsChart.tsx
│   │   └── ... more components
│   ├── contexts/         # React contexts
│   │   ├── ThemeContext.tsx
│   │   └── PresentationContext.tsx
│   ├── data/            # JSON data files
│   │   ├── summaries.ts
│   │   ├── summaries/
│   │   │   ├── week-oct-24-2024.json
│   │   │   └── week-oct-31-2024.json
│   │   ├── organizations/
│   │   │   ├── banking-na.json
│   │   │   ├── capital-markets.json
│   │   │   ├── payments.json
│   │   │   └── int-banking.json
│   │   ├── initiatives/
│   │   │   ├── ai-demo-automation.json
│   │   │   └── client-portal-modernization.json
│   │   ├── performance/
│   │   │   ├── performance-oct-24-2024.json
│   │   │   └── performance-oct-31-2024.json
│   │   ├── summaries-loader.ts
│   │   ├── organizations-loader.ts
│   │   ├── initiatives-loader.ts
│   │   └── performance-loader.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   └── expressionParser.tsx
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Customization

### Adding New Summaries

Edit `src/data/summaries.ts` to add or modify executive summaries:

```typescript
{
  id: 'q1-2025',
  quarter: 'Q1',
  year: 2025,
  date: '2025-03-31',
  title: 'Your Title Here',
  highlights: [
    'Key achievement 1',
    'Key achievement 2',
  ],
  keyMetrics: {
    revenue: 15000000,
    growth: 52,
    customers: 18000,
    satisfaction: 75
  },
  // ... more fields
}
```

### Adding Strategic Initiatives

Create a new JSON file in `src/data/initiatives/` with any combination of sections. All sections are optional!

**Minimal example** (early-stage initiative):
```json
{
  "id": "my-initiative-2025",
  "title": "My New Initiative",
  "lastUpdated": "2025-01-15",
  "tags": ["Digital Transformation"],
  "executiveSummary": {
    "overview": "Brief description...",
    "benefits": ["Benefit 1", "Benefit 2"]
  },
  "problemStatement": {
    "issue": "The problem we're solving..."
  }
}
```

**Full example** (mature initiative):
Include all 14 sections: currentStatus, executiveSummary, problemStatement, smartGoals, proposedSolution, successMetrics, timeline, riskAssessment, resourceRequirements, stakeholderMap, dependencies, changeManagement, governance, and resources.

See `src/data/initiatives/ai-demo-automation.json` for a complete example.

### Using Expression Engine

Add rich formatting to text fields:
- `{{badge:success}}Text{{/badge}}` - Colored badge
- `{{icon:rocket}}Text` - Icon with text
- `**Bold text**` - Markdown-style bold

Supported in: Organization highlights, Strategic Initiative sections, and more.

### Customizing Colors

Edit `tailwind.config.js` to modify the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      // Add your brand colors here
    },
  },
}
```

### Changing Fonts

The project uses Roobert font family. To use different fonts:
1. Add font files to a folder
2. Update `src/index.css` @font-face declarations
3. Modify `tailwind.config.js` fontFamily settings

## 🌐 Offline Deployment

This application is designed to run completely offline:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Copy the `dist` folder** to your offline server

3. **Serve static files** using any web server:
   - IIS (Windows Server)
   - Apache
   - Nginx
   - Python: `python -m http.server 8000` (from dist folder)

4. **All assets are bundled** - no external CDN dependencies

## 🎯 Features Breakdown

### Glassmorphism Design
- Frosted glass effects throughout
- Backdrop blur for depth
- Semi-transparent elements
- Modern, premium aesthetic

### 3D Card Effects
- Transform on hover
- Depth perception
- Smooth transitions
- Interactive feedback

### Animations
- Page load animations
- Scroll-triggered effects
- Hover micro-interactions
- Chart animations

### Data Visualization
- Line charts for trends
- Bar charts for comparisons
- Radial charts for performance
- Custom tooltips
- Responsive sizing

## 💡 Usage Tips

1. **Search**: Use the search bar to quickly find specific summaries or highlights
2. **Timeline**: Scroll horizontally to navigate through time periods
3. **Presentation Mode**: Click the presentation icon for full-screen board meeting view
4. **Theme Toggle**: Switch between dark and light modes based on preference
5. **Print**: Use the printer icon in detail view to generate PDF reports
6. **Mobile**: Fully responsive - works great on tablets and phones

## 🔧 Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📝 Data Structure

Each executive summary includes:
- **Basic Info**: Quarter, year, date, title
- **Key Metrics**: Revenue, growth, customers, satisfaction
- **Highlights**: Major achievements (array)
- **Departments**: Performance data for each department
- **Initiatives**: Strategic initiatives with progress
- **Risks**: Risk assessment and mitigation
- **Outlook**: Future expectations and goals

## 🎨 Design System

- **Font Weights**:
  - Light (300) - Body text, descriptions
  - Regular (400) - Standard text
  - Medium (500) - Emphasis
  - SemiBold (600) - Subheadings
  - Bold (700) - Headings
  - Heavy (800) - Titles, hero text

- **Color Palette**:
  - Primary: Blue (#3B82F6)
  - Secondary: Purple (#8B5CF6)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Danger: Red (#EF4444)

## 🤝 Contributing

This is a corporate internal tool. For modifications:
1. Update the data in `src/data/summaries.ts`
2. Customize styling in Tailwind config
3. Rebuild and redeploy

## 📄 License

Internal corporate use only.

## 🎉 Enjoy Your Executive Dashboard!

Built with ❤️ for data-driven decision making.
