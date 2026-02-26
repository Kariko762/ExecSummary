# Goals Page - Dark Theme Implementation
**Created:** February 11, 2026  
**File:** `/src/pages/dark-theme/Goals.tsx`

## Overview
Complete rewrite of the Goals page following the dark slate theme pattern from BudgetFinance, with three integrated views for strategic goal management.

---

## 🎨 Design System
**Theme:** Dark Slate (matches BudgetFinance.tsx)
- Background: `bg-slate-900` (#0f172a)
- Cards: `bg-slate-800/50` with `border-slate-700/40`
- Text: `text-white`, `text-slate-300`, `text-slate-400`
- Accents: Purple, Green, Blue, Orange, Cyan

**Typography:**
- Font: Roobert family (bold, semibold, medium, light)
- Headers: `font-roobert-semibold` or `font-roobert-bold`
- Body: `font-roobert-light`

---

## 📋 Three View Modes

### 1️⃣ Goals Home View
**Purpose:** Display all 5 strategic goals with visual SMART indicators

**Features:**
- ✅ Summary stats row (5 cards): Total Goals, On Track, High Priority, Avg Progress, Target Quarter
- ✅ Full-width goal cards with 12-column grid layout:
  - **Columns 1-3:** Icon, Title, Progress Ring (SVG), Owner
  - **Columns 4-8:** SMART Objectives (first 4), CRO Alignment tags
  - **Columns 9-12:** Key Metrics (2 leading indicators), Timeline phases
- ✅ Hover effects: Card lift, border glow, right chevron indicator
- ✅ Progress ring: SVG circular progress (purple)
- ✅ Click: Opens Goal Details view

**Card Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Icon] [Title]     │  SMART Objectives    │  Key Metrics   │
│ [Progress Ring]    │  • Objective 1       │  Current → Tgt │
│ [Owner]            │  • Objective 2       │  [Progress Bar]│
│                    │  • Objective 3       │                │
│                    │  CRO Alignment Tags  │  Timeline      │
│                    │                      │  Q1 Q2 Q3 Q4   │
└─────────────────────────────────────────────────────────────┘
```

---

### 2️⃣ Goal Details View
**Purpose:** Deep dive into specific goal with tabs

**Tabs:**
1. **Overview Tab**
   - SMART Goal Statement (full text)
   - SMART Framework Grid:
     - Specific: Objectives list with checkmarks
     - Measurable: Metrics list with checkmarks
     - Achievable: Resources + Ownership
     - Relevant: CRO Alignment tags
   - Team & Ownership: Owner + Co-Owners grid

2. **Metrics & KPIs Tab**
   - Two columns: Leading Indicators | Lagging Indicators
   - Metric cards show:
     - Metric name
     - Baseline → Current → Target
     - Progress bar (green for leading, blue for lagging)
     - Units displayed

3. **Timeline Tab**
   - Vertical timeline with 4 quarterly phases
   - Status indicators: Complete (green checkmark), In Progress (blue clock), Not Started (number)
   - Connecting lines between phases
   - Phase name, deliverable, due date, status badge

**Navigation:**
- Edit Goal button (top right) → Opens Edit view
- Back button → Returns to Goals Home

---

### 3️⃣ Edit Goal View (Placeholder)
**Purpose:** Edit goal details (connects to CMS editor)

**Current State:** Placeholder UI with message
**Future:** Integrate with CMS-Admin GoalsManager component with dark theme styling

**Planned Features:**
- Editable SMART fields
- Metric/KPI editors
- Timeline phase editors
- Owner/co-owner selection
- Save button → Updates backend

---

## 🎯 Visual SMART Display Strategy
**Problem:** Show SMART framework at a glance without opening modal

**Solution - Horizontal Card Layout:**
1. **Left Section:** Icon + Progress Ring (visual hierarchy)
2. **Middle Section:** Objectives (what you're doing)
3. **Right Section:** Metrics + Timeline (how you're measuring)

**Benefits:**
- ✅ All critical info visible without click
- ✅ Easy scanning across 5 goals
- ✅ Progress ring draws attention
- ✅ Metrics show current state vs target
- ✅ Timeline shows quarterly cadence

---

## 🔧 Technical Implementation

### Component Structure
```tsx
Goals (Main Component)
├── GoalsHomeView
│   ├── StatCard (5 summary stats)
│   └── GoalCard (visual SMART display)
├── GoalDetailsView
│   ├── OverviewTab
│   │   ├── SMART Statement
│   │   ├── SMARTSection (Specific/Measurable)
│   │   └── Team & Ownership
│   ├── MetricsTab
│   │   └── MetricCard (Leading/Lagging)
│   └── TimelineTab
│       └── Phase items with status
└── GoalEditView (Placeholder)
```

### State Management
```tsx
const [viewMode, setViewMode] = useState<'home' | 'details' | 'edit'>('home');
const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
const [goals, setGoals] = useState<Goal[]>([]);
```

### API Integration
- **Endpoint:** `http://localhost:3001/api/goals`
- **Response:** `{ goals: Goal[] }`
- **Data:** Loads from `backend/data/goals/goals.json`

