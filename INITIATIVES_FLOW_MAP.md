# Initiatives System - Complete Flow Map

**Last Updated:** February 3, 2026

---

## 🗺️ Navigation Flow

```
CMS Dashboard
    ↓
Strategy → Initiatives (CMSv2Dashboard.tsx)
    ↓
Opens InitiativesManager.tsx (Main View)
    ↓
    ├─→ Click Initiative Tile → ViewInitiativeModalClean.tsx (Read-only view)
    ├─→ Click Edit Button → InitiativeEditorModal.tsx (Edit mode)
    ├─→ Click Prioritize Button → InitiativesHero.tsx (Hero prioritization modal)
    └─→ Click AI Builder → AIInitiativeBuilderWizard.tsx (AI-generated initiative)
```

---

## 📂 File Structure & Responsibilities

### **Backend (Data Layer)**

#### **API Routes**
| File | Purpose | Endpoints |
|------|---------|-----------|
| `backend/api/initiatives.js` | Main initiatives API router | GET/POST/PUT/DELETE initiatives, priority order |
| `backend/server.js` (line 93) | Mounts routes | `app.use('/api/initiatives', initiativesRoutes)` |

#### **API Endpoints**
```javascript
GET    /api/initiatives                           // List all initiatives (metadata only)
GET    /api/initiatives/:id                       // Get single initiative (full details + linked goals)
POST   /api/initiatives                           // Create new initiative
PUT    /api/initiatives/:id                       // Update existing initiative
DELETE /api/initiatives/:id                       // Delete initiative
GET    /api/initiatives/settings/priority-order   // Get priority order array
POST   /api/initiatives/settings/priority-order   // Save priority order array
```

#### **Data Storage**
| Location | Files | Format |
|----------|-------|--------|
| `backend/data/initiatives/` | `*.json` (one per initiative) | Individual JSON files |
| `backend/data/initiatives/priority-order.json` | Priority order settings | `{ priorityOrder: ["id1", "id2"], lastUpdated: "ISO date" }` |

---

### **Frontend (Presentation Layer)**

#### **Main Components (Active/Current)**

| File | Component | Purpose | When Used | Data Source |
|------|-----------|---------|-----------|-------------|
| **cms-admin/src/components/InitiativesManager.tsx** | InitiativesManager | **PRIMARY VIEW** - 3-column grid of all initiatives | Opened from CMS Dashboard → Strategy → Initiatives | `GET /api/initiatives` |
| **cms-admin/src/components/ViewInitiativeModalClean.tsx** | ViewInitiativeModalClean | Read-only details modal | Click any initiative tile in InitiativesManager | `GET /api/initiatives/:id` (via InitiativesManager) |
| **cms-admin/src/components/InitiativeEditorModal.tsx** | InitiativeEditorModal | Full initiative editor (SMART goals, budget, risks, etc.) | Click "Edit" button on initiative tile | Passed initiative object |
| **cms-admin/src/components/InitiativesHero.tsx** | InitiativesHero | **HERO MODAL** - Prioritization interface with featured initiatives | Click "Prioritize" button in InitiativesManager | `GET /api/initiatives`<br>`GET /api/initiatives/settings/priority-order` |
| **cms-admin/src/components/AIInitiativeBuilderWizard.tsx** | AIInitiativeBuilderWizard | AI-powered initiative creation wizard | Click "AI Builder" button | N/A (creates new initiative) |
| **cms-admin/src/components/InitiativeDetailsModal.tsx** | InitiativeDetailsModal | Alternative details view (older design) | NOT CURRENTLY USED | `GET /api/initiatives/:id` |

#### **Supporting Components**

| File | Component | Purpose |
|------|-----------|---------|
| **cms-admin/src/components/CMSv2Dashboard.tsx** | CMSv2Dashboard | Main CMS landing page with Strategy tile |
| **cms-admin/src/App.tsx** | App | Mounts InitiativesManager and InitiativesHero modals |

#### **Legacy/Backup Files (DO NOT USE)**

| File | Status | Notes |
|------|--------|-------|
| `cms-admin/src/components/InitiativesManager.BACKUP.tsx` | ❌ Backup | Old version, DO NOT MODIFY |
| `cms-admin/src/pages/InitiativesGantt.tsx` | ⚠️ Old Gantt view | Separate Gantt chart page (may be outdated) |
| `cms-admin/src/pages/InitiativesGanttV2.tsx` | ⚠️ Newer Gantt view | V2 of Gantt chart |

---

## 🔄 Data Flow Diagrams

### **1. Viewing Initiatives (Main Flow)**

