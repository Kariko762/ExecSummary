import React, { useState } from 'react';
import { RendererProps, FieldSchema } from '../types/schema';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { renderWithExpressions } from '../utils/expressionParser';

export const NestedCardsRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  const items = value || [];
  const fields = schema.fields || {};
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (mode === 'display') {
    return (
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No items
          </p>
        ) : (
          items.map((item: any, index: number) => {
            // Get the category name (first field that's a string)
            const categoryField = Object.entries(fields).find(([key]) => typeof item[key] === 'string');
            const categoryName = categoryField ? item[categoryField[0]] : `Item ${index + 1}`;

            return (
              <div
                key={index}
                className="rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Category Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-fis-eggplant/10 to-fis-raspberry/10 dark:from-fis-eggplant/20 dark:to-fis-raspberry/20 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-roobert-heavy text-gray-900 dark:text-white">
                    {categoryName}
                  </h4>
                </div>

                {/* Metrics Grid */}
                <div className="p-4">
                  {Object.entries(fields).map(([key, fieldSchema]) => {
                    const fieldValue = item[key];
                    
                    // Skip category field (already shown in header)
                    if (key === categoryField?.[0]) return null;
                    
                    // Skip empty values
                    if (fieldValue === null || fieldValue === undefined || fieldValue === '') 
                      return null;

                    // Handle nested metrics array
                    if (Array.isArray(fieldValue) && fieldValue.length > 0 && typeof fieldValue[0] === 'object') {
                      return (
                        <div key={key} className="grid grid-cols-2 gap-3">
                          {fieldValue.map((metric: any, metricIndex: number) => (
                            <div
                              key={metricIndex}
                              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
                            >
                              <p className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry mb-1">
                                {metric.label || `Metric ${metricIndex + 1}`}
                              </p>
                              <p className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
                                {typeof metric.value === 'number' 
                                  ? metric.value.toLocaleString()
                                  : metric.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // Regular field rendering
                    return (
                      <div key={key} className="mb-2">
                        <p className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry">
                          {(fieldSchema as FieldSchema).label || key}:
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {Array.isArray(fieldValue) 
                            ? fieldValue.map((v, i) => (
                                <span key={i}>{renderWithExpressions(String(v))}{i < fieldValue.length - 1 ? ', ' : ''}</span>
                              ))
                            : renderWithExpressions(String(fieldValue))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  const createEmptyItem = () => {
    const newItem: any = {};
    Object.keys(fields).forEach(key => {
      const fieldSchema = fields[key] as FieldSchema;
      if (fieldSchema.renderAs === 'list' || fieldSchema.renderAs === 'listNoTitle') {
        newItem[key] = [];
      } else {
        newItem[key] = '';
      }
    });
    return newItem;
  };

  const handleAdd = () => {
    const updated = [...items, createEmptyItem()];
    onChange?.(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_: any, idx: number) => idx !== index);
    onChange?.(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const handleFieldChange = (itemIndex: number, fieldKey: string, fieldValue: any) => {
    const updated = [...items];
    updated[itemIndex] = {
      ...updated[itemIndex],
      [fieldKey]: fieldValue
    };
    onChange?.(updated);
  };

  const getItemTitle = (item: any) => {
    // Try to find a good title field (name, title, label, category)
    return item.name || item.title || item.label || item.category || 'Untitled Item';
  };

  return (
    <div className="space-y-4">
      {/* Add button at top - no title as it's shown in section header */}
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fis-eggplant hover:bg-fis-eggplant/90 text-white font-roobert-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-8 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-300 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            No items yet
          </p>
          <button
            onClick={handleAdd}
            disabled={disabled}
            className="inline-flex items-center px-4 py-2 text-sm font-roobert-medium text-fis-eggplant dark:text-fis-raspberry hover:bg-fis-eggplant/10 dark:hover:bg-fis-raspberry/10 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, index: number) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50">
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="flex items-center space-x-2 flex-1 text-left group"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    )}
                    <span className="text-sm font-roobert-medium text-gray-900 dark:text-white">
                      {getItemTitle(item)}
                    </span>
                  </button>
                  <button
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                    {Object.entries(fields).map(([fieldKey, fieldSchema]) => {
                      const fs = fieldSchema as FieldSchema;
                      const fieldValue = item[fieldKey];

                      // Handle nested array of objects (like metrics)
                      if (fs.renderAs === 'list' && fs.fields && Array.isArray(fieldValue)) {
                        const metricItems = fieldValue || [];
                        
                        return (
                          <div key={fieldKey} className="space-y-2">
                            <label className="block text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry">
                              {fs.label || fieldKey}:
                              {fs.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            
                            {/* Metric Cards */}
                            <div className="space-y-2">
                              {metricItems.map((metric: any, metricIdx: number) => (
                                <div
                                  key={metricIdx}
                                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group"
                                >
                                  <div className="flex items-start gap-2">
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Label</label>
                                        <input
                                          type="text"
                                          value={metric.label || ''}
                                          onChange={(e) => {
                                            const updated = [...metricItems];
                                            updated[metricIdx] = { ...metric, label: e.target.value };
                                            handleFieldChange(index, fieldKey, updated);
                                          }}
                                          placeholder="Metric name"
                                          className="w-full mt-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fis-raspberry"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-gray-500 dark:text-gray-400">Value</label>
                                        <input
                                          type="number"
                                          value={metric.value || ''}
                                          onChange={(e) => {
                                            const updated = [...metricItems];
                                            updated[metricIdx] = { ...metric, value: parseFloat(e.target.value) || 0 };
                                            handleFieldChange(index, fieldKey, updated);
                                          }}
                                          placeholder="0"
                                          className="w-full mt-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fis-raspberry"
                                        />
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const updated = metricItems.filter((_: any, idx: number) => idx !== metricIdx);
                                        handleFieldChange(index, fieldKey, updated);
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                      title="Remove metric"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Add Metric Button */}
                              <button
                                onClick={() => {
                                  const updated = [...metricItems, { label: '', value: 0 }];
                                  handleFieldChange(index, fieldKey, updated);
                                }}
                                className="w-full px-3 py-2 text-sm font-roobert-medium text-fis-eggplant dark:text-fis-raspberry hover:bg-fis-eggplant/10 dark:hover:bg-fis-raspberry/10 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add Metric
                              </button>
                            </div>
                          </div>
                        );
                      }

                      if (fs.renderAs === 'list' || fs.renderAs === 'listNoTitle') {
                        // Simple string list
                        const listItems = fieldValue || [];
                        const [newListItem, setNewListItem] = useState('');

                        return (
                          <div key={fieldKey} className="space-y-2">
                            <label className="block text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry">
                              {fs.label || fieldKey}:
                              {fs.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <div className="space-y-2">
                              {listItems.map((listItem: string, listIdx: number) => (
                                <div
                                  key={listIdx}
                                  className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 group"
                                >
                                  <span className="flex-1 text-sm text-gray-900 dark:text-white">
                                    {listItem}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const updatedList = listItems.filter((_: string, idx: number) => idx !== listIdx);
                                      handleFieldChange(index, fieldKey, updatedList);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={newListItem}
                                  onChange={(e) => setNewListItem(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newListItem.trim()) {
                                      handleFieldChange(index, fieldKey, [...listItems, newListItem.trim()]);
                                      setNewListItem('');
                                    }
                                  }}
                                  placeholder={fs.placeholder || `Add ${fs.label || fieldKey}`}
                                  className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry"
                                />
                                <button
                                  onClick={() => {
                                    if (newListItem.trim()) {
                                      handleFieldChange(index, fieldKey, [...listItems, newListItem.trim()]);
                                      setNewListItem('');
                                    }
                                  }}
                                  className="px-3 py-1.5 text-sm font-roobert-medium text-white bg-fis-eggplant hover:bg-fis-eggplant/90 dark:bg-fis-raspberry dark:hover:bg-fis-raspberry/90 rounded-lg transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Regular text/textarea field
                      const isTextarea = fs.renderAs === 'textarea';
                      return (
                        <div key={fieldKey}>
                          <label className="block text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry mb-2">
                            {fs.label || fieldKey}:
                            {fs.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {isTextarea ? (
                            <textarea
                              value={fieldValue || ''}
                              onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                              disabled={disabled}
                              placeholder={fs.placeholder}
                              rows={4}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry disabled:opacity-50 resize-y"
                            />
                          ) : (
                            <input
                              type="text"
                              value={fieldValue || ''}
                              onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                              disabled={disabled}
                              placeholder={fs.placeholder}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-eggplant dark:focus:ring-fis-raspberry disabled:opacity-50"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
    </div>
  );
};
