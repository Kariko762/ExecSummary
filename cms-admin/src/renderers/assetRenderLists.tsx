/**
 * List Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';
import { Plus, X, Check } from 'lucide-react';

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
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span>{index + 1}</span>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="Enter highlight..."
              style={{ flex: 1 }}
            />
            <button onClick={() => removeItem(index)}><X size={16} /></button>
          </div>
        ))}
        <button onClick={addItem}><Plus size={16} /> Add Highlight</button>
      </div>
    );
  }
  
  return (
    <div className="highlights-list">
      {items.map((item, index) => (
        <div key={index} className="highlight-item">
          <div className="highlight-badge">{index + 1}</div>
          <div className="highlight-text">{item}</div>
        </div>
      ))}
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
    <ul className="bullet-list">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
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
    <div className="checklist">
      {items.map((item, index) => (
        <div key={index} className="checklist-item">
          <Check size={16} className="check-icon" />
          <span>{item}</span>
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
    <div className="progress-list">
      {items.map((item, index) => {
        const statusClass = item.status?.toLowerCase().replace(' ', '-');
        return (
          <div key={index} className={`progress-item ${statusClass}`}>
            <div className="progress-header">
              <div className="progress-title">{item.title}</div>
              <div className={`progress-status status-${statusClass}`}>
                {item.status}
              </div>
            </div>
            {item.subtitle && <div className="progress-subtitle">{item.subtitle}</div>}
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${item.percentage}%` }}></div>
            </div>
            <div className="progress-percentage">{item.percentage}% complete</div>
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
      <div className="top5-edit">
        {items.map((item, index) => (
          <div key={index} className="top5-item-edit">
            <span className="top5-rank">{index + 1}</span>
            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => updateItem(index, 'name', e.target.value)}
              placeholder="Item name..."
            />
            <input
              type="number"
              value={item.value || item.count || 0}
              onChange={(e) => updateItem(index, item.value !== undefined ? 'value' : 'count', e.target.value)}
              placeholder="Count..."
              min="0"
            />
            <button onClick={() => removeItem(index)}><X size={16} /></button>
          </div>
        ))}
        <button onClick={addItem}><Plus size={16} /> Add Item</button>
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
