import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Info, DollarSign, Link as LinkIcon, Users, AlertTriangle, Shield, Target, Clock, Package, Plus, Trash2, AlertCircle, TrendingUp, ExternalLink, StickyNote } from 'lucide-react';
import { TaskConnectorRenderer } from '../renderers/assetRenderTasks';

interface InitiativeEditorProps {
  initiative: any;
  goals: any[];
  onSave: (initiative: any) => void;
  onClose: () => void;
  isNew: boolean;
}

export default function InitiativeEditorModal({ initiative, goals, onSave, onClose, isNew }: InitiativeEditorProps) {
  const [editData, setEditData] = useState(initiative);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'dependencies' | 'resources' | 'risks' | 'governance' | 'tasksNotes'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'budget', label: 'Budget & Funding', icon: DollarSign },
    { id: 'dependencies', label: 'Dependencies', icon: LinkIcon },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'risks', label: 'Risks', icon: AlertTriangle },
    { id: 'tasksNotes', label: 'Tasks & Notes', icon: StickyNote },
    { id: 'governance', label: 'Governance', icon: Shield },
  ];

  const handleSave = () => {
    onSave(editData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-pink-50 dark:bg-pink-900/20 border-b border-pink-200 dark:border-pink-800 p-4 flex items-center justify-between">
          <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-pink-600" />
            {isNew ? 'Create New Initiative' : 'Edit Initiative'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 font-roobert-medium text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-pink-600 text-pink-600 dark:text-pink-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <OverviewTab editData={editData} setEditData={setEditData} goals={goals} />
          )}
          {activeTab === 'budget' && (
            <BudgetTab editData={editData} setEditData={setEditData} />
          )}
          {activeTab === 'dependencies' && (
            <DependenciesTab editData={editData} setEditData={setEditData} />
          )}
          {activeTab === 'resources' && (
            <ResourcesTab editData={editData} setEditData={setEditData} />
          )}
          {activeTab === 'risks' && (
            <RisksTab editData={editData} setEditData={setEditData} />
          )}
          {activeTab === 'tasksNotes' && (
            <TasksNotesTab editData={editData} setEditData={setEditData} />
          )}
          {activeTab === 'governance' && (
            <GovernanceTab editData={editData} setEditData={setEditData} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeTab === 'overview' ? 'Required fields: Name, Owner, Status' : `Configure ${tabs.find(t => t.id === activeTab)?.label}`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-roobert-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-roobert-medium flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Initiative
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== TAB COMPONENTS ====================

function OverviewTab({ editData, setEditData, goals }: any) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Basic Information
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
              Initiative Name *
            </label>
            <input
              type="text"
              value={editData.name || ''}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Digital First Demo Services"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
              Short Name
            </label>
            <input
              type="text"
              value={editData.shortName || ''}
              onChange={(e) => setEditData({ ...editData, shortName: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="Demo Automation"
            />
          </div>
        </div>
      </div>

      {/* Ownership */}
      <div>
        <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-3">Ownership</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Owner *</label>
            <input
              type="text"
              value={editData.owner || ''}
              onChange={(e) => setEditData({ ...editData, owner: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="Sarah Chen"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Sponsor</label>
            <input
              type="text"
              value={editData.sponsor || ''}
              onChange={(e) => setEditData({ ...editData, sponsor: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="SVP, Revenue Operations"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={editData.category || 'innovation'}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="revenue">Revenue</option>
              <option value="customer">Customer</option>
              <option value="cost">Cost</option>
              <option value="innovation">Innovation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status & Progress */}
      <div>
        <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-3">Status & Timeline</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
            <select
              value={editData.status || 'planning'}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="at-risk">At Risk</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              value={editData.priority || 'medium'}
              onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Progress (%)</label>
            <input
              type="number"
              value={editData.progress || 0}
              onChange={(e) => setEditData({ ...editData, progress: Number(e.target.value) })}
              min="0"
              max="100"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
            <select
              value={editData.projectStage || 'planning'}
              onChange={(e) => setEditData({ ...editData, projectStage: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="discovery">Discovery</option>
              <option value="planning">Planning</option>
              <option value="mvp">MVP</option>
              <option value="pilot">Pilot</option>
              <option value="scaling">Scaling</option>
              <option value="complete">Complete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Linked Goals */}
      <div>
        <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Strategic Goals Supported
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {editData.linkedGoals?.map((goalId: string) => {
            const goal = goals.find((g: any) => g.id === goalId);
            return goal ? (
              <span
                key={goalId}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: goal.color }}
              >
                {goal.icon} {goal.shortName || goal.name}
                <button
                  onClick={() => {
                    setEditData({
                      ...editData,
                      linkedGoals: editData.linkedGoals.filter((id: string) => id !== goalId)
                    });
                  }}
                  className="hover:bg-white/20 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })}
        </div>
        <select
          onChange={(e) => {
            const goalId = e.target.value;
            if (goalId && !editData.linkedGoals?.includes(goalId)) {
              setEditData({
                ...editData,
                linkedGoals: [...(editData.linkedGoals || []), goalId]
              });
            }
            e.target.value = '';
          }}
          className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
        >
          <option value="">+ Add Strategic Goal</option>
          {goals
            .filter((g: any) => !editData.linkedGoals?.includes(g.id))
            .map((goal: any) => (
              <option key={goal.id} value={goal.id}>
                {goal.icon} {goal.name}
              </option>
            ))}
        </select>
      </div>

      {/* Executive Summary */}
      <div>
        <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">Executive Summary</label>
        <textarea
          value={editData.smartGoal?.statement || ''}
          onChange={(e) => setEditData({
            ...editData,
            smartGoal: { ...(editData.smartGoal || {}), statement: e.target.value }
          })}
          rows={3}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          placeholder="1-2 sentence executive summary of what this initiative aims to achieve..."
        />
      </div>

      {/* Business Case */}
      <div>
        <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-3">Business Case</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Problem</label>
            <textarea
              value={editData.businessCase?.problem || ''}
              onChange={(e) => setEditData({
                ...editData,
                businessCase: { ...(editData.businessCase || {}), problem: e.target.value }
              })}
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="What problem does this solve?"
            />
          </div>
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Solution</label>
            <textarea
              value={editData.businessCase?.solution || ''}
              onChange={(e) => setEditData({
                ...editData,
                businessCase: { ...(editData.businessCase || {}), solution: e.target.value }
              })}
              rows={2}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="How will we solve it?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Expected ROI</label>
              <input
                type="text"
                value={editData.businessCase?.roi || ''}
                onChange={(e) => setEditData({
                  ...editData,
                  businessCase: { ...(editData.businessCase || {}), roi: e.target.value }
                })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                placeholder="450% in 18 months"
              />
            </div>
            <div>
              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Payback Period</label>
              <input
                type="text"
                value={editData.businessCase?.paybackPeriod || ''}
                onChange={(e) => setEditData({
                  ...editData,
                  businessCase: { ...(editData.businessCase || {}), paybackPeriod: e.target.value }
                })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                placeholder="12 months"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BudgetTab({ editData, setEditData }: any) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
        Configure budget breakdown, funding sources, and phase gates for financial tracking.
      </p>
      
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Detailed budget and funding configuration coming soon. For now, use the basic budget fields in the Overview tab.
        </p>
      </div>
    </div>
  );
}

function DependenciesTab({ editData, setEditData }: any) {
  const addInternalDependency = () => {
    const newDep = {
      on: '',
      description: '',
      criticality: 'medium',
      status: 'pending',
      dueDate: ''
    };
    setEditData({
      ...editData,
      dependencies: {
        ...(editData.dependencies || {}),
        internal: [...(editData.dependencies?.internal || []), newDep]
      }
    });
  };

  const removeInternalDependency = (index: number) => {
    const updated = [...(editData.dependencies?.internal || [])];
    updated.splice(index, 1);
    setEditData({
      ...editData,
      dependencies: { ...(editData.dependencies || {}), internal: updated }
    });
  };

  const updateInternalDependency = (index: number, field: string, value: any) => {
    const updated = [...(editData.dependencies?.internal || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({
      ...editData,
      dependencies: { ...(editData.dependencies || {}), internal: updated }
    });
  };

  const newExternalDep = () => {
    const newDep = {
      on: '',
      description: '',
      criticality: 'medium',
      status: 'active',
      contractEnd: ''
    };
    setEditData({
      ...editData,
      dependencies: {
        ...(editData.dependencies || {}),
        external: [...(editData.dependencies?.external || []), newDep]
      }
    });
  };

  const removeExternalDependency = (index: number) => {
    const updated = [...(editData.dependencies?.external || [])];
    updated.splice(index, 1);
    setEditData({
      ...editData,
      dependencies: { ...(editData.dependencies || {}), external: updated }
    });
  };

  const updateExternalDependency = (index: number, field: string, value: any) => {
    const updated = [...(editData.dependencies?.external || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({
      ...editData,
      dependencies: { ...(editData.dependencies || {}), external: updated }
    });
  };

  const newBlockingDep = () => {
    const newDep = {
      initiative: '',
      description: '',
      criticality: 'high',
      expectedResolution: ''
    };
    setEditData({
      ...editData,
      dependencies: {
        ...(editData.dependencies || {}),
        blocking: [...(editData.dependencies?.blocking || []), newDep]
      }
    });
  };

  const removeBlockingDependency = (index: number) => {
    const updated = [...(editData.dependencies?.blocking || [])];
    updated.splice(index, 1);
    setEditData({
      ...editData,
      dependencies: { ...(editData.dependencies || {}), blocking: updated }
    });
  };

  const updateBlockingDependency = (index: number, field: string, value: any) => {
    const updated = [...(editData.dependencies?.blocking || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({
      ...editData,
      dependencies: { ...(editData.dependencies || {}), blocking: updated }
    });
  };

  return (
    <div className="space-y-6">
      {/* Internal Dependencies */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Internal Dependencies
          </h4>
          <button
            onClick={addInternalDependency}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Internal
          </button>
        </div>
        
        <div className="space-y-3">
          {editData.dependencies?.internal?.map((dep: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Depends On (Team/System)</label>
                  <input
                    type="text"
                    value={dep.on || ''}
                    onChange={(e) => updateInternalDependency(index, 'on', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Data Platform Team"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dep.dueDate || ''}
                    onChange={(e) => updateInternalDependency(index, 'dueDate', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={dep.description || ''}
                  onChange={(e) => updateInternalDependency(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  placeholder="API access to customer data lakes"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Criticality</label>
                  <select
                    value={dep.criticality || 'medium'}
                    onChange={(e) => updateInternalDependency(index, 'criticality', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                  <select
                    value={dep.status || 'pending'}
                    onChange={(e) => updateInternalDependency(index, 'status', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => removeInternalDependency(index)}
                    className="w-full px-2 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-sm rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {(!editData.dependencies?.internal || editData.dependencies.internal.length === 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center">
              No internal dependencies yet. Click "Add Internal" to create one.
            </p>
          )}
        </div>
      </div>

      {/* External Dependencies */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            External Dependencies
          </h4>
          <button
            onClick={newExternalDep}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add External
          </button>
        </div>
        
        <div className="space-y-3">
          {editData.dependencies?.external?.map((dep: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Vendor/Partner</label>
                  <input
                    type="text"
                    value={dep.on || ''}
                    onChange={(e) => updateExternalDependency(index, 'on', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="OpenAI"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Contract End</label>
                  <input
                    type="date"
                    value={dep.contractEnd || ''}
                    onChange={(e) => updateExternalDependency(index, 'contractEnd', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={dep.description || ''}
                  onChange={(e) => updateExternalDependency(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  placeholder="GPT-4 API access for intelligent demo data generation"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Criticality</label>
                  <select
                    value={dep.criticality || 'medium'}
                    onChange={(e) => updateExternalDependency(index, 'criticality', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                  <select
                    value={dep.status || 'active'}
                    onChange={(e) => updateExternalDependency(index, 'status', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => removeExternalDependency(index)}
                    className="w-full px-2 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-sm rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {(!editData.dependencies?.external || editData.dependencies.external.length === 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center">
              No external dependencies yet. Click "Add External" to create one.
            </p>
          )}
        </div>
      </div>

      {/* Blocking Dependencies */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Blocking Dependencies (Other Initiatives)
          </h4>
          <button
            onClick={newBlockingDep}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Blocker
          </button>
        </div>
        
        <div className="space-y-3">
          {editData.dependencies?.blocking?.map((dep: any, index: number) => (
            <div key={index} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Initiative/Project Name</label>
                  <input
                    type="text"
                    value={dep.initiative || ''}
                    onChange={(e) => updateBlockingDependency(index, 'initiative', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Customer Data Platform v2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expected Resolution</label>
                  <input
                    type="date"
                    value={dep.expectedResolution || ''}
                    onChange={(e) => updateBlockingDependency(index, 'expectedResolution', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Why This Blocks Progress</label>
                <textarea
                  value={dep.description || ''}
                  onChange={(e) => updateBlockingDependency(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  placeholder="Requires stable CDP APIs for production demo data synthesis"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Criticality</label>
                  <select
                    value={dep.criticality || 'high'}
                    onChange={(e) => updateBlockingDependency(index, 'criticality', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  >
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => removeBlockingDependency(index)}
                    className="w-full px-2 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-sm rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {(!editData.dependencies?.blocking || editData.dependencies.blocking.length === 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center">
              No blocking dependencies. Click "Add Blocker" if other initiatives are blocking progress.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourcesTab({ editData, setEditData }: any) {
  const [people, setPeople] = useState<any[]>([]);

  // Fetch people from backend
  React.useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/people');
        if (response.ok) {
          const data = await response.json();
          // Extract people array from API response { success: true, people: [...] }
          const peopleArray = data.people || data;
          setPeople(Array.isArray(peopleArray) ? peopleArray : []);
        }
      } catch (error) {
        console.error('Failed to fetch people:', error);
        setPeople([]);
      }
    };
    fetchPeople();
  }, []);

  const resourceCategories = [
    {
      key: 'internal',
      label: 'Internal Resources',
      color: 'blue',
      icon: Users,
      description: 'Full-time employees and internal team members'
    },
    {
      key: 'external',
      label: 'External Resources',
      color: 'purple',
      icon: Package,
      description: 'Contractors, consultants, and vendors'
    },
    {
      key: 'other',
      label: 'Other Resources',
      color: 'green',
      icon: Clock,
      description: 'Tools, platforms, and infrastructure'
    }
  ];

  const addResource = (category: string) => {
    const newResource = {
      name: '',
      role: '',
      type: category === 'other' ? 'tool' : 'person',
      allocation: '',
      period: '',
      cost: '',
      note: ''
    };
    setEditData({
      ...editData,
      resources: {
        ...(editData.resources || {}),
        [category]: [...(editData.resources?.[category] || []), newResource]
      }
    });
  };

  const removeResource = (category: string, index: number) => {
    const updated = [...(editData.resources?.[category] || [])];
    updated.splice(index, 1);
    setEditData({
      ...editData,
      resources: { ...(editData.resources || {}), [category]: updated }
    });
  };

  const updateResource = (category: string, index: number, field: string, value: any) => {
    const updated = [...(editData.resources?.[category] || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({
      ...editData,
      resources: { ...(editData.resources || {}), [category]: updated }
    });
  };

  const selectPersonForResource = (category: string, index: number, personId: string) => {
    const person = people.find((p: any) => p.id === personId);
    if (person) {
      updateResource(category, index, 'name', `${person.firstName} ${person.lastName}`);
      updateResource(category, index, 'role', person.role);
    }
  };

  return (
    <div className="space-y-6">
      {resourceCategories.map((category) => {
        const Icon = category.icon;
        const resources = editData.resources?.[category.key] || [];
        const isOtherCategory = category.key === 'other';
        
        return (
          <div key={category.key}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {category.label}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{category.description}</p>
              </div>
              <button
                onClick={() => addResource(category.key)}
                className={`px-3 py-1 bg-${category.color}-600 hover:bg-${category.color}-700 text-white text-sm rounded-lg flex items-center gap-1 transition-colors`}
                style={{
                  backgroundColor: category.color === 'blue' ? '#2563eb' : category.color === 'purple' ? '#9333ea' : '#16a34a',
                }}
              >
                <Plus className="w-3 h-3" />
                Add {isOtherCategory ? 'Resource' : 'Person'}
              </button>
            </div>

            <div className="space-y-3">
              {resources.map((resource: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  {!isOtherCategory && category.key === 'internal' && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Select from People
                        </label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              selectPersonForResource(category.key, index, e.target.value);
                            }
                          }}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                        >
                          <option value="">Select person...</option>
                          {people.map((person) => (
                            <option key={person.id} value={person.id}>
                              {person.firstName} {person.lastName} - {person.role}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Or Enter Name</label>
                        <input
                          type="text"
                          value={resource.name || ''}
                          onChange={(e) => updateResource(category.key, index, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                  )}
                  
                  {!isOtherCategory && category.key !== 'internal' && (
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={resource.name || ''}
                        onChange={(e) => updateResource(category.key, index, 'name', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                        placeholder="Consultant Name or Firm"
                      />
                    </div>
                  )}

                  {isOtherCategory ? (
                    <div className="grid grid-cols-6 gap-3">
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tool/Platform Name</label>
                        <input
                          type="text"
                          value={resource.name || ''}
                          onChange={(e) => updateResource(category.key, index, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                          placeholder="GitHub Enterprise, AWS, etc."
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeResource(category.key, index)}
                          className="w-full px-2 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-sm rounded flex items-center justify-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Role</label>
                          <input
                            type="text"
                            value={resource.role || ''}
                            onChange={(e) => updateResource(category.key, index, 'role', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                            placeholder="Engineering Lead"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Allocation</label>
                          <input
                            type="text"
                            value={resource.allocation || ''}
                            onChange={(e) => updateResource(category.key, index, 'allocation', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                            placeholder="100% or 20 days"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Period</label>
                          <input
                            type="text"
                            value={resource.period || ''}
                            onChange={(e) => updateResource(category.key, index, 'period', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                            placeholder="Q1 2026"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-6 gap-3">
                        {category.key === 'external' && (
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cost</label>
                            <input
                              type="text"
                              value={resource.cost || ''}
                              onChange={(e) => updateResource(category.key, index, 'cost', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                              placeholder="$18,000"
                            />
                          </div>
                        )}
                        <div className={category.key === 'external' ? 'col-span-3' : 'col-span-5'}>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
                          <input
                            type="text"
                            value={resource.note || ''}
                            onChange={(e) => updateResource(category.key, index, 'note', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                            placeholder="Additional details"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => removeResource(category.key, index)}
                            className="w-full px-2 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-sm rounded flex items-center justify-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {resources.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center">
                  No {category.label.toLowerCase()} added yet. Click "Add {isOtherCategory ? 'Resource' : 'Person'}" to track resources.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RisksTab({ editData, setEditData }: any) {
  // Risk category configurations
  const riskCategories = [
    {
      key: 'technical',
      label: 'Technical Risks',
      color: 'blue',
      icon: AlertCircle,
      description: 'Technology, architecture, and implementation risks'
    },
    {
      key: 'business',
      label: 'Business Risks',
      color: 'purple',
      icon: TrendingUp,
      description: 'Market, financial, and operational risks'
    },
    {
      key: 'external',
      label: 'External Risks',
      color: 'orange',
      icon: ExternalLink,
      description: 'Regulatory, vendor, and third-party risks'
    }
  ];

  const addRisk = (category: string) => {
    const newRisk = {
      risk: '',
      probability: 'medium',
      impact: 'medium',
      mitigation: '',
      owner: '',
      status: 'open'
    };
    setEditData({
      ...editData,
      risks: {
        ...(editData.risks || {}),
        [category]: [...(editData.risks?.[category] || []), newRisk]
      }
    });
  };

  const removeRisk = (category: string, index: number) => {
    const updated = [...(editData.risks?.[category] || [])];
    updated.splice(index, 1);
    setEditData({
      ...editData,
      risks: { ...(editData.risks || {}), [category]: updated }
    });
  };

  const updateRisk = (category: string, index: number, field: string, value: any) => {
    const updated = [...(editData.risks?.[category] || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({
      ...editData,
      risks: { ...(editData.risks || {}), [category]: updated }
    });
  };

  const getRiskColor = (probability: string, impact: string) => {
    const score = (
      (probability === 'high' ? 3 : probability === 'medium' ? 2 : 1) *
      (impact === 'high' ? 3 : impact === 'medium' ? 2 : 1)
    );
    if (score >= 6) return 'text-red-600 dark:text-red-400';
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getRiskBgColor = (probability: string, impact: string) => {
    const score = (
      (probability === 'high' ? 3 : probability === 'medium' ? 2 : 1) *
      (impact === 'high' ? 3 : impact === 'medium' ? 2 : 1)
    );
    if (score >= 6) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (score >= 3) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  return (
    <div className="space-y-6">
      {riskCategories.map((category) => {
        const Icon = category.icon;
        const risks = editData.risks?.[category.key] || [];
        
        return (
          <div key={category.key}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {category.label}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{category.description}</p>
              </div>
              <button
                onClick={() => addRisk(category.key)}
                className={`px-3 py-1 bg-${category.color}-600 hover:bg-${category.color}-700 text-white text-sm rounded-lg flex items-center gap-1 transition-colors`}
                style={{
                  backgroundColor: category.color === 'blue' ? '#2563eb' : category.color === 'purple' ? '#9333ea' : '#ea580c',
                }}
              >
                <Plus className="w-3 h-3" />
                Add Risk
              </button>
            </div>

            <div className="space-y-3">
              {risks.map((risk: any, index: number) => {
                const riskColor = getRiskColor(risk.probability, risk.impact);
                const riskBg = getRiskBgColor(risk.probability, risk.impact);
                
                return (
                  <div key={index} className={`p-4 rounded-lg border ${riskBg}`}>
                    <div className="grid grid-cols-1 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Risk Description <span className={riskColor}>●</span>
                        </label>
                        <textarea
                          value={risk.risk || ''}
                          onChange={(e) => updateRisk(category.key, index, 'risk', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                          rows={2}
                          placeholder="Describe the risk..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Probability</label>
                        <select
                          value={risk.probability || 'medium'}
                          onChange={(e) => updateRisk(category.key, index, 'probability', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Impact</label>
                        <select
                          value={risk.impact || 'medium'}
                          onChange={(e) => updateRisk(category.key, index, 'impact', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select
                          value={risk.status || 'open'}
                          onChange={(e) => updateRisk(category.key, index, 'status', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                        >
                          <option value="open">Open</option>
                          <option value="monitoring">Monitoring</option>
                          <option value="mitigated">Mitigated</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label>
                        <input
                          type="text"
                          value={risk.owner || ''}
                          onChange={(e) => updateRisk(category.key, index, 'owner', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                          placeholder="CTO"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-3">
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mitigation Strategy</label>
                        <textarea
                          value={risk.mitigation || ''}
                          onChange={(e) => updateRisk(category.key, index, 'mitigation', e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                          rows={2}
                          placeholder="How will this risk be mitigated?"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => removeRisk(category.key, index)}
                          className="w-full px-2 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-sm rounded flex items-center justify-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {risks.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center">
                  No {category.label.toLowerCase()} identified yet. Click "Add Risk" to track potential issues.
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Risk Matrix Summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-3">Risk Heat Map</h4>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center font-medium text-gray-600 dark:text-gray-400"></div>
          <div className="text-center font-medium text-gray-600 dark:text-gray-400">Low Impact</div>
          <div className="text-center font-medium text-gray-600 dark:text-gray-400">Med Impact</div>
          <div className="text-center font-medium text-gray-600 dark:text-gray-400">High Impact</div>
          
          {['High Prob', 'Med Prob', 'Low Prob'].map((label, rowIndex) => (
            <React.Fragment key={label}>
              <div className="text-right font-medium text-gray-600 dark:text-gray-400 pr-2">{label}</div>
              {[1, 2, 3].map((colIndex) => {
                const allRisks = [
                  ...(editData.risks?.technical || []),
                  ...(editData.risks?.business || []),
                  ...(editData.risks?.external || [])
                ];
                const probMap: any = { 0: 'high', 1: 'medium', 2: 'low' };
                const impactMap: any = { 1: 'low', 2: 'medium', 3: 'high' };
                const count = allRisks.filter(
                  (r: any) => r.probability === probMap[rowIndex] && r.impact === impactMap[colIndex]
                ).length;
                
                const cellColor = 
                  (rowIndex === 0 && colIndex === 3) || (rowIndex === 0 && colIndex === 2) || (rowIndex === 1 && colIndex === 3)
                    ? 'bg-red-200 dark:bg-red-900/40'
                    : (rowIndex === 0 && colIndex === 1) || (rowIndex === 1 && colIndex === 2) || (rowIndex === 2 && colIndex === 3)
                    ? 'bg-yellow-200 dark:bg-yellow-900/40'
                    : 'bg-green-200 dark:bg-green-900/40';
                
                return (
                  <div key={colIndex} className={`p-2 ${cellColor} rounded text-center font-medium`}>
                    {count > 0 ? count : '-'}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksNotesTab({ editData, setEditData }: any) {
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    setNotes(editData.notes || '');
  }, [editData.notes]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setEditData({ ...editData, notes: value });
  };

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* Left Column: Tasks */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">Initiative Tasks</h4>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <TaskConnectorRenderer
            data={{
              filters: {
                initiativeId: editData.id || 'new-initiative'
              },
              layout: {
                sortBy: 'targetDate',
                sortOrder: 'asc'
              }
            }}
            mode="display"
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-2">
          Tasks linked to this initiative will appear here. Create tasks in the main Tasks view and link them to this initiative.
        </p>
      </div>

      {/* Right Column: Notes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <StickyNote className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h4 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">Initiative Notes</h4>
        </div>

        <div className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="w-full h-[500px] px-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400"
            placeholder="Add notes, updates, or important information about this initiative..."
          />

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{notes.length} characters</span>
            <span>Use Markdown formatting</span>
          </div>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> Use notes for status updates, decisions, blockers, and team communications.
          </p>
        </div>
      </div>
    </div>
  );
}

function GovernanceTab({ editData, setEditData }: any) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
        Configure steering committee, RACI matrix, meeting cadence, and escalation paths.
      </p>
      
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Note:</strong> Governance framework coming soon. This will include steering committee, RACI, cadence, and escalation procedures.
        </p>
      </div>
    </div>
  );
}
