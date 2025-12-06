import React from 'react';
import type { RendererProps } from '../types/schema';
import { DollarSign, TrendingUp, Users, ThumbsUp, Award, Target, Star, Rocket, BarChart3, Activity, Zap, Heart, CheckCircle } from 'lucide-react';
import { getClasses } from '../design-system';
import { renderWithExpressions } from '../utils/expressionParser';

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

  const getIcon = (iconName: string | undefined, key: string) => {
    // If explicit icon name provided, use it
    if (iconName) {
      const icons: Record<string, JSX.Element> = {
        award: <Award className="w-5 h-5" />,
        dollar: <DollarSign className="w-5 h-5" />,
        users: <Users className="w-5 h-5" />,
        trending: <TrendingUp className="w-5 h-5" />,
        target: <Target className="w-5 h-5" />,
        star: <Star className="w-5 h-5" />,
        rocket: <Rocket className="w-5 h-5" />,
        chart: <BarChart3 className="w-5 h-5" />,
        activity: <Activity className="w-5 h-5" />,
        zap: <Zap className="w-5 h-5" />,
        heart: <Heart className="w-5 h-5" />,
        check: <CheckCircle className="w-5 h-5" />
      };
      return icons[iconName] || <Award className="w-5 h-5" />;
    }
    
    // Fallback to key-based icon selection
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
  
  const getIconColor = (colorName: string | undefined) => {
    if (!colorName) return undefined;
    
    const colors: Record<string, string> = {
      eggplant: 'var(--fis-eggplant)',
      raspberry: 'var(--fis-raspberry)',
      navy: 'var(--fis-navy)',
      green: 'var(--accent-green)',
      stone: 'var(--fis-stone)',
      fog: 'var(--fis-fog)'
    };
    return colors[colorName];
  };
  
  const getCardClass = (styleName: string | undefined) => {
    if (!styleName || styleName === 'standard') return 'metric-card';
    
    const styles: Record<string, string> = {
      highlight: 'metric-card metric-card-highlight',
      bold: 'metric-card metric-card-bold',
      total: 'metric-card metric-card-total'
    };
    return styles[styleName] || 'metric-card';
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
      // Display array format with new styling support: [{ title, value, style, icon, iconColor }]
      return (
        <div className="metric-grid">
          {metrics.map((metric: any, index: number) => {
            const cardClass = getCardClass(metric.style);
            const iconColor = getIconColor(metric.iconColor);
            
            return (
              <div key={index} className={cardClass}>
                <div className="icon" style={iconColor ? { color: iconColor } : undefined}>
                  {getIcon(metric.icon, metric.title || metric.label || '')}
                </div>
                <div className="label">
                  {renderWithExpressions(metric.title || metric.label || '')}
                </div>
                <div className="value">
                  {renderWithExpressions(String(metric.value ?? '—'))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    // Display object format: { wonACV: 1230000 }
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {Object.entries(fields).map(([key, fieldSchema]) => (
          <div
            key={key}
            className="p-5 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 shadow-sm min-w-[200px]"
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-lg bg-fis-eggplant/10 dark:bg-fis-eggplant/20 flex items-center justify-center text-fis-eggplant dark:text-fis-raspberry">
                {getIcon(key)}
              </div>
            </div>
            <p className={`${getClasses.textMuted()} mb-1 text-center`}>
              {fieldSchema.label || key}
            </p>
            <p className={`${getClasses.valueHeavy()} text-center`}>
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
