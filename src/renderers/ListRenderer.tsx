import React, { useState } from 'react';
import { RendererProps } from '../types/schema';
import { Plus, Trash2 } from 'lucide-react';
import { getClasses } from '../design-system';
import { renderWithExpressions } from '../utils/expressionParser';

export const ListRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  const [newItem, setNewItem] = useState('');
  
  // Determine if this is a key-value list (object) or simple list (array)
  const isKeyValue = value && typeof value === 'object' && !Array.isArray(value);
  const items = Array.isArray(value) ? value : [];
  const kvPairs = isKeyValue ? Object.entries(value) : [];
  const showTitle = schema.renderAs !== 'listNoTitle';

  if (mode === 'display') {
    if (isKeyValue) {
      // Display key-value pairs (LABEL : VALUE format)
      return (
        <div className="space-y-1.5">
          {kvPairs.length > 0 ? (
            kvPairs.map(([key, val], idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <span className="text-sm font-roobert-light text-fis-eggplant dark:text-fis-raspberry">{key}:</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{renderWithExpressions(String(val))}</span>
              </div>
            ))
          ) : (
            <span className="text-gray-400 italic text-sm">No items</span>
          )}
        </div>
      );
    }
    
    // Display simple list
    return (
      <div className="space-y-2">
        {showTitle && schema.label && (
          <div className={`${getClasses.h2()} mb-2`}>{schema.label}</div>
        )}
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-fis-raspberry">•</span>
              <span>{renderWithExpressions(item)}</span>
            </div>
          ))
        ) : (
          <span className="text-gray-400 italic text-sm">No items</span>
        )}
      </div>
    );
  }

  const handleAdd = () => {
    if (newItem.trim()) {
      const updated = [...items, newItem.trim()];
      onChange?.(updated);
      setNewItem('');
    }
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    onChange?.(updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {showTitle && schema.label && (
        <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
          {schema.label}
          {schema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Add new item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder={schema.placeholder || 'Add new item...'}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry disabled:opacity-50"
        />
        <button
          onClick={handleAdd}
          disabled={disabled || !newItem.trim()}
          className="px-4 py-2 rounded-lg bg-fis-eggplant hover:bg-fis-eggplant/90 text-white font-roobert-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* List items */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 group"
            >
              <div className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                {item}
              </div>
              {!disabled && (
                <button
                  onClick={() => handleRemove(index)}
                  className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

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

      {items.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          No items added yet
        </p>
      )}
    </div>
  );
};
