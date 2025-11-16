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
  
  return <span>{data}</span>;
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
  
  return <div className="whitespace-pre-wrap">{renderWithExpressions(data)}</div>;
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
  
  // Simple markdown parser (bold, italic) + expressions
  const renderRichText = (text: string) => {
    if (!text) return null;
    
    // First process expressions, then markdown
    const withExpressions = renderWithExpressions(text);
    
    // Replace **bold** with <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace *italic* with <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return <div className="whitespace-pre-wrap">{withExpressions}</div>;
  };
  
  return renderRichText(data);
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
    <div className="quote-wrapper">
      <blockquote className="quote-display">
        {renderWithExpressions(data)}
      </blockquote>
    </div>
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
    <div className="code-wrapper">
      <pre className="code-display">
        <code>{data}</code>
      </pre>
    </div>
  );
};
