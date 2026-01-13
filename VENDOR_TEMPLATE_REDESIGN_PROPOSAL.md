# Vendor Management Template - Design Redesign Proposal
**Date:** January 8, 2026  
**Objective:** Transform vendor template into an executive-level strategic dashboard

---

## 📋 PHASE 1: VENDOR DETAILS SECTION REDESIGN

### Current Problems
❌ **Missing Critical Information:**
- No vendor identity/branding
- No contract dates or renewal information
- No clear SMART goal framework
- Key contacts buried in separate section
- Lacks executive summary appeal

❌ **Layout Issues:**
- Generic "Strategic Purpose" label doesn't convey vendor relationship
- Big Wins feel disconnected from the narrative
- No visual hierarchy for executive scanning

### Proposed New Structure

#### **Layout: 3-Zone Hero Section**

```
┌─────────────────────────────────────────────────────────────┐
│  VENDOR IDENTITY BANNER                                      │
│  [Logo] Coast.io | AI-Powered Demo Platform                 │
│  Active Since: Q2 2023 | Contract Renewal: Dec 2026         │
│  Primary Contact: James Smith (Global Account Manager)      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┬───────────────┐
│  STRATEGIC VALUE     │  ENGAGEMENT GOALS    │  QUICK STATS  │
│                      │  (SMART Framework)   │               │
│  Problem Statement:  │                      │  📊 7 Active  │
│  [Rich narrative]    │  ✓ Specific: ...     │     Workspaces│
│                      │  ✓ Measurable: ...   │               │
│  Solution Delivered: │  ✓ Achievable: ...   │  💰 $883K     │
│  [How Coast helps]   │  ✓ Relevant: ...     │     Annual    │
│                      │  ✓ Time-Bound: ...   │               │
│  Core Capabilities:  │                      │  🎯 6 Pilots  │
│  • [Function 1]      │  Current Status:     │     In Flight │
│  • [Function 2]      │  ● Active            │               │
└──────────────────────┴──────────────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PROVEN IMPACT - BIG WINS                                    │
│                                                              │
│  [20% Sales Cycles] [47 Days TTClose] [2x Conversion]      │
│  [Card with icon]   [Card with icon]   [Card with icon]    │
└─────────────────────────────────────────────────────────────┘
```

#### **New Data Schema**

```typescript
interface VendorDetailsData {
  // Vendor Identity
  vendorName: string;
  vendorTagline: string;
  logoUrl?: string;
  engagementStart: string;
  contractRenewal: string;
  contractValue: string;
  
  // Primary Contact
  primaryContact: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
  };
  
  // Strategic Narrative
  problemStatement: string;  // Rich markdown
  solutionDelivered: string; // Rich markdown
  coreFunctions: string[];
  
  // SMART Goals
  smartGoals: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
    currentStatus: 'on-track' | 'at-risk' | 'ahead' | 'blocked';
  };
  
  // Quick Stats
  quickStats: {
    activeWorkspaces: number;
    annualSpend: string;
    pilotsInFlight: number;
    userCount?: number;
  };
  
  // Big Wins (existing)
  bigWins: Array<{
    metric: string;
    title: string;
    description: string;
    icon?: string; // Icon identifier
  }>;
}
```

#### **Visual Design Elements**

**Vendor Identity Banner:**
- Full-width gradient bar (purple-to-blue)
- Vendor logo on left (if available)
- Company name + tagline in large, bold font
- Key dates with calendar icons
- Primary contact with avatar placeholder

**Strategic Value Card:**
- White background with subtle shadow
- "Problem → Solution" flow narrative
- Bullet-point core functions with checkmarks
- Purple accent border on left

**SMART Goals Card:**
- Dark gradient background (matches capabilities card)
- Checklist-style SMART criteria
- Visual status indicator (green/yellow/red)
- Progress ring showing goal completion %

**Quick Stats Panel:**
- Vertical card with icon badges
- Large numbers with labels
- Color-coded by metric type
- Animated count-up on load

