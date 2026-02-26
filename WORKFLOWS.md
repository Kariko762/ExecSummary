# System Workflows & Architecture Map

**Last Updated:** February 3, 2026

---

## 📱 FRONTEND (Public-Facing Application)

### **1. Primary HomePage (Light Version - Current)**

**Component:** `src/pages/Home.tsx` (or `src/App.tsx` default route)  
**Route:** `/` or `/home`  
**API Calls:** 
- `GET http://localhost:3001/api/initiatives?published=true` (only published)
- `GET http://localhost:3001/api/goals` (if goals shown on homepage)

**Backend Data Locations:**
- `backend/data/initiatives/*.json` (filtered by `_published: true`)
- `backend/data/goals/goals.json`

**Features:**
- Executive summary cards
- Hero sections
- Glassmorphism design
- Light theme
- Public-facing content only

**API Filtering:**
- ✅ Uses `?published=true` query param to hide drafts

---

### **2. Secondary HomePage (Dark Version - In Development)**

**Component:** `src/pages/HomeV2.tsx` or `src/pages/HomeDark.tsx`  
**Route:** `/home-v2` or `/dark`  
**API Calls:** 
- Same as Primary HomePage
- `GET http://localhost:3001/api/initiatives?published=true`

**Backend Data Locations:**
- Same as Primary HomePage

**Features:**
- Dark theme variant
- Modern UI redesign
- Same data, different presentation
- Currently in development/testing

**API Filtering:**
- ✅ Uses `?published=true` query param

---

### **3. Initiatives List Page**

**Component:** `src/pages/InitiativesHome.tsx`  
**Route:** `/initiatives`  
**API Calls:**
- `GET http://localhost:3001/api/initiatives?published=true` (list all published)
- `GET http://localhost:3001/api/initiatives/${id}` (when clicking initiative)

**Backend Data Locations:**
- `backend/data/initiatives/*.json` (individual initiative files)
- `backend/data/goals/goals.json` (for linked goals)

**Features:**
- Grid/card view of all published initiatives
- Status-based filtering (planning, in-progress, completed)
- Priority badges
- Progress bars
- Click to view detailed modal

**API Filtering:**
- ✅ Only shows initiatives where `_published: true`
- Frontend users CANNOT see unpublished drafts

**Data Flow:**
```
User visits /initiatives
  ↓
InitiativesHome.tsx renders
  ↓
fetchInitiatives() called
  ↓
GET /api/initiatives?published=true
  ↓
backend/api/initiatives.js filters by _published field
  ↓
Returns only published initiatives array
  ↓
Renders grid of initiative cards
```

---

### **4. Initiatives Gantt Page**

**Component:** `src/pages/InitiativesGantt.tsx` or `src/pages/InitiativesGanttV2.tsx`  
**Route:** `/initiatives/gantt`  
**API Calls:**
- `GET http://localhost:3001/api/initiatives?published=true`
- `GET http://localhost:3001/api/tasks` (if tasks integrated)

**Backend Data Locations:**
- `backend/data/initiatives/*.json` (milestones, timeline data)
- `backend/data/tasks/*.json` (if task system integrated)

**Features:**
- Timeline visualization (Gantt chart)
- Milestone tracking
- Phase-based view
- Dependencies visualization
- Resource allocation view

**API Filtering:**
- ✅ Only published initiatives visible on timeline

---

### **5. Goals List Page**

**Component:** `src/pages/GoalsHome.tsx` or `src/components/GoalsViewer.tsx`  
**Route:** `/goals`  
**API Calls:**
- `GET http://localhost:3001/api/goals`

**Backend Data Locations:**
- `backend/data/goals/goals.json` (single file with all goals)

**Features:**
- Strategic goals grid
- Goal categories (Revenue, Customer, Operations, Innovation)
- Progress tracking
- Linked initiatives count
- KPI metrics

**API Filtering:**
- Goals don't have `_published` field (all visible by default)
- Could be added if needed for draft goals

**Data Structure:**
```json
{
  "goals": [
    {
      "id": "goal-1",
      "name": "Strategic Goal Name",
      "shortName": "Short Name",
      "category": "revenue",
      "progress": 75,
      "linkedInitiatives": ["initiative-id-1", "initiative-id-2"],
      ...
    }
  ]
}
```

