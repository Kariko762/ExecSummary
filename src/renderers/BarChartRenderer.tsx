import React from 'react';
import { RendererProps, FieldSchema } from '../types/schema';
import { Plus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getClasses, ChartColors } from '../design-system';

export const BarChartRenderer: React.FC<RendererProps> = ({
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
    xAxisKey = 'name',
    bars = [{ dataKey: 'value', fill: ChartColors.series.eggplantLight, name: 'Value' }],
    orientation = 'vertical',
    showGrid = true,
    showLegend = true,
    stacked = false
  } = chartConfig;

  const isVertical = orientation === 'vertical';
  const colorPalette = ChartColors.palette;

  // Custom tooltip component for categorical data
  const CustomCategoricalTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !items || items.length === 0) return null;

    // Calculate total for percentages
    const total = items.reduce((sum: number, item: any) => sum + (item.value || 0), 0);

    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-fis-eggplant dark:border-fis-raspberry rounded-lg shadow-xl p-4 min-w-[200px]">
        <p className="text-xs font-roobert-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          All Values
        </p>
        <div className="space-y-2">
          {items.map((item: any, index: number) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
            const isCurrentItem = payload[0]?.payload?.name === item.name;
            return (
              <div 
                key={index} 
                className={`flex items-center justify-between gap-4 ${
                  isCurrentItem ? 'font-roobert-bold' : 'font-roobert-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: colorPalette[index % colorPalette.length] }}
                  />
                  <span className={`text-sm ${
                    isCurrentItem 
                      ? 'text-fis-eggplant dark:text-fis-raspberry' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.name}:
                  </span>
                </div>
                <span className={`text-sm ${
                  isCurrentItem 
                    ? 'text-fis-eggplant dark:text-fis-raspberry' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {item.value} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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

    // For categorical data (simple name/value pairs), color each bar differently
    const isCategorical = items.length > 0 && 
      Object.keys(items[0]).length === 2 && 
      items[0].name !== undefined && 
      items[0].value !== undefined;

    const colorPalette = ChartColors.palette;

    return (
      <div style={{ width: '100%', height: '320px', minHeight: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={items}
            layout={isVertical ? 'horizontal' : 'vertical'}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={ChartColors.ui.grid} />}
            {isVertical ? (
              <>
                <XAxis type="category" dataKey={xAxisKey} stroke={ChartColors.ui.axis} />
                <YAxis type="number" stroke={ChartColors.ui.axis} />
              </>
            ) : (
              <>
                <XAxis type="number" stroke={ChartColors.ui.axis} />
                <YAxis type="category" dataKey={xAxisKey} stroke={ChartColors.ui.axis} />
              </>
            )}
            {isCategorical ? (
              // Categorical data: each bar gets a different color from the palette
              <Bar 
                dataKey="value" 
                radius={8}
              >
                {items.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                ))}
              </Bar>
            ) : (
              // Multi-series data: use configured bars
              bars.map((barConfig, index) => (
                <Bar
                  key={index}
                  dataKey={barConfig.dataKey}
                  fill={barConfig.fill}
                  name={barConfig.name}
                  stackId={stacked ? 'stack' : undefined}
                  radius={8}
                />
              ))
            )}
            {isCategorical ? (
              <Tooltip 
                content={<CustomCategoricalTooltip />}
                cursor={{ fill: 'rgba(148, 77, 230, 0.05)', fillOpacity: 0.5 }}
              />
            ) : (
              <Tooltip cursor={{ fill: 'rgba(148, 77, 230, 0.05)', fillOpacity: 0.5 }} />
            )}
            {!isCategorical && showLegend && <Legend />}
          </BarChart>
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
            <BarChart
              data={items}
              layout={isVertical ? 'horizontal' : 'vertical'}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={ChartColors.ui.grid} />}
              {isVertical ? (
                <>
                  <XAxis type="category" dataKey={xAxisKey} stroke={ChartColors.ui.axis} tick={{ fontSize: 10 }} />
                  <YAxis type="number" stroke={ChartColors.ui.axis} tick={{ fontSize: 10 }} />
                </>
              ) : (
                <>
                  <XAxis type="number" stroke={ChartColors.ui.axis} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey={xAxisKey} stroke={ChartColors.ui.axis} tick={{ fontSize: 10 }} />
                </>
              )}
              {bars.map((barConfig, index) => (
                <Bar
                  key={index}
                  dataKey={barConfig.dataKey}
                  fill={barConfig.fill}
                  name={barConfig.name}
                  stackId={stacked ? 'stack' : undefined}
                />
              ))}
              <Tooltip />
            </BarChart>
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