```
USER CLICKS: Strategy → Initiatives
    ↓
CMSv2Dashboard.tsx
    ↓ (opens modal via App.tsx state)
InitiativesManager.tsx
    ↓ componentDidMount
    fetchInitiatives()
    ↓
    GET http://localhost:3001/api/initiatives
    ↓
    backend/api/initiatives.js → discoverInitiatives()
    ↓
    Reads all *.json files in backend/data/initiatives/
    ↓
    Returns array of initiative metadata:
    {
      initiatives: [
        { id, name, shortName, status, priority, progress, owner, ... }
      ]
    }
    ↓
InitiativesManager.tsx renders 3-column grid
    ↓
    Column 1: High Priority (13 initiatives)
    Column 2: Blocked (0 initiatives)  
    Column 3: Delayed/In Progress/Complete (status-based filtering)
```

### **2. Clicking an Initiative Tile**

```
USER CLICKS: Initiative tile in InitiativesManager
    ↓
handleInitiativeClick(id)
    ↓
    GET http://localhost:3001/api/initiatives/${id}
    ↓
    backend/api/initiatives.js → readInitiative(id)
    ↓
    Reads backend/data/initiatives/${id}.json
    Fetches linked goals from backend/data/goals/goals.json
    ↓
    Returns:
    {
      success: true,
      initiative: { ...full initiative object... },
      linkedGoals: [ ...goal objects... ]
    }
    ↓
setSelectedInitiative(data.initiative)
setLinkedGoals(data.linkedGoals)
    ↓
ViewInitiativeModalClean.tsx renders
    ↓
Displays all initiative details in read-only format
```

### **3. Editing an Initiative**

```
USER CLICKS: Edit button (pencil icon on tile hover)
    ↓
handleEditInitiative(initiative)
    ↓
    GET http://localhost:3001/api/initiatives/${id}
    ↓
    (same as click flow - fetches full initiative details)
    ↓
setEditingInitiative(data.initiative)
setShowEditor(true)
    ↓
InitiativeEditorModal.tsx renders
    ↓
USER EDITS: Form fields (name, SMART goal, budget, risks, etc.)
    ↓
USER CLICKS: Save
    ↓
handleSaveInitiative(initiativeData)
    ↓
    PUT http://localhost:3001/api/initiatives/${id}
    ↓
    backend/api/initiatives.js
    ↓
    Writes updated JSON to backend/data/initiatives/${id}.json
    ↓
    Returns: { success: true, initiative: {...} }
    ↓
fetchInitiatives() (refresh list)
setShowEditor(false)
```

### **4. Prioritizing Initiatives (Hero Modal)**

```
USER CLICKS: "Prioritize" button in InitiativesManager header
    ↓
setShowInitiativesHero(true) (in App.tsx)
    ↓
InitiativesHero.tsx opens (full-screen modal)
    ↓
fetchInitiatives()
    ↓
    GET http://localhost:3001/api/initiatives
    (fetches all initiatives)
    ↓
    GET http://localhost:3001/api/initiatives/settings/priority-order
    (fetches saved priority array from backend/data/initiatives/priority-order.json)
    ↓
    Returns: { success: true, priorityOrder: ["id1", "id2", "id3", "id4", "id5"] }
    ↓
setPrioritizedIds(priorityData.priorityOrder)
    ↓
Renders hero section:
    - Large card: #1 prioritized initiative
    - Small cards: #2-5 prioritized initiatives
    - Grid: All other initiatives
    ↓
USER DRAGS: Initiatives to reorder priority
    ↓
savePriorityOrder(newOrder)
    ↓
    POST http://localhost:3001/api/initiatives/settings/priority-order
    Body: { priorityOrder: ["id2", "id1", "id3", ...] }
    ↓
    backend/api/initiatives.js
    ↓
    Writes backend/data/initiatives/priority-order.json
    {
      "priorityOrder": ["id2", "id1", "id3", "id4", "id5"],
      "lastUpdated": "2026-02-03T12:30:00Z"
    }
    ↓
Priority order persists across sessions! ✅
```

### **5. Creating New Initiative (AI Builder)**

```
USER CLICKS: "AI Builder" button in InitiativesManager
    ↓
setShowAIBuilder(true)
    ↓
AIInitiativeBuilderWizard.tsx opens
    ↓
USER INPUTS: Initiative description/prompt
    ↓
AI generates initiative structure
    ↓
handleAIInitiativeCreate(initiativeData)
    ↓
setEditingInitiative(initiativeData)
setShowEditor(true)
    ↓
InitiativeEditorModal.tsx opens with AI-generated data pre-filled
    ↓
USER REVIEWS/EDITS: Generated content
    ↓
USER CLICKS: Save
    ↓
    POST http://localhost:3001/api/initiatives
    ↓
    backend/api/initiatives.js
    ↓
    Creates new backend/data/initiatives/${id}.json file
    ↓
fetchInitiatives() (refresh list with new initiative)
```

---

## 🎯 Key Interfaces & Data Structures