---

### **6. Vendor Summaries Page**

**Component:** `src/pages/VendorSummaries.tsx` or uses template system  
**Route:** `/vendors` or `/vendor/:id`  
**API Calls:**
- `GET http://localhost:3001/api/content?tag=vendor-summary` (list all)
- `GET http://localhost:3001/api/content/:id` (single vendor)

**Backend Data Locations:**
- `backend/data/content/vendor/*.json`
  - `coast-vendor-summary-q1-2026.json`
  - `synthesia-vendor-summary-q1-2026.json`
  - `tiled-vendor-summary-q1-2026.json`

**Features:**
- Vendor technology overviews
- Pricing information
- Feature comparisons
- Use cases
- Demo capabilities

**Template Used:**
- `src/templates/VendorTemplate.tsx` (renders JSON content)

**Data Structure:**
```json
{
  "_contentTag": "vendor-summary",
  "meta": {
    "title": "Coast - Demo Automation Platform",
    "category": "vendor"
  },
  "heroMetrics": [...],
  "features": [...],
  "capabilities": [...]
}
```

---

### **7. Performance Summaries Page**

**Component:** `src/pages/PerformanceSummaries.tsx`  
**Route:** `/performance` or `/performance/:id`  
**API Calls:**
- `GET http://localhost:3001/api/content/list/performance` (list all)
- `GET http://localhost:3001/api/content/performance/:filename` (single report)

**Backend Data Locations:**
- `backend/data/content/performance/*.json`

**Features:**
- Performance metrics dashboards
- Data visualization (charts, graphs)
- Time-series data
- Comparative analysis
- Export capabilities

**Template Used:**
- `src/templates/PerformanceTemplate.tsx` or custom renderer

**API Filtering:**
- Could add `_published` field if needed for draft reports

---

## 🎛️ CMS-ADMIN (Content Management System)

### **Architecture Overview**

**Base Application:**
- **Entry Point:** `cms-admin/src/App.tsx`
- **Main Dashboard:** `cms-admin/src/components/CMSv2Dashboard.tsx`
- **Route:** `http://localhost:5173` (Vite dev server)

**Key Differences from Frontend:**
- ✅ Sees ALL content (published + unpublished)
- ✅ Edit + View modes
- ✅ Special fields visible (`_published`, `_contentTag`, etc.)
- ✅ Admin controls (delete, export, publish)
- ✅ API calls WITHOUT `?published=true` filter

---

### **CMS Navigation Structure**

```
CMS Dashboard (CMSv2Dashboard.tsx)
  ↓
  ├─→ Content
  │     ├─→ Leadership Summaries (view/edit)
  │     ├─→ Vendor Summaries (view/edit)
  │     ├─→ Performance Reports (view/edit)
  │     └─→ Templates (view/manage)
  │
  ├─→ Strategy
  │     ├─→ Goals Manager (edit goals)
  │     └─→ Initiatives Manager (edit initiatives)
  │
  ├─→ Tasks & Notes
  │     ├─→ Tasks Manager (view/edit tasks)
  │     └─→ Notes Manager (view/edit notes)
  │
  ├─→ Organization
  │     ├─→ OrgChart Viewer
  │     └─→ People Manager
  │
  └─→ Settings
        ├─→ Design System
        ├─→ Tags Management
        └─→ System Settings
```

---

### **CMS Feature 1: Initiatives Manager**

**Component:** `cms-admin/src/components/InitiativesManager.tsx`  
**Opens From:** CMSv2Dashboard → Strategy → Initiatives  
**Mode:** Edit & View  

**API Calls:**
- `GET http://localhost:3001/api/initiatives` (NO published filter - sees ALL)
- `GET http://localhost:3001/api/initiatives/:id` (full details)
- `PUT http://localhost:3001/api/initiatives/:id` (save edits)
- `POST http://localhost:3001/api/initiatives` (create new)
- `DELETE http://localhost:3001/api/initiatives/:id` (delete)

**Backend Data:**
- `backend/data/initiatives/*.json`

