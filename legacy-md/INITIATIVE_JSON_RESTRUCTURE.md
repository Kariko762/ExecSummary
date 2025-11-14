# Initiative JSON Restructure - AI Demo Automation

## Metadata Setup (14 sections × ~4 fields each = ~60 actions)

### Section 1: Current Status
- [ ] Add `_projectStage_type: "text"`
- [ ] Add `_progressToDate_type: "list"`
- [ ] Add `_stakeholderEngagement_type: "nestedCards"`
- [ ] Add `_challengesEncountered_type: "list"`
- [ ] Add `_urgencyTiming_type: "textarea"`

### Section 2: Executive Summary
- [ ] Add `_overview_type: "textarea"`
- [ ] Add `_strategicAlignment_type: "list"`
- [ ] Add `_benefits_type: "list"`
- [ ] Add `_outcomes_type: "list"`

### Section 3: Problem Statement
- [ ] Add `_issue_type: "textarea"`
- [ ] Add `_businessImpact_type: "textarea"`
- [ ] Add `_marketContext_type: "textarea"`
- [ ] Add `_operationalContext_type: "textarea"`

### Section 4: SMART Goals
- [ ] Add `_specific_type: "list"`
- [ ] Add `_measurable_type: "list"`
- [ ] Add `_achievable_type: "list"`
- [ ] Add `_relevant_type: "list"`
- [ ] Add `_timeBound_type: "list"`

### Section 5: Proposed Solution
- [ ] Add `_solutionDescription_type: "textarea"`
- [ ] Add `_keyFeatures_type: "list"`
- [ ] Add `_innovations_type: "list"`
- [ ] Add `_alternativesConsidered_type: "nestedCards"`

### Section 6: ROI
- [ ] Add `_financialBenefits_type: "nestedCards"`
- [ ] Add `_strategicBenefits_type: "list"`
- [ ] Add `_costSavings_type: "list"`
- [ ] Add `_revenueImpact_type: "list"`
- [ ] Add `_efficiencyGains_type: "list"`
- [ ] Add `_paybackPeriod_type: "textarea"`
- [ ] Add `_longTermValue_type: "textarea"`

### Section 7: SWOT Analysis
- [ ] Add `_strengths_type: "list"`
- [ ] Add `_weaknesses_type: "list"`
- [ ] Add `_opportunities_type: "list"`
- [ ] Add `_threats_type: "list"`

### Section 8: Budget
- [ ] Add `_totalFunding_type: "number"`
- [ ] Add `_budgetBreakdown_type: "nestedCards"`
- [ ] Add `_oneTimeCosts_type: "number"`
- [ ] Add `_recurringCosts_type: "number"`
- [ ] Add `_contingency_type: "number"`

### Section 9: Timeline
- [ ] Add `_startDate_type: "text"`
- [ ] Add `_endDate_type: "text"`
- [ ] Add `_phases_type: "nestedCards"`
- [ ] Add `_milestones_type: "nestedCards"`
- [ ] Add `_criticalPath_type: "list"`

### Section 10: Resources
- [ ] Add `_internalStaffing_type: "nestedCards"`
- [ ] Add `_externalVendors_type: "nestedCards"`
- [ ] Add `_toolsPlatforms_type: "nestedCards"`
- [ ] Add `_infrastructure_type: "list"`

### Section 11: Risk Assessment
- [ ] Add `_risks_type: "nestedCards"`
- [ ] Add `_overallRiskLevel_type: "text"`

### Section 12: KPIs
- [ ] Add `_leadingIndicators_type: "nestedCards"`
- [ ] Add `_laggingIndicators_type: "nestedCards"`
- [ ] Add `_trackingFrequency_type: "textarea"`
- [ ] Add `_reportingOwner_type: "text"`

### Section 13: Governance
- [ ] Add `_sponsor_type: "text"`
- [ ] Add `_stakeholders_type: "list"`
- [ ] Add `_decisionMakingStructure_type: "textarea"`
- [ ] Add `_reportingCadence_type: "textarea"`
- [ ] Add `_escalationPath_type: "list"`

### Section 14: Dependencies
- [ ] Add `_externalDependencies_type: "nestedCards"`
- [ ] Add `_internalDependencies_type: "nestedCards"`
- [ ] Add `_assumptions_type: "nestedCards"`

## Data Migration (14 sections)

### Section 1: Current Status
- [ ] Move `currentStatus.projectStage` → `projectStage`
- [ ] Move `currentStatus.progressToDate` → `progressToDate`
- [ ] Move `currentStatus.stakeholderEngagement` → `stakeholderEngagement`
- [ ] Move `currentStatus.challengesEncountered` → `challengesEncountered`
- [ ] Move `currentStatus.urgencyTiming` → `urgencyTiming`

### Section 2: Executive Summary
- [ ] Move `executiveSummary.overview` → `overview`
- [ ] Move `executiveSummary.strategicAlignment` → `strategicAlignment`
- [ ] Move `executiveSummary.benefits` → `benefits`
- [ ] Move `executiveSummary.outcomes` → `outcomes`

