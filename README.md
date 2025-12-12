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
- **🔐 Authentication System**: JWT-based login with role-based permissions (admin, editor, viewer)
- **👥 User Management**: JSON file-based user storage with bcrypt password hashing
- **⚙️ System Settings**: Configure authentication requirements per app via UI
- **🎨 Design System Manager**: Centralized color, typography, and spacing configuration
- **📐 Template Builder**: 🆕 Visual drag-and-drop template creation with validation
- **🎯 Text Alignment**: 🆕 Left/center/right alignment controls for all asset types
- **⚠️ Unsaved Changes**: 🆕 Elegant warning modal before losing work
- **🏷️ Template Tracking**: 🆕 Shows base template name when loaded
- **📊 Chart Rendering**: 🆕 Beautiful charts with custom tooltips showing all values and percentages
- **🎨 Categorical Coloring**: 🆕 Unique colors for chart data (A, B, C, D) from design system palette
- **⚠️ Inline Validation**: 🆕 Contextual warnings on section headers for generic names
- **🧪 Test Mode**: 🆕 Preview templates without save prompts during testing
- **🏷️ Content Tagging**: 🆕 Dynamic tag system with 6 categories (Weekly Summaries, Executive IQ, Organizations, etc.)
- **📊 Dual View Modes**: 🆕 Toggle between Grid (cards) and Table (professional data table) views
- **🎨 Table View**: 🆕 Sidebar navigation with gradient blend, Live/Draft badges, completion %, tag pills
- **🔄 Smart Filtering**: 🆕 Click tags to filter content instantly - works in both Grid and Table views
- **📊 Forecast System**: 🆕 Comprehensive financial planning with qty/unit cost line items
  - Initiative-based forecasting with multi-year terms
  - Capex, Opex, and custom cost centers
  - First year budget impact display
  - Line item details with visibility controls (description, summary, justification)
  - Opex/Yearly costs show yearly rate with term total subtitle
  - Auto-calculation: qty × unit cost = amount
  - Budget Breakdown with categories and variance tracking

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
- **JSON Validation System**: 🆕 Comprehensive 12-section validation
  - Auto-scroll to active check during validation
  - Two-column layout: Test results (30%) | JSON snippet (70%)
  - Expand/collapse "Show More" for detailed results
  - Section-specific checks:
    * Header: ID format, quarter format, date validation
    * Highlights: Array validation (no count requirement)
    * Key Metrics: Type checking for all metric fields
    * Activity Metrics: Nested structure validation
    * Departments: Performance range checks (0-100)
    * Initiatives: Status values and progress validation
    * And more...
  - Color-coded results: Green (passed), Yellow (warning), Red (error)
  - Smart handling of disabled sections (blue info icon)

#### Content Creation & Management
- **Template System**: 
  - Create new summaries from instructional templates
  - Clone existing summaries as new drafts
  - Auto-generates unique IDs with timestamps
  - All new content starts as "Draft" status
- **Template Builder**: 🆕 Visual drag-and-drop interface
  - Drag assets from library into sections
  - Configure field properties in inspector
  - Add example data for preview
  - 6-point validation system (header, fields, schemas)
  - Inline warnings for generic section names ("Section 2", "Section 3")
  - Test mode with no save prompts
  - Chart config persistence (labels, colors, tooltips)
  - Multi-field grid detection and rendering
- **Section Management**: 🆕 Enhanced with visual feedback
  - **Enable/disable sections** (`_enabled_[section]` flags)
    - Disabled sections hidden from visual preview
    - Validation skips disabled sections
    - Blue info indicator: "Section is disabled in CMS"
  - Lock/unlock sections (prevent editing)
  - Mark sections complete (updates completion %)
  - Purple label styling for consistency
- **List Management**: Dynamic UI for array-based sections
  - Add/Edit/Delete buttons for highlights, risks, issues
  - Specialized card-based rendering
  - Special handling for nested arrays (department achievements)
- **Draft Mode Preview**: 🆕
  - Three-tab interface: Visual | JSON | Validate
  - Download button hidden in draft mode
  - Draft preview bar with sticky navigation
  - Real-time JSON inspection
