/**
 * FORECAST & FINANCIAL PLANNING RENDERER
 * 
 * Premium executive forecast breakdown with Capex/Opex classification
 * - Full-width financial planning dashboard
 * - Category-based grouping with Capex vs Opex tracking
 * - Line item drill-down via hover tooltips and modals
 * - Visual distinction between one-time and recurring costs
 * - Responsive layout with glassmorphism design
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  X,
  Info,
  Users,
  Server,
  Building2,
  DollarSign,
  Calendar,
  User,
  Edit3
} from 'lucide-react';

// Icon mapping
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Users,
  Server,
  Building2,
  TrendingUp,
  DollarSign
};

// ==========================================
// BUDGET BREAKDOWN COMPONENT
// ==========================================

interface LineItem {
  id: string;
  name: string;
  amount: number;
  type: 'capex' | 'opex'; // Capex (One-Time Cost) or Opex (Yearly Spend)
  description?: string;
  summary?: string;
  summaryVisible?: boolean;
  explanation?: string;
  explanationVisible?: boolean;
  justification?: string;
  justificationVisible?: boolean;
  owner: string;
  lastUpdated: string;
}

interface ForecastCategory {
  id: string;
  name: string;
  icon: string;
  totalAmount: number;
  capexAmount: number;
  opexAmount: number;
  color: string;
  lineItems: LineItem[];
}

interface ForecastData {
  title: string;
  currency: string;
  period: string;
  totalForecast: number;
  totalCapex: number;
  totalOpex: number;
  categories: ForecastCategory[];
  notes?: string;
}

interface ForecastBreakdownProps {
  data: ForecastData;
  mode?: 'edit' | 'display';
  onChange?: (value: ForecastData) => void;
}

export const ForecastBreakdown: React.FC<ForecastBreakdownProps> = ({ data, mode = 'display', onChange }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedLineItem, setSelectedLineItem] = useState<{ category: ForecastCategory; item: LineItem } | null>(null);
  const [showForecastEditor, setShowForecastEditor] = useState(false);

  // Listen for expand/collapse events from ContentModal
  useEffect(() => {
    const handleExpandAll = () => {
      if (data?.categories) {
        setExpandedCategories(new Set(data.categories.map(c => c.id)));
      }
    };

    const handleCollapseAll = () => {
      setExpandedCategories(new Set());
    };

    window.addEventListener('forecast:expandAll', handleExpandAll);
    window.addEventListener('forecast:collapseAll', handleCollapseAll);

    return () => {
      window.removeEventListener('forecast:expandAll', handleExpandAll);
      window.removeEventListener('forecast:collapseAll', handleCollapseAll);
    };
  }, [data]);

  if (!data || !data.categories) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-600 dark:text-red-400">Invalid forecast data</p>
      </div>
    );
  }

  const capexPercent = ((data.totalCapex / data.totalForecast) * 100).toFixed(1);
  const opexPercent = ((data.totalOpex / data.totalForecast) * 100).toFixed(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getTypeBadge = (type: 'capex' | 'opex') => {
    return type === 'capex' 
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
  };

  const getTypeLabel = (type: 'capex' | 'opex') => {
    return type === 'capex' ? 'CAPEX (One-Time)' : 'OPEX (Yearly)';
  };

  const getCategoryColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30',
      blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
      violet: 'from-violet-500/20 to-violet-600/20 border-violet-500/30',
      amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30',
      rose: 'from-rose-500/20 to-rose-600/20 border-rose-500/30',
    };
    return colors[color] || colors.blue;
  };
  // Edit Mode Handler Functions
  const updateForecastField = (field: keyof ForecastData, value: any) => {
    if (!onChange) return;
    onChange({ ...data, [field]: value });
  };

  // SIMPLIFIED EDIT MODE UI
  if (mode === 'edit') {
    return (
      <>
        <div className="w-full space-y-4 p-6 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10">
          {/* General Settings Only */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-roobert-semibold text-fis-eggplant dark:text-fis-raspberry">Forecast General Settings</h3>
              <button
                onClick={() => setShowForecastEditor(true)}
                className="px-4 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <Edit3 className="w-4 h-4" />
                Edit Forecast Details
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => updateForecastField('title', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., 2026 Technology Forecast"
                />
              </div>
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Period</label>
                <input
                  type="text"
                  value={data.period || ''}
                  onChange={(e) => updateForecastField('period', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Q4 2025"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                <select
                  value={data.currency || 'USD'}
                  onChange={(e) => updateForecastField('currency', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Total Forecast</label>
                <input
                  type="number"
                  value={data.totalForecast || 0}
                  onChange={(e) => updateForecastField('totalForecast', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Total Capex</label>
                <input
                  type="number"
                  value={data.totalCapex || 0}
                  onChange={(e) => updateForecastField('totalCapex', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Total Opex</label>
                <input
                  type="number"
                  value={data.totalOpex || 0}
                  onChange={(e) => updateForecastField('totalOpex', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Executive Notes</label>
              <textarea
                value={data.notes || ''}
                onChange={(e) => updateForecastField('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Add executive summary notes or key insights..."
              />
            </div>

            {/* Summary Stats */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-blue-800 dark:text-blue-200 font-roobert-medium">
                    {data.categories?.length || 0} categories
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 mx-2">•</span>
                  <span className="text-blue-800 dark:text-blue-200 font-roobert-medium">
                    {data.categories?.reduce((sum, cat) => sum + (cat.lineItems?.length || 0), 0) || 0} line items
                  </span>
                </div>
                <button
                  onClick={() => setShowBudgetEditor(true)}
                  className="text-blue-700 dark:text-blue-300 hover:underline font-roobert-medium"
                >
                  Click "Edit Budget Details" to manage categories →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Editor Modal */}
        {showForecastEditor && onChange && (
          <BudgetEditorModal
            data={data}
            onChange={onChange}
            onClose={() => setShowForecastEditor(false)}
          />
        )}
      </>
    );
  }

  // DISPLAY MODE UI
  return (
    <div className="w-full">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-2 print:hidden">
        <div className="text-sm text-gray-600 dark:text-gray-400">{data.period}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 transition-all duration-200"
            title="Expand All Categories"
          >
            <ChevronsDown className="w-4 h-4" />
          </button>
          <button
            onClick={collapseAll}
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 transition-all duration-200"
            title="Collapse All Categories"
          >
            <ChevronsUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-br from-fis-eggplant via-fis-raspberry to-fis-eggplant p-5 rounded-t-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-roobert-bold text-white mb-1">{data.title}</h2>
              <p className="text-white/80 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {data.period}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-5 py-3 border border-white/30">
              <div className="text-xs text-white/80 uppercase tracking-wide mb-1">Capex vs Opex</div>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-sm text-blue-300">Capex</div>
                  <div className="text-lg font-roobert-bold text-white">{capexPercent}%</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-sm text-purple-300">Opex</div>
                  <div className="text-lg font-roobert-bold text-white">{opexPercent}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="text-xs text-white/70 uppercase tracking-wide mb-1">Total Forecast</div>
              <div className="text-xl font-roobert-bold text-white">{formatCurrency(data.totalForecast)}</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-md rounded-xl p-3 border border-blue-400/30">
              <div className="text-xs text-blue-200 uppercase tracking-wide mb-1">Capex (One-Time)</div>
              <div className="text-xl font-roobert-bold text-white">{formatCurrency(data.totalCapex)}</div>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-md rounded-xl p-3 border border-purple-400/30">
              <div className="text-xs text-purple-200 uppercase tracking-wide mb-1">Opex (Yearly)</div>
              <div className="text-xl font-roobert-bold text-white">{formatCurrency(data.totalOpex)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-b-2xl">
        <div className="max-w-7xl mx-auto space-y-4">
          {data.categories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const IconComponent = ICON_MAP[category.icon] || DollarSign;
            
            return (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-6 flex items-center gap-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${getCategoryColor(category.color)} border flex items-center justify-center`}>
                    <IconComponent className="w-7 h-7 text-gray-700 dark:text-gray-200" />
                  </div>

                  {/* Category Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <span>Total: <strong className="text-gray-900 dark:text-white">{formatCurrency(category.totalAmount)}</strong></span>
                      <span className="text-blue-600 dark:text-blue-400">Capex: <strong>{formatCurrency(category.capexAmount)}</strong></span>
                      <span className="text-purple-600 dark:text-purple-400">Opex: <strong>{formatCurrency(category.opexAmount)}</strong></span>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="flex-shrink-0">
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Line Items (Expandable) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-6 space-y-2">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-roobert-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="col-span-5">Line Item</div>
                        <div className="col-span-2 text-right">Amount</div>
                        <div className="col-span-2 text-center">Type</div>
                        <div className="col-span-3 text-right">Actions</div>
                      </div>

                      {/* Line Items */}
                      {category.lineItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedLineItem({ category, item })}
                          className="grid grid-cols-12 gap-4 px-4 py-4 rounded-lg transition-all cursor-pointer bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-fis-eggplant/5 hover:to-fis-raspberry/5 hover:border-l-2 hover:border-fis-raspberry hover:shadow-md w-full text-left"
                        >
                          <div className="col-span-5 flex items-center">
                            <span className="text-sm font-roobert-medium text-gray-900 dark:text-white">
                              {item.name}
                            </span>
                          </div>
                          <div className="col-span-2 text-right text-sm font-roobert-semibold text-gray-900 dark:text-white">
                            {formatCurrency(item.amount)}
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-roobert-medium ${getTypeBadge(item.type)}`}>
                              {getTypeLabel(item.type)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Notes Section */}
        {data.notes && (
          <div className="max-w-7xl mx-auto mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-roobert-semibold text-blue-900 dark:text-blue-300 mb-1">
                  Executive Notes
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-400">{data.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLineItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-fis-eggplant to-fis-raspberry p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-roobert-bold mb-1">{selectedLineItem.item.name}</h3>
                  <p className="text-white/80 text-sm">{selectedLineItem.category.name}</p>
                </div>
                <button
                  onClick={() => setSelectedLineItem(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Amount</div>
                  <div className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedLineItem.item.amount)}
                  </div>
                </div>
                <div className={`rounded-xl p-4 ${
                  selectedLineItem.item.type === 'capex' 
                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                    : 'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                  <div className="text-xs uppercase tracking-wide mb-2 ${
                    selectedLineItem.item.type === 'capex'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-purple-600 dark:text-purple-400'
                  }">Type</div>
                  <div className={`text-2xl font-roobert-bold ${
                    selectedLineItem.item.type === 'capex'
                      ? 'text-blue-900 dark:text-blue-100'
                      : 'text-purple-900 dark:text-purple-100'
                  }`}>
                    {getTypeLabel(selectedLineItem.item.type)}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedLineItem.item.description && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                    Description
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    {selectedLineItem.item.description}
                  </p>
                </div>
              )}

              {/* Summary */}
              {selectedLineItem.item.summary && selectedLineItem.item.summaryVisible !== false && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                    Summary
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-r from-fis-eggplant/5 to-fis-raspberry/5 dark:from-fis-eggplant/10 dark:to-fis-raspberry/10 p-4 rounded-lg border-l-4 border-fis-eggplant dark:border-fis-raspberry">
                    {selectedLineItem.item.summary}
                  </p>
                </div>
              )}

              {/* Challenges */}
              {selectedLineItem.item.explanation && selectedLineItem.item.explanationVisible !== false && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                    Challenges
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-2">Problems being solved with this spend</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    {selectedLineItem.item.explanation}
                  </p>
                </div>
              )}

              {/* Justification */}
              {selectedLineItem.item.justification && selectedLineItem.item.justificationVisible !== false && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                    Justification
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-2">Why we went with this cost/approach</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    {selectedLineItem.item.justification}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Owner</div>
                  <div className="text-sm font-roobert-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                    {selectedLineItem.item.owner}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Last Updated</div>
                  <div className="text-sm font-roobert-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                    {new Date(selectedLineItem.item.lastUpdated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
