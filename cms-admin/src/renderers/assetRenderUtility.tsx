/**
 * Utility Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';

export interface UtilityPatternProps {
  data: any;
  onChange?: (value: any) => void;
  mode: 'edit' | 'display';
}

// ==========================================
// HORIZONTAL RULE PATTERN
// ==========================================

export const HrPattern: React.FC<UtilityPatternProps> = ({ data, onChange, mode }) => {
  if (mode === 'edit') {
    const updateStyle = (style: string) => {
      onChange?.({ style });
    };
    
    return (
      <div className="hr-edit">
        <label>Line Style:</label>
        <select
          value={data?.style || 'solid'}
          onChange={(e) => updateStyle(e.target.value)}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>
    );
  }
  
  return <hr className={`hr-${data?.style || 'solid'}`} />;
};

// ==========================================
// NUMBER PATTERN (Large Display)
// ==========================================

export const NumberPattern: React.FC<UtilityPatternProps> = ({ data, onChange, mode }) => {
  if (mode === 'edit') {
    const updateField = (field: string, value: string) => {
      onChange?.({ ...data, [field]: value });
    };
    
    return (
      <div className="number-edit">
        <input
          type="text"
          value={data?.value || ''}
          onChange={(e) => updateField('value', e.target.value)}
          placeholder="Number value..."
        />
        <input
          type="text"
          value={data?.label || ''}
          onChange={(e) => updateField('label', e.target.value)}
          placeholder="Label (optional)..."
        />
        <input
          type="text"
          value={data?.suffix || ''}
          onChange={(e) => updateField('suffix', e.target.value)}
          placeholder="Suffix (e.g., %, M, B)..."
        />
      </div>
    );
  }
  
  return (
    <div className="number-display">
      <div className="number-value">
        {data?.value || data || 0}
        {data?.suffix && <span className="suffix">{data?.suffix}</span>}
      </div>
      {data?.label && <div className="number-label">{data?.label}</div>}
    </div>
  );
};

// ==========================================
// SPACER PATTERN (Layout Utility)
// ==========================================

export const SpacerPattern: React.FC<UtilityPatternProps> = ({ mode }) => {
  if (mode === 'edit') {
    // In edit mode, show a visual indicator
    return (
      <div className="spacer-edit">
        <div className="spacer-indicator">
          <span>Empty Space</span>
        </div>
      </div>
    );
  }
  
  // In display mode, render nothing (just empty space)
  return <div className="spacer-display"></div>;
};
