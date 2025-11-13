/**
 * Card Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';
import { Plus, X, DollarSign, Users, TrendingUp, Award, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface CardPatternProps {
  data: any;
  onChange?: (value: any) => void;
  mode: 'edit' | 'display';
}

// ==========================================
// METRIC CARD PATTERN
// ==========================================

export const MetricCardPattern: React.FC<CardPatternProps> = ({ data, onChange, mode }) => {
  const items = Array.isArray(data) ? data : [];
  
  if (mode === 'edit') {
    const addCard = () => {
      onChange?.([...items, { title: '', value: '' }]);
    };
    
    const removeCard = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updateCard = (index: number, field: string, value: string) => {
      const updated = [...items];
      updated[index] = { ...updated[index], [field]: value };
      onChange?.(updated);
    };
    
    return (
      <div>
        {items.map((item, index) => (
          <div key={index} className="edit-item-container">
            <input
              type="text"
              value={item.title || ''}
              onChange={(e) => updateCard(index, 'title', e.target.value)}
              placeholder="Metric Title..."
              style={{ marginBottom: '8px' }}
            />
            <input
              type="text"
              value={item.value || ''}
              onChange={(e) => updateCard(index, 'value', e.target.value)}
              placeholder="Value..."
              style={{ marginBottom: '12px' }}
            />
            <button className="delete-button" onClick={() => removeCard(index)} style={{ width: '100%' }}>
              <X size={16} /> Remove Card
            </button>
          </div>
        ))}
        <button className="primary-action" onClick={addCard}>
          <Plus size={16} /> Add Metric
        </button>
      </div>
    );
  }
  
  // Icon mapping for display
  const getIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('revenue') || lowerTitle.includes('$')) return <DollarSign />;
    if (lowerTitle.includes('customer') || lowerTitle.includes('user')) return <Users />;
    if (lowerTitle.includes('growth') || lowerTitle.includes('%')) return <TrendingUp />;
    return <Award />;
  };
  
  return (
    <div className="metric-grid">
      {items.map((item, index) => (
        <div key={index} className="metric-card">
          <div className="icon">{getIcon(item.title)}</div>
          <div className="label">{item.title}</div>
          <div className="value">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// NESTED CARDS PATTERN (Array of Objects)
// ==========================================

export const NestedCardsPattern: React.FC<CardPatternProps> = ({ data, onChange, mode }) => {
  const items = Array.isArray(data) ? data : [];
  
  if (mode === 'edit') {
    const addCard = () => {
      onChange?.([...items, { title: '', value: '' }]);
    };
    
    const removeCard = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updateCard = (index: number, field: string, value: string) => {
      const updated = [...items];
      updated[index] = { ...updated[index], [field]: value };
      onChange?.(updated);
    };
    
    return (
      <div>
        {items.map((item, index) => (
          <div key={index} className="edit-item-container">
            <div className="edit-field-row" style={{ marginBottom: '8px' }}>
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateCard(index, 'title', e.target.value)}
                placeholder="Title..."
                style={{ flex: 1 }}
              />
              <button className="delete-button" onClick={() => removeCard(index)}>
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              value={item.value || ''}
              onChange={(e) => updateCard(index, 'value', e.target.value)}
              placeholder="Value..."
            />
          </div>
        ))}
        <button className="primary-action" onClick={addCard}>
          <Plus size={16} /> Add Card
        </button>
      </div>
    );
  }
  
  return (
    <div className="nested-cards-grid">
      {items.map((item, index) => (
        <div key={index} className="nested-card">
          <div className="title">{item.title}</div>
          <div className="value">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

// ==========================================
// RISK CARD PATTERN
// ==========================================

export const RiskCardPattern: React.FC<CardPatternProps> = ({ data, onChange, mode }) => {
  // Handle array of risks
  const risks = Array.isArray(data) ? data : [data];
  
  if (mode === 'edit') {
    const updateRisk = (index: number, field: string, value: string) => {
      const updated = [...risks];
      updated[index] = { ...updated[index], [field]: value };
      onChange?.(updated.length === 1 ? updated[0] : updated);
    };
    
    const addRisk = () => {
      const newRisk = { severity: 'medium', title: '', description: '', mitigation: '' };
      onChange?.([...risks, newRisk]);
    };
    
    const removeRisk = (index: number) => {
      const updated = risks.filter((_, i) => i !== index);
      onChange?.(updated.length === 1 ? updated[0] : updated);
    };
    
    return (
      <div>
        {risks.map((risk, index) => {
          const severityClass = `severity-${risk?.severity || 'medium'}`;
          return (
            <div key={index} className={`edit-item-container ${severityClass}`}>
              <div className="edit-field-row" style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  value={risk?.title || ''}
                  onChange={(e) => updateRisk(index, 'title', e.target.value)}
                  placeholder="Risk Title..."
                  style={{ flex: 1 }}
                />
                <select 
                  value={risk?.severity || 'medium'}
                  onChange={(e) => updateRisk(index, 'severity', e.target.value)}
                  style={{ width: '140px' }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <textarea
                value={risk?.description || ''}
                onChange={(e) => updateRisk(index, 'description', e.target.value)}
                placeholder="Risk Description..."
                rows={3}
                style={{ marginBottom: '12px' }}
              />
              <textarea
                value={risk?.mitigation || ''}
                onChange={(e) => updateRisk(index, 'mitigation', e.target.value)}
                placeholder="Mitigation Plan..."
                rows={3}
                style={{ marginBottom: '12px' }}
              />
              <button className="delete-button" onClick={() => removeRisk(index)} style={{ width: '100%' }}>
                <X size={16} /> Remove Risk
              </button>
            </div>
          );
        })}
        <button className="primary-action" onClick={addRisk}>
          <Plus size={16} /> Add Risk
        </button>
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {risks.map((risk, index) => {
        // Icon selection based on severity
        const Icon = risk?.severity === 'high' ? AlertCircle : 
                     risk?.severity === 'low' ? Info : 
                     AlertTriangle;
        
        return (
          <div key={index} className={`risk-card severity-${risk?.severity || 'medium'}`}>
            <div className="icon">
              <Icon size={20} />
            </div>
            <div className="content">
              <div className="badge">{risk?.severity || 'medium'} severity</div>
              <div className="title">{risk?.title}</div>
              <div className="description">{risk?.description}</div>
              <div className="mitigation-label">Mitigation:</div>
              <div className="mitigation">{risk?.mitigation}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// OUTLOOK CARD PATTERN
// ==========================================

export const OutlookCardPattern: React.FC<CardPatternProps> = ({ data, onChange, mode }) => {
  if (mode === 'edit') {
    const updateField = (field: string, value: string) => {
      onChange?.({ ...data, [field]: value });
    };
    
    return (
      <div>
        <input
          type="text"
          value={data?.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Outlook Title..."
          style={{ marginBottom: '12px' }}
        />
        <textarea
          value={data?.content || ''}
          onChange={(e) => updateField('content', e.target.value)}
          placeholder="Outlook Content..."
          rows={6}
        />
      </div>
    );
  }
  
  return (
    <div className="outlook-card">
      <div className="icon-large">📊</div>
      <h3>{data?.title}</h3>
      <p>{data?.content}</p>
    </div>
  );
};

// ==========================================
// CATEGORY LIST PATTERN (Colored Boxes)
// ==========================================

export const CategoryListPattern: React.FC<CardPatternProps> = ({ data, onChange, mode }) => {
  const categories = Array.isArray(data) ? data : [];
  
  if (mode === 'edit') {
    const addCategory = () => {
      onChange?.([...categories, { name: '', color: 'green', items: [] }]);
    };
    
    const removeCategory = (index: number) => {
      onChange?.(categories.filter((_, i) => i !== index));
    };
    
    const updateCategory = (index: number, field: string, value: any) => {
      const updated = [...categories];
      updated[index] = { ...updated[index], [field]: value };
      onChange?.(updated);
    };
    
    const addItem = (catIndex: number) => {
      const updated = [...categories];
      updated[catIndex].items = [...(updated[catIndex].items || []), ''];
      onChange?.(updated);
    };
    
    const removeItem = (catIndex: number, itemIndex: number) => {
      const updated = [...categories];
      updated[catIndex].items = updated[catIndex].items.filter((_: any, i: number) => i !== itemIndex);
      onChange?.(updated);
    };
    
    const updateItem = (catIndex: number, itemIndex: number, value: string) => {
      const updated = [...categories];
      updated[catIndex].items[itemIndex] = value;
      onChange?.(updated);
    };
    
    return (
      <div>
        {categories.map((category, catIndex) => (
          <div key={catIndex} className="edit-item-container">
            <div className="edit-field-row" style={{ marginBottom: '12px' }}>
              <input
                type="text"
                value={category.name || ''}
                onChange={(e) => updateCategory(catIndex, 'name', e.target.value)}
                placeholder="Category Name..."
                style={{ flex: 1 }}
              />
              <select
                value={category.color || 'green'}
                onChange={(e) => updateCategory(catIndex, 'color', e.target.value)}
                style={{ width: '120px' }}
              >
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              {(category.items || []).map((item: string, itemIndex: number) => (
                <div key={itemIndex} className="edit-list-item">
                  <div className="edit-icon">•</div>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateItem(catIndex, itemIndex, e.target.value)}
                    placeholder="Item..."
                    style={{ flex: 1 }}
                  />
                  <button className="delete-button" onClick={() => removeItem(catIndex, itemIndex)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button className="secondary-action" onClick={() => addItem(catIndex)} style={{ width: '100%', marginTop: '8px' }}>
                <Plus size={16} /> Add Item
              </button>
            </div>
            
            <button className="delete-button" onClick={() => removeCategory(catIndex)} style={{ width: '100%' }}>
              <X size={16} /> Remove Category
            </button>
          </div>
        ))}
        <button className="primary-action" onClick={addCategory}>
          <Plus size={16} /> Add Category
        </button>
      </div>
    );
  }
  
  return (
    <div className="category-list">
      {categories.map((category, index) => (
        <div key={index} className={`category-box color-${category.color}`}>
          <h4>{category.name}</h4>
          <ul>
            {(category.items || []).map((item: string, itemIndex: number) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
