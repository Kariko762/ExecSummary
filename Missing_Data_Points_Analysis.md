# Missing Data Points - InitiativeDetailsModal.tsx

## Analysis Summary
Comparing **Coast_Initiative_Data.md** (complete API data) with **InitiativeDetailsModal.tsx** (what's displayed)

---

## ✅ Data Points CURRENTLY DISPLAYED

### Overview Tab
- ✅ Initiative name
- ✅ Status badge
- ✅ Priority badge
- ✅ Category badge
- ✅ Project stage badge
- ✅ Progress percentage
- ✅ SMART Goal statement
- ✅ Business Case (problem, opportunity, solution)
- ✅ ROI
- ✅ Payback Period
- ✅ Expected Benefits (array)
- ✅ Owner
- ✅ Co-Owners (array)
- ✅ Sponsor
- ✅ Stakeholders (name, role, supportLevel)

### Milestones Tab
- ✅ Timeline milestones (phase, deliverable, dueDate, status)
- ✅ Specific Objectives (array)
- ✅ Measurable Metrics (array)
- ✅ Achievable Resources (resources, teamSize)
- ✅ CRO Alignment (array)
- ✅ Strategic Themes (array)

### Performance Tab
- ✅ Leading Indicators (placeholder only - shows "No leading indicators defined")
- ✅ Lagging Indicators (placeholder only - shows "No lagging indicators defined")

### Resources Tab
- ✅ Resources description
- ✅ Team size

### Risks & Success Tab
- ✅ Top Risks (risk, level, mitigation)

### Tasks Tab
- ✅ Placeholder ("Task integration coming soon")

### Goals Tab
- ✅ Linked Goals (array)

---

## ❌ MISSING DATA POINTS (From API but NOT Displayed)

### 1. **Basic Metadata** (MISSING - HIGH PRIORITY)
- ❌ **slug**: `"automated-demo-provisioning-factory"` - NOT displayed anywhere
- ❌ **startDate**: `"2026-05-01"` - NOT displayed (only in Coast data)
- ❌ **endDate**: `"2027-12-31"` - NOT displayed (only in Coast data)
- ❌ **createdAt**: `"2026-05-01T09:00:00Z"` - NOT displayed
- ❌ **updatedAt**: `"2026-01-26T19:00:00Z"` - NOT displayed (would be useful for "Last Modified")
- ❌ **tags**: `["automation", "coast", "factory"]` - NOT displayed (could be badges)
- ❌ **notes**: `"Core automation engine for demo scale."` - NOT displayed

**Impact**: Missing timeline (start/end dates) is critical for understanding project duration

---

### 2. **Budget Details** (MISSING - CRITICAL)

#### Interface Definition (Lines 47-51)
```typescript
budget?: {
  allocated?: string;
  spent?: string;
  projected?: string;
};
```

#### Actual API Data (Complete Budget Object)
```json
"budget": {
  "total": 450000,
  "allocated": 450000,
  "spent": 0,
  "currency": "USD",
  "breakdown": [
    {
      "category": "Engineering/Development",
      "allocated": 250000,
      "spent": 0
    },
    {
      "category": "Infrastructure & Tools",
      "allocated": 120000,
      "spent": 0
    },
    {
      "category": "Training & Change Management",
      "allocated": 40000,
      "spent": 0
    },
    {
      "category": "External Vendors/Consultants",
      "allocated": 25000,
      "spent": 0
    },
    {
      "category": "Contingency Reserve",
      "allocated": 15000,
      "spent": 0
    }
  ],
  "fundingSource": "RevOps Transformation",
  "costAvoidance": "$1.2M annually"
}
```

#### Missing Budget Fields
- ❌ **budget.total**: `$450,000` - NOT displayed
- ❌ **budget.allocated**: `$450,000` - NOT displayed
- ❌ **budget.spent**: `$0` - NOT displayed
- ❌ **budget.currency**: `"USD"` - NOT displayed
- ❌ **budget.breakdown**: 5-item array with category/allocated/spent - NOT displayed
- ❌ **budget.fundingSource**: `"RevOps Transformation"` - NOT displayed
- ❌ **budget.costAvoidance**: `"$1.2M annually"` - NOT displayed

**Impact**: CRITICAL - No budget visualization at all. This is a major gap for executives.

---

### 3. **Funding Information** (MISSING - CRITICAL)
```json
"funding": {
  "requestedAmount": 450000,
  "approvedAmount": 450000,
  "approvalDate": "2026-03-01",
  "approvedBy": "CRO & CIO",
  "phaseGates": [
    {
      "phase": "Phase 1",
      "amount": 200000,
      "releaseCondition": "MVP approved",
      "status": "released"
    }
  ]
}
```

#### Missing Funding Fields
- ❌ **funding.requestedAmount**: `$450,000` - NOT displayed
- ❌ **funding.approvedAmount**: `$450,000` - NOT displayed
- ❌ **funding.approvalDate**: `"2026-03-01"` - NOT displayed
- ❌ **funding.approvedBy**: `"CRO & CIO"` - NOT displayed
- ❌ **funding.phaseGates**: Array with phase/amount/releaseCondition/status - NOT displayed

**Impact**: CRITICAL - Funding approval workflow not visible. Executives need to see approval status.

---

### 4. **Performance Indicators** (MISSING - HIGH PRIORITY)
```json
"indicators": {
  "leading": [
    {
      "name": "Automation pipelines built",
      "baseline": "0",
      "target": "20",
      "current": "0",
      "unit": "count"
    }
  ],
  "lagging": [
    {
      "name": "Auto-provisioned demos",
      "baseline": "10",
      "target": "75",
      "current": "10",
      "unit": "%"
    }
  ]
}
```

#### Current State
- ❌ **indicators.leading**: Array with name/baseline/target/current/unit - **PLACEHOLDER ONLY**
- ❌ **indicators.lagging**: Array with name/baseline/target/current/unit - **PLACEHOLDER ONLY**

**Current Display**: Performance tab shows "No leading indicators defined" and "No lagging indicators defined"

**Impact**: HIGH - Performance metrics exist in API but are not displayed. Charts/progress bars should show baseline → current → target.

---

### 5. **Dependencies** (MISSING - MEDIUM PRIORITY)
```json
"dependencies": {
  "internal": [],
  "external": [],
  "blocking": []
}
```

#### Missing Dependencies Fields
- ❌ **dependencies.internal**: Array - NOT displayed (empty in Coast data but field exists)
- ❌ **dependencies.external**: Array - NOT displayed (empty in Coast data but field exists)
- ❌ **dependencies.blocking**: Array - NOT displayed (empty in Coast data but field exists)

**Impact**: MEDIUM - No dependencies tab exists. Other initiatives may have dependencies populated.

**Note**: Current modal has 7 tabs, but InitiativeEditorModal has **Dependencies tab** (8 tabs total)

---

### 6. **Resources Details** (MISSING - HIGH PRIORITY)
```json
"resources": {
  "team": [],
  "tools": [
    {
      "name": "Coast",
      "purpose": "Demo automation",
      "cost": 80000,
      "license": "Enterprise",
      "status": "active"
    }
  ],
  "training": []
}
```

#### Current State
Resources tab only shows:
- ✅ smartGoal.achievable.resources (text description)
- ✅ smartGoal.achievable.teamSize (text description)

#### Missing Resources Fields
- ❌ **resources.team**: Array with team member details - NOT displayed
- ❌ **resources.tools**: Array with name/purpose/cost/license/status - **NOT displayed**
- ❌ **resources.training**: Array with training programs - NOT displayed

**Impact**: HIGH - Tools like "Coast" ($80K cost) are not visible. Resources tab should show tools grid.

---

### 7. **Milestones Details** (MISSING - HIGH PRIORITY)
```json
"milestones": [
  {
    "id": "milestone-factory",
    "name": "Provisioning Factory Live",
    "description": "Automated provisioning live",
    "dueDate": "2026-09-30",
    "status": "not-started",
    "deliverables": ["Automation pipelines"],
    "acceptanceCriteria": ["Pilot demos automated"]
  }
]
```

#### Current State
Milestones tab shows:
- ✅ smartGoal.timeBound.timeline (phase/deliverable/dueDate/status)

#### Missing Milestones Fields
- ❌ **milestones**: Separate array with id/name/description/deliverables/acceptanceCriteria - **NOT displayed**
- ❌ **milestones[].id**: Unique identifier - NOT displayed
- ❌ **milestones[].name**: "Provisioning Factory Live" - NOT displayed
- ❌ **milestones[].description**: Milestone description - NOT displayed
- ❌ **milestones[].deliverables**: Array of deliverables - NOT displayed
- ❌ **milestones[].acceptanceCriteria**: Array of acceptance criteria - NOT displayed

**Impact**: HIGH - Two separate milestone structures exist. API has richer `milestones` array but only `smartGoal.timeBound.timeline` is shown.

---

### 8. **Risks Extended Details** (MISSING - MEDIUM PRIORITY)
```json
"risks": [
  {
    "id": "risk-coast-scale",
    "description": "Automation complexity higher than expected",
    "impact": "Delays",
    "probability": "medium",
    "severity": "high",
    "mitigation": "Pilot-first rollout",
    "owner": "Head of Demo Services",
    "status": "open"
  }
]
```

#### Current State
Risks & Success tab shows:
- ✅ topRisks (risk, level, mitigation)

#### Missing Risk Fields
- ❌ **risks[].id**: "risk-coast-scale" - NOT displayed
- ❌ **risks[].impact**: "Delays" - NOT displayed (shown as description)
- ❌ **risks[].probability**: "medium" - NOT displayed
- ❌ **risks[].severity**: "high" - NOT displayed
- ❌ **risks[].owner**: "Head of Demo Services" - NOT displayed
- ❌ **risks[].status**: "open" - NOT displayed

**Note**: Interface uses `topRisks` array but API has separate `risks` array with more fields

**Impact**: MEDIUM - Risk ownership and detailed probability/severity analysis not visible

---

### 9. **Success Criteria** (MISSING - HIGH PRIORITY)
```json
"successCriteria": [
  {
    "metric": "Auto-provisioned demos",
    "baseline": "10%",
    "target": "75%",
    "measurement": "% demos auto-built",
    "frequency": "Quarterly"
  }
]
```

#### Missing Success Criteria Fields
- ❌ **successCriteria**: Array with metric/baseline/target/measurement/frequency - **NOT displayed**

**Impact**: HIGH - Success criteria should be in "Risks & Success" tab but are completely missing

---

### 10. **Stakeholder Extended Details** (PARTIALLY MISSING)
```json
"stakeholders": [
  {
    "name": "Sales Engineering Leadership",
    "role": "Primary Users",
    "interest": "high",
    "influence": "high",
    "engagement": "Pilot participation",
    "communicationFrequency": "Bi-weekly"
  }
]
```

#### Current State
Overview tab shows:
- ✅ stakeholders[].name
- ✅ stakeholders[].role
- ✅ stakeholders[].supportLevel

#### Missing Stakeholder Fields
- ❌ **stakeholders[].interest**: "high" - NOT displayed
- ❌ **stakeholders[].influence**: "high" - NOT displayed
- ❌ **stakeholders[].engagement**: "Pilot participation" - NOT displayed
- ❌ **stakeholders[].communicationFrequency**: "Bi-weekly" - NOT displayed

**Impact**: MEDIUM - Stakeholder engagement plan details hidden

---

## 📊 Summary by Priority

### 🔴 CRITICAL (Must Add)
1. **Budget Section** - NO budget visualization at all
2. **Funding Section** - Approval workflow not visible
3. **Start/End Dates** - Project timeline missing

### 🟠 HIGH PRIORITY (Should Add)
1. **Performance Indicators** - Data exists but shows placeholders
2. **Resources.Tools** - $80K Coast tool not visible
3. **Success Criteria** - Completely missing
4. **Milestones** (extended) - Richer milestone data not shown
5. **Tags** - Could be useful badges
6. **Notes** - Executive summary note hidden

### 🟡 MEDIUM PRIORITY (Nice to Have)
1. **Dependencies Tab** - No tab exists (editor has it)
2. **Risk Extended Details** - Probability/severity/owner missing
3. **Stakeholder Extended** - Engagement/communication details
4. **Metadata** - createdAt, updatedAt, slug

---

## 🔧 Recommended Fixes

### 1. Add Budget Section to Overview Tab
```tsx
{/* Budget Overview */}
{initiative.budget && (
  <div>
    <h3 className="text-sm font-roobert-semibold text-white mb-3">Budget</h3>
    <div className="grid grid-cols-3 gap-3 mb-3">
      <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
        <div className="text-xs text-blue-400 mb-1">Total Budget</div>
        <div className="text-xl font-roobert-bold text-white">
          ${initiative.budget.total?.toLocaleString()}
        </div>
      </div>
      <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
        <div className="text-xs text-green-400 mb-1">Allocated</div>
        <div className="text-xl font-roobert-bold text-white">
          ${initiative.budget.allocated?.toLocaleString()}
        </div>
      </div>
      <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
        <div className="text-xs text-orange-400 mb-1">Spent</div>
        <div className="text-xl font-roobert-bold text-white">
          ${initiative.budget.spent?.toLocaleString()}
        </div>
      </div>
    </div>
    
    {/* Budget Breakdown */}
    {initiative.budget.breakdown && initiative.budget.breakdown.length > 0 && (
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h4 className="text-xs font-roobert-semibold text-white/60 mb-3">Budget Breakdown</h4>
        <div className="space-y-2">
          {initiative.budget.breakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm text-white/80">{item.category}</span>
              <span className="text-sm font-roobert-bold text-white">
                ${item.allocated.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
```

### 2. Add Timeline Section to Overview Tab
```tsx
{/* Timeline */}
{(initiative.startDate || initiative.endDate) && (
  <div>
    <h3 className="text-sm font-roobert-semibold text-white mb-3">Timeline</h3>
    <div className="grid grid-cols-2 gap-3">
      {initiative.startDate && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-white/60 mb-1">Start Date</div>
          <div className="text-white font-roobert-semibold">
            {new Date(initiative.startDate).toLocaleDateString()}
          </div>
        </div>
      )}
      {initiative.endDate && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-white/60 mb-1">End Date</div>
          <div className="text-white font-roobert-semibold">
            {new Date(initiative.endDate).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  </div>
)}
```

### 3. Fix Performance Tab to Show Indicators
```tsx
{/* Leading Indicators */}
{initiative.indicators?.leading && initiative.indicators.leading.length > 0 ? (
  <div className="grid grid-cols-2 gap-4">
    {initiative.indicators.leading.map((indicator, idx) => (
      <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h4 className="text-sm font-roobert-semibold text-white mb-3">{indicator.name}</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Baseline</span>
            <span className="text-white font-roobert-bold">{indicator.baseline} {indicator.unit}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Current</span>
            <span className="text-green-400 font-roobert-bold">{indicator.current} {indicator.unit}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/60">Target</span>
            <span className="text-blue-400 font-roobert-bold">{indicator.target} {indicator.unit}</span>
          </div>
          {/* Progress bar from baseline to target */}
          <div className="h-2 bg-white/10 rounded-full mt-2">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
              style={{ 
                width: `${((indicator.current - indicator.baseline) / (indicator.target - indicator.baseline)) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="bg-white/5 rounded-xl p-6 border border-white/10 text-center">
    <p className="text-white/40">No leading indicators defined</p>
  </div>
)}
```

### 4. Add Tools Section to Resources Tab
```tsx
{/* Tools & Technology */}
{initiative.resources?.tools && initiative.resources.tools.length > 0 && (
  <div>
    <h3 className="text-lg font-roobert-semibold text-white mb-3">Tools & Technology</h3>
    <div className="space-y-3">
      {initiative.resources.tools.map((tool, idx) => (
        <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-white font-roobert-semibold">{tool.name}</h4>
            <span className={`px-2 py-1 rounded text-xs font-roobert-medium ${
              tool.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/60'
            }`}>
              {tool.status}
            </span>
          </div>
          <p className="text-sm text-white/70 mb-2">{tool.purpose}</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-white/60">Cost: </span>
              <span className="text-white font-roobert-bold">${tool.cost.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-white/60">License: </span>
              <span className="text-white font-roobert-bold">{tool.license}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

### 5. Add Success Criteria to Risks & Success Tab
```tsx
{/* Success Criteria */}
{initiative.successCriteria && initiative.successCriteria.length > 0 && (
  <div>
    <h3 className="text-lg font-roobert-semibold text-white mb-3 flex items-center gap-2">
      <Award className="w-5 h-5 text-green-400" />
      Success Criteria
    </h3>
    <div className="space-y-3">
      {initiative.successCriteria.map((criteria, idx) => (
        <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h4 className="text-white font-roobert-semibold mb-2">{criteria.metric}</h4>
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div>
              <div className="text-xs text-white/60">Baseline</div>
              <div className="text-sm font-roobert-bold text-white">{criteria.baseline}</div>
            </div>
            <div>
              <div className="text-xs text-white/60">Target</div>
              <div className="text-sm font-roobert-bold text-green-400">{criteria.target}</div>
            </div>
            <div>
              <div className="text-xs text-white/60">Frequency</div>
              <div className="text-sm font-roobert-bold text-white">{criteria.frequency}</div>
            </div>
          </div>
          <div className="text-xs text-white/60">
            Measurement: <span className="text-white/80">{criteria.measurement}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## 📋 Interface Updates Needed

### Current Interface (Lines 22-63)
```typescript
interface Initiative {
  id: string;
  name: string;
  shortName?: string;
  category: 'revenue' | 'customer' | 'cost' | 'innovation';
  owner: string;
  coOwners?: string[];
  sponsor?: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'at-risk' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  projectStage: 'discovery' | 'planning' | 'mvp' | 'pilot' | 'scaling' | 'complete';
  linkedGoals: string[];
  smartGoal: { /* ... */ };
  startDate: string;
  endDate: string;
  budget?: {
    allocated?: string;  // ❌ Should be number, missing total/spent/currency/breakdown
    spent?: string;
    projected?: string;
  };
  businessCase?: { /* ... */ };
  topRisks?: Array<{ risk: string; level: string; mitigation: string }>;
  stakeholders?: Array<{ name: string; role: string; supportLevel: string }>;
}
```

### Recommended Interface Updates
```typescript
interface Initiative {
  // ... existing fields ...
  
  // UPDATE: Budget (match API structure)
  budget?: {
    total?: number;
    allocated?: number;
    spent?: number;
    currency?: string;
    breakdown?: Array<{
      category: string;
      allocated: number;
      spent: number;
    }>;
    fundingSource?: string;
    costAvoidance?: string;
  };
  
  // ADD: Funding
  funding?: {
    requestedAmount?: number;
    approvedAmount?: number;
    approvalDate?: string;
    approvedBy?: string;
    phaseGates?: Array<{
      phase: string;
      amount: number;
      releaseCondition: string;
      status: string;
    }>;
  };
  
  // ADD: Performance Indicators
  indicators?: {
    leading?: Array<{
      name: string;
      baseline: string;
      target: string;
      current: string;
      unit: string;
    }>;
    lagging?: Array<{
      name: string;
      baseline: string;
      target: string;
      current: string;
      unit: string;
    }>;
  };
  
  // ADD: Resources
  resources?: {
    team?: Array<any>;
    tools?: Array<{
      name: string;
      purpose: string;
      cost: number;
      license: string;
      status: string;
    }>;
    training?: Array<any>;
  };
  
  // ADD: Dependencies
  dependencies?: {
    internal?: Array<any>;
    external?: Array<any>;
    blocking?: Array<any>;
  };
  
  // ADD: Milestones (separate from smartGoal.timeBound.timeline)
  milestones?: Array<{
    id: string;
    name: string;
    description: string;
    dueDate: string;
    status: string;
    deliverables?: string[];
    acceptanceCriteria?: string[];
  }>;
  
  // ADD: Risks (extended)
  risks?: Array<{
    id: string;
    description: string;
    impact: string;
    probability: string;
    severity: string;
    mitigation: string;
    owner: string;
    status: string;
  }>;
  
  // ADD: Success Criteria
  successCriteria?: Array<{
    metric: string;
    baseline: string;
    target: string;
    measurement: string;
    frequency: string;
  }>;
  
  // UPDATE: Stakeholders (add missing fields)
  stakeholders?: Array<{
    name: string;
    role: string;
    supportLevel: string;
    interest?: string;
    influence?: string;
    engagement?: string;
    communicationFrequency?: string;
  }>;
  
  // ADD: Metadata
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  notes?: string;
}
```

---

## 📈 Data Coverage Stats

**Total Fields in API**: ~40 top-level + ~60 nested fields = **~100 data points**

**Currently Displayed**: ~35 data points (**35% coverage**)

**Missing**: ~65 data points (**65% missing**)

### By Category
| Category | Total Fields | Displayed | Missing | Coverage |
|----------|--------------|-----------|---------|----------|
| Basic Info | 15 | 8 | 7 | 53% |
| Budget | 7 | 0 | 7 | **0%** |
| Funding | 5 | 0 | 5 | **0%** |
| Indicators | 10 | 0 | 10 | **0%** |
| Resources | 8 | 2 | 6 | 25% |
| Milestones | 12 | 4 | 8 | 33% |
| Risks | 8 | 3 | 5 | 38% |
| Success | 5 | 0 | 5 | **0%** |
| Stakeholders | 7 | 3 | 4 | 43% |
| SMART Goal | 20 | 15 | 5 | 75% |

---

## 🎯 Next Steps

1. **Update Interface** - Add missing fields to Initiative interface
2. **Add Budget Section** - Critical for executives (Overview tab)
3. **Add Timeline Section** - Show start/end dates (Overview tab)
4. **Fix Performance Tab** - Display indicators.leading/lagging with progress bars
5. **Enhance Resources Tab** - Show tools grid with costs
6. **Add Success Criteria** - Display in Risks & Success tab
7. **Add Funding Section** - Show approval workflow (new section in Overview or separate tab)
8. **Add Dependencies Tab** - Match InitiativeEditorModal structure (8 tabs total)
9. **Add Tags/Notes** - Display as badges and description (header or footer)
10. **Add Metadata Footer** - Show createdAt/updatedAt "Last modified" timestamp
