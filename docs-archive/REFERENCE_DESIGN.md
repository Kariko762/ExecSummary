# Executive Summary Design Reference

## Visual Design Goals

This document captures the target design for the Executive Summary layout based on the Oct 31 2024 example.

### Layout Structure

#### 1. Header Section
- **Date Badge**: Purple icon with date (e.g., "Oct 31 2024")
- **Subtitle**: Gray text showing full date
- **Title**: Large bold title (e.g., "Demo Services Group - Weekly Executive Update")

#### 2. Key Metrics (4-Column Grid)
- **Layout**: 4 equal-width columns
- **Each Card Contains**:
  - Icon with colored background
  - Label (e.g., "Revenue", "Customers", "Growth", "NPS Score")
  - Large value (e.g., "$NaN", "NaN", "+%", etc.)
- **Styling**: White background, subtle shadow, rounded corners

#### 3. Key Highlights (Single Column)
- **Layout**: Full-width section
- **Each Item**:
  - Numbered badge (pink circle with white number)
  - Bullet point text content
  - Support for inline expressions/variables
- **Styling**: Clean list with consistent spacing

#### 4. Department Performance & Strategic Initiatives (2-Column Grid)
- **Left Column**: Department Performance
  - Radial/circular chart showing department performance percentages
  - Legend below with colored dots and percentages
  - Departments: Demo Enablement (65%), Demo Operations (86%), GTM Support (96%), Strategic Initiatives (70%)

- **Right Column**: Strategic Initiatives
  - List of initiatives with:
    - Initiative name (bold)
    - Owner name (smaller text)
    - Progress percentage
    - Horizontal progress bar (green = on track, pink = at risk)
    - Status badge (green "On Track" or pink "At Risk")

#### 5. This Week's Focus (Single Column)
- **Layout**: Full-width section
- **Each Item**:
  - Numbered badge (pink circle with white number)
  - Focus item text
- **Special Item**: Focal Goal (purple icon with special formatting)

#### 6. Issues & Blockers (3-Column Status Grid)
- **Columns**:
  - Open (0) - Red icon
  - In Progress (count) - Blue icon
  - Resolved (0) - Green icon
- **Each Issue Card**:
  - Title with severity badge (e.g., "high", "medium")
  - Description text
  - Action items
  - Timeline information
- **Styling**: Cards with borders, background varies by status

#### 7. Risks & Mitigation (Single Column)
- **Each Risk Card**:
  - Warning icon (yellow or red triangle)
  - Risk title with severity badge ("medium severity" or "high severity")
  - Mitigation description text
- **Styling**: Light background with colored border based on severity

#### 8. Outlook (Single Column)
- **Layout**: Full-width section
- **Content**: 
  - Purple icon
  - Multi-paragraph text content
  - Support for rich formatting

---

## Required Features to Implement

### 1. Multi-Column Layout Support
**Status**: ❌ Not Implemented

**Requirements**:
- Template Builder needs multi-column layout configuration
- Renderers need to support column spans (1, 2, 3, 4 columns)
- Sections should be able to specify their column width
- Support for side-by-side sections (e.g., Department Performance + Strategic Initiatives)

**Implementation Plan**:
- Add `columnSpan` property to section metadata (e.g., `_keyMetrics_columnSpan: 4`)
- Add `multiColumnSupported` flag to Asset Type Registry (already added)
- Update RenderFactory to wrap sections in grid containers
- Template Builder UI needs column configuration controls

### 2. Horizontal Rule (HR) Component
**Status**: ❌ Not Implemented

**Requirements**:
- Add HR/divider as a new asset type
- Should be draggable in Template Builder
- Can be placed between sections
- Configurable styles (thickness, color, margins)

**Implementation Plan**:
- Create `HorizontalRuleRenderer.tsx`
- Add to Asset Type Registry as `hr` type
- Add to Template Builder ASSET_LIBRARY
- Update RenderFactory with HR case

### 3. Enhanced Section Headers
**Status**: ⚠️ Partially Implemented