**Features:**
- 3-column grid (High Priority, Blocked, Delayed/In Progress/Complete)
- Shows ALL initiatives (published + unpublished)
- Edit button opens `InitiativeEditorModal.tsx`
- Click tile opens `ViewInitiativeModalClean.tsx`
- Export to JSON
- Delete initiative
- AI Builder integration

**Special CMS Fields:**
- `_published` (boolean) - Toggle publish/unpublish
  - `true` = visible on frontend
  - `false` = CMS-only, hidden from public

**Sub-Components:**
| Component | Purpose | Mode |
|-----------|---------|------|
| `InitiativeEditorModal.tsx` | Full initiative editor | Edit |
| `ViewInitiativeModalClean.tsx` | Read-only details view | View |
| `AIInitiativeBuilderWizard.tsx` | AI-powered creation | Create |

**Workflow:**
```
1. User clicks "Initiatives" in CMS Dashboard
2. InitiativesManager.tsx opens (modal)
3. Fetches ALL initiatives (published + unpublished)
4. Displays in 3-column grid with status badges
5. User clicks "Edit" button on tile
6. InitiativeEditorModal.tsx opens
7. User edits fields including _published toggle
8. User clicks "Save"
9. PUT /api/initiatives/:id updates JSON file
10. Modal closes, grid refreshes
```

---

### **CMS Feature 2: Initiatives Hero (Prioritization)**

**Component:** `cms-admin/src/components/InitiativesHero.tsx`  
**Opens From:** InitiativesManager → "Prioritize" button  
**Mode:** View & Prioritize  

**API Calls:**
- `GET http://localhost:3001/api/initiatives` (ALL initiatives)
- `GET http://localhost:3001/api/initiatives/settings/priority-order` (load priority)
- `POST http://localhost:3001/api/initiatives/settings/priority-order` (save priority)

**Backend Data:**
- `backend/data/initiatives/*.json` (initiative files)
- `backend/data/initiatives/priority-order.json` (priority settings)

