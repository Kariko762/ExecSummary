import React from 'react';
import type { RendererProps } from '../types/schema';
import { Plus, Trash2 } from 'lucide-react';
import { getClasses } from '../design-system';

/**
 * Generic Table Layout Renderer
 * Displays items in columns based on a configurable grouping field
 * Completely configurable via schema - no hardcoded business logic
 * 
 * Schema configuration:
 * - groupByField: Which field to group items by (e.g., 'status', 'phase', 'category')
 * - columns: Array of column definitions with key, label, optional icon, color
 * - itemSchema.fields: Field definitions with displayAs property
 * 
 * Field displayAs options:
 * - 'title': Main heading of the card
 * - 'subtitle': Secondary text below title
 * - 'badge': Colored badge (top right)
 * - 'label-value': Label-value pair
 * - 'detail': Small text at bottom
 * 
 * Badge colors configured via field.badgeColors object
 */
export const TableLayoutRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  const items = Array.isArray(value) ? value : [];
  
  // Configuration from schema
  const groupByField = schema.groupByField || 'status';
  const columns = schema.columns || [];
  const itemSchema = schema.itemSchema || {};
  const fields = itemSchema.fields || {};
  
  // Column configuration map
  const columnConfig = columns.reduce((acc: any, col: any) => {
    acc[col.key] = col;
    return acc;
  }, {});

  // Group items by the specified field
  const groupedItems = columns.reduce((acc: any, col: any) => {
    acc[col.key] = items.filter((item: any) => item[groupByField] === col.key);
    return acc;
  }, {} as Record<string, any[]>);

  // Get badge configuration for a field value
  const getBadgeStyle = (fieldKey: string, value: string) => {
    const fieldDef = fields[fieldKey];
    if (fieldDef?.badgeColors && fieldDef.badgeColors[value]) {
      return fieldDef.badgeColors[value];
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  };

  // Determine field display type from schema
  const getFieldDisplayType = (fieldKey: string) => {
    const fieldDef = fields[fieldKey];
    return fieldDef?.displayAs || 'text';
  };

  if (mode === 'display') {
    return (
      <div className="space-y-4">
        {schema.label && (
          <h3 className={getClasses.h2()}>
            {schema.label}
          </h3>
        )}

        <div className={`grid grid-cols-1 gap-6 ${
          columns.length === 2 ? 'md:grid-cols-2' : 
          columns.length === 3 ? 'md:grid-cols-3' : 
          columns.length === 4 ? 'md:grid-cols-4' :
          'md:grid-cols-3'
        }`}>
          {columns.map((column: any) => {
            const columnItems = groupedItems[column.key] || [];
            const count = columnItems.length;

            return (
              <div key={column.key} className="flex flex-col">
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-4">
                  {column.icon && (
                    <div className={column.color || 'text-gray-600 dark:text-gray-400'}>
                      {column.icon}
                    </div>
                  )}
                  <h4 className="text-base font-roobert-bold text-gray-900 dark:text-white">
                    {column.label} ({count})
                  </h4>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1">
                  {columnItems.length === 0 ? (
                    <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 text-center text-sm text-gray-400 dark:text-gray-500">
                      No items
                    </div>
                  ) : (
                    columnItems.map((item: any, idx: number) => {
                      // Separate fields by display type
                      const titleFields = Object.keys(fields).filter(k => getFieldDisplayType(k) === 'title');
                      const subtitleFields = Object.keys(fields).filter(k => getFieldDisplayType(k) === 'subtitle');
                      const badgeFields = Object.keys(fields).filter(k => getFieldDisplayType(k) === 'badge');
                      const labelValueFields = Object.keys(fields).filter(k => getFieldDisplayType(k) === 'label-value');
                      const detailFields = Object.keys(fields).filter(k => getFieldDisplayType(k) === 'detail');

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Title row with badges */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              {titleFields.map(fieldKey => item[fieldKey] && (
                                <h5 key={fieldKey} className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                                  {item[fieldKey]}
                                </h5>
                              ))}
                            </div>
                            <div className="flex gap-1 flex-wrap justify-end">
                              {badgeFields.map(fieldKey => item[fieldKey] && (
                                <span 
                                  key={fieldKey}
                                  className={`px-2 py-0.5 rounded text-xs font-roobert-medium border ${getBadgeStyle(fieldKey, item[fieldKey])}`}
                                >
                                  {item[fieldKey]}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Subtitle */}
                          {subtitleFields.map(fieldKey => item[fieldKey] && (
                            <p key={fieldKey} className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                              {item[fieldKey]}
                            </p>
                          ))}

                          {/* Label-Value pairs */}
                          {labelValueFields.map(fieldKey => item[fieldKey] && (
                            <div key={fieldKey} className="mb-2">
                              <p className="text-xs font-roobert-semibold text-fis-eggplant dark:text-fis-raspberry mb-1">
                                {fields[fieldKey].label}:
                              </p>
                              <p className="text-xs text-gray-700 dark:text-gray-300">
                                {item[fieldKey]}
                              </p>
                            </div>
                          ))}

                          {/* Detail fields (at bottom) */}
                          {detailFields.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-[var(--brand-primary)] dark:border-[var(--brand-primary)]">
                              {detailFields.map(fieldKey => item[fieldKey] && (
                                <p key={fieldKey} className="text-xs text-fis-eggplant dark:text-fis-raspberry">
                                  <span className="font-roobert-semibold">{fields[fieldKey].label}:</span> {item[fieldKey]}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Edit mode
  const handleAdd = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const newItem: any = {};
    Object.keys(fields).forEach(key => {
      const field = fields[key];
      if (field.renderAs === 'select' && field.options) {
        newItem[key] = field.options[0];
      } else {
        newItem[key] = '';
      }
    });
    onChange?.([...items, newItem]);
  };

  const handleRemove = (index: number) => {
    onChange?.(items.filter((_: any, idx: number) => idx !== index));
  };

  const handleFieldChange = (itemIndex: number, fieldKey: string, fieldValue: any) => {
    const updated = [...items];
    updated[itemIndex] = {
      ...updated[itemIndex],
      [fieldKey]: fieldValue
    };
    onChange?.(updated);
  };

  return (
    <div className="space-y-4">
      {schema.label && (
        <label className={`block ${getClasses.h2()}`}>
          {schema.label}
          {schema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={(e) => handleAdd(e)}
          disabled={disabled}
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fis-eggplant hover:bg-fis-eggplant/90 text-white font-roobert-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="p-8 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-300 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            No items yet
          </p>
          <button
            onClick={(e) => handleAdd(e)}
            disabled={disabled}
            type="button"
            className="inline-flex items-center px-4 py-2 text-sm font-roobert-medium text-fis-eggplant dark:text-fis-raspberry hover:bg-fis-eggplant/10 dark:hover:bg-fis-raspberry/10 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: any, index: number) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300">
                  Item {index + 1}
                </span>
                <button
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(fields).map(([fieldKey, fieldDef]: [string, any]) => (
                  <div key={fieldKey} className={fieldDef.renderAs === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className={`block ${getClasses.label()} mb-2`}>
                      {fieldDef.label}
                      {fieldDef.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {fieldDef.renderAs === 'select' ? (
                      <select
                        value={item[fieldKey] || ''}
                        onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                        disabled={disabled}
                        className={getClasses.input()}
                      >
                        {fieldDef.options?.map((option: string) => (
                          <option key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : fieldDef.renderAs === 'textarea' ? (
                      <textarea
                        value={item[fieldKey] || ''}
                        onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                        disabled={disabled}
                        rows={3}
                        placeholder={fieldDef.placeholder}
                        className={getClasses.input()}
                      />
                    ) : (
                      <input
                        type="text"
                        value={item[fieldKey] || ''}
                        onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                        disabled={disabled}
                        placeholder={fieldDef.placeholder}
                        className={getClasses.input()}
                      />
                    )}
                  </div>
                ))}
              </div>
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
    </div>
  );
};