#### Editor Features
- **Smart Forms**: Auto-detected field types
  - Text inputs for strings
  - Numeric inputs for performance/budget/headcount
  - Array management for lists (add/remove dynamically)
  - Nested object rendering with proper spacing
- **Chart Rendering**: 🆕 Beautiful, interactive data visualizations
  - **Custom Tooltips**: Show all values with percentages on hover
  - **Categorical Coloring**: Unique colors for each bar (A, B, C, D) from palette
  - **Soft Hover Effects**: Subtle purple background (rgba(148, 77, 230, 0.05))
  - **Chart Config Persistence**: Labels, colors, and settings preserved across saves
  - **Chart Types**: Bar, Line, Pie, Radial - all with consistent UX
- **Card-Based UI**: Consistent styling across sections
  - Solid borders and backgrounds
  - Purple/raspberry labels
  - Edit/Delete buttons (hidden when not needed)
- **Modal Interface**: 
  - Full-screen modal with sticky navigation
  - Scroll spy (highlights active section)
  - Collapsible sections for large documents
  - Dark/light mode support
- **Navigation Integration**: 🆕
  - CMS Admin link in main app header menu
  - Main app link in CMS header
  - API Dashboard for health checks
  - Seamless switching between apps
  - Full-screen modal with sticky navigation
  - Scroll spy (highlights active section)
  - Collapsible sections for large documents
  - Dark/light mode support
- **Navigation Integration**: 🆕
  - CMS Admin link in main app header menu
  - Main app link in CMS header
  - API Dashboard for health checks
  - Seamless switching between apps

#### Backend Integration
- **Express.js API**: RESTful endpoints for all data types
  - Summaries, ExecutiveIQ, Organizations, Performance
  - Full CRUD operations (Create, Read, Update, Delete)
  - File-based JSON storage for simplicity
- **Authentication API**: JWT-based authentication with bcrypt password hashing
  - User login/logout with token management
  - Role-based permissions (admin, editor, viewer)
  - User CRUD operations (admin only)
  - Session management with 24h token expiry
- **API Dashboard**: 🆕 Built-in testing tool
  - File System Health checks
  - API Endpoint testing
  - Auto-scroll to active test
  - Response time monitoring
  - Expandable response data
- **Import System**: Upload JSON templates directly
- **Real-time Updates**: Changes reflect immediately on dashboard

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe code
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Lucide React** - Beautiful icons
- **Roobert Font** - Corporate typography

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **multer** - File upload handling
- **express-validator** - Request validation
- **CORS** - Cross-origin resource sharing

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
   npm run dev
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
   CMS runs on `http://localhost:5174`

5. **Access the CMS:**
   - Navigate to `http://localhost:5174`
   - **Default login**: username `admin` / password `admin123`
   - Enable authentication via **Menu → System Settings → Authentication**
   - Click "New Summary" to create from template or clone existing
   - Edit sections, mark complete, and publish when ready

### Authentication Setup (Optional)

The CMS includes a complete JWT-based authentication system:

1. **Enable authentication:**
   - Open CMS → **Menu → System Settings**
   - Toggle "Require Login" for **Executive Summary App** and/or **CMS Admin Panel**
   - Click **Save Changes**

2. **Default credentials:**
   - Username: `admin`
   - Password: `admin123`
   - Role: Administrator (full access)

3. **Change admin password:**
   ```bash
   cd backend
   node generate-password.js your-new-password
   # Copy the generated hash
   ```
   Then update `cms-admin/src/data/users.json` with the new hash.

4. **User roles:**
   - **Admin**: Full access, user management, system settings
   - **Editor**: Content creation/editing, no admin features
   - **Viewer**: Read-only access

5. **API endpoints:**
   - `POST /api/auth/login` - Login with credentials
   - `POST /api/auth/verify` - Verify JWT token
   - `GET /api/auth/users` - List users (admin only)
   - `POST /api/auth/users` - Create user (admin only)
   - More endpoints documented in `backend/README_AUTH.md`

