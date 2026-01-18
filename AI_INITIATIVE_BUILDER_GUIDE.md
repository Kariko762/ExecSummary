# AI Initiative Builder - User Guide

## Overview
The AI Initiative Builder is a guided wizard that helps you create comprehensive strategic initiatives using AI assistance. It follows the same pattern as the Goals AI Builder.

## Access
**Location:** CMS Admin → Strategic Initiatives → "AI Builder" button (top header, purple sparkles icon)

## Workflow

### Step 1: Initiative Discovery
Define the strategic initiative and business context:
- **Initiative Name** - Clear, action-oriented title (e.g., "Sales Enablement Platform Rollout")
- **Business Problem** - Current challenge or pain point being addressed
- **Strategic Opportunity** - Value this creates for the organization
- **Desired Impact** - Expected business outcomes and benefits
- **Timeline** - Project duration (e.g., "Q1-Q3 2026", "6 months")

### Step 2: Scope & Resources
Define what you'll accomplish and what you need:
- **Key Objectives** - 3-5 clear, actionable goals
- **Target Metrics** - KPIs, targets, benchmarks for success measurement
- **Required Resources** - Tools, technology, consultants, training needed
- **Team Size** - Composition (e.g., "3 FTE + 2 contractors")
- **Estimated Budget** - Total investment (e.g., "$250,000")

### Step 3: Business Case
Build the financial and strategic justification:
- **Current State** - Where we are today, what's not working
- **Target State** - Where we want to be, what success looks like
- **Proposed Solution** - How we get from current to target state
- **Expected ROI** - Return on investment (e.g., "250% over 18 months")
- **Payback Period** - Time to break even (e.g., "12 months")

### Step 4: AI Prompt Generation
The wizard generates a comprehensive AI prompt that includes:
- All your inputs from steps 1-3
- Detailed JSON schema structure
- Field-specific guidance (categories, statuses, alignments)
- Instructions for SMART goal formatting
- Risk and stakeholder identification guidance

**Action:** Click "Copy Prompt" button

### Step 5: External AI Processing
**Manual Step - Outside the Application:**
1. Open your preferred AI tool (ChatGPT, Claude, Copilot, etc.)
2. Paste the copied prompt
3. Wait for AI to generate the JSON response
4. Copy the entire JSON object returned

### Step 6: JSON Import
1. Paste the AI-generated JSON into the textarea
2. Click "Create AI-Generated Initiative"
3. The initiative opens in Edit mode for review/refinement

## Generated Initiative Structure

The AI creates a complete initiative JSON including:

### Core Fields
- `name`, `shortName`, `category`, `owner`, `sponsor`
- `status`, `priority`, `progress`, `projectStage`
- `startDate`, `endDate`, `color`, `icon`

### SMART Goal
```json
{
  "statement": "Comprehensive goal statement",
  "specific": { "objectives": ["...", "..."] },
  "measurable": { "metrics": ["...", "..."] },
  "achievable": { "resources": "...", "teamSize": "..." },
  "relevant": {
    "croAlignment": ["Sales Productivity", "Deal Conversion"],
    "strategicThemes": ["...", "..."]
  },
  "timeBound": {
    "timeline": [
      { "phase": "Discovery", "deliverable": "...", "dueDate": "YYYY-MM-DD", "status": "not-started" }
    ]
  }
}
```

### Business Case
```json
{
  "problem": "Clear problem statement",
  "opportunity": "Strategic opportunity description",
  "solution": "Proposed solution approach",
  "roi": "250% over 18 months",
  "paybackPeriod": "12 months"
}
```

### Risks & Stakeholders
```json
{
  "topRisks": [
    { "risk": "Description", "level": "high", "mitigation": "Strategy" }
  ],
  "stakeholders": [
    { "name": "Role", "role": "Involvement", "supportLevel": "champion" }
  ]
}
```

## Tips for Best Results

### Input Quality
- **Be specific** - Detailed inputs yield better AI outputs
- **Use metrics** - Include numbers, percentages, targets where possible
- **Think holistically** - Consider all aspects of the initiative