### Section 3: Problem Statement
- [ ] Move `problemStatement.issue` → `issue`
- [ ] Move `problemStatement.businessImpact` → `businessImpact`
- [ ] Move `problemStatement.marketContext` → `marketContext`
- [ ] Move `problemStatement.operationalContext` → `operationalContext`

### Section 4: SMART Goals
- [ ] Move `smartGoals.specific` → `specific`
- [ ] Move `smartGoals.measurable` → `measurable`
- [ ] Move `smartGoals.achievable` → `achievable`
- [ ] Move `smartGoals.relevant` → `relevant`
- [ ] Move `smartGoals.timeBound` → `timeBound`

### Section 5: Proposed Solution
- [ ] Move `proposedSolution.description` → `solutionDescription`
- [ ] Move `proposedSolution.keyFeatures` → `keyFeatures`
- [ ] Move `proposedSolution.innovations` → `innovations`
- [ ] Move `proposedSolution.alternativesConsidered` → `alternativesConsidered`

### Section 6: ROI
- [ ] Move `roi.financialBenefits` → `financialBenefits`
- [ ] Move `roi.strategicBenefits` → `strategicBenefits`
- [ ] Move `roi.costSavings` → `costSavings`
- [ ] Move `roi.revenueImpact` → `revenueImpact`
- [ ] Move `roi.efficiencyGains` → `efficiencyGains`
- [ ] Move `roi.paybackPeriod` → `paybackPeriod`
- [ ] Move `roi.longTermValue` → `longTermValue`

### Section 7: SWOT Analysis
- [ ] Move `swotAnalysis.strengths` → `strengths`
- [ ] Move `swotAnalysis.weaknesses` → `weaknesses`
- [ ] Move `swotAnalysis.opportunities` → `opportunities`
- [ ] Move `swotAnalysis.threats` → `threats`

### Section 8: Budget
- [ ] Move `budget.totalFunding` → `totalFunding`
- [ ] Move `budget.breakdown` → `budgetBreakdown`
- [ ] Move `budget.oneTimeCosts` → `oneTimeCosts`
- [ ] Move `budget.recurringCosts` → `recurringCosts`
- [ ] Move `budget.contingency` → `contingency`

### Section 9: Timeline
- [ ] Move `timeline.startDate` → `startDate`
- [ ] Move `timeline.endDate` → `endDate`
- [ ] Move `timeline.phases` → `phases`
- [ ] Move `timeline.milestones` → `milestones`
- [ ] Move `timeline.criticalPath` → `criticalPath`

### Section 10: Resources
- [ ] Move `resources.internalStaffing` → `internalStaffing`
- [ ] Move `resources.externalVendors` → `externalVendors`
- [ ] Move `resources.toolsPlatforms` → `toolsPlatforms`
- [ ] Move `resources.infrastructure` → `infrastructure`

### Section 11: Risk Assessment
- [ ] Move `riskAssessment.risks` → `risks`
- [ ] Move `riskAssessment.overallRiskLevel` → `overallRiskLevel`

### Section 12: KPIs
- [ ] Move `kpis.leadingIndicators` → `leadingIndicators`
- [ ] Move `kpis.laggingIndicators` → `laggingIndicators`
- [ ] Move `kpis.trackingFrequency` → `trackingFrequency`
- [ ] Move `kpis.reportingOwner` → `reportingOwner`

### Section 13: Governance
- [ ] Move `governance.sponsor` → `sponsor`
- [ ] Move `governance.stakeholders` → `stakeholders`
- [ ] Move `governance.decisionMakingStructure` → `decisionMakingStructure`
- [ ] Move `governance.reportingCadence` → `reportingCadence`
- [ ] Move `governance.escalationPath` → `escalationPath`

### Section 14: Dependencies
- [ ] Move `dependencies.externalDependencies` → `externalDependencies`
- [ ] Move `dependencies.internalDependencies` → `internalDependencies`
- [ ] Move `dependencies.assumptions` → `assumptions`

## Cleanup
- [ ] Remove old `currentStatus` object wrapper
- [ ] Remove old `executiveSummary` object wrapper
- [ ] Remove old `problemStatement` object wrapper
- [ ] Remove old `smartGoals` object wrapper
- [ ] Remove old `proposedSolution` object wrapper
- [ ] Remove old `roi` object wrapper
- [ ] Remove old `swotAnalysis` object wrapper
- [ ] Remove old `budget` object wrapper
- [ ] Remove old `timeline` object wrapper
- [ ] Remove old `resources` object wrapper
- [ ] Remove old `riskAssessment` object wrapper
- [ ] Remove old `kpis` object wrapper
- [ ] Remove old `governance` object wrapper
- [ ] Remove old `dependencies` object wrapper
- [ ] Remove old `appendices` object (skip this section)

## Validation
- [ ] Verify JSON is valid
- [ ] Test in ContentModal
- [ ] Verify all sections render correctly
