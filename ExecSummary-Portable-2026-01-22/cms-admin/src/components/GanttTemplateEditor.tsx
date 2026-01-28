import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2, ChevronRight, ChevronDown, FileText, AlertCircle, CheckCircle, Copy } from 'lucide-react';
import type { GanttTemplate, GanttTask, GanttTemplateVariable } from '../types/initiativeGantt';

interface GanttTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  existingTemplate?: GanttTemplate;
  onSave: (template: GanttTemplate) => void;
}

const TASK_TYPES = ['milestone', 'task', 'phase'] as const;
const VARIABLE_TYPES = ['text', 'date', 'select'] as const;
const TEMPLATE_CATEGORIES = ['coast', 'tiled', 'synthesia', 'custom'] as const;

export default function GanttTemplateEditor({ isOpen, onClose, existingTemplate, onSave }: GanttTemplateEditorProps) {
  const [template, setTemplate] = useState<GanttTemplate>({
    id: '',
    name: '',
    description: '',
    category: 'custom',
    estimatedDuration: 4,
    variables: [],
    taskStructure: []
  });
  
  const [activeTab, setActiveTab] = useState<'info' | 'variables' | 'tasks'>('info');
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
  const [editingVariable, setEditingVariable] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);

  useEffect(() => {
    if (isOpen && existingTemplate) {
      setTemplate(existingTemplate);
    } else if (isOpen) {
      // Reset for new template
      setTemplate({
        id: `custom-${Date.now()}`,
        name: '',
        description: '',
        category: 'custom',
        estimatedDuration: 4,
        variables: [],
        taskStructure: []
      });
    }
  }, [isOpen, existingTemplate]);

  const handleSave = () => {
    // Validation
    if (!template.name.trim()) {
      alert('Please provide a template name');
      return;
    }
    if (template.taskStructure.length === 0) {
      alert('Please add at least one task to the template');
      return;
    }

    onSave(template);
    onClose();
  };

  const toggleTaskCollapse = (taskId: string) => {
    const newCollapsed = new Set(collapsedTasks);
    if (newCollapsed.has(taskId)) {
      newCollapsed.delete(taskId);
    } else {
      newCollapsed.add(taskId);
    }
    setCollapsedTasks(newCollapsed);
  };

  const addVariable = () => {
    setTemplate({
      ...template,
      variables: [
        ...template.variables,
        { key: '', label: '', type: 'text', required: false }
      ]
    });
    setEditingVariable(template.variables.length);
  };

  const updateVariable = (index: number, updates: Partial<GanttTemplateVariable>) => {
    const newVariables = [...template.variables];
    newVariables[index] = { ...newVariables[index], ...updates };
    setTemplate({ ...template, variables: newVariables });
  };

  const deleteVariable = (index: number) => {
    setTemplate({
      ...template,
      variables: template.variables.filter((_, i) => i !== index)
    });
    setEditingVariable(null);
  };

  const addRootTask = () => {
    const newTask: GanttTask = {
      id: `task-${Date.now()}`,
      name: 'New Task',
      type: 'task',
      startDate: '',
      endDate: '',
      duration: 1,
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#8B5CF6',
      children: []
    };
    setTemplate({
      ...template,
      taskStructure: [...template.taskStructure, newTask]
    });
  };

  const addChildTask = (parentTask: GanttTask) => {
    const newChild: GanttTask = {
      id: `task-${Date.now()}`,
      name: 'New Subtask',
      type: 'task',
      startDate: '',
      endDate: '',
      duration: 1,
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started'
    };

    const updateTaskRecursive = (tasks: GanttTask[]): GanttTask[] => {
      return tasks.map(task => {
        if (task.id === parentTask.id) {
          return {
            ...task,
            children: [...(task.children || []), newChild]
          };
        }
        if (task.children) {
          return {
            ...task,
            children: updateTaskRecursive(task.children)
          };
        }
        return task;
      });
    };

    setTemplate({
      ...template,
      taskStructure: updateTaskRecursive(template.taskStructure)
    });
  };

  const updateTask = (taskId: string, updates: Partial<GanttTask>) => {
    const updateRecursive = (tasks: GanttTask[]): GanttTask[] => {
      return tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, ...updates };
        }
        if (task.children) {
          return { ...task, children: updateRecursive(task.children) };
        }
        return task;
      });
    };

    setTemplate({
      ...template,
      taskStructure: updateRecursive(template.taskStructure)
    });
    setEditingTask(null);
  };

  const deleteTask = (taskId: string) => {
    const deleteRecursive = (tasks: GanttTask[]): GanttTask[] => {
      return tasks
        .filter(task => task.id !== taskId)
        .map(task => ({
          ...task,
          children: task.children ? deleteRecursive(task.children) : undefined
        }));
    };

    setTemplate({
      ...template,
      taskStructure: deleteRecursive(template.taskStructure)
    });
  };

  const renderTask = (task: GanttTask, depth: number = 0): React.ReactNode => {
    const isCollapsed = collapsedTasks.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const indentPx = depth * 24;

    return (
      <React.Fragment key={task.id}>
        <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50" style={{ paddingLeft: `${indentPx + 8}px` }}>
          {/* Collapse/Expand */}
          {hasChildren ? (
            <button onClick={() => toggleTaskCollapse(task.id)} className="text-gray-500 hover:text-gray-700">
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {/* Task Info */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-roobert-medium text-gray-900 dark:text-gray-100">{task.name}</span>
            <span className="text-xs text-gray-500">({task.type})</span>
            {task.duration && <span className="text-xs text-gray-500">{task.duration}d</span>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button onClick={() => setEditingTask(task)} className="p-1 text-gray-500 hover:text-purple-600" title="Edit">
              <FileText className="w-4 h-4" />
            </button>
            <button onClick={() => addChildTask(task)} className="p-1 text-gray-500 hover:text-green-600" title="Add Child">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-500 hover:text-red-600" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && !isCollapsed && task.children!.map(child => renderTask(child, depth + 1))}
      </React.Fragment>
    );
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-roobert-bold">
                  {existingTemplate ? 'Edit Template' : 'Create Gantt Template'}
                </h2>
                <p className="text-sm text-purple-100">Define reusable project structures</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'info', label: 'Template Info' },
            { id: 'variables', label: `Variables (${template.variables.length})` },
            { id: 'tasks', label: `Tasks (${template.taskStructure.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-roobert-medium text-sm rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={template.name}
                    onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="e.g., Deploy Coast Simple"
                  />
                </div>

                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={template.description}
                    onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder="Describe what this template is for..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={template.category}
                      onChange={(e) => setTemplate({ ...template, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {TEMPLATE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estimated Duration (weeks)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={template.estimatedDuration}
                      onChange={(e) => setTemplate({ ...template, estimatedDuration: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-roobert-medium mb-1">Template ID</p>
                      <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded text-xs">{template.id}</code>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'variables' && (
              <motion.div
                key="variables"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Variables allow dynamic values like <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{'{{owner}}'}</code> in task names and owners
                  </p>
                  <button
                    onClick={addVariable}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Variable
                  </button>
                </div>

                {template.variables.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No variables defined. Click "Add Variable" to start.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {template.variables.map((variable, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              Key (for template)
                            </label>
                            <input
                              type="text"
                              value={variable.key}
                              onChange={(e) => updateVariable(index, { key: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                              placeholder="e.g., owner"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              Label (display name)
                            </label>
                            <input
                              type="text"
                              value={variable.label}
                              onChange={(e) => updateVariable(index, { label: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                              placeholder="e.g., Project Owner"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              Type
                            </label>
                            <select
                              value={variable.type}
                              onChange={(e) => updateVariable(index, { type: e.target.value as any })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                            >
                              {VARIABLE_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              Required?
                            </label>
                            <input
                              type="checkbox"
                              checked={variable.required}
                              onChange={(e) => updateVariable(index, { required: e.target.checked })}
                              className="w-4 h-4 mt-1.5"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => deleteVariable(index)}
                              className="px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>

                        {variable.type === 'select' && (
                          <div>
                            <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              Options (comma-separated)
                            </label>
                            <input
                              type="text"
                              value={variable.options?.join(', ') || ''}
                              onChange={(e) => updateVariable(index, { options: e.target.value.split(',').map(s => s.trim()) })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                              placeholder="Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Define the task structure. Use <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{'{{variableKey}}'}</code> in task names/owners.
                  </p>
                  <button
                    onClick={addRootTask}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Root Task
                  </button>
                </div>

                {template.taskStructure.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>No tasks defined. Click "Add Root Task" to start.</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {template.taskStructure.map(task => renderTask(task, 0))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-roobert-medium"
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
        </div>

        {/* Task Edit Modal */}
        <AnimatePresence>
          {editingTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001]"
              onClick={() => setEditingTask(null)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-gray-100 mb-4">Edit Task</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Task Name</label>
                    <input
                      type="text"
                      value={editingTask.name}
                      onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                      <select
                        value={editingTask.type}
                        onChange={(e) => setEditingTask({ ...editingTask, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      >
                        {TASK_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Duration (days)</label>
                      <input
                        type="number"
                        value={editingTask.duration || 1}
                        onChange={(e) => setEditingTask({ ...editingTask, duration: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Owner (use variables)</label>
                    <input
                      type="text"
                      value={editingTask.owner}
                      onChange={(e) => setEditingTask({ ...editingTask, owner: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                      placeholder="e.g., {{owner}} or {{buOwner}}"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Color (optional)</label>
                    <input
                      type="color"
                      value={editingTask.color || '#8B5CF6'}
                      onChange={(e) => setEditingTask({ ...editingTask, color: e.target.value })}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <button
                    onClick={() => setEditingTask(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateTask(editingTask.id, editingTask)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
