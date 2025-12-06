/**
 * FORECAST EDITOR MODAL
 * 
 * Dedicated full-screen editor for initiative-based forecast data
 * - Tabbed interface for settings, initiatives, cost centers, and line items
 * - Hierarchical editing: Initiative → Cost Center → Line Items
 * - Term-based Opex calculation (yearly costs × term length)
 * - Custom cost center type configuration (One-Time vs Yearly)
 * - Live preview of forecast display
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Eye,
  Settings,
  Building2,
  DollarSign,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { ForecastBreakdown } from '../renderers/assetRenderForecast';

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
  name: string;
  lineItems: LineItem[];
  removable: boolean;
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

interface ForecastEditorModalProps {
  data: ForecastData;
  onChange: (value: ForecastData) => void;
  onClose: () => void;
}

export const ForecastEditorModal: React.FC<ForecastEditorModalProps> = ({ data, onChange, onClose }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'initiatives' | 'preview'>('settings');
  const [expandedInitiatives, setExpandedInitiatives] = useState<Set<string>>(new Set());
  const [expandedCostCenters, setExpandedCostCenters] = useState<Set<string>>(new Set());
  const [selectedInitiative, setSelectedInitiative] = useState<string | null>(null);

  // Helper: Calculate totals with term-based Opex
  const calculateTotals = () => {
    let totalCapex = 0;
    let totalOpex = 0;
    let totalCustom = 0;

    data.initiatives.forEach(initiative => {
      initiative.costCenters.forEach(costCenter => {
        const centerTotal = costCenter.lineItems.reduce((sum, item) => sum + item.amount, 0);
        
        if (costCenter.type === 'capex') {
          totalCapex += centerTotal;
        } else if (costCenter.type === 'opex') {
          // Opex is yearly - multiply by term length
          totalOpex += centerTotal * initiative.termYears;
        } else if (costCenter.type === 'custom') {
          // Custom centers can be one-time or yearly
          if (costCenter.customType === 'yearly') {
            totalCustom += centerTotal * initiative.termYears;
          } else {
            totalCustom += centerTotal;
          }
        }
      });
    });

    return { totalCapex, totalOpex, totalCustom, grandTotal: totalCapex + totalOpex + totalCustom };
  };

  const totals = calculateTotals();

  // Initiative Management
  const addInitiative = () => {
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
    onChange({ ...data, initiatives: [...data.initiatives, newInitiative] });
    setExpandedInitiatives(new Set([...expandedInitiatives, newInitiative.id]));
  };

  const updateInitiative = (initiativeId: string, field: keyof Initiative, value: any) => {
    const updatedInitiatives = data.initiatives.map(initiative =>
      initiative.id === initiativeId ? { ...initiative, [field]: value } : initiative
    );
    onChange({ ...data, initiatives: updatedInitiatives });
  };

  const deleteInitiative = (initiativeId: string) => {
    onChange({ ...data, initiatives: data.initiatives.filter(i => i.id !== initiativeId) });
    expandedInitiatives.delete(initiativeId);
    setExpandedInitiatives(new Set(expandedInitiatives));
  };

  // Cost Center Management
  const addCostCenter = (initiativeId: string) => {
    const updatedInitiatives = data.initiatives.map(initiative => {
      if (initiative.id === initiativeId) {
        const newCostCenter: CostCenter = {
          id: `custom-${Date.now()}`,
          type: 'custom',
          name: 'New Cost Center',
          lineItems: [],
          removable: true,
          customType: 'one-time' // Default to one-time
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

  const updateCostCenter = (initiativeId: string, costCenterId: string, field: keyof CostCenter, value: any) => {
    const updatedInitiatives = data.initiatives.map(initiative => {
      if (initiative.id === initiativeId) {
        return {
          ...initiative,
          costCenters: initiative.costCenters.map(cc =>
            cc.id === costCenterId ? { ...cc, [field]: value } : cc
          )
        };
      }
      return initiative;
    });
    onChange({ ...data, initiatives: updatedInitiatives });
  };

  const deleteCostCenter = (initiativeId: string, costCenterId: string) => {
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

  // Line Item Management
  const addLineItem = (initiativeId: string, costCenterId: string) => {
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
                summary: '',
                justification: '',
                owner: '',
                lastUpdated: new Date().toISOString()
              };
              return { ...cc, lineItems: [...cc.lineItems, newLineItem] };
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
    const updatedInitiatives = data.initiatives.map(initiative => {
      if (initiative.id === initiativeId) {
        return {
          ...initiative,
          costCenters: initiative.costCenters.map(cc => {
            if (cc.id === costCenterId) {
              return {
                ...cc,
                lineItems: cc.lineItems.map(item =>
                  item.id === itemId ? { ...item, [field]: value } : item
                )
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

  const deleteLineItem = (initiativeId: string, costCenterId: string, itemId: string) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCostCenterTotal = (costCenter: CostCenter, termYears: number = 1): number => {
    const baseTotal = costCenter.lineItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Apply term multiplier for recurring costs
    if (costCenter.type === 'opex') {
      return baseTotal * termYears;
    }
    if (costCenter.type === 'custom' && costCenter.customType === 'yearly') {
      return baseTotal * termYears;
    }
    
    return baseTotal; // One-time costs
  };

  const getInitiativeTotal = (initiative: Initiative): number => {
    return initiative.costCenters.reduce((sum, cc) => sum + getCostCenterTotal(cc, initiative.termYears), 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-fis-eggplant to-fis-raspberry p-6 text-white rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-roobert-bold mb-1">Forecast Editor</h2>
              <p className="text-white/80 text-sm">Manage initiatives, cost centers, and financial planning</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4">
                <div className="text-xs text-white/70 uppercase tracking-wide">Total Forecast</div>
                <div className="text-xl font-roobert-bold">{formatCurrency(totals.grandTotal)}</div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === 'settings'
                  ? 'bg-white text-fis-eggplant'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => setActiveTab('initiatives')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === 'initiatives'
                  ? 'bg-white text-fis-eggplant'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Initiatives ({data.initiatives.length})
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-fis-eggplant'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Forecast Title
                  </label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => onChange({ ...data, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., 2026 Technology Investment Forecast"
                  />
                </div>
                <div>
                  <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Period
                  </label>
                  <input
                    type="text"
                    value={data.period}
                    onChange={(e) => onChange({ ...data, period: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., FY 2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={data.currency}
                  onChange={(e) => onChange({ ...data, currency: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Executive Notes
                </label>
                <textarea
                  value={data.notes || ''}
                  onChange={(e) => onChange({ ...data, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Add strategic context, assumptions, or key insights..."
                />
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 p-6 bg-gradient-to-r from-fis-eggplant/10 to-fis-raspberry/10 rounded-xl border border-fis-eggplant/20">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Total Forecast
                  </div>
                  <div className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
                    {formatCurrency(totals.grandTotal)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                    Capex (One-Time)
                  </div>
                  <div className="text-2xl font-roobert-bold text-blue-700 dark:text-blue-400">
                    {formatCurrency(totals.totalCapex)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                    Opex (Recurring)
                  </div>
                  <div className="text-2xl font-roobert-bold text-purple-700 dark:text-purple-400">
                    {formatCurrency(totals.totalOpex)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Custom
                  </div>
                  <div className="text-2xl font-roobert-bold text-gray-700 dark:text-gray-300">
                    {formatCurrency(totals.totalCustom)}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Opex Calculation:</strong> Recurring costs (Opex and Yearly custom centers) are automatically multiplied by each initiative's term length.
                  For example, $100K/year Opex over 3 years = $300K total.
                </div>
              </div>
            </div>
          )}

          {/* Initiatives Tab */}
          {activeTab === 'initiatives' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
                    Initiatives & Cost Centers
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage financial initiatives with term-based planning
                  </p>
                </div>
                <button
                  onClick={addInitiative}
                  className="px-4 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Initiative
                </button>
              </div>

              {data.initiatives.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No initiatives yet. Click "Add Initiative" to get started.</p>
                </div>
              ) : (
                data.initiatives.map((initiative) => {
                  const isExpanded = expandedInitiatives.has(initiative.id);
                  const initiativeTotal = getInitiativeTotal(initiative);

                  return (
                    <div
                      key={initiative.id}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                    >
                      {/* Initiative Header */}
                      <div className="bg-gray-100 dark:bg-gray-800 p-4">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleInitiative(initiative.id)}
                            className="mt-2"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            )}
                          </button>

                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Initiative Name
                                </label>
                                <input
                                  type="text"
                                  value={initiative.name}
                                  onChange={(e) => updateInitiative(initiative.id, 'name', e.target.value)}
                                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  placeholder="e.g., Cloud Migration Project"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Term (Years)
                                </label>
                                <input
                                  type="number"
                                  value={initiative.termYears}
                                  onChange={(e) => updateInitiative(initiative.id, 'termYears', parseInt(e.target.value) || 1)}
                                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  min="1"
                                />
                              </div>
                              <div className="flex items-end justify-between">
                                <div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Cost</div>
                                  <div className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                                    {formatCurrency(initiativeTotal)}
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteInitiative(initiative.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Delete initiative"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cost Centers */}
                      {isExpanded && (
                        <div className="p-4 bg-white dark:bg-gray-900 space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300">
                              Cost Centers
                            </span>
                            <button
                              onClick={() => addCostCenter(initiative.id)}
                              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Add Cost Center
                            </button>
                          </div>

                          {initiative.costCenters.map((costCenter) => {
                            const ccKey = `${initiative.id}-${costCenter.id}`;
                            const ccExpanded = expandedCostCenters.has(ccKey);
                            const ccTotal = getCostCenterTotal(costCenter, initiative.termYears);
                            const ccBaseTotal = costCenter.lineItems.reduce((sum, item) => sum + item.amount, 0);

                            return (
                              <div
                                key={costCenter.id}
                                className="border border-gray-200 dark:border-gray-700 rounded"
                              >
                                {/* Cost Center Header */}
                                <div className="bg-gray-50 dark:bg-gray-800 p-3">
                                  <div className="flex items-start gap-2">
                                    <button
                                      onClick={() => toggleCostCenter(initiative.id, costCenter.id)}
                                      className="mt-1"
                                    >
                                      {ccExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                      )}
                                    </button>

                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${
                                          costCenter.type === 'capex'
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                            : costCenter.type === 'opex'
                                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}>
                                          {costCenter.type.toUpperCase()}
                                        </span>

                                        {costCenter.type === 'custom' && (
                                          <>
                                            <input
                                              type="text"
                                              value={costCenter.name}
                                              onChange={(e) => updateCostCenter(initiative.id, costCenter.id, 'name', e.target.value)}
                                              className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                              placeholder="Cost center name (e.g., IDSW)"
                                            />
                                            <select
                                              value={costCenter.customType || 'one-time'}
                                              onChange={(e) => updateCostCenter(initiative.id, costCenter.id, 'customType', e.target.value as 'one-time' | 'yearly')}
                                              className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                            >
                                              <option value="one-time">One-Time</option>
                                              <option value="yearly">Yearly</option>
                                            </select>
                                          </>
                                        )}

                                        {costCenter.type !== 'custom' && (
                                          <span className="flex-1 text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                                            {costCenter.type === 'capex' ? 'Capex (One-Time)' : 'Opex (Recurring/Year)'}
                                          </span>
                                        )}

                                        <div className="text-right">
                                          {(costCenter.type === 'opex' || costCenter.customType === 'yearly') && initiative.termYears > 1 ? (
                                            <div>
                                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatCurrency(ccBaseTotal)}/yr × {initiative.termYears}y
                                              </div>
                                              <div className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                                                {formatCurrency(ccTotal)}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                                              {formatCurrency(ccTotal)}
                                            </div>
                                          )}
                                        </div>

                                        <button
                                          onClick={() => addLineItem(initiative.id, costCenter.id)}
                                          className="p-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                                          title="Add line item"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>

                                        {costCenter.removable && (
                                          <button
                                            onClick={() => deleteCostCenter(initiative.id, costCenter.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            title="Delete cost center"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Line Items */}
                                {ccExpanded && (
                                  <div className="p-3 space-y-2 bg-white dark:bg-gray-900">
                                    {costCenter.lineItems.length === 0 ? (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-3">
                                        No line items - click + to add
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-12 gap-2 px-2 text-xs font-roobert-semibold text-gray-500 dark:text-gray-400 uppercase">
                                          <div className="col-span-4">Name</div>
                                          <div className="col-span-2 text-right">Amount/yr</div>
                                          <div className="col-span-3">Owner</div>
                                          <div className="col-span-2">Last Updated</div>
                                          <div className="col-span-1"></div>
                                        </div>

                                        {/* Line Items */}
                                        {costCenter.lineItems.map((item) => (
                                          <div
                                            key={item.id}
                                            className="grid grid-cols-12 gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded items-center"
                                          >
                                            <input
                                              type="text"
                                              value={item.name}
                                              onChange={(e) => updateLineItem(initiative.id, costCenter.id, item.id, 'name', e.target.value)}
                                              className="col-span-4 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                              placeholder="Line item name"
                                            />
                                            <input
                                              type="number"
                                              value={item.amount}
                                              onChange={(e) => updateLineItem(initiative.id, costCenter.id, item.id, 'amount', parseFloat(e.target.value) || 0)}
                                              className="col-span-2 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-right"
                                              placeholder="0"
                                            />
                                            <input
                                              type="text"
                                              value={item.owner || ''}
                                              onChange={(e) => updateLineItem(initiative.id, costCenter.id, item.id, 'owner', e.target.value)}
                                              className="col-span-3 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                              placeholder="Owner"
                                            />
                                            <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400">
                                              {item.lastUpdated
                                                ? new Date(item.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                : '-'}
                                            </div>
                                            <button
                                              onClick={() => deleteLineItem(initiative.id, costCenter.id, item.id)}
                                              className="col-span-1 p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded justify-self-end"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
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
                })
              )}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Preview Mode:</strong> This shows how your forecast will appear in the final document. Use the expand/collapse controls to test interactivity.
                </p>
              </div>
              <ForecastBreakdown data={data} mode="display" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0 flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data.initiatives.length} initiative{data.initiatives.length !== 1 ? 's' : ''} •{' '}
            {data.initiatives.reduce((sum, i) => sum + i.costCenters.length, 0)} cost centers •{' '}
            {data.initiatives.reduce((sum, i) => sum + i.costCenters.reduce((s, cc) => s + cc.lineItems.length, 0), 0)} line items
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