For detailed authentication setup, see `LOGIN_SETUP_GUIDE.md`.

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
├── backend/                    # Backend API server
│   ├── api/
│   │   └── auth.js            # Authentication endpoints
│   ├── server.js              # Express server
│   ├── generate-password.js   # Password hash generator
│   ├── package.json
│   └── README_AUTH.md         # Auth API documentation
├── cms-admin/                  # CMS Admin Panel
│   ├── src/
│   │   ├── components/        # CMS React components
│   │   │   ├── CMSHeader.tsx
│   │   │   ├── EditorModalV2.tsx
│   │   │   ├── LoginPage.tsx         # 🆕 CMS login UI
│   │   │   ├── ProtectedRoute.tsx    # 🆕 Route protection
│   │   │   ├── SystemSettingsManager.tsx  # 🆕 System config
│   │   │   ├── StyleSchemeManagerV2.tsx   # 🆕 Design system
│   │   │   └── ... more CMS components
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx       # 🆕 Auth state management
│   │   │   ├── ThemeContext.tsx
│   │   │   └── PresentationContext.tsx
│   │   ├── data/
│   │   │   └── users.json            # 🆕 User database
│   │   ├── types/
│   │   │   ├── auth.ts               # 🆕 Auth TypeScript types
│   │   │   └── index.ts
│   │   └── App.tsx
│   └── package.json
├── RoobertFont/                # Corporate fonts
├── src/                        # Main Dashboard App
│   ├── components/             # React components
│   │   ├── Header.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── SummaryDetail.tsx
│   │   ├── Timeline.tsx
│   │   ├── LoginPage.tsx             # 🆕 Parent app login
│   │   ├── OrganizationDashboard.tsx
│   │   ├── OrganizationTile.tsx
│   │   ├── OrganizationModal.tsx
│   │   ├── StrategicInitiativesDashboard.tsx
│   │   ├── StrategicInitiativeTile.tsx
│   │   ├── StrategicInitiativeModal.tsx
│   │   ├── ActivityHoursChart.tsx
│   │   ├── TopAssetsChart.tsx
│   │   └── ... more components
│   ├── contexts/               # React contexts
│   │   ├── ThemeContext.tsx
│   │   └── PresentationContext.tsx
│   ├── data/                   # JSON data files
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
│   ├── design-system/          # Centralized design tokens
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── types/                  # TypeScript types
│   │   └── index.ts
│   ├── utils/                  # Utility functions
│   │   └── expressionParser.tsx
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # App entry point
│   └── index.css               # Global styles
├── LOGIN_SETUP_GUIDE.md        # 🆕 Authentication setup guide
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
- **Basic Info**: Quarter, year, date, title, status (draft/published)
- **Key Metrics**: Revenue, growth, customers, satisfaction (object format with numbers)
- **Highlights**: Major achievements (array)
- **Activity Metrics**: 🆕 Demo Studio data with keyActivityInsights
  - demoStudio: registered, linked to deals, won ACV, conversion rate
  - keyActivityInsights: Banking and Capital Markets activity hours and percentages
- **Top Assets**: 🆕 Most-used demo assets with counts and categories
- **Weekly Focus**: 🆕 Array of focus items for the week
- **Departments**: Performance data for each department (array)
- **Initiatives**: Strategic initiatives with progress (array)
- **Risks**: Risk assessment and mitigation (array)
- **Issues & Blockers**: 🆕 Detailed issue tracking with status and impact
- **Outlook**: Future expectations and goals (string)
- **CMS Metadata**: 🆕 Content enablement and completion flags
  - `_enabled_[section]`: boolean flags to show/hide sections
  - `_completed_[section]`: boolean flags for completion tracking
  - `status`: "draft" or "published"
  - `protectionEnabled`: boolean for CMS protection

### Data Type Requirements
**Important:** All `keyMetrics` values must be numbers, not strings:
```json
"keyMetrics": {
  "revenue": 1230000,        // ✓ Correct (number)
  "growth": 48,              // ✓ Correct (number)
  "customers": 263,          // ✓ Correct (number)
  "satisfaction": 92         // ✓ Correct (number)
}
```

**Not this:**
```json
"keyMetrics": {
  "revenue": "1230000",      // ✗ Wrong (string)
  "growth": "48",            // ✗ Wrong (string)
  ...
}
```

The validation system will catch these type errors and provide specific feedback.

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
