import React from 'react';
import { RendererProps } from '../types/schema';
import { getClasses, DesignSystem } from '../design-system';

export const TextRenderer: React.FC<RendererProps> = ({
  fieldKey,
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
        {value || <span className="text-gray-400 italic">Not set</span>}
      </div>
    );
  }

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
        placeholder={schema.placeholder}
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
      
      {error && (
        <p className={`${getClasses.hint()} ${DesignSystem.status.error.text}`}>
          {error}
        </p>
      )}
    </div>
  );
};
