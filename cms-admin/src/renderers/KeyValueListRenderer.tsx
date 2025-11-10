import React, { useState } from 'react';
import { RendererProps } from '../types/schema';
import { Plus, Trash2 } from 'lucide-react';
import { getClasses } from '../design-system';
import { renderWithExpressions } from '../utils/expressionParser';

/**
 * KeyValueListRenderer - Dynamic key-value pairs with add/remove functionality
 * Display: Shows "Label: Value" format with purple labels
 * Edit: Allows adding/removing key-value pairs
 */
export const KeyValueListRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  
  const kvPairs = Object.entries(value || {});

  // Display mode - show key-value pairs
  if (mode === 'display') {
    return (
      <div className="space-y-1.5">
        {kvPairs.length > 0 ? (
          kvPairs.map(([key, val], idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-sm font-roobert-light text-fis-eggplant dark:text-fis-raspberry">
                {key}:
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {renderWithExpressions(String(val))}
              </span>
            </div>
          ))
        ) : (
          <span className="text-gray-400 italic text-sm">No items</span>
        )}
      </div>
    );
  }

  // Edit mode - allow adding/removing pairs
  const handleAdd = () => {
    if (newLabel.trim() && newValue.trim()) {
      onChange?.({
        ...value,
        [newLabel.trim()]: newValue.trim()
      });
      setNewLabel('');
      setNewValue('');
    }
  };

  const handleRemove = (key: string) => {
    const updated = { ...value };
    delete updated[key];
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
      {schema.label && (
        <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
          {schema.label}
          {schema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Add new pair */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder="Label..."
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry disabled:opacity-50"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder="Value..."
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry disabled:opacity-50"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={disabled || !newLabel.trim() || !newValue.trim()}
          className="w-full px-4 py-2 rounded-lg bg-fis-eggplant hover:bg-fis-eggplant/90 text-white font-roobert-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Pair
        </button>
      </div>

      {/* Existing pairs */}
      {kvPairs.length > 0 && (
        <div className="space-y-2">
          {kvPairs.map(([key, val], index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 group"
            >
              <div className="flex-1 space-y-1">
                <div className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry">
                  {key}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {String(val)}
                </div>
              </div>
              {!disabled && (
                <button
                  onClick={() => handleRemove(key)}
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
        <p className={getClasses.hint()}>
          {schema.helpText}
        </p>
      )}

      {error && (
        <p className={`${getClasses.hint()} text-red-600 dark:text-red-400`}>
          {error}
        </p>
      )}

      {kvPairs.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 italic">
          No pairs added yet
        </p>
      )}
    </div>
  );
};
