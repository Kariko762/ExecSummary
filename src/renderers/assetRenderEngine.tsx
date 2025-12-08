/**
 * ASSET RENDER ENGINE - Master Orchestrator
 * 
 * This is the central rendering system that:
 * 1. Routes asset types to their pattern components
 * 2. Applies design system styling from AssetStyles
 * 3. Handles edit vs display modes
 * 4. Provides consistent wrapper structure
 * 
 * Architecture:
 * - Pattern files (assetRender*.tsx) contain ONLY logic/structure
 * - This engine wraps patterns with design system classes
 * - All styling comes from AssetStyles in assetDataStore.ts
 */

import React from 'react';
import { AssetStyles } from '../schemas/assetDataStore';

// Import pattern files
import {
  TextPattern,
  TextareaPattern,
  RichTextPattern,
  QuotePattern,
  CodeBlockPattern
} from './assetRenderText';

import {
  HighlightsListPattern,
  BulletListPattern,
  ChecklistItemsPattern,
  ProgressBarListPattern,
  KeyValueListPattern,
  Top5ListPattern
} from './assetRenderLists';

import {
  MetricCardPattern,
  NestedCardsPattern,
  RiskCardPattern,
  OutlookCardPattern,
  CategoryListPattern
} from './assetRenderCards';

import {
  RadialProgressPattern,
  PieChartPattern,
  BarChartPattern,
  LineChartPattern
} from './assetRenderCharts';

import {
  StatusBoardPattern,
  TimelinePattern,
  TwoColumnComparisonPattern,
  ProblemSolutionBoxPattern
} from './assetRenderComplex';

import {
  HrPattern,
  NumberPattern,
  SpacerPattern
} from './assetRenderUtility';

import { BudgetBreakdown } from './assetRenderBudget';

// ==========================================
// ENGINE PROPS
// ==========================================

export interface AssetRenderEngineProps {
  type: string;
  data: any;
  onChange?: (value: any) => void;
  mode?: 'edit' | 'display';
  className?: string;
}

// ==========================================
// MASTER RENDER ENGINE
// ==========================================

export const AssetRenderEngine: React.FC<AssetRenderEngineProps> = ({
  type,
  data,
  onChange,
  mode = 'display',
  className = ''
}) => {
  
  // Route to correct pattern component
  const renderPattern = () => {
    const props = { data, onChange, mode };
    
    switch (type) {
      // TEXT ASSETS
      case 'text':
        return <TextPattern {...props} />;
      case 'textarea':
        return <TextareaPattern {...props} />;
      case 'richText':
        return <RichTextPattern {...props} />;
      case 'quote':
        return <QuotePattern {...props} />;
      case 'codeBlock':
        return <CodeBlockPattern {...props} />;
      
      // LIST ASSETS
      case 'highlightsList':
        return <HighlightsListPattern {...props} />;
      case 'bulletList':
        return <BulletListPattern {...props} />;
      case 'checklistItems':
        return <ChecklistItemsPattern {...props} />;
      case 'progressBarList':
        return <ProgressBarListPattern {...props} />;
      case 'keyValueList':
        return <KeyValueListPattern {...props} />;
      
      // CARD ASSETS
      case 'metricCard':
        return <MetricCardPattern {...props} />;
      case 'nestedCards':
        return <NestedCardsPattern {...props} />;
      case 'riskCard':
        return <RiskCardPattern {...props} />;
      case 'outlookCard':
        return <OutlookCardPattern {...props} />;
      case 'categoryList':
        return <CategoryListPattern {...props} />;
      
      // CHART ASSETS
      case 'radialProgressChart':
        return <RadialProgressPattern {...props} />;
      case 'pieChart':
        return <PieChartPattern {...props} />;
      case 'barChart':
      case 'stackedBarChart':
        return <BarChartPattern {...props} />;
      case 'lineChart':
        return <LineChartPattern {...props} />;
      
      // COMPLEX ASSETS
      case 'statusBoard':
        return <StatusBoardPattern {...props} />;
      case 'timeline':
        return <TimelinePattern {...props} />;
      case 'twoColumnComparison':
        return <TwoColumnComparisonPattern {...props} />;
      case 'problemSolutionBox':
        return <ProblemSolutionBoxPattern {...props} />;
      
      // UTILITY ASSETS
      case 'hr':
        return <HrPattern {...props} />;
      case 'number':
        return <NumberPattern {...props} />;
      case 'spacer':
        return <SpacerPattern {...props} />;
      case 'listTop5':
        return <Top5ListPattern {...props} />;
      
      // BUDGET & FINANCIAL
      case 'budgetBreakdown':
        return <BudgetBreakdown data={data} />;
      
      default:
        return <div className="text-red-500">Unknown asset type: {type}</div>;
    }
  };
  
  // Apply design system wrapper based on asset type
  const getWrapperClasses = () => {
    const baseClasses = 'asset-wrapper';
    const modeClasses = mode === 'edit' ? 'edit-mode' : 'display-mode';
    
    // Different wrapper styles for different asset categories
    if (['text', 'textarea', 'richText'].includes(type)) {
      return `${baseClasses} ${modeClasses} ${AssetStyles.spacing.sm} ${className}`;
    }
    
    if (['metricCard', 'nestedCards', 'riskCard'].includes(type)) {
      return `${baseClasses} ${modeClasses} ${className}`;
    }
    
    if (['radialProgressChart', 'pieChart', 'barChart', 'lineChart'].includes(type)) {
      return `${baseClasses} ${modeClasses} ${className}`;
    }
    
    if (['statusBoard', 'timeline', 'twoColumnComparison'].includes(type)) {
      return `${baseClasses} ${modeClasses} ${AssetStyles.spacing.md} ${className}`;
    }
    
    return `${baseClasses} ${modeClasses} ${className}`;
  };
  
  return (
    <div className={getWrapperClasses()}>
      {renderPattern()}
    </div>
  );
};

