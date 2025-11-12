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
      <div className="metric-grid">
        {items.map((item, index) => (
          <div key={index} className="metric-edit-card">
            <input
              type="text"
              value={item.title || ''}
              onChange={(e) => updateCard(index, 'title', e.target.value)}
              placeholder="Metric Title..."
            />
            <input
              type="text"
              value={item.value || ''}
              onChange={(e) => updateCard(index, 'value', e.target.value)}
              placeholder="Value..."
            />
            <button onClick={() => removeCard(index)}><X size={16} /></button>
          </div>
        ))}
        <button onClick={addCard}><Plus size={16} /> Add Metric</button>
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
          <div key={index} className="nested-card-edit">
            <input
              type="text"
              value={item.title || ''}
              onChange={(e) => updateCard(index, 'title', e.target.value)}
              placeholder="Title..."
            />
            <input
              type="text"
              value={item.value || ''}
              onChange={(e) => updateCard(index, 'value', e.target.value)}
              placeholder="Value..."
            />
            <button onClick={() => removeCard(index)}><X size={16} /></button>
          </div>
        ))}
        <button onClick={addCard}><Plus size={16} /> Add Card</button>
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
      <div className="risk-edit-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {risks.map((risk, index) => (
          <div key={index} className="risk-edit" style={{ position: 'relative', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
            {risks.length > 1 && (
              <button
                onClick={() => removeRisk(index)}
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.25rem' }}
              >
                <X size={16} />
              </button>
            )}
            <select 
              value={risk?.severity || 'medium'}
              onChange={(e) => updateRisk(index, 'severity', e.target.value)}
            >
              <option value="low">Low Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="high">High Severity</option>
            </select>
            <input
              type="text"
              value={risk?.title || ''}
              onChange={(e) => updateRisk(index, 'title', e.target.value)}
              placeholder="Risk Title..."
            />
            <textarea
              value={risk?.description || ''}
              onChange={(e) => updateRisk(index, 'description', e.target.value)}
              placeholder="Risk Description..."
              rows={3}
            />
            <textarea
              value={risk?.mitigation || ''}
              onChange={(e) => updateRisk(index, 'mitigation', e.target.value)}
              placeholder="Mitigation Plan..."
              rows={3}
            />
          </div>
        ))}
        <button
          onClick={addRisk}
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
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
      <div className="outlook-edit">
        <input
          type="text"
          value={data?.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Outlook Title..."
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
          <div key={catIndex} className="category-edit">
            <input
              type="text"
              value={category.name || ''}
              onChange={(e) => updateCategory(catIndex, 'name', e.target.value)}
              placeholder="Category Name..."
            />
            <select
              value={category.color || 'green'}
              onChange={(e) => updateCategory(catIndex, 'color', e.target.value)}
            >
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
            </select>
            
            <div className="category-items">
              {(category.items || []).map((item: string, itemIndex: number) => (
                <div key={itemIndex}>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateItem(catIndex, itemIndex, e.target.value)}
                    placeholder="Item..."
                  />
                  <button onClick={() => removeItem(catIndex, itemIndex)}><X size={16} /></button>
                </div>
              ))}
              <button onClick={() => addItem(catIndex)}><Plus size={16} /> Add Item</button>
            </div>
            
            <button onClick={() => removeCategory(catIndex)}>Remove Category</button>
          </div>
        ))}
        <button onClick={addCategory}><Plus size={16} /> Add Category</button>
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
