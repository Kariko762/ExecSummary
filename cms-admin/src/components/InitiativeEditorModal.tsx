import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Info, DollarSign, Link as LinkIcon, Users, AlertTriangle, Shield, Target, Clock, Package, Plus, Trash2, AlertCircle, TrendingUp, ExternalLink, StickyNote, Flag, Calendar } from 'lucide-react';
import { TaskConnectorRenderer } from '../renderers/assetRenderTasks';
import GanttEditor from './GanttEditor';
import GanttVisualizer from './GanttVisualizer';

interface InitiativeEditorProps {
  initiative: any;
  goals: any[];
  onSave: (initiative: any) => void;
  onClose: () => void;
  isNew: boolean;
}

export default function InitiativeEditorModal({ initiative, goals, onSave, onClose, isNew }: InitiativeEditorProps) {
  const [editData, setEditData] = useState(initiative);
  const [activeTab, setActiveTab] = useState<'overview' | 'smart' | 'milestones' | 'performance' | 'resources' | 'risks' | 'tasks' | 'goals'>('overview');
  const [showGanttEditor, setShowGanttEditor] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'milestones', label: 'Milestones', icon: Clock },
    { id: 'dependencies', label: 'Dependencies', icon: LinkIcon },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'risks', label: 'Risks & Success', icon: AlertTriangle },
    { id: 'tasks', label: 'Tasks', icon: StickyNote },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  const handleSave = () => {
    onSave(editData);
    onClose();
  };

  const handleGanttSave = (ganttData: any) => {
    setEditData({
      ...editData,
      ganttData: ganttData
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[75vw] h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="initiative-editor-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="currentColor" />
                </pattern>
                <pattern id="initiative-editor-lines" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M0 40 L80 40 M40 0 L40 80" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#initiative-editor-grid)" />
              <rect width="100%" height="100%" fill="url(#initiative-editor-lines)" />
            </svg>
          </div>

          {/* Floating Shapes */}
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"
          />
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"
          />

          <div className="relative px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-roobert-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5" />
                {isNew ? 'Create New Initiative' : 'Edit Initiative'}
              </h3>
              <p className="text-white/80 text-xs mt-0.5">Strategic project driving organizational transformation</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Save Initiative"
              >
                <Save className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          </div>
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
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <OverviewTab editData={editData} setEditData={setEditData} goals={goals} />
          )}
          {activeTab === 'milestones' && (
            <MilestonesTab editData={editData} setEditData={setEditData} onOpenGanttEditor={() => setShowGanttEditor(true)} />
          )}
          {activeTab === 'dependencies' && (
            <DependenciesTab editData={editData} setEditData={setEditData} />
          )}
          {activeTab === 'performance' && (
            <PerformanceTab editData={editData} setEditData={setEditData} />
          )}
          {activeTab === 'resources' && (
            <ResourcesTab editData={editData} setEditData={setEditData} />
          )}
          {activeTab === 'risks' && (
            <RisksTab editData={editData} setEditData={setEditData} />
          )}
          {activeTab === 'tasks' && (
            <TasksTab editData={editData} setEditData={setEditData} />
          )}
          {activeTab === 'goals' && (
            <GoalsTab editData={editData} setEditData={setEditData} goals={goals} />
          )}
        </div>
      </motion.div>

      {/* Gantt Editor Modal */}
      {showGanttEditor && (
        <GanttEditor
          isOpen={showGanttEditor}
          onClose={() => setShowGanttEditor(false)}
          initiativeData={editData}
          onSave={handleGanttSave}
        />
      )}
    </div>
  );
}

// ==================== TAB COMPONENTS ====================

