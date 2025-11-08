import React from 'react';
import { RendererProps, FieldSchema } from '../types/schema';
import { Trash2, Plus } from 'lucide-react';
import { renderWithExpressions } from '../utils/expressionParser';

export const ObjectFormRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  const obj = value || {};
  const fields = schema.fields || {};

  if (mode === 'display') {
    return (
      <div className="space-y-3">
        {Object.entries(fields).map(([key, fieldSchema]) => {
          const fs = fieldSchema as FieldSchema;
          const fieldValue = obj[key];
          
          // Skip empty values
          if (fieldValue === null || fieldValue === undefined || fieldValue === '') 
            return null;

          return (
            <div key={key} className="flex flex-col space-y-1">
              <p className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry">
                {fs.label || key}:
              </p>
              <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                {Array.isArray(fieldValue) 
                  ? fieldValue.map((v, i) => (
                      <span key={i}>{renderWithExpressions(String(v))}{i < fieldValue.length - 1 ? ', ' : ''}</span>
                    ))
                  : renderWithExpressions(String(fieldValue))}
              </p>
            </div>
          );
        })}

        {Object.keys(fields).every(key => !obj[key]) && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No data available
          </p>
        )}
      </div>
    );
  }

  const handleFieldChange = (fieldKey: string, fieldValue: any) => {
    onChange?.({
      ...obj,
      [fieldKey]: fieldValue
    });
  };

  const renderField = (fieldKey: string, fieldSchema: FieldSchema) => {
    const fieldValue = obj[fieldKey];

    // Handle different render types
    switch (fieldSchema.renderAs) {
      case 'textarea': {
        return (
          <textarea
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            disabled={disabled || !schema.enabled}
            placeholder={fieldSchema.placeholder}
            rows={6}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry disabled:opacity-50 resize-y"
          />
        );
      }

      case 'number': {
        return (
          <input
            type="number"
            value={fieldValue ?? ''}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value === '' ? null : Number(e.target.value))}
            disabled={disabled || !schema.enabled}
            placeholder={fieldSchema.placeholder}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry disabled:opacity-50"
          />
        );
      }

      case 'list':
      case 'listNoTitle': {
        const listItems = fieldValue || [];
        const [newItem, setNewItem] = React.useState('');

        return (
          <div className="space-y-2">
            {listItems.map((item: string, index: number) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 group"
              >
                <span className="flex-1 text-sm text-gray-900 dark:text-white">
                  {item}
                </span>
                <button
                  onClick={() => {
                    const updated = listItems.filter((_: string, idx: number) => idx !== index);
                    handleFieldChange(fieldKey, updated);
                  }}
                  disabled={disabled}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-opacity disabled:opacity-0"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newItem.trim()) {
                    handleFieldChange(fieldKey, [...listItems, newItem.trim()]);
                    setNewItem('');
                  }
                }}
                disabled={disabled}
                placeholder={fieldSchema.placeholder || `Add ${fieldSchema.label || fieldKey}`}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry disabled:opacity-50"
              />
              <button
                onClick={() => {
                  if (newItem.trim()) {
                    handleFieldChange(fieldKey, [...listItems, newItem.trim()]);
                    setNewItem('');
                  }
                }}
                disabled={disabled || !newItem.trim()}
                className="px-3 py-2 text-sm font-roobert-medium text-white bg-fis-eggplant hover:bg-fis-eggplant/90 dark:bg-fis-raspberry dark:hover:bg-fis-raspberry/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      }

      default: {
        // Default to text input
        return (
          <input
            type="text"
            value={fieldValue || ''}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            disabled={disabled || !schema.enabled}
            placeholder={fieldSchema.placeholder}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry disabled:opacity-50"
          />
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      {schema.label && (
        <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300">
          {schema.label}
          {schema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700">
        {Object.entries(fields).map(([fieldKey, fieldSchema]) => {
          const fs = fieldSchema as FieldSchema;

          return (
            <div key={fieldKey} className="space-y-2">
              <label className="block text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry">
                {fs.label || fieldKey}:
                {fs.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {renderField(fieldKey, fs)}

              {fs.helpText && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {fs.helpText}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {schema.helpText && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {schema.helpText}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};
