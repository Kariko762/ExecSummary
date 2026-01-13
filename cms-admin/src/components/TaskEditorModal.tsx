/**
 * TASK EDITOR MODAL WITH TABS
 * Tabs: {Task} and {Data Points}
 */

import React, { useState, useEffect } from 'react';
import {
  X, Calendar, DollarSign, Users, AlertCircle, Target,
  ExternalLink, FileText, Package, Building2, ListChecks, Edit3, Tag, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskStep {
  id: string;
  step: string;
  state: 'Pending' | 'Scheduled' | 'In-Progress' | 'Cancelled' | 'Complete';
}

interface Task {
  id?: string;
  title: string;
  owner: string;
  team: string;
  businessUnit: string;
  product: string;
  startDate: string;
  targetDate: string;
  percentage: number;
  status: 'On Track' | 'At Risk' | 'Blocked' | 'Complete';
  budget: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  milestones: string;
  risks: string;
  dependencies: string;
  steps: TaskStep[];
  tags?: string[]; // Array of tag IDs
  goalId?: string; // Strategic Goal ID
  enabledFields?: {
    owner?: boolean;
    team?: boolean;
    businessUnit?: boolean;
    product?: boolean;
    startDate?: boolean;
    targetDate?: boolean;
    budget?: boolean;
    description?: boolean;
    milestones?: boolean;
    risks?: boolean;
    dependencies?: boolean;
    steps?: boolean;
  };
}

interface TaskEditorModalProps {
  task?: Task;
  onSave: (task: Task) => void;
  onClose: () => void;
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ task, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'task' | 'dataPoints'>('task');
  const [editMode, setEditMode] = useState(!task); // True for new tasks, false for existing
  const [tags, setTags] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [goals, setGoals] = useState<Array<{ id: string; name: string; shortName: string; color: string }>>([]);
  
  // Tag panel state
  const [showTagPanel, setShowTagPanel] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#7C3AED');
  
  const [formData, setFormData] = useState<Task>(task || {
    title: 'New Task',
    owner: '',
    team: '',
    businessUnit: '',
    product: '',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    percentage: 0,
    status: 'On Track',
    budget: '',
    priority: 'Medium',
    description: '',
    milestones: '',
    risks: '',
    dependencies: '',
    steps: [],
    tags: [],
    goalId: '',
    enabledFields: {
      owner: true,
      team: true,
      businessUnit: true,
      product: true,
      startDate: true,
      targetDate: true,
      budget: true,
      description: true,
      milestones: true,
      risks: true,
      dependencies: true,
      steps: true
    }
  });

  // Fetch tags and goals on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/tags');
        const data = await response.json();
        if (data.success) {
          setTags(data.tags);
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      }
    };

    const fetchGoals = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/goals');
        const data = await response.json();
        setGoals(data.goals || []);
      } catch (error) {
        console.error('Failed to fetch goals:', error);
      }
    };

    fetchTags();
    fetchGoals();
  }, []);

  const fields = formData.enabledFields || {};
  
  // Tag management handlers
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const response = await fetch('http://localhost:3001/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor
        })
      });
      
      if (response.ok) {
        const newTag = await response.json();
        setTags([...tags, newTag]);
        setNewTagName('');
        setNewTagColor('#7C3AED');
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };
  
  const handleToggleTag = (tagId: string) => {
    const currentTags = formData.tags || [];
    const updatedTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    updateField('tags', updatedTags);
  };
  
  const handleRemoveTag = (tagId: string) => {
    const updatedTags = (formData.tags || []).filter(id => id !== tagId);
    updateField('tags', updatedTags);
  };

  const updateField = (field: keyof Task, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleField = (field: keyof NonNullable<Task['enabledFields']>) => {
    setFormData({
      ...formData,
      enabledFields: {
        ...formData.enabledFields,
        [field]: !formData.enabledFields?.[field]
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Tag Panel Button */}
        <motion.button
          onClick={() => setShowTagPanel(!showTagPanel)}
          className="absolute right-0 top-[68px] bg-white/20 text-white px-2 py-3 rounded-l-lg shadow-lg z-10 hover:bg-white/30 transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-xs font-roobert-medium writing-mode-vertical transform rotate-180">Tag</span>
        </motion.button>
        
        {/* Tag Panel */}
        <AnimatePresence>
          {showTagPanel && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-20 flex flex-col overflow-hidden"
            >
              {/* Tag Panel Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-roobert-semibold text-white">Select Tags</h3>
                  <button
                    onClick={() => setShowTagPanel(false)}
                    className="p-1 hover:bg-white/20 rounded transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tag Panel Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Current Tags */}
                {formData.tags && formData.tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Tags ({formData.tags.length})
                    </h4>
                    <div className="space-y-2">
                      {formData.tags.map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <div
                            key={tag.id}
                            className="flex items-center justify-between p-2 rounded-lg"
                            style={{ backgroundColor: `${tag.color}20` }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="text-sm font-roobert-medium" style={{ color: tag.color }}>
                                {tag.name}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveTag(tag.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Tags */}
                <div>
                  <h4 className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Available Tags
                  </h4>
                  <div className="space-y-1">
                    {tags.map(tag => {
                      const isSelected = formData.tags?.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => handleToggleTag(tag.id)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-gray-100 dark:bg-gray-800'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm font-roobert-regular text-gray-700 dark:text-gray-300 flex-1 text-left">
                            {tag.name}
                          </span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Create New Tag */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-3">
                    Create New Tag
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                      placeholder="Tag name..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-roobert-regular bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-roobert-regular text-gray-600 dark:text-gray-400">
                        Color:
                      </label>
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <div
                        className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: newTagColor }}
                      />
                    </div>
                    <button
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                      className="w-full px-4 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-roobert-medium text-sm transition-colors"
                    >
                      Create Tag
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Header with Tabs */}
        <div className="p-6 bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-tertiary)] border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-roobert-semibold text-white">
              {task ? 'Edit Task' : 'New Task'}
            </h2>
            <div className="flex items-center gap-3">
              {/* Tags in Header */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-roobert-medium text-white/80">Tags:</span>
                {(formData.tags || []).length > 0 ? (
                  (formData.tags || []).map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <span
                        key={tagId}
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ) : null;
                  })
                ) : (
                  <span className="text-xs text-white/60">No tags</span>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('task')}
                className={`px-4 py-2 rounded-lg font-roobert-medium transition-colors ${
                  activeTab === 'task'
                    ? 'bg-white text-[var(--brand-primary)] shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Task {task && `(${editMode ? 'Edit Mode' : 'View Mode'})`}
              </button>
              <button
                onClick={() => setActiveTab('dataPoints')}
                className={`px-4 py-2 rounded-lg font-roobert-medium transition-colors ${
                  activeTab === 'dataPoints'
                    ? 'bg-white text-[var(--brand-primary)] shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Data Points
              </button>
              {/* Edit Mode Toggle - inline with tabs */}
              {task && activeTab === 'task' && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-roobert-medium text-white hover:bg-white/20 rounded-lg transition-colors ml-4 border border-white/30"
                >
                  <Edit3 className="w-4 h-4" />
                  {editMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'task' && (
            <div className="space-y-3">
              {/* Title - Always visible */}
              <div>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-4 py-3 text-2xl font-roobert-semibold bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                    placeholder="Task Title"
                  />
                ) : (
                  <h2 className="text-2xl font-roobert-semibold text-gray-900 dark:text-white">{formData.title}</h2>
                )}
              </div>

              {/* Row: Owner & Team */}
              {(fields.owner || fields.team) && (
                <div className="grid grid-cols-2 gap-4">
                  {fields.owner && (
                    <div>
                      <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span className="flex items-center gap-2"><Users className="w-4 h-4" />Owner</span>
                      </label>
                      <input type="text" value={formData.owner} onChange={(e) => updateField('owner', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                        disabled={!editMode} />
                    </div>
                  )}
                  {fields.team && (
                    <div>
                      <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span className="flex items-center gap-2"><Users className="w-4 h-4" />Team</span>
                      </label>
                      <input type="text" value={formData.team} onChange={(e) => updateField('team', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode} />
                    </div>
                  )}
                </div>
              )}

              {/* Row: Business Unit & Product */}
              {(fields.businessUnit || fields.product) && (
                <div className="grid grid-cols-2 gap-4">
                  {fields.businessUnit && (
                    <div>
                      <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span className="flex items-center gap-2"><Building2 className="w-4 h-4" />Business Unit</span>
                      </label>
                      <input type="text" value={formData.businessUnit} onChange={(e) => updateField('businessUnit', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode} />
                    </div>
                  )}
                  {fields.product && (
                    <div>
                      <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span className="flex items-center gap-2"><Package className="w-4 h-4" />Product</span>
                      </label>
                      <input type="text" value={formData.product} onChange={(e) => updateField('product', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode} />
                    </div>
                  )}
                </div>
              )}

              {/* Row: Dates & Budget */}
              <div className="grid grid-cols-3 gap-4">
                {fields.startDate && (
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />Start Date</span>
                    </label>
                    <input type="date" value={formData.startDate} onChange={(e) => updateField('startDate', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode} />
                  </div>
                )}
                {fields.targetDate && (
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span className="flex items-center gap-2"><Target className="w-4 h-4" />Target Date</span>
                    </label>
                    <input type="date" value={formData.targetDate} onChange={(e) => updateField('targetDate', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode} />
                  </div>
                )}
                {fields.budget && (
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Budget</span>
                    </label>
                    <input type="text" value={formData.budget} onChange={(e) => updateField('budget', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white" placeholder="$0" />
                  </div>
                )}
              </div>

              {/* Row: Progress, Status, Priority - Always visible */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Progress (%)</label>
                  <input type="number" min="0" max="100" value={formData.percentage}
                    onChange={(e) => updateField('percentage', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => updateField('status', e.target.value as Task['status'])}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode}>
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select value={formData.priority} onChange={(e) => updateField('priority', e.target.value as Task['priority'])}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Goal - Always visible */}
              <div>
                <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span className="flex items-center gap-2"><Target className="w-4 h-4" />Strategic Goal</span>
                </label>
                <div className="flex gap-2">
                  {editMode ? (
                    <select
                      value={formData.goalId || ''}
                      onChange={(e) => updateField('goalId', e.target.value)}
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                    >
                      <option value="">No goal linked</option>
                      {goals.map(goal => (
                        <option key={goal.id} value={goal.id}>{goal.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex-1">
                      {formData.goalId ? (
                        (() => {
                          const goal = goals.find(g => g.id === formData.goalId);
                          return goal ? (
                            <span
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium text-white"
                              style={{ backgroundColor: goal.color }}
                            >
                              {goal.name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">Goal not found</span>
                          );
                        })()
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No goal linked</span>
                      )}
                    </div>
                  )}
                  {formData.goalId && (
                    <button
                      onClick={() => {
                        // Close this modal first, then open the goal
                        onClose();
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('openGoal', { detail: formData.goalId }));
                        }, 100);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-roobert-medium transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Follow
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {fields.description && (
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    rows={3} placeholder="Task overview..." disabled={!editMode} />
                </div>
              )}

              {/* Milestones */}
              {fields.milestones && (
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span className="flex items-center gap-2"><Target className="w-4 h-4" />Milestones</span>
                  </label>
                  <textarea value={formData.milestones} onChange={(e) => updateField('milestones', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    rows={2} placeholder="Separate with | character" disabled={!editMode} />
                </div>
              )}

              {/* Risks */}
              {fields.risks && (
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />Risks</span>
                  </label>
                  <textarea value={formData.risks} onChange={(e) => updateField('risks', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    rows={2} placeholder="Identified risks..." disabled={!editMode} />
                </div>
              )}

              {/* Dependencies */}
              {fields.dependencies && (
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Dependencies</label>
                  <textarea value={formData.dependencies} onChange={(e) => updateField('dependencies', e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    rows={2} placeholder="External dependencies..." disabled={!editMode} />
                </div>
              )}

              {/* Steps */}
              {fields.steps && (
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    <span className="flex items-center gap-2"><ListChecks className="w-4 h-4" />Steps</span>
                  </label>
                  <div className="space-y-2">
                    {formData.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-2">
                        <select value={step.state}
                          onChange={(e) => {
                            const newSteps = [...formData.steps];
                            newSteps[index].state = e.target.value as TaskStep['state'];
                            updateField('steps', newSteps);
                          }}
                          className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ width: '35%' }} disabled={!editMode}>
                          <option value="Pending">Pending</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="In-Progress">In-Progress</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Complete">Complete</option>
                        </select>
                        <input type="text" value={step.step}
                          onChange={(e) => {
                            const newSteps = [...formData.steps];
                            newSteps[index].step = e.target.value;
                            updateField('steps', newSteps);
                          }}
                          className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                          style={{ width: '65%' }} placeholder="Step description..." disabled={!editMode} />
                        {editMode && (
                          <button
                            onClick={() => updateField('steps', formData.steps.filter((_, i) => i !== index))}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="Delete step">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {editMode && (
                      <button
                        onClick={() => updateField('steps', [...formData.steps, { id: `step-${Date.now()}`, step: '', state: 'Pending' as const }])}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        + Add Step
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'dataPoints' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">Configure Data Points</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enable or disable fields. Only enabled fields appear in Task tab.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'owner', icon: Users, label: 'Owner' },
                  { key: 'team', icon: Users, label: 'Team' },
                  { key: 'businessUnit', icon: Building2, label: 'Business Unit' },
                  { key: 'product', icon: Package, label: 'Product' },
                  { key: 'startDate', icon: Calendar, label: 'Start Date' },
                  { key: 'targetDate', icon: Target, label: 'Target Date' },
                  { key: 'budget', icon: DollarSign, label: 'Budget' },
                  { key: 'description', icon: FileText, label: 'Description' },
                  { key: 'milestones', icon: Target, label: 'Milestones' },
                  { key: 'risks', icon: AlertCircle, label: 'Risks' },
                  { key: 'dependencies', icon: ExternalLink, label: 'Dependencies' },
                  { key: 'steps', icon: ListChecks, label: 'Steps' }
                ].map(({ key, icon: Icon, label }) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">{label}</div>
                    </div>
                    <select
                      value={fields[key as keyof typeof fields] ? 'enabled' : 'disabled'}
                      onChange={() => toggleField(key as keyof NonNullable<Task['enabledFields']>)}
                      className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]">
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};