**Big Wins Section:**
- Horizontal gallery (4 cards max recommended)
- Icon badges above metrics
- Gradient text for numbers
- Subtle hover lift animation

---

## 📊 PHASE 2: FULL TEMPLATE DESIGN REVIEW

### Current Template Flow Analysis

**Existing Sections (in order):**
1. ✅ Details (Vendor Asset) - **NOW REDESIGNED**
2. ✅ Active Projects (Progress Bars)
3. ✅ Project Gantt Chart
4. ✅ Future Projects (Timeline)
5. ✅ Risks (Risk Cards)
6. ⚠️ Key Contacts (Standalone section) - **REDUNDANT**
7. ✅ Budget Summary

---

### Section-by-Section Review

#### **1. VENDOR DETAILS** ⭐ *REDESIGNED ABOVE*
**Rating:** 🔥🔥🔥🔥🔥 (5/5) - Now executive-ready hero section

---

#### **2. ACTIVE PROJECTS** 
**Current Implementation:** Progress bar list with percentages

**Rating:** ⭐⭐⭐ (3/5)

**Issues:**
- ❌ No visual distinction between project types
- ❌ Status labels are text-only (low visual impact)
- ❌ No budget/resource information per project
- ❌ Lacks priority indicators

**Recommended Changes:**

**Visual Enhancements:**
```
┌─────────────────────────────────────────────────────────┐
│  🔥 HIGH PRIORITY                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Payments Workspace - $250K              [PILOT]  │  │
│  │ Budget Approval Submitted                        │  │
│  │ ████████████████░░░░░░░░ 75%    On Track ✓      │  │
│  │ Owner: Digital Banking BU | Due: Q2 2026        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Improvements:**
- ✅ Add priority badges (High/Medium/Low) with color coding
- ✅ Include budget amount in card header
- ✅ Add project owner and due date
- ✅ Use status icons (✓ ⚠ ⛔) instead of just text
- ✅ Group by status or priority
- ✅ Add "PILOT" badges for projects in pilot phase

**Updated Schema:**
```typescript
interface ActiveProject {
  title: string;
  subtitle: string;
  percentage: number;
  status: 'On Track' | 'At Risk' | 'Blocked';
  priority: 'high' | 'medium' | 'low'; // NEW
  budget: string; // NEW
  owner: string; // NEW
  dueDate: string; // NEW
  isPilot: boolean; // NEW
}
```

---

#### **3. PROJECT GANTT CHART**
**Current Implementation:** Full interactive Gantt with organizations, tasks, milestones

**Rating:** ⭐⭐⭐⭐⭐ (5/5) - Already excellent

**Issues:**
- ⚠️ Might be overwhelming for vendors with simple engagements
- ⚠️ No vendor-specific context (e.g., which workspaces are involved)

**Recommended Changes:**

**Minor Enhancements:**
- ✅ Add "Workspace" tag to tasks (e.g., "Digital Banking Workspace")
- ✅ Include vendor deliverables vs FIS deliverables distinction
- ✅ Add dependency visualization to vendor milestones
- ⚠️ Consider making this section **collapsible** if project count is low

**Keep As-Is For Now** - Already world-class implementation

---

#### **4. FUTURE PROJECTS (Timeline)**
**Current Implementation:** Quarterly timeline with milestones

**Rating:** ⭐⭐⭐⭐ (4/5)

**Issues:**
- ❌ Text-heavy descriptions
- ❌ No cost estimates or resource requirements
- ❌ Completed vs pending milestones not visually distinct enough

**Recommended Changes:**

**Visual Enhancements:**
```
────────●────────●────────○────────○──────►
      Q1 2024  Q2 2024  Q3 2024  Q4 2024
      ✓ Done   ✓ Done   ⏳ Pending ○ Future