### **Initiative Object (Full)**
```typescript
interface Initiative {
  id: string;                          // "demo-asset-registry-governance"
  name: string;                        // "Demo Asset Registry & Governance"
  shortName: string;                   // "Demo Asset Governance"
  category: 'revenue' | 'customer' | 'cost' | 'innovation';
  owner: string;                       // "Head of Demo Services"
  coOwners?: string[];                 // ["Sales Engineering Leadership"]
  sponsor: string;                     // "Chief Revenue Officer"
  status: 'planning' | 'in-progress' | 'on-hold' | 'at-risk' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;                    // 0-100
  projectStage: 'discovery' | 'planning' | 'mvp' | 'pilot' | 'scaling' | 'complete';
  linkedGoals: string[];               // ["goal-id-1", "goal-id-2"]
  
  smartGoal: {
    statement: string;
    specific: { objectives: string[] };
    measurable: { metrics: string[] };
    achievable: { resources: string; teamSize: string };
    relevant: { croAlignment: string[]; strategicThemes: string[] };
    timeBound: { timeline: Array<{ phase, deliverable, dueDate, status }> };
  };
  
  businessCase: {
    problem: string;
    opportunity: string;
    solution: string;
    expectedBenefits: string[];
    roi: string;
    paybackPeriod: string;
  };
  
  budget: {
    total: number;
    allocated: number;
    spent: number;
    currency: string;
    breakdown: Array<{ category, allocated, spent }>;
    fundingSource: string;
    costAvoidance: string;
  };
  
  funding: {
    requestedAmount: number;
    approvedAmount: number;
    approvalDate: string;
    approvedBy: string;
    phaseGates: Array<{ phase, amount, releaseCondition, status }>;
  };
  
  dependencies: {
    internal: Array<{ dependency, owner, requiredBy, status }>;
    external: Array<{ dependency, owner, requiredBy, status }>;
    blocking: string[];
  };
  
  resources: {
    team: Array<{ role, count, commitment, duration, skills }>;
    tools: Array<{ tool, purpose, cost, users }>;
    training: string[];
  };
  
  risks: Array<{
    id: string;
    description: string;
    impact: string;
    probability: string;
    severity: string;
    mitigation: string;
    owner: string;
    status: string;
  }>;
  
  milestones: Array<{
    id: string;
    name: string;
    description: string;
    dueDate: string;
    status: string;
    deliverables: string[];
    acceptanceCriteria: string[];
  }>;
  
  stakeholders: Array<{
    name: string;
    role: string;
    interest: string;
    influence: string;
    engagement: string;
    communicationFrequency: string;
  }>;
  
  successCriteria: Array<{
    metric: string;
    baseline: string;
    target: string;
    measurement: string;
    frequency: string;
  }>;
  
  indicators: {
    leading: Array<{ name, baseline, target, current, unit }>;
    lagging: Array<{ name, baseline, target, current, unit }>;
  };
  
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes: string;
}
```

### **Initiative List Response (Metadata Only)**
```typescript
// GET /api/initiatives returns lightweight list
{
  success: true,
  initiatives: [
    {
      id: string;
      name: string;
      shortName: string;
      status: string;
      priority: string;
      category: string;
      owner: string;
      sponsor: string;
      progress: number;
      startDate: string;
      endDate: string;
      linkedGoals: string[];
      smartGoal: { statement, measurable };  // Partial
      budget: { total, allocated, spent, currency };  // Partial
      businessCase: { roi, paybackPeriod };  // Partial
    }
  ]
}
```

### **Single Initiative Response (Full Details)**
```typescript
// GET /api/initiatives/:id returns complete object
{
  success: true,
  initiative: { ...full Initiative object... },
  linkedGoals: [
    { id, name, shortName, color, icon, ... }
  ]
}
```

---

## 🚨 Common Issues & Solutions

### **Issue 1: Initiatives not loading**
- **Symptom:** Empty grid in InitiativesManager
- **Check:** Backend running? `GET http://localhost:3001/api/initiatives` returns 200?
- **Solution:** Ensure backend server is running, check `backend/data/initiatives/` folder exists and has JSON files

### **Issue 2: Priority order lost after rebuild**
- **Symptom:** Hero modal shows different order after restart
- **Fix:** ✅ FIXED (Feb 3, 2026) - Now saves to `backend/data/initiatives/priority-order.json`
- **Old behavior:** Used localStorage (browser-specific, wiped on rebuild)
- **New behavior:** Persistent backend file

### **Issue 3: Modal not opening**
- **Symptom:** Click initiative tile, nothing happens
- **Check:** Browser console for errors, API response status
- **Solution:** Ensure `handleInitiativeClick` is fetching data successfully

