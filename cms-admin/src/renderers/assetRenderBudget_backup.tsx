/**
 * BUDGET & FINANCIAL RENDERERS
 * 
 * Premium executive budget breakdown with interactive details
 * - Full-width financial dashboard
 * - Category-based grouping with variance tracking
 * - Line item drill-down via hover tooltips and modals
 * - Visual indicators for budget performance
 * - Responsive layout with glassmorphism design
 */

import React, { useState } from 'react';
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
import { BudgetEditorModal } from '../components/BudgetEditorModal';

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
  budgeted: number;
  actual: number;
  variance: number;
  explanation: string;
  justification: string;
  owner: string;
  lastUpdated: string;
}

interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: 'on-track' | 'at-risk' | 'over-budget';
  color: string;
  lineItems: LineItem[];
}

interface BudgetData {
  title: string;
  currency: string;
  period: string;
  totalBudget: number;
  totalActual: number;
  categories: BudgetCategory[];
  notes?: string;
}

interface BudgetBreakdownProps {
  data: BudgetData;
  mode?: 'edit' | 'display';
  onChange?: (value: BudgetData) => void;
}

export const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({ data, mode = 'display', onChange }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedLineItem, setSelectedLineItem] = useState<{ category: BudgetCategory; item: LineItem } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);

  if (!data || !data.categories) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-600 dark:text-red-400">Invalid budget data</p>
      </div>
    );
  }

  const totalVariance = data.totalBudget - data.totalActual;
  const totalVariancePercent = ((totalVariance / data.totalBudget) * 100).toFixed(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'at-risk':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'over-budget':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'on-track': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      'at-risk': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      'over-budget': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    };
    return badges[status as keyof typeof badges] || badges['on-track'];
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
  const updateBudgetField = (field: keyof BudgetData, value: any) => {
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
              <h3 className="text-lg font-roobert-semibold text-fis-eggplant dark:text-fis-raspberry">Budget General Settings</h3>
              <button
                onClick={() => setShowBudgetEditor(true)}
                className="px-4 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              >
                <Edit3 className="w-4 h-4" />
                Edit Budget Details
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={(e) => updateBudgetField('title', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="e.g., Q4 2025 Budget Review"
                />
              </div>
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Period</label>
                <input
                  type="text"
                  value={data.period || ''}
                  onChange={(e) => updateBudgetField('period', e.target.value)}
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
                  onChange={(e) => updateBudgetField('currency', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Total Budget</label>
                <input
                  type="number"
                  value={data.totalBudget || 0}
                  onChange={(e) => updateBudgetField('totalBudget', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Total Actual</label>
                <input
                  type="number"
                  value={data.totalActual || 0}
                  onChange={(e) => updateBudgetField('totalActual', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Executive Notes</label>
              <textarea
                value={data.notes || ''}
                onChange={(e) => updateBudgetField('notes', e.target.value)}
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
        {showBudgetEditor && onChange && (
          <BudgetEditorModal
            data={data}
            onChange={onChange}
            onClose={() => setShowBudgetEditor(false)}
          />
        )}
      </>
    );
  } );
  }

  // DISPLAY MODE UI
  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-fis-eggplant via-fis-raspberry to-fis-eggplant p-8 rounded-t-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-roobert-bold text-white mb-2">{data.title}</h2>
              <p className="text-white/80 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {data.period}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-6 py-4 border border-white/30">
              <div className="text-xs text-white/80 uppercase tracking-wide mb-1">Overall Status</div>
              <div className="flex items-center gap-2">
                {totalVariance < 0 ? (
                  <>
                    <TrendingDown className="w-5 h-5 text-emerald-300" />
                    <span className="text-2xl font-roobert-bold text-white">{formatPercent(parseFloat(totalVariancePercent))}</span>
                    <span className="text-sm text-emerald-300">Under Budget</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 text-amber-300" />
                    <span className="text-2xl font-roobert-bold text-white">{formatPercent(parseFloat(totalVariancePercent))}</span>
                    <span className="text-sm text-amber-300">Over Budget</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-xs text-white/70 uppercase tracking-wide mb-2">Total Budgeted</div>
              <div className="text-2xl font-roobert-bold text-white">{formatCurrency(data.totalBudget)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-xs text-white/70 uppercase tracking-wide mb-2">Actual Spend</div>
              <div className="text-2xl font-roobert-bold text-white">{formatCurrency(data.totalActual)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-xs text-white/70 uppercase tracking-wide mb-2">Variance</div>
              <div className={`text-2xl font-roobert-bold ${totalVariance < 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                {formatCurrency(Math.abs(totalVariance))}
              </div>
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
                      {getStatusIcon(category.status)}
                      <span className={`text-xs px-2.5 py-1 rounded-full font-roobert-medium ${getStatusBadge(category.status)}`}>
                        {category.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <span>Budgeted: <strong className="text-gray-900 dark:text-white">{formatCurrency(category.budgeted)}</strong></span>
                      <span>Actual: <strong className="text-gray-900 dark:text-white">{formatCurrency(category.actual)}</strong></span>
                      <span className={category.variance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                        Variance: <strong>{formatCurrency(Math.abs(category.variance))} ({formatPercent(category.variancePercent)})</strong>
                      </span>
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
                        <div className="col-span-4">Line Item</div>
                        <div className="col-span-2 text-right">Budgeted</div>
                        <div className="col-span-2 text-right">Actual</div>
                        <div className="col-span-2 text-right">Variance</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>

                      {/* Line Items */}
                      {category.lineItems.map((item) => (
                        <div
                          key={item.id}
                          className={`grid grid-cols-12 gap-4 px-4 py-4 rounded-lg transition-all cursor-pointer ${
                            hoveredItem === item.id
                              ? 'bg-white dark:bg-gray-700 shadow-md scale-[1.01]'
                              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/70'
                          }`}
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <div className="col-span-4 flex items-center">
                            <span className="text-sm font-roobert-medium text-gray-900 dark:text-white">
                              {item.name}
                            </span>
                          </div>
                          <div className="col-span-2 text-right text-sm text-gray-700 dark:text-gray-300">
                            {formatCurrency(item.budgeted)}
                          </div>
                          <div className="col-span-2 text-right text-sm text-gray-700 dark:text-gray-300">
                            {formatCurrency(item.actual)}
                          </div>
                          <div className="col-span-2 text-right">
                            <span className={`text-sm font-roobert-semibold ${
                              item.variance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {item.variance < 0 ? '-' : '+'}{formatCurrency(Math.abs(item.variance))}
                            </span>
                          </div>
                          <div className="col-span-2 text-right flex items-center justify-end gap-2">
                            {/* Tooltip Trigger */}
                            <button
                              onClick={() => setSelectedLineItem({ category, item })}
                              className="p-2 rounded-lg bg-fis-eggplant/10 hover:bg-fis-eggplant/20 dark:bg-fis-raspberry/10 dark:hover:bg-fis-raspberry/20 text-fis-eggplant dark:text-fis-raspberry transition-colors"
                              title="View details"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Inline Tooltip (Hover State) */}
                          {hoveredItem === item.id && (
                            <div className="col-span-12 mt-2 p-4 bg-gradient-to-r from-fis-eggplant/5 to-fis-raspberry/5 dark:from-fis-eggplant/10 dark:to-fis-raspberry/10 rounded-lg border-l-4 border-fis-eggplant dark:border-fis-raspberry">
                              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                <strong className="text-fis-eggplant dark:text-fis-raspberry">Quick Summary: </strong>
                                {item.explanation}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {item.owner}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Updated {new Date(item.lastUpdated).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
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
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Budgeted</div>
                  <div className="text-xl font-roobert-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedLineItem.item.budgeted)}
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Actual</div>
                  <div className="text-xl font-roobert-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedLineItem.item.actual)}
                  </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Variance</div>
                  <div className={`text-xl font-roobert-bold ${
                    selectedLineItem.item.variance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {selectedLineItem.item.variance < 0 ? '-' : '+'}{formatCurrency(Math.abs(selectedLineItem.item.variance))}
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                  Variance Explanation
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  {selectedLineItem.item.explanation}
                </p>
              </div>

              {/* Justification */}
              <div>
                <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                  Business Justification
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                  {selectedLineItem.item.justification}
                </p>
              </div>

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
