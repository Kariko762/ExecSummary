/**
 * BUDGET & FINANCE EDITOR
 * 
 * Edit financial plan with term-based calculations
 * - Add/edit/delete projects and line items
 * - Configure cost type, term, start month, headcount
 * - Real-time calculation of year 1 and total commitment
 * - Auto-proration for FTE and OPEX based on start month
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2, DollarSign } from 'lucide-react';
import type { FinancialPlan, Project, LineItem } from '../utils/budgetEngine';
import {
  calculateProjectTotals,
  calculateGrandTotals,
  formatCurrency,
  getMonthsInFirstYear
} from '../utils/budgetEngine';

interface BudgetFinanceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification: (type: 'success' | 'error', message: string) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const COST_TYPES = ['CAPEX', 'OPEX', 'FTE', 'IDSW'];

export default function BudgetFinanceEditor({ 
  isOpen, 
  onClose,
  showNotification 
}: BudgetFinanceEditorProps) {
  const [data, setData] = useState<FinancialPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      console.error('Error loading:', error);
      showNotification('error', 'Failed to load financial plan');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data) return;
    
    setSaving(true);
    try {
      const response = await fetch('http://localhost:3001/api/content/financial-plan-2026', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        showNotification('success', 'Financial plan saved successfully');
        onClose();
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Error saving:', error);
      showNotification('error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const addProject = () => {
    if (!data) return;

    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: 'New Project',
      unit: 'Department',
      owner: '',
      status: 'active',
      lineItems: []
    };

    setData({
      ...data,
      projects: [...data.projects, newProject]
    });
  };

  const updateProject = (projectId: string, field: keyof Project, value: any) => {
    if (!data) return;

    setData({
      ...data,
      projects: data.projects.map(p =>
        p.id === projectId ? { ...p, [field]: value } : p
      )
    });
  };

  const deleteProject = (projectId: string) => {
    if (!data) return;

    setData({
      ...data,
      projects: data.projects.filter(p => p.id !== projectId)
    });
  };

  const addLineItem = (projectId: string) => {
    if (!data) return;

    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      name: 'New Line Item',
      costType: 'OPEX',
      amount: 0,
      term: 1,
      startMonth: `${MONTHS[0]} ${data.fiscalYear}`
    };

    setData({
      ...data,
      projects: data.projects.map(p =>
        p.id === projectId
          ? { ...p, lineItems: [...p.lineItems, newItem] }
          : p
      )
    });
  };

  const updateLineItem = (projectId: string, itemId: string, field: keyof LineItem, value: any) => {
    if (!data) return;

    setData({
      ...data,
      projects: data.projects.map(p =>
        p.id === projectId
          ? {
              ...p,
              lineItems: p.lineItems.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
              )
            }
          : p
      )
    });
  };

  const deleteLineItem = (projectId: string, itemId: string) => {
    if (!data) return;

    setData({
      ...data,
      projects: data.projects.map(p =>
        p.id === projectId
          ? { ...p, lineItems: p.lineItems.filter(i => i.id !== itemId) }
          : p
      )
    });
  };

  if (!isOpen) return null;
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-slate-900 rounded-xl p-8 border border-slate-700/40">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const grandTotals = calculateGrandTotals(data);

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
              <h2 className="text-xl font-roobert-semibold text-white">Edit Financial Plan</h2>
              <p className="text-sm text-slate-400 font-roobert-light">
                {data.title} • FY{data.fiscalYear}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <div className="text-sm text-slate-400">Total Commitment</div>
              <div className="text-xl font-roobert-semibold text-blue-400">
                {formatCurrency(grandTotals.totalCommitment, data.currency)}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 transition-all font-roobert-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
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
        <div className="flex-1 overflow-auto p-6">
          {/* Plan Settings */}
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/40 p-4 mb-6">
            <h3 className="text-sm font-roobert-semibold text-white mb-3">Plan Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  className="w-full bg-slate-700/30 border border-slate-600/40 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Planning Horizon (years)</label>
                <input
                  type="number"
                  value={data.planningHorizon}
                  onChange={(e) => setData({ ...data, planningHorizon: parseInt(e.target.value) })}
                  className="w-full bg-slate-700/30 border border-slate-600/40 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                  min="1"
                  max="5"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Fiscal Year Start</label>
                <select
                  value={data.fiscalYearStart}
                  onChange={(e) => setData({ ...data, fiscalYearStart: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600/40 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                >
                  {MONTHS.map(month => (
                    <option key={month} value={month} className="bg-slate-800 text-white">{month}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Projects */}
          {data.projects.map((project, projectIdx) => {
            const projectTotals = calculateProjectTotals(project, data.fiscalYearStart);
            
            return (
              <div key={project.id} className="bg-slate-800/30 rounded-lg border border-slate-700/40 p-4 mb-4">
                {/* Project Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="grid grid-cols-3 gap-3 flex-1">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Project Name</label>
                        <input
                          type="text"
                          value={project.name}
                          onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                          placeholder="Project Name"
                          className="w-full bg-slate-700/30 border border-slate-600/40 rounded px-3 py-2 text-white text-sm font-roobert-semibold focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Unit/Department</label>
                        <input
                          type="text"
                          value={project.unit}
                          onChange={(e) => updateProject(project.id, 'unit', e.target.value)}
                          placeholder="Unit/Department"
                          className="w-full bg-slate-700/30 border border-slate-600/40 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Owner</label>
                        <input
                          type="text"
                          value={project.owner}
                          onChange={(e) => updateProject(project.id, 'owner', e.target.value)}
                          placeholder="Owner"
                          className="w-full bg-slate-700/30 border border-slate-600/40 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Year 1</div>
                      <div className="text-sm font-roobert-semibold text-green-400">
                        {formatCurrency(projectTotals.firstYear, data.currency)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total</div>
                      <div className="text-sm font-roobert-semibold text-blue-400">
                        {formatCurrency(projectTotals.totalCommitment, data.currency)}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto mb-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700/40">
                        <th className="text-left py-2 px-2 text-slate-400 font-roobert-medium">Name</th>
                        <th className="text-center py-2 px-2 text-slate-400 font-roobert-medium">Type</th>
                        <th className="text-right py-2 px-2 text-slate-400 font-roobert-medium">Amount</th>
                        <th className="text-center py-2 px-2 text-slate-400 font-roobert-medium">Term</th>
                        <th className="text-center py-2 px-2 text-slate-400 font-roobert-medium">Start</th>
                        <th className="text-center py-2 px-2 text-slate-400 font-roobert-medium">HC</th>
                        <th className="text-right py-2 px-2 text-slate-400 font-roobert-medium">Year 1</th>
                        <th className="w-10"></th>
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
                          <tr key={item.id} className="border-b border-slate-700/20 hover:bg-slate-700/10 group">
                            <td className="py-2 px-2">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateLineItem(project.id, item.id, 'name', e.target.value)}
                                className="w-full bg-transparent border-b border-transparent hover:border-slate-600/40 focus:border-blue-500 outline-none text-white"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <select
                                value={item.costType}
                                onChange={(e) => updateLineItem(project.id, item.id, 'costType', e.target.value)}
                                className="bg-slate-800 border border-slate-600/40 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                              >
                                {COST_TYPES.map(type => (
                                  <option key={type} value={type} className="bg-slate-800 text-white">{type}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number"
                                value={item.amount}
                                onChange={(e) => updateLineItem(project.id, item.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="w-24 text-right bg-transparent border-b border-transparent hover:border-slate-600/40 focus:border-blue-500 outline-none text-white"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input
                                type="number"
                                value={item.term}
                                onChange={(e) => updateLineItem(project.id, item.id, 'term', parseInt(e.target.value) || 1)}
                                className="w-12 text-center bg-transparent border-b border-transparent hover:border-slate-600/40 focus:border-blue-500 outline-none text-white"
                                min="1"
                                max="5"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <select
                                value={item.startMonth}
                                onChange={(e) => updateLineItem(project.id, item.id, 'startMonth', e.target.value)}
                                className="bg-slate-800 border border-slate-600/40 rounded px-2 py-1 text-xs text-white focus:border-blue-500 outline-none"
                              >
                                {MONTHS.map(month => (
                                  <option key={month} value={`${month} ${data.fiscalYear}`} className="bg-slate-800 text-white">
                                    {month.substring(0, 3)}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2 px-2 text-center">
                              {(item.costType === 'FTE') && (
                                <input
                                  type="number"
                                  value={item.headcount || 1}
                                  onChange={(e) => updateLineItem(project.id, item.id, 'headcount', parseInt(e.target.value) || 1)}
                                  className="w-12 text-center bg-transparent border-b border-transparent hover:border-slate-600/40 focus:border-blue-500 outline-none text-white"
                                  min="1"
                                />
                              )}
                            </td>
                            <td className="py-2 px-2 text-right text-green-400 font-roobert-medium">
                              {formatCurrency(firstYearAmount, data.currency)}
                            </td>
                            <td className="py-2 px-2">
                              <button
                                onClick={() => deleteLineItem(project.id, item.id)}
                                className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Line Item */}
                <button
                  onClick={() => addLineItem(project.id)}
                  className="text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Line Item
                </button>
              </div>
            );
          })}

          {/* Add Project */}
          <button
            onClick={addProject}
            className="w-full py-3 border-2 border-dashed border-slate-700/40 hover:border-blue-500/40 rounded-lg text-slate-400 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Project
          </button>
        </div>
      </motion.div>
    </div>
  );
}