### **Issue 4: Hero modal not showing featured initiatives**
- **Symptom:** Only grid view, no large hero card
- **Check:** Is `prioritizedIds` array populated? Check `priority-order.json`
- **Solution:** Click "Prioritize" button, drag initiatives to prioritized section, save

---

## 🔧 Configuration

### **API Base URL**
- **Development:** `http://localhost:3001`
- **Production:** Set via environment variable (TBD)

### **File Locations**
```
Backend Data:
  /backend/data/initiatives/*.json        (initiative files)
  /backend/data/initiatives/priority-order.json  (priority settings)
  /backend/data/goals/goals.json          (goals for linking)

Frontend Components:
  /cms-admin/src/components/InitiativesManager.tsx
  /cms-admin/src/components/InitiativesHero.tsx
  /cms-admin/src/components/ViewInitiativeModalClean.tsx
  /cms-admin/src/components/InitiativeEditorModal.tsx
  /cms-admin/src/components/AIInitiativeBuilderWizard.tsx
  /cms-admin/src/components/CMSv2Dashboard.tsx

Backend API:
  /backend/api/initiatives.js
  /backend/server.js
```

---

## 📊 Component State Management

### **InitiativesManager.tsx State**
```typescript
const [initiatives, setInitiatives] = useState<Initiative[]>([]);
const [goals, setGoals] = useState<Goal[]>([]);
const [loading, setLoading] = useState(true);
const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
const [showEditor, setShowEditor] = useState(false);
const [selectedInitiative, setSelectedInitiative] = useState<any | null>(null);
const [linkedGoals, setLinkedGoals] = useState<any[]>([]);
const [showAIBuilder, setShowAIBuilder] = useState(false);
```

### **InitiativesHero.tsx State**
```typescript
const [initiatives, setInitiatives] = useState<Initiative[]>([]);
const [loading, setLoading] = useState(true);
const [prioritizedIds, setPrioritizedIds] = useState<string[]>([]);  // ⭐ PERSISTENT
const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
const [linkedGoals, setLinkedGoals] = useState<any[]>([]);
const [goals, setGoals] = useState<any[]>([]);
```

---

## 🎬 Quick Actions Reference

| Action | Component | Function | API Call |
|--------|-----------|----------|----------|
| Open Initiatives | CMSv2Dashboard | `onOpenInitiativesHero()` | None (opens modal) |
| Load Initiatives | InitiativesManager | `fetchInitiatives()` | GET /api/initiatives |
| View Initiative | InitiativesManager | `handleInitiativeClick(id)` | GET /api/initiatives/:id |
| Edit Initiative | InitiativesManager | `handleEditInitiative(initiative)` | GET /api/initiatives/:id |
| Save Initiative | InitiativeEditorModal | `handleSaveInitiative(data)` | PUT /api/initiatives/:id |
| Delete Initiative | InitiativesManager | `handleDeleteInitiative(id)` | DELETE /api/initiatives/:id |
| Create Initiative | InitiativesManager | `handleCreateInitiative()` | POST /api/initiatives |
| Export Initiative | InitiativesManager | `handleExportInitiative(initiative)` | None (downloads JSON) |
| Prioritize | InitiativesHero | `savePriorityOrder(order)` | POST /api/initiatives/settings/priority-order |
| Load Priority Order | InitiativesHero | `fetchInitiatives()` | GET /api/initiatives/settings/priority-order |

---

## 🧭 Navigation Paths

### **From CMS Dashboard**
```
1. User clicks "Strategy" tile
2. CMSv2Dashboard scrolls to Strategy section
3. User clicks "Initiatives" sub-tile
4. CMSv2Dashboard calls onOpenInitiativesHero()
5. App.tsx sets showInitiativesHero = true
6. InitiativesManager.tsx modal opens
```

### **From App.tsx State**
```typescript
// App.tsx manages both modals
const [showInitiativesHero, setShowInitiativesHero] = useState(false);

// Lines 2263-2267: InitiativesHero modal
{showInitiativesHero && (
  <InitiativesHero
    isOpen={showInitiativesHero}
    onClose={() => setShowInitiativesHero(false)}
  />
)}

// InitiativesManager opened via CMSv2Dashboard prop:
onOpenInitiativesHero={() => setShowInitiativesHero(true)}
```

---

## ✅ Best Practices

1. **Always use InitiativesManager.tsx** as the primary view (not InitiativesHero)
2. **InitiativesHero** is for prioritization only (hero card + grid)
3. **Never modify .BACKUP.tsx files** - they're version snapshots
4. **Use ViewInitiativeModalClean.tsx** for read-only viewing
5. **Use InitiativeEditorModal.tsx** for editing
6. **Priority order is persistent** - survives rebuilds/restarts (as of Feb 3, 2026)
7. **Check backend console** for API logs (helpful for debugging)

---

**End of Initiatives Flow Map**
