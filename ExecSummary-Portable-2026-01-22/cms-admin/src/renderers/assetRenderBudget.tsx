/**
 * BUDGET & FINANCIAL RENDERERS
 * 
 * Premium executive budget breakdown with interactive details
 * - Full-width financial dashboard
 * - Category-based grouping with variance tracking
 * - Line item drill-down via hover tooltips and modals
 * - Visual indicators for budget performance
 * - Responsive layout with glassmorphism design
 * 
 * PRODUCTION VERSION - DISPLAY MODE ONLY
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
  Download,
  Edit3
} from 'lucide-react';
import { BudgetEditorModal } from '../components/BudgetEditorModal';

// Icon mapping
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Users,
  Server,
  Building2,
  TrendingUp,
  DollarSign,
};

// TypeScript Interfaces
interface LineItem {
  id: string;
  name: string;
  budgeted: number;
  actual: number;
  variance: number;
  summary?: string;
  summaryVisible?: boolean;
  explanation?: string;
  explanationVisible?: boolean;
  justification?: string;
  justificationVisible?: boolean;
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
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);
  const budgetRef = React.useRef<HTMLDivElement>(null);

  // Edit mode render
  if (mode === 'edit') {
    return (
      <>
        <div className="w-full space-y-4 p-6 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-roobert-semibold text-brand-primary dark:text-brand-secondary">
              Budget General Settings
            </h3>
            <button
              onClick={() => setShowBudgetEditor(true)}
              className="px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' }}
            >
              <Edit3 className="w-4 h-4" />
              Edit Budget Details
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            Click "Edit Budget Details" to manage categories and line items →
          </div>
        </div>

        {showBudgetEditor && (
          <BudgetEditorModal
            data={data}
            onChange={(newData) => {
              onChange?.(newData);
            }}
            onClose={() => setShowBudgetEditor(false)}
          />
        )}
      </>
    );
  }

  // Listen for expand/collapse events from ContentModal
  React.useEffect(() => {
    const handleExpandAll = () => {
      const allIds = new Set(data.categories.map(cat => cat.id));
      setExpandedCategories(allIds);
    };

    const handleCollapseAll = () => {
      setExpandedCategories(new Set());
    };

    window.addEventListener('budget:expandAll', handleExpandAll);
    window.addEventListener('budget:collapseAll', handleCollapseAll);

    return () => {
      window.removeEventListener('budget:expandAll', handleExpandAll);
      window.removeEventListener('budget:collapseAll', handleCollapseAll);
    };
  }, [data.categories]);

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

  const exportAsImage = async () => {
    if (!budgetRef.current) return;
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(budgetRef.current, {
      scale: 2,
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--surface-primary').trim() || '#ffffff',
      logging: false,
    });
    const link = document.createElement('a');
    link.download = `${data.title.replace(/\s+/g, '-')}-budget.png`;
    link.href = canvas.toDataURL();
    link.click();
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

  return (
    <div className="w-full" ref={budgetRef}>
      {/* Header Section - Streamlined */}
      <div className="bg-white dark:bg-gray-900 px-5 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-roobert-bold text-gray-900 dark:text-white">{data.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {data.period}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-5 py-3 border border-white/30">
              <div className="text-xs text-white/80 uppercase tracking-wide mb-1">Overall Status</div>
              <div className="flex items-center gap-2">
                {totalVariance < 0 ? (
                  <>
                    <TrendingDown className="w-5 h-5 text-emerald-300" />
                    <span className="text-xl font-roobert-bold text-white">{formatPercent(parseFloat(totalVariancePercent))}</span>
                    <span className="text-sm text-emerald-300">Under Budget</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 text-amber-300" />
                    <span className="text-xl font-roobert-bold text-white">{formatPercent(parseFloat(totalVariancePercent))}</span>
                    <span className="text-sm text-amber-300">Over Budget</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="text-xs text-white/70 uppercase tracking-wide mb-1">Total Budgeted</div>
              <div className="text-xl font-roobert-bold text-white">{formatCurrency(data.totalBudget)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="text-xs text-white/70 uppercase tracking-wide mb-1">Actual Spend</div>
              <div className="text-xl font-roobert-bold text-white">{formatCurrency(data.totalActual)}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
              <div className="text-xs text-white/70 uppercase tracking-wide mb-1">Variance</div>
              <div className={`text-xl font-roobert-bold ${totalVariance < 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
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
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-6 flex items-center gap-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${getCategoryColor(category.color)} border shadow-sm flex items-center justify-center`}>
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
                      {category.lineItems && category.lineItems.length > 0 ? (
                        category.lineItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedLineItem({ category, item })}
                            className="w-full grid grid-cols-12 gap-4 px-4 py-4 rounded-lg transition-all bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-fis-eggplant/5 hover:to-fis-raspberry/5 dark:hover:from-fis-eggplant/10 dark:hover:to-fis-raspberry/10 hover:shadow-md hover:scale-[1.01] border border-transparent hover:border-fis-eggplant/20 dark:hover:border-fis-raspberry/20 text-left"
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
                            <Info className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                          </div>
                        </button>
                      ))
                      ) : (
                        <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                          No line items available for this category
                        </div>
                      )}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-end">
          <div className="bg-white dark:bg-gray-800 shadow-2xl w-[50vw] h-full overflow-hidden">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 p-6 text-white overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="money-pattern-detail" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                      <text x="10" y="25" fontSize="20" fill="currentColor" opacity="0.3">$</text>
                      <text x="45" y="25" fontSize="20" fill="currentColor" opacity="0.3">£</text>
                      <text x="25" y="55" fontSize="20" fill="currentColor" opacity="0.3">€</text>
                      <circle cx="60" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                      <circle cx="15" cy="65" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#money-pattern-detail)"/>
                </svg>
              </div>
              <div className="relative flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-roobert-bold mb-1">{selectedLineItem.item.name}</h3>
                  <p className="text-white/80 text-sm">{selectedLineItem.category.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportAsImage}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Export as image"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedLineItem(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-140px)]">
              {/* Financial Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Budgeted</div>
                  <div className="text-xl font-roobert-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedLineItem.item.budgeted)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Actual</div>
                  <div className="text-xl font-roobert-bold text-gray-900 dark:text-white">
                    {formatCurrency(selectedLineItem.item.actual)}
                  </div>
                </div>
                <div className={`rounded-xl p-4 border-2 ${
                  selectedLineItem.item.variance < 0 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                }`}>
                  <div className={`text-xs uppercase tracking-wide mb-2 ${
                    selectedLineItem.item.variance < 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                  }`}>Variance</div>
                  <div className={`text-xl font-roobert-bold ${
                    selectedLineItem.item.variance < 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                  }`}>
                    {selectedLineItem.item.variance < 0 ? '-' : '+'}{formatCurrency(Math.abs(selectedLineItem.item.variance))}
                  </div>
                </div>
              </div>

              {/* Summary Section (if visible) */}
              {selectedLineItem.item.summary && selectedLineItem.item.summaryVisible !== false && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-fis-eggplant dark:text-fis-raspberry mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Summary
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    {selectedLineItem.item.summary}
                  </p>
                </div>
              )}

              {/* Challenges (formerly Variance Explanation) (if visible) */}
              {selectedLineItem.item.explanation && selectedLineItem.item.explanationVisible !== false && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Challenges
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-amber-50/30 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200/50 dark:border-amber-800/30">
                    {selectedLineItem.item.explanation}
                  </p>
                </div>
              )}

              {/* Justification (if visible) */}
              {selectedLineItem.item.justification && selectedLineItem.item.justificationVisible !== false && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Justification
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-emerald-50/30 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
                    {selectedLineItem.item.justification}
                  </p>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 -mx-6 -mb-6 px-6 pb-6 mt-6">
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
