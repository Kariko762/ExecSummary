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
  Edit3,
  BarChart3,
  ChevronsDown,
  ChevronsUp
} from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import { ForecastEditorModal } from '../components/ForecastEditorModal';
import { ForecastPrintView } from './ForecastPrintView';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

interface LineItem {
  id: string;
  name: string;
  qty?: number;              // Quantity of units
  unitCost?: number;         // Cost per unit
  amount: number;            // Total cost (qty × unitCost, or legacy flat amount)
  description?: string;
  descriptionVisible?: boolean;
  summary?: string;
  summaryVisible?: boolean;
  justification?: string;
  justificationVisible?: boolean;
  owner?: string;
  lastUpdated?: string;
  
  // Multi-year contract fields for Opex
  contractTerm?: number;      // Years (e.g., 5)
  annualAmount?: number;      // Yearly cost (e.g., 150000)
  firstYearAmount?: number;   // Prorated first year if mid-year start (e.g., 75000)
  totalCommitment?: number;   // Calculated: annualAmount * contractTerm (e.g., 750000)
  startMonth?: string;        // Optional context (e.g., "June 2026")
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
  const [showYoYChart, setShowYoYChart] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [yoyViewMode, setYoyViewMode] = useState<'all' | string>('all'); // 'all' or initiative.id
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [selectedYearDetail, setSelectedYearDetail] = useState<any | null>(null);
  const yoyChartRef = React.useRef<HTMLDivElement>(null);
  const printViewRef = React.useRef<HTMLDivElement>(null);

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