function OverviewTab({ editData, setEditData, goals }: any) {
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div>
        <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          Basic Information
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
              Initiative Name *
            </label>
            <input
              type="text"
              value={editData.name || ''}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Digital First Demo Services"
            />
          </div>
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
              Short Name
            </label>
            <input
              type="text"
              value={editData.shortName || ''}
              onChange={(e) => setEditData({ ...editData, shortName: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="Demo Automation"
            />
          </div>
        </div>
      </div>

      {/* Status & Progress */}
      <div>
        <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">Status & Timeline</h4>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
            <select
              value={editData.status || 'planning'}
              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="at-risk">At Risk</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            <select
              value={editData.priority || 'medium'}
              onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Progress (%)</label>
            <input
              type="number"
              value={editData.progress || 0}
              onChange={(e) => setEditData({ ...editData, progress: Number(e.target.value) })}
              min="0"
              max="100"
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
            <select
              value={editData.projectStage || 'planning'}
              onChange={(e) => setEditData({ ...editData, projectStage: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
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
        <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
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
          className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
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

      {/* Initiative Statement */}
      <div>
        <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1">Initiative Statement</label>
        <textarea
          value={editData.smartGoal?.statement || ''}
          onChange={(e) => setEditData({
            ...editData,
            smartGoal: { ...(editData.smartGoal || {}), statement: e.target.value }
          })}
          rows={3}
          className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          placeholder="1-2 sentence statement of what this initiative aims to achieve..."
        />
      </div>

      {/* Business Case */}
      <div>
        <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">Business Case</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Problem</label>
            <textarea
              value={editData.businessCase?.problem || ''}
              onChange={(e) => setEditData({
                ...editData,
                businessCase: { ...(editData.businessCase || {}), problem: e.target.value }
              })}
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="What problem does this solve?"
            />
          </div>
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Opportunity</label>
            <textarea
              value={editData.businessCase?.opportunity || ''}
              onChange={(e) => setEditData({
                ...editData,
                businessCase: { ...(editData.businessCase || {}), opportunity: e.target.value }
              })}
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="What opportunity does this create?"
            />
          </div>
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Solution</label>
            <textarea
              value={editData.businessCase?.solution || ''}
              onChange={(e) => setEditData({
                ...editData,
                businessCase: { ...(editData.businessCase || {}), solution: e.target.value }
              })}
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="How will we solve it?"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Expected ROI</label>
              <input
                type="text"
                value={editData.businessCase?.roi || ''}
                onChange={(e) => setEditData({
                  ...editData,
                  businessCase: { ...(editData.businessCase || {}), roi: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                placeholder="450% in 18 months"
              />
            </div>
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Payback Period</label>
              <input
                type="text"
                value={editData.businessCase?.paybackPeriod || ''}
                onChange={(e) => setEditData({
                  ...editData,
                  businessCase: { ...(editData.businessCase || {}), paybackPeriod: e.target.value }
                })}
                className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                placeholder="12 months"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Expected Benefits</label>
            <div className="space-y-2">
              {(editData.businessCase?.expectedBenefits || []).map((benefit: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => {
                      const updated = [...(editData.businessCase?.expectedBenefits || [])];
                      updated[idx] = e.target.value;
                      setEditData({
                        ...editData,
                        businessCase: { ...(editData.businessCase || {}), expectedBenefits: updated }
                      });
                    }}
                    className="flex-1 px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                    placeholder="Benefit description"
                  />
                  <button
                    onClick={() => {
                      const updated = [...(editData.businessCase?.expectedBenefits || [])];
                      updated.splice(idx, 1);
                      setEditData({
                        ...editData,
                        businessCase: { ...(editData.businessCase || {}), expectedBenefits: updated }
                      });
                    }}
                    className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setEditData({
                    ...editData,
                    businessCase: {
                      ...(editData.businessCase || {}),
                      expectedBenefits: [...(editData.businessCase?.expectedBenefits || []), '']
                    }
                  });
                }}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Benefit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ownership */}
      <div>
        <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">Ownership</h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Owner *</label>
            <input
              type="text"
              value={editData.owner || ''}
              onChange={(e) => setEditData({ ...editData, owner: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="Sarah Chen"
            />
          </div>
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Sponsor</label>
            <input
              type="text"
              value={editData.sponsor || ''}
              onChange={(e) => setEditData({ ...editData, sponsor: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="SVP, Revenue Operations"
            />
          </div>
          <div>
            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={editData.category || 'innovation'}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="revenue">Revenue</option>
              <option value="customer">Customer</option>
              <option value="cost">Cost</option>
              <option value="innovation">Innovation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Co-Owners */}
      <div>
        <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">Co-Owners</label>
        <div className="space-y-2">
          {(editData.coOwners || []).map((coOwner: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={coOwner}
                onChange={(e) => {
                  const updated = [...(editData.coOwners || [])];
                  updated[idx] = e.target.value;
                  setEditData({ ...editData, coOwners: updated });
                }}
                className="flex-1 px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                placeholder="Co-owner name"
              />
              <button
                onClick={() => {
                  const updated = [...(editData.coOwners || [])];
                  updated.splice(idx, 1);
                  setEditData({ ...editData, coOwners: updated });
                }}
                className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              setEditData({
                ...editData,
                coOwners: [...(editData.coOwners || []), '']
              });
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Co-Owner
          </button>
        </div>
      </div>

      {/* Key Stakeholders */}
      <div>
        <label className="block text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">Key Stakeholders</label>
        <div className="space-y-3">
          {(editData.stakeholders || []).map((stakeholder: any, idx: number) => (
            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  value={stakeholder.name || ''}
                  onChange={(e) => {
                    const updated = [...(editData.stakeholders || [])];
                    updated[idx] = { ...updated[idx], name: e.target.value };
                    setEditData({ ...editData, stakeholders: updated });
                  }}
                  className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={stakeholder.role || ''}
                  onChange={(e) => {
                    const updated = [...(editData.stakeholders || [])];
                    updated[idx] = { ...updated[idx], role: e.target.value };
                    setEditData({ ...editData, stakeholders: updated });
                  }}
                  className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                  placeholder="Role"
                />
                <select
                  value={stakeholder.supportLevel || 'neutral'}
                  onChange={(e) => {
                    const updated = [...(editData.stakeholders || [])];
                    updated[idx] = { ...updated[idx], supportLevel: e.target.value };
                    setEditData({ ...editData, stakeholders: updated });
                  }}
                  className="px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-sm"
                >
                  <option value="champion">Champion</option>
                  <option value="supporter">Supporter</option>
                  <option value="neutral">Neutral</option>
                  <option value="skeptic">Skeptic</option>
                </select>
              </div>
              <button
                onClick={() => {
                  const updated = [...(editData.stakeholders || [])];
                  updated.splice(idx, 1);
                  setEditData({ ...editData, stakeholders: updated });
                }}
                className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              setEditData({
                ...editData,
                stakeholders: [...(editData.stakeholders || []), { name: '', role: '', supportLevel: 'neutral' }]
              });
            }}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Stakeholder
          </button>
        </div>
      </div>
    </div>
  );
}

function MilestonesTab({ editData, setEditData, onOpenGanttEditor }: any) {
  // ========== MILESTONES FUNCTIONS ==========
  const addMilestone = () => {
    const newMilestone = {
      phase: '',
      deliverable: '',
      dueDate: '',
      status: 'not-started'
    };
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        timeBound: {
          ...(editData.smartGoal?.timeBound || {}),
          timeline: [...(editData.smartGoal?.timeBound?.timeline || []), newMilestone]
        }
      }
    });
  };

  const removeMilestone = (index: number) => {
    const updated = [...(editData.smartGoal?.timeBound?.timeline || [])];
    updated.splice(index, 1);
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        timeBound: {
          ...(editData.smartGoal?.timeBound || {}),
          timeline: updated
        }
      }
    });
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...(editData.smartGoal?.timeBound?.timeline || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        timeBound: {
          ...(editData.smartGoal?.timeBound || {}),
          timeline: updated
        }
      }
    });
  };

  // ========== SMART GOALS FUNCTIONS ==========
  const addSpecificObjective = () => {
    const objectives = editData.smartGoal?.specific?.objectives || [];
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        specific: {
          ...(editData.smartGoal?.specific || {}),
          objectives: [...objectives, '']
        }
      }
    });
  };

  const removeSpecificObjective = (index: number) => {
    const objectives = [...(editData.smartGoal?.specific?.objectives || [])];
    objectives.splice(index, 1);
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        specific: { ...(editData.smartGoal?.specific || {}), objectives }
      }
    });
  };

  const updateSpecificObjective = (index: number, value: string) => {
    const objectives = [...(editData.smartGoal?.specific?.objectives || [])];
    objectives[index] = value;
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        specific: { ...(editData.smartGoal?.specific || {}), objectives }
      }
    });
  };

  const addMeasurableMetric = () => {
    const metrics = editData.smartGoal?.measurable?.metrics || [];
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        measurable: {
          ...(editData.smartGoal?.measurable || {}),
          metrics: [...metrics, '']
        }
      }
    });
  };

  const removeMeasurableMetric = (index: number) => {
    const metrics = [...(editData.smartGoal?.measurable?.metrics || [])];
    metrics.splice(index, 1);
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        measurable: { ...(editData.smartGoal?.measurable || {}), metrics }
      }
    });
  };

  const updateMeasurableMetric = (index: number, value: string) => {
    const metrics = [...(editData.smartGoal?.measurable?.metrics || [])];
    metrics[index] = value;
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        measurable: { ...(editData.smartGoal?.measurable || {}), metrics }
      }
    });
  };

  const addCroAlignment = () => {
    const croAlignment = editData.smartGoal?.relevant?.croAlignment || [];
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        relevant: {
          ...(editData.smartGoal?.relevant || {}),
          croAlignment: [...croAlignment, '']
        }
      }
    });
  };

  const removeCroAlignment = (index: number) => {
    const croAlignment = [...(editData.smartGoal?.relevant?.croAlignment || [])];
    croAlignment.splice(index, 1);
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        relevant: { ...(editData.smartGoal?.relevant || {}), croAlignment }
      }
    });
  };

  const updateCroAlignment = (index: number, value: string) => {
    const croAlignment = [...(editData.smartGoal?.relevant?.croAlignment || [])];
    croAlignment[index] = value;
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        relevant: { ...(editData.smartGoal?.relevant || {}), croAlignment }
      }
    });
  };

  const addStrategicTheme = () => {
    const strategicThemes = editData.smartGoal?.relevant?.strategicThemes || [];
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        relevant: {
          ...(editData.smartGoal?.relevant || {}),
          strategicThemes: [...strategicThemes, '']
        }
      }
    });
  };

  const removeStrategicTheme = (index: number) => {
    const strategicThemes = [...(editData.smartGoal?.relevant?.strategicThemes || [])];
    strategicThemes.splice(index, 1);
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        relevant: { ...(editData.smartGoal?.relevant || {}), strategicThemes }
      }
    });
  };

  const updateStrategicTheme = (index: number, value: string) => {
    const strategicThemes = [...(editData.smartGoal?.relevant?.strategicThemes || [])];
    strategicThemes[index] = value;
    setEditData({
      ...editData,
      smartGoal: {
        ...(editData.smartGoal || {}),
        relevant: { ...(editData.smartGoal?.relevant || {}), strategicThemes }
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* ========== GANTT CHART BUTTON ========== */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-roobert-bold text-purple-900 dark:text-purple-100 flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5" />
              Advanced Gantt Chart Editor
            </h4>
            <p className="text-xs text-purple-700 dark:text-purple-300">
              Open external Gantt editor to build detailed project plans with templates, dependencies, and hierarchical tasks
            </p>
          </div>
          <button
            onClick={onOpenGanttEditor}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-roobert-semibold flex items-center gap-2 transition-colors shadow-lg"
          >
            <Calendar className="w-5 h-5" />
            Edit Gantt
          </button>
        </div>
      </div>

      {/* ========== GANTT VISUALIZATION ========== */}
      {(() => {
        console.log('🔍 Gantt Check:', {
          hasGanttData: !!editData.ganttData,
          hasTasks: !!editData.ganttData?.tasks,
          taskCount: editData.ganttData?.tasks?.length,
          ganttData: editData.ganttData
        });
        return editData.ganttData && editData.ganttData.tasks && editData.ganttData.tasks.length > 0;
      })() && (
        <div className="my-4">
          <GanttVisualizer ganttData={editData.ganttData} />
        </div>
      )}

      {/* ========== PROJECT MILESTONES ========== */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Project Milestones
          </h4>
          <button
            onClick={addMilestone}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Milestone
          </button>
        </div>
        
        <div className="space-y-3">
          {(editData.smartGoal?.timeBound?.timeline || []).map((milestone: any, index: number) => (
            <div key={index} className={`p-4 rounded-lg border-2 ${
              milestone.status === 'completed' ? 'bg-green-50 dark:bg-green-950/20 border-green-500 dark:border-green-700' :
              milestone.status === 'in-progress' ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500 dark:border-blue-700' :
              'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
            }`}>
              <div className="grid grid-cols-6 gap-3 mb-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Phase Name</label>
                  <input
                    type="text"
                    value={milestone.phase || ''}
                    onChange={(e) => updateMilestone(index, 'phase', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="MVP Development"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Deliverable</label>
                  <input
                    type="text"
                    value={milestone.deliverable || ''}
                    onChange={(e) => updateMilestone(index, 'deliverable', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Core automation workflows operational"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={milestone.dueDate || ''}
                    onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Status</label>
                  <select
                    value={milestone.status || 'not-started'}
                    onChange={(e) => updateMilestone(index, 'status', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => removeMilestone(index)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          {(!editData.smartGoal?.timeBound?.timeline || editData.smartGoal.timeBound.timeline.length === 0) && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic py-4 text-center">
              No milestones yet. Click "Add Milestone" to create project milestones.
            </p>
          )}
        </div>
      </div>

      {/* ========== OBJECTIVES (SMART GOALS) ========== */}
      <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-6">
        <h3 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Objectives
        </h3>

        {/* Top Row: Specific & Measurable */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Specific Objectives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300">Specific Objectives</h4>
              <button
                onClick={addSpecificObjective}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {(editData.smartGoal?.specific?.objectives || []).map((obj: string, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => updateSpecificObjective(idx, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="What specifically will we accomplish?"
                  />
                  <button
                    onClick={() => removeSpecificObjective(idx)}
                    className="px-2 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {(!editData.smartGoal?.specific?.objectives || editData.smartGoal.specific.objectives.length === 0) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic py-2 text-center">
                  No objectives yet. Click "Add" to define specific goals.
                </p>
              )}
            </div>
          </div>

          {/* Measurable Metrics */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300">Measurable Metrics</h4>
              <button
                onClick={addMeasurableMetric}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {(editData.smartGoal?.measurable?.metrics || []).map((metric: string, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={metric}
                    onChange={(e) => updateMeasurableMetric(idx, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="How will we measure success?"
                  />
                  <button
                    onClick={() => removeMeasurableMetric(idx)}
                    className="px-2 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {(!editData.smartGoal?.measurable?.metrics || editData.smartGoal.measurable.metrics.length === 0) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic py-2 text-center">
                  No metrics yet. Click "Add" to define measurable outcomes.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Achievable & Relevant */}
        <div className="grid grid-cols-2 gap-4">
          {/* Achievable */}
          <div>
            <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">Achievable Resources</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mb-1">Available Resources</label>
                <textarea
                  value={editData.smartGoal?.achievable?.resources || ''}
                  onChange={(e) => setEditData({
                    ...editData,
                    smartGoal: {
                      ...(editData.smartGoal || {}),
                      achievable: { ...(editData.smartGoal?.achievable || {}), resources: e.target.value }
                    }
                  })}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  placeholder="What resources are available to achieve this?"
                />
              </div>
              <div>
                <label className="block text-xs font-roobert-medium text-gray-600 dark:text-gray-400 mb-1">Team Size</label>
                <input
                  type="text"
                  value={editData.smartGoal?.achievable?.teamSize || ''}
                  onChange={(e) => setEditData({
                    ...editData,
                    smartGoal: {
                      ...(editData.smartGoal || {}),
                      achievable: { ...(editData.smartGoal?.achievable || {}), teamSize: e.target.value }
                    }
                  })}
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  placeholder="5 FTE"
                />
              </div>
            </div>
          </div>

          {/* Relevant - Strategic Alignment */}
          <div>
            <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">Strategic Alignment</h4>
            <div className="space-y-3">
              {/* CRO Impact Areas */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">CRO Impact Areas</label>
                  <button
                    onClick={addCroAlignment}
                    className="px-1.5 py-0.5 bg-fis-navy hover:bg-fis-navy/80 text-white text-xs rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(editData.smartGoal?.relevant?.croAlignment || []).map((area: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-fis-navy/10 text-fis-navy dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => updateCroAlignment(idx, e.target.value)}
                        className="bg-transparent border-none outline-none w-24 text-xs"
                        placeholder="Impact area"
                      />
                      <button onClick={() => removeCroAlignment(idx)}>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Themes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">Strategic Themes</label>
                  <button
                    onClick={addStrategicTheme}
                    className="px-1.5 py-0.5 bg-fis-raspberry hover:bg-fis-raspberry/80 text-white text-xs rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(editData.smartGoal?.relevant?.strategicThemes || []).map((theme: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-fis-raspberry/10 text-fis-raspberry dark:bg-pink-900/30 dark:text-pink-300 text-xs">
                      <input
                        type="text"
                        value={theme}
                        onChange={(e) => updateStrategicTheme(idx, e.target.value)}
                        className="bg-transparent border-none outline-none w-24 text-xs"
                        placeholder="Theme"
                      />
                      <button onClick={() => removeStrategicTheme(idx)}>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
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
    <div className="space-y-4">
      {/* Internal Dependencies */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
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
        
        <div className="grid grid-cols-2 gap-3">
          {editData.dependencies?.internal?.map((dep: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Depends On (Team/System)</label>
                  <input
                    type="text"
                    value={dep.on || ''}
                    onChange={(e) => updateInternalDependency(index, 'on', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Data Platform Team"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dep.dueDate || ''}
                    onChange={(e) => updateInternalDependency(index, 'dueDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={dep.description || ''}
                  onChange={(e) => updateInternalDependency(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  placeholder="API access to customer data lakes"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Criticality</label>
                  <select
                    value={dep.criticality || 'medium'}
                    onChange={(e) => updateInternalDependency(index, 'criticality', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
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
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
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
                    className="w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
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
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
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
        
        <div className="grid grid-cols-2 gap-3">
          {editData.dependencies?.external?.map((dep: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Vendor/Partner</label>
                  <input
                    type="text"
                    value={dep.on || ''}
                    onChange={(e) => updateExternalDependency(index, 'on', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="OpenAI"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Contract End</label>
                  <input
                    type="date"
                    value={dep.contractEnd || ''}
                    onChange={(e) => updateExternalDependency(index, 'contractEnd', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                <textarea
                  value={dep.description || ''}
                  onChange={(e) => updateExternalDependency(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  placeholder="GPT-4 API access for intelligent demo data generation"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Criticality</label>
                  <select
                    value={dep.criticality || 'medium'}
                    onChange={(e) => updateExternalDependency(index, 'criticality', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
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
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
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
                    className="w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
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
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
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
        
        <div className="grid grid-cols-2 gap-3">
          {editData.dependencies?.blocking?.map((dep: any, index: number) => (
            <div key={index} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Initiative/Project Name</label>
                  <input
                    type="text"
                    value={dep.initiative || ''}
                    onChange={(e) => updateBlockingDependency(index, 'initiative', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Customer Data Platform v2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expected Resolution</label>
                  <input
                    type="date"
                    value={dep.expectedResolution || ''}
                    onChange={(e) => updateBlockingDependency(index, 'expectedResolution', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Why This Blocks Progress</label>
                <textarea
                  value={dep.description || ''}
                  onChange={(e) => updateBlockingDependency(index, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  placeholder="Requires stable CDP APIs for production demo data synthesis"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Criticality</label>
                  <select
                    value={dep.criticality || 'high'}
                    onChange={(e) => updateBlockingDependency(index, 'criticality', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  >
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => removeBlockingDependency(index)}
                    className="w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
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

function PerformanceTab({ editData, setEditData }: any) {
  const addLeadingIndicator = () => {
    setEditData({
      ...editData,
      indicators: {
        ...(editData.indicators || {}),
        leading: [...(editData.indicators?.leading || []), { name: '', baseline: '', current: '', target: '', unit: '' }]
      }
    });
  };

  const removeLeadingIndicator = (index: number) => {
    const updated = [...(editData.indicators?.leading || [])];
    updated.splice(index, 1);
    setEditData({
      ...editData,
      indicators: { ...(editData.indicators || {}), leading: updated }
    });
  };

  const updateLeadingIndicator = (index: number, field: string, value: any) => {
    const updated = [...(editData.indicators?.leading || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({
      ...editData,
      indicators: { ...(editData.indicators || {}), leading: updated }
    });
  };

  const addLaggingIndicator = () => {
    setEditData({
      ...editData,
      indicators: {
        ...(editData.indicators || {}),
        lagging: [...(editData.indicators?.lagging || []), { name: '', baseline: '', current: '', target: '', unit: '' }]
      }
    });
  };

  const removeLaggingIndicator = (index: number) => {
    const updated = [...(editData.indicators?.lagging || [])];
    updated.splice(index, 1);
    setEditData({
      ...editData,
      indicators: { ...(editData.indicators || {}), lagging: updated }
    });
  };

  const updateLaggingIndicator = (index: number, field: string, value: any) => {
    const updated = [...(editData.indicators?.lagging || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({
      ...editData,
      indicators: { ...(editData.indicators || {}), lagging: updated }
    });
  };

  return (
    <div className="space-y-4">
      {/* Leading Indicators */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Leading Indicators
          </h4>
          <button
            onClick={addLeadingIndicator}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Leading
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(editData.indicators?.leading || []).map((indicator: any, index: number) => (
            <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Indicator Name</label>
                <input
                  type="text"
                  value={indicator.name || ''}
                  onChange={(e) => updateLeadingIndicator(index, 'name', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  placeholder="e.g., Demo Request Volume"
                />
              </div>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Baseline</label>
                  <input
                    type="text"
                    value={indicator.baseline || ''}
                    onChange={(e) => updateLeadingIndicator(index, 'baseline', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Current</label>
                  <input
                    type="text"
                    value={indicator.current || ''}
                    onChange={(e) => updateLeadingIndicator(index, 'current', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Target</label>
                  <input
                    type="text"
                    value={indicator.target || ''}
                    onChange={(e) => updateLeadingIndicator(index, 'target', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={indicator.unit || ''}
                    onChange={(e) => updateLeadingIndicator(index, 'unit', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="/mo"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => removeLeadingIndicator(index)}
                    className="w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    <X className="w-3 h-3 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lagging Indicators */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Lagging Indicators
          </h4>
          <button
            onClick={addLaggingIndicator}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Lagging
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(editData.indicators?.lagging || []).map((indicator: any, index: number) => (
            <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Indicator Name</label>
                <input
                  type="text"
                  value={indicator.name || ''}
                  onChange={(e) => updateLaggingIndicator(index, 'name', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  placeholder="e.g., Revenue from New Demos"
                />
              </div>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Baseline</label>
                  <input
                    type="text"
                    value={indicator.baseline || ''}
                    onChange={(e) => updateLaggingIndicator(index, 'baseline', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Current</label>
                  <input
                    type="text"
                    value={indicator.current || ''}
                    onChange={(e) => updateLaggingIndicator(index, 'current', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Target</label>
                  <input
                    type="text"
                    value={indicator.target || ''}
                    onChange={(e) => updateLaggingIndicator(index, 'target', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={indicator.unit || ''}
                    onChange={(e) => updateLaggingIndicator(index, 'unit', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="M"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => removeLaggingIndicator(index)}
                    className="w-full px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                  >
                    <X className="w-3 h-3 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourcesTab({ editData, setEditData }: any) {
  // Team Members
  const addTeamMember = () => {
    setEditData({
      ...editData,
      resources: {
        ...(editData.resources || {}),
        team: [...(editData.resources?.team || []), { name: '', role: '', allocation: '', commitment: '', note: '' }]
      }
    });
  };

  const removeTeamMember = (index: number) => {
    const updated = [...(editData.resources?.team || [])];
    updated.splice(index, 1);
    setEditData({
      ...editData,
      resources: { ...(editData.resources || {}), team: updated }
    });
  };

  const updateTeamMember = (index: number, field: string, value: any) => {
    const updated = [...(editData.resources?.team || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({
      ...editData,
      resources: { ...(editData.resources || {}), team: updated }
    });
  };

  // Tools
  const addTool = () => {
    const tools = editData.resources?.tools || [];
    setEditData({
      ...editData,
      resources: {
        ...(editData.resources || {}),
        tools: [...tools, '']
      }
    });
  };

  const removeTool = (index: number) => {
    const updated = [...(editData.resources?.tools || [])];
    updated.splice(index, 1);
    setEditData({
      ...editData,
      resources: { ...(editData.resources || {}), tools: updated }
    });
  };

  const updateTool = (index: number, value: string) => {
    const updated = [...(editData.resources?.tools || [])];
    updated[index] = value;
    setEditData({
      ...editData,
      resources: { ...(editData.resources || {}), tools: updated }
    });
  };

  return (
    <div className="space-y-4">
      {/* Team Members */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Members
          </h4>
          <button
            onClick={addTeamMember}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Member
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(editData.resources?.team || []).map((member: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={member.name || ''}
                    onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Role</label>
                  <input
                    type="text"
                    value={member.role || ''}
                    onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Product Manager"
                  />
                </div>
              </div>
              <div className="grid grid-cols-12 gap-3 mb-2">
                <div className="col-span-4">
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Allocation</label>
                  <input
                    type="text"
                    value={member.allocation || ''}
                    onChange={(e) => updateTeamMember(index, 'allocation', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="75%"
                  />
                </div>
                <div className="col-span-7">
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Commitment</label>
                  <input
                    type="text"
                    value={member.commitment || ''}
                    onChange={(e) => updateTeamMember(index, 'commitment', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Full-time"
                  />
                </div>
                <div className="col-span-1 flex items-end">
                  <button
                    onClick={() => removeTeamMember(index)}
                    className="w-full aspect-square p-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={member.note || ''}
                  onChange={(e) => updateTeamMember(index, 'note', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  placeholder="Additional notes"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools & Platforms */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Tools & Platforms
          </h4>
          <button
            onClick={addTool}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Tool
          </button>
        </div>
        <div className="space-y-2">
          {(editData.resources?.tools || []).map((tool: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={tool}
                onChange={(e) => updateTool(index, e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm"
                placeholder="Tool name (e.g., Salesforce, GitHub)"
              />
              <button
                onClick={() => removeTool(index)}
                className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RisksTab({ editData, setEditData }: any) {
  // Top Risks
  const addTopRisk = () => {
    setEditData({
      ...editData,
      topRisks: [...(editData.topRisks || []), { risk: '', level: 'medium', mitigation: '' }]
    });
  };

  const removeTopRisk = (index: number) => {
    const updated = [...(editData.topRisks || [])];
    updated.splice(index, 1);
    setEditData({ ...editData, topRisks: updated });
  };

  const updateTopRisk = (index: number, field: string, value: any) => {
    const updated = [...(editData.topRisks || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditData({ ...editData, topRisks: updated });
  };

  // Success Criteria
  const addSuccessCriteria = (category: 'technical' | 'business' | 'adoption') => {
    const current = editData.successCriteria || {};
    setEditData({
      ...editData,
      successCriteria: {
        ...current,
        [category]: [...(current[category] || []), '']
      }
    });
  };

  const removeSuccessCriteria = (category: string, index: number) => {
    const updated = [...(editData.successCriteria?.[category] || [])];
    updated.splice(index, 1);
    setEditData({
      ...editData,
      successCriteria: { ...(editData.successCriteria || {}), [category]: updated }
    });
  };

  const updateSuccessCriteria = (category: string, index: number, value: string) => {
    const updated = [...(editData.successCriteria?.[category] || [])];
    updated[index] = value;
    setEditData({
      ...editData,
      successCriteria: { ...(editData.successCriteria || {}), [category]: updated }
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Risks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Top Risks
          </h4>
          <button
            onClick={addTopRisk}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Risk
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(editData.topRisks || []).map((risk: any, index: number) => (
            <div key={index} className={`p-4 rounded-lg border ${
              risk.level === 'high' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' :
              risk.level === 'medium' ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' :
              'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="grid grid-cols-12 gap-3 mb-3">
                <div className="col-span-8">
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Risk Description</label>
                  <input
                    type="text"
                    value={risk.risk || ''}
                    onChange={(e) => updateTopRisk(index, 'risk', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Describe the risk..."
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Level</label>
                  <select
                    value={risk.level || 'medium'}
                    onChange={(e) => updateTopRisk(index, 'level', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="col-span-1 flex items-end">
                  <button
                    onClick={() => removeTopRisk(index)}
                    className="w-full aspect-square p-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 dark:text-gray-400 mb-1">Mitigation Strategy</label>
                <textarea
                  value={risk.mitigation || ''}
                  onChange={(e) => updateTopRisk(index, 'mitigation', e.target.value)}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                  placeholder="How will this risk be mitigated?"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Criteria */}
      <div>
        <h4 className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Success Criteria
        </h4>
        
        <div className="grid grid-cols-3 gap-3">
          {/* Technical Success */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-blue-600 dark:text-blue-400">Technical Success</label>
              <button
                onClick={() => addSuccessCriteria('technical')}
                className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(editData.successCriteria?.technical || []).map((criteria: string, idx: number) => (
                <div key={idx} className="flex items-start gap-1">
                  <input
                    type="text"
                    value={criteria}
                    onChange={(e) => updateSuccessCriteria('technical', idx, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Criteria..."
                  />
                  <button
                    onClick={() => removeSuccessCriteria('technical', idx)}
                    className="p-1 text-white bg-red-600 hover:bg-red-700 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Business Success */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-green-600 dark:text-green-400">Business Success</label>
              <button
                onClick={() => addSuccessCriteria('business')}
                className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(editData.successCriteria?.business || []).map((criteria: string, idx: number) => (
                <div key={idx} className="flex items-start gap-1">
                  <input
                    type="text"
                    value={criteria}
                    onChange={(e) => updateSuccessCriteria('business', idx, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Criteria..."
                  />
                  <button
                    onClick={() => removeSuccessCriteria('business', idx)}
                    className="p-1 text-white bg-red-600 hover:bg-red-700 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Adoption Success */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-purple-600 dark:text-purple-400">Adoption Success</label>
              <button
                onClick={() => addSuccessCriteria('adoption')}
                className="px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="space-y-2">
              {(editData.successCriteria?.adoption || []).map((criteria: string, idx: number) => (
                <div key={idx} className="flex items-start gap-1">
                  <input
                    type="text"
                    value={criteria}
                    onChange={(e) => updateSuccessCriteria('adoption', idx, e.target.value)}
                    className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    placeholder="Criteria..."
                  />
                  <button
                    onClick={() => removeSuccessCriteria('adoption', idx)}
                    className="p-1 text-white bg-red-600 hover:bg-red-700 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Minimum Viable Success */}
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Viable Success</label>
          <textarea
            value={editData.successCriteria?.minimumViableSuccess || ''}
            onChange={(e) => setEditData({
              ...editData,
              successCriteria: {
                ...(editData.successCriteria || {}),
                minimumViableSuccess: e.target.value
              }
            })}
            rows={2}
            className="w-full px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            placeholder="What is the minimum we need to achieve for this initiative to be considered successful?"
          />
        </div>
      </div>
    </div>
  );
}

function TasksTab({ editData, setEditData }: any) {
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
        <div className="flex items-center gap-2 mb-2">
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
        <div className="flex items-center gap-2 mb-2">
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

function GoalsTab({ editData, setEditData, goals }: any) {
  const linkedGoalIds = editData.linkedGoals || [];

  const toggleGoal = (goalId: string) => {
    const currentGoals = editData.linkedGoals || [];
    if (currentGoals.includes(goalId)) {
      setEditData({
        ...editData,
        linkedGoals: currentGoals.filter((id: string) => id !== goalId)
      });
    } else {
      setEditData({
        ...editData,
        linkedGoals: [...currentGoals, goalId]
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h4 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">Link Strategic Goals</h4>
      </div>
      
      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
        <p className="text-xs text-purple-800 dark:text-purple-200">
          <Info className="w-3.5 h-3.5 inline mr-1" />
          Select which strategic goals this initiative contributes to. You can link multiple goals.
        </p>
      </div>

      {goals && goals.length > 0 ? (
        <div className="space-y-2">
          {goals.map((goal: any) => {
            const isLinked = linkedGoalIds.includes(goal.id);
            
            return (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isLinked
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-400'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isLinked
                        ? 'bg-purple-600 border-purple-600'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                    }`}>
                      {isLinked && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">
                        Goal #{goal.id}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        goal.status === 'on-track' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        goal.status === 'at-risk' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {goal.status === 'on-track' ? '✓ On Track' : goal.status === 'at-risk' ? '⚠ At Risk' : '⚠ Off Track'}
                      </span>
                    </div>
                    <h5 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-1">{goal.name}</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{goal.description}</p>
                    {goal.targetDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-roobert-bold text-purple-600 dark:text-purple-400">{goal.progress || 0}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Progress</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No strategic goals available.</p>
          <p className="text-xs mt-1">Create goals first to link them to this initiative.</p>
        </div>
      )}

      {linkedGoalIds.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-xs text-green-800 dark:text-green-200">
            <strong>{linkedGoalIds.length}</strong> {linkedGoalIds.length === 1 ? 'goal' : 'goals'} linked to this initiative
          </p>
        </div>
      )}
    </div>
  );
}