// ==========================================
// DESIGN SYSTEM STYLESHEET (CSS-in-JS)
// ==========================================

export const AssetRenderEngineStyles = `
/* Asset Wrapper Base Styles */
.asset-wrapper {
  position: relative;
  width: 100%;
}

.asset-wrapper.edit-mode {
  border: 1px dashed #cbd5e1;
  border-radius: 0.5rem;
  background: #f8fafc;
}

.asset-wrapper.display-mode {
  /* No border in display mode */
}

/* ==========================================
   TEXT PATTERNS
   ========================================== */

/* Text Pattern */
.asset-wrapper .text-display {
  font-size: 0.875rem !important;
  font-family: 'Roobert Light', sans-serif !important;
  color: var(--fis-navy);
}

.asset-wrapper.dark .text-display {
  color: white;
}

.asset-wrapper .text-edit input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: 'Roobert Light', sans-serif;
}

/* Textarea Pattern */
.asset-wrapper .textarea-display {
  font-size: 0.875rem !important;
  font-family: 'Roobert Light', sans-serif !important;
  white-space: pre-wrap;
  color: var(--fis-navy);
}

.asset-wrapper.dark .textarea-display {
  color: white;
}

.asset-wrapper .textarea-edit textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-family: 'Roobert Light', sans-serif;
  resize: vertical;
}

/* Rich Text Pattern */
.asset-wrapper .richtext-display {
  ${AssetStyles.typography.body.normal}
  color: var(--fis-navy);
  line-height: 1.6;
}

.asset-wrapper .richtext-display strong {
  font-weight: 600;
}

.asset-wrapper .richtext-display em {
  font-style: italic;
}

.asset-wrapper .richtext-display ul {
  list-style: disc;
  margin-left: 1.5rem;
}

/* Quote Pattern */
.asset-wrapper .quote-display {
  border-left: 4px solid var(--fis-raspberry);
  border-right: 4px solid var(--fis-raspberry);
  ${AssetStyles.spacing.md}
  ${AssetStyles.typography.body.large}
  font-style: italic;
  color: var(--fis-eggplant);
}

.asset-wrapper.dark .quote-display {
  color: var(--fis-raspberry);
}

/* Code Block Pattern */
.asset-wrapper .code-display {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
  white-space: pre;
}

/* ==========================================
   LIST PATTERNS
   ========================================== */

/* Highlights List Pattern */
.asset-wrapper .highlights-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.asset-wrapper .highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.asset-wrapper .highlight-badge {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--fis-raspberry);
  color: white;
  ${AssetStyles.typography.label.badge}
}

.asset-wrapper .highlight-text {
  flex: 1;
  ${AssetStyles.typography.body.normal}
  color: var(--fis-navy);
}

/* Bullet List Pattern */
.asset-wrapper .bullet-list {
  list-style: disc;
  margin-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.asset-wrapper .bullet-list li {
  ${AssetStyles.typography.body.normal}
  color: var(--fis-navy);
}

/* Checklist Items Pattern */
.asset-wrapper .checklist {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.asset-wrapper .checklist-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.asset-wrapper .checklist-item .check-icon {
  color: #10b981;
}

.asset-wrapper .checklist-item.incomplete .check-icon {
  color: #cbd5e1;
}

.asset-wrapper .checklist-item span {
  ${AssetStyles.typography.body.normal}
  color: var(--fis-navy);
}

/* Progress Bar List Pattern */
.asset-wrapper .progress-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.asset-wrapper .progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.asset-wrapper .progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.asset-wrapper .progress-title {
  font-size: 0.875rem !important;
  font-family: 'Roobert Light', sans-serif !important;
  color: var(--fis-navy);
}

.asset-wrapper .progress-status {
  font-size: 0.75rem;
  font-family: 'Roobert Medium', sans-serif;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
}

.asset-wrapper .progress-status.status-on-track {
  background: #d1fae5;
  color: #065f46;
}

.asset-wrapper .progress-status.status-at-risk {
  background: #fef3c7;
  color: #92400e;
}

.asset-wrapper .progress-status.status-blocked {
  background: #fee2e2;
  color: #991b1b;
}

.asset-wrapper .progress-subtitle {
  font-size: 0.75rem !important;
  font-family: 'Roobert Light', sans-serif !important;
  color: #431C5B;
}

.asset-wrapper .progress-bar-container {
  width: 100%;
  height: 0.5rem;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.asset-wrapper .progress-bar-fill {
  height: 100%;
  background: var(--fis-raspberry);
  transition: width 0.3s ease;
}

/* Key Value List Pattern */
.asset-wrapper .keyvalue-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.asset-wrapper .keyvalue-item {
  display: flex;
  gap: 0.5rem;
}

.asset-wrapper .keyvalue-label {
  ${AssetStyles.typography.body.normal}
  font-weight: 300;
  color: var(--fis-eggplant);
}

.asset-wrapper.dark .keyvalue-label {
  color: var(--fis-raspberry);
}

.asset-wrapper .keyvalue-value {
  ${AssetStyles.typography.body.normal}
  color: var(--fis-navy);
}

.asset-wrapper.dark .keyvalue-value {
  color: white;
}

/* ==========================================
   CARD PATTERNS
   ========================================== */

/* Metric Card Pattern */
.asset-wrapper .metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.asset-wrapper .metric-card {
  ${AssetStyles.effects.card}
  ${AssetStyles.spacing.md}
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;
  transition: transform 0.2s;
}

.asset-wrapper .metric-card:hover {
  transform: translateY(-2px);
}

.asset-wrapper .metric-card .icon {
  color: var(--fis-raspberry);
  margin: 0 auto;
}

.asset-wrapper .metric-card .label {
  ${AssetStyles.typography.label.default}
  color: #64748b;
}

.asset-wrapper .metric-card .value {
  ${AssetStyles.typography.heading.h2}
  color: var(--fis-navy);
}

/* Nested Cards Pattern */
.asset-wrapper .nested-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.asset-wrapper .nested-card {
  ${AssetStyles.effects.card}
  ${AssetStyles.spacing.md}
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.asset-wrapper .nested-card .title {
  ${AssetStyles.typography.heading.h4}
  color: var(--fis-navy);
}

.asset-wrapper .nested-card .value {
  ${AssetStyles.typography.body.normal}
  color: #64748b;
}

/* Risk Card Pattern */
.asset-wrapper .risk-card {
  ${AssetStyles.effects.card}
  ${AssetStyles.spacing.md}
  display: flex;
  gap: 1rem;
  border-left: 4px solid;
}

.asset-wrapper .risk-card.severity-medium {
  border-left-color: #f59e0b;
  background: #fffbeb;
}

.asset-wrapper .risk-card.severity-high {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.asset-wrapper .risk-card .icon {
  flex-shrink: 0;
  color: currentColor;
}

.asset-wrapper .risk-card .content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.asset-wrapper .risk-card .badge {
  ${AssetStyles.typography.label.badge}
  text-transform: uppercase;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: rgba(0, 0, 0, 0.1);
  display: inline-block;
  width: fit-content;
}

.asset-wrapper .risk-card .title {
  ${AssetStyles.typography.heading.h4}
}

.asset-wrapper .risk-card .description {
  ${AssetStyles.typography.body.normal}
  color: #64748b;
}

.asset-wrapper .risk-card .mitigation-label {
  ${AssetStyles.typography.label.default}
  color: #64748b;
}

.asset-wrapper .risk-card .mitigation {
  ${AssetStyles.typography.body.normal}
}

/* Outlook Card Pattern */
.asset-wrapper .outlook-card {
  ${AssetStyles.effects.card}
  ${AssetStyles.spacing.lg}
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.asset-wrapper .outlook-card .icon-large {
  font-size: 3rem;
}

.asset-wrapper .outlook-card h3 {
  ${AssetStyles.typography.heading.h3}
  color: var(--fis-eggplant);
}

.asset-wrapper .outlook-card p {
  ${AssetStyles.typography.body.normal}
  color: #64748b;
  max-width: 600px;
}

/* Category List Pattern */
.asset-wrapper .category-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.asset-wrapper .category-box {
  ${AssetStyles.spacing.md}
  border-radius: ${AssetStyles.radius.md};
  border-left: 4px solid;
}

.asset-wrapper .category-box.color-green {
  background: #d1fae5;
  border-left-color: #10b981;
}

.asset-wrapper .category-box.color-yellow {
  background: #fef3c7;
  border-left-color: #f59e0b;
}

.asset-wrapper .category-box.color-red {
  background: #fee2e2;
  border-left-color: #ef4444;
}

.asset-wrapper .category-box.color-blue {
  background: #dbeafe;
  border-left-color: #3b82f6;
}

.asset-wrapper .category-box h4 {
  ${AssetStyles.typography.heading.h4}
  margin-bottom: 0.75rem;
}

.asset-wrapper .category-box ul {
  list-style: disc;
  margin-left: 1.5rem;
}

.asset-wrapper .category-box li {
  ${AssetStyles.typography.body.normal}
  margin-bottom: 0.25rem;
}

/* ==========================================
   CHART PATTERNS
   ========================================== */

/* Radial Grid for Multiple Charts */
.asset-wrapper .radial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

.asset-wrapper .radial-chart-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  ${AssetStyles.effects.card}
}

.asset-wrapper .radial-chart-item .chart-label {
  text-align: center;
  margin-top: 0.5rem;
}

.asset-wrapper .radial-chart-item .percentage {
  ${AssetStyles.typography.heading.h2}
  color: var(--fis-eggplant);
  font-weight: 600;
}

.asset-wrapper .radial-chart-item .label {
  ${AssetStyles.typography.body.small}
  color: #64748b;
  margin-top: 0.25rem;
}

.asset-wrapper .radial-chart,
.asset-wrapper .pie-chart,
.asset-wrapper .bar-chart,
.asset-wrapper .line-chart {
  ${AssetStyles.effects.card}
  ${AssetStyles.spacing.md}
}

.asset-wrapper .chart-label {
  text-align: center;
  margin-top: 1rem;
}

.asset-wrapper .chart-label .percentage {
  ${AssetStyles.typography.heading.h1}
  color: var(--fis-navy);
}

.asset-wrapper .chart-label .label {
  ${AssetStyles.typography.body.normal}
  color: #64748b;
}

.asset-wrapper .chart-label .badge {
  ${AssetStyles.typography.label.badge}
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.asset-wrapper .chart-label .badge.status-onTrack {
  background: #d1fae5;
  color: #065f46;
}

.asset-wrapper .chart-label .badge.status-atRisk {
  background: #fef3c7;
  color: #92400e;
}

.asset-wrapper .chart-label .badge.status-blocked {
  background: #fee2e2;
  color: #991b1b;
}

/* ==========================================
   COMPLEX PATTERNS
   ========================================== */

/* Status Board Pattern */
.asset-wrapper .status-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 1024px) {
  .asset-wrapper .status-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .asset-wrapper .status-board {
    grid-template-columns: 1fr;
  }
}

.asset-wrapper .status-column {
  ${AssetStyles.effects.card}
  ${AssetStyles.spacing.sm}
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.asset-wrapper .status-column h4 {
  ${AssetStyles.typography.heading.h5}
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.asset-wrapper .status-column.column-0 h4 {
  color: #10b981;
}

.asset-wrapper .status-column.column-1 h4 {
  color: #f59e0b;
}

.asset-wrapper .status-column.column-2 h4 {
  color: #ef4444;
}

.asset-wrapper .status-column.column-3 h4 {
  color: #3b82f6;
}

.asset-wrapper .status-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.asset-wrapper .status-item {
  ${AssetStyles.spacing.sm}
  background: #f8fafc;
  border-radius: ${AssetStyles.radius.sm};
  ${AssetStyles.typography.body.small}
}

/* Timeline Pattern */
.asset-wrapper .timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
}

.asset-wrapper .timeline-event {
  display: flex;
  gap: 1rem;
  position: relative;
}

.asset-wrapper .timeline-marker {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
}

.asset-wrapper .timeline-event.completed .timeline-marker {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.asset-wrapper .timeline-event.pending .timeline-marker {
  background: white;
  border-color: #cbd5e1;
  color: #cbd5e1;
}

.asset-wrapper .timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.asset-wrapper .timeline-date {
  ${AssetStyles.typography.label.badge}
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.asset-wrapper .timeline-title {
  ${AssetStyles.typography.heading.h4}
  color: var(--fis-navy);
}

.asset-wrapper .timeline-description {
  ${AssetStyles.typography.body.normal}
  color: #64748b;
}

/* Two Column Comparison Pattern */
.asset-wrapper .two-column-comparison {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.asset-wrapper .comparison-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.asset-wrapper .comparison-header > div {
  ${AssetStyles.typography.heading.h4}
  ${AssetStyles.spacing.sm}
  background: var(--fis-eggplant);
  color: white;
  text-align: center;
  border-radius: ${AssetStyles.radius.md};
}

.asset-wrapper .comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.asset-wrapper .comparison-grid > div {
  ${AssetStyles.effects.card}
  ${AssetStyles.spacing.md}
  ${AssetStyles.typography.body.normal}
}

/* Problem Solution Box Pattern */
.asset-wrapper .problem-solution-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .asset-wrapper .problem-solution-box {
    grid-template-columns: 1fr;
  }
}

.asset-wrapper .problem-side,
.asset-wrapper .solution-side {
  ${AssetStyles.effects.card}
  ${AssetStyles.spacing.md}
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.asset-wrapper .problem-side {
  border-left: 4px solid #ef4444;
}

.asset-wrapper .solution-side {
  border-left: 4px solid #10b981;
}

.asset-wrapper .problem-side h4,
.asset-wrapper .solution-side h4 {
  ${AssetStyles.typography.heading.h4}
}

.asset-wrapper .problem-side p,
.asset-wrapper .solution-side p {
  ${AssetStyles.typography.body.normal}
  color: #64748b;
}

/* ==========================================
   UTILITY PATTERNS
   ========================================== */

/* Horizontal Rule Pattern */
.asset-wrapper hr {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 1rem 0;
}

.asset-wrapper hr.hr-dashed {
  border-top-style: dashed;
}

.asset-wrapper hr.hr-dotted {
  border-top-style: dotted;
}

/* Number Pattern */
.asset-wrapper .number-display {
  text-align: center;
  ${AssetStyles.spacing.lg}
}

.asset-wrapper .number-value {
  ${AssetStyles.typography.heading.h1}
  font-size: 4rem;
  color: var(--fis-navy);
  line-height: 1;
}

.asset-wrapper .number-value .suffix {
  ${AssetStyles.typography.heading.h3}
  color: var(--fis-raspberry);
  margin-left: 0.5rem;
}

.asset-wrapper .number-label {
  ${AssetStyles.typography.label.default}
  color: #64748b;
  margin-top: 0.5rem;
}

/* ==========================================
   EDIT MODE STYLES
   ========================================== */

.asset-wrapper.edit-mode input,
.asset-wrapper.edit-mode textarea,
.asset-wrapper.edit-mode select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  ${AssetStyles.typography.body.normal}
  font-family: inherit;
}

.asset-wrapper.edit-mode button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  ${AssetStyles.typography.body.small}
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.asset-wrapper.edit-mode button:hover {
  opacity: 0.8;
}

.asset-wrapper.edit-mode button svg {
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.25rem;
}
`;

export default AssetRenderEngine;