  const getInitiativeFirstYearCost = (initiative: Initiative): number => {
    return initiative.costCenters.reduce((sum, cc) => {
      // For first year, we don't multiply by term - just sum all line items
      const ccTotal = cc.lineItems.reduce((itemSum, item) => {
        const amount = item.qty !== undefined && item.unitCost !== undefined 
          ? (item.qty || 0) * (item.unitCost || 0) 
          : item.amount;
        return itemSum + amount;
      }, 0);
      return sum + ccTotal;
    }, 0);
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

  // Calculate Year-on-Year forecast breakdown
  const calculateYoYData = (initiativeFilter: 'all' | string = 'all') => {
    // Filter initiatives based on view mode
    const filteredInitiatives = initiativeFilter === 'all' 
      ? data.initiatives 
      : data.initiatives.filter(i => i.id === initiativeFilter);

    // Find maximum years across filtered initiatives
    const maxYears = filteredInitiatives.length > 0
      ? Math.max(...filteredInitiatives.map(i => i.termYears))
      : 5;

    const years = Array.from({ length: maxYears }, (_, i) => i + 1);
    
    return years.map(year => {
      let yearTotal = 0;
      let capexTotal = 0;
      let opexTotal = 0;
      let customTotal = 0;
      const capexItems: { name: string; amount: number; initiative: string }[] = [];
      const opexItems: { name: string; amount: number; initiative: string }[] = [];
      const customItems: { name: string; amount: number; initiative: string }[] = [];

      filteredInitiatives.forEach(initiative => {
        // Only include if within initiative's term
        if (year <= initiative.termYears) {
          initiative.costCenters.forEach(costCenter => {
            costCenter.lineItems.forEach(item => {
              if (costCenter.type === 'capex') {
                // Capex only in year 1
                if (year === 1) {
                  yearTotal += item.amount;
                  capexTotal += item.amount;
                  capexItems.push({ name: item.name, amount: item.amount, initiative: initiative.name });
                }
              } else if (costCenter.type === 'opex') {
                // Opex - check if multi-year contract
                if (item.contractTerm && item.annualAmount) {
                  if (year === 1) {
                    const firstYear = item.firstYearAmount || item.annualAmount;
                    yearTotal += firstYear;
                    opexTotal += firstYear;
                    opexItems.push({ name: item.name, amount: firstYear, initiative: initiative.name });
                  } else if (year <= item.contractTerm) {
                    yearTotal += item.annualAmount;
                    opexTotal += item.annualAmount;
                    opexItems.push({ name: item.name, amount: item.annualAmount, initiative: initiative.name });
                  }
                } else {
                  // Standard annual Opex (assume recurring)
                  yearTotal += item.amount;
                  opexTotal += item.amount;
                  opexItems.push({ name: item.name, amount: item.amount, initiative: initiative.name });
                }
              } else {
                // Custom cost centers
                if (costCenter.customType === 'yearly') {
                  // Recurring custom cost
                  yearTotal += item.amount;
                  customTotal += item.amount;
                  customItems.push({ name: item.name, amount: item.amount, initiative: initiative.name });
                } else if (year === 1) {
                  // One-time custom cost (year 1 only)
                  yearTotal += item.amount;
                  customTotal += item.amount;
                  customItems.push({ name: item.name, amount: item.amount, initiative: initiative.name });
                }
              }
            });
          });
        }
      });

      return {
        year,
        yearLabel: `Year ${year}`,
        total: yearTotal,
        capex: capexTotal,
        opex: opexTotal,
        custom: customTotal,
        capexItems,
        opexItems,
        customItems
      };
    });
  };

  // Export YoY Chart as screenshot
  const exportYoYChart = async () => {
    const modalEl = document.querySelector('[data-yoy-chart-modal]');
    if (!modalEl) return;
    
    try {
      // Store original styles
      const originalOverflow = (modalEl as HTMLElement).style.overflow;
      const originalMaxHeight = (modalEl as HTMLElement).style.maxHeight;
      const originalHeight = (modalEl as HTMLElement).style.height;
      
      // Find the scrollable body content
      const bodyDiv = modalEl.querySelector('.overflow-y-auto') as HTMLElement;
      const originalBodyOverflow = bodyDiv ? bodyDiv.style.overflow : '';
      const originalBodyMaxHeight = bodyDiv ? bodyDiv.style.maxHeight : '';
      
      // Temporarily remove scroll constraints
      (modalEl as HTMLElement).style.overflow = 'visible';
      (modalEl as HTMLElement).style.maxHeight = 'none';
      (modalEl as HTMLElement).style.height = 'auto';
      
      if (bodyDiv) {
        bodyDiv.style.overflow = 'visible';
        bodyDiv.style.maxHeight = 'none';
      }
      
      // Small delay to let layout recalculate
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const dataUrl = await domToPng(modalEl as HTMLElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: (modalEl as HTMLElement).scrollWidth,
        height: (modalEl as HTMLElement).scrollHeight,
      });
      
      // Restore original styles
      (modalEl as HTMLElement).style.overflow = originalOverflow;
      (modalEl as HTMLElement).style.maxHeight = originalMaxHeight;
      (modalEl as HTMLElement).style.height = originalHeight;
      
      if (bodyDiv) {
        bodyDiv.style.overflow = originalBodyOverflow;
        bodyDiv.style.maxHeight = originalBodyMaxHeight;
      }
      
      const link = document.createElement('a');
      const viewLabel = yoyViewMode === 'all' ? 'All-Initiatives' : data.initiatives.find(i => i.id === yoyViewMode)?.name.replace(/\s+/g, '-');
      link.download = `${data.title.replace(/\s+/g, '-')}-YoY-${viewLabel}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

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
            <h3 className="text-lg font-roobert-semibold text-brand-primary dark:text-brand-secondary">
              Forecast General Settings
            </h3>
            <button
              onClick={() => setShowForecastEditor(true)}
              className="px-4 py-2 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg"
              style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' }}
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
      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-2 print:hidden">
        <div className="text-sm text-gray-600 dark:text-gray-400">{data.period}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowYoYChart(true)}
            className="px-3 py-2 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg font-roobert-medium text-sm"
            style={{
              background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, var(--brand-secondary), var(--brand-primary))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))';
            }}
            title="View Year-on-Year Forecast Chart"
          >
            <BarChart3 className="w-4 h-4" />
            YoY Chart
          </button>
          <button
            onClick={() => setShowPrintView(true)}
            className="px-3 py-2 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg font-roobert-medium text-sm"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #764ba2 0%, #F093FB 100%)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }}
            title="Comprehensive Print View with All Details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Print View
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div 
        className="p-5 rounded-t-2xl"
        style={{
          background: 'linear-gradient(to bottom right, var(--brand-primary), var(--brand-secondary), var(--brand-primary))'
        }}
      >
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
                  <div className="text-sm text-white/90">Capex</div>
                  <div className="text-lg font-roobert-bold text-white">{capexPercent}%</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-sm text-white/90">Opex</div>
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
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/25">
              <div className="text-xs text-white/80 uppercase tracking-wide mb-1">Total Capex</div>
              <div className="text-xl font-roobert-bold text-white">{formatCurrency(totals.totalCapex)}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 border border-white/25">
              <div className="text-xs text-white/80 uppercase tracking-wide mb-1">Total Opex</div>
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
            const firstYearCost = getInitiativeFirstYearCost(initiative);
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
                    <Building2 className="w-6 h-6 text-brand-primary dark:text-brand-secondary" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-1">
                      {initiative.name}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white">{formatCurrency(initiativeTotal)}</strong> over{' '}
                      <strong className="text-gray-900 dark:text-white">{initiative.termYears}</strong> year{initiative.termYears !== 1 ? 's' : ''}
                      {initiative.termYears > 1 && (
                        <span className="text-gray-500 dark:text-gray-500 ml-2">({formatCurrency(firstYearCost)} year 1)</span>
                      )}
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
                                  {costCenter.lineItems.map((item) => {
                                    // Calculate display amount
                                    const hasQtyUnitCost = item.qty !== undefined && item.unitCost !== undefined;
                                    const displayAmount = hasQtyUnitCost ? (item.qty || 0) * (item.unitCost || 0) : item.amount;
                                    
                                    // Determine if Opex/Yearly (needs term multiplication)
                                    const isYearlyCost = costCenter.type === 'opex' || (costCenter.type === 'custom' && costCenter.customType === 'yearly');
                                    const termTotal = isYearlyCost ? displayAmount * initiative.termYears : displayAmount;
                                    
                                    return (
                                      <button
                                        key={item.id}
                                        onClick={() => setSelectedLineItem({ initiative, costCenter, item })}
                                        className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gradient-to-r hover:from-brand-primary/5 hover:to-brand-secondary/5 hover:border-l-2 hover:border-brand-secondary transition-all text-left"
                                      >
                                        <span className="text-sm font-roobert-medium text-gray-900 dark:text-white">
                                          {item.name}
                                        </span>
                                        <div className="flex flex-col items-end gap-1">
                                          {hasQtyUnitCost && !isYearlyCost && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              {item.qty} × {formatCurrency(item.unitCost || 0)}
                                            </span>
                                          )}
                                          {isYearlyCost ? (
                                            // For Opex/Yearly: Show yearly cost as primary, term total as subtitle
                                            <>
                                              <span className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(displayAmount)}/yr
                                              </span>
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatCurrency(termTotal)} over {initiative.termYears} yrs
                                              </span>
                                            </>
                                          ) : (
                                            // For Capex/One-time: Show total as primary
                                            <span className="text-sm font-roobert-semibold text-gray-900 dark:text-white">
                                              {formatCurrency(displayAmount)}
                                            </span>
                                          )}
                                          <span className="text-xs text-gray-400 dark:text-gray-500">
                                            Click for details →
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
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

      {/* Comprehensive Print View Modal */}
      {showPrintView && (
        <ForecastPrintView
          data={data}
          onClose={() => setShowPrintView(false)}
          formatCurrency={formatCurrency}
          getCostCenterLabel={getCostCenterLabel}
          getInitiativeTotal={getInitiativeTotal}
          getInitiativeFirstYearCost={getInitiativeFirstYearCost}
          getCostCenterTotal={getCostCenterTotal}
          totals={totals}
        />
      )}

      {/* Line Item Detail Modal */}
      {selectedLineItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 text-white" style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' }}>
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
              {/* Multi-Year Contract Summary (Opex only) */}
              {selectedLineItem.costCenter.type === 'opex' && selectedLineItem.item.contractTerm && selectedLineItem.item.annualAmount && (
                <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-5">
                  <h4 className="text-sm font-roobert-semibold text-purple-900 dark:text-purple-200 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Multi-Year Contract Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">Year 1 Cost</div>
                      <div className="text-lg font-roobert-bold text-purple-900 dark:text-purple-100">
                        {formatCurrency(selectedLineItem.item.firstYearAmount || selectedLineItem.item.annualAmount)}
                      </div>
                      {selectedLineItem.item.startMonth && (
                        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Starts: {selectedLineItem.item.startMonth}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                        Annual (Yr 2-{selectedLineItem.item.contractTerm})
                      </div>
                      <div className="text-lg font-roobert-bold text-purple-900 dark:text-purple-100">
                        {formatCurrency(selectedLineItem.item.annualAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">Contract Term</div>
                      <div className="text-lg font-roobert-bold text-purple-900 dark:text-purple-100">
                        {selectedLineItem.item.contractTerm} years
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">Total Commitment</div>
                      <div className="text-lg font-roobert-bold text-purple-900 dark:text-purple-100">
                        {formatCurrency(selectedLineItem.item.totalCommitment || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Display */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                {selectedLineItem.item.qty !== undefined && selectedLineItem.item.unitCost !== undefined ? (
                  // Show qty × unitCost breakdown
                  <>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Cost Breakdown
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-lg text-gray-700 dark:text-gray-300">
                        <span className="font-roobert-semibold">{selectedLineItem.item.qty}</span>
                        <span className="text-gray-400">×</span>
                        <span className="font-roobert-semibold">{formatCurrency(selectedLineItem.item.unitCost)}</span>
                        <span className="text-gray-400">=</span>
                        <span className="font-roobert-bold text-2xl text-gray-900 dark:text-white">
                          {formatCurrency((selectedLineItem.item.qty || 0) * (selectedLineItem.item.unitCost || 0))}
                        </span>
                      </div>
                      {(selectedLineItem.costCenter.type === 'opex' || 
                        (selectedLineItem.costCenter.type === 'custom' && selectedLineItem.costCenter.customType === 'yearly')) && (
                        <div className="flex items-center gap-3 text-sm text-purple-700 dark:text-purple-400 pt-2 border-t border-gray-300 dark:border-gray-600">
                          <span>{formatCurrency((selectedLineItem.item.qty || 0) * (selectedLineItem.item.unitCost || 0))}/yr</span>
                          <span>×</span>
                          <span>{selectedLineItem.initiative.termYears} years</span>
                          <span>=</span>
                          <span className="font-roobert-bold text-lg">
                            {formatCurrency(((selectedLineItem.item.qty || 0) * (selectedLineItem.item.unitCost || 0)) * selectedLineItem.initiative.termYears)}
                          </span>
                          <span className="text-xs uppercase tracking-wide">total</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Legacy flat amount display
                  <>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      {selectedLineItem.costCenter.type === 'opex' && selectedLineItem.item.contractTerm ? 'This Year' : 'Amount'}
                    </div>
                    <div className="text-3xl font-roobert-bold text-gray-900 dark:text-white">
                      {formatCurrency(selectedLineItem.item.amount)}
                    </div>
                  </>
                )}
              </div>

              {/* Description */}
              {selectedLineItem.item.description && (selectedLineItem.item.descriptionVisible ?? true) && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-primary dark:text-brand-secondary" />
                    Description
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    {selectedLineItem.item.description}
                  </p>
                </div>
              )}

              {/* Summary */}
              {selectedLineItem.item.summary && (selectedLineItem.item.summaryVisible ?? true) && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-brand-primary dark:text-brand-secondary" />
                    Summary
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 dark:from-brand-primary/10 dark:to-brand-secondary/10 p-4 rounded-lg border-l-4 border-brand-primary dark:border-brand-secondary">
                    {selectedLineItem.item.summary}
                  </p>
                </div>
              )}

              {/* Justification */}
              {selectedLineItem.item.justification && (selectedLineItem.item.justificationVisible ?? true) && (
                <div>
                  <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-brand-primary dark:text-brand-secondary" />
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

      {/* Year-on-Year Chart Modal */}
      {showYoYChart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div data-yoy-chart-modal className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
            {/* Modal Header - Compact */}
            <div className="p-4 text-white" style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-roobert-bold">Year-on-Year Forecast</h3>
                  <p className="text-white/70 text-xs">{data.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <select
                    value={yoyViewMode}
                    onChange={(e) => setYoyViewMode(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 font-roobert-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                  >
                    <option value="all" className="text-gray-900">All Initiatives</option>
                    {data.initiatives.map(initiative => (
                      <option key={initiative.id} value={initiative.id} className="text-gray-900">
                        {initiative.name}
                      </option>
                    ))}
                  </select>
                  {/* Download Button */}
                  <button
                    onClick={exportYoYChart}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Download as PNG"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowYoYChart(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body - Compact */}
            <div ref={yoyChartRef} className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
              {(() => {
                const yoyData = calculateYoYData(yoyViewMode);
                const maxAmount = Math.max(...yoyData.map(y => y.total));
                
                return (
                  <div className="space-y-4">
                    {/* Chart - Compact with Tooltips */}
                    <div className="space-y-2">
                      {yoyData.map((yearData) => {
                        const totalPercent = (yearData.total / maxAmount) * 100;
                        const capexPercent = yearData.total > 0 ? (yearData.capex / yearData.total) * 100 : 0;
                        const opexPercent = yearData.total > 0 ? (yearData.opex / yearData.total) * 100 : 0;
                        const customPercent = yearData.total > 0 ? (yearData.custom / yearData.total) * 100 : 0;
                        const isHovered = hoveredYear === yearData.year;
                        
                        return (
                          <div key={yearData.year} className="relative">
                            <div 
                              className="flex items-center gap-3"
                              onMouseEnter={() => setHoveredYear(yearData.year)}
                              onMouseLeave={() => setHoveredYear(null)}
                            >
                              <div className="font-roobert-semibold text-gray-900 dark:text-white text-sm w-16">
                                {yearData.yearLabel}
                              </div>
                              <div className="flex-1">
                                <div 
                                  className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-brand-primary transition-all"
                                  onClick={() => setSelectedYearDetail(yearData)}
                                >
                                  <div
                                    className="h-full flex"
                                    style={{ width: `${totalPercent}%` }}
                                  >
                                    {yearData.capex > 0 && (
                                      <div
                                        className="flex items-center justify-center text-white text-xs font-roobert-semibold transition-all"
                                        style={{ width: `${capexPercent}%`, background: 'var(--brand-primary)' }}
                                      >
                                        {capexPercent > 20 && formatCurrency(yearData.capex)}
                                      </div>
                                    )}
                                    {yearData.opex > 0 && (
                                      <div
                                        className="flex items-center justify-center text-white text-xs font-roobert-semibold transition-all"
                                        style={{ width: `${opexPercent}%`, background: 'var(--brand-secondary)' }}
                                      >
                                        {opexPercent > 20 && formatCurrency(yearData.opex)}
                                      </div>
                                    )}
                                    {yearData.custom > 0 && (
                                      <div
                                        className="flex items-center justify-center text-white text-xs font-roobert-semibold transition-all"
                                        style={{ width: `${customPercent}%`, background: 'var(--brand-tertiary)' }}
                                      >
                                        {customPercent > 20 && formatCurrency(yearData.custom)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="font-roobert-bold text-gray-900 dark:text-white text-sm text-right w-24">
                                {formatCurrency(yearData.total)}
                              </div>
                            </div>
                            
                            {/* Simplified Tooltip - Just cost center totals */}
                            {isHovered && yearData.total > 0 && (
                              <div className="absolute left-20 top-10 z-10 bg-white dark:bg-gray-800 border-2 border-brand-primary rounded-lg shadow-2xl p-3 min-w-[200px]">
                                <p className="text-xs font-roobert-bold text-gray-900 dark:text-white mb-2">
                                  {yearData.yearLabel} Summary
                                </p>
                                <div className="space-y-1">
                                  {yearData.capex > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-roobert-medium text-brand-primary">Capex:</span>
                                      <span className="text-xs font-roobert-semibold text-brand-primary">{formatCurrency(yearData.capex)}</span>
                                    </div>
                                  )}
                                  {yearData.opex > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-roobert-medium text-brand-secondary">Opex:</span>
                                      <span className="text-xs font-roobert-semibold text-brand-secondary">{formatCurrency(yearData.opex)}</span>
                                    </div>
                                  )}
                                  {yearData.custom > 0 && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-roobert-medium text-brand-tertiary">Custom:</span>
                                      <span className="text-xs font-roobert-semibold text-brand-tertiary">{formatCurrency(yearData.custom)}</span>
                                    </div>
                                  )}
                                  <div className="pt-1 mt-1 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-roobert-bold text-gray-900 dark:text-white">Total:</span>
                                      <span className="text-xs font-roobert-bold text-gray-900 dark:text-white">{formatCurrency(yearData.total)}</span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">Click bar for details</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary Table - Compact */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">Breakdown</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 px-2 font-roobert-semibold text-gray-700 dark:text-gray-300">Year</th>
                              <th className="text-right py-2 px-2 font-roobert-semibold text-brand-primary">Capex</th>
                              <th className="text-right py-2 px-2 font-roobert-semibold text-brand-secondary">Opex</th>
                              <th className="text-right py-2 px-2 font-roobert-semibold text-brand-tertiary">Custom</th>
                              <th className="text-right py-2 px-2 font-roobert-semibold text-gray-900 dark:text-white">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {yoyData.map((yearData) => (
                              <tr key={yearData.year} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="py-1.5 px-2 font-roobert-medium text-gray-900 dark:text-white">
                                  {yearData.yearLabel}
                                </td>
                                <td className="py-1.5 px-2 font-roobert-medium text-right text-brand-primary">
                                  {formatCurrency(yearData.capex)}
                                </td>
                                <td className="py-1.5 px-2 font-roobert-medium text-right text-brand-secondary">
                                  {formatCurrency(yearData.opex)}
                                </td>
                                <td className="py-1.5 px-2 font-roobert-medium text-right text-brand-tertiary">
                                  {formatCurrency(yearData.custom)}
                                </td>
                                <td className="py-1.5 px-2 font-roobert-bold text-right text-gray-900 dark:text-white">
                                  {formatCurrency(yearData.total)}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50 dark:bg-gray-800 font-roobert-bold">
                              <td className="py-1.5 px-2 text-gray-900 dark:text-white">Total</td>
                              <td className="py-1.5 px-2 text-right text-brand-primary">
                                {formatCurrency(yoyData.reduce((sum, y) => sum + y.capex, 0))}
                              </td>
                              <td className="py-1.5 px-2 text-right text-brand-secondary">
                                {formatCurrency(yoyData.reduce((sum, y) => sum + y.opex, 0))}
                              </td>
                              <td className="py-1.5 px-2 text-right text-brand-tertiary">
                                {formatCurrency(yoyData.reduce((sum, y) => sum + y.custom, 0))}
                              </td>
                              <td className="py-1.5 px-2 text-right text-gray-900 dark:text-white">
                                {formatCurrency(yoyData.reduce((sum, y) => sum + y.total, 0))}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Legend - Compact */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-brand-primary"></div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">Capex</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-brand-secondary"></div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">Opex</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-brand-tertiary"></div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">Custom</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Year Detail Modal - Full Breakdown */}
      {selectedYearDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div data-year-detail-modal className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-4 text-white" style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-roobert-bold">{selectedYearDetail.yearLabel} Detailed Breakdown</h3>
                  <p className="text-white/70 text-xs">{data.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const modalEl = document.querySelector('[data-year-detail-modal]');
                      if (!modalEl) return;

                      try {
                        // Store original styles
                        const originalOverflow = (modalEl as HTMLElement).style.overflow;
                        const originalMaxHeight = (modalEl as HTMLElement).style.maxHeight;
                        const originalHeight = (modalEl as HTMLElement).style.height;
                        
                        // Find the scrollable body content
                        const bodyDiv = modalEl.querySelector('.overflow-y-auto') as HTMLElement;
                        const originalBodyOverflow = bodyDiv ? bodyDiv.style.overflow : '';
                        const originalBodyMaxHeight = bodyDiv ? bodyDiv.style.maxHeight : '';
                        
                        // Temporarily remove scroll constraints
                        (modalEl as HTMLElement).style.overflow = 'visible';
                        (modalEl as HTMLElement).style.maxHeight = 'none';
                        (modalEl as HTMLElement).style.height = 'auto';
                        
                        if (bodyDiv) {
                          bodyDiv.style.overflow = 'visible';
                          bodyDiv.style.maxHeight = 'none';
                        }
                        
                        // Small delay to let layout recalculate
                        await new Promise(resolve => setTimeout(resolve, 200));
                        
                        const dataUrl = await domToPng(modalEl as HTMLElement, {
                          scale: 2,
                          backgroundColor: '#ffffff',
                          width: (modalEl as HTMLElement).scrollWidth,
                          height: (modalEl as HTMLElement).scrollHeight,
                        });
                        
                        // Restore original styles
                        (modalEl as HTMLElement).style.overflow = originalOverflow;
                        (modalEl as HTMLElement).style.maxHeight = originalMaxHeight;
                        (modalEl as HTMLElement).style.height = originalHeight;
                        
                        if (bodyDiv) {
                          bodyDiv.style.overflow = originalBodyOverflow;
                          bodyDiv.style.maxHeight = originalBodyMaxHeight;
                        }
                        
                        const link = document.createElement('a');
                        link.download = `${data.title.replace(/\s+/g, '-')}-${selectedYearDetail.yearLabel}-Breakdown.png`;
                        link.href = dataUrl;
                        link.click();
                      } catch (error) {
                        console.error('Export failed:', error);
                        alert('Export failed. Please try again.');
                      }
                    }}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    title="Export to PNG"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedYearDetail(null)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(67, 28, 91, 0.1)', border: '1px solid rgba(67, 28, 91, 0.3)' }}>
                  <div className="text-xs font-roobert-medium mb-1" style={{ color: 'var(--brand-primary)' }}>Capex</div>
                  <div className="text-lg font-roobert-bold" style={{ color: 'var(--brand-primary)' }}>{formatCurrency(selectedYearDetail.capex)}</div>
                </div>
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(178, 26, 83, 0.1)', border: '1px solid rgba(178, 26, 83, 0.3)' }}>
                  <div className="text-xs font-roobert-medium mb-1" style={{ color: 'var(--brand-secondary)' }}>Opex</div>
                  <div className="text-lg font-roobert-bold" style={{ color: 'var(--brand-secondary)' }}>{formatCurrency(selectedYearDetail.opex)}</div>
                </div>
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(29, 31, 72, 0.1)', border: '1px solid rgba(29, 31, 72, 0.3)' }}>
                  <div className="text-xs font-roobert-medium mb-1" style={{ color: 'var(--brand-tertiary)' }}>Custom</div>
                  <div className="text-lg font-roobert-bold" style={{ color: 'var(--brand-tertiary)' }}>{formatCurrency(selectedYearDetail.custom)}</div>
                </div>
              </div>

              {/* Breakdown by Cost Center → Initiative → Line Items */}
              <div className="space-y-4">
                {/* Capex Section */}
                {selectedYearDetail.capexItems.length > 0 && (
                  <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(67, 28, 91, 0.3)' }}>
                    <div className="px-4 py-2" style={{ backgroundColor: 'rgba(67, 28, 91, 0.1)', borderBottom: '1px solid rgba(67, 28, 91, 0.3)' }}>
                      <h4 className="text-sm font-roobert-bold" style={{ color: 'var(--brand-primary)' }}>Capex (One-Time)</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {(() => {
                        const grouped = selectedYearDetail.capexItems.reduce((acc: any, item: any) => {
                          if (!acc[item.initiative]) acc[item.initiative] = [];
                          acc[item.initiative].push(item);
                          return acc;
                        }, {});
                        return Object.entries(grouped).map(([initiative, items]: [string, any]) => (
                          <div key={initiative} className="space-y-2">
                            <div className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide px-2 py-1.5 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>{initiative}</div>
                            {items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-start justify-between gap-4 pl-3 py-1" style={{ borderLeft: '2px solid rgba(67, 28, 91, 0.4)' }}>
                                <span className="text-sm font-roobert-medium" style={{ color: 'var(--brand-primary)' }}>{item.name}</span>
                                <span className="text-sm font-roobert-bold whitespace-nowrap" style={{ color: 'var(--brand-primary)' }}>{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Opex Section */}
                {selectedYearDetail.opexItems.length > 0 && (
                  <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(178, 26, 83, 0.3)' }}>
                    <div className="px-4 py-2" style={{ backgroundColor: 'rgba(178, 26, 83, 0.1)', borderBottom: '1px solid rgba(178, 26, 83, 0.3)' }}>
                      <h4 className="text-sm font-roobert-bold" style={{ color: 'var(--brand-secondary)' }}>Opex (Recurring)</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {(() => {
                        const grouped = selectedYearDetail.opexItems.reduce((acc: any, item: any) => {
                          if (!acc[item.initiative]) acc[item.initiative] = [];
                          acc[item.initiative].push(item);
                          return acc;
                        }, {});
                        return Object.entries(grouped).map(([initiative, items]: [string, any]) => (
                          <div key={initiative} className="space-y-2">
                            <div className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide px-2 py-1.5 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>{initiative}</div>
                            {items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-start justify-between gap-4 pl-3 py-1" style={{ borderLeft: '2px solid rgba(178, 26, 83, 0.4)' }}>
                                <span className="text-sm font-roobert-medium" style={{ color: 'var(--brand-secondary)' }}>{item.name}</span>
                                <span className="text-sm font-roobert-bold whitespace-nowrap" style={{ color: 'var(--brand-secondary)' }}>{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Custom Section */}
                {selectedYearDetail.customItems.length > 0 && (
                  <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(29, 31, 72, 0.3)' }}>
                    <div className="px-4 py-2" style={{ backgroundColor: 'rgba(29, 31, 72, 0.1)', borderBottom: '1px solid rgba(29, 31, 72, 0.3)' }}>
                      <h4 className="text-sm font-roobert-bold" style={{ color: 'var(--brand-tertiary)' }}>Custom Cost Centers</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {(() => {
                        const grouped = selectedYearDetail.customItems.reduce((acc: any, item: any) => {
                          if (!acc[item.initiative]) acc[item.initiative] = [];
                          acc[item.initiative].push(item);
                          return acc;
                        }, {});
                        return Object.entries(grouped).map(([initiative, items]: [string, any]) => (
                          <div key={initiative} className="space-y-2">
                            <div className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide px-2 py-1.5 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>{initiative}</div>
                            {items.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-start justify-between gap-4 pl-3 py-1" style={{ borderLeft: '2px solid rgba(29, 31, 72, 0.4)' }}>
                                <span className="text-sm font-roobert-medium" style={{ color: 'var(--brand-tertiary)' }}>{item.name}</span>
                                <span className="text-sm font-roobert-bold whitespace-nowrap" style={{ color: 'var(--brand-tertiary)' }}>{formatCurrency(item.amount)}</span>
                              </div>
                            ))}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Total Footer */}
              <div className="mt-6 pt-4 border-t-2 border-gray-300 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-roobert-bold text-gray-900 dark:text-white">Total {selectedYearDetail.yearLabel}:</span>
                  <span className="text-2xl font-roobert-bold text-brand-primary dark:text-brand-secondary">{formatCurrency(selectedYearDetail.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