**Features:**
- Full-screen modal
- Hero card (#1 priority initiative)
- Featured cards (#2-5 priority)
- Grid of all other initiatives
- Drag-and-drop reordering
- Move up/down priority controls

**Priority Persistence:**
- ✅ Saved to backend JSON file (NOT localStorage)
- ✅ Survives rebuilds and restarts
- ✅ Format: `{ "priorityOrder": ["id1", "id2", ...], "lastUpdated": "ISO date" }`

**Special Features:**
- Shows ALL initiatives (no published filter)
- Can prioritize unpublished initiatives
- Frontend version would filter to only show published in hero

---

### **CMS Feature 3: Goals Manager**

**Component:** `cms-admin/src/components/GoalsManager.tsx`  
**Opens From:** CMSv2Dashboard → Strategy → Goals  
**Mode:** Edit & View  

**API Calls:**
- `GET http://localhost:3001/api/goals` (load all goals)
- `PUT http://localhost:3001/api/goals` (save entire goals file)

**Backend Data:**
- `backend/data/goals/goals.json` (single file with array)

**Features:**
- Create new goals
- Edit existing goals (name, category, metrics, KPIs)
- Delete goals
- Track linked initiatives
- Goal categories (Revenue, Customer, Operations, Innovation)

**Data Structure:**
```json
{
  "goals": [
    {
      "id": "goal-revenue-growth",
      "name": "Accelerate Revenue Growth",
      "shortName": "Revenue Growth",
      "category": "revenue",
      "progress": 65,
      "status": "on-track",
      "linkedInitiatives": ["initiative-1", "initiative-2"],
      "kpis": [...]
    }
  ]
}
```

---

### **CMS Feature 4: Leadership Summaries**

**Component:** `cms-admin/src/components/ContentEditor.tsx`  
**Opens From:** CMSv2Dashboard → Content → Leadership Summaries  
**Mode:** View & Edit  

**API Calls:**
- `GET http://localhost:3001/api/content?tag=leadership-summary` (list)
- `GET http://localhost:3001/api/content/:id` (single)
- `PUT http://localhost:3001/api/content/:id` (save)

**Backend Data:**
- `backend/data/content/leadership/*.json`
  - `weekly-summary-jan-20-2026.json`
  - `weekly-summary-jan-26-2026.json`

**Features:**
- View in `LeadershipTemplate.tsx`
- Edit in `LeadershipSummaryEditor.tsx`
- Theme toggle (dark/light)
- Export to PNG (modern-screenshot)
- BLUF, Prioritization, Risks, Outlook sections

**Special CMS Fields:**
- `_contentTag: "leadership-summary"` (for filtering)
- Could add `_published` if needed

**Data Structure:**
```json
{
  "_contentTag": "leadership-summary",
  "meta": {
    "title": "Weekly Summary",
    "week": "Jan 26 - Feb 1, 2026"
  },
  "metadata": {...},
  "bluf": {...},
  "prioritization": [...],
  "risks": [...]
}
```

---

### **CMS Feature 5: Vendor Summaries**

**Component:** `cms-admin/src/components/ContentEditor.tsx`  
**Opens From:** CMSv2Dashboard → Content → Vendor Summaries  
**Mode:** View & Edit  

**API Calls:**
- `GET http://localhost:3001/api/content?tag=vendor-summary`
- `GET http://localhost:3001/api/content/:id`
- `PUT http://localhost:3001/api/content/:id`

**Backend Data:**
- `backend/data/content/vendor/*.json`

**Features:**
- Vendor technology overviews
- Pricing tables
- Feature matrices
- Use case documentation

**Special CMS Fields:**
- `_contentTag: "vendor-summary"`

---

### **CMS Feature 6: Template Builder**

**Component:** `cms-admin/src/components/TemplateBuilder.tsx`  
**Opens From:** CMSv2Dashboard → Content → Templates  
**Mode:** Create & Edit  

**API Calls:**
- Reads from `cms-admin/src/templates/*.json`
- Saves to same location

**Backend Data:**
- `cms-admin/src/templates/*.json` (template definitions)

**Features:**
- Visual template editor
- Section management
- Asset preview (23 asset types)
- Example data editor
- Export template JSON

**Asset Library:**
- 23 asset types across 5 categories
- Live preview rendering
- Design system compliance

---

### **CMS Feature 7: Tasks Manager**

**Component:** `cms-admin/src/components/TasksManager.tsx`  
**Opens From:** CMSv2Dashboard → Tasks & Notes  
**Mode:** Edit & View  

**API Calls:**
- `GET http://localhost:3001/api/tasks` (all tasks)
- `POST http://localhost:3001/api/tasks` (create)
- `PUT http://localhost:3001/api/tasks/:id` (update)
- `DELETE http://localhost:3001/api/tasks/:id` (delete)

**Backend Data:**
- `backend/data/tasks/*.json` (one file per task)

**Features:**
- Task creation/editing
- Link to initiatives
- Link to notes
- Status tracking
- Due dates

---

### **CMS Feature 8: Notes Manager**

**Component:** `cms-admin/src/components/NotesManager.tsx`  
**Opens From:** CMSv2Dashboard → Tasks & Notes  
**Mode:** Edit & View  

**API Calls:**
- `GET http://localhost:3001/api/notes`
- `POST http://localhost:3001/api/notes`
- `PUT http://localhost:3001/api/notes/:id`
- `DELETE http://localhost:3001/api/notes/:id`
- `GET http://localhost:3001/api/sections` (note sections)

**Backend Data:**
- `backend/data/notes/*.json`
- `backend/data/sections.json`

**Features:**
- Rich text notes
- Section organization
- Link to tasks
- Tagging system

---

### **CMS Feature 9: Design System Manager**

**Component:** `cms-admin/src/components/DesignSystemManager.tsx`  
**Opens From:** CMSv2Dashboard → Settings → Design System  
**Mode:** Edit  

**API Calls:**
- `GET http://localhost:3001/api/design-system/colors`
- `PUT http://localhost:3001/api/design-system/colors`

**Backend Data:**
- `backend/data/design-system/colors.json`

**Features:**
- Color palette management
- Semantic color variables
- CSS variable export
- Live preview

---

## 🔄 Key Differences: CMS vs Frontend

### **1. Published Status (`_published` field)**

| Aspect | CMS-Admin | Frontend |
|--------|-----------|----------|
| **API Call** | `GET /api/initiatives` | `GET /api/initiatives?published=true` |
| **What Shows** | ALL initiatives | Only `_published: true` |
| **Can Edit** | ✅ Yes | ❌ No (read-only) |
| **Toggle Publish** | ✅ Yes (in editor) | ❌ Not visible |
| **Use Case** | Draft initiatives, work in progress | Public-facing, finalized content |

**Implementation:**
```typescript
// CMS (no filter)
fetch('http://localhost:3001/api/initiatives')
// Returns: ALL initiatives including unpublished

// Frontend (filtered)
fetch('http://localhost:3001/api/initiatives?published=true')
// Returns: Only initiatives where _published === true
```

---

### **2. Content Tags (`_contentTag` field)**

| Tag | Purpose | CMS View | Frontend View |
|-----|---------|----------|---------------|
| `leadership-summary` | Weekly leadership updates | Edit in ContentEditor | View in LeadershipTemplate |
| `vendor-summary` | Vendor tech overviews | Edit in ContentEditor | View in VendorTemplate |
| `performance` | Performance reports | Edit in ContentEditor | View in PerformanceTemplate |

**Backend Filtering:**
```javascript
// Get all leadership summaries
GET /api/content?tag=leadership-summary

// Get all vendor summaries
GET /api/content?tag=vendor-summary
```

---

### **3. Edit vs View Components**

| Content Type | CMS Editor Component | CMS Viewer Component | Frontend Viewer |
|--------------|---------------------|---------------------|-----------------|
| **Initiatives** | `InitiativeEditorModal.tsx` | `ViewInitiativeModalClean.tsx` | `src/pages/InitiativesHome.tsx` |
| **Goals** | `GoalsManager.tsx` | N/A (inline view) | `src/pages/GoalsHome.tsx` |
| **Leadership Summaries** | `LeadershipSummaryEditor.tsx` | `LeadershipTemplate.tsx` | `src/templates/LeadershipTemplate.tsx` |
| **Vendor Summaries** | `ContentEditor.tsx` | `VendorTemplate.tsx` | `src/templates/VendorTemplate.tsx` |
| **Templates** | `TemplateBuilder.tsx` | `EngineAssetsPreview.tsx` | N/A (not public) |
| **Tasks** | `TaskEditorModal.tsx` | `TasksManager.tsx` | N/A (CMS-only) |
| **Notes** | `NoteEditor.tsx` | `NotesManager.tsx` | N/A (CMS-only) |

---

### **4. Admin-Only Features**

Features ONLY in CMS (not on frontend):

| Feature | Component | Purpose |
|---------|-----------|---------|
| **Delete Content** | All manager components | Remove initiatives, goals, notes, tasks |
| **Export JSON** | InitiativesManager, others | Download JSON files |
| **AI Builder** | AIInitiativeBuilderWizard | Generate initiatives with AI |
| **Template Builder** | TemplateBuilder | Create/edit content templates |
| **Design System** | DesignSystemManager | Manage color palettes, variables |
| **Priority Order** | InitiativesHero | Set hero/featured initiatives |
| **Publish Toggle** | InitiativeEditorModal | Control visibility on frontend |
| **Tags Management** | TagsManager | Manage content tags |
| **Gantt Editor** | GanttEditor | Edit initiative timelines |

---

### **5. Data Access Patterns**

**CMS Pattern (Full Access):**
```typescript
// Load ALL initiatives (including drafts)
const response = await fetch('http://localhost:3001/api/initiatives');
const data = await response.json();
// data.initiatives = [ALL initiatives, published + unpublished]

// Edit and save
const updateResponse = await fetch(`http://localhost:3001/api/initiatives/${id}`, {
  method: 'PUT',
  body: JSON.stringify(updatedInitiative)
});
```

**Frontend Pattern (Filtered Access):**
```typescript
// Load ONLY published initiatives
const response = await fetch('http://localhost:3001/api/initiatives?published=true');
const data = await response.json();
// data.initiatives = [Only where _published === true]

