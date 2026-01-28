/**
 * Complex Layout Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React, { useState } from 'react';
import { Plus, X, Calendar, ExternalLink, DollarSign, Users, AlertCircle, CheckCircle, Clock, PlayCircle, XCircle, CheckCircle2 } from 'lucide-react';
import { renderWithExpressions } from '@shared/utils/expressionParser';

export interface ComplexPatternProps {
  data: any;
  onChange?: (value: any) => void;
  mode: 'edit' | 'display';
}

// ==========================================
// STATUS BOARD PATTERN (4 Columns)
// ==========================================

export const StatusBoardPattern: React.FC<ComplexPatternProps> = ({ data, onChange, mode }) => {
  const columns = data?.columns || [
    { title: 'On Track', items: [] },
    { title: 'At Risk', items: [] },
    { title: 'Blocked', items: [] },
    { title: 'Completed', items: [] }
  ];
  
  if (mode === 'edit') {
    const updateColumnTitle = (colIndex: number, title: string) => {
      const updated = [...columns];
      updated[colIndex] = { ...updated[colIndex], title };
      onChange?.({ ...data, columns: updated });
    };
    
    const addItem = (colIndex: number) => {
      const updated = [...columns];
      updated[colIndex].items = [...(updated[colIndex].items || []), ''];
      onChange?.({ ...data, columns: updated });
    };
    
    const removeItem = (colIndex: number, itemIndex: number) => {
      const updated = [...columns];
      updated[colIndex].items = updated[colIndex].items.filter((_: any, i: number) => i !== itemIndex);
      onChange?.({ ...data, columns: updated });
    };
    
    const updateItem = (colIndex: number, itemIndex: number, value: string) => {
      const updated = [...columns];
      updated[colIndex].items[itemIndex] = value;
      onChange?.({ ...data, columns: updated });
    };
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="edit-item-container">
            <input
              type="text"
              value={column.title || ''}
              onChange={(e) => updateColumnTitle(colIndex, e.target.value)}
              placeholder="Column Title..."
              style={{ marginBottom: '12px', fontWeight: 600 }}
            />
            {(column.items || []).map((item: string, itemIndex: number) => (
              <div key={itemIndex} className="edit-list-item">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateItem(colIndex, itemIndex, e.target.value)}
                  placeholder="Item..."
                  style={{ flex: 1 }}
                />
                <button className="delete-button" onClick={() => removeItem(colIndex, itemIndex)}>
                  <X size={16} />
                </button>
              </div>
            ))}
            <button className="secondary-action" onClick={() => addItem(colIndex)} style={{ width: '100%', marginTop: '8px' }}>
              <Plus size={16} /> Add Item
            </button>
          </div>
        ))}
      </div>
    );
  }
  
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

export const TimelinePattern: React.FC<ComplexPatternProps> = ({ data, onChange, mode }) => {
  const events = Array.isArray(data) ? data : [];
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  
  if (mode === 'edit') {
    const addEvent = () => {
      onChange?.([...events, { date: '', title: '', description: '', completed: false }]);
    };
    
    const removeEvent = (index: number) => {
      onChange?.(events.filter((_, i) => i !== index));
    };
    
    const updateEvent = (index: number, field: string, value: any) => {
      const updated = [...events];
      updated[index] = { ...updated[index], [field]: value };
      onChange?.(updated);
    };
    
    return (
      <div>
        {events.map((event, index) => (
          <div key={index} className="edit-item-container">
            <div className="edit-field-row" style={{ marginBottom: '12px' }}>
              <input
                type="text"
                value={event.date || ''}
                onChange={(e) => updateEvent(index, 'date', e.target.value)}
                placeholder="Date (e.g., Jan 2025)..."
                style={{ width: '150px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Completed</span>
                <div 
                  className={`toggle-switch ${event.completed ? 'active' : ''}`}
                  onClick={() => updateEvent(index, 'completed', !event.completed)}
                >
                  <div className="toggle-switch-knob"></div>
                </div>
              </div>
              <button className="delete-button" onClick={() => removeEvent(index)}>
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              value={event.title || ''}
              onChange={(e) => updateEvent(index, 'title', e.target.value)}
              placeholder="Milestone Title..."
              style={{ marginBottom: '12px' }}
            />
            <input
              type="text"
              value={event.note || ''}
              onChange={(e) => updateEvent(index, 'note', e.target.value)}
              placeholder="Note Label (optional, e.g., 'TEXT NOTE')..."
              style={{ marginBottom: '12px' }}
            />
            <textarea
              value={event.description || ''}
              onChange={(e) => updateEvent(index, 'description', e.target.value)}
              placeholder="Description..."
              rows={2}
            />
          </div>
        ))}
        <button className="primary-action" onClick={addEvent}>
          <Plus size={16} /> Add Milestone
        </button>
      </div>
    );
  }
  
  // Calculate timeline overview
  const selectedEvent = events[selectedIndex] || events[0];
  const startDate = events[0]?.date || 'TBD';
  const endDate = events[events.length - 1]?.date || 'TBD';
  const completedCount = events.filter(e => e.completed).length;
  const progressPercent = events.length > 0 ? Math.round((completedCount / events.length) * 100) : 0;
  
  // Display mode - new layout with timeline + details container
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

export const TwoColumnComparisonPattern: React.FC<ComplexPatternProps> = ({ data, onChange, mode }) => {
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
  
  if (mode === 'edit') {
    const updateField = (field: string, value: string) => {
      onChange?.({ ...compData, [field]: value });
    };
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="edit-item-container">
          <input
            type="text"
            value={compData.topLeftTitle}
            onChange={(e) => updateField('topLeftTitle', e.target.value)}
            placeholder="Top Left Title..."
            style={{ marginBottom: '8px' }}
          />
          <textarea
            value={compData.topLeftContent}
            onChange={(e) => updateField('topLeftContent', e.target.value)}
            placeholder="Top Left Content..."
            rows={4}
          />
        </div>
        <div className="edit-item-container">
          <input
            type="text"
            value={compData.topRightTitle}
            onChange={(e) => updateField('topRightTitle', e.target.value)}
            placeholder="Top Right Title..."
            style={{ marginBottom: '8px' }}
          />
          <textarea
            value={compData.topRightContent}
            onChange={(e) => updateField('topRightContent', e.target.value)}
            placeholder="Top Right Content..."
            rows={4}
          />
        </div>
        <div className="edit-item-container">
          <input
            type="text"
            value={compData.bottomLeftTitle}
            onChange={(e) => updateField('bottomLeftTitle', e.target.value)}
            placeholder="Bottom Left Title..."
            style={{ marginBottom: '8px' }}
          />
          <textarea
            value={compData.bottomLeftContent}
            onChange={(e) => updateField('bottomLeftContent', e.target.value)}
            placeholder="Bottom Left Content..."
            rows={4}
          />
        </div>
        <div className="edit-item-container">
          <input
            type="text"
            value={compData.bottomRightTitle}
            onChange={(e) => updateField('bottomRightTitle', e.target.value)}
            placeholder="Bottom Right Title..."
            style={{ marginBottom: '8px' }}
          />
          <textarea
            value={compData.bottomRightContent}
            onChange={(e) => updateField('bottomRightContent', e.target.value)}
            placeholder="Bottom Right Content..."
            rows={4}
          />
        </div>
      </div>
    );
  }
  
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

export const ProblemSolutionBoxPattern: React.FC<ComplexPatternProps> = ({ data, onChange, mode }) => {
  if (mode === 'edit') {
    const updateField = (field: string, value: string) => {
      onChange?.({ ...data, [field]: value });
    };
    
    return (
      <div className="problem-solution-edit">
        <div className="problem-section">
          <label>Problem</label>
          <textarea
            value={data?.problem || ''}
            onChange={(e) => updateField('problem', e.target.value)}
            placeholder="Describe the problem..."
            rows={5}
          />
        </div>
        <div className="solution-section">
          <label>Solution</label>
          <textarea
            value={data?.solution || ''}
            onChange={(e) => updateField('solution', e.target.value)}
            placeholder="Describe the solution..."
            rows={5}
          />
        </div>
      </div>
    );
  }
  
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

// Lazy load the editor modal outside component to prevent re-creation on every render
const GanttEditorModal = React.lazy(() => 
  import('../components/GanttEditorModal').then(module => ({ default: module.GanttEditorModal }))
);

export const GanttChartPattern: React.FC<ComplexPatternProps> = ({ data, onChange, mode }) => {
  const [showGanttEditor, setShowGanttEditor] = React.useState(false);
  
  if (mode === 'edit') {
    return (
      <>
        <div className="w-full space-y-4 p-6 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-roobert-semibold text-brand-primary dark:text-brand-secondary">
              Gantt Chart Settings
            </h3>
            <button
              onClick={() => setShowGanttEditor(true)}
              className="px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' }}
            >
              Edit Gantt Chart
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            Click "Edit Gantt Chart" to manage organizations, projects, and tasks →
          </div>
        </div>

        {showGanttEditor && (
          <React.Suspense fallback={<div>Loading...</div>}>
            <GanttEditorModal
              data={data}
              onChange={(newData) => {
                onChange?.(newData);
              }}
              onClose={() => setShowGanttEditor(false)}
            />
          </React.Suspense>
        )}
      </>
    );
  }

  // Display mode - use dedicated renderer
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

export const VendorAssetPattern: React.FC<ComplexPatternProps> = ({ data, onChange, mode }) => {
  const problemsSolved = data?.problemsSolved || '';
  const coreFunctions = data?.coreFunctions || [];
  const extendedFunctions = data?.extendedFunctions || [];
  const bigWins = data?.bigWins || [];

  if (mode === 'edit') {
    const updateProblems = (value: string) => {
      onChange?.({ ...data, problemsSolved: value });
    };

    const updateCoreFunction = (index: number, value: string) => {
      const updated = [...coreFunctions];
      updated[index] = value;
      onChange?.({ ...data, coreFunctions: updated });
    };

    const addCoreFunction = () => {
      onChange?.({ ...data, coreFunctions: [...coreFunctions, ''] });
    };

    const removeCoreFunction = (index: number) => {
      onChange?.({ ...data, coreFunctions: coreFunctions.filter((_: any, i: number) => i !== index) });
    };

    const updateExtendedFunction = (index: number, value: string) => {
      const updated = [...extendedFunctions];
      updated[index] = value;
      onChange?.({ ...data, extendedFunctions: updated });
    };

    const addExtendedFunction = () => {
      onChange?.({ ...data, extendedFunctions: [...extendedFunctions, ''] });
    };

    const removeExtendedFunction = (index: number) => {
      onChange?.({ ...data, extendedFunctions: extendedFunctions.filter((_: any, i: number) => i !== index) });
    };

    const updateBigWin = (index: number, field: string, value: string) => {
      const updated = [...bigWins];
      updated[index] = { ...updated[index], [field]: value };
      onChange?.({ ...data, bigWins: updated });
    };

    const addBigWin = () => {
      onChange?.({ ...data, bigWins: [...bigWins, { metric: '', title: '', description: '' }] });
    };

    const removeBigWin = (index: number) => {
      onChange?.({ ...data, bigWins: bigWins.filter((_: any, i: number) => i !== index) });
    };

    return (
      <div className="vendor-asset-edit">
        {/* Problems Solved */}
        <div className="edit-section">
          <label>Problems Being Solved (Strategic Purpose)</label>
          <textarea
            value={problemsSolved}
            onChange={(e) => updateProblems(e.target.value)}
            placeholder="**Strategic statement** - Markdown supported..."
            rows={4}
            style={{ width: '100%', marginBottom: '1rem' }}
          />
        </div>

        {/* Core & Extended Functions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="edit-section">
            <label>Core Functions</label>
            {coreFunctions.map((func: string, index: number) => (
              <div key={index} className="edit-list-item">
                <input
                  type="text"
                  value={func}
                  onChange={(e) => updateCoreFunction(index, e.target.value)}
                  placeholder="Core function..."
                  style={{ flex: 1 }}
                />
                <button className="delete-button" onClick={() => removeCoreFunction(index)}>
                  <X size={16} />
                </button>
              </div>
            ))}
            <button className="secondary-action" onClick={addCoreFunction}>
              <Plus size={16} /> Add Core Function
            </button>
          </div>

          <div className="edit-section">
            <label>Extended Functions</label>
            {extendedFunctions.map((func: string, index: number) => (
              <div key={index} className="edit-list-item">
                <input
                  type="text"
                  value={func}
                  onChange={(e) => updateExtendedFunction(index, e.target.value)}
                  placeholder="Extended function..."
                  style={{ flex: 1 }}
                />
                <button className="delete-button" onClick={() => removeExtendedFunction(index)}>
                  <X size={16} />
                </button>
              </div>
            ))}
            <button className="secondary-action" onClick={addExtendedFunction}>
              <Plus size={16} /> Add Extended Function
            </button>
          </div>
        </div>

        {/* Big Wins */}
        <div className="edit-section">
          <label>Big Wins (Success Gallery)</label>
          {bigWins.map((win: any, index: number) => (
            <div key={index} className="edit-item-container" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={win.metric || ''}
                  onChange={(e) => updateBigWin(index, 'metric', e.target.value)}
                  placeholder="Metric (e.g., -30%, 1M+)"
                />
                <input
                  type="text"
                  value={win.title || ''}
                  onChange={(e) => updateBigWin(index, 'title', e.target.value)}
                  placeholder="Title (e.g., Operational Overhead Saved)"
                />
              </div>
              <textarea
                value={win.description || ''}
                onChange={(e) => updateBigWin(index, 'description', e.target.value)}
                placeholder="Description..."
                rows={2}
                style={{ width: '100%' }}
              />
              <button className="delete-button" onClick={() => removeBigWin(index)} style={{ marginTop: '0.5rem' }}>
                <X size={16} /> Remove Win
              </button>
            </div>
          ))}
          <button className="secondary-action" onClick={addBigWin}>
            <Plus size={16} /> Add Big Win
          </button>
        </div>
      </div>
    );
  }

  // Display Mode - Following wireframe spec
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