### AI Tool Selection
- **ChatGPT 4** - Excellent for comprehensive planning
- **Claude** - Great for structured business cases
- **GitHub Copilot** - Good for technical initiatives
- **Any tool works** - The prompt is AI-agnostic

### Review & Refinement
After import:
1. Review all generated fields in Edit mode
2. Adjust timelines, metrics, resources as needed
3. Verify CRO alignment selections match your strategy
4. Refine risks and mitigation strategies
5. Add/edit stakeholders with accurate support levels
6. Link to relevant Strategic Goals

## Field Reference

### Categories
- **revenue** - Initiatives focused on growing revenue
- **customer** - Initiatives improving customer experience
- **cost** - Initiatives reducing operational costs
- **innovation** - Initiatives building new capabilities

### Project Stages
- **discovery** - Initial research and scoping
- **planning** - Detailed planning and design
- **mvp** - Minimum viable product development
- **pilot** - Limited rollout and testing
- **scaling** - Full deployment
- **complete** - Initiative finished

### Priority Levels
- **critical** - Must complete, blocking other work
- **high** - Important, significant impact
- **medium** - Normal priority
- **low** - Nice to have, lower urgency

### CRO Alignment Areas
- Sales Productivity
- Sales Cycle Delays
- Deal Conversion
- Customer Sat
- Pipeline Risk
- Forecast Confidence

### Stakeholder Support Levels
- **champion** - Actively promoting and supporting
- **supporter** - Positive, providing resources
- **neutral** - Neutral stance, not engaged
- **skeptic** - Questioning value, needs convincing
- **blocker** - Actively opposing or blocking

## Files Modified

### New Files Created
- `/cms-admin/src/components/AIInitiativeBuilderWizard.tsx` (697 lines)
  - 5-step wizard component
  - Initiative-specific questions and prompts
  - JSON validation and import handling

### Modified Files
- `/cms-admin/src/components/InitiativesManager.tsx`
  - Added AI Builder button in header
  - Added `showAIBuilder` state
  - Added `handleAIInitiativeCreate()` handler
  - Integrated `AIInitiativeBuilderWizard` component
  - Added Sparkles icon import

## Implementation Notes

### Similar to Goals AI Builder
The implementation mirrors `AIGoalBuilderWizard.tsx`:
- Same 5-step pattern (3 input steps + prompt + JSON)
- Identical UI/UX styling (gradient headers, progress bars)
- Same clipboard copy/paste workflow
- Same validation and error handling

### Key Differences from Goals
- **3 input steps vs 4** - Initiatives have different information architecture
- **Focus on business case** - Dedicated step for ROI/payback
- **Resource planning** - Team size and budget collection
- **Project stages** - Discovery → Scaling lifecycle stages
- **Category types** - Revenue/Customer/Cost/Innovation vs Goal categories

### Future Enhancements
Potential improvements:
- [ ] Template library (pre-filled examples)
- [ ] Direct AI integration (API calls instead of copy/paste)
- [ ] Multi-initiative batch creation
- [ ] Import from existing project docs
- [ ] Collaboration features (multi-user input)

## Troubleshooting

### "Invalid JSON format" Error
**Cause:** JSON structure doesn't match schema  
**Solution:** Ensure AI returned complete JSON object, check for missing brackets/commas

### "Missing required fields" Error
**Cause:** JSON lacks `name`, `smartGoal`, or `businessCase`  
**Solution:** Regenerate with AI or manually add missing fields

### AI Returns Text Instead of JSON
**Cause:** AI didn't follow prompt instructions  
**Solution:** Add "Return ONLY the JSON, no explanations" to your prompt

### Prompt Too Long for AI Tool
**Cause:** Some AI tools have input limits  
**Solution:** Use Claude (higher limits) or split into multiple prompts

## Support
For issues or questions:
1. Check this guide first
2. Review example initiatives in the system
3. Try regenerating with clearer inputs
4. Contact development team

---

**Version:** 1.0  
**Created:** January 18, 2026  
**Last Updated:** January 18, 2026
