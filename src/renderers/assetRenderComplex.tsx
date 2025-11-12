/**
 * Complex Layout Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';
import { Plus, X, Calendar, CheckCircle, Circle } from 'lucide-react';

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
      <div className="status-board-edit">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="status-column-edit">
            <input
              type="text"
              value={column.title || ''}
              onChange={(e) => updateColumnTitle(colIndex, e.target.value)}
              placeholder="Column Title..."
            />
            {(column.items || []).map((item: string, itemIndex: number) => (
              <div key={itemIndex} className="status-item-edit">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateItem(colIndex, itemIndex, e.target.value)}
                  placeholder="Item..."
                />
                <button onClick={() => removeItem(colIndex, itemIndex)}><X size={16} /></button>
              </div>
            ))}
            <button onClick={() => addItem(colIndex)}><Plus size={16} /> Add Item</button>
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
// TIMELINE PATTERN (Vertical List)
// ==========================================

export const TimelinePattern: React.FC<ComplexPatternProps> = ({ data, onChange, mode }) => {
  const events = Array.isArray(data) ? data : [];
  
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
      <div className="timeline-edit">
        {events.map((event, index) => (
          <div key={index} className="timeline-event-edit">
            <input
              type="text"
              value={event.date || ''}
              onChange={(e) => updateEvent(index, 'date', e.target.value)}
              placeholder="Date (e.g., Nov 2025)..."
            />
            <input
              type="text"
              value={event.title || ''}
              onChange={(e) => updateEvent(index, 'title', e.target.value)}
              placeholder="Milestone Title..."
            />
            <textarea
              value={event.description || ''}
              onChange={(e) => updateEvent(index, 'description', e.target.value)}
              placeholder="Description..."
              rows={2}
            />
            <label>
              <input
                type="checkbox"
                checked={event.completed || false}
                onChange={(e) => updateEvent(index, 'completed', e.target.checked)}
              />
              Completed
            </label>
            <button onClick={() => removeEvent(index)}><X size={16} /></button>
          </div>
        ))}
        <button onClick={addEvent}><Plus size={16} /> Add Event</button>
      </div>
    );
  }
  
  return (
    <div className="timeline">
      {events.map((event, index) => (
        <div key={index} className={`timeline-event ${event.completed ? 'completed' : 'pending'}`}>
          <div className="timeline-marker">
            {event.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
          </div>
          <div className="timeline-content">
            <div className="timeline-date">
              <Calendar size={16} />
              {event.date}
            </div>
            <div className="timeline-title">{event.title}</div>
            <div className="timeline-description">{event.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// TWO COLUMN COMPARISON PATTERN (2x2 Grid)
// ==========================================

export const TwoColumnComparisonPattern: React.FC<ComplexPatternProps> = ({ data, onChange, mode }) => {
  const defaultData = {
    leftTitle: '',
    rightTitle: '',
    leftTop: '',
    leftBottom: '',
    rightTop: '',
    rightBottom: ''
  };
  
  const compData = { ...defaultData, ...data };
  
  if (mode === 'edit') {
    const updateField = (field: string, value: string) => {
      onChange?.({ ...compData, [field]: value });
    };
    
    return (
      <div className="two-column-edit">
        <div className="headers">
          <input
            type="text"
            value={compData.leftTitle}
            onChange={(e) => updateField('leftTitle', e.target.value)}
            placeholder="Left Column Title..."
          />
          <input
            type="text"
            value={compData.rightTitle}
            onChange={(e) => updateField('rightTitle', e.target.value)}
            placeholder="Right Column Title..."
          />
        </div>
        <div className="content-grid">
          <textarea
            value={compData.leftTop}
            onChange={(e) => updateField('leftTop', e.target.value)}
            placeholder="Left Top Content..."
            rows={4}
          />
          <textarea
            value={compData.rightTop}
            onChange={(e) => updateField('rightTop', e.target.value)}
            placeholder="Right Top Content..."
            rows={4}
          />
          <textarea
            value={compData.leftBottom}
            onChange={(e) => updateField('leftBottom', e.target.value)}
            placeholder="Left Bottom Content..."
            rows={4}
          />
          <textarea
            value={compData.rightBottom}
            onChange={(e) => updateField('rightBottom', e.target.value)}
            placeholder="Right Bottom Content..."
            rows={4}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="two-column-comparison">
      <div className="comparison-header">
        <div className="left-header">{compData.leftTitle}</div>
        <div className="right-header">{compData.rightTitle}</div>
      </div>
      <div className="comparison-grid">
        <div className="left-top">{compData.leftTop}</div>
        <div className="right-top">{compData.rightTop}</div>
        <div className="left-bottom">{compData.leftBottom}</div>
        <div className="right-bottom">{compData.rightBottom}</div>
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
