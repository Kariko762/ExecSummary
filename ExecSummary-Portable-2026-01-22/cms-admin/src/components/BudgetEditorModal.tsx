/**
 * BUDGET EDITOR MODAL
 * 
 * Dedicated full-screen editor for complex budget data
 * - Tabbed interface for settings, categories, and line items
 * - Table-based inline editing for efficiency
 * - Live preview of budget display
 * - Handles nested data structure (categories with line items)
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Eye,
  Settings,
  FolderTree,
  List,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { BudgetBreakdown } from '../renderers/assetRenderBudget';

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

interface BudgetEditorModalProps {
  data: BudgetData;
  onChange: (value: BudgetData) => void;
  onClose: () => void;
}

export const BudgetEditorModal: React.FC<BudgetEditorModalProps> = ({ data, onChange, onClose }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'categories' | 'preview'>('settings');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedLineItems, setExpandedLineItems] = useState<Set<string>>(new Set());
  const [modalWidth, setModalWidth] = useState<75 | 95 | 100>(75);

  // Category Management
  const addCategory = () => {
    const newCategory: BudgetCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      icon: 'DollarSign',
      budgeted: 0,
      actual: 0,
      variance: 0,
      variancePercent: 0,
      status: 'on-track',
      color: 'blue',
      lineItems: [],
    };
    onChange({ ...data, categories: [...data.categories, newCategory] });
  };

  const updateCategory = (categoryId: string, field: keyof BudgetCategory, value: any) => {
    const updatedCategories = data.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, [field]: value } : cat
    );
    onChange({ ...data, categories: updatedCategories });
  };

  const deleteCategory = (categoryId: string) => {
    onChange({ ...data, categories: data.categories.filter((cat) => cat.id !== categoryId) });
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

  const toggleLineItem = (itemId: string) => {
    const newExpanded = new Set(expandedLineItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedLineItems(newExpanded);
  };

  // Line Item Management
  const addLineItem = (categoryId: string) => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      name: 'New Line Item',
      budgeted: 0,
      actual: 0,
      variance: 0,
      summary: '',
      summaryVisible: true,
      explanation: '',
      explanationVisible: true,
      justification: '',
      justificationVisible: true,
      owner: '',
      lastUpdated: new Date().toLocaleDateString(),
    };
    const updatedCategories = data.categories.map((cat) =>
      cat.id === categoryId
        ? { ...cat, lineItems: [...cat.lineItems, newLineItem] }
        : cat
    );
    onChange({ ...data, categories: updatedCategories });
  };

  const updateLineItem = (categoryId: string, itemId: string, field: keyof LineItem, value: any) => {
    const updatedCategories = data.categories.map((cat) => {
      if (cat.id === categoryId) {
        const updatedLineItems = cat.lineItems.map((item) => {
          if (item.id === itemId) {
            const updatedItem = { ...item, [field]: value };
            // Auto-calculate variance
            if (field === 'budgeted' || field === 'actual') {
              updatedItem.variance = updatedItem.budgeted - updatedItem.actual;
            }
            return updatedItem;
          }
          return item;
        });
        
        // Recalculate category totals
        const categoryBudgeted = updatedLineItems.reduce((sum, item) => sum + item.budgeted, 0);
        const categoryActual = updatedLineItems.reduce((sum, item) => sum + item.actual, 0);
        const categoryVariance = categoryBudgeted - categoryActual;
        const categoryVariancePercent = categoryBudgeted > 0 ? (categoryVariance / categoryBudgeted) * 100 : 0;
        
        return {
          ...cat,
          lineItems: updatedLineItems,
          budgeted: categoryBudgeted,
          actual: categoryActual,
          variance: categoryVariance,
          variancePercent: categoryVariancePercent,
        };
      }
      return cat;
    });
    onChange({ ...data, categories: updatedCategories });
  };

  const deleteLineItem = (categoryId: string, itemId: string) => {
    const updatedCategories = data.categories.map((cat) =>
      cat.id === categoryId
        ? { ...cat, lineItems: cat.lineItems.filter((item) => item.id !== itemId) }
        : cat
    );
    onChange({ ...data, categories: updatedCategories });
  };

  const updateBudgetField = (field: keyof BudgetData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ${modalWidth === 75 ? 'w-[75vw]' : modalWidth === 95 ? 'w-[95vw]' : 'w-full'} h-[calc(100vh-2rem)] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white">Budget Editor</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{data.title || 'Untitled Budget'}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Save Button */}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg transition-colors font-roobert-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            {/* Width Toggle */}
            <button
              onClick={() => {
                if (modalWidth === 75) setModalWidth(95);
                else if (modalWidth === 95) setModalWidth(100);
                else setModalWidth(75);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={`Current: ${modalWidth}% - Click to resize`}
            >
              {modalWidth === 100 ? (
                <Minimize2 className="w-5 h-5 text-gray-500" />
              ) : (
                <Maximize2 className="w-5 h-5 text-gray-500" />
              )}
            </button>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-t-lg font-roobert-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-fis-eggplant text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-t-lg font-roobert-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-fis-eggplant text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Categories ({data.categories.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-t-lg font-roobert-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'bg-fis-eggplant text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget Title
                  </label>
                  <input
                    type="text"
                    value={data.title || ''}
                    onChange={(e) => updateBudgetField('title', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., Q4 2025 Budget Review"
                  />
                </div>
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Period
                  </label>
                  <input
                    type="text"
                    value={data.period || ''}
                    onChange={(e) => updateBudgetField('period', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="e.g., Q4 2025"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Currency
                  </label>
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
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Budget
                  </label>
                  <input
                    type="number"
                    value={data.totalBudget || 0}
                    onChange={(e) => updateBudgetField('totalBudget', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Actual
                  </label>
                  <input
                    type="number"
                    value={data.totalActual || 0}
                    onChange={(e) => updateBudgetField('totalActual', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                  Executive Notes
                </label>
                <textarea
                  value={data.notes || ''}
                  onChange={(e) => updateBudgetField('notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Add any executive summary notes or key insights..."
                />
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage budget categories and line items. Click category to expand/collapse line items.
                </p>
                <button
                  onClick={addCategory}
                  className="px-4 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              {data.categories.map((category, catIndex) => (
                <div key={category.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  {/* Category Header */}
                  <div className="p-4 flex items-center gap-4">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {expandedCategories.has(category.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>

                    <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-roobert-semibold"
                        placeholder="Category name"
                      />

                      <select
                        value={category.icon}
                        onChange={(e) => updateCategory(category.id, 'icon', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="Users">👥 Personnel</option>
                        <option value="Server">🖥️ Technology</option>
                        <option value="Building2">🏢 Operations</option>
                        <option value="TrendingUp">📈 Marketing</option>
                        <option value="DollarSign">💰 General</option>
                      </select>

                      <select
                        value={category.status}
                        onChange={(e) => updateCategory(category.id, 'status', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="on-track">✅ On Track</option>
                        <option value="at-risk">⚠️ At Risk</option>
                        <option value="over-budget">❌ Over Budget</option>
                      </select>

                      <select
                        value={category.color}
                        onChange={(e) => updateCategory(category.id, 'color', e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="emerald">🟢 Green</option>
                        <option value="blue">🔵 Blue</option>
                        <option value="violet">🟣 Purple</option>
                        <option value="amber">🟡 Yellow</option>
                        <option value="rose">🔴 Red</option>
                      </select>

                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {category.lineItems.length} items
                      </div>

                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors justify-self-end"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Line Items Table (Expanded) */}
                  {expandedCategories.has(category.id) && (
                    <div className="px-4 pb-4 space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <button
                          onClick={() => addLineItem(category.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Item
                        </button>
                      </div>

                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs font-roobert-semibold text-gray-700 dark:text-gray-300">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-2">Owner</div>
                        <div className="col-span-2">Budgeted</div>
                        <div className="col-span-2">Actual</div>
                        <div className="col-span-2">Variance</div>
                        <div className="col-span-1">Details</div>
                      </div>

                      {/* Table Rows */}
                      {category.lineItems.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-12 gap-2 items-center p-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateLineItem(category.id, item.id, 'name', e.target.value)}
                              className="col-span-3 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                              placeholder="Item name"
                            />
                            <input
                              type="text"
                              value={item.owner}
                              onChange={(e) => updateLineItem(category.id, item.id, 'owner', e.target.value)}
                              className="col-span-2 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                              placeholder="Owner"
                            />
                            <input
                              type="number"
                              value={item.budgeted}
                              onChange={(e) => updateLineItem(category.id, item.id, 'budgeted', parseFloat(e.target.value) || 0)}
                              className="col-span-2 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            />
                            <input
                              type="number"
                              value={item.actual}
                              onChange={(e) => updateLineItem(category.id, item.id, 'actual', parseFloat(e.target.value) || 0)}
                              className="col-span-2 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            />
                            <div className={`col-span-2 px-2 py-1 text-sm font-roobert-medium ${
                              item.variance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {item.variance < 0 ? '-' : '+'}{Math.abs(item.variance).toLocaleString()}
                            </div>
                            <div className="col-span-1 flex gap-1">
                              <button
                                onClick={() => toggleLineItem(item.id)}
                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400 transition-colors"
                                title="Toggle details"
                              >
                                {expandedLineItems.has(item.id) ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() => deleteLineItem(category.id, item.id)}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Expandable Details Section */}
                          {expandedLineItems.has(item.id) && (
                            <div className="px-4 pb-3 pt-1 space-y-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 font-roobert-medium">
                                    Summary (Quick overview)
                                  </label>
                                  <button
                                    onClick={() => updateLineItem(category.id, item.id, 'summaryVisible', !item.summaryVisible)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                      item.summaryVisible !== false
                                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                                        : 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                    title={item.summaryVisible !== false ? 'Visible in preview' : 'Hidden from preview'}
                                  >
                                    <Eye className="w-3 h-3" />
                                    {item.summaryVisible !== false ? 'Visible' : 'Hidden'}
                                  </button>
                                </div>
                                <textarea
                                  value={item.summary || ''}
                                  onChange={(e) => updateLineItem(category.id, item.id, 'summary', e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Brief summary of this line item (optional)..."
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 font-roobert-medium">
                                    Challenges (Problems being solved)
                                  </label>
                                  <button
                                    onClick={() => updateLineItem(category.id, item.id, 'explanationVisible', !item.explanationVisible)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                      item.explanationVisible !== false
                                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                                        : 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                    title={item.explanationVisible !== false ? 'Visible in preview' : 'Hidden from preview'}
                                  >
                                    <Eye className="w-3 h-3" />
                                    {item.explanationVisible !== false ? 'Visible' : 'Hidden'}
                                  </button>
                                </div>
                                <textarea
                                  value={item.explanation || ''}
                                  onChange={(e) => updateLineItem(category.id, item.id, 'explanation', e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Describe the problems this spend is solving (optional)..."
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs text-gray-600 dark:text-gray-400 font-roobert-medium">
                                    Justification (Why this cost/approach)
                                  </label>
                                  <button
                                    onClick={() => updateLineItem(category.id, item.id, 'justificationVisible', !item.justificationVisible)}
                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                                      item.justificationVisible !== false
                                        ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                                        : 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                    title={item.justificationVisible !== false ? 'Visible in preview' : 'Hidden from preview'}
                                  >
                                    <Eye className="w-3 h-3" />
                                    {item.justificationVisible !== false ? 'Visible' : 'Hidden'}
                                  </button>
                                </div>
                                <textarea
                                  value={item.justification || ''}
                                  onChange={(e) => updateLineItem(category.id, item.id, 'justification', e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Justify why this cost/approach was chosen (optional)..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {category.lineItems.length === 0 && (
                        <div className="text-center py-8 text-sm text-gray-400">
                          No line items yet. Click "Add Item" to create one.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {data.categories.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No categories yet. Click "Add Category" to get started.
                </div>
              )}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Live Preview:</strong> This shows the actual budget display as it will appear in the dashboard.
                </p>
              </div>
              
              {/* Import and render the actual BudgetBreakdown component */}
              <BudgetBreakdown data={data} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
