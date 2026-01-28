import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Calendar, 
  CheckCircle, 
  PlayCircle, 
  Sparkles,
  ChevronDown,
  ChevronRight,
  Save,
  AlertCircle
} from 'lucide-react';
import type { GanttTemplate, GanttTask, GanttTemplateVariable } from '../types/initiativeGantt';
import { COAST_SIMPLE_TEMPLATE, TILED_COMPLEX_TEMPLATE, SYNTHESIA_VIDEO_TEMPLATE } from '../data/ganttTemplates';

interface GanttTemplateManagerProps {
  onClose: () => void;
  onTemplateCreated?: (template: GanttTemplate) => void;
  onTemplateUpdated?: (template: GanttTemplate) => void;
  onTemplateDeleted?: (templateId: string) => void;
}

const GanttTemplateManager: React.FC<GanttTemplateManagerProps> = ({
  onClose,
  onTemplateCreated,
  onTemplateUpdated,
  onTemplateDeleted
}) => {
  // Load templates from local storage or use defaults
  const [templates, setTemplates] = useState<GanttTemplate[]>(() => {
    const saved = localStorage.getItem('ganttTemplates');
    if (saved) {
      return JSON.parse(saved);
    }
    return [COAST_SIMPLE_TEMPLATE, TILED_COMPLEX_TEMPLATE, SYNTHESIA_VIDEO_TEMPLATE];
  });

  const [activeView, setActiveView] = useState<'list' | 'edit'>('list');
  const [editingTemplate, setEditingTemplate] = useState<GanttTemplate | null>(null);
  const [isNewTemplate, setIsNewTemplate] = useState(false);

  // Save templates to localStorage whenever they change
  const saveTemplates = (newTemplates: GanttTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('ganttTemplates', JSON.stringify(newTemplates));
  };

  const handleCreateNew = () => {
    const newTemplate: GanttTemplate = {
      id: `custom-${Date.now()}`,
      name: 'New Custom Template',
      description: 'Describe your template workflow',
      category: 'custom',
      estimatedDuration: 4,
      variables: [
        { key: 'owner', label: 'Project Owner', type: 'text', required: true }
      ],
      taskStructure: [
        {
          id: 'phase-1',
          name: 'Planning Phase',
          type: 'phase',
          startDate: '',
          endDate: '',
          progress: 0,
          owner: '{{owner}}',
          status: 'not-started',
          color: '#8B5CF6',
          children: [
            {
              id: 'task-1',
              name: 'Kickoff Meeting',
              type: 'milestone',
              startDate: '',
              endDate: '',
              duration: 1,
              progress: 0,
              owner: '{{owner}}',
              status: 'not-started'
            }
          ]
        }
      ]
    };
    setEditingTemplate(newTemplate);
    setIsNewTemplate(true);
    setActiveView('edit');
  };

  const handleEdit = (template: GanttTemplate) => {
    setEditingTemplate({ ...template });
    setIsNewTemplate(false);
    setActiveView('edit');
  };

  const handleDuplicate = (template: GanttTemplate) => {
    const duplicated: GanttTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      name: `${template.name} (Copy)`,
      category: 'custom'
    };
    setEditingTemplate(duplicated);
    setIsNewTemplate(true);
    setActiveView('edit');
  };

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      const newTemplates = templates.filter(t => t.id !== templateId);
      saveTemplates(newTemplates);
      onTemplateDeleted?.(templateId);
    }
  };

  const handleSave = () => {
    if (!editingTemplate) return;

    let newTemplates: GanttTemplate[];
    if (isNewTemplate) {
      newTemplates = [...templates, editingTemplate];
      onTemplateCreated?.(editingTemplate);
    } else {
      newTemplates = templates.map(t => t.id === editingTemplate.id ? editingTemplate : t);
      onTemplateUpdated?.(editingTemplate);
    }
    
    saveTemplates(newTemplates);
    setActiveView('list');
    setEditingTemplate(null);
  };

  const handleCancel = () => {
    setActiveView('list');
    setEditingTemplate(null);
    setIsNewTemplate(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[75vw] h-[calc(100vh-2rem)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white overflow-hidden">
          {/* Dot Pattern Background */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="template-manager-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#template-manager-grid)" />
            </svg>
          </div>

          <div className="relative px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-white" />
            <h2 className="text-xl font-roobert-bold text-white">
              Gantt Template Manager
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === 'list' ? (
            <ListView
              templates={templates}
              onCreateNew={handleCreateNew}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ) : (
            <EditView
              template={editingTemplate!}
              onChange={setEditingTemplate}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ========== LIST VIEW ==========
interface ListViewProps {
  templates: GanttTemplate[];
  onCreateNew: () => void;
  onEdit: (template: GanttTemplate) => void;
  onDuplicate: (template: GanttTemplate) => void;
  onDelete: (templateId: string) => void;
}

const ListView: React.FC<ListViewProps> = ({
  templates,
  onCreateNew,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'coast': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'tiled': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'synthesia': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'coast': return 'Coast';
      case 'tiled': return 'Tiled';
      case 'synthesia': return 'Synthesia';
      default: return 'Custom';
    }
  };

  return (
    <div>
      {/* Create New Button */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600 dark:text-gray-400">
          Manage your Gantt chart templates for different project types
        </p>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fis-eggplant to-fis-navy text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span className="font-roobert-semibold">Create Template</span>
        </button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-roobert-bold text-gray-900 dark:text-white mb-1">
                  {template.name}
                </h3>
                <span className={`inline-block px-2 py-1 rounded-md text-xs font-roobert-semibold ${getCategoryColor(template.category)}`}>
                  {getCategoryLabel(template.category)}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {template.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{template.estimatedDuration} weeks</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                <span>{template.taskStructure.length} phases</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(template)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-roobert-semibold">Edit</span>
              </button>
              <button
                onClick={() => onDuplicate(template)}
                className="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(template.id)}
                className="flex items-center justify-center p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-roobert-bold text-gray-900 dark:text-white mb-2">
            No Templates Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first Gantt template to get started
          </p>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-gradient-to-r from-fis-eggplant to-fis-navy text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Create Template
          </button>
        </div>
      )}
    </div>
  );
};

// ========== EDIT VIEW ==========
interface EditViewProps {
  template: GanttTemplate;
  onChange: (template: GanttTemplate) => void;
  onSave: () => void;
  onCancel: () => void;
}

const EditView: React.FC<EditViewProps> = ({
  template,
  onChange,
  onSave,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'variables' | 'tasks'>('details');

  const updateTemplate = (updates: Partial<GanttTemplate>) => {
    onChange({ ...template, ...updates });
  };

  const handleAddVariable = () => {
    const newVariable: GanttTemplateVariable = {
      key: `var${template.variables.length + 1}`,
      label: 'New Variable',
      type: 'text',
      required: false
    };
    updateTemplate({ variables: [...template.variables, newVariable] });
  };

  const handleUpdateVariable = (index: number, updates: Partial<GanttTemplateVariable>) => {
    const newVariables = [...template.variables];
    newVariables[index] = { ...newVariables[index], ...updates };
    updateTemplate({ variables: newVariables });
  };

  const handleDeleteVariable = (index: number) => {
    const newVariables = template.variables.filter((_, i) => i !== index);
    updateTemplate({ variables: newVariables });
  };

  const handleAddPhase = () => {
    const newPhase: GanttTask = {
      id: `phase-${Date.now()}`,
      name: 'New Phase',
      type: 'phase',
      startDate: '',
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#8B5CF6',
      children: []
    };
    updateTemplate({ taskStructure: [...template.taskStructure, newPhase] });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 font-roobert-semibold transition-colors ${
            activeTab === 'details'
              ? 'text-fis-eggplant dark:text-fis-raspberry border-b-2 border-fis-eggplant dark:border-fis-raspberry'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('variables')}
          className={`px-4 py-2 font-roobert-semibold transition-colors ${
            activeTab === 'variables'
              ? 'text-fis-eggplant dark:text-fis-raspberry border-b-2 border-fis-eggplant dark:border-fis-raspberry'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Variables ({template.variables.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 font-roobert-semibold transition-colors ${
            activeTab === 'tasks'
              ? 'text-fis-eggplant dark:text-fis-raspberry border-b-2 border-fis-eggplant dark:border-fis-raspberry'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Task Structure ({template.taskStructure.length} phases)
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' && (
          <DetailsTab template={template} onChange={updateTemplate} />
        )}
        {activeTab === 'variables' && (
          <VariablesTab
            variables={template.variables}
            onAdd={handleAddVariable}
            onUpdate={handleUpdateVariable}
            onDelete={handleDeleteVariable}
          />
        )}
        {activeTab === 'tasks' && (
          <TasksTab
            tasks={template.taskStructure}
            onChange={(tasks) => updateTemplate({ taskStructure: tasks })}
            onAddPhase={handleAddPhase}
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-fis-eggplant to-fis-navy text-white rounded-lg hover:shadow-lg transition-all duration-200"
        >
          <Save className="w-5 h-5" />
          <span className="font-roobert-semibold">Save Template</span>
        </button>
      </div>
    </div>
  );
};

// ========== DETAILS TAB ==========
interface DetailsTabProps {
  template: GanttTemplate;
  onChange: (updates: Partial<GanttTemplate>) => void;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ template, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
          Template Name
        </label>
        <input
          type="text"
          value={template.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={template.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select
          value={template.category}
          onChange={(e) => onChange({ category: e.target.value as any })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
        >
          <option value="coast">Coast</option>
          <option value="tiled">Tiled</option>
          <option value="synthesia">Synthesia</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
          Estimated Duration (weeks)
        </label>
        <input
          type="number"
          min="1"
          value={template.estimatedDuration}
          onChange={(e) => onChange({ estimatedDuration: parseInt(e.target.value) || 1 })}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
        />
      </div>
    </div>
  );
};

// ========== VARIABLES TAB ==========
interface VariablesTabProps {
  variables: GanttTemplateVariable[];
  onAdd: () => void;
  onUpdate: (index: number, updates: Partial<GanttTemplateVariable>) => void;
  onDelete: (index: number) => void;
}

const VariablesTab: React.FC<VariablesTabProps> = ({
  variables,
  onAdd,
  onUpdate,
  onDelete
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Variables are placeholders (like <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{'{{owner}}'}</code>) that get replaced when generating a Gantt chart
        </p>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-roobert-semibold">Add Variable</span>
        </button>
      </div>

      <div className="space-y-4">
        {variables.map((variable, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Key
                </label>
                <input
                  type="text"
                  value={variable.key}
                  onChange={(e) => onUpdate(index, { key: e.target.value })}
                  placeholder="owner"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Use as {'{{' + variable.key + '}}'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={variable.label}
                  onChange={(e) => onUpdate(index, { label: e.target.value })}
                  placeholder="Project Owner"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Type
                </label>
                <select
                  value={variable.type}
                  onChange={(e) => onUpdate(index, { type: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={variable.required}
                      onChange={(e) => onUpdate(index, { required: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    Required
                  </label>
                </div>
                <button
                  onClick={() => onDelete(index)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {variable.type === 'select' && (
              <div className="mt-3">
                <label className="block text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Options (comma separated)
                </label>
                <input
                  type="text"
                  value={variable.options?.join(', ') || ''}
                  onChange={(e) => onUpdate(index, { options: e.target.value.split(',').map(s => s.trim()) })}
                  placeholder="Option 1, Option 2, Option 3"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
                />
              </div>
            )}
          </div>
        ))}

        {variables.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No variables defined. Add variables to make your template dynamic.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ========== TASKS TAB ==========
interface TasksTabProps {
  tasks: GanttTask[];
  onChange: (tasks: GanttTask[]) => void;
  onAddPhase: () => void;
}

const TasksTab: React.FC<TasksTabProps> = ({ tasks, onChange, onAddPhase }) => {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(tasks.map(t => t.id)));

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const handleAddTask = (phaseIndex: number) => {
    const newTask: GanttTask = {
      id: `task-${Date.now()}`,
      name: 'New Task',
      type: 'task',
      startDate: '',
      endDate: '',
      duration: 3,
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started'
    };

    const newTasks = [...tasks];
    if (!newTasks[phaseIndex].children) {
      newTasks[phaseIndex].children = [];
    }
    newTasks[phaseIndex].children!.push(newTask);
    onChange(newTasks);
  };

  const handleUpdatePhase = (index: number, updates: Partial<GanttTask>) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], ...updates };
    onChange(newTasks);
  };

  const handleUpdateTask = (phaseIndex: number, taskIndex: number, updates: Partial<GanttTask>) => {
    const newTasks = [...tasks];
    newTasks[phaseIndex].children![taskIndex] = { 
      ...newTasks[phaseIndex].children![taskIndex], 
      ...updates 
    };
    onChange(newTasks);
  };

  const handleDeletePhase = (index: number) => {
    if (confirm('Delete this phase and all its tasks?')) {
      onChange(tasks.filter((_, i) => i !== index));
    }
  };

  const handleDeleteTask = (phaseIndex: number, taskIndex: number) => {
    const newTasks = [...tasks];
    newTasks[phaseIndex].children = newTasks[phaseIndex].children!.filter((_, i) => i !== taskIndex);
    onChange(newTasks);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <CheckCircle className="w-4 h-4" />;
      case 'task': return <PlayCircle className="w-4 h-4" />;
      case 'phase': return <Sparkles className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Define the phase and task structure for your template
        </p>
        <button
          onClick={onAddPhase}
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-roobert-semibold">Add Phase</span>
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map((phase, phaseIndex) => (
          <div
            key={phase.id}
            className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Phase Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              style={{ borderLeftWidth: '4px', borderLeftColor: phase.color }}
            >
              <div className="flex items-center gap-3">
                <button onClick={() => togglePhase(phase.id)} className="text-gray-500 dark:text-gray-400">
                  {expandedPhases.has(phase.id) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Phase Name</label>
                    <input
                      type="text"
                      value={phase.name}
                      onChange={(e) => handleUpdatePhase(phaseIndex, { name: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Owner</label>
                    <input
                      type="text"
                      value={phase.owner}
                      onChange={(e) => handleUpdatePhase(phaseIndex, { owner: e.target.value })}
                      placeholder="{{owner}}"
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Color</label>
                    <input
                      type="color"
                      value={phase.color}
                      onChange={(e) => handleUpdatePhase(phaseIndex, { color: e.target.value })}
                      className="w-full h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddTask(phaseIndex)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Add Task"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePhase(phaseIndex)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete Phase"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tasks */}
            {expandedPhases.has(phase.id) && phase.children && (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 space-y-2">
                {phase.children.map((task, taskIndex) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="grid grid-cols-4 gap-3 items-center">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(task.type)}
                        <input
                          type="text"
                          value={task.name}
                          onChange={(e) => handleUpdateTask(phaseIndex, taskIndex, { name: e.target.value })}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
                        />
                      </div>

                      <div>
                        <select
                          value={task.type}
                          onChange={(e) => handleUpdateTask(phaseIndex, taskIndex, { type: e.target.value as any })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
                        >
                          <option value="task">Task</option>
                          <option value="milestone">Milestone</option>
                        </select>
                      </div>

                      <div>
                        <input
                          type="number"
                          min="1"
                          value={task.duration || 1}
                          onChange={(e) => handleUpdateTask(phaseIndex, taskIndex, { duration: parseInt(e.target.value) || 1 })}
                          placeholder="Days"
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-fis-eggplant focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">days</span>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDeleteTask(phaseIndex, taskIndex)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {(!phase.children || phase.children.length === 0) && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    No tasks in this phase. Click + to add tasks.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="mb-4">No phases defined. Add your first phase to structure your template.</p>
            <button
              onClick={onAddPhase}
              className="px-6 py-3 bg-gradient-to-r from-fis-eggplant to-fis-navy text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Add First Phase
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttTemplateManager;
