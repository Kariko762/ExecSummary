/**
 * Chart Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';
import { RadialBarChart, RadialBar, PieChart, Pie, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { Plus, X } from 'lucide-react';

export interface ChartPatternProps {
  data: any;
  onChange?: (value: any) => void;
  mode: 'edit' | 'display';
  contentTag?: string; // Content context (e.g., 'performance')
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
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="40%" 
            outerRadius="95%" 
            data={chartData}
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
  
  // Chart data includes invisible scale ring for 100% sizing
  const chartData = [
    ...visibleData,
    { name: 'Scale', value: 100, fill: '#ffffff' } // White - invisible against white background but maintains scale
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
          outerRadius="95%" 
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background={{ fill: '#e5e7eb' }}
            dataKey="value"
            cornerRadius={10}
          />
          <Legend 
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '5px', fontSize: '11px' }}
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
            label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
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

export const BarChartPattern: React.FC<ChartPatternProps> = ({ data, onChange, mode, contentTag }) => {
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
    const isPerformance = contentTag === 'performance';
    
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
    
    if (isPerformance) {
      return (
        <div 
          className="bar-chart performance-glass"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={items}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255, 255, 255, 0.6)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.6)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              />
              <Tooltip 
                content={<CustomBarTooltip />}
                contentStyle={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
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
    
    return (
      <div className="bar-chart">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={items}>
            <CartesianGrid strokeDasharray="3 3" stroke={getCSSColor('--surface-tertiary')} />
            <XAxis dataKey="name" stroke={getCSSColor('--text-primary')} />
            <YAxis stroke={getCSSColor('--text-primary')} />
            <Tooltip content={<CustomBarTooltip />} />
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
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={getCSSColor('--surface-tertiary')} />
          <XAxis dataKey="name" stroke={getCSSColor('--text-primary')} />
          <YAxis stroke={getCSSColor('--text-primary')} />
          <Tooltip content={<CustomBarTooltip />} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
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

export const LineChartPattern: React.FC<ChartPatternProps> = ({ data, onChange, mode, contentTag }) => {
  const items = Array.isArray(data) ? data : [];
  const isPerformance = contentTag === 'performance';
  
  if (mode === 'edit') {
    const addPoint = () => {
      onChange?.([...items, { name: '', value: 0 }]);
    };
    
    const removePoint = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updatePoint = (index: number, field: string, value: string) => {
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
                onChange={(e) => updatePoint(index, 'name', e.target.value)}
                placeholder="Label (e.g., Jan)..."
                style={{ flex: 1 }}
              />
              <button className="delete-button" onClick={() => removePoint(index)}>
                <X size={16} />
              </button>
            </div>
            <input
              type="number"
              value={item.value || 0}
              onChange={(e) => updatePoint(index, 'value', e.target.value)}
              placeholder="Value..."
              min="0"
            />
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
  
  // Performance glassmorphism rendering
  if (isPerformance) {
    const isSingleLine = seriesKeys.length === 1;
    const accentGreen = getCSSColor('--accent-green');
    
    return (
      <div 
        className="line-chart performance-glass"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <ResponsiveContainer width="100%" height={300}>
          {isSingleLine ? (
            <AreaChart data={items}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentGreen} stopOpacity={0.6} />
                  <stop offset="50%" stopColor={accentGreen} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={accentGreen} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255, 255, 255, 0.6)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.6)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend 
                wrapperStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
              />
              <Area
                type="monotone"
                dataKey={seriesKeys[0]}
                stroke={accentGreen}
                strokeWidth={3}
                fill="url(#areaGradient)"
                dot={{ fill: accentGreen, r: 4 }}
                activeDot={{ r: 6, fill: accentGreen }}
              />
            </AreaChart>
          ) : (
            <LineChart data={items}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255, 255, 255, 0.6)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.6)"
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend 
                wrapperStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
              />
              {seriesKeys.map((key, index) => (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                  strokeWidth={2}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Standard rendering
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
