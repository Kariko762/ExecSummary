/**
 * Card Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';
import { Plus, X, DollarSign, Users, TrendingUp, Award, AlertTriangle, AlertCircle } from 'lucide-react';

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
  if (mode === 'edit') {
    const updateField = (field: string, value: string) => {
      onChange?.({ ...data, [field]: value });
    };
    
    return (
      <div className="risk-edit">
        <select 
          value={data?.severity || 'medium'}
          onChange={(e) => updateField('severity', e.target.value)}
        >
          <option value="medium">Medium Severity</option>
          <option value="high">High Severity</option>
        </select>
        <input
          type="text"
          value={data?.title || ''}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Risk Title..."
        />
        <textarea
          value={data?.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Risk Description..."
          rows={3}
        />
        <textarea
          value={data?.mitigation || ''}
          onChange={(e) => updateField('mitigation', e.target.value)}
          placeholder="Mitigation Plan..."
          rows={3}
        />
      </div>
    );
  }
  
  const Icon = data?.severity === 'high' ? AlertCircle : AlertTriangle;
  
  return (
    <div className={`risk-card severity-${data?.severity || 'medium'}`}>
      <div className="icon">
        <Icon size={20} />
      </div>
      <div className="content">
        <div className="badge">{data?.severity || 'medium'} severity</div>
        <div className="title">{data?.title}</div>
        <div className="description">{data?.description}</div>
        <div className="mitigation-label">Mitigation:</div>
        <div className="mitigation">{data?.mitigation}</div>
      </div>
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
