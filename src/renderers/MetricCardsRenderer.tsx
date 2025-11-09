import React from 'react';
import { RendererProps } from '../types/schema';
import { DollarSign, TrendingUp, Users, ThumbsUp } from 'lucide-react';
import { getClasses } from '../design-system';

export const MetricCardsRenderer: React.FC<RendererProps> = ({
  schema,
  value,
  onChange,
  mode,
  disabled,
  error
}) => {
  // Handle both formats:
  // 1. Array format: [{ label: "Won ACV", value: 1230000, type: "currency" }]
  // 2. Object format: { wonACV: 1230000, conversionRate: 48 }
  const isArrayFormat = Array.isArray(value);
  const metrics = isArrayFormat ? value : (value || {});
  const fields = schema.fields || {};

  const getIcon = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('revenue') || lowerKey.includes('dollar')) 
      return <DollarSign className="w-5 h-5" />;
    if (lowerKey.includes('growth') || lowerKey.includes('increase')) 
      return <TrendingUp className="w-5 h-5" />;
    if (lowerKey.includes('customer') || lowerKey.includes('user')) 
      return <Users className="w-5 h-5" />;
    if (lowerKey.includes('satisfaction') || lowerKey.includes('nps')) 
      return <ThumbsUp className="w-5 h-5" />;
    return <TrendingUp className="w-5 h-5" />;
  };

  const formatValue = (key: string, val: number) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('revenue') || lowerKey.includes('dollar')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(val);
    }
    if (lowerKey.includes('growth') || lowerKey.includes('percent')) {
      return `+${val}%`;
    }
    return new Intl.NumberFormat('en-US').format(val);
  };

  if (mode === 'display') {
    if (isArrayFormat) {
      // Display array format: [{ label, value, type }]
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric: any, index: number) => (
            <div
              key={index}
              className="p-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-fis-eggplant/10 dark:bg-fis-eggplant/20 flex items-center justify-center text-fis-eggplant dark:text-fis-raspberry">
                  {getIcon(metric.label || '')}
                </div>
              </div>
              <p className={`${getClasses.textMuted()} mb-1`}>
                {metric.label}
              </p>
              <p className={getClasses.valueHeavy()}>
                {metric.value !== null && metric.value !== undefined 
                  ? formatValue(metric.label || '', metric.value) 
                  : '—'}
              </p>
            </div>
          ))}
        </div>
      );
    }
    
    // Display object format: { wonACV: 1230000 }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(fields).map(([key, fieldSchema]) => (
          <div
            key={key}
            className="p-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-fis-eggplant/10 dark:bg-fis-eggplant/20 flex items-center justify-center text-fis-eggplant dark:text-fis-raspberry">
                {getIcon(key)}
              </div>
            </div>
            <p className={`${getClasses.textMuted()} mb-1`}>
              {fieldSchema.label || key}
            </p>
            <p className={getClasses.valueHeavy()}>
              {metrics[key] !== null && metrics[key] !== undefined 
                ? formatValue(key, metrics[key]) 
                : '—'}
            </p>
          </div>
        ))}
      </div>
    );
  }

  const handleChange = (key: string, newValue: any) => {
    onChange?.({
      ...metrics,
      [key]: newValue
    });
  };

  const handleArrayChange = (index: number, field: string, newValue: any) => {
    const newMetrics = [...metrics];
    newMetrics[index] = {
      ...newMetrics[index],
      [field]: newValue
    };
    onChange?.(newMetrics);
  };

  const handleAddMetric = () => {
    const newMetrics = [...(metrics || []), { label: '', value: 0, type: 'number' }];
    onChange?.(newMetrics);
  };

  const handleRemoveMetric = (index: number) => {
    const newMetrics = metrics.filter((_: any, i: number) => i !== index);
    onChange?.(newMetrics);
  };

  // Edit mode for array format
  if (isArrayFormat) {
    return (
      <div className="space-y-4">
        {schema.label && (
          <label className={`block ${getClasses.h2()}`}>
            {schema.label}:
            {schema.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="space-y-3">
          {metrics.map((metric: any, index: number) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={`block ${getClasses.label()} mb-2`}>
                    Label:
                  </label>
                  <input
                    type="text"
                    value={metric.label || ''}
                    onChange={(e) => handleArrayChange(index, 'label', e.target.value)}
                    disabled={disabled || !schema.enabled}
                    placeholder="Metric label"
                    className={getClasses.input()}
                  />
                </div>
                <div>
                  <label className={`block ${getClasses.label()} mb-2`}>
                    Value:
                  </label>
                  <input
                    type="number"
                    value={metric.value ?? ''}
                    onChange={(e) => handleArrayChange(index, 'value', e.target.value === '' ? null : Number(e.target.value))}
                    disabled={disabled || !schema.enabled}
                    placeholder="Value"
                    className={getClasses.input()}
                  />
                </div>
                <div>
                  <label className={`block ${getClasses.label()} mb-2`}>
                    Type:
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={metric.type || 'number'}
                      onChange={(e) => handleArrayChange(index, 'type', e.target.value)}
                      disabled={disabled || !schema.enabled}
                      className={getClasses.input()}
                    >
                      <option value="number">Number</option>
                      <option value="currency">Currency</option>
                      <option value="percentage">Percentage</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveMetric(index)}
                      disabled={disabled || !schema.enabled}
                      className="px-3 py-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Remove metric"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddMetric}
          disabled={disabled || !schema.enabled}
          className="px-4 py-2 bg-fis-eggplant/10 text-fis-eggplant rounded-lg hover:bg-fis-eggplant/20 transition-colors font-roobert-medium"
        >
          + Add Metric
        </button>

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
  }

  // Edit mode for object format
  return (
    <div className="space-y-4">
      {schema.label && (
        <label className={`block ${getClasses.h2()}`}>
          {schema.label}:
          {schema.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(fields).map(([key, fieldSchema]) => (
          <div
            key={key}
            className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700"
          >
            <label className={`block ${getClasses.label()} mb-2`}>
              {fieldSchema.label || key}:
              {fieldSchema.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={metrics[key] ?? ''}
              onChange={(e) => handleChange(key, e.target.value === '' ? null : Number(e.target.value))}
              disabled={disabled || !schema.enabled}
              placeholder={`Enter ${fieldSchema.label || key}`}
              className={getClasses.input()}
            />
          </div>
        ))}
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
