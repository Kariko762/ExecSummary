import React from 'react';
import { RendererProps, FieldSchema } from '../types/schema';
import { Plus, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { getClasses } from '../design-system';

export const PieChartRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  const items = value || [];
  const chartConfig = schema.chartConfig || {};
  const fields = schema.fields || {};
  
  // Default values from chartConfig
  const {
    dataKey = 'value',
    nameKey = 'name',
    colors = ['#6B1B5E', '#B21A53', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
    showLegend = true,
    showTooltip = true,
    innerRadius = 0,
    outerRadius = 80
  } = chartConfig;

  if (mode === 'display') {
    if (items.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No data available
          </p>
        </div>
      );
    }

    return (
      <div style={{ width: '100%', height: '320px', minHeight: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              label={(entry) => entry[nameKey]}
            >
              {items.map((_entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]} 
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Edit mode - table for data entry
  const createEmptyItem = () => {
    const newItem: any = {};
    Object.keys(fields).forEach(key => {
      const fieldSchema = fields[key] as FieldSchema;
      if (fieldSchema.renderAs === 'number') {
        newItem[key] = 0;
      } else {
        newItem[key] = '';
      }
    });
    return newItem;
  };

  const handleAdd = () => {
    const updated = [...items, createEmptyItem()];
    onChange?.(updated);
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_: any, idx: number) => idx !== index);
    onChange?.(updated);
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
    <div className="space-y-0">
      {/* Chart Preview */}
      {items.length > 0 && (
        <div className="w-full h-48 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                dataKey={dataKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius * 0.6}
                outerRadius={outerRadius * 0.6}
                paddingAngle={2}
              >
                {items.map((_entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Data Entry Table */}
      <div className="space-y-2">
        <div className="flex justify-end items-center">
          <button
            onClick={handleAdd}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-fis-eggplant hover:bg-fis-eggplant/90 text-white font-roobert-medium text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Data Point
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-8 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-dashed border-gray-300 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              No data points yet
            </p>
            <button
              onClick={handleAdd}
              disabled={disabled}
              className="inline-flex items-center px-4 py-2 text-sm font-roobert-medium text-fis-eggplant dark:text-fis-raspberry hover:bg-fis-eggplant/10 dark:hover:bg-fis-raspberry/10 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Data Point
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-roobert-medium text-xs text-gray-600 dark:text-gray-400" style={{ gridTemplateColumns: `${Object.keys(fields).map(() => '1fr').join(' ')} auto` }}>
              {Object.entries(fields).map(([fieldKey, fieldSchema]) => (
                <div key={fieldKey}>
                  {(fieldSchema as FieldSchema).label || fieldKey}
                  {(fieldSchema as FieldSchema).required && <span className="text-red-500 ml-1">*</span>}
                </div>
              ))}
              <div className="text-right">Actions</div>
            </div>

            {/* Table Rows */}
            {items.map((item: any, index: number) => (
              <div
                key={index}
                className="grid gap-2 px-3 py-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 group hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                style={{ gridTemplateColumns: `${Object.keys(fields).map(() => '1fr').join(' ')} auto` }}
              >
                {Object.entries(fields).map(([fieldKey, fieldSchema]) => {
                  const fs = fieldSchema as FieldSchema;
                  const fieldValue = item[fieldKey];

                  return (
                    <div key={fieldKey}>
                      {fs.renderAs === 'number' ? (
                        <input
                          type="number"
                          value={fieldValue ?? ''}
                          onChange={(e) => handleFieldChange(index, fieldKey, e.target.value === '' ? null : Number(e.target.value))}
                          disabled={disabled}
                          placeholder={fs.placeholder || '0'}
                          className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-raspberry"
                        />
                      ) : (
                        <input
                          type="text"
                          value={fieldValue || ''}
                          onChange={(e) => handleFieldChange(index, fieldKey, e.target.value)}
                          disabled={disabled}
                          placeholder={fs.placeholder || ''}
                          className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fis-raspberry"
                        />
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Remove data point"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