Each milestone card:
┌─────────────────────────┐
│ ✓ Q1 2024              │
│ Project Kickoff        │
│ Budget: $50K           │
│ Status: Complete       │
│ [Compact description]  │
└─────────────────────────┘
```

**Improvements:**
- ✅ Add cost estimates per milestone
- ✅ Use larger, clearer status icons
- ✅ Condense descriptions (move details to hover/expand)
- ✅ Add horizontal connecting line between milestones
- ✅ Color-code by completion status (green=done, yellow=in-progress, gray=future)

**Updated Schema:**
```typescript
interface FutureMilestone {
  date: string;
  title: string;
  note: string;
  description: string;
  completed: boolean;
  estimatedCost?: string; // NEW
  requiredResources?: string[]; // NEW
}
```

---

#### **5. RISKS & BLOCKERS**
**Current Implementation:** Risk cards with severity levels

**Rating:** ⭐⭐⭐⭐ (4/5)

**Issues:**
- ❌ No visual impact differentiation between high vs low severity
- ❌ Mitigation plans are text-heavy
- ❌ No owner assignment
- ❌ No "days open" tracking

**Recommended Changes:**

**Visual Enhancements:**
```
🔴 HIGH SEVERITY
┌───────────────────────────────────────────────────┐
│ ⚠️ International Issuing Hub Delayed              │
│ OPEN: 14 days | OWNER: Program Manager           │
│                                                   │
│ Issue: Timeline delays due to Money 20/20        │
│                                                   │
│ Mitigation:                                       │
│ ✓ ER approval expected this week                 │
│ ✓ Coast dropped Matthews LIBs to expedite       │
│                                                   │
│ Target Resolution: Jan 15, 2026                  │
└───────────────────────────────────────────────────┘
```

**Improvements:**
- ✅ Use bold colored headers (Red=High, Yellow=Medium, Gray=Low)
- ✅ Add "Days Open" counter
- ✅ Add owner assignment with avatar
- ✅ Add target resolution date
- ✅ Convert mitigation plans to checkboxes/action items
- ✅ Add severity icon badges (⚠️ 🔴 🟡 ⚪)
- ✅ Sort by severity automatically

**Updated Schema:**
```typescript
interface RiskItem {
  type: 'high-impact' | 'high-severity' | 'medium' | 'low';
  title: string;
  description: string;
  mitigation: string;
  owner?: string; // NEW
  daysOpen?: number; // NEW
  targetResolution?: string; // NEW
  mitigationActions?: Array<{ // NEW
    action: string;
    completed: boolean;
  }>;
}
```

---

#### **6. KEY CONTACTS** ⚠️ **RECOMMEND REMOVAL**

**Current Implementation:** Standalone key-value list section

**Rating:** ⭐⭐ (2/5) - Redundant

**Issues:**
- ❌ Duplicates information from redesigned Vendor Details section
- ❌ Low visual impact for executive summary
- ❌ Takes up valuable real estate

**Recommended Changes:**
- 🗑️ **REMOVE THIS SECTION ENTIRELY**
- ✅ Contacts now in Vendor Details Identity Banner
- ✅ Add "Additional Contacts" dropdown in banner if needed
- ✅ Move any extra contacts to a collapsible panel

---

#### **7. BUDGET SUMMARY**
**Current Implementation:** Budget breakdown with categories and line items

**Rating:** ⭐⭐⭐⭐⭐ (5/5) - Excellent detail

**Issues:**
- ⚠️ Could be visually overwhelming
- ⚠️ No high-level summary visible at first glance

**Recommended Changes:**

**Add Executive Summary Panel:**
```
┌─────────────────────────────────────────────────────┐
│  BUDGET AT A GLANCE                                 │
│                                                     │
│  Total Annual: $883,740    LoB: $616,440 (70%)    │
│  MSA Subsidy: $267,300 (30%)                       │
│                                                     │
│  [Donut Chart: LoB vs MSA breakdown]              │
│                                                     │
│  ⚠️ CRITICAL: MSA required for demo capabilities   │
└─────────────────────────────────────────────────────┘
```

**Improvements:**
- ✅ Add visual summary panel above detailed breakdown
- ✅ Include donut/pie chart for budget allocation
- ✅ Add MSA criticality callout box
- ✅ Highlight cost-per-workspace metric
- ✅ Add YoY comparison if historical data available

**Keep Detailed Breakdown** - But make it collapsible/expandable

---

## 🎨 OVERALL TEMPLATE FLOW - RECOMMENDED ORDER

### **Optimized Section Order:**

```
1. 🏢 VENDOR DETAILS (Hero Section)
   └─ Identity | Strategic Value | SMART Goals | Quick Stats | Big Wins