// No write access (read-only)
```

---

## 📂 Backend File Organization

### **Initiatives**
```
backend/data/initiatives/
  ├── automated-demo-provisioning-factory.json
  ├── demo-asset-registry-governance.json
  ├── demo-capacity-scheduling-optimization.json
  ├── demo-data-automation-refresh.json
  ├── demo-data-quality-compliance.json
  ├── demo-enablement-content-factory.json
  ├── demo-environment-audit-gtm.json  (NEW - unpublished)
  └── priority-order.json  (priority settings)
```

### **Goals**
```
backend/data/goals/
  └── goals.json  (single file with all goals array)
```

### **Content**
```
backend/data/content/
  ├── leadership/
  │   ├── weekly-summary-jan-20-2026.json
  │   └── weekly-summary-jan-26-2026.json
  ├── vendor/
  │   ├── coast-vendor-summary-q1-2026.json
  │   ├── synthesia-vendor-summary-q1-2026.json
  │   └── tiled-vendor-summary-q1-2026.json
  └── performance/
      └── (performance reports)
```

### **Tasks & Notes**
```
backend/data/
  ├── tasks/
  │   └── *.json  (one file per task)
  ├── notes/
  │   └── *.json  (one file per note)
  └── sections.json  (note sections)
```

### **Design System**
```
backend/data/design-system/
  └── colors.json
