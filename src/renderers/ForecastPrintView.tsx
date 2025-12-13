/**
 * FORECAST COMPREHENSIVE PRINT VIEW
 * 
 * Beautiful, print-optimized view showing all initiatives, cost centers, 
 * line items, and their complete details (description/summary/justification)
 * in a single comprehensive document.
 */

import React from 'react';
import {
  Building2,
  Calendar,
  DollarSign,
  Info,
  AlertCircle,
  X
} from 'lucide-react';
import { domToPng } from 'modern-screenshot';

interface LineItem {
  id: string;
  name: string;
  qty?: number;
  unitCost?: number;
  amount: number;
  description?: string;
  descriptionVisible?: boolean;
  summary?: string;
  summaryVisible?: boolean;
  justification?: string;
  justificationVisible?: boolean;
  owner?: string;
  lastUpdated?: string;
}

interface CostCenter {
  id: string;
  type: 'capex' | 'opex' | 'custom';
  name: string;
  lineItems: LineItem[];
  removable: boolean;
  customType?: 'one-time' | 'yearly';
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

interface ForecastPrintViewProps {
  data: ForecastData;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  getCostCenterLabel: (costCenter: CostCenter) => string;
  getInitiativeTotal: (initiative: Initiative) => number;
  getInitiativeFirstYearCost: (initiative: Initiative) => number;
  getCostCenterTotal: (costCenter: CostCenter, termYears?: number) => number;
  totals: {
    totalCapex: number;
    totalOpex: number;
    totalCustom: number;
    grandTotal: number;
  };
}

export const ForecastPrintView: React.FC<ForecastPrintViewProps> = ({
  data,
  onClose,
  formatCurrency,
  getCostCenterLabel,
  getInitiativeTotal,
  getInitiativeFirstYearCost,
  getCostCenterTotal,
  totals
}) => {
  const printViewRef = React.useRef<HTMLDivElement>(null);
  
  const capexPercent = totals.grandTotal > 0 ? ((totals.totalCapex / totals.grandTotal) * 100).toFixed(1) : '0.0';
  const opexPercent = totals.grandTotal > 0 ? ((totals.totalOpex / totals.grandTotal) * 100).toFixed(1) : '0.0';

  const exportToPng = async () => {
    const el = printViewRef.current;
    if (!el) return;
    try {
      const dataUrl = await domToPng(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        filter: (node) => {
          // Hide elements with no-screenshot class
          if (node instanceof HTMLElement && node.classList.contains('no-screenshot')) {
            return false;
          }
          return true;
        },
      });
      const link = document.createElement('a');
      link.download = `${data.title.replace(/\s+/g, '-')}-Complete-Breakdown.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        <div ref={printViewRef} className="max-w-7xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden print-view">
          {/* Header - Stunning gradient */}
          <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 50%, var(--brand-primary) 100%)' }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative px-8 py-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-roobert-bold mb-2 flex items-center gap-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {data.title}
                  </h1>
                  <p className="text-white/90 font-roobert-medium text-lg">
                    Complete Financial Breakdown with Line Item Details
                  </p>
                  <div className="flex items-center gap-6 mt-3 text-sm">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {data.period}
                    </span>
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {data.currency}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 print:hidden no-screenshot">
                  <button
                    onClick={exportToPng}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                    title="Export PNG"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Total Summary Bar */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-8 py-6" style={{ borderBottom: '4px solid var(--brand-primary)' }}>
            <div className="grid grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider font-roobert-semibold text-gray-500 dark:text-gray-400">Total Capex</div>
                <div className="text-2xl font-roobert-bold" style={{ color: 'var(--brand-primary)' }}>
                  {formatCurrency(totals.totalCapex)}
                </div>
                <div className="text-xs text-gray-500">{capexPercent}% of total</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider font-roobert-semibold text-gray-500 dark:text-gray-400">Total Opex</div>
                <div className="text-2xl font-roobert-bold" style={{ color: 'var(--brand-secondary)' }}>
                  {formatCurrency(totals.totalOpex)}
                </div>
                <div className="text-xs text-gray-500">{opexPercent}% of total</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider font-roobert-semibold text-gray-500 dark:text-gray-400">Total Custom</div>
                <div className="text-2xl font-roobert-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totals.totalCustom)}
                </div>
                <div className="text-xs text-gray-500">{totals.grandTotal > 0 ? ((totals.totalCustom / totals.grandTotal) * 100).toFixed(1) : '0.0'}% of total</div>
              </div>
              <div className="space-y-1 pl-6" style={{ borderLeft: '4px solid var(--brand-primary)' }}>
                <div className="text-xs uppercase tracking-wider font-roobert-semibold text-gray-500 dark:text-gray-400">Grand Total</div>
                <div className="text-3xl font-roobert-bold" style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {formatCurrency(totals.grandTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* Executive Notes Section */}
          {data.notes && (
            <div className="px-8 py-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-roobert-bold" style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Executive Notes</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--brand-primary)' }}>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-roobert-light whitespace-pre-wrap text-center">
                    {data.notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content - All Initiatives with Details */}
          <div className="p-8 space-y-8">
            {data.initiatives.map((initiative, initIdx) => {
              const initiativeTotal = getInitiativeTotal(initiative);
              const firstYearCost = getInitiativeFirstYearCost(initiative);

              return (
                <div key={initiative.id} className="space-y-4 page-break-after">
                  {/* Initiative Header */}
                  <div className="relative overflow-hidden rounded-2xl shadow-lg" style={{ background: 'var(--brand-tertiary)' }}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_70%)]" />
                    <div className="relative px-6 py-5 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-roobert-bold mb-1">{initiative.name}</h2>
                            <div className="text-white/90 font-roobert-medium">
                              <strong className="text-white">{formatCurrency(initiativeTotal)}</strong> over{' '}
                              <strong className="text-white">{initiative.termYears}</strong> year{initiative.termYears !== 1 ? 's' : ''}
                              {initiative.termYears > 1 && (
                                <span className="text-white/80 ml-2">({formatCurrency(firstYearCost)} year 1)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {data.initiatives.length >= 2 && (
                          <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                            <div className="text-xs text-white/80 uppercase tracking-wide font-roobert-semibold mb-1">Initiative {initIdx + 1}</div>
                            <div className="text-lg font-roobert-bold">{data.initiatives.length} Total</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cost Centers */}
                  {initiative.costCenters.map((costCenter) => {
                    const ccTotal = getCostCenterTotal(costCenter, initiative.termYears);
                    const ccLabel = getCostCenterLabel(costCenter);
                    const isYearlyCostCenter = costCenter.type === 'opex' || (costCenter.type === 'custom' && costCenter.customType === 'yearly');
                    const annualTotal = isYearlyCostCenter && initiative.termYears > 0 ? ccTotal / initiative.termYears : ccTotal;

                    return (
                      <div key={costCenter.id} className="ml-8 space-y-3">
                        {/* Cost Center Header */}
                        <div className="flex items-center gap-4 p-4 rounded-xl border-2" style={{
                          borderColor: costCenter.type === 'capex' ? 'var(--brand-primary)' : costCenter.type === 'opex' ? 'var(--brand-secondary)' : 'var(--brand-tertiary)',
                          background: costCenter.type === 'capex' ? 'rgba(67, 28, 91, 0.05)' : costCenter.type === 'opex' ? 'rgba(178, 26, 83, 0.05)' : 'rgba(29, 31, 72, 0.05)'
                        }}>
                          <span className="px-4 py-2 rounded-xl text-sm font-roobert-bold text-white" style={{
                            background: costCenter.type === 'capex' ? 'var(--brand-primary)' : costCenter.type === 'opex' ? 'var(--brand-secondary)' : 'var(--brand-tertiary)'
                          }}>
                            {ccLabel}
                          </span>
                          <div className="flex-1" />
                          <div className="text-right">
                            <div className="text-xl font-roobert-bold" style={{
                              color: costCenter.type === 'capex' ? 'var(--brand-primary)' : costCenter.type === 'opex' ? 'var(--brand-secondary)' : 'var(--brand-tertiary)'
                            }}>
                              {formatCurrency(ccTotal)}
                            </div>
                            {isYearlyCostCenter && initiative.termYears > 1 && (
                              <div className="text-xs text-gray-500 font-roobert-medium">
                                ({formatCurrency(annualTotal)}/year)
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Line Items with Full Details */}
                        {costCenter.lineItems.length === 0 ? (
                          <div className="ml-6 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No line items in this cost center</p>
                          </div>
                        ) : (
                          <div className="ml-6 space-y-4">
                            {costCenter.lineItems.map((item, itemIdx) => {
                              const hasQtyUnitCost = item.qty !== undefined && item.unitCost !== undefined;
                              const displayAmount = hasQtyUnitCost ? (item.qty || 0) * (item.unitCost || 0) : item.amount;
                              const isYearlyItem = costCenter.type === 'opex' || (costCenter.type === 'custom' && costCenter.customType === 'yearly');
                              const termTotal = isYearlyItem ? displayAmount * initiative.termYears : displayAmount;
                              
                              const hasVisibleDetails = 
                                (item.description && (item.descriptionVisible ?? true)) ||
                                (item.summary && (item.summaryVisible ?? true)) ||
                                (item.justification && (item.justificationVisible ?? true));

                              return (
                                <div key={item.id} className="relative">
                                  <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
                                    {/* Line Item Header */}
                                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-roobert-bold text-sm" style={{
                                              background: costCenter.type === 'capex' ? 'var(--brand-primary)' : costCenter.type === 'opex' ? 'var(--brand-secondary)' : 'var(--brand-tertiary)'
                                            }}>
                                              {itemIdx + 1}
                                            </div>
                                            <h4 className="text-lg font-roobert-bold text-gray-900 dark:text-white">{item.name}</h4>
                                          </div>
                                          
                                          {/* Cost Breakdown */}
                                          <div className="space-y-2">
                                            {hasQtyUnitCost ? (
                                              <div className="flex items-center gap-3 text-base flex-wrap">
                                                <span className="px-3 py-1 rounded-lg font-roobert-semibold" style={{ backgroundColor: 'rgba(67, 28, 91, 0.1)', color: 'var(--brand-primary)' }}>
                                                  📦 Qty: {item.qty}
                                                </span>
                                                <span className="text-gray-400">×</span>
                                                <span className="px-3 py-1 rounded-lg font-roobert-semibold" style={{ backgroundColor: 'rgba(178, 26, 83, 0.1)', color: 'var(--brand-secondary)' }}>
                                                  💰 {formatCurrency(item.unitCost || 0)}
                                                </span>
                                                <span className="text-gray-400">=</span>
                                                <span className="px-3 py-1 rounded-lg font-roobert-bold text-gray-900 dark:text-white" style={{ background: 'linear-gradient(to right, rgba(67, 28, 91, 0.1), rgba(178, 26, 83, 0.1))' }}>
                                                  {formatCurrency(displayAmount)}
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="px-3 py-1 rounded-lg inline-block" style={{ background: 'linear-gradient(to right, rgba(67, 28, 91, 0.1), rgba(178, 26, 83, 0.1))' }}>
                                                <span className="font-roobert-bold text-gray-900 dark:text-white">
                                                  💰 {formatCurrency(displayAmount)}
                                                </span>
                                              </div>
                                            )}
                                            
                                            {isYearlyItem && initiative.termYears > 1 && (
                                              <div className="flex items-center gap-2 text-sm flex-wrap">
                                                <div className="px-3 py-1 rounded-lg" style={{ backgroundColor: 'rgba(0, 102, 204, 0.1)' }}>
                                                  <span className="font-roobert-semibold" style={{ color: 'var(--accent-blue)' }}>
                                                    {formatCurrency(displayAmount)}/year × {initiative.termYears} years
                                                  </span>
                                                </div>
                                                <span className="text-gray-400">=</span>
                                                <div className="px-3 py-1 rounded-lg" style={{ background: 'linear-gradient(to right, rgba(0, 102, 204, 0.1), rgba(67, 28, 91, 0.1))' }}>
                                                  <span className="font-roobert-bold" style={{ color: 'var(--accent-blue)' }}>
                                                    💰 {formatCurrency(termTotal)} total commitment
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <div className="text-right">
                                          <div className="text-2xl font-roobert-bold" style={{
                                            color: costCenter.type === 'capex' ? 'var(--brand-primary)' : costCenter.type === 'opex' ? 'var(--brand-secondary)' : 'var(--brand-tertiary)'
                                          }}>
                                            {isYearlyItem ? `${formatCurrency(displayAmount)}/yr` : formatCurrency(displayAmount)}
                                          </div>
                                          {isYearlyItem && initiative.termYears > 1 && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                              {formatCurrency(termTotal)} over {initiative.termYears} yrs
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Line Item Details Section */}
                                    {hasVisibleDetails && (
                                      <div className="px-6 py-5 space-y-4 bg-gradient-to-br from-gray-50/50 via-white to-purple-50/30 dark:from-gray-900/50 dark:via-gray-800 dark:to-purple-900/10">
                                        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />
                                        
                                        {/* Description */}
                                        {item.description && (item.descriptionVisible ?? true) && (
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2" style={{ color: 'var(--brand-primary)' }}>
                                              <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(67, 28, 91, 0.1)' }}>
                                                <Info className="w-4 h-4" />
                                              </div>
                                              <h5 className="text-sm font-roobert-bold uppercase tracking-wide">Description</h5>
                                            </div>
                                            <div className="pl-9 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm" style={{ borderLeft: '4px solid var(--brand-primary)' }}>
                                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-roobert-light">
                                                {item.description}
                                              </p>
                                            </div>
                                          </div>
                                        )}

                                        {/* Summary */}
                                        {item.summary && (item.summaryVisible ?? true) && (
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2" style={{ color: 'var(--brand-secondary)' }}>
                                              <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(178, 26, 83, 0.1)' }}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                              </div>
                                              <h5 className="text-sm font-roobert-bold uppercase tracking-wide">Summary</h5>
                                            </div>
                                            <div className="pl-9 pr-4 py-3 rounded-xl shadow-sm" style={{ background: 'linear-gradient(to right, rgba(178, 26, 83, 0.05), rgba(67, 28, 91, 0.05))', borderLeft: '4px solid var(--brand-secondary)' }}>
                                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-roobert-light">
                                                {item.summary}
                                              </p>
                                            </div>
                                          </div>
                                        )}

                                        {/* Justification */}
                                        {item.justification && (item.justificationVisible ?? true) && (
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2" style={{ color: 'var(--accent-orange)' }}>
                                              <div className="p-1.5 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                                                <AlertCircle className="w-4 h-4" />
                                              </div>
                                              <h5 className="text-sm font-roobert-bold uppercase tracking-wide">Justification</h5>
                                            </div>
                                            <div className="pl-9 pr-4 py-3 rounded-xl shadow-sm" style={{ background: 'linear-gradient(to right, rgba(245, 158, 11, 0.05), rgba(255, 184, 0, 0.05))', borderLeft: '4px solid var(--accent-orange)' }}>
                                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-roobert-light">
                                                {item.justification}
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Metadata Footer */}
                                    {(item.owner || item.lastUpdated) && (
                                      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-6 text-xs">
                                          {item.owner && (
                                            <div className="flex items-center gap-2">
                                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-roobert-bold text-xs" style={{ background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))' }}>
                                                👤
                                              </div>
                                              <span className="text-gray-600 dark:text-gray-400 font-roobert-medium">{item.owner}</span>
                                            </div>
                                          )}
                                          {item.lastUpdated && (
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
                                              <Calendar className="w-3.5 h-3.5" />
                                              <span className="font-roobert-regular">
                                                Updated {new Date(item.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Footer Summary */}
          <div className="relative overflow-hidden" style={{ borderTop: '4px solid var(--brand-primary)' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, rgba(67, 28, 91, 0.03), rgba(178, 26, 83, 0.03))' }} />
            <div className="relative px-8 py-6">
              <div className="grid grid-cols-4 gap-6 mb-4">
                <div className="text-center p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2" style={{ borderColor: 'var(--brand-primary)' }}>
                  <div className="text-xs uppercase tracking-wider font-roobert-semibold mb-2" style={{ color: 'var(--brand-primary)' }}>Capex</div>
                  <div className="text-2xl font-roobert-bold" style={{ color: 'var(--brand-primary)' }}>{formatCurrency(totals.totalCapex)}</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2" style={{ borderColor: 'var(--brand-secondary)' }}>
                  <div className="text-xs uppercase tracking-wider font-roobert-semibold mb-2" style={{ color: 'var(--brand-secondary)' }}>Opex</div>
                  <div className="text-2xl font-roobert-bold" style={{ color: 'var(--brand-secondary)' }}>{formatCurrency(totals.totalOpex)}</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2" style={{ borderColor: 'var(--brand-tertiary)' }}>
                  <div className="text-xs uppercase tracking-wider font-roobert-semibold mb-2" style={{ color: 'var(--brand-tertiary)' }}>Custom</div>
                  <div className="text-2xl font-roobert-bold" style={{ color: 'var(--brand-tertiary)' }}>{formatCurrency(totals.totalCustom)}</div>
                </div>
                <div className="text-center p-4 rounded-xl text-white shadow-xl border-2" style={{ background: 'linear-gradient(to bottom right, var(--brand-primary), var(--brand-secondary))', borderColor: 'var(--brand-primary)' }}>
                  <div className="text-xs uppercase tracking-wider font-roobert-bold mb-2">Grand Total</div>
                  <div className="text-3xl font-roobert-bold">{formatCurrency(totals.grandTotal)}</div>
                </div>
              </div>
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 font-roobert-medium">
                Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .print:hidden {
            display: none !important;
          }
          .page-break-after {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};
