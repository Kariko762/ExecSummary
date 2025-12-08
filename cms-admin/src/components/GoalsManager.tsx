import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Save, Target, TrendingUp, CheckCircle, AlertCircle, Clock, Users, HelpCircle, Eye, Settings, Download } from 'lucide-react';
import ViewGoalModal from './ViewGoalModal';
import GoalsSettingsModal from './GoalsSettingsModal';

interface Goal {
  id: string;
  name: string;
  shortName: string;
  category: string;
  owner: string;
  coOwners?: string[];
  status: 'not-started' | 'in-progress' | 'at-risk' | 'blocked' | 'achieved';
  priority: 'high' | 'medium' | 'low';
  smartGoal: {
    statement: string;
    specific: { objectives: string[] };
    measurable: { metrics: string[] };
    achievable: { resources: string; ownership: string };
    relevant: { croAlignment: string[] };
    timeBound: { timeline: Array<{ phase: string; deliverable: string; dueDate: string; status: string }> };
  };
  indicators: {
    leading: Array<{ name: string; baseline: string; target: string; current: string; unit: string }>;
    lagging: Array<{ name: string; baseline: string; target: string; current: string; unit: string }>;
  };
  progress: number;
  color: string;
  icon: string;
  linkedAssets: number;
  createdDate: string;
  lastUpdated: string;
  targetDate: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface CroImpactArea {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface GoalsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function GoalsManager({ isOpen, onClose, showNotification }: GoalsManagerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [croImpactAreas, setCroImpactAreas] = useState<CroImpactArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSmartHelp, setShowSmartHelp] = useState(false);
  const [showIndicatorsHelp, setShowIndicatorsHelp] = useState(false);
  const [viewingGoal, setViewingGoal] = useState<Goal | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch goals from API
  useEffect(() => {
    if (isOpen) {
      fetchGoals();
    }
  }, [isOpen]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
        setCategories(data.categories || []);
        setCroImpactAreas(data.croImpactAreas || []);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      showNotification?.('error', 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = () => {
    const newGoal: Goal = {
      id: '',
      name: '',
      shortName: '',
      category: 'efficiency',
      owner: '',
      status: 'not-started',
      priority: 'medium',
      smartGoal: {
        statement: '',
        specific: { objectives: [''] },
        measurable: { metrics: [''] },
        achievable: { resources: '', ownership: '' },
        relevant: { croAlignment: [''] },
        timeBound: { timeline: [{ phase: 'Phase 1', deliverable: '', dueDate: '', status: 'not-started' }] }
      },
      indicators: {
        leading: [{ name: '', baseline: '', target: '', current: '', unit: '' }],
        lagging: [{ name: '', baseline: '', target: '', current: '', unit: '' }]
      },
      progress: 0,
      color: 'blue',
      icon: '🎯',
      linkedAssets: 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      targetDate: ''
    };
    setEditingGoal(newGoal);
    setShowEditor(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal({ ...goal });
    setShowEditor(true);
  };

  const handleSaveGoal = async () => {
    if (!editingGoal) return;

    try {
      // Generate ID if new goal
      if (!editingGoal.id) {
        editingGoal.id = editingGoal.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      const url = editingGoal.createdDate === new Date().toISOString().split('T')[0]
        ? 'http://localhost:3001/api/goals'
        : `http://localhost:3001/api/goals/${editingGoal.id}`;

      const method = editingGoal.createdDate === new Date().toISOString().split('T')[0] ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingGoal)
      });

      if (response.ok) {
        showNotification?.('success', 'Goal saved successfully');
        fetchGoals();
        setShowEditor(false);
        setEditingGoal(null);
      } else {
        showNotification?.('error', 'Failed to save goal');
      }
    } catch (error) {
      console.error('Failed to save goal:', error);
      showNotification?.('error', 'Failed to save goal');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/goals/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification?.('success', 'Goal deleted successfully');
        fetchGoals();
      } else {
        showNotification?.('error', 'Failed to delete goal');
      }
    } catch (error) {
      console.error('Failed to delete goal:', error);
      showNotification?.('error', 'Failed to delete goal');
    }
  };

  const handleExportGoal = (goal: Goal) => {
    const exportData = {
      name: goal.name,
      shortName: goal.shortName,
      category: goal.category,
      status: goal.status,
      priority: goal.priority,
      owner: goal.owner,
      coOwners: goal.coOwners,
      progress: goal.progress,
      targetDate: goal.targetDate,
      smartGoal: goal.smartGoal,
      indicators: goal.indicators,
      linkedAssets: goal.linkedAssets,
      createdDate: goal.createdDate,
      lastUpdated: goal.lastUpdated
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goal-${goal.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification?.('success', `Goal "${goal.name}" exported successfully`);
  };

  const handleExportAllGoals = () => {
    const filteredGoals = selectedCategory === 'all' 
      ? goals 
      : goals.filter(g => g.category === selectedCategory);

    const exportData = filteredGoals.map(goal => ({
      name: goal.name,
      shortName: goal.shortName,
      category: goal.category,
      status: goal.status,
      priority: goal.priority,
      owner: goal.owner,
      coOwners: goal.coOwners,
      progress: goal.progress,
      targetDate: goal.targetDate,
      smartGoal: goal.smartGoal,
      indicators: goal.indicators,
      linkedAssets: goal.linkedAssets,
      createdDate: goal.createdDate,
      lastUpdated: goal.lastUpdated
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const categoryName = selectedCategory === 'all' ? 'all' : selectedCategory;
    a.download = `strategic-goals-${categoryName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification?.('success', `${filteredGoals.length} goal(s) exported successfully`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'achieved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'at-risk': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'blocked': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'at-risk': return 'bg-orange-100 text-orange-700';
      case 'blocked': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(g => g.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <>
    <AnimatePresence>
      <motion.div
        key="goals-manager"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-[95vw] h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fis-eggplant to-fis-raspberry flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-roobert-bold text-fis-navy dark:text-white">
                  Strategic Goals
                </h2>
                <p className="text-sm font-roobert-regular text-gray-500 dark:text-gray-400">
                  Manage SMART goals and track progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAllGoals}
                className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-roobert-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-all flex items-center gap-2"
                title={`Export ${selectedCategory === 'all' ? 'All' : selectedCategory} Goals`}
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-roobert-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
                title="Manage Categories & CRO Impact Areas"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleCreateGoal}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Goal
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="px-8 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-roobert-medium text-sm transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-fis-eggplant dark:bg-fis-raspberry text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600'
                }`}
              >
                All ({goals.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-roobert-medium text-sm transition-colors capitalize ${
                    selectedCategory === cat.id
                      ? 'bg-fis-eggplant dark:bg-fis-raspberry text-white'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {cat.icon} {cat.name} ({goals.filter(g => g.category === cat.id).length})
                </button>
              ))}
            </div>
          </div>

          {/* Goals List */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fis-raspberry mx-auto"></div>
                <p className="text-gray-500 dark:text-gray-400 mt-4">Loading goals...</p>
              </div>
            ) : filteredGoals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No goals found</p>
                <button
                  onClick={handleCreateGoal}
                  className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-semibold hover:shadow-lg transition-all"
                >
                  Create Your First Goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredGoals.map(goal => {
                  const category = categories.find(c => c.id === goal.category);
                  return (
                    <div
                      key={goal.id}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                    >
                      {/* Goal Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{goal.icon}</span>
                            <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${getStatusColor(goal.status)}`}>
                              {goal.status.replace('-', ' ').toUpperCase()}
                            </span>
                            {goal.priority === 'high' && (
                              <span className="px-2 py-1 rounded text-xs font-roobert-semibold bg-red-100 text-red-700">
                                HIGH PRIORITY
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-1">
                            {goal.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {category?.name} • Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingGoal(goal)}
                            className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </button>
                          <button
                            onClick={() => handleExportGoal(goal)}
                            className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            title="Export Goal"
                          >
                            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleEditGoal(goal)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Edit Goal"
                          >
                            <Edit2 className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete Goal"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-roobert-semibold text-gray-900 dark:text-white">{goal.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-fis-eggplant to-fis-raspberry transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* SMART Statement (truncated) */}
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {goal.smartGoal.statement}
                      </p>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {goal.indicators.leading.slice(0, 2).map((metric, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{metric.name}</div>
                            <div className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                              {metric.current}
                            </div>
                            <div className="text-xs text-gray-500">Target: {metric.target}</div>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{goal.owner}</span>
                        </div>
                        <div>
                          {goal.linkedAssets} asset{goal.linkedAssets !== 1 ? 's' : ''} linked
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Goal Editor Modal - Full SMART Framework */}
      {showEditor && editingGoal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-fis-eggplant to-fis-raspberry">
              <h3 className="text-xl font-roobert-bold text-white">
                {editingGoal.createdDate === new Date().toISOString().split('T')[0] ? 'Create New' : 'Edit'} Strategic Goal
              </h3>
              <p className="text-white/80 text-xs mt-0.5">SMART framework aligned with CRO/RevOps priorities</p>
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {/* Section 1: Basic Information */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-fis-eggplant text-white flex items-center justify-center text-xs font-bold">1</span>
                    Basic Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Goal Title *
                        </label>
                        <input
                          type="text"
                          value={editingGoal.name}
                          onChange={(e) => setEditingGoal({ ...editingGoal, name: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-fis-raspberry outline-none"
                          placeholder="e.g., Demo Preparation Efficiency"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Short Name *
                        </label>
                        <input
                          type="text"
                          value={editingGoal.shortName}
                          onChange={(e) => setEditingGoal({ ...editingGoal, shortName: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-fis-raspberry outline-none"
                          placeholder="Demo Prep"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">Target Date *</label>
                        <input
                          type="date"
                          value={editingGoal.targetDate}
                          onChange={(e) => setEditingGoal({ ...editingGoal, targetDate: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-fis-raspberry outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Goal Summary *
                      </label>
                      <textarea
                        value={editingGoal.smartGoal.statement}
                        onChange={(e) => setEditingGoal({
                          ...editingGoal,
                          smartGoal: { ...editingGoal.smartGoal, statement: e.target.value }
                        })}
                        className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-fis-raspberry outline-none"
                        rows={2}
                        placeholder="1-2 sentence executive description..."
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select
                          value={editingGoal.category}
                          onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-fis-raspberry outline-none"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                        <select
                          value={editingGoal.priority}
                          onChange={(e) => setEditingGoal({ ...editingGoal, priority: e.target.value as any })}
                          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-fis-raspberry outline-none"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select
                          value={editingGoal.status}
                          onChange={(e) => setEditingGoal({ ...editingGoal, status: e.target.value as any })}
                          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-fis-raspberry outline-none"
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="at-risk">At Risk</option>
                          <option value="blocked">Blocked</option>
                          <option value="achieved">Achieved</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">Progress</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={editingGoal.progress}
                            onChange={(e) => setEditingGoal({ ...editingGoal, progress: parseInt(e.target.value) })}
                            className="flex-1"
                          />
                          <span className="text-sm font-roobert-bold text-gray-900 dark:text-white w-10">{editingGoal.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Strategic Impact & Ownership */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-fis-eggplant text-white flex items-center justify-center text-xs font-bold">2</span>
                      CRO/RevOps Impact
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {croImpactAreas.map((area) => {
                        const isSelected = editingGoal.smartGoal.relevant.croAlignment.includes(area.name);
                        return (
                          <button
                            key={area.id}
                            onClick={() => {
                              const current = editingGoal.smartGoal.relevant.croAlignment;
                              const updated = isSelected
                                ? current.filter(t => t !== area.name)
                                : [...current, area.name];
                              setEditingGoal({
                                ...editingGoal,
                                smartGoal: {
                                  ...editingGoal.smartGoal,
                                  relevant: { croAlignment: updated }
                                }
                              });
                            }}
                            className={`px-2 py-1.5 rounded border text-xs font-roobert-semibold transition-all ${
                              isSelected
                                ? 'border-fis-raspberry bg-fis-raspberry/10 text-fis-raspberry'
                                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-fis-raspberry/50'
                            }`}
                          >
                            {isSelected && '✓ '}{area.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-fis-eggplant text-white flex items-center justify-center text-xs font-bold">3</span>
                      Ownership
                    </h4>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 mb-1">Owner</label>
                        <input
                          type="text"
                          value={editingGoal.owner}
                          onChange={(e) => setEditingGoal({ ...editingGoal, owner: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                          placeholder="Demo Ops Manager"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 mb-1">Teams</label>
                        <input
                          type="text"
                          value={editingGoal.coOwners?.join(', ') || ''}
                          onChange={(e) => setEditingGoal({ 
                            ...editingGoal, 
                            coOwners: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                          placeholder="SE, RevOps"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: SMART Criteria - Compact Grid */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-fis-eggplant text-white flex items-center justify-center text-xs font-bold">4</span>
                    SMART Details
                    <button
                      onClick={() => setShowSmartHelp(true)}
                      className="ml-auto p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                      title="SMART Goal Help"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-fis-raspberry" />
                    </button>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Specific Objectives
                      </label>
                      {editingGoal.smartGoal.specific.objectives.map((obj, idx) => (
                        <div key={idx} className="flex gap-1 mb-1">
                          <input
                            type="text"
                            value={obj}
                            onChange={(e) => {
                              const updated = [...editingGoal.smartGoal.specific.objectives];
                              updated[idx] = e.target.value;
                              setEditingGoal({
                                ...editingGoal,
                                smartGoal: { ...editingGoal.smartGoal, specific: { objectives: updated } }
                              });
                            }}
                            className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                            placeholder="Objective..."
                          />
                          {editingGoal.smartGoal.specific.objectives.length > 1 && (
                            <button
                              onClick={() => {
                                const updated = editingGoal.smartGoal.specific.objectives.filter((_, i) => i !== idx);
                                setEditingGoal({
                                  ...editingGoal,
                                  smartGoal: { ...editingGoal.smartGoal, specific: { objectives: updated } }
                                });
                              }}
                              className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setEditingGoal({
                            ...editingGoal,
                            smartGoal: {
                              ...editingGoal.smartGoal,
                              specific: { objectives: [...editingGoal.smartGoal.specific.objectives, ''] }
                            }
                          });
                        }}
                        className="text-xs text-fis-raspberry hover:text-fis-eggplant font-roobert-semibold"
                      >
                        + Add
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Success Metrics
                      </label>
                      {editingGoal.smartGoal.measurable.metrics.map((metric, idx) => (
                        <div key={idx} className="flex gap-1 mb-1">
                          <input
                            type="text"
                            value={metric}
                            onChange={(e) => {
                              const updated = [...editingGoal.smartGoal.measurable.metrics];
                              updated[idx] = e.target.value;
                              setEditingGoal({
                                ...editingGoal,
                                smartGoal: { ...editingGoal.smartGoal, measurable: { metrics: updated } }
                              });
                            }}
                            className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                            placeholder="Metric..."
                          />
                          {editingGoal.smartGoal.measurable.metrics.length > 1 && (
                            <button
                              onClick={() => {
                                const updated = editingGoal.smartGoal.measurable.metrics.filter((_, i) => i !== idx);
                                setEditingGoal({
                                  ...editingGoal,
                                  smartGoal: { ...editingGoal.smartGoal, measurable: { metrics: updated } }
                                });
                              }}
                              className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setEditingGoal({
                            ...editingGoal,
                            smartGoal: {
                              ...editingGoal.smartGoal,
                              measurable: { metrics: [...editingGoal.smartGoal.measurable.metrics, ''] }
                            }
                          });
                        }}
                        className="text-xs text-fis-raspberry hover:text-fis-eggplant font-roobert-semibold"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Resources & Dependencies
                    </label>
                    <textarea
                      value={editingGoal.smartGoal.achievable.ownership}
                      onChange={(e) => setEditingGoal({
                        ...editingGoal,
                        smartGoal: {
                          ...editingGoal.smartGoal,
                          achievable: { ...editingGoal.smartGoal.achievable, ownership: e.target.value }
                        }
                      })}
                      className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                      rows={2}
                      placeholder="Teams, systems, resources needed..."
                    />
                  </div>
                </div>

                {/* Section 5: Indicators - Compact Table */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-fis-eggplant text-white flex items-center justify-center text-xs font-bold">5</span>
                    Indicators
                    <button
                      onClick={() => setShowIndicatorsHelp(true)}
                      className="ml-auto p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                      title="Indicators Help"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-fis-raspberry" />
                    </button>
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 mb-1">Leading (Operational)</div>
                      {editingGoal.indicators.leading.map((ind, idx) => (
                        <div key={idx} className="flex gap-1 mb-1">
                          <input type="text" value={ind.name} onChange={(e) => { const u = [...editingGoal.indicators.leading]; u[idx].name = e.target.value; setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, leading: u}}); }} className="w-24 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Name" />
                          <input type="text" value={ind.baseline} onChange={(e) => { const u = [...editingGoal.indicators.leading]; u[idx].baseline = e.target.value; setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, leading: u}}); }} className="w-14 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Base" />
                          <input type="text" value={ind.current} onChange={(e) => { const u = [...editingGoal.indicators.leading]; u[idx].current = e.target.value; setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, leading: u}}); }} className="w-14 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Curr" />
                          <input type="text" value={ind.target} onChange={(e) => { const u = [...editingGoal.indicators.leading]; u[idx].target = e.target.value; setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, leading: u}}); }} className="w-14 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Tgt" />
                          <button onClick={() => { const u = editingGoal.indicators.leading.filter((_, i) => i !== idx); setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, leading: u}}); }} className="px-1.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                      <button onClick={() => { setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, leading: [...editingGoal.indicators.leading, { name: '', baseline: '', target: '', current: '', unit: '%' }]}}); }} className="text-xs text-fis-raspberry hover:text-fis-eggplant font-roobert-semibold">+ Add</button>
                    </div>

                    <div>
                      <div className="text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 mb-1">Lagging (Outcome)</div>
                      {editingGoal.indicators.lagging.map((ind, idx) => (
                        <div key={idx} className="flex gap-1 mb-1">
                          <input type="text" value={ind.name} onChange={(e) => { const u = [...editingGoal.indicators.lagging]; u[idx].name = e.target.value; setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, lagging: u}}); }} className="w-24 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Name" />
                          <input type="text" value={ind.baseline} onChange={(e) => { const u = [...editingGoal.indicators.lagging]; u[idx].baseline = e.target.value; setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, lagging: u}}); }} className="w-14 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Base" />
                          <input type="text" value={ind.current} onChange={(e) => { const u = [...editingGoal.indicators.lagging]; u[idx].current = e.target.value; setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, lagging: u}}); }} className="w-14 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Curr" />
                          <input type="text" value={ind.target} onChange={(e) => { const u = [...editingGoal.indicators.lagging]; u[idx].target = e.target.value; setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, lagging: u}}); }} className="w-14 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Tgt" />
                          <button onClick={() => { const u = editingGoal.indicators.lagging.filter((_, i) => i !== idx); setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, lagging: u}}); }} className="px-1.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                      <button onClick={() => { setEditingGoal({...editingGoal, indicators: {...editingGoal.indicators, lagging: [...editingGoal.indicators.lagging, { name: '', baseline: '', target: '', current: '', unit: '%' }]}}); }} className="text-xs text-fis-raspberry hover:text-fis-eggplant font-roobert-semibold">+ Add</button>
                    </div>
                  </div>
                </div>



                {/* Section 6: Milestones */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-fis-eggplant text-white flex items-center justify-center text-xs font-bold">6</span>
                    Milestones
                  </h4>
                  
                  {editingGoal.smartGoal.timeBound.timeline.map((phase, idx) => (
                    <div key={idx} className="flex gap-2 mb-1">
                      <input type="text" value={phase.phase} onChange={(e) => { const u = [...editingGoal.smartGoal.timeBound.timeline]; u[idx].phase = e.target.value; setEditingGoal({...editingGoal, smartGoal: {...editingGoal.smartGoal, timeBound: { timeline: u }}}); }} className="w-28 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Phase" />
                      <input type="text" value={phase.deliverable} onChange={(e) => { const u = [...editingGoal.smartGoal.timeBound.timeline]; u[idx].deliverable = e.target.value; setEditingGoal({...editingGoal, smartGoal: {...editingGoal.smartGoal, timeBound: { timeline: u }}}); }} className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" placeholder="Deliverable" />
                      <input type="date" value={phase.dueDate} onChange={(e) => { const u = [...editingGoal.smartGoal.timeBound.timeline]; u[idx].dueDate = e.target.value; setEditingGoal({...editingGoal, smartGoal: {...editingGoal.smartGoal, timeBound: { timeline: u }}}); }} className="w-32 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" />
                      <select value={phase.status} onChange={(e) => { const u = [...editingGoal.smartGoal.timeBound.timeline]; u[idx].status = e.target.value; setEditingGoal({...editingGoal, smartGoal: {...editingGoal.smartGoal, timeBound: { timeline: u }}}); }} className="w-24 px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Done</option>
                        <option value="delayed">Delayed</option>
                      </select>
                      <button onClick={() => { const u = editingGoal.smartGoal.timeBound.timeline.filter((_, i) => i !== idx); setEditingGoal({...editingGoal, smartGoal: {...editingGoal.smartGoal, timeBound: { timeline: u }}}); }} className="px-1.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <button onClick={() => { setEditingGoal({...editingGoal, smartGoal: {...editingGoal.smartGoal, timeBound: { timeline: [...editingGoal.smartGoal.timeBound.timeline, { phase: '', deliverable: '', dueDate: '', status: 'not-started' }]}}}); }} className="text-xs text-fis-raspberry hover:text-fis-eggplant font-roobert-semibold">+ Add</button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex gap-2">
              <button onClick={handleSaveGoal} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
                <Save className="w-4 h-4" />
                Save Goal
              </button>
              <button onClick={() => { setShowEditor(false); setEditingGoal(null); }} className="px-6 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-roobert-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>

    {/* SMART Goal Help Modal */}
    {showSmartHelp && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowSmartHelp(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
            <h3 className="text-xl font-roobert-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              SMART Goal Framework Guide
            </h3>
            <button onClick={() => setShowSmartHelp(false)} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content - Two Column */}
          <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700 max-h-[calc(85vh-80px)] overflow-y-auto">
            {/* Left: Example */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900">
              <h4 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Complete SMART Goal Example
              </h4>

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="text-xs font-roobert-semibold text-green-600 dark:text-green-400 mb-1">GOAL STATEMENT</div>
                  <p className="text-sm text-gray-900 dark:text-white font-roobert-medium">
                    By Q3 2025, reduce demo preparation time from 18 hours to 7 hours per demo by implementing automated data generation tools and standardized runbooks, enabling SEs to increase demo capacity by 60%.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-xs font-roobert-bold text-blue-600 dark:text-blue-400 mb-2">S - SPECIFIC</div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Implement AI-powered demo data generator</li>
                    <li>• Create standardized runbook library (20+ scenarios)</li>
                    <li>• Deploy pre-demo environment validation scripts</li>
                    <li>• Establish demo prep checklist automation</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-xs font-roobert-bold text-purple-600 dark:text-purple-400 mb-2">M - MEASURABLE</div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• Prep time: 18h → 7h (baseline to target)</li>
                    <li>• Runbook adoption rate: 0% → 85%</li>
                    <li>• Last-minute prep issues: 12/month → 2/month</li>
                    <li>• SE capacity increase: +60% demos/quarter</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-xs font-roobert-bold text-orange-600 dark:text-orange-400 mb-2">A - ACHIEVABLE</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Resources:</strong> Demo Ops team (3 FTEs), Engineering support for API integrations, Budget for automation tools ($50K)
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    <strong>Ownership:</strong> Demo Operations Manager with RevOps and Sales Engineering support
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-xs font-roobert-bold text-red-600 dark:text-red-400 mb-2">R - RELEVANT (CRO Alignment)</div>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>✓ Reduces Sales Cycle Delays (faster demo scheduling)</li>
                    <li>✓ Improves Deal Conversion (higher quality demos)</li>
                    <li>✓ Boosts Sales Productivity (60% more capacity)</li>
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-xs font-roobert-bold text-teal-600 dark:text-teal-400 mb-2">T - TIME-BOUND</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-20 font-roobert-semibold text-gray-600 dark:text-gray-400">Q1 2025:</span>
                      <span className="text-gray-900 dark:text-white">Build data generator MVP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-20 font-roobert-semibold text-gray-600 dark:text-gray-400">Q2 2025:</span>
                      <span className="text-gray-900 dark:text-white">Deploy runbooks + automation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-20 font-roobert-semibold text-gray-600 dark:text-gray-400">Q3 2025:</span>
                      <span className="text-gray-900 dark:text-white">Full adoption + 7h target achieved</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Guidance */}
            <div className="p-6">
              <h4 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                Why This Example Works
              </h4>

              <div className="space-y-5 text-sm text-gray-700 dark:text-gray-300">
                <div>
                  <h5 className="font-roobert-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs">S</span>
                    Specific = No Ambiguity
                  </h5>
                  <p className="mb-2">The example works because it answers:</p>
                  <ul className="space-y-1 ml-6">
                    <li>• <strong>What exactly?</strong> AI data generator, runbooks, validation scripts</li>
                    <li>• <strong>Which processes?</strong> Demo preparation workflow</li>
                    <li>• <strong>How many?</strong> 20+ runbook scenarios</li>
                  </ul>
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs italic">
                    ❌ Bad: "Improve demo efficiency"<br/>
                    ✅ Good: "Implement 4 specific automation tools"
                  </div>
                </div>

                <div>
                  <h5 className="font-roobert-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs">M</span>
                    Measurable = Trackable Progress
                  </h5>
                  <p className="mb-2">Success is quantifiable with:</p>
                  <ul className="space-y-1 ml-6">
                    <li>• <strong>Baseline:</strong> Current state (18h, 12 issues/month)</li>
                    <li>• <strong>Target:</strong> End goal (7h, 2 issues/month)</li>
                    <li>• <strong>Gap:</strong> Clear improvement delta (11h saved, 83% reduction)</li>
                  </ul>
                  <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs italic">
                    Use percentages, hours, counts, or rates—avoid vague terms like "better" or "faster"
                  </div>
                </div>

                <div>
                  <h5 className="font-roobert-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs">A</span>
                    Achievable = Realistic Resources
                  </h5>
                  <p className="mb-2">The goal is feasible because:</p>
                  <ul className="space-y-1 ml-6">
                    <li>• 3 FTEs dedicated to execution</li>
                    <li>• Engineering support confirmed</li>
                    <li>• Budget allocated ($50K)</li>
                    <li>• Clear ownership (Demo Ops Manager)</li>
                  </ul>
                  <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-xs italic">
                    If resources aren't available, the goal becomes aspirational fiction
                  </div>
                </div>

                <div>
                  <h5 className="font-roobert-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 flex items-center justify-center text-xs">R</span>
                    Relevant = Revenue Impact
                  </h5>
                  <p className="mb-2">Connects directly to CRO priorities:</p>
                  <ul className="space-y-1 ml-6">
                    <li>• Faster demos = shorter sales cycles</li>
                    <li>• Better prep = higher win rates</li>
                    <li>• More capacity = more pipeline coverage</li>
                  </ul>
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs italic">
                    Every goal must answer: "How does this impact revenue or customer success?"
                  </div>
                </div>

                <div>
                  <h5 className="font-roobert-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs">T</span>
                    Time-Bound = Urgency & Milestones
                  </h5>
                  <p className="mb-2">Creates accountability with:</p>
                  <ul className="space-y-1 ml-6">
                    <li>• Final deadline: Q3 2025</li>
                    <li>• Quarterly checkpoints with deliverables</li>
                    <li>• Phased rollout prevents big-bang risk</li>
                  </ul>
                  <div className="mt-2 p-2 bg-teal-50 dark:bg-teal-900/20 rounded text-xs italic">
                    Without dates, goals drift indefinitely. Break into quarters or months.
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-l-4 border-green-500">
                  <h5 className="font-roobert-bold text-gray-900 dark:text-white mb-2">🎯 The SMART Formula</h5>
                  <p className="text-xs">
                    <strong>By [DATE]</strong>, achieve <strong>[MEASURABLE OUTCOME]</strong> by <strong>[SPECIFIC ACTIONS]</strong>, enabling <strong>[BUSINESS IMPACT]</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Indicators Help Modal */}
    {showIndicatorsHelp && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowIndicatorsHelp(false)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-600 to-teal-600 flex items-center justify-between">
            <h3 className="text-xl font-roobert-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Leading vs Lagging Indicators Guide
            </h3>
            <button onClick={() => setShowIndicatorsHelp(false)} className="p-2 rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content - Two Column */}
          <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700 max-h-[calc(85vh-80px)] overflow-y-auto">
            {/* Left: Examples */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 text-sm">
              <h4 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-4">Real-World Examples</h4>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h5 className="font-roobert-bold text-blue-900 dark:text-blue-300">Leading Indicators</h5>
                    <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">Operational</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded p-3">
                      <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white mb-1">Runbook Adoption Rate</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-gray-500">Base:</span> <strong>0%</strong></div>
                        <div><span className="text-gray-500">Now:</span> <strong className="text-blue-600">65%</strong></div>
                        <div><span className="text-gray-500">Goal:</span> <strong className="text-green-600">85%</strong></div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                        "If SEs use runbooks, prep time will drop"
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded p-3">
                      <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white mb-1">Training Completion</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-gray-500">Base:</span> <strong>0%</strong></div>
                        <div><span className="text-gray-500">Now:</span> <strong className="text-blue-600">78%</strong></div>
                        <div><span className="text-gray-500">Goal:</span> <strong className="text-green-600">100%</strong></div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                        "Training predicts future efficiency"
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded p-3">
                      <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white mb-1">Automation Executions</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-gray-500">Base:</span> <strong>0/wk</strong></div>
                        <div><span className="text-gray-500">Now:</span> <strong className="text-blue-600">42/wk</strong></div>
                        <div><span className="text-gray-500">Goal:</span> <strong className="text-green-600">60/wk</strong></div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                        "Usage shows process adoption"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h5 className="font-roobert-bold text-purple-900 dark:text-purple-300">Lagging Indicators</h5>
                    <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full">Revenue</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-800 rounded p-3">
                      <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white mb-1">Demo Prep Time</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-gray-500">Base:</span> <strong>18h</strong></div>
                        <div><span className="text-gray-500">Now:</span> <strong className="text-blue-600">11h</strong></div>
                        <div><span className="text-gray-500">Goal:</span> <strong className="text-green-600">7h</strong></div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                        "Direct impact on SE capacity"
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded p-3">
                      <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white mb-1">Demo Conversion Rate</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-gray-500">Base:</span> <strong>62%</strong></div>
                        <div><span className="text-gray-500">Now:</span> <strong className="text-blue-600">71%</strong></div>
                        <div><span className="text-gray-500">Goal:</span> <strong className="text-green-600">75%</strong></div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                        "Better prep = better conversion"
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded p-3">
                      <div className="font-roobert-semibold text-xs text-gray-900 dark:text-white mb-1">Sales Cycle Time</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div><span className="text-gray-500">Base:</span> <strong>45d</strong></div>
                        <div><span className="text-gray-500">Now:</span> <strong className="text-blue-600">38d</strong></div>
                        <div><span className="text-gray-500">Goal:</span> <strong className="text-green-600">35d</strong></div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                        "Faster demos compress cycles"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Guidance */}
            <div className="p-6">
              <h4 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-4">How to Choose Indicators</h4>

              <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-500">
                  <h5 className="font-roobert-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2 text-xs">
                    <TrendingUp className="w-4 h-4" />
                    Leading = What You Control
                  </h5>
                  <p className="mb-2 text-xs">These are <strong>input activities</strong> that predict results.</p>
                  
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">→</span>
                      <div><strong>Adoption/usage:</strong> Are people using it?</div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">→</span>
                      <div><strong>Training:</strong> Are teams enabled?</div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">→</span>
                      <div><strong>Executions:</strong> Is automation running?</div>
                    </div>
                  </div>

                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                    <strong>Why it matters:</strong> You can change these NOW. If trending wrong, course-correct before revenue impact.
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border-l-4 border-purple-500">
                  <h5 className="font-roobert-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2 text-xs">
                    <Target className="w-4 h-4" />
                    Lagging = Results You Measure
                  </h5>
                  <p className="mb-2 text-xs">These are <strong>outcomes</strong> that prove success.</p>
                  
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5">
                      <span className="text-purple-600 font-bold">→</span>
                      <div><strong>Efficiency:</strong> Time saved, capacity gained</div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-purple-600 font-bold">→</span>
                      <div><strong>Conversion:</strong> Demo → Next Stage, Win Rate</div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-purple-600 font-bold">→</span>
                      <div><strong>Velocity:</strong> Faster cycles, pipeline health</div>
                    </div>
                  </div>

                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-xs">
                    <strong>Why it matters:</strong> Proves ROI to execs. But by the time they change, it already happened. Use to validate, not steer.
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border-l-4 border-yellow-500">
                  <h5 className="font-roobert-bold text-gray-900 dark:text-white mb-2 text-xs">⚠️ Common Mistakes</h5>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong className="text-red-600">❌ Only lagging:</strong> Too late to fix<br/>
                    </div>
                    <div>
                      <strong className="text-red-600">❌ Too many:</strong> Focus on 3-5 leading, 2-3 lagging<br/>
                    </div>
                    <div>
                      <strong className="text-red-600">❌ No baselines:</strong> Can't prove improvement<br/>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-3 border-l-4 border-green-500">
                  <h5 className="font-roobert-bold text-gray-900 dark:text-white mb-2 text-xs">🎯 The Perfect Balance</h5>
                  <div className="text-xs space-y-1.5">
                    <div><span className="font-bold text-blue-600">Leading:</span> Watch weekly, adjust tactics</div>
                    <div><span className="font-bold text-purple-600">Lagging:</span> Review monthly/quarterly, validate strategy</div>
                    <p className="mt-2 italic text-gray-600 dark:text-gray-400">
                      "Drive with leading, report with lagging."
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <h5 className="font-roobert-bold text-xs text-gray-900 dark:text-white mb-2">Quick Decision Tree:</h5>
                  <div className="text-xs space-y-1">
                    <div>1. Can you directly control it? → <strong>Leading</strong></div>
                    <div>2. Predicts future results? → <strong>Leading</strong></div>
                    <div>3. Final outcome metric? → <strong>Lagging</strong></div>
                    <div>4. Proves success after fact? → <strong>Lagging</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Settings Modal */}
    {showSettings && (
      <GoalsSettingsModal
        categories={categories}
        croImpactAreas={croImpactAreas}
        onClose={() => setShowSettings(false)}
        onRefresh={fetchGoals}
        showNotification={showNotification}
      />
    )}

    {/* View Goal Modal */}
    {viewingGoal && (
      <ViewGoalModal
        goal={viewingGoal}
        onClose={() => setViewingGoal(null)}
      />
    )}
    </>
  );
}
