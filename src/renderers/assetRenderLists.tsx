/**
 * List Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';
import { Plus, X, Check } from 'lucide-react';
import { renderWithExpressions } from '../utils/expressionParser';

export interface ListPatternProps {
  data: any;
  onChange?: (value: any) => void;
  mode: 'edit' | 'display';
}

// ==========================================
// HIGHLIGHTS LIST PATTERN (Numbered)
// ==========================================

export const HighlightsListPattern: React.FC<ListPatternProps> = ({ data, onChange, mode }) => {
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
            <div className="edit-number-badge" data-index={index}>
              {index + 1}
            </div>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="Enter highlight..."
            />
            <button className="delete-button" onClick={() => removeItem(index)}>
              <X size={16} />
            </button>
          </div>
        ))}
        <button className="primary-action" onClick={addItem}>
          <Plus size={16} /> Add Highlight
        </button>
      </div>
    );
  }
  
  console.log('HighlightsListPattern (main app) received:', items);
  
  return (
    <div className="highlights-list">
      {items.map((item, index) => {
        // Handle both string arrays and object arrays with name/value properties
        const isObject = typeof item === 'object';
        const displayText = isObject ? (item.name || item.value || '') : item;
        const displayValue = isObject && item.value ? item.value : null;
        
        return (
          <div key={index} className="highlight-item">
            <div className="highlight-badge">{index + 1}</div>
            <div className="highlight-text">
              {renderWithExpressions(String(displayText))}
              {displayValue && (
                <span className="ml-2 font-roobert-semibold text-fis-eggplant dark:text-fis-raspberry">
                  ({displayValue})
                </span>
              )}
            </div>
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
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="Enter item..."
              style={{ flex: 1 }}
            />
            <button onClick={() => removeItem(index)}><X size={16} /></button>
          </div>
        ))}
        <button onClick={addItem}><Plus size={16} /> Add Item</button>
      </div>
    );
  }
  
  return (
    <ul>
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
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <Check size={16} />
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="Enter completed item..."
              style={{ flex: 1 }}
            />
            <button onClick={() => removeItem(index)}><X size={16} /></button>
          </div>
        ))}
        <button onClick={addItem}><Plus size={16} /> Add Item</button>
      </div>
    );
  }
  
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          <Check size={16} className="check-icon" />
          <span>{renderWithExpressions(item)}</span>
        </li>
      ))}
    </ul>
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
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <input
              type="text"
              value={item.title || ''}
              onChange={(e) => updateItem(index, 'title', e.target.value)}
              placeholder="Title..."
              style={{ width: '100%', marginBottom: '8px' }}
            />
            <input
              type="text"
              value={item.subtitle || ''}
              onChange={(e) => updateItem(index, 'subtitle', e.target.value)}
              placeholder="Subtitle..."
              style={{ width: '100%', marginBottom: '8px' }}
            />
            <input
              type="number"
              value={item.percentage || 0}
              onChange={(e) => updateItem(index, 'percentage', parseInt(e.target.value))}
              placeholder="Percentage..."
              min="0"
              max="100"
              style={{ width: '100%', marginBottom: '8px' }}
            />
            <select
              value={item.status || 'On Track'}
              onChange={(e) => updateItem(index, 'status', e.target.value)}
              style={{ width: '100%', marginBottom: '8px' }}
            >
              <option>On Track</option>
              <option>At Risk</option>
              <option>Blocked</option>
            </select>
            <button onClick={() => removeItem(index)}><X size={16} /> Remove</button>
          </div>
        ))}
        <button onClick={addItem}><Plus size={16} /> Add Initiative</button>
      </div>
    );
  }
  
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="progress-item">
          <div className="header">
            <span className="title">{item.title}</span>
            <span className={`badge status-${item.status?.toLowerCase().replace(' ', '-')}`}>
              {item.status}
            </span>
          </div>
          <div className="subtitle">{item.subtitle}</div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${item.percentage}%` }}></div>
          </div>
          <div className="percentage">{item.percentage}% complete</div>
        </div>
      ))}
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
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
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
            <button onClick={() => removePair(key)}><X size={16} /></button>
          </div>
        ))}
        <button onClick={addPair}><Plus size={16} /> Add Pair</button>
      </div>
    );
  }
  
  return (
    <dl>
      {entries.map(([key, value], index) => (
        <div key={index}>
          <dt>{key}:</dt>
          <dd>{value as string}</dd>
        </div>
      ))}
    </dl>
  );
};
