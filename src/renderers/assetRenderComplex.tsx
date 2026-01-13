/**
 * Complex Layout Asset Patterns - FRONTEND DISPLAY VERSION
 * 
 * These patterns return pure structure and logic for DISPLAY ONLY.
 * Edit modes are handled in CMS version only.
 */

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { renderWithExpressions } from '../utils/expressionParser';

export interface ComplexPatternProps {
  data: any;
  onChange?: (value: any) => void;
  mode: 'edit' | 'display';
}

// ==========================================
// STATUS BOARD PATTERN (4 Columns)
// ==========================================

export const StatusBoardPattern: React.FC<ComplexPatternProps> = ({ data }) => {
  const columns = data?.columns || [
    { title: 'On Track', items: [] },
    { title: 'At Risk', items: [] },
    { title: 'Blocked', items: [] },
    { title: 'Completed', items: [] }
  ];
  
  return (
    <div className="status-board">
      {columns.map((column, colIndex) => (
        <div key={colIndex} className={`status-column column-${colIndex}`}>
          <h4>{column.title}</h4>
          <div className="status-items">
            {(column.items || []).map((item: string, itemIndex: number) => (
              <div key={itemIndex} className="status-item">{item}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// PROJECT MILESTONES TIMELINE (Horizontal)
// ==========================================

export const TimelinePattern: React.FC<ComplexPatternProps> = ({ data }) => {
  const events = Array.isArray(data) ? data : [];
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  
  // Calculate timeline overview
  const selectedEvent = events[selectedIndex] || events[0];
  const startDate = events[0]?.date || 'TBD';
  const endDate = events[events.length - 1]?.date || 'TBD';
  const completedCount = events.filter(e => e.completed).length;
  const progressPercent = events.length > 0 ? Math.round((completedCount / events.length) * 100) : 0;
  
  return (
    <div className="timeline-container">
      {/* Top Timeline */}
      <div className="timeline-horizontal">
        <div className="timeline-line"></div>
        <div className="timeline-milestones">
          {events.map((event, index) => (
            <div 
              key={index} 
              className={`timeline-milestone ${event.completed ? 'completed' : 'pending'} ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => setSelectedIndex(index)}
              data-milestone-index={index}
            >
              {/* Note Label */}
              {event.note && (
                <div className="milestone-note">
                  <span>{renderWithExpressions(event.note)}</span>
                </div>
              )}
              <div className="milestone-circle">{index + 1}</div>
              <div className="milestone-date">{event.date}</div>
              <div className="milestone-title">{event.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Details Container */}
      <div className="timeline-details-container">
        {/* Left: Timeline Overview (33%) */}
        <div className="timeline-overview">
          <h3 className="overview-heading">Timeline Overview</h3>
          
          <div className="overview-item">
            <span className="overview-label">Start Date</span>
            <span className="overview-value">{startDate}</span>
          </div>
          
          <div className="overview-item">
            <span className="overview-label">End Date</span>
            <span className="overview-value">{endDate}</span>
          </div>
          
          <div className="overview-item">
            <span className="overview-label">Total Milestones</span>
            <span className="overview-value">{events.length}</span>
          </div>
          
          <div className="overview-item">
            <span className="overview-label">Progress</span>
            <span className="overview-value">{completedCount} of {events.length}</span>
          </div>
          
          <div className="overview-progress">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="progress-percent">{progressPercent}%</span>
          </div>
        </div>

        {/* Right: Selected Milestone Details (66%) */}
        <div className="milestone-details">
          <div className="details-header">
            <h3 className="details-title">{selectedEvent?.title || 'Select a milestone'}</h3>
            <span className={`details-status ${selectedEvent?.completed ? 'completed' : 'upcoming'}`}>
              {selectedEvent?.completed ? 'Completed' : 'Upcoming'}
            </span>
          </div>
          
          <div className="details-date">
            <Calendar size={16} />
            <span>{selectedEvent?.date || 'TBD'}</span>
          </div>
          
          {/* Metadata Panel */}
          {selectedEvent && (selectedEvent as any).metadata && (
            <div className="details-metadata">
              {Object.entries((selectedEvent as any).metadata).map(([key, value]) => (
                <div key={key} className="metadata-item">
                  <span className="metadata-label">{key}</span>
                  <span className="metadata-value">{value as string}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="details-description">
            {selectedEvent?.description || 'No description available'}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// TWO COLUMN COMPARISON PATTERN (2x2 Grid)
// ==========================================

export const TwoColumnComparisonPattern: React.FC<ComplexPatternProps> = ({ data }) => {
  const defaultData = {
    topLeftTitle: '',
    topLeftContent: '',
    topRightTitle: '',
    topRightContent: '',
    bottomLeftTitle: '',
    bottomLeftContent: '',
    bottomRightTitle: '',
    bottomRightContent: ''
  };
  
  const compData = { ...defaultData, ...data };
  
  return (
    <div className="four-block-grid">
      <div className="block">
        <div className="block-title">{compData.topLeftTitle}</div>
        <div className="block-content">{compData.topLeftContent}</div>
      </div>
      <div className="block">
        <div className="block-title">{compData.topRightTitle}</div>
        <div className="block-content">{compData.topRightContent}</div>
      </div>
      <div className="block">
        <div className="block-title">{compData.bottomLeftTitle}</div>
        <div className="block-content">{compData.bottomLeftContent}</div>
      </div>
      <div className="block">
        <div className="block-title">{compData.bottomRightTitle}</div>
        <div className="block-content">{compData.bottomRightContent}</div>
      </div>
    </div>
  );
};

// ==========================================
// PROBLEM SOLUTION BOX PATTERN
// ==========================================

export const ProblemSolutionBoxPattern: React.FC<ComplexPatternProps> = ({ data }) => {
  return (
    <div className="problem-solution-box">
      <div className="problem-side">
        <h4>Problem</h4>
        <p>{data?.problem}</p>
      </div>
      <div className="solution-side">
        <h4>Solution</h4>
        <p>{data?.solution}</p>
      </div>
    </div>
  );
};

// ==========================================
// GANTT CHART PATTERN
// ==========================================

export const GanttChartPattern: React.FC<ComplexPatternProps> = ({ data }) => {
  const GanttChartRenderer = React.lazy(() => 
    import('./assetRenderGantt').then(module => ({ default: module.GanttChartRenderer }))
  );
  
  return (
    <React.Suspense fallback={<div className="text-center py-8 text-gray-500">Loading Gantt chart...</div>}>
      <GanttChartRenderer data={data} mode="display" />
    </React.Suspense>
  );
};

// ==========================================
// VENDOR STRATEGIC IDENTITY PATTERN
// ==========================================

export const VendorAssetPattern: React.FC<ComplexPatternProps> = ({ data }) => {
  const problemsSolved = data?.problemsSolved || '';
  const coreFunctions = data?.coreFunctions || [];
  const extendedFunctions = data?.extendedFunctions || [];
  const bigWins = data?.bigWins || [];

  return (
    <div className="vendor-asset-display">
      {/* Top Row: Problems (60%) + Capabilities (40%) */}
      <div className="vendor-top-row">
        {/* Problems Being Solved - The Narrative */}
        <div className="vendor-problems-card">
          <h3 className="vendor-section-label">Strategic Purpose</h3>
          <div className="vendor-problems-content">
            {renderWithExpressions(problemsSolved)}
          </div>
        </div>

        {/* Core vs Extended - The Capability Split */}
        <div className="vendor-capabilities-card">
          <div className="vendor-capabilities-grid">
            <div className="vendor-core-column">
              <h4 className="vendor-capability-title core">Core Functions</h4>
              <ul className="vendor-function-list">
                {coreFunctions.map((func: string, index: number) => (
                  <li key={index}>{func}</li>
                ))}
              </ul>
            </div>
            <div className="vendor-extended-column">
              <h4 className="vendor-capability-title extended">Extended Value</h4>
              <ul className="vendor-function-list extended">
                {extendedFunctions.map((func: string, index: number) => (
                  <li key={index}>{func}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Success Gallery - The Proof */}
      <div className="vendor-success-gallery">
        {bigWins.map((win: any, index: number) => (
          <div key={index} className="vendor-win-card">
            <div className="vendor-win-metric">{win.metric}</div>
            <div className="vendor-win-title">{win.title}</div>
            <p className="vendor-win-description">{win.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