2. 📊 EXECUTIVE SUMMARY DASHBOARD
   └─ Budget At-A-Glance | Active Projects Count | Risk Summary

3. 🚀 ACTIVE PROJECTS & PILOTS
   └─ Progress cards with priority, budget, owners

4. ⚠️ RISKS & BLOCKERS
   └─ Severity-sorted cards with mitigation tracking

5. 📅 PROJECT TIMELINE (GANTT)
   └─ Detailed Gantt chart (collapsible for simple engagements)

6. 🔮 FUTURE ROADMAP
   └─ Upcoming milestones with cost estimates

7. 💰 DETAILED BUDGET BREAKDOWN
   └─ Full budget categories and line items (collapsible)
```

---

## 🎯 KEY DESIGN PRINCIPLES

### **Executive-Level Design Rules:**

1. **Scannable Hierarchy**
   - Large headers with visual icons
   - Color-coded priority/severity
   - Progressive disclosure (summary → details)

2. **Visual Impact**
   - Use status icons (✓ ⚠️ ⛔ 🔥)
   - Gradient accents on key metrics
   - Animated hover states for interactivity

3. **Information Density**
   - Pack more value per section
   - Use compact cards instead of tables
   - Collapsible sections for deep-dive data

4. **Brand Consistency**
   - Purple (#431C5B) for primary actions
   - Green (#3bcd3e) for positive/success
   - Blue (#3b82f6) for information
   - Red/Orange for warnings/blockers

5. **Mobile Responsiveness**
   - Single-column stacking on mobile
   - Touch-friendly controls
   - Readable font sizes

---

## 📋 IMPLEMENTATION PRIORITY

### **Phase 1: Critical Updates (Week 1)**
- [x] Redesign Vendor Details section with full schema
- [ ] Remove Key Contacts section (moved to Details)
- [ ] Add Executive Summary Dashboard section

### **Phase 2: Visual Enhancements (Week 2)**
- [ ] Enhance Active Projects cards (priority, budget, owners)
- [ ] Improve Risks section (severity headers, mitigation checkboxes)
- [ ] Add Budget At-A-Glance panel

### **Phase 3: Polish (Week 3)**
- [ ] Timeline milestone cost estimates
- [ ] Gantt chart workspace tags
- [ ] Collapsible sections
- [ ] Responsive mobile layouts

---

## ✅ SUCCESS METRICS

**The redesigned template should achieve:**

- ⏱️ **5-Second Scan Test:** Executive can grasp vendor status in 5 seconds
- 📊 **Data Density:** 3x more critical information visible without scrolling
- 🎨 **Visual Appeal:** "Wow factor" for stakeholder presentations
- 📱 **Mobile Ready:** Fully functional on tablets/phones
- 🔄 **Reusability:** Template works for any vendor relationship

---

## 🚀 NEXT STEPS

**Immediate Action Required:**

1. **Approve Phase 1 Schema** - Review new VendorDetailsData structure
2. **Design Mockups** - Create visual comps for new sections
3. **Build Vendor Details Component** - Implement redesigned hero section
4. **Test with Real Data** - Populate Coast vendor example
5. **Iterate Based on Feedback** - Refine visual hierarchy

**Timeline:** 2-3 weeks for full rollout

---

**END OF PROPOSAL**
