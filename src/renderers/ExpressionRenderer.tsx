import React from 'react';
import { RendererProps } from '../types/schema';
import { getClasses, DesignSystem } from '../design-system';
import { renderWithExpressions } from '../utils/expressionParser';

/**
 * Expression Renderer - Displays text with expression syntax
 * Uses expressionParser to render {{currency:1000}}, {{percent:50}}, etc.
 */
export const ExpressionRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  if (mode === 'display') {
    return (
      <div className={getClasses.text()}>
        {value ? (
          renderWithExpressions(value as string)
        ) : (
          <span className="text-gray-400 italic">Not set</span>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="space-y-2">
      {schema.label && (
        <label className={`block ${getClasses.label()}`}>
          {schema.label}:
          {schema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled || !schema.enabled}
        placeholder={schema.placeholder || 'Example: {{currency:1000}} revenue {{trend:up}}'}
        className={`${getClasses.input()} ${
          error 
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
            : ''
        }`}
      />
      
      {schema.helpText && !error && (
        <p className={getClasses.hint()}>
          {schema.helpText}
        </p>
      )}

      {!schema.helpText && !error && (
        <p className={getClasses.hint()}>
          Supports expressions: {'{{'} currency:value {'}}'}, {'{{'} percent:value {'}}'}, {'{{'} trend:up/down {'}}'}, etc.
        </p>
      )}
      
      {error && (
        <p className={`${getClasses.hint()} ${DesignSystem.status.error.text}`}>
          {error}
        </p>
      )}
    </div>
  );
};
