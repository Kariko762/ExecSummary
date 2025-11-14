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
  // Handle both array and single object data
  const items = Array.isArray(data) ? data : [data];
  
  if (mode === 'edit') {
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
  }
  
  // Display mode: Create concentric rings for multiple items
  if (Array.isArray(data) && data.length > 1) {
    // Colors for concentric rings (purple palette)
    const RING_COLORS = ['#5D2A6D', '#8B4789', '#B565A7', '#E183C5'];
    
    // Transform data for RadialBarChart - preserve actual names for tooltip
    const chartData = data.map((item, index) => ({
      name: String(item.name || item.label || `Item ${index + 1}`),
      value: Number(item.value || item.percentage || 0),
      fill: RING_COLORS[index % RING_COLORS.length]
    }));
    
    console.log('RadialProgressPattern chartData:', chartData);
    
    return (
      <div className="radial-chart-concentric">
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
              label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
              domain={[0, 100]}
            />
            <Legend 
              iconSize={10}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
            />
            <Tooltip 
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                      <p className="font-roobert-semibold text-sm">{data.name}</p>
                      <p className="text-fis-eggplant dark:text-fis-raspberry">{data.value}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // Single radial chart
  const singleItem = items[0] || {};
  const percentage = Number(singleItem?.percentage || singleItem?.value || 0);
  
  const getColor = (status: string) => {
    switch(status) {
      case 'onTrack': return '#10b981';
      case 'atRisk': return '#f59e0b';
      case 'blocked': return '#ef4444';
      default: return '#8B4789';
    }
  };
  
  return (
    <div className="radial-chart">
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="60%" 
          outerRadius="90%" 
          data={[{ value: percentage, fill: getColor(singleItem?.status) }]}
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
        <div className="label">{singleItem?.label || singleItem?.name}</div>
        {singleItem?.status && <div className={`badge status-${singleItem.status}`}>{singleItem.status}</div>}
      </div>
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
      <div className="pie-edit">
        {items.map((item, index) => (
          <div key={index} className="pie-slice-edit">
            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => updateSlice(index, 'name', e.target.value)}
              placeholder="Slice Name..."
            />
            <input
              type="number"
              value={item.value || 0}
              onChange={(e) => updateSlice(index, 'value', e.target.value)}
              placeholder="Value..."
              min="0"
            />
            <button onClick={() => removeSlice(index)}><X size={16} /></button>
          </div>
        ))}
        <button onClick={addSlice}><Plus size={16} /> Add Slice</button>
      </div>
    );
  }
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
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
            {items.map((entry, index) => (
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
  
  if (mode === 'edit') {
    const addBar = () => {
      onChange?.([...items, { name: '', value: 0 }]);
    };
    
    const removeBar = (index: number) => {
      onChange?.(items.filter((_, i) => i !== index));
    };
    
    const updateBar = (index: number, field: string, value: string) => {
      const updated = [...items];
      updated[index] = { ...updated[index], [field]: field === 'value' ? Number(value) : value };
      onChange?.(updated);
    };
    
    return (
      <div className="bar-edit">
        {items.map((item, index) => (
          <div key={index} className="bar-item-edit">
            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => updateBar(index, 'name', e.target.value)}
              placeholder="Category..."
            />
            <input
              type="number"
              value={item.value || 0}
              onChange={(e) => updateBar(index, 'value', e.target.value)}
              placeholder="Value..."
              min="0"
            />
            <button onClick={() => removeBar(index)}><X size={16} /></button>
          </div>
        ))}
        <button onClick={addBar}><Plus size={16} /> Add Bar</button>
      </div>
    );
  }
  
  // Auto-detect data keys for stacked charts (exclude 'name' field)
  const dataKeys = items.length > 0 
    ? Object.keys(items[0]).filter(key => key !== 'name')
    : ['value'];
  
  // Color palette for multiple series
  const SERIES_COLORS = ['#5D2A6D', '#E183C5', '#4A90E2', '#50C878', '#FFB84D'];
  
  return (
    <div className="bar-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={items}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar 
              key={key} 
              dataKey={key} 
              fill={SERIES_COLORS[index % SERIES_COLORS.length]}
              stackId={dataKeys.length > 1 ? 'stack' : undefined}
            />
          ))}
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
      <div className="line-edit">
        {items.map((item, index) => (
          <div key={index} className="line-point-edit">
            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => updatePoint(index, 'name', e.target.value)}
              placeholder="Label (e.g., Jan)..."
            />
            <input
              type="number"
              value={item.value || 0}
              onChange={(e) => updatePoint(index, 'value', e.target.value)}
              placeholder="Value..."
              min="0"
            />
            <button onClick={() => removePoint(index)}><X size={16} /></button>
          </div>
        ))}
        <button onClick={addPoint}><Plus size={16} /> Add Point</button>
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
