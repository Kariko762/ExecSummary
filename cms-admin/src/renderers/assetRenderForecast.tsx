/**
 * FORECAST & FINANCIAL PLANNING RENDERER
 * 
 * Initiative-based financial planning with flexible cost centers
 * - Initiative containers with term-based total cost calculation
 * - Protected Capex/Opex cost centers (can be empty but not removed)
 * - Dynamic custom cost centers (IDSW, Consulting, etc. - can add/remove)
 * - Line item drill-down with detailed modals
 * - Hierarchical expand/collapse functionality
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Info,
  Calendar,
  DollarSign,
  Building2,
  AlertCircle,
  Edit3
} from 'lucide-react';
import { ForecastEditorModal } from '../components/ForecastEditorModal';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface LineItem {
  id: string;
  name: string;
  amount: number;
  description?: string;
  summary?: string;
  justification?: string;
  owner?: string;
  lastUpdated?: string;
}

interface CostCenter {
  id: string;
  type: 'capex' | 'opex' | 'custom';
  name: string; // Display name (for custom centers like "IDSW", "Consulting")
  lineItems: LineItem[];
  removable: boolean; // false for capex/opex, true for custom
  customType?: 'one-time' | 'yearly'; // For custom cost centers only
}

interface Initiative {
  id: string;
  name: string;
  termYears: number;
  costCenters: CostCenter[];
}

interface ForecastData {
  title: string;
  currency: string;
  period: string;
  initiatives: Initiative[];
  notes?: string;
}

interface ForecastBreakdownProps {
  data: ForecastData;
  mode?: 'edit' | 'display';
  onChange?: (value: ForecastData) => void;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export const ForecastBreakdown: React.FC<ForecastBreakdownProps> = ({ 
  data, 
  mode = 'display', 
  onChange 
}) => {
  const [expandedInitiatives, setExpandedInitiatives] = useState<Set<string>>(new Set());
  const [expandedCostCenters, setExpandedCostCenters] = useState<Set<string>>(new Set());
  const [selectedLineItem, setSelectedLineItem] = useState<{
    initiative: Initiative;
    costCenter: CostCenter;
    item: LineItem;
  } | null>(null);
  const [showForecastEditor, setShowForecastEditor] = useState(false);

  // Listen for expand/collapse events from ContentModal
  useEffect(() => {
    const handleExpandAll = () => {
      if (data?.initiatives) {
        setExpandedInitiatives(new Set(data.initiatives.map(i => i.id)));
        const allCostCenterIds = data.initiatives.flatMap(i => 
          i.costCenters.map(cc => `${i.id}-${cc.id}`)
        );
        setExpandedCostCenters(new Set(allCostCenterIds));
      }
    };

    const handleCollapseAll = () => {
      setExpandedInitiatives(new Set());
      setExpandedCostCenters(new Set());
    };

    window.addEventListener('forecast:expandAll', handleExpandAll);
    window.addEventListener('forecast:collapseAll', handleCollapseAll);

    return () => {
      window.removeEventListener('forecast:expandAll', handleExpandAll);
      window.removeEventListener('forecast:collapseAll', handleCollapseAll);
    };
  }, [data]);

  if (!data || !data.initiatives) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-600 dark:text-red-400">Invalid forecast data - missing initiatives</p>
      </div>
    );
  }

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total for a cost center (with term-based multiplier for recurring costs)
  const getCostCenterTotal = (costCenter: CostCenter, termYears: number = 1): number => {
    const baseTotal = costCenter.lineItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Opex is always yearly - multiply by term
    if (costCenter.type === 'opex') {
      return baseTotal * termYears;
    }
    
    // Custom centers can be one-time or yearly
    if (costCenter.type === 'custom' && costCenter.customType === 'yearly') {
      return baseTotal * termYears;
    }
    
    // Capex and one-time custom are not multiplied
    return baseTotal;
  };

  // Calculate total for an initiative (applies term to each cost center)
  const getInitiativeTotal = (initiative: Initiative): number => {
    return initiative.costCenters.reduce((sum, cc) => sum + getCostCenterTotal(cc, initiative.termYears), 0);
  };

  // Calculate grand totals across all initiatives (with term-based Opex)
  const calculateGrandTotals = () => {
    let totalCapex = 0;
    let totalOpex = 0;
    let totalCustom = 0;

    data.initiatives.forEach(initiative => {
      initiative.costCenters.forEach(costCenter => {
        const centerTotal = getCostCenterTotal(costCenter, initiative.termYears);
        
        if (costCenter.type === 'capex') {
          totalCapex += centerTotal;
        } else if (costCenter.type === 'opex') {
          totalOpex += centerTotal;
        } else {
          totalCustom += centerTotal;
        }
      });
    });

    const grandTotal = totalCapex + totalOpex + totalCustom;
    return { totalCapex, totalOpex, totalCustom, grandTotal };
  };

  const totals = calculateGrandTotals();
  const capexPercent = totals.grandTotal > 0 ? ((totals.totalCapex / totals.grandTotal) * 100).toFixed(1) : '0.0';
  const opexPercent = totals.grandTotal > 0 ? ((totals.totalOpex / totals.grandTotal) * 100).toFixed(1) : '0.0';

  // Get cost center display info
  const getCostCenterBadge = (type: string) => {
    if (type === 'capex') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (type === 'opex') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getCostCenterLabel = (costCenter: CostCenter) => {
    if (costCenter.type === 'capex') return 'Capex (One-Time)';
    if (costCenter.type === 'opex') return 'Opex (Recurring/Year)';
    return costCenter.name;
  };

  // Toggle functions
  const toggleInitiative = (initiativeId: string) => {
    const newExpanded = new Set(expandedInitiatives);
    if (newExpanded.has(initiativeId)) {
      newExpanded.delete(initiativeId);
    } else {
      newExpanded.add(initiativeId);
    }
    setExpandedInitiatives(newExpanded);
  };

  const toggleCostCenter = (initiativeId: string, costCenterId: string) => {
    const key = `${initiativeId}-${costCenterId}`;
    const newExpanded = new Set(expandedCostCenters);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedCostCenters(newExpanded);
  };

  // ==========================================
  // EDIT MODE HANDLERS
  // ==========================================

  const addInitiative = () => {
    if (!onChange) return;
    
    const newInitiative: Initiative = {
      id: `initiative-${Date.now()}`,
      name: 'New Initiative',
      termYears: 1,
      costCenters: [
        {
          id: 'capex',
          type: 'capex',
          name: 'Capex',
          lineItems: [],
          removable: false
        },
        {
          id: 'opex',
          type: 'opex',
          name: 'Opex',
          lineItems: [],
          removable: false
        }
      ]
    };

    onChange({
      ...data,
      initiatives: [...data.initiatives, newInitiative]
    });
  };

  const removeInitiative = (initiativeId: string) => {
    if (!onChange) return;
    onChange({
      ...data,
      initiatives: data.initiatives.filter(i => i.id !== initiativeId)
    });
  };

  const addCostCenter = (initiativeId: string) => {
    if (!onChange) return;

    const updatedInitiatives = data.initiatives.map(initiative => {
      if (initiative.id === initiativeId) {
        const newCostCenter: CostCenter = {
          id: `custom-${Date.now()}`,
          type: 'custom',
          name: 'New Cost Center',
          lineItems: [],
          removable: true
        };
        return {
          ...initiative,
          costCenters: [...initiative.costCenters, newCostCenter]
        };
      }
      return initiative;
    });

    onChange({ ...data, initiatives: updatedInitiatives });
  };

  const removeCostCenter = (initiativeId: string, costCenterId: string) => {
    if (!onChange) return;

    const updatedInitiatives = data.initiatives.map(initiative => {
      if (initiative.id === initiativeId) {
        return {
          ...initiative,
          costCenters: initiative.costCenters.filter(cc => cc.id !== costCenterId)
        };
      }
      return initiative;
    });

    onChange({ ...data, initiatives: updatedInitiatives });
  };

  const addLineItem = (initiativeId: string, costCenterId: string) => {
    if (!onChange) return;

    const updatedInitiatives = data.initiatives.map(initiative => {
      if (initiative.id === initiativeId) {
        return {
          ...initiative,
          costCenters: initiative.costCenters.map(cc => {
            if (cc.id === costCenterId) {
              const newLineItem: LineItem = {
                id: `item-${Date.now()}`,
                name: 'New Line Item',
                amount: 0,
                description: '',
                owner: '',
                lastUpdated: new Date().toISOString()
              };
              return {
                ...cc,
                lineItems: [...cc.lineItems, newLineItem]
              };
            }
            return cc;
          })
        };
      }
      return initiative;
    });

    onChange({ ...data, initiatives: updatedInitiatives });
  };

  const removeLineItem = (initiativeId: string, costCenterId: string, itemId: string) => {
    if (!onChange) return;

    const updatedInitiatives = data.initiatives.map(initiative => {
      if (initiative.id === initiativeId) {
        return {
          ...initiative,
          costCenters: initiative.costCenters.map(cc => {
            if (cc.id === costCenterId) {
              return {
                ...cc,
                lineItems: cc.lineItems.filter(item => item.id !== itemId)
              };
            }
            return cc;
          })
        };
      }
      return initiative;
    });

    onChange({ ...data, initiatives: updatedInitiatives });
  };

  const updateInitiative = (initiativeId: string, field: keyof Initiative, value: any) => {
    if (!onChange) return;

    const updatedInitiatives = data.initiatives.map(initiative => {
      if (initiative.id === initiativeId) {
        return { ...initiative, [field]: value };
      }
      return initiative;
    });

    onChange({ ...data, initiatives: updatedInitiatives });
  };

  const updateCostCenter = (initiativeId: string, costCenterId: string, field: keyof CostCenter, value: any) => {
    if (!onChange) return;

    const updatedInitiatives = data.initiatives.map(initiative => {
      if (initiative.id === initiativeId) {
        return {
          ...initiative,
          costCenters: initiative.costCenters.map(cc => {
            if (cc.id === costCenterId) {
              return { ...cc, [field]: value };
            }
            return cc;
          })
        };
      }
      return initiative;
    });

    onChange({ ...data, initiatives: updatedInitiatives });
  };

  const updateLineItem = (initiativeId: string, costCenterId: string, itemId: string, field: keyof LineItem, value: any) => {
    if (!onChange) return;

    const updatedInitiatives = data.initiatives.map(initiative => {
      if (initiative.id === initiativeId) {
        return {
          ...initiative,
          costCenters: initiative.costCenters.map(cc => {
            if (cc.id === costCenterId) {
              return {
                ...cc,
                lineItems: cc.lineItems.map(item => {
                  if (item.id === itemId) {
                    return { ...item, [field]: value };
                  }
                  return item;
                })
              };
            }
            return cc;
          })
        };
      }
      return initiative;
    });

    onChange({ ...data, initiatives: updatedInitiatives });
  };

  // ==========================================
  // EDIT MODE UI
  // ==========================================

  if (mode === 'edit') {
    return (
      <>
        <div className="w-full space-y-4 p-6 bg-white/5 dark:bg-black/20 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-roobert-semibold text-fis-eggplant dark:text-fis-raspberry">
              Forecast General Settings
            </h3>
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
              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => onChange?.({ ...data, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., 2026 Technology Forecast"
              />
            </div>
            <div>
              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                Period
              </label>
              <input
                type="text"
                value={data.period || ''}
                onChange={(e) => onChange?.({ ...data, period: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="e.g., FY 2026"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={data.currency || 'USD'}
              onChange={(e) => onChange?.({ ...data, currency: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
              Executive Notes
            </label>
            <textarea
              value={data.notes || ''}
              onChange={(e) => onChange?.({ ...data, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Add executive summary notes..."
            />
          </div>

          {/* Summary Stats */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-blue-800 dark:text-blue-200 font-roobert-medium">
                  {data.initiatives?.length || 0} initiatives
                </span>
                <span className="text-blue-600 dark:text-blue-400 mx-2">•</span>
                <span className="text-blue-800 dark:text-blue-200 font-roobert-medium">
                  {data.initiatives?.reduce((sum, init) => sum + init.costCenters.length, 0) || 0} cost centers
                </span>
                <span className="text-blue-600 dark:text-blue-400 mx-2">•</span>
                <span className="text-blue-800 dark:text-blue-200 font-roobert-medium">
                  Total: {formatCurrency(totals.grandTotal)}
                </span>
              </div>
              <button
                onClick={() => setShowForecastEditor(true)}
                className="text-blue-700 dark:text-blue-300 hover:underline font-roobert-medium"
              >
                Click "Edit Forecast Details" to manage initiatives →
              </button>
            </div>
          </div>
        </div>

        {/* Forecast Editor Modal */}
        {showForecastEditor && onChange && (
          <ForecastEditorModal
            data={data}
            onChange={onChange}
            onClose={() => setShowForecastEditor(false)}
          />
        )}
      </>
    );
  }

  // ==========================================
  // DISPLAY MODE UI
  // ==========================================

  return (
    <div className="w-full">
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
              <div className="text-xs text-white/80 uppercase tracking-wide mb-1">Cost Split</div>
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
              <div className="text-xl font-roobert-bold text-white">{formatCurrency(totals.grandTotal)}</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-md rounded-xl p-3 border border-blue-400/30">
              <div className="text-xs text-blue-200 uppercase tracking-wide mb-1">Total Capex</div>
              <div className="text-xl font-roobert-bold text-white">{formatCurrency(totals.totalCapex)}</div>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-md rounded-xl p-3 border border-purple-400/30">
              <div className="text-xs text-purple-200 uppercase tracking-wide mb-1">Total Opex</div>
              <div className="text-xl font-roobert-bold text-white">{formatCurrency(totals.totalOpex)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Initiatives Section */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-b-2xl">
        <div className="max-w-7xl mx-auto space-y-4">
          {data.initiatives.map((initiative) => {
            const initiativeTotal = getInitiativeTotal(initiative);
            const isExpanded = expandedInitiatives.has(initiative.id);

            return (
              <div
                key={initiative.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Initiative Header */}
                <button
                  onClick={() => toggleInitiative(initiative.id)}
                  className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <div className="flex-shrink-0">
                    <Building2 className="w-6 h-6 text-fis-eggplant dark:text-fis-raspberry" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-1">
                      {initiative.name}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white">{formatCurrency(initiativeTotal)}</strong> over{' '}
                      <strong className="text-gray-900 dark:text-white">{initiative.termYears}</strong> year{initiative.termYears !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Cost Centers */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 space-y-3">
                    {initiative.costCenters.map((costCenter) => {
                      const ccKey = `${initiative.id}-${costCenter.id}`;
                      const ccExpanded = expandedCostCenters.has(ccKey);
                      const ccTotal = getCostCenterTotal(costCenter);

                      return (
                        <div
                          key={costCenter.id}
                          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                          {/* Cost Center Header */}
                          <button
                            onClick={() => toggleCostCenter(initiative.id, costCenter.id)}
                            className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                          >
                            <div className="flex-shrink-0">
                              {ccExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                            </div>

                            <span className={`px-3 py-1 rounded-full text-xs font-roobert-semibold ${getCostCenterBadge(costCenter.type)}`}>
                              {getCostCenterLabel(costCenter)}
                            </span>

                            <div className="flex-1"></div>

                            <div className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                              {formatCurrency(ccTotal)}
                            </div>
                          </button>

                          {/* Line Items */}
                          {ccExpanded && (
                            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                              {costCenter.lineItems.length === 0 ? (
                                <div className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
                                  No line items in this cost center
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {costCenter.lineItems.map((item) => (
                                    <button
                                      key={item.id}
                                      onClick={() => setSelectedLineItem({ initiative, costCenter, item })}
                                      className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gradient-to-r hover:from-fis-eggplant/5 hover:to-fis-raspberry/5 hover:border-l-2 hover:border-fis-raspberry transition-all text-left"
                                    >
                                      <span className="text-sm font-roobert-medium text-gray-900 dark:text-white">
                                        {item.name}
                                      </span>
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                                          {formatCurrency(item.amount)}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                          Click for details →
                                        </span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
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

      {/* Line Item Detail Modal */}
      {selectedLineItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-fis-eggplant to-fis-raspberry p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-roobert-bold mb-1">{selectedLineItem.item.name}</h3>
                  <p className="text-white/80 text-sm">
                    {selectedLineItem.initiative.name} • {getCostCenterLabel(selectedLineItem.costCenter)}
                  </p>
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
              {/* Amount Display */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Amount
                </div>
                <div className="text-3xl font-roobert-bold text-gray-900 dark:text-white">
                  {formatCurrency(selectedLineItem.item.amount)}
                </div>
              </div>

              {/* Description */}
              {selectedLineItem.item.description && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                    Description
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    {selectedLineItem.item.description}
                  </p>
                </div>
              )}

              {/* Summary */}
              {selectedLineItem.item.summary && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                    Summary
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-r from-fis-eggplant/5 to-fis-raspberry/5 dark:from-fis-eggplant/10 dark:to-fis-raspberry/10 p-4 rounded-lg border-l-4 border-fis-eggplant dark:border-fis-raspberry">
                    {selectedLineItem.item.summary}
                  </p>
                </div>
              )}

              {/* Justification */}
              {selectedLineItem.item.justification && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-fis-eggplant dark:text-fis-raspberry" />
                    Justification
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    {selectedLineItem.item.justification}
                  </p>
                </div>
              )}

              {/* Metadata */}
              {(selectedLineItem.item.owner || selectedLineItem.item.lastUpdated) && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {selectedLineItem.item.owner && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Owner
                      </div>
                      <div className="text-sm font-roobert-medium text-gray-900 dark:text-white">
                        {selectedLineItem.item.owner}
                      </div>
                    </div>
                  )}
                  {selectedLineItem.item.lastUpdated && (
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Last Updated
                      </div>
                      <div className="text-sm font-roobert-medium text-gray-900 dark:text-white">
                        {new Date(selectedLineItem.item.lastUpdated).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
