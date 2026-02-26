/**
 * TASK EDITOR MODAL WITH TABS
 * Tabs: {Task} and {Data Points}
 */

import React, { useState, useEffect } from 'react';
import {
  X, Calendar, DollarSign, Users, AlertCircle, Target,
  ExternalLink, FileText, Package, Building2, ListChecks, Edit3, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskStep {
  id: string;
  step: string;
  state: 'Pending' | 'Scheduled' | 'In-Progress' | 'Cancelled' | 'Complete';
}

export interface Task {
  id?: string;
  title: string;
  owner: string;
  team: string;
  businessUnits: string[];
  businessUnit?: string;
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
  linkType?: 'goal' | 'initiative'; // NEW: What this task links to
  goalId?: string; // Strategic Goal ID (used when linkType = 'goal')
  initiativeId?: string; // NEW: Initiative ID (used when linkType = 'initiative')
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
  viewOnly?: boolean; // True for frontend view-only mode
}

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({ task, onSave, onClose, viewOnly = false }) => {
  const [activeTab, setActiveTab] = useState<'task' | 'notes' | 'dataPoints'>('task');
  const [editMode, setEditMode] = useState(true); // Always start in edit mode (CMS-Admin is for editing)
  const [tags, setTags] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [goals, setGoals] = useState<Array<{ id: string; name: string; shortName: string; color: string }>>([]);
  const [initiatives, setInitiatives] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [businessUnits, setBusinessUnits] = useState<Array<{ id: string; name: string; fullPath?: string }>>([]);
  const [notes, setNotes] = useState<any[]>([]); // NEW: Linked notes
  const [notesLoading, setNotesLoading] = useState(false); // NEW
  
  // Tag panel state
  const [showTagPanel, setShowTagPanel] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#7C3AED');
  
  const [formData, setFormData] = useState<Task>(() => {
    if (task) {
      const normalizedBusinessUnits = Array.isArray(task.businessUnits)
        ? task.businessUnits
        : task.businessUnit
          ? [task.businessUnit]
          : [];

      return {
        ...task,
        businessUnits: normalizedBusinessUnits,
        businessUnit: task.businessUnit || '',
        // Ensure all fields are enabled for CMS-Admin editing
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
          steps: true,
          ...task.enabledFields // Preserve any existing field overrides
        }
      };
    }

    return {
      title: 'New Task',
      owner: '',
      team: '',
      businessUnits: [],
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
      linkType: 'goal', // NEW: Default to linking to goal
      goalId: '',
      initiativeId: '', // NEW
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
    };
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

    const fetchInitiatives = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/initiatives');
        const data = await response.json();
        if (data.success) {
          setInitiatives(data.initiatives || []);
        }
      } catch (error) {
        console.error('Failed to fetch initiatives:', error);
      }
    };

    const fetchBusinessUnits = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/business-units');
        const data = await response.json();
        const allUnits = Array.isArray(data) ? data : (data.units || []);
        // Filter to only root-level business units (no parent)
        const rootUnits = allUnits.filter((unit: any) => unit.parentId === null);
        setBusinessUnits(rootUnits);
      } catch (error) {
        console.error('Failed to fetch business units:', error);
        setBusinessUnits([]);
      }
    };

    fetchTags();
    fetchGoals();
    fetchInitiatives();
    fetchBusinessUnits();
    
    // Fetch notes if viewing existing task
    if (task?.id) {
      fetchTaskNotes(task.id);
    }
  }, [task?.id]);

  // NEW: Fetch notes for this task
  const fetchTaskNotes = async (taskId: string) => {
    setNotesLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/notes?taskId=${taskId}`);
      const data = await response.json();
      if (data.success) {
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Failed to fetch task notes:', error);
    } finally {
      setNotesLoading(false);
    }
  };

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
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-slate-800 backdrop-blur-sm rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Tag Panel Button - Hide in view-only mode */}
        {!viewOnly && (
        <motion.button
          onClick={() => setShowTagPanel(!showTagPanel)}
          className="absolute right-0 top-[68px] bg-white/20 text-white px-2 py-3 rounded-l-lg shadow-lg z-10 hover:bg-white/30 transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-xs font-roobert-medium writing-mode-vertical transform rotate-180">Tag</span>
        </motion.button>
        )}
        
        {/* Tag Panel */}
        <AnimatePresence>
          {showTagPanel && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-gray-900 to-slate-800 backdrop-blur-sm border-l border-white/10 shadow-2xl z-20 flex flex-col overflow-hidden"
            >
              {/* Tag Panel Header */}
              <div className="p-4 border-b border-white/10 bg-gray-900/95 backdrop-blur-sm">
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
                    <h4 className="text-sm font-roobert-medium text-white mb-2">
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
                  <h4 className="text-sm font-roobert-medium text-white mb-2">
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
                              ? 'bg-gray-700/50'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm font-roobert-regular text-white flex-1 text-left">
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
                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-sm font-roobert-medium text-white mb-3">
                    Create New Tag
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                      placeholder="Tag name..."
                      className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-roobert-regular bg-gray-800/50 text-white placeholder-white/50"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-roobert-regular text-white/70">
                        Color:
                      </label>
                      <input
                        type="color"
                        value={newTagColor}
                        onChange={(e) => setNewTagColor(e.target.value)}
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <div
                        className="w-8 h-8 rounded border border-white/10"
                        style={{ backgroundColor: newTagColor }}
                      />
                    </div>
                    <button
                      onClick={handleCreateTag}
                      disabled={!newTagName.trim()}
                      className="w-full px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-roobert-medium text-sm transition-colors"
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
        <div className="p-6 bg-gray-900/95 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-roobert-semibold text-white">
              {viewOnly ? formData.title : (task ? 'Edit Task' : 'New Task')}
            </h2>
            <div className="flex items-center gap-3">
              {/* Tags in Header - Hide in view-only mode */}
              {!viewOnly && (
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
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          {/* Tabs and controls - Hide in view-only mode */}
          {!viewOnly && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('task')}
                className={`px-4 py-2 rounded-lg font-roobert-medium transition-colors ${
                  activeTab === 'task'
                    ? 'bg-white text-[var(--brand-primary)] shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Task
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-lg font-roobert-medium transition-colors ${
                  activeTab === 'notes'
                    ? 'bg-white text-[var(--brand-primary)] shadow-md'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Notes {notes.length > 0 && `(${notes.length})`}
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
            </div>
            {/* Edit Mode Toggle Icon - Task tab only */}
            {task && activeTab === 'task' && (
              <button
                onClick={() => setEditMode(!editMode)}
                className={`p-2 rounded-lg transition-colors ${
                  editMode 
                    ? 'bg-white text-[var(--brand-primary)] shadow-md' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title={editMode ? 'View Mode' : 'Edit Mode'}
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'task' && (
            <div className="space-y-2">
              {/* Title - Hide in view-only mode (already in header) */}
              {!viewOnly && (
              <div>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-4 py-2 text-xl font-roobert-semibold bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg text-white"
                    placeholder="Task Title"
                  />
                ) : (
                  <h2 className="text-2xl font-roobert-semibold text-white">{formData.title}</h2>
                )}
              </div>
              )}

              {/* Row: Owner, Product (left) & Business Unit (right, spans 2 rows) */}
              {(fields.owner || fields.product || fields.team || fields.businessUnit) && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column: Owner and Product stacked */}
                  <div className="space-y-4">
                    {fields.owner && (
                      <div>
                        <label className="block text-sm font-roobert-medium text-white mb-1">
                          <span className="flex items-center gap-2"><Users className="w-4 h-4" />Owner</span>
                        </label>
                        <input type="text" value={formData.owner} onChange={(e) => updateField('owner', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white"
                          disabled={!editMode} />
                      </div>
                    )}
                    {fields.product && (
                      <div>
                        <label className="block text-sm font-roobert-medium text-white mb-1">
                          <span className="flex items-center gap-2"><Package className="w-4 h-4" />Product</span>
                        </label>
                        <input type="text" value={formData.product} onChange={(e) => updateField('product', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode} />
                      </div>
                    )}
                    {fields.team && (
                      <div>
                        <label className="block text-sm font-roobert-medium text-white mb-1">
                          <span className="flex items-center gap-2"><Users className="w-4 h-4" />Team</span>
                        </label>
                        <input type="text" value={formData.team} onChange={(e) => updateField('team', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode} />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Business Unit (full height) */}
                  {fields.businessUnit && (
                    <div className="flex flex-col">
                      <label className="block text-sm font-roobert-medium text-white mb-1">
                        <span className="flex items-center gap-2"><Building2 className="w-4 h-4" />Business Unit</span>
                      </label>
                      <div className="bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded p-2 flex-1 overflow-y-auto space-y-1.5 min-h-[150px]">
                        {businessUnits.length > 0 ? (
                          businessUnits.map((unit) => {
                            const label = unit.fullPath || unit.name;
                            const isSelected = formData.businessUnits.includes(label);
                            return (
                              <div
                                key={unit.id}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!editMode) return;
                                  const values = isSelected
                                    ? formData.businessUnits.filter(v => v !== label)
                                    : [...formData.businessUnits, label];
                                  updateField('businessUnits', values);
                                  updateField('businessUnit', values[0] || '');
                                }}
                                className={`flex items-center gap-2 p-1.5 rounded transition-colors ${
                                  editMode ? 'cursor-pointer hover:bg-white/10' : 'opacity-60 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-center justify-center w-3.5 h-3.5">
                                  {isSelected ? (
                                    <div className="w-3.5 h-3.5 rounded bg-purple-600 flex items-center justify-center">
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="w-3.5 h-3.5 rounded border-2 border-gray-600" />
                                  )}
                                </div>
                                <span className="text-sm text-white">{label}</span>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-white/50 p-2">No business units available</p>
                        )}
                      </div>
                      {formData.businessUnits.length > 0 && (
                        <p className="text-xs text-white/50 mt-1">{formData.businessUnits.length} selected</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Row: Dates & Budget */}
              <div className="grid grid-cols-3 gap-4">
                {fields.startDate && (
                  <div>
                    <label className="block text-sm font-roobert-medium text-white mb-1">
                      <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-white" />Start Date</span>
                    </label>
                    <input type="date" value={formData.startDate} onChange={(e) => updateField('startDate', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed [color-scheme:dark]" disabled={!editMode} />
                  </div>
                )}
                {fields.targetDate && (
                  <div>
                    <label className="block text-sm font-roobert-medium text-white mb-1">
                      <span className="flex items-center gap-2"><Target className="w-4 h-4 text-white" />Target Date</span>
                    </label>
                    <input type="date" value={formData.targetDate} onChange={(e) => updateField('targetDate', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed [color-scheme:dark]" disabled={!editMode} />
                  </div>
                )}
                {fields.budget && (
                  <div>
                    <label className="block text-sm font-roobert-medium text-white mb-1">
                      <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Budget</span>
                    </label>
                    <input type="text" value={formData.budget} onChange={(e) => updateField('budget', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white" placeholder="$0" />
                  </div>
                )}
              </div>

              {/* Row: Progress, Status, Priority - Always visible */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-roobert-medium text-white mb-1">Progress (%)</label>
                  <input type="number" min="0" max="100" value={formData.percentage}
                    onChange={(e) => updateField('percentage', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-roobert-medium text-white mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => updateField('status', e.target.value as Task['status'])}
                    className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode}>
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-roobert-medium text-white mb-1">Priority</label>
                  <select value={formData.priority} onChange={(e) => updateField('priority', e.target.value as Task['priority'])}
                    className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed" disabled={!editMode}>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Link Type Toggle & Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-roobert-medium text-white">
                  <span className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Link Task To
                  </span>
                </label>
                
                {editMode ? (
                  <>
                    {/* Toggle between Goal, Initiative, and General */}
                    <div className="flex gap-4 mb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="linkType"
                          value="goal"
                          checked={formData.linkType === 'goal'}
                          onChange={() => {
                            setFormData({ ...formData, linkType: 'goal', initiativeId: '' });
                          }}
                          className="w-4 h-4 text-purple-600"
                        />
                        <span className="text-sm text-white">Strategic Goal</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="linkType"
                          value="initiative"
                          checked={formData.linkType === 'initiative'}
                          onChange={() => {
                            setFormData({ ...formData, linkType: 'initiative', goalId: '' });
                          }}
                          className="w-4 h-4 text-pink-600"
                        />
                        <span className="text-sm text-white">Initiative (Project)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="linkType"
                          value="general"
                          checked={!formData.linkType || formData.linkType === undefined}
                          onChange={() => {
                            setFormData({ ...formData, linkType: undefined, goalId: '', initiativeId: '' });
                          }}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-white">General Task</span>
                      </label>
                    </div>

                    {/* Conditional Dropdowns */}
                    {formData.linkType === 'goal' && (
                      <select
                        value={formData.goalId || ''}
                        onChange={(e) => updateField('goalId', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white"
                      >
                        <option value="">Select a strategic goal...</option>
                        {goals.map(goal => (
                          <option key={goal.id} value={goal.id}>{goal.name}</option>
                        ))}
                      </select>
                    )}

                    {formData.linkType === 'initiative' && (
                      <select
                        value={formData.initiativeId || ''}
                        onChange={(e) => updateField('initiativeId', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white"
                      >
                        <option value="">Select an initiative...</option>
                        {initiatives.map(initiative => (
                          <option key={initiative.id} value={initiative.id}>{initiative.name}</option>
                        ))}
                      </select>
                    )}
                  </>
                ) : (
                  /* View Mode */
                  <div className="flex gap-2">
                    <div className="flex-1">
                      {formData.linkType === 'goal' && formData.goalId ? (
                        (() => {
                          const goal = goals.find(g => g.id === formData.goalId);
                          return goal ? (
                            <div>
                              <span className="text-xs text-white/60 block mb-1">Strategic Goal</span>
                              <span
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium text-white"
                                style={{ backgroundColor: goal.color }}
                              >
                                {goal.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-white/60">Goal not found</span>
                          );
                        })()
                      ) : formData.linkType === 'initiative' && formData.initiativeId ? (
                        (() => {
                          const initiative = initiatives.find(i => i.id === formData.initiativeId);
                          return initiative ? (
                            <div>
                              <span className="text-xs text-white/60 block mb-1">Initiative</span>
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium bg-pink-600 text-white">
                                {initiative.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-white/60">Initiative not found</span>
                          );
                        })()
                      ) : (
                        <span className="text-sm text-white/60">No link assigned</span>
                      )}
                    </div>
                    {((formData.linkType === 'goal' && formData.goalId) || (formData.linkType === 'initiative' && formData.initiativeId)) && (
                      <button
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            if (formData.linkType === 'goal') {
                              window.dispatchEvent(new CustomEvent('openGoal', { detail: formData.goalId }));
                            }
                            // TODO: Add initiative modal trigger when available
                          }, 100);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-roobert-medium transition-colors flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Follow
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {fields.description && (
                <div>
                  <label className="block text-sm font-roobert-medium text-white mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => updateField('description', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    rows={3} placeholder="Task overview..." disabled={!editMode} />
                </div>
              )}

              {/* Milestones */}
              {fields.milestones && (
                <div>
                  <label className="block text-sm font-roobert-medium text-white mb-1">
                    <span className="flex items-center gap-2"><Target className="w-4 h-4" />Milestones</span>
                  </label>
                  <textarea value={formData.milestones} onChange={(e) => updateField('milestones', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    rows={2} placeholder="Separate with | character" disabled={!editMode} />
                </div>
              )}

              {/* Risks */}
              {fields.risks && (
                <div>
                  <label className="block text-sm font-roobert-medium text-white mb-1">
                    <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />Risks</span>
                  </label>
                  <textarea value={formData.risks} onChange={(e) => updateField('risks', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    rows={2} placeholder="Identified risks..." disabled={!editMode} />
                </div>
              )}

              {/* Dependencies */}
              {fields.dependencies && (
                <div>
                  <label className="block text-sm font-roobert-medium text-white mb-1">Dependencies</label>
                  <textarea value={formData.dependencies} onChange={(e) => updateField('dependencies', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    rows={2} placeholder="External dependencies..." disabled={!editMode} />
                </div>
              )}

              {/* Steps */}
              {fields.steps && (
                <div>
                  <label className="block text-sm font-roobert-medium text-white mb-2">
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
                          className="px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed"
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
                          className="px-3 py-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white disabled:opacity-60 disabled:cursor-not-allowed"
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
                        className="w-full px-3 py-2 border-2 border-dashed border-white/10 rounded text-white/70 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        + Add Step
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              {notes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-roobert-semibold text-white mb-2">
                    Linked Notes ({notes.length})
                  </h3>
                  <p className="text-sm text-white/70">
                    Notes specifically linked to this task
                  </p>
                </div>
              )}

              {notesLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--brand-primary)]"></div>
                    <span className="font-roobert-regular">Loading notes...</span>
                  </div>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-white/70 font-roobert-medium mb-2">No notes linked to this task yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Create a note and link it to this task for it to appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 bg-white dark:bg-gray-800 border border-white/10 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-roobert-semibold text-white">
                          {note.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded ${
                          note.category === 'key-highlight' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' :
                          note.category === 'goal-progression' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                          note.category === 'big-win' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {note.category}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 line-clamp-3">
                        {note.content}
                      </p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {note.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-white rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'dataPoints' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-roobert-semibold text-white mb-2">Configure Data Points</h3>
                <p className="text-sm text-white/70">Enable or disable fields. Only enabled fields appear in Task tab.</p>
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
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-white/70" />
                      <div className="text-xs font-roobert-medium text-white">{label}</div>
                    </div>
                    <select
                      value={fields[key as keyof typeof fields] ? 'enabled' : 'disabled'}
                      onChange={() => toggleField(key as keyof NonNullable<Task['enabledFields']>)}
                      className="ml-4 px-2 py-0.5 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded text-white text-[10px]">
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Hide in view-only mode */}
        {!viewOnly && (
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={() => {
              const primaryBusinessUnit = formData.businessUnits?.[0] || formData.businessUnit || '';
              onSave({
                ...formData,
                businessUnit: primaryBusinessUnit
              });
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
        )}
      </div>
    </div>
  );
};


