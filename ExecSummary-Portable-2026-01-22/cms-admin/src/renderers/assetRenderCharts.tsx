/**
 * Chart Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React, { useState } from 'react';
import { RadialBarChart, RadialBar, PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { Plus, X } from 'lucide-react';

export interface ChartPatternProps {
  data: any;
  onChange?: (value: any) => void;
  mode: 'edit' | 'display';
}

// ==========================================
// RADIAL PROGRESS PATTERN
// ==========================================

export const RadialProgressPattern: React.FC<ChartPatternProps> = ({ data, onChange, mode }) => {
  // Support both single object and array formats
  const isArray = Array.isArray(data);
  const items = isArray ? data : (data ? [data] : []);
  
  if (mode === 'edit') {
    if (!isArray) {
      // Single ring editor
      const updateField = (field: string, value: string) => {
        onChange?.({ ...data, [field]: value });
      };
      
      return (
        <div className="radial-edit">
          <input
            type="text"
            value={data?.label || ''}
            onChange={(e) => updateField('label', e.target.value)}
            placeholder="Label..."
          />
          <input
            type="number"
            value={data?.percentage || 0}
            onChange={(e) => updateField('percentage', e.target.value)}
            placeholder="Percentage (0-100)..."
            min="0"
            max="100"
          />
          <select
            value={data?.status || 'onTrack'}
            onChange={(e) => updateField('status', e.target.value)}
          >
            <option value="onTrack">On Track</option>
            <option value="atRisk">At Risk</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      );
    } else {
      // Multi-ring editor
      const addRing = () => {
        onChange?.([...items, { name: '', value: 0 }]);
      };
      
      const removeRing = (index: number) => {
        onChange?.(items.filter((_, i) => i !== index));
      };
      
      const updateRing = (index: number, field: string, value: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: field === 'value' ? Number(value) : value };
        onChange?.(updated);
      };
      
      return (
        <div>
          {items.map((item, index) => (
            <div key={index} className="edit-item-container">
              <div className="edit-field-row">
                <input
                  type="text"
                  value={item.name || ''}
                  onChange={(e) => updateRing(index, 'name', e.target.value)}
                  placeholder="Ring Name..."
                  style={{ flex: 1 }}
                />
                <button className="delete-button" onClick={() => removeRing(index)}>
                  <X size={16} />
                </button>
              </div>
              <input
                type="number"
                value={item.value || 0}
                onChange={(e) => updateRing(index, 'value', e.target.value)}
                placeholder="Percentage (0-100)..."
                min="0"
                max="100"
              />
            </div>
          ))}
          <button className="primary-action" onClick={addRing}>
            <Plus size={16} /> Add Ring
          </button>
        </div>
      );
    }
  }
  
  // Display mode - Use CSS variables for colors
  const getCSSColor = (varName: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };
  
  const COLORS = [
    getCSSColor('--brand-primary'),
    getCSSColor('--brand-secondary'),
    getCSSColor('--accent-blue'),
    getCSSColor('--accent-green'),
    getCSSColor('--accent-yellow')
  ];
  
  if (!isArray && data) {
    // Single ring display (legacy format)
    const percentage = Number(data?.percentage || 0);
    
    const getColor = (status: string) => {
      switch(status) {
        case 'onTrack': return getCSSColor('--semantic-success');
        case 'atRisk': return getCSSColor('--semantic-warning');
        case 'blocked': return getCSSColor('--semantic-error');
        default: return getCSSColor('--accent-blue');
      }
    };
    
    // Create data with max value of 100 to force proper scaling
    const chartData = [
      { name: data?.label || 'Progress', value: percentage, fill: getColor(data?.status) },
      { name: 'Scale', value: 100, fill: 'transparent' } // Force 100% scale
    ];
    
    return (
      <div className="radial-chart">
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="60%" 
            outerRadius="90%" 
            data={[{ ...chartData[0], fill: getColor(data?.status) }]}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background
              dataKey="value"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="chart-label">
          <div className="percentage">{percentage}%</div>
          <div className="label">{data?.label}</div>
          <div className={`badge status-${data?.status}`}>{data?.status}</div>
        </div>
      </div>
    );
  }
  
  // Multi-ring display
  const maxValue = Math.max(...items.map(item => Number(item.value || item.percentage || 0)), 100);
  
  // Visible data (exclude the invisible scale ring)
  const visibleData = items.map((item, index) => ({
    name: String(item.name || item.label || 'Item ' + (index + 1)),
    value: Number(item.value || item.percentage || 0),
    fill: COLORS[index % COLORS.length]
  }));
  
  // Chart data includes invisible scale ring for 100% sizing (background color makes it invisible)
  const chartData = [
    ...visibleData,
    { name: 'Scale', value: 100, fill: 'var(--surface-primary, #ffffff)' } // Background color - invisible but maintains scale
  ];
  
  // Custom tooltip showing ALL items at once
  const CustomTooltip = ({ active }: any) => {
    if (!active) return null;

    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-[200px]">
        <p className="text-xs font-medium text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Progress Overview
        </p>
        <div className="space-y-2">
          {visibleData.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.name}:
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="radial-chart">
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart 
          cx="50%" 
          cy="45%" 
          innerRadius="10%" 
          outerRadius="90%" 
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background={{ fill: 'var(--surface-secondary, #f3f4f6)' }}
            dataKey="value"
            cornerRadius={10}
          />
          <Legend 
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '5px' }}
            payload={visibleData.map((item) => ({
              value: item.name,
              type: 'square',
              color: item.fill
            }))}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==========================================
// PIE CHART PATTERN
// ==========================================

export const PieChartPattern: React.FC<ChartPatternProps> = ({ data, onChange, mode }) => {
  const items = Array.isArray(data) ? data : [];
  
  if (mode === 'edit') {
    const addSlice = () => {
      onChange?.([...items, { name: '', value: 0 }]);
    };
    
    const removeSlice = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updateSlice = (index: number, field: string, value: string) => {
      const updated = [...items];
      updated[index] = { ...updated[index], [field]: field === 'value' ? Number(value) : value };
      onChange?.(updated);
    };
    
    return (
      <div>
        {items.map((item, index) => (
          <div key={index} className="edit-item-container">
            <div className="edit-field-row" style={{ marginBottom: '8px' }}>
              <input
                type="text"
                value={item.name || ''}
                onChange={(e) => updateSlice(index, 'name', e.target.value)}
                placeholder="Slice Name..."
                style={{ flex: 1 }}
              />
              <button className="delete-button" onClick={() => removeSlice(index)}>
                <X size={16} />
              </button>
            </div>
            <input
              type="number"
              value={item.value || 0}
              onChange={(e) => updateSlice(index, 'value', e.target.value)}
              placeholder="Value..."
              min="0"
            />
          </div>
        ))}
        <button className="primary-action" onClick={addSlice}>
          <Plus size={16} /> Add Slice
        </button>
      </div>
    );
  }
  
  const getCSSColor = (varName: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };
  
  const COLORS = [
    getCSSColor('--brand-primary'),
    getCSSColor('--brand-secondary'),
    getCSSColor('--accent-blue'),
    getCSSColor('--accent-green'),
    getCSSColor('--accent-yellow'),
    getCSSColor('--accent-red')
  ];
  
  // Calculate total for percentages
  const total = items.reduce((sum, item) => sum + (item.value || 0), 0);
  
  // Custom tooltip showing ALL slices at once
  const CustomPieTooltip = ({ active }: any) => {
    if (!active) return null;

    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-[200px]">
        <p className="text-xs font-medium text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          Distribution
        </p>
        <div className="space-y-2">
          {items.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
            const color = COLORS[index % COLORS.length];
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm" style={{ color }}>
                    {item.name}:
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color }}>
                  {item.value} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="pie-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={items}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${(percent * 100).toFixed(0)}%`}
            outerRadius={70}
            dataKey="value"
          >
            {items.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={50}
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            formatter={(value: string) => {
              const item = items.find(i => i.name === value);
              if (!item) return value;
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
              return `${value}: ${percentage}%`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==========================================
// BAR CHART PATTERN
// ==========================================

export const BarChartPattern: React.FC<ChartPatternProps> = ({ data, onChange, mode }) => {
  const items = Array.isArray(data) ? data : [];
  
  // Detect if this is multi-series (stacked) data
  const isMultiSeries = items.length > 0 && items[0] && 
    Object.keys(items[0]).filter(key => key !== 'name' && typeof items[0][key] === 'number').length > 1;
  
  if (mode === 'edit') {
    const addBar = () => {
      if (isMultiSeries && items.length > 0) {
        // Copy structure from first item
        const template = Object.keys(items[0]).reduce((acc, key) => {
          acc[key] = key === 'name' ? '' : 0;
          return acc;
        }, {} as any);
        onChange?.([...items, template]);
      } else {
        onChange?.([...items, { name: '', value: 0 }]);
      }
    };
    
    const removeBar = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updateBar = (index: number, field: string, value: string) => {
      const updated = [...items];
      updated[index] = { ...updated[index], [field]: field === 'name' ? value : Number(value) };
      onChange?.(updated);
    };
    
    return (
      <div>
        {items.map((item, index) => (
          <div key={index} className="edit-item-container">
            <div className="edit-field-row" style={{ marginBottom: '8px' }}>
              <input
                type="text"
                value={item.name || ''}
                onChange={(e) => updateBar(index, 'name', e.target.value)}
                placeholder="Category..."
                style={{ flex: 1 }}
              />
              <button className="delete-button" onClick={() => removeBar(index)}>
                <X size={16} />
              </button>
            </div>
            {Object.keys(item).filter(key => key !== 'name').map(key => (
              <input
                key={key}
                type="number"
                value={item[key] || 0}
                onChange={(e) => updateBar(index, key, e.target.value)}
                placeholder={`${key}...`}
                min="0"
                style={{ marginBottom: '8px' }}
              />
            ))}
          </div>
        ))}
        <button className="primary-action" onClick={addBar}>
          <Plus size={16} /> Add Bar
        </button>
      </div>
    );
  }
  
  // DSM Semantic Colors for series
  const getCSSColor = (varName: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };
  
  const SERIES_COLORS = [
    getCSSColor('--brand-primary'),
    getCSSColor('--brand-secondary'),
    getCSSColor('--accent-blue'),
    getCSSColor('--accent-green'),
    getCSSColor('--accent-yellow'),
    getCSSColor('--accent-red')
  ];
  
  if (isMultiSeries) {
    // Stacked bar chart
    const seriesKeys = Object.keys(items[0]).filter(key => key !== 'name');
    
    // Custom tooltip for stacked bars
    const CustomBarTooltip = ({ active, payload, label }: any) => {
      if (!active || !payload || !payload.length) return null;

      return (
        <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-[200px]">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            {label}
          </p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: entry.fill || entry.color }}
                  />
                  <span className="text-sm" style={{ color: entry.fill || entry.color }}>
                    {entry.name}:
                  </span>
                </div>
                <span className="text-sm font-medium" style={{ color: entry.fill || entry.color }}>
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    };
    
    return (
      <div className="bar-chart">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={items}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E7E8" />
            <XAxis dataKey="name" stroke="#403040" />
            <YAxis stroke="#403040" />
            <Tooltip content={<CustomBarTooltip />} />
            <Legend iconType="square" />
            {seriesKeys.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key} 
                stackId="a"
                fill={SERIES_COLORS[index % SERIES_COLORS.length]}
                radius={index === seriesKeys.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Single series bar chart
  const chartData = items.map((item, index) => ({
    ...item,
    fill: SERIES_COLORS[index % SERIES_COLORS.length]
  }));
  
  // Custom tooltip for single bars
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0];

    return (
      <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4">
        <p className="text-sm font-medium" style={{ color: entry.payload.fill }}>
          {label}
        </p>
        <p className="text-lg font-bold mt-1" style={{ color: entry.payload.fill }}>
          {entry.value}
        </p>
      </div>
    );
  };
  
  return (
    <div className="bar-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6E7E8" />
          <XAxis dataKey="name" stroke="#403040" />
          <YAxis stroke="#403040" />
          <Tooltip content={<CustomBarTooltip />} />
          <Legend 
            formatter={(value) => value === 'value' ? 'Amount' : value}
            iconType="square"
          />
          <Bar dataKey="value" name="Amount" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ==========================================
// LINE CHART PATTERN
// ==========================================

export const LineChartPattern: React.FC<ChartPatternProps> = ({ data, onChange, mode }) => {
  const items = Array.isArray(data) ? data : [];
  
  if (mode === 'edit') {
    // Detect all series keys dynamically (same as display mode)
    const seriesKeys = items.length > 0 
      ? Object.keys(items[0]).filter(key => key !== 'name')
      : ['value']; // Default to 'value' for empty charts
    
    // Local state for series renaming to avoid losing focus
    const [editingSeriesName, setEditingSeriesName] = useState<string>('');
    const [editingSeriesOriginal, setEditingSeriesOriginal] = useState<string>('');
    
    const addPoint = () => {
      // Create new point with all existing series columns
      const newPoint: any = { name: '' };
      seriesKeys.forEach(key => {
        newPoint[key] = 0;
      });
      onChange?.([...items, newPoint]);
    };
    
    const removePoint = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updatePoint = (index: number, field: string, value: string) => {
      const updated = [...items];
      // Convert to number for series fields, keep as string for 'name'
      updated[index] = { ...updated[index], [field]: field === 'name' ? value : Number(value) };
      onChange?.(updated);
    };
    
    const addSeries = () => {
      const seriesName = `Series${seriesKeys.length + 1}`;
      const updated = items.map(point => ({ ...point, [seriesName]: 0 }));
      onChange?.(updated);
    };
    
    const removeSeries = (seriesKey: string) => {
      if (seriesKeys.length <= 1) return; // Keep at least one series
      const updated = items.map(point => {
        const { [seriesKey]: removed, ...rest } = point;
        return rest;
      });
      onChange?.(updated);
    };
    
    const commitSeriesRename = () => {
      if (!editingSeriesName || editingSeriesName === editingSeriesOriginal || editingSeriesName === 'name') {
        setEditingSeriesName('');
        setEditingSeriesOriginal('');
        return;
      }
      // Check if new name already exists
      if (seriesKeys.includes(editingSeriesName) && editingSeriesName !== editingSeriesOriginal) {
        setEditingSeriesName('');
        setEditingSeriesOriginal('');
        return;
      }
      
      const updated = items.map(point => {
        const { [editingSeriesOriginal]: value, ...rest } = point;
        return { ...rest, [editingSeriesName]: value };
      });
      onChange?.(updated);
      setEditingSeriesName('');
      setEditingSeriesOriginal('');
    };
    
    return (
      <div>
        {/* Series Management */}
        <div className="edit-series-manager" style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Series:</span>
            {seriesKeys.map(key => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: 'var(--surface-primary)', border: '1px solid var(--border-primary)', borderRadius: '4px' }}>
                <input
                  type="text"
                  value={editingSeriesOriginal === key ? editingSeriesName : key}
                  onFocus={() => {
                    setEditingSeriesOriginal(key);
                    setEditingSeriesName(key);
                  }}
                  onChange={(e) => setEditingSeriesName(e.target.value)}
                  onBlur={commitSeriesRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      commitSeriesRename();
                      e.currentTarget.blur();
                    } else if (e.key === 'Escape') {
                      setEditingSeriesName('');
                      setEditingSeriesOriginal('');
                      e.currentTarget.blur();
                    }
                  }}
                  style={{ fontSize: '13px', color: 'var(--text-primary)', backgroundColor: 'transparent', border: 'none', width: `${Math.max(key.length * 8, 60)}px`, padding: '0' }}
                />
                {seriesKeys.length > 1 && (
                  <button
                    onClick={() => removeSeries(key)}
                    className="icon-button"
                    title={`Remove ${key}`}
                    style={{ padding: '2px', color: 'var(--accent-red)' }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addSeries}
              className="secondary-action"
              style={{ fontSize: '13px', padding: '4px 8px' }}
            >
              <Plus size={12} /> Add Series
            </button>
          </div>
        </div>

        {/* Data Points */}
        {items.map((item, index) => (
          <div key={index} className="edit-item-container" style={{ marginBottom: '12px' }}>
            <div className="edit-field-row" style={{ marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={item.name || ''}
                onChange={(e) => updatePoint(index, 'name', e.target.value)}
                placeholder="Label (e.g., Jan)..."
                style={{ width: '100px' }}
              />
              {seriesKeys.map(key => (
                <input
                  key={key}
                  type="number"
                  value={item[key] || 0}
                  onChange={(e) => updatePoint(index, key, e.target.value)}
                  placeholder={key}
                  min="0"
                  style={{ width: '80px' }}
                />
              ))}
              <button className="delete-button" onClick={() => removePoint(index)}>
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
        <button className="primary-action" onClick={addPoint}>
          <Plus size={16} /> Add Point
        </button>
      </div>
    );
  }
  
  // Display mode - Support multi-series
  const getCSSColor = (varName: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };
  
  const SERIES_COLORS = [
    getCSSColor('--brand-primary'),
    getCSSColor('--brand-secondary'),
    getCSSColor('--accent-blue'),
    getCSSColor('--accent-green'),
    getCSSColor('--accent-yellow'),
    getCSSColor('--accent-red')
  ];
  
  // Detect if multi-series (has keys other than 'name')
  const seriesKeys = items.length > 0 
    ? Object.keys(items[0]).filter(key => key !== 'name')
    : ['value'];
  
  return (
    <div className="line-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={items}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {seriesKeys.map((key, index) => (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key} 
              stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
              strokeWidth={2}
              name={key.charAt(0).toUpperCase() + key.slice(1)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
