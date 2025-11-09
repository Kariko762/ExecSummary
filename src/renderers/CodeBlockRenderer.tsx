import React from 'react';
import { RendererProps } from '../types/schema';
import { getClasses, DesignSystem } from '../design-system';
import { Copy, Check } from 'lucide-react';

export const CodeBlockRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (mode === 'display') {
    return (
      <div className="space-y-2">
        {schema.label && (
          <label className={`block ${getClasses.label()}`}>
            {schema.label}
          </label>
        )}
        <div className="relative group">
          <pre className="relative overflow-x-auto rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 border border-gray-700 dark:border-gray-800 shadow-2xl backdrop-blur-sm">
            <code className="text-sm font-mono text-gray-100 dark:text-gray-200 leading-relaxed">
              {value || 'No code provided'}
            </code>
          </pre>
          {value && (
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-gray-700/50 dark:hover:bg-gray-600/50 border border-white/20 dark:border-gray-600 backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-300 dark:text-gray-400" />
              )}
            </button>
          )}
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
        placeholder={schema.placeholder || 'Enter code here...'}
        rows={10}
        className={`${getClasses.input()} resize-y font-mono text-sm ${
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
