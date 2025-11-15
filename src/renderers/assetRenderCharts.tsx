/**
 * Chart Asset Patterns - LOGIC ONLY (No Styling)
 * 
 * These patterns return pure structure and logic.
 * assetRenderEngine.tsx applies design system styling on top.
 */

import React from 'react';
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
  
  // Display mode
  const COLORS = ['#431C5B', '#B21A53', '#3b9dd8', '#10b981', '#FFB800'];
  
  if (!isArray && data) {
    // Single ring display (legacy format)
    const percentage = Number(data?.percentage || 0);
    
    const getColor = (status: string) => {
      switch(status) {
        case 'onTrack': return '#10b981';
        case 'atRisk': return '#f59e0b';
        case 'blocked': return '#ef4444';
        default: return '#3b9dd8';
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
  const chartData = [
    ...items.map((item, index) => ({
      name: String(item.name || item.label || 'Item ' + (index + 1)),
      value: Number(item.value || item.percentage || 0),
      fill: COLORS[index % COLORS.length]
    })),
    // Add invisible max ring to force 100% scale
    { name: 'Scale', value: 100, fill: 'transparent' }
  ];
  
  return (
    <div className="radial-chart">
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="20%" 
          outerRadius="90%" 
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          />
          <Legend 
            iconSize={10}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '30px', fontSize: '11px' }}
          />
          <Tooltip />
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
  
  const COLORS = ['#431C5B', '#B21A53', '#3882F6', '#48CD3E', '#F59E0B', '#EF4444'];
  
  return (
    <div className="pie-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={items}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {items.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
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
  const SERIES_COLORS = ['#431C5B', '#B21A53', '#3882F6', '#48CD3E', '#F59E0B', '#EF4444'];
  
  if (isMultiSeries) {
    // Stacked bar chart
    const seriesKeys = Object.keys(items[0]).filter(key => key !== 'name');
    
    return (
      <div className="bar-chart">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={items}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E6E7E8" />
            <XAxis dataKey="name" stroke="#403040" />
            <YAxis stroke="#403040" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #E6E7E8',
                borderRadius: '8px'
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
  
  // Single series bar chart
  const chartData = items.map((item, index) => ({
    ...item,
    fill: SERIES_COLORS[index % SERIES_COLORS.length]
  }));
  
  return (
    <div className="bar-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E6E7E8" />
          <XAxis dataKey="name" stroke="#403040" />
          <YAxis stroke="#403040" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #E6E7E8',
              borderRadius: '8px'
            }}
          />
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

export const LineChartPattern: React.FC<ChartPatternProps> = ({ data, onChange, mode }) => {
  const items = Array.isArray(data) ? data : [];
  
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
  
  return (
    <div className="line-chart">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={items}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