---

## 🎨 Animations
**Library:** Framer Motion

**Effects:**
- Page transitions: Slide in/out (x-axis)
- Tab switches: Fade in/out
- Card stagger: 0.1s delay per card
- Hover: Lift effect on goal cards
- Export spinner: Rotate animation

---

## 🖼️ Export Functionality
- Export to PNG with 2x scale
- Background: `#0f172a` (dark slate)
- Library: `modern-screenshot` (domToPng)
- Filename: `strategic-goals-{timestamp}.png`

---

## 📊 Data Structure (Goal Interface)
```typescript
interface Goal {
  id: string;
  name: string;
  shortName: string;
  category: string;
  owner: string;
  coOwners: string[];
  status: string;
  priority: string;
  targetDate: string;
  color: string;
  icon: string;
  progress: number;
  linkedAssets: number;
  smartGoal: {
    statement: string;
    specific: { objectives: string[] };
    measurable: { metrics: string[] };
    achievable: { resources: string; ownership: string };
    relevant: { croAlignment: string[] };
    timeBound: {
      timeline: Array<{
        phase: string;
        deliverable: string;
        dueDate: string;
        status: string;
      }>;
    };
  };
  indicators: {
    leading: Array<{ name, baseline, target, current, unit }>;
    lagging: Array<{ name, baseline, target, current, unit }>;
  };
  createdDate: string;
  lastUpdated: string;
  linkedInitiatives: number;
  linkedTasks: number;
}
```

---

## 🚀 Usage

### Routing
```tsx
// src/App.tsx
import Goals from './pages/dark-theme/Goals';

<Route path="/goals" element={<Goals />} />
```

### Navigation
```tsx
// From anywhere in app
navigate('/goals');  // Opens Goals Home

// From dashboard tile
<Link to="/goals">Strategic Goals</Link>
```

---

## 🎯 Current 5 Strategic Goals (Feb 11, 2026)
1. **Automate & Govern the Demo Platform** 🤖
   - Owner: Commercial Office
   - Priority: High
   - Target: 40% prep hour reduction

2. **Shift Capacity to Revenue-Facing Activities** 📈
   - Owner: Commercial Office
   - Priority: High
   - Target: +15% customer hours

3. **Build a Demo-Led Digital Pipeline Engine** 🚀
   - Owner: Commercial Office
   - Priority: High
   - Target: 10 self-service demos, 20 Tiled microsites

4. **Deliver Executive Demo Intelligence & ROI Attribution** 📊
   - Owner: Commercial Office
   - Priority: Medium
   - Target: Dashboard + quarterly reporting

5. **Strategic Localization for Priority Portfolios** 🌍
   - Owner: Commercial Office
   - Priority: Medium
   - Target: 3-4 regions, 20-30 localized assets

---

## 🔮 Future Enhancements

### Phase 1 (Immediate)
- [ ] Connect Edit view to CMS GoalsManager
- [ ] Add dark theme styling to CMS editor
- [ ] Real-time progress updates

### Phase 2 (Next Sprint)
- [ ] Add filters (by owner, priority, status)
- [ ] Search functionality
- [ ] Sort options
- [ ] Compare goals side-by-side

### Phase 3 (Future)
- [ ] Goal dependencies graph
- [ ] Linked initiatives preview
- [ ] Metric trend charts (Recharts)
- [ ] AI-generated insights

---

## 📁 File Locations
- **Main Component:** `/src/pages/dark-theme/Goals.tsx`
- **Data Source:** `/backend/data/goals/goals.json`
- **API:** `/backend/server.js` (GET /api/goals)
- **Route:** `/src/App.tsx` (Line 875)
- **Archive:** `/backend/data/goals/archive/2026-02-11-strategic-goals-v2/`

---

## 🎨 Color Palette Reference
```css
/* Backgrounds */
bg-slate-900:    #0f172a  (main background)
bg-slate-800/50: #1e293b80 (cards - 50% opacity)
bg-slate-700/40: #33415566 (borders - 40% opacity)

/* Accents */
Purple:  #a855f7  (Primary - goals theme)
Green:   #22c55e  (Success - leading indicators)
Blue:    #3b82f6  (Progress - lagging indicators)
Orange:  #f97316  (Warning - high priority)
Cyan:    #06b6d4  (Info - timeline)

/* Text */
White:       #ffffff  (Headers)
Slate-300:   #cbd5e1  (Body text)
Slate-400:   #94a3b8  (Muted text)
Slate-500:   #64748b  (Labels)
```

---

## ✅ Deliverables Complete
1. ✅ Goals.tsx - Main component (885 lines)
2. ✅ Three view modes (Home, Details, Edit)
3. ✅ Visual SMART card design
4. ✅ Dark slate theme styling
5. ✅ Framer Motion animations
6. ✅ Export to PNG functionality
7. ✅ Fullscreen toggle
8. ✅ Responsive layout
9. ✅ App.tsx routing updates

**Total Lines:** 885 lines of TypeScript/React code
**Design Pattern:** Matches BudgetFinance.tsx dark theme
**Ready for:** Production use with 5 strategic goals
