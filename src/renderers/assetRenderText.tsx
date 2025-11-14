/**
 * Text Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';
import { renderWithExpressions } from '../utils/expressionParser';

export interface TextPatternProps {
  data: any;
  onChange?: (value: any) => void;
  mode: 'edit' | 'display';
}

// ==========================================
// TEXT INPUT PATTERN
// ==========================================

export const TextPattern: React.FC<TextPatternProps> = ({ data, onChange, mode }) => {
  if (mode === 'edit') {
    return (
      <input
        type="text"
        value={data || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Enter text..."
      />
    );
  }
  
  return <span>{renderWithExpressions(data || '')}</span>;
};

// ==========================================
// TEXTAREA PATTERN
// ==========================================

export const TextareaPattern: React.FC<TextPatternProps> = ({ data, onChange, mode }) => {
  if (mode === 'edit') {
    return (
      <textarea
        value={data || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Enter longer text..."
        rows={4}
      />
    );
  }
  
  return <p>{renderWithExpressions(data || '')}</p>;
};

// ==========================================
// RICH TEXT PATTERN
// ==========================================

export const RichTextPattern: React.FC<TextPatternProps> = ({ data, onChange, mode }) => {
  if (mode === 'edit') {
    return (
      <textarea
        value={data || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Enter rich text with **bold** and *italic*..."
        rows={6}
      />
    );
  }
  
  return <div className="rich-text">{renderWithExpressions(data || '')}</div>;
};

// ==========================================
// QUOTE PATTERN
// ==========================================

export const QuotePattern: React.FC<TextPatternProps> = ({ data, onChange, mode }) => {
  if (mode === 'edit') {
    return (
      <textarea
        value={data || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Enter quote text..."
        rows={3}
      />
    );
  }
  
  return (
    <blockquote>
      <p>{renderWithExpressions(data || '')}</p>
    </blockquote>
  );
};

// ==========================================
// CODE BLOCK PATTERN
// ==========================================

export const CodeBlockPattern: React.FC<TextPatternProps> = ({ data, onChange, mode }) => {
  if (mode === 'edit') {
    return (
      <textarea
        value={data || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Enter code..."
        rows={6}
        style={{ fontFamily: 'monospace' }}
      />
    );
  }
  
  return (
    <pre>
      <code>{data}</code>
    </pre>
  );
};
