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
    // Check if this is a simple card list (like title/value pairs) vs complex nested structure
    const isSimpleCardList = items.length > 0 && 
                             Object.keys(fields).length <= 3 && 
                             !Object.values(fields).some((f: any) => 
                               f.renderAs === 'list' || f.renderAs === 'listNoTitle' || Array.isArray(items[0]?.[Object.keys(fields)[0]])
                             );

    if (items.length === 0) {
      return (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          No items
        </p>
      );
    }

    // Render simple cards in a horizontal grid (for title/value style cards)
    if (isSimpleCardList) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item: any, index: number) => {
            const firstField = Object.keys(fields)[0];
            const secondField = Object.keys(fields)[1];
            const title = item[firstField] || `Item ${index + 1}`;
            const value = item[secondField] || '';

            return (
              <div
                key={index}
                className="p-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-fis-eggplant/40 dark:hover:border-fis-raspberry/40 transition-all"
              >
                <p className="text-xs font-roobert-semibold text-fis-eggplant dark:text-fis-raspberry uppercase tracking-wider mb-2">
                  {renderWithExpressions(title)}
                </p>
                <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                  {renderWithExpressions(value)}
                </p>
                {/* Show any additional fields */}
                {Object.keys(fields).slice(2).map(key => {
                  const fieldValue = item[key];
                  if (!fieldValue) return null;
                  return (
                    <p key={key} className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {renderWithExpressions(String(fieldValue))}
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    }

    // Render complex cards vertically (for cards with lists, nested data, etc.)
    return (
      <div className="space-y-4">
        {items.map((item: any, index: number) => {
          // Get the category name (first field that's a string)
          const categoryField = Object.entries(fields).find(([key]) => typeof item[key] === 'string');
          const categoryName = categoryField ? item[categoryField[0]] : `Item ${index + 1}`;

          return (
            <div
              key={index}
              className="rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/70 dark:to-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-lg shadow-fis-eggplant/5 dark:shadow-fis-raspberry/5 overflow-hidden transition-all hover:shadow-xl hover:shadow-fis-eggplant/10 dark:hover:shadow-fis-raspberry/10"
            >
              {/* Category Header with gradient */}
              <div className="px-6 py-5 bg-gradient-to-r from-fis-eggplant via-fis-eggplant/90 to-fis-raspberry border-b border-fis-eggplant/20">
                <h4 className="text-base font-roobert-heavy text-white tracking-wide">
                  {categoryName}
                </h4>
              </div>

              {/* Metrics Grid */}
              <div className="p-5">
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
                      <div key={key} className="grid grid-cols-2 gap-4 mb-4">
                        {fieldValue.map((metric: any, metricIndex: number) => (
                          <div
                            key={metricIndex}
                            className="p-4 rounded-lg bg-white dark:bg-gray-900/60 border border-fis-eggplant/20 dark:border-fis-raspberry/20 shadow-sm hover:border-fis-eggplant/40 dark:hover:border-fis-raspberry/40 transition-all"
                          >
                            <p className="text-xs font-roobert-semibold text-fis-eggplant dark:text-fis-raspberry uppercase tracking-wider mb-2">
                              {metric.label || `Metric ${metricIndex + 1}`}
                            </p>
                            <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
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
                    <div key={key} className="mb-3 pb-3 border-b border-fis-eggplant/20 dark:border-fis-raspberry/20 last:border-0 last:mb-0 last:pb-0">
                      <p className="text-xs font-roobert-semibold text-fis-eggplant dark:text-fis-raspberry uppercase tracking-wider mb-1">
                        {(fieldSchema as FieldSchema).label || key}
                      </p>
                      <p className="text-sm font-roobert-medium text-gray-900 dark:text-white leading-relaxed">
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
        })}
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
                      // Check if fieldSchema has explicit fields OR if the data contains objects
                      const isObjectArray = Array.isArray(fieldValue) && 
                                          fieldValue.length > 0 && 
                                          typeof fieldValue[0] === 'object' &&
                                          fieldValue[0] !== null;
                      
                      const hasFieldsSchema = fs.fields && typeof fs.fields === 'object';
                      
                      // Render as nested cards if: has explicit fields schema OR data shows it's object array
                      if ((fs.renderAs === 'list' || fs.renderAs === 'listNoTitle') && (isObjectArray || hasFieldsSchema)) {
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
                        // Simple string list (not objects)
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