```

---

## 🔧 API Endpoint Reference

### **Initiatives API**
```
GET    /api/initiatives                           → List all (or filtered by ?published=true)
GET    /api/initiatives/:id                       → Get single initiative
POST   /api/initiatives                           → Create new initiative
PUT    /api/initiatives/:id                       → Update initiative
DELETE /api/initiatives/:id                       → Delete initiative
GET    /api/initiatives/settings/priority-order   → Get priority order
POST   /api/initiatives/settings/priority-order   → Save priority order
```

### **Goals API**
```
GET    /api/goals         → Get all goals
PUT    /api/goals         → Update entire goals file
```

### **Content API**
```
GET    /api/content?tag=:tag    → List by tag (leadership-summary, vendor-summary)
GET    /api/content/:id         → Get single content item
PUT    /api/content/:id         → Update content item
```

### **Tasks API**
```
GET    /api/tasks         → List all tasks
GET    /api/tasks/:id     → Get single task
POST   /api/tasks         → Create task
PUT    /api/tasks/:id     → Update task
DELETE /api/tasks/:id     → Delete task
```

### **Notes API**
```
GET    /api/notes                  → List all notes
GET    /api/notes/:id              → Get single note
POST   /api/notes                  → Create note
PUT    /api/notes/:id              → Update note
DELETE /api/notes/:id              → Delete note
GET    /api/sections               → Get note sections
POST   /api/sections               → Create section
PUT    /api/sections/:id           → Update section
DELETE /api/sections/:id           → Delete section
```

---

## 🎯 Workflow Examples

### **Example 1: Creating and Publishing an Initiative**

**CMS Workflow:**
```
1. User opens CMS-Admin (localhost:5173)
2. Clicks CMSv2Dashboard → Strategy → Initiatives
3. InitiativesManager.tsx opens
4. Clicks "Create New Initiative" button
5. InitiativeEditorModal.tsx opens with blank form
6. User fills in:
   - Name: "Demo Automation Initiative"
   - Owner, Status, Priority, etc.
   - SMART Goals
   - Budget
   - _published: false (toggle OFF - draft mode)
7. Clicks "Save"
8. POST /api/initiatives creates JSON file
9. File saved: backend/data/initiatives/demo-automation-initiative.json
10. Initiative appears in CMS grid with "Unpublished" badge
```

**Publishing Workflow:**
```
11. User clicks "Edit" on the initiative tile
12. InitiativeEditorModal.tsx opens
13. User reviews content
14. Toggles "_published" to TRUE (green pulsing dot)
15. Clicks "Save"
16. PUT /api/initiatives/:id updates JSON file
17. Initiative now visible on frontend when filtering by published=true
```

**Frontend Result:**
```
18. User visits frontend: localhost:5174/initiatives
19. InitiativesHome.tsx calls GET /api/initiatives?published=true
20. Backend filters and returns only published initiatives
21. New initiative appears in public list
```

---

### **Example 2: Editing a Leadership Summary**

**CMS Workflow:**
```
1. User opens CMS-Admin
2. Clicks CMSv2Dashboard → Content → Leadership Summaries
3. Sees list of all weekly summaries
4. Clicks "weekly-summary-jan-26-2026"
5. ContentEditor.tsx routes to LeadershipTemplate.tsx (view mode)
6. User clicks "Edit Content" button
7. LeadershipSummaryEditor.tsx opens
8. User edits:
   - BLUF section
   - Adds new priority
   - Updates risk mitigation