// ==========================================
// PROGRESS BAR LIST DETAILED PATTERN (with Modal)
// ==========================================

// Lazy load the editor modal outside component to prevent re-creation on every render
const ProjectDetailEditorModal = React.lazy(() => 
  import('../components/ProjectDetailEditorModal').then(module => ({ default: module.ProjectDetailEditorModal }))
);

export const ProgressBarListDetailedPattern: React.FC<ComplexPatternProps> = ({ data, onChange, mode }) => {
  const items = Array.isArray(data) ? data : [];
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showProjectEditor, setShowProjectEditor] = React.useState(false);
  
  if (mode === 'edit') {
    return (
      <>
        <div className="w-full space-y-4 p-6 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-roobert-semibold text-brand-primary dark:text-brand-secondary">
              Project Portfolio Settings
            </h3>
            <button
              onClick={() => setShowProjectEditor(true)}
              className="px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' }}
            >
              Edit Project Details
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            Click "Edit Project Details" to manage projects with comprehensive tracking data →
          </div>
        </div>

        {showProjectEditor && (
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProjectDetailEditorModal
              data={{ projects: items }}
              onChange={(newData) => {
                onChange?.(newData.projects);
              }}
              onClose={() => setShowProjectEditor(false)}
            />
          </React.Suspense>
        )}
      </>
    );
  }
  
  // Display mode with modal
  return (
    <>
      <div className="progress-list-detailed">
        {items.map((item: any, index: number) => {
          const status = item.status || '';
          const statusClass = status.toLowerCase().replace(/\s+/g, '-');
          const priority = item.priority || 'Medium';
          const priorityClass = priority.toLowerCase();
          
          return (
            <div 
              key={index} 
              className={`progress-item-detailed ${statusClass}`}
              onClick={() => setSelectedProject(item)}
              style={{ cursor: 'pointer' }}
            >
              {/* Header Row: Title + Status + Priority */}
              <div className="header">
                <div className="title-section">
                  <span className="title">{item.title}</span>
                  <ExternalLink className="expand-icon" size={14} style={{ marginLeft: '8px', opacity: 0.6 }} />
                </div>
                <div className="badges">
                  <span className={`badge priority-${priorityClass}`}>
                    {item.priority}
                  </span>
                  <span className={`badge status-${statusClass}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Info Row: Owner + Team + Dates */}
              <div className="info-row">
                <div className="info-item">
                  <Users size={14} />
                  <span>{item.owner} · {item.team}</span>
                </div>
                <div className="info-item">
                  <Calendar size={14} />
                  <span>{item.startDate} → {item.targetDate}</span>
                </div>
                {item.budget && (
                  <div className="info-item">
                    <DollarSign size={14} />
                    <span>{item.budget}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${item.percentage}%` }}></div>
              </div>
              <div className="percentage">{item.percentage}% complete</div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedProject && (
        <div 
          className="project-detail-modal-overlay"
          onClick={() => setSelectedProject(null)}
        >
          <div 
            className="project-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h2 className="modal-title">{selectedProject.title}</h2>
                <div className="modal-subtitle">
                  <Users size={16} />
                  <span>{selectedProject.owner} · {selectedProject.team}</span>
                </div>
              </div>
              <div className="modal-badges">
                <span className={`badge priority-${(selectedProject.priority || 'Medium').toLowerCase()}`}>
                  {selectedProject.priority || 'Medium'}
                </span>
                <span className={`badge status-${(selectedProject.status || 'On Track').toLowerCase().replace(/\s+/g, '-')}`} style={{ marginLeft: '24px' }}>
                  {selectedProject.status || 'On Track'}
                </span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  marginLeft: '16px',
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ 
                    width: '300px', 
                    height: '8px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{ 
                        width: `${selectedProject.percentage}%`,
                        height: '100%',
                        background: '#4bcd3e',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                  </div>
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: 'white',
                    minWidth: '38px',
                    textAlign: 'right'
                  }}>
                    {selectedProject.percentage}%
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="modal-close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              {/* Description */}
              {selectedProject.description && (
                <div className="modal-section">
                  <h3 className="section-title">Description</h3>
                  <p className="section-text">{selectedProject.description}</p>
                </div>
              )}

              {/* Milestones */}
              {selectedProject.milestones && (
                <div className="modal-section">
                  <h3 className="section-title">Key Milestones</h3>
                  <div className="milestones-list">
                    {selectedProject.milestones.split('|').map((milestone: string, i: number) => (
                      <div key={i} className="milestone-item">
                        <CheckCircle size={16} />
                        <span>{milestone.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              <div className="modal-section">
                <h3 className="section-title">
                  <Calendar size={18} />
                  Timeline
                </h3>
                <div className="timeline-grid">
                  <div>
                    <div className="timeline-label">Start Date</div>
                    <div className="timeline-value">{selectedProject.startDate || 'Not set'}</div>
                  </div>
                  <div>
                    <div className="timeline-label">Target Completion</div>
                    <div className="timeline-value">{selectedProject.targetDate || 'Not set'}</div>
                  </div>
                </div>
              </div>

              {/* Dependencies */}
              {selectedProject.dependencies && (
                <div className="modal-section">
                  <h3 className="section-title">Dependencies</h3>
                  <p className="section-text">{selectedProject.dependencies}</p>
                </div>
              )}

              {/* Risks */}
              {selectedProject.risks && (
                <div className="modal-section">
                  <h3 className="section-title">
                    <AlertCircle size={18} style={{ color: 'var(--accent-red)' }} />
                    Risks & Issues
                  </h3>
                  <p className="section-text risk-text">{selectedProject.risks}</p>
                </div>
              )}

              {/* Steps */}
              {selectedProject.steps && selectedProject.steps.length > 0 && (
                <div className="modal-section">
                  <h3 className="section-title">Steps</h3>
                  <div className="steps-list">
                    {selectedProject.steps.map((step: any) => {
                      let icon;
                      let iconColor;
                      
                      switch(step.state) {
                        case 'Complete':
                          icon = <CheckCircle2 size={16} />;
                          iconColor = 'var(--accent-green)';
                          break;
                        case 'In-Progress':
                          icon = <PlayCircle size={16} />;
                          iconColor = 'var(--brand-primary)';
                          break;
                        case 'Scheduled':
                          icon = <Clock size={16} />;
                          iconColor = 'var(--accent-yellow)';
                          break;
                        case 'Cancelled':
                          icon = <XCircle size={16} />;
                          iconColor = 'var(--accent-red)';
                          break;
                        case 'Pending':
                        default:
                          icon = <Clock size={16} />;
                          iconColor = 'var(--text-tertiary)';
                          break;
                      }
                      
                      return (
                        <div key={step.id} className="step-item">
                          <span style={{ color: iconColor }}>{icon}</span>
                          <span>{step.step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Budget Section */}
              {selectedProject.budget && (
                <div className="modal-section">
                  <h3 className="section-title">
                    <DollarSign size={18} />
                    Budget
                  </h3>
                  <div className="budget-value">{selectedProject.budget}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ==========================================