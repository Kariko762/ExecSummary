/**
 * Complex Layout Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';
import { Plus, X, Calendar } from 'lucide-react';

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
// COMPLEX PROJECT TIMELINE (Gantt-style with Phases)
// ==========================================
