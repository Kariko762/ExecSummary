/**
 * BUDGET & FINANCE VIEW COMPONENT
 * 
 * Financial planning with term-based calculations
 * - CAPEX: One-time costs
 * - OPEX: Recurring costs (multiplied by term)
 * - FTE: Prorated by start month + headcount
 * - IDSW: Custom consulting
 * - Year-by-year forecast breakdown
 * - Totals by cost type, project, and unit
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Edit2, DollarSign, TrendingUp, Building2, BarChart3, ChevronDown, ChevronRight } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import type { FinancialPlan } from '../utils/budgetEngine';
import {
  calculateProjectTotals,
  calculateGrandTotals,
  generateForecast,
  formatCurrency,
  getCostTypeColor,
  getMonthsInFirstYear
} from '../utils/budgetEngine';

interface BudgetFinanceProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  showEdit?: boolean;
}

export default function BudgetFinance({ isOpen, onClose, onEdit, showEdit = false }: BudgetFinanceProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'breakdown'>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<FinancialPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/content/financial-plan-2026');
      const result = await response.json();
      // Backend returns {success: true, content: {...}}
      setData(result.content || result);
    } catch (error) {
      console.error('Error loading financial plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await domToPng(contentRef.current, {
        scale: 2,
        backgroundColor: '#0f172a'
      });
      
      const link = document.createElement('a');
      link.download = `financial-plan-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-900 rounded-xl p-8 border border-slate-700/40">
          <div className="text-white">Loading financial plan...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-900 rounded-xl p-8 border border-slate-700/40">
          <div className="text-red-400">Failed to load financial plan</div>
        </div>
      </div>
    );
  }

  const grandTotals = calculateGrandTotals(data);
  const forecast = generateForecast(data);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 w-[95vw] h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/40 bg-slate-800/50">
          <div className="flex items-center gap-4">
            <DollarSign className="w-6 h-6 text-green-400" />
            <div>
              <h2 className="text-xl font-roobert-semibold text-white">{data.title}</h2>
              <p className="text-sm text-slate-400 font-roobert-light">
                {data.planningHorizon}-Year Financial Plan • FY{data.fiscalYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs */}
            <div className="flex gap-2 bg-slate-800/30 p-1 rounded-lg border border-slate-700/40">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-md text-sm font-roobert-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('forecast')}
                className={`px-4 py-2 rounded-md text-sm font-roobert-medium transition-all ${
                  activeTab === 'forecast'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Forecast
              </button>
              <button
                onClick={() => setActiveTab('breakdown')}
                className={`px-4 py-2 rounded-md text-sm font-roobert-medium transition-all ${
                  activeTab === 'breakdown'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Details
              </button>
            </div>

            {showEdit && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-all font-roobert-medium"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="p-2 bg-transparent hover:bg-white/5 border border-white/20 text-white rounded-lg transition-all disabled:opacity-50"
              title="Export to PNG"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-auto p-6 bg-slate-900">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-800/30 rounded-lg border border-slate-700/40 p-4">
                  <div className="text-sm text-slate-400 mb-1">Year 1 Total</div>
                  <div className="text-2xl font-roobert-semibold text-green-400">
                    {formatCurrency(grandTotals.firstYearTotal, data.currency)}
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-lg border border-slate-700/40 p-4">
                  <div className="text-sm text-slate-400 mb-1">{data.planningHorizon}-Year Commitment</div>
                  <div className="text-2xl font-roobert-semibold text-blue-400">
                    {formatCurrency(grandTotals.totalCommitment, data.currency)}
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-lg border border-slate-700/40 p-4">
                  <div className="text-sm text-slate-400 mb-1">Projects</div>
                  <div className="text-2xl font-roobert-semibold text-white">
                    {data.projects.length}
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-lg border border-slate-700/40 p-4">
                  <div className="text-sm text-slate-400 mb-1">Line Items</div>
                  <div className="text-2xl font-roobert-semibold text-white">
                    {data.projects.reduce((sum, p) => sum + p.lineItems.length, 0)}
                  </div>
                </div>
              </div>

              {/* By Cost Type */}
              <div className="bg-slate-800/30 rounded-lg border border-slate-700/40 p-6">
                <h3 className="text-lg font-roobert-semibold text-white mb-4">Total by Cost Type</h3>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(grandTotals.byCostType).map(([type, amount]) => (
                    <div key={type} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getCostTypeColor(type)}`}>
                          {type}
                        </span>
                      </div>
                      <div className="text-xl font-roobert-semibold text-white">
                        {formatCurrency(amount, data.currency)}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {((amount / grandTotals.totalCommitment) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Unit */}
              <div className="bg-slate-800/30 rounded-lg border border-slate-700/40 p-6">
                <h3 className="text-lg font-roobert-semibold text-white mb-4">Total by Unit</h3>
                <div className="space-y-3">
                  {Object.entries(grandTotals.byUnit).map(([unit, amount]) => (
                    <div key={unit} className="flex items-center justify-between bg-slate-700/20 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-white font-roobert-medium">{unit}</span>
                      </div>
                      <span className="text-green-400 font-roobert-semibold">
                        {formatCurrency(amount, data.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Forecast Tab */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              <div className="bg-slate-800/30 rounded-lg border border-slate-700/40 p-6">
                <h3 className="text-lg font-roobert-semibold text-white mb-4">Year-by-Year Forecast</h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(forecast).map(([year, amount]) => (
                    <div key={year} className="bg-slate-700/30 rounded-lg p-6">
                      <div className="text-sm text-slate-400 mb-2">Year {year}</div>
                      <div className="text-3xl font-roobert-semibold text-white mb-2">
                        {formatCurrency(amount, data.currency)}
                      </div>
                      {parseInt(year) > 1 && (
                        <div className="text-xs text-slate-400">
                          {((amount / forecast[1]) * 100 - 100).toFixed(1)}% vs Year 1
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Forecast Chart (visual representation) */}
              <div className="bg-slate-800/30 rounded-lg border border-slate-700/40 p-6">
                <h3 className="text-lg font-roobert-semibold text-white mb-4">Spending Projection</h3>
                <div className="flex items-end gap-4 h-64">
                  {Object.entries(forecast).map(([year, amount]) => {
                    const maxAmount = Math.max(...Object.values(forecast));
                    const height = (amount / maxAmount) * 100;
                    return (
                      <div key={year} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-slate-700/20 rounded-t-lg relative" style={{ height: `${height}%` }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/40 to-blue-400/20 rounded-t-lg"></div>
                        </div>
                        <div className="text-sm text-slate-400">Y{year}</div>
                        <div className="text-xs text-slate-500 font-roobert-medium">
                          {formatCurrency(amount, data.currency)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Breakdown Tab */}
          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              {data.projects.map((project) => {
                const projectTotals = calculateProjectTotals(project, data.fiscalYearStart);
                const isExpanded = expandedProjects.has(project.id);
                
                return (
                  <div key={project.id} className="bg-slate-800/30 rounded-lg border border-slate-700/40">
                    {/* Project Header */}
                    <div
                      onClick={() => toggleProject(project.id)}
                      className="p-4 cursor-pointer hover:bg-slate-700/20 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                        <div>
                          <h3 className="text-lg font-roobert-semibold text-white">{project.name}</h3>
                          <p className="text-sm text-slate-400">{project.unit} • Owner: {project.owner}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-sm text-slate-400">Year 1</div>
                          <div className="text-lg font-roobert-semibold text-green-400">
                            {formatCurrency(projectTotals.firstYear, data.currency)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-400">Total</div>
                          <div className="text-lg font-roobert-semibold text-blue-400">
                            {formatCurrency(projectTotals.totalCommitment, data.currency)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Line Items */}
                    {isExpanded && (
                      <div className="border-t border-slate-700/40 p-4">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700/40">
                              <th className="text-left py-2 px-3 text-slate-400 font-roobert-medium">Item</th>
                              <th className="text-center py-2 px-3 text-slate-400 font-roobert-medium">Type</th>
                              <th className="text-right py-2 px-3 text-slate-400 font-roobert-medium">Amount</th>
                              <th className="text-center py-2 px-3 text-slate-400 font-roobert-medium">Term</th>
                              <th className="text-left py-2 px-3 text-slate-400 font-roobert-medium">Start</th>
                              <th className="text-right py-2 px-3 text-slate-400 font-roobert-medium">Year 1</th>
                            </tr>
                          </thead>
                          <tbody>
                            {project.lineItems.map((item) => {
                              const monthsInYear = getMonthsInFirstYear(item.startMonth, data.fiscalYearStart);
                              const proration = monthsInYear / 12;
                              let firstYearAmount = item.amount * (item.headcount || 1);
                              
                              if (item.costType === 'OPEX' || item.costType === 'FTE') {
                                firstYearAmount *= proration;
                              }
                              
                              return (
                                <tr key={item.id} className="border-b border-slate-700/20 hover:bg-slate-700/10">
                                  <td className="py-2 px-3 text-white">
                                    {item.name}
                                    {item.headcount && (
                                      <span className="ml-2 text-xs text-slate-400">({item.headcount} FTE)</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getCostTypeColor(item.costType)}`}>
                                      {item.costType}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-right text-white font-roobert-medium">
                                    {formatCurrency(item.amount * (item.headcount || 1), data.currency)}
                                  </td>
                                  <td className="py-2 px-3 text-center text-slate-300">
                                    {item.term}yr
                                  </td>
                                  <td className="py-2 px-3 text-slate-300">
                                    {item.startMonth}
                                  </td>
                                  <td className="py-2 px-3 text-right text-green-400 font-roobert-medium">
                                    {formatCurrency(firstYearAmount, data.currency)}
                                    {proration < 1 && (
                                      <span className="ml-2 text-xs text-slate-400">({(proration * 100).toFixed(0)}%)</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
