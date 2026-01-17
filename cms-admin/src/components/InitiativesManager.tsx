import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Save, Rocket, TrendingUp, Target, AlertTriangle, DollarSign, Users, Link, Shield, CheckCircle, Clock, Package } from 'lucide-react';
import InitiativeEditorModal from './InitiativeEditorModal';

interface Initiative {
  id: string;
  name: string;
  shortName: string;
  category: 'revenue' | 'customer' | 'cost' | 'innovation';
  owner: string;
  coOwners?: string[];
  sponsor: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'at-risk' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  projectStage: 'discovery' | 'planning' | 'mvp' | 'pilot' | 'scaling' | 'complete';
  linkedGoals: string[];
  smartGoal: {
    statement: string;
    specific: { objectives: string[] };
    measurable: { metrics: string[] };
    achievable: { resources: string; teamSize: string };
    relevant: { croAlignment: string[]; strategicThemes: string[] };
    timeBound: { timeline: Array<{ phase: string; deliverable: string; dueDate: string; status: string }> };
  };
  businessCase: {
    problem: string;
    opportunity: string;
    solution: string;
    roi: string;
    paybackPeriod: string;
  };
  budget: {
    total: number;
    spent: number;
  };
  topRisks: Array<{ risk: string; level: string; mitigation: string }>;
  stakeholders: Array<{ name: string; role: string; supportLevel: string }>;
  color: string;
  icon: string;
  createdDate: string;
  lastUpdated: string;
  startDate: string;
  endDate: string;
}

interface Goal {
  id: string;
  name: string;
  shortName: string;
  color: string;
  icon: string;
}

interface InitiativesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function InitiativesManager({ isOpen, onClose, showNotification }: InitiativesManagerProps) {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'dependencies' | 'resources' | 'risks' | 'governance'>('overview');

  useEffect(() => {
    if (isOpen) {
      fetchInitiatives();
      fetchGoals();
    }
  }, [isOpen]);

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/initiatives');
      if (response.ok) {
        const data = await response.json();
        setInitiatives(data.initiatives || []);
      }
    } catch (error) {
      console.error('Failed to fetch initiatives:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/goals');
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
    }
  };

  const handleCreateInitiative = () => {
    const newInitiative: Initiative = {
      id: '',
      name: '',
      shortName: '',
      category: 'innovation',
      owner: '',
      coOwners: [],
      sponsor: '',
      status: 'planning',
      priority: 'medium',
      progress: 0,
      projectStage: 'discovery',
      linkedGoals: [],
      smartGoal: {
        statement: '',
        specific: { objectives: [''] },
        measurable: { metrics: [''] },
        achievable: { resources: '', teamSize: '' },
        relevant: { croAlignment: [''], strategicThemes: [''] },
        timeBound: { timeline: [{ phase: 'Phase 1', deliverable: '', dueDate: '', status: 'not-started' }] }
      },
      businessCase: {
        problem: '',
        opportunity: '',
        solution: '',
        roi: '',
        paybackPeriod: ''
      },
      budget: {
        total: 0,
        spent: 0
      },
      topRisks: [],
      stakeholders: [],
      color: '#EC4899',
      icon: '🚀',
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      startDate: '',
      endDate: ''
    };
    setEditingInitiative(newInitiative);
    setShowEditor(true);
  };

  const handleSaveInitiative = async (initiativeData: Initiative) => {
    if (!initiativeData) return;

    try {
      if (!initiativeData.id) {
        initiativeData.id = initiativeData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      const url = initiativeData.createdDate === new Date().toISOString().split('T')[0]
        ? 'http://localhost:3001/api/initiatives'
        : `http://localhost:3001/api/initiatives/${initiativeData.id}`;

      const method = initiativeData.createdDate === new Date().toISOString().split('T')[0] ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initiativeData)
      });

      if (response.ok) {
        showNotification?.('success', 'Initiative saved successfully');
        fetchInitiatives();
        setShowEditor(false);
        setEditingInitiative(null);
      }
    } catch (error) {
      console.error('Failed to save initiative:', error);
      showNotification?.('error', 'Failed to save initiative');
    }
  };

  const handleDeleteInitiative = async (id: string) => {
    if (!confirm('Are you sure you want to delete this initiative?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/initiatives/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification?.('success', 'Initiative deleted successfully');
        fetchInitiatives();
      }
    } catch (error) {
      console.error('Failed to delete initiative:', error);
      showNotification?.('error', 'Failed to delete initiative');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'in-progress': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'at-risk': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'on-hold': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
        onClick={() => !showEditor && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-b border-pink-200 dark:border-pink-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-600 rounded-lg">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white">Strategic Initiatives</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage and track strategic projects</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateInitiative}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-roobert-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Initiative
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading initiatives...</div>
            ) : initiatives.length === 0 ? (
              <div className="text-center py-12">
                <Rocket className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">No initiatives yet</p>
                <button
                  onClick={handleCreateInitiative}
                  className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-roobert-medium transition-colors"
                >
                  Create Your First Initiative
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {initiatives.map(initiative => (
                  <div
                    key={initiative.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 transition-all bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{initiative.icon}</span>
                        <div>
                          <h3 className="font-roobert-semibold text-gray-900 dark:text-white">{initiative.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{initiative.shortName}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingInitiative(initiative);
                            setShowEditor(true);
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteInitiative(initiative.id)}
                          className="p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(initiative.status)}`}>
                          {initiative.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{initiative.projectStage}</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{initiative.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-pink-600 h-2 rounded-full transition-all"
                            style={{ width: `${initiative.progress}%` }}
                          />
                        </div>
                      </div>

                      {initiative.linkedGoals.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {initiative.linkedGoals.map(goalId => {
                            const goal = goals.find(g => g.id === goalId);
                            return goal ? (
                              <span
                                key={goalId}
                                className="px-2 py-1 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: goal.color }}
                              >
                                {goal.icon} {goal.shortName}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Users className="w-3 h-3" />
                        {initiative.owner}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editor Modal */}
          {showEditor && editingInitiative && (
            <InitiativeEditorModal
              initiative={editingInitiative}
              goals={goals}
              onSave={handleSaveInitiative}
              onClose={() => {
                setShowEditor(false);
                setEditingInitiative(null);
              }}
              isNew={editingInitiative.createdDate === new Date().toISOString().split('T')[0]}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
