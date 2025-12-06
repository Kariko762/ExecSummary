import React from 'react';
import type { RendererProps } from '../types/schema';
import { getClasses, DesignSystem } from '../design-system';
import { Quote } from 'lucide-react';

export const QuoteRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  if (mode === 'display') {
    return (
      <div className="space-y-2">
        {schema.label && (
          <label className={`block ${getClasses.label()}`}>
            {schema.label}
          </label>
        )}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50/80 via-white/80 to-blue-50/80 dark:from-purple-900/20 dark:via-gray-800/80 dark:to-blue-900/20 backdrop-blur-sm border-l-4 border-r-4 border-fis-eggplant dark:border-fis-raspberry p-6 shadow-lg">
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
          
          {/* Content */}
          <div className="relative">
            <blockquote className="text-lg font-roobert-regular text-gray-800 dark:text-gray-200 italic leading-relaxed">
              {value || <span className="text-gray-400 italic not-italic">No quote provided</span>}
            </blockquote>
          </div>
        </div>
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
      
      <textarea
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled || !schema.enabled}
        placeholder={schema.placeholder || 'Enter quote text...'}
        rows={4}
        className={`${getClasses.input()} resize-y italic ${
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
