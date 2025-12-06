/**
 * List Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';
import { Plus, X, Check } from 'lucide-react';
import { renderWithExpressions } from '../../../src/utils/expressionParser';

export interface ListPatternProps {
  data: any;
  onChange?: (value: any) => void;
  mode: 'edit' | 'display';
  columnContext?: 'single' | 'multi';
}

// ==========================================
// HIGHLIGHTS LIST PATTERN (Numbered)
// ==========================================

export const HighlightsListPattern: React.FC<ListPatternProps> = ({ data, onChange, mode, columnContext }) => {
  const items = Array.isArray(data) ? data : [];
  const isMultiColumn = columnContext === 'multi';
  console.log('HighlightsListPattern received:', items);
  
  if (mode === 'edit') {
    const addItem = () => {
      onChange?.([...items, '']);
    };
    
    const removeItem = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updateItem = (index: number, value: string) => {
      const updated = [...items];
      updated[index] = value;
      onChange?.(updated);
    };
    
    return (
      <div>
        {items.map((item, index) => (
          <div key={index} className="edit-list-item">
            <div className="edit-number-badge" data-index={index}>{index + 1}</div>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="Enter highlight..."
              style={{ flex: 1 }}
            />
            <button className="delete-button" onClick={() => removeItem(index)}>
              <X size={16} />
            </button>
          </div>
        ))}
        <button className="primary-action" onClick={addItem}>
          <Plus size={16} /> Add Item
        </button>
      </div>
    );
  }
  
  return (
    <div className={`highlights-list ${isMultiColumn ? 'multi-column' : ''}`}>
      {items.map((item, index) => {
        // Handle both string arrays and object arrays with name/value properties
        const displayText = typeof item === 'object' ? (item.name || item.value || '') : item;
        return (
          <div key={index} className="highlight-item">
            <div className={`highlight-badge ${isMultiColumn ? 'compact' : ''}`}>{index + 1}</div>
            <div className="highlight-text">{renderWithExpressions(displayText)}</div>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// BULLET LIST PATTERN
// ==========================================

export const BulletListPattern: React.FC<ListPatternProps> = ({ data, onChange, mode }) => {
  const items = Array.isArray(data) ? data : [];
  
  if (mode === 'edit') {
    const addItem = () => {
      onChange?.([...items, '']);
    };
    
    const removeItem = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updateItem = (index: number, value: string) => {
      const updated = [...items];
      updated[index] = value;
      onChange?.(updated);
    };
    
    return (
      <div>
        {items.map((item, index) => (
          <div key={index} className="edit-list-item">
            <div className="edit-icon">•</div>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="Enter item..."
              style={{ flex: 1 }}
            />
            <button className="delete-button" onClick={() => removeItem(index)}>
              <X size={16} />
            </button>
          </div>
        ))}
        <button className="primary-action" onClick={addItem}>
          <Plus size={16} /> Add Item
        </button>
      </div>
    );
  }
  
  return (
    <ul className="bullet-list">
      {items.map((item, index) => (
        <li key={index}>{renderWithExpressions(item)}</li>
      ))}
    </ul>
  );
};

// ==========================================
// CHECKLIST PATTERN (Completed Items)
// ==========================================

export const ChecklistItemsPattern: React.FC<ListPatternProps> = ({ data, onChange, mode }) => {
  const items = Array.isArray(data) ? data : [];
  
  if (mode === 'edit') {
    const addItem = () => {
      onChange?.([...items, '']);
    };
    
    const removeItem = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updateItem = (index: number, value: string) => {
      const updated = [...items];
      updated[index] = value;
      onChange?.(updated);
    };
    
    return (
      <div>
        {items.map((item, index) => (
          <div key={index} className="edit-list-item">
            <div className="edit-icon check">
              <Check size={16} />
            </div>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="Enter completed item..."
              style={{ flex: 1 }}
            />
            <button className="delete-button" onClick={() => removeItem(index)}>
              <X size={16} />
            </button>
          </div>
        ))}
        <button className="primary-action" onClick={addItem}>
          <Plus size={16} /> Add Item
        </button>
      </div>
    );
  }
  
  return (
    <div className="checklist">
      {items.map((item, index) => (
        <div key={index} className="checklist-item">
          <Check size={16} className="check-icon" />
          <span>{renderWithExpressions(item)}</span>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// PROGRESS BAR LIST PATTERN
// ==========================================

export const ProgressBarListPattern: React.FC<ListPatternProps> = ({ data, onChange, mode }) => {
  const items = Array.isArray(data) ? data : [];
  
  if (mode === 'edit') {
    const addItem = () => {
      onChange?.([...items, { title: '', subtitle: '', percentage: 0, status: 'On Track' }]);
    };
    
    const removeItem = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updateItem = (index: number, field: string, value: any) => {
      const updated = [...items];
      updated[index] = { ...updated[index], [field]: value };
      onChange?.(updated);
    };
    
    return (
      <div>
        {items.map((item, index) => {
          const statusClass = (item.status || 'On Track').toLowerCase().replace(' ', '-');
          return (
            <div key={index} className="edit-item-container">
              <div className="edit-field-row" style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateItem(index, 'title', e.target.value)}
                  placeholder="Task title..."
                  style={{ flex: 1 }}
                />
                <select
                  value={item.status || 'On Track'}
                  onChange={(e) => updateItem(index, 'status', e.target.value)}
                  className={`status-badge ${statusClass}`}
                  style={{ width: 'auto' }}
                >
                  <option>On Track</option>
                  <option>At Risk</option>
                  <option>Blocked</option>
                </select>
              </div>
              <input
                type="text"
                value={item.subtitle || ''}
                onChange={(e) => updateItem(index, 'subtitle', e.target.value)}
                placeholder="Description..."
                style={{ width: '100%', marginBottom: '12px' }}
              />
              <div className="edit-field-row" style={{ marginBottom: '8px' }}>
                <input
                  type="number"
                  value={item.percentage || 0}
                  onChange={(e) => updateItem(index, 'percentage', parseInt(e.target.value))}
                  placeholder="%"
                  min="0"
                  max="100"
                  style={{ width: '80px' }}
                />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {item.percentage || 0}% complete
                </span>
              </div>
              <div className={`edit-progress-bar`}>
                <div className={`edit-progress-fill ${statusClass}`} style={{ width: `${item.percentage || 0}%` }}></div>
              </div>
              <button className="delete-button" onClick={() => removeItem(index)} style={{ marginTop: '12px', width: '100%' }}>
                <X size={16} /> Remove Task
              </button>
            </div>
          );
        })}
        <button className="primary-action" onClick={addItem}>
          <Plus size={16} /> Add Task
        </button>
      </div>
    );
  }
  
  return (
    <div className="progress-list">
      {items.map((item, index) => {
        const status = item.status || '';
        const statusClass = status.toLowerCase().replace(/\s+/g, '-');
        console.log('Progress bar status:', status, '-> class:', statusClass);
        return (
          <div key={index} className={`progress-item ${statusClass}`}>
            <div className="header">
              <span className="title">{item.title}</span>
              <span className={`badge status-${statusClass}`}>
                {item.status}
              </span>
            </div>
            {item.subtitle && <div className="subtitle">{item.subtitle}</div>}
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${item.percentage}%` }}></div>
            </div>
            <div className="percentage">{item.percentage}% complete</div>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// KEY-VALUE LIST PATTERN
// ==========================================

export const KeyValueListPattern: React.FC<ListPatternProps> = ({ data, onChange, mode }) => {
  const pairs = typeof data === 'object' && !Array.isArray(data) ? data : {};
  const entries = Object.entries(pairs);
  
  if (mode === 'edit') {
    const addPair = () => {
      onChange?.({ ...pairs, '': '' });
    };
    
    const removePair = (key: string) => {
      const updated = { ...pairs };
      delete updated[key];
      onChange?.(updated);
    };
    
    const updatePair = (oldKey: string, newKey: string, value: string) => {
      const updated = { ...pairs };
      delete updated[oldKey];
      updated[newKey] = value;
      onChange?.(updated);
    };
    
    return (
      <div>
        {entries.map(([key, value], index) => (
          <div key={index} className="edit-list-item">
            <input
              type="text"
              value={key}
              onChange={(e) => updatePair(key, e.target.value, value as string)}
              placeholder="Label..."
              style={{ flex: 1 }}
            />
            <input
              type="text"
              value={value as string}
              onChange={(e) => updatePair(key, key, e.target.value)}
              placeholder="Value..."
              style={{ flex: 1 }}
            />
            <button className="delete-button" onClick={() => removePair(key)}>
              <X size={16} />
            </button>
          </div>
        ))}
        <button className="primary-action" onClick={addPair}>
          <Plus size={16} /> Add Pair
        </button>
      </div>
    );
  }
  
  return (
    <div className="keyvalue-list">
      {entries.map(([key, value], index) => (
        <div key={index} className="keyvalue-item">
          <span className="keyvalue-label">{key}:</span>
          <span className="keyvalue-value">{value as string}</span>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// TOP 5 LIST PATTERN (Square Badges)
// ==========================================

export const Top5ListPattern: React.FC<ListPatternProps> = ({ data, onChange, mode }) => {
  const items = Array.isArray(data) ? data : [];
  
  if (mode === 'edit') {
    const addItem = () => {
      onChange?.([...items, { name: '', value: 0 }]);
    };
    
    const removeItem = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updateItem = (index: number, field: string, value: string) => {
      const updated = [...items];
      updated[index] = { 
        ...updated[index], 
        [field]: field === 'value' ? Number(value) : value 
      };
      onChange?.(updated);
    };
    
    return (
      <div>
        {items.map((item, index) => (
          <div key={index} className="edit-list-item">
            <div className="edit-number-badge" data-index={index}>{index + 1}</div>
            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
              placeholder="Item name..."
              style={{ flex: 2 }}
            />
            <input
              type="number"
              value={item.value || item.count || 0}
              onChange={(e) => updateItem(index, item.value !== undefined ? 'value' : 'count', e.target.value)}
              placeholder="Count..."
              min="0"
              style={{ width: '100px' }}
            />
            <button className="delete-button" onClick={() => removeItem(index)}>
              <X size={16} />
            </button>
          </div>
        ))}
        <button className="primary-action" onClick={addItem}>
          <Plus size={16} /> Add Item
        </button>
      </div>
    );
  }
  
  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.value || item.count || 0), 0);
  
  return (
    <div className="top5-list">
      <div className="top5-items">
        {items.map((item, index) => (
          <div key={index} className="top5-item">
            <div className="top5-badge" data-rank={index}>
              {index + 1}
            </div>
            <span className="top5-name">{item.name}</span>
            <span className="top5-value">{item.value || item.count || 0}</span>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div className="top5-total">
          Total: <span className="top5-total-value">{total}</span>
        </div>
      )}
    </div>
  );
};
