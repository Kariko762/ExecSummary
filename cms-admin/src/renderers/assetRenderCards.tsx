/**
 * Card Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';
import { Plus, X, DollarSign, Users, TrendingUp, Award, AlertTriangle, AlertCircle, Info, Target, Star, Rocket, BarChart3, Activity, Zap, Heart, CheckCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { renderWithExpressions } from '../../../src/utils/expressionParser';

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
      onChange?.([...items, { title: '', value: '', style: 'standard', icon: 'award', iconColor: 'eggplant' }]);
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
            {/* Top Control Row: Style controls + Remove button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', padding: '6px 8px', backgroundColor: 'var(--fis-fog)', borderRadius: '8px' }}>
              {/* Card Style Dropdown */}
              <div style={{ maxWidth: '100px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--fis-eggplant)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Roobert' }}>Card Style</label>
                <select
                  value={item.style || 'standard'}
                  onChange={(e) => updateCard(index, 'style', e.target.value)}
                  style={{ 
                    width: '100%', 
                    height: '24px', 
                    padding: '2px 4px', 
                    fontSize: '11px', 
                    borderRadius: '4px', 
                    border: '1px solid var(--fis-stone)',
                    fontWeight: 600
                  }}
                >
                  <option value="standard" style={{ background: 'white', color: 'black' }}>Standard</option>
                  <option value="highlight" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))', color: 'white', fontWeight: 700 }}>Highlight</option>
                  <option value="bold" style={{ background: 'var(--accent-blue)', color: 'white', fontWeight: 700 }}>Bold</option>
                  <option value="total" style={{ background: 'var(--semantic-success)', color: 'white', fontWeight: 800 }}>Total</option>
                </select>
              </div>
              
              {/* Card Icon Dropdown */}
              <div style={{ maxWidth: '100px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--fis-eggplant)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Roobert' }}>Icon</label>
                <select
                  value={item.icon || 'award'}
                  onChange={(e) => updateCard(index, 'icon', e.target.value)}
                  style={{ width: '100%', height: '24px', padding: '2px 4px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--fis-stone)' }}
                >
                  <option value="award">Award</option>
                  <option value="dollar">Dollar</option>
                  <option value="users">Users</option>
                  <option value="trending">Trending</option>
                  <option value="target">Target</option>
                  <option value="star">Star</option>
                  <option value="rocket">Rocket</option>
                  <option value="chart">Chart</option>
                  <option value="activity">Activity</option>
                  <option value="zap">Lightning</option>
                  <option value="heart">Heart</option>
                  <option value="check">Check</option>
                </select>
              </div>
              
              {/* Icon Colour Dropdown */}
              <div style={{ maxWidth: '100px' }}>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--fis-eggplant)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Roobert' }}>Icon Colour</label>
                <select
                  value={item.iconColor || 'eggplant'}
                  onChange={(e) => updateCard(index, 'iconColor', e.target.value)}
                  style={{ width: '100%', height: '24px', padding: '2px 4px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--fis-stone)' }}
                >
                  <option value="eggplant">Eggplant</option>
                  <option value="raspberry">Raspberry</option>
                  <option value="navy">Navy</option>
                  <option value="green">Green</option>
                  <option value="stone">Stone</option>
                  <option value="fog">Fog</option>
                </select>
              </div>
              
              {/* Remove Card Button (Right-aligned) */}
              <div style={{ marginLeft: 'auto', paddingTop: '16px' }}>
                <button
                  className="delete-button"
                  onClick={() => removeCard(index)}
                  style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <X size={14} /> Remove
                </button>
              </div>
            </div>
            
            {/* Card Content Inputs */}
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
          </div>
        ))}
        <button className="primary-action" onClick={addCard}>
          <Plus size={16} /> Add Metric
        </button>
      </div>
    );
  }
  
  // Icon mapping helper
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      award: <Award />,
      dollar: <DollarSign />,
      users: <Users />,
      trending: <TrendingUp />,
      target: <Target />,
      star: <Star />,
      rocket: <Rocket />,
      chart: <BarChart3 />,
      activity: <Activity />,
      zap: <Zap />,
      heart: <Heart />,
      check: <CheckCircle />
    };
    return icons[iconName] || <Award />;
  };
  
  // Color mapping helper
  const getColorVar = (colorName: string) => {
    const colors: Record<string, string> = {
      eggplant: 'var(--fis-eggplant)',
      raspberry: 'var(--fis-raspberry)',
      navy: 'var(--fis-navy)',
      green: 'var(--accent-green)',
      stone: 'var(--fis-stone)',
      fog: 'var(--fis-fog)'
    };
    return colors[colorName] || 'var(--fis-eggplant)';
  };
  
  // Style class mapping helper
  const getStyleClass = (styleName: string) => {
    const styles: Record<string, string> = {
      standard: '',
      highlight: 'metric-card-highlight',
      bold: 'metric-card-bold',
      total: 'metric-card-total'
    };
    return styles[styleName] || '';
  };
  
  return (
    <div className="metric-grid">
      {items.map((item, index) => {
        const styleClass = getStyleClass(item.style || 'standard');
        const iconColor = getColorVar(item.iconColor || 'eggplant');
        
        return (
          <div key={index} className={`metric-card ${styleClass}`}>
            <div className="icon" style={{ color: iconColor }}>{getIconComponent(item.icon || 'award')}</div>
            <div className="label">{item.title}</div>
            <div className="value">{item.value}</div>
          </div>
        );
      })}
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
          <div className="title">{renderWithExpressions(item.title)}</div>
          <div className="value">{renderWithExpressions(item.value)}</div>
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
    
    const moveUp = (index: number) => {
      if (index === 0) return;
      const updated = [...risks];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      onChange?.(updated);
    };
    
    const moveDown = (index: number) => {
      if (index === risks.length - 1) return;
      const updated = [...risks];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      onChange?.(updated);
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
                  value={risk?.type || 'medium-severity'}
                  onChange={(e) => updateRisk(index, 'type', e.target.value)}
                  style={{ width: '180px' }}
                >
                  <option value="high-impact">High Impact</option>
                  <option value="high-severity">High Severity</option>
                  <option value="medium-impact">Medium Impact</option>
                  <option value="medium-severity">Medium Severity</option>
                  <option value="low-impact">Low Impact</option>
                  <option value="low-severity">Low Severity</option>
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="secondary-action" 
                  onClick={() => moveUp(index)} 
                  disabled={index === 0}
                  style={{ flex: 1 }}
                >
                  <ChevronUp size={16} /> Move Up
                </button>
                <button 
                  className="secondary-action" 
                  onClick={() => moveDown(index)} 
                  disabled={index === risks.length - 1}
                  style={{ flex: 1 }}
                >
                  <ChevronDown size={16} /> Move Down
                </button>
                <button className="delete-button" onClick={() => removeRisk(index)} style={{ flex: 1 }}>
                  <X size={16} /> Remove
                </button>
              </div>
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
        const riskType = risk?.type || 'medium-severity';
        const [level, category] = riskType.split('-'); // e.g., "high-impact" -> ["high", "impact"]
        const isImpact = category === 'impact';
        const isSeverity = category === 'severity';
        
        // Icon selection based on level and category
        const Icon = level === 'high' ? AlertCircle : 
                     level === 'low' ? Info : 
                     AlertTriangle;
        
        return (
          <div key={index} className={`risk-card severity-${level}`}>
            <div className="icon">
              <Icon size={20} />
            </div>
            <div className="content">
              <div className={`badge badge-${category}-${level}`}>
                {level} {category}
              </div>
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
