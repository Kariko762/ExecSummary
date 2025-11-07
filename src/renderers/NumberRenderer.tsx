import React from 'react';
import { RendererProps } from '../types/schema';
import { getClasses, DesignSystem } from '../design-system';

export const NumberRenderer: React.FC<RendererProps> = ({
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
        {value !== null && value !== undefined ? value : <span className="text-gray-400 italic">Not set</span>}
      </div>
    );
  }

  // Find min/max validation rules
  const minRule = schema.validation?.find(v => v.rule === 'min');
  const maxRule = schema.validation?.find(v => v.rule === 'max');

  return (
    <div className="space-y-2">
      {schema.label && (
        <label className={`block ${getClasses.label()}`}>
          {schema.label}:
          {schema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value === '' ? null : Number(e.target.value))}
        disabled={disabled || !schema.enabled}
        placeholder={schema.placeholder}
        min={minRule?.value}
        max={maxRule?.value}
        className={`${getClasses.input()} ${
          error 
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
            : ''
        }`}
      />
      
      {schema.helpText && !error && (
        <p className={getClasses.hint()}>
          {schema.helpText}
          {minRule && maxRule && ` (${minRule.value} - ${maxRule.value})`}
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