**Current**: Basic text headers with collapse/expand
**Target**: 
- More prominent styling
- Optional icons
- Better typography hierarchy
- Remove/hide type badges in display mode

### 4. Improved Card Styling
**Status**: ⚠️ Needs Refinement

**Target**:
- Cleaner white backgrounds
- Subtle shadows
- Better spacing and padding
- Consistent border radius
- Remove heavy borders in favor of subtle shadows

### 5. Chart & Visualization Improvements
**Status**: ✅ Charts Working, ⚠️ Styling Needs Work

**Implemented**:
- Pie Chart (Budget Allocation)
- Bar Chart (Quarterly Revenue)
- Line Chart (User Growth)
- Radial Chart (Project Completion)

**Needs**:
- Better chart sizing and proportions
- Match color schemes from reference
- Legend positioning
- Progress bars for initiatives
- Status badges (On Track, At Risk, etc.)

### 6. Status Badge Component
**Status**: ❌ Not Implemented

**Requirements**:
- Small colored badges for status indicators
- Colors: green (On Track/Resolved), yellow (Medium), red (High/At Risk), blue (In Progress)
- Used in: Initiatives, Issues, Risks

### 7. Progress Bar Component
**Status**: ❌ Not Implemented

**Requirements**:
- Horizontal progress bars
- Percentage display
- Color coding based on status
- Used in: Strategic Initiatives section

---

## Layout Grid System

### Responsive Breakpoints
- **Mobile**: 1 column (stack all sections)
- **Tablet**: 2 columns where applicable
- **Desktop**: Up to 4 columns for metrics, 2 columns for main content

### Section Column Configurations
| Section | Desktop Columns | Notes |
|---------|----------------|-------|
| Key Metrics | 4 | Equal width cards |
| Key Highlights | 1 | Full width |
| Department Performance | 2 | Left half of 2-col grid |
| Strategic Initiatives | 2 | Right half of 2-col grid |
| This Week's Focus | 1 | Full width |
| Issues & Blockers | 3 | Status columns (Open/In Progress/Resolved) |
| Risks & Mitigation | 1 | Full width cards |
| Outlook | 1 | Full width |

---

## Typography Scale

- **Section Headers**: 2xl, font-roobert-heavy
- **Card Titles**: lg, font-roobert-bold
- **Body Text**: base, font-roobert-light
- **Metric Values**: 2xl, font-roobert-heavy
- **Metric Labels**: sm, font-roobert-light

---

## Color Palette (From Reference)

### Status Colors
- **On Track / Success**: Green (#10B981)
- **At Risk / High**: Pink/Red (#EF4444, #EC4899)
- **Medium / Warning**: Yellow/Orange (#F59E0B)
- **In Progress**: Blue (#3B82F6)

### Brand Colors
- **Primary Purple**: FIS Eggplant (#6B1B5E)
- **Secondary Purple**: FIS Raspberry (#B21A53)
- **Accent**: FIS Navy (for backgrounds)

### Chart Colors
- Match existing FIS color palette
- Use consistent colors across visualizations
- Ensure accessibility and contrast

---

## Next Steps Priority

1. **Multi-Column Layout System** (HIGH PRIORITY)
   - Update section metadata to support column configuration
   - Modify SummaryDetailV2 to render grid layouts
   - Update Template Builder to configure columns

2. **HR Component** (MEDIUM PRIORITY)
   - Create HorizontalRuleRenderer
   - Add to asset library
   - Make draggable in Template Builder

3. **Status Badges & Progress Bars** (MEDIUM PRIORITY)
   - Create reusable badge component
   - Create progress bar component
   - Integrate into NestedCardsRenderer for initiatives

4. **Visual Refinements** (LOW PRIORITY)
   - Remove type badges in display mode
   - Improve spacing and shadows
   - Refine typography
   - Match exact colors from reference

---

## Reference Screenshot
See attached image: Oct 31 2024 Executive Summary
- Clean, professional layout
- Clear visual hierarchy
- Effective use of whitespace
- Multi-column grid system
- Status indicators and progress visualization
