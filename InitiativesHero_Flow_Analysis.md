# InitiativesHero.tsx - Complete Flow Analysis

## File Location
**Primary Component**: `c:\ExecSummary\cms-admin\src\components\InitiativesHero.tsx`

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    InitiativesHero.tsx                          │
│                  (Production Strategic View)                     │
│                                                                  │
│  - Shows 1 Hero Initiative + 4 Featured Cards                   │
│  - Priority-based layout (#1-#5 badges)                         │
│  - 2-row compact cards (Title+Tags, Progress Bar)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ USER CLICKS INITIATIVE CARD
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              handleInitiativeClick(id: string)                   │
│                                                                  │
│  1. Fetches full initiative data from API:                      │
│     GET http://localhost:3001/api/initiatives/${id}            │
│                                                                  │
│  2. Sets state variables:                                       │
│     - setSelectedInitiative(data.initiative)                    │
│     - setLinkedGoals(data.linkedGoals || [])                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ STATE CHANGE TRIGGERS MODAL
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│            InitiativeDetailsModal.tsx                            │
│         (Lines 755-762 in InitiativesHero.tsx)                  │
│                                                                  │
│  Import: import InitiativeDetailsModal from                     │
│          './InitiativeDetailsModal'                             │
│                                                                  │
│  File: c:\ExecSummary\cms-admin\src\components\                │
│        InitiativeDetailsModal.tsx                               │
│                                                                  │
│  Props Passed:                                                   │
│    - initiative={selectedInitiative}                            │
│    - linkedGoals={linkedGoals}                                  │
│    - onClose={handleCloseDetailsModal}                          │
│    - onEdit={() => handleEditInitiative(selectedInitiative)}   │
│                                                                  │
│  Modal Structure (7 Tabs):                                      │
│    1. Overview                                                   │
│    2. Milestones (with SMART sections)                          │
│    3. Performance (Leading/Lagging indicators)                  │
│    4. Resources (Team, Tools, Training)                         │
│    5. Risks & Success                                           │
│    6. Tasks                                                      │
│    7. Goals (conditional - shows if linkedGoals exist)          │
│                                                                  │
│  Header: Edit button (pencil icon) next to Close (X)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ USER CLICKS EDIT BUTTON (PENCIL ICON)
                              │ Triggers: onEdit={() => handleEditInitiative(selectedInitiative)}
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│          handleEditInitiative(initiative: Initiative)            │
│                     (Lines 105-108)                              │
│                                                                  │
│  1. Closes details modal:                                       │
│     setSelectedInitiative(null)                                 │
│                                                                  │
│  2. Opens editor with full data:                                │
│     setEditingInitiative(initiative)                            │
│                                                                  │
│  Note: Initiative data already fetched from API, no need        │
│        to re-fetch. Data is complete and ready for editing.     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ STATE CHANGE TRIGGERS EDITOR MODAL
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│            InitiativeEditorModal.tsx                             │
│         (Lines 765-774 in InitiativesHero.tsx)                  │
│                                                                  │
│  Import: import InitiativeEditorModal from                      │
│          './InitiativeEditorModal'                              │
│                                                                  │
│  File: c:\ExecSummary\cms-admin\src\components\                │
│        InitiativeEditorModal.tsx                                │
│                                                                  │
│  Props Passed:                                                   │
│    - initiative={editingInitiative}                             │
│    - goals={goals}  (fetched in useEffect)                      │
│    - onSave={handleSaveInitiative}                              │
│    - onClose={() => setEditingInitiative(null)}                │
│    - isNew={false}                                              │
│                                                                  │
│  Modal Structure (8 Tabs):                                      │
│    1. Overview                                                   │
│    2. Milestones                                                 │
│    3. Dependencies                                               │
│    4. Performance                                                │
│    5. Resources                                                  │
│    6. Risks                                                      │
│    7. Tasks                                                      │
│    8. Goals                                                      │
│                                                                  │
│  Theme: DARK THEME (consistent)                                 │
│    - bg-gradient-to-br from-[#0a0f1a] via-[#0d1420]            │
│      to-[#0f172a]                                               │
│    - Form inputs: bg-white/5 border border-white/10            │
│    - Labels: text-white/90                                      │
│    - Tabs: Blue underline when active                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ USER CLICKS SAVE BUTTON
                              │ Triggers: onSave(initiativeData)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│       handleSaveInitiative(initiativeData: any)                  │
│                     (Lines 110-125)                              │
│                                                                  │
│  1. Sends PUT request to API:                                   │
│     PUT http://localhost:3001/api/initiatives/${id}            │
│     Body: JSON.stringify(initiativeData)                        │
│                                                                  │
│  2. On success:                                                  │
│     - fetchInitiatives() - Refresh initiative list              │
│     - setEditingInitiative(null) - Close editor                 │
│                                                                  │
│  3. User sees updated initiative in InitiativesHero cards       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Resources Identified

### 1. Main Component
- **File**: `c:\ExecSummary\cms-admin\src\components\InitiativesHero.tsx`
- **Lines**: 778 total
- **Purpose**: Production-facing strategic initiatives view with hero + featured cards
- **State Variables**:
  - `initiatives` - Full list from API
  - `selectedInitiative` - Currently viewed initiative (triggers details modal)
  - `editingInitiative` - Currently editing initiative (triggers editor modal)
  - `linkedGoals` - Goals linked to selected initiative
  - `goals` - Full goals list for editor dropdown
  - `prioritizedIds` - User's custom priority order

### 2. Details Modal (View Mode)
- **File**: `c:\ExecSummary\cms-admin\src\components\InitiativeDetailsModal.tsx`
- **Import Line**: Line 22 in InitiativesHero.tsx
- **Render Lines**: 755-762 in InitiativesHero.tsx
- **Purpose**: Read-only view of initiative with 7 tabs
- **Props Interface**:
  ```typescript
  interface InitiativeDetailsModalProps {
    initiative: Initiative;
    linkedGoals?: any[];
    onClose: () => void;
    onEdit?: () => void;
  }
  ```
- **Tabs**: Overview, Milestones, Performance, Resources, Risks & Success, Tasks, Goals

### 3. Editor Modal (Edit Mode)
- **File**: `c:\ExecSummary\cms-admin\src\components\InitiativeEditorModal.tsx`
- **Import Line**: Line 23 in InitiativesHero.tsx
- **Render Lines**: 765-774 in InitiativesHero.tsx
- **Purpose**: Full edit capabilities with 8 tabs, dark theme
- **Props Interface**:
  ```typescript
  interface InitiativeEditorModalProps {
    initiative: Initiative;
    goals: Goal[];
    onSave: (data: any) => void;
    onClose: () => void;
    isNew: boolean;
  }
  ```
- **Tabs**: Overview, Milestones, Dependencies, Performance, Resources, Risks, Tasks, Goals

---

## API Endpoints Used

### 1. Fetch All Initiatives (Initial Load)
```typescript
GET http://localhost:3001/api/initiatives
Response: { initiatives: Initiative[] }
```
- **Triggered by**: `fetchInitiatives()` in useEffect (line 63)
- **Used for**: Populating initiative cards in hero layout

### 2. Fetch Single Initiative (View Details)
```typescript
GET http://localhost:3001/api/initiatives/${id}
Response: { success: true, initiative: Initiative, linkedGoals: Goal[] }
```
- **Triggered by**: `handleInitiativeClick(id)` (line 220)
- **Used for**: Opening InitiativeDetailsModal with full data

### 3. Fetch Goals (Editor Dropdown)
```typescript
GET http://localhost:3001/api/goals
Response: { goals: Goal[] }
```
- **Triggered by**: `fetchGoals()` in useEffect (line 94)
- **Used for**: Populating goals dropdown in InitiativeEditorModal

### 4. Update Initiative (Save Changes)
```typescript
PUT http://localhost:3001/api/initiatives/${id}
Body: Initiative (complete JSON)
Response: { success: true }
```
- **Triggered by**: `handleSaveInitiative(data)` (line 110)
- **Used for**: Persisting changes from InitiativeEditorModal

### 5. Save Priority Order
```typescript
POST http://localhost:3001/api/initiatives/priority-order
Body: { priorityOrder: string[] }
```
- **Triggered by**: `savePriorityOrder(ids)` (line 142)
- **Used for**: Saving user's custom initiative priority

---

## Data Flow Summary

```
API Initiative Data → InitiativesHero State → User Clicks Card
                                                      ↓
                                           InitiativeDetailsModal
                                            (View with Edit button)
                                                      ↓
                                              User Clicks Edit
                                                      ↓
                                           InitiativeEditorModal
                                              (Dark theme editor)
                                                      ↓
                                              User Clicks Save
                                                      ↓
                                          PUT to API → Refresh List
```

---

## Critical Functions

### handleInitiativeClick (Lines 220-230)
```typescript
const handleInitiativeClick = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:3001/api/initiatives/${id}`);
    const data = await response.json();
    if (data.success) {
      setSelectedInitiative(data.initiative);
      setLinkedGoals(data.linkedGoals || []);
    }
  } catch (error) {
    console.error('Error fetching initiative details:', error);
  }
};
```
**Purpose**: Opens InitiativeDetailsModal with full API data

### handleEditInitiative (Lines 105-108)
```typescript
const handleEditInitiative = async (initiative: Initiative) => {
  setSelectedInitiative(null); // Close details modal
  setEditingInitiative(initiative);
};
```
**Purpose**: Transitions from view modal to edit modal

### handleSaveInitiative (Lines 110-125)
```typescript
const handleSaveInitiative = async (initiativeData: any) => {
  try {
    const url = `http://localhost:3001/api/initiatives/${initiativeData.id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(initiativeData)
    });

    if (response.ok) {
      fetchInitiatives(); // Refresh list
      setEditingInitiative(null); // Close editor
    }
  } catch (error) {
    console.error('Failed to save initiative:', error);
  }
};
```
**Purpose**: Saves changes from InitiativeEditorModal to API

### handleCloseDetailsModal (Lines 233-236)
```typescript
const handleCloseDetailsModal = () => {
  setSelectedInitiative(null);
  setLinkedGoals([]);
};
```
**Purpose**: Closes InitiativeDetailsModal

---

## Component Relationships

```
InitiativesHero.tsx (Parent)
│
├─ InitiativeDetailsModal.tsx (Child - View Mode)
│  │
│  └─ Edit Button (Pencil Icon)
│     │
│     └─ Triggers: handleEditInitiative()
│
└─ InitiativeEditorModal.tsx (Child - Edit Mode)
   │
   └─ Save Button
      │
      └─ Triggers: handleSaveInitiative()
```

---

## State Management

### selectedInitiative (Initiative | null)
- **Set by**: handleInitiativeClick()
- **Cleared by**: handleCloseDetailsModal(), handleEditInitiative()
- **Triggers**: InitiativeDetailsModal rendering (lines 755-762)

### editingInitiative (Initiative | null)
- **Set by**: handleEditInitiative()
- **Cleared by**: handleSaveInitiative(), onClose callback
- **Triggers**: InitiativeEditorModal rendering (lines 765-774)

### linkedGoals (any[])
- **Set by**: handleInitiativeClick() from API response
- **Cleared by**: handleCloseDetailsModal()
- **Passed to**: InitiativeDetailsModal as prop

### goals (any[])
- **Set by**: fetchGoals() from API
- **Never cleared**: Persists for entire component lifetime
- **Passed to**: InitiativeEditorModal as prop

---

## Import Statements (Lines 1-23)

```typescript
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Rocket, TrendingUp, AlertTriangle, CheckCircle, Clock,
  Users, Target, Filter, ChevronDown, ChevronRight, ChevronLeft,
  ChevronUp, ExternalLink, Settings, ArrowUpDown, Edit2
} from 'lucide-react';
import InitiativeDetailsModal from './InitiativeDetailsModal';
import InitiativeEditorModal from './InitiativeEditorModal';
```

**Key Icons**:
- `Edit2` - Edit button in InitiativeDetailsModal header
- `X` - Close buttons in both modals
- `Rocket`, `TrendingUp`, `Target`, `Users` - UI decorations

---

## Modal Rendering Logic

### InitiativeDetailsModal Conditional Rendering (Lines 755-762)
```typescript
{selectedInitiative && (
  <InitiativeDetailsModal
    initiative={selectedInitiative}
    linkedGoals={linkedGoals}
    onClose={handleCloseDetailsModal}
    onEdit={() => handleEditInitiative(selectedInitiative)}
  />
)}
```
**Condition**: Renders when `selectedInitiative` is not null

### InitiativeEditorModal Conditional Rendering (Lines 765-774)
```typescript
{editingInitiative && (
  <InitiativeEditorModal
    initiative={editingInitiative}
    goals={goals}
    onSave={handleSaveInitiative}
    onClose={() => setEditingInitiative(null)}
    isNew={false}
  />
)}
```
**Condition**: Renders when `editingInitiative` is not null

---

## Summary

**USER FLOW**:
1. User opens InitiativesHero → Sees prioritized initiative cards
2. User clicks card → `handleInitiativeClick()` → Fetches API data → Opens **InitiativeDetailsModal.tsx**
3. User clicks Edit button (pencil icon) → `handleEditInitiative()` → Closes details → Opens **InitiativeEditorModal.tsx**
4. User makes changes → Clicks Save → `handleSaveInitiative()` → PUT to API → Refreshes list → Closes editor

**KEY FILES**:
- **InitiativesHero.tsx** - Orchestrator (778 lines)
- **InitiativeDetailsModal.tsx** - View modal (7 tabs)
- **InitiativeEditorModal.tsx** - Edit modal (8 tabs, dark theme)