9. Clicks "Save"
10. PUT /api/content/:id updates JSON file
11. File updated: backend/data/content/leadership/weekly-summary-jan-26-2026.json
```

**Frontend Result:**
```
12. Changes immediately available on frontend
13. No publishing step needed (leadership summaries always visible)
14. LeadershipTemplate.tsx renders updated content
```

---

### **Example 3: Setting Initiative Priority Order**

**CMS Workflow:**
```
1. User opens InitiativesManager.tsx
2. Clicks "Prioritize" button
3. InitiativesHero.tsx opens (full-screen modal)
4. Shows:
   - Large hero card (#1 priority)
   - 4 featured cards (#2-5)
   - Grid of all other initiatives
5. User drags "Demo Automation" to #1 position
6. User drags "Asset Registry" to #2 position
7. savePriorityOrder() called automatically
8. POST /api/initiatives/settings/priority-order
9. File updated: backend/data/initiatives/priority-order.json
   {
     "priorityOrder": ["demo-automation", "asset-registry", ...],
     "lastUpdated": "2026-02-03T14:30:00Z"
   }
```

**Persistence:**
```
10. User closes browser
11. Rebuilds CMS-Admin (npm run build)
12. Reopens InitiativesHero
13. Priority order PRESERVED (loaded from backend JSON file)
14. No localStorage used - survives rebuilds
```

---

## 🚨 Important Notes

### **When to Use CMS vs Frontend**

**Use CMS-Admin for:**
- Creating/editing any content
- Managing drafts (unpublished content)
- Deleting content
- Setting priorities
- Administrative tasks
- Template management
- System configuration

**Use Frontend for:**
- Public-facing views
- Sharing with stakeholders
- Demo purposes
- Read-only access
- Filtered/curated content

### **Special Field Prefixes**

Fields starting with `_` are system/admin fields:
- `_published` - Controls visibility on frontend
- `_contentTag` - Content type identifier for filtering
- `_enabled_*` - Feature toggles in templates

### **File Naming Conventions**

**Initiatives:** `kebab-case-id.json`
- Example: `demo-environment-audit-gtm.json`

**Content:** `type-name-period.json`
- Example: `weekly-summary-jan-26-2026.json`
- Example: `coast-vendor-summary-q1-2026.json`

**Special Files:**
- `priority-order.json` - Initiative priority settings
- `goals.json` - All goals in single file
- `sections.json` - Note sections

---

## 📊 Component Hierarchy

### **Frontend Hierarchy**
```
App.tsx (main)
  └─→ Router
       ├─→ Home.tsx (/)
       ├─→ InitiativesHome.tsx (/initiatives)
       │    └─→ InitiativeDetailsModal.tsx (view single)
       ├─→ InitiativesGantt.tsx (/initiatives/gantt)
       ├─→ GoalsHome.tsx (/goals)
       ├─→ VendorSummaries.tsx (/vendors)
       └─→ PerformanceSummaries.tsx (/performance)
```

### **CMS-Admin Hierarchy**
```
App.tsx (CMS)
  └─→ CMSv2Dashboard.tsx (main dashboard)
       ├─→ InitiativesManager.tsx (modal)
       │    ├─→ InitiativeEditorModal.tsx (edit)
       │    ├─→ ViewInitiativeModalClean.tsx (view)
       │    └─→ AIInitiativeBuilderWizard.tsx (create)
       ├─→ InitiativesHero.tsx (modal)
       ├─→ GoalsManager.tsx (modal)
       ├─→ ContentEditor.tsx (modal)
       │    ├─→ LeadershipSummaryEditor.tsx (edit leadership)
       │    └─→ LeadershipTemplate.tsx (view leadership)
       ├─→ TemplateBuilder.tsx (modal)
       ├─→ TasksManager.tsx (modal)
       ├─→ NotesManager.tsx (modal)
       └─→ DesignSystemManager.tsx (modal)
```

---

**End of Workflows Documentation**
