import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2, ChevronRight, ChevronDown, Calendar, Clock, User, AlertTriangle, CheckCircle, PlayCircle, PauseCircle, Sparkles, FileText, Edit, Settings } from 'lucide-react';
import type { GanttTask, GanttData, GanttTemplate, GanttTemplateInput } from '../types/initiativeGantt';
import { GANTT_TEMPLATES } from '../data/ganttTemplates';
import GanttTemplateManager from './GanttTemplateManager';

interface GanttEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initiativeData: any;
  onSave: (ganttData: GanttData) => void;
}

export default function GanttEditor({ isOpen, onClose, initiativeData, onSave }: GanttEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'templates'>('edit');
  const [ganttData, setGanttData] = useState<GanttData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<GanttTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [templateRootName, setTemplateRootName] = useState('');
  const [templateStartDate, setTemplateStartDate] = useState('');
  const [templateEndDate, setTemplateEndDate] = useState('');
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<GanttTask | null>(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<GanttTemplate[]>(() => {
    const saved = localStorage.getItem('ganttTemplates');
    return saved ? JSON.parse(saved) : GANTT_TEMPLATES;
  });

  useEffect(() => {
    if (isOpen) {
      // Initialize ganttData from initiative's existing milestones or create new
      if (initiativeData?.ganttData) {
        setGanttData(initiativeData.ganttData);
      } else {
        // Convert existing timeline milestones to Gantt format (migration)
        const existingMilestones = initiativeData?.smartGoal?.timeBound?.timeline || [];
        const tasks: GanttTask[] = existingMilestones.map((milestone: any, index: number) => ({
          id: `milestone-${index}`,
          name: milestone.phase || '',
          type: 'milestone' as const,
          startDate: '',
          endDate: milestone.dueDate || '',
          progress: milestone.status === 'completed' ? 100 : milestone.status === 'in-progress' ? 50 : 0,
          owner: initiativeData.owner || '',
          status: milestone.status || 'not-started',
          color: '#8B5CF6'
        }));

        setGanttData({
          initiativeId: initiativeData.id || '',
          tasks: tasks.length > 0 ? tasks : [],
          createdDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }, [isOpen, initiativeData]);

  // ========== TEMPLATE FUNCTIONS ==========
  const handleTemplateSelect = (template: GanttTemplate) => {
    setSelectedTemplate(template);
    // Pre-fill variables with defaults
    const defaults: Record<string, string> = {};
    template.variables.forEach(v => {
      if (v.defaultValue) {
        defaults[v.key] = v.defaultValue;
      }
    });
    setTemplateVariables(defaults);
  };

  const generateFromTemplate = () => {
    if (!selectedTemplate) return;

    // Validate root task name
    if (!templateRootName.trim()) {
      alert('Please provide a Root Task Name');
      return;
    }

    // Validate required variables
    const missingVars = selectedTemplate.variables.filter(v => v.required && !templateVariables[v.key]);
    if (missingVars.length > 0) {
      alert(`Missing required fields: ${missingVars.map(v => v.label).join(', ')}`);
      return;
    }

    if (!templateStartDate && !templateEndDate) {
      alert('Please provide either a Start Date or End Date');
      return;
    }

    // Calculate dates based on template duration
    const durationInDays = selectedTemplate.estimatedDuration * 7; // weeks to days
    let calculatedStartDate = templateStartDate;
    let calculatedEndDate = templateEndDate;

    if (templateStartDate && !templateEndDate) {
      // Calculate end date from start date
      const start = new Date(templateStartDate);
      start.setDate(start.getDate() + durationInDays);
      calculatedEndDate = start.toISOString().split('T')[0];
    } else if (templateEndDate && !templateStartDate) {
      // Calculate start date from end date (work backwards)
      const end = new Date(templateEndDate);
      end.setDate(end.getDate() - durationInDays);
      calculatedStartDate = end.toISOString().split('T')[0];
    }

    // Replace template variables in task structure
    const processedTasks = replaceTemplateVariables(
      JSON.parse(JSON.stringify(selectedTemplate.taskStructure)),
      templateVariables
    );

    // Calculate dates for all tasks based on dependencies
    const childTasks = calculateTaskDates(processedTasks, calculatedStartDate!, calculatedEndDate!);

    // Create root task wrapper
    const rootTask: GanttTask = {
      id: `root-${Date.now()}`,
      name: templateRootName,
      type: 'phase',
      startDate: calculatedStartDate!,
      endDate: calculatedEndDate!,
      progress: 0,
      owner: templateVariables.owner || initiativeData.owner || '',
      status: 'not-started',
      color: '#8B5CF6',
      children: childTasks,
      level: 0
    };

    // APPEND new root task to existing ganttData (don't replace!)
    const existingTasks = ganttData?.tasks || [];
    const newGanttData: GanttData = {
      initiativeId: initiativeData.id || '',
      tasks: [...existingTasks, rootTask], // Append root task with all children
      createdDate: ganttData?.createdDate || new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    setGanttData(newGanttData);
    setActiveTab('edit'); // Switch to edit tab to review
    
    // Reset template form for next addition
    setSelectedTemplate(null);
    setTemplateVariables({});
    setTemplateRootName('');
    setTemplateStartDate('');
    setTemplateEndDate('');
  };

  const replaceTemplateVariables = (tasks: any[], variables: Record<string, string>): GanttTask[] => {
    const replace = (obj: any): any => {
      if (typeof obj === 'string') {
        let result = obj;
        Object.entries(variables).forEach(([key, value]) => {
          result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
        return result;
      } else if (Array.isArray(obj)) {
        return obj.map(replace);
      } else if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        Object.entries(obj).forEach(([k, v]) => {
          newObj[k] = replace(v);
        });
        return newObj;
      }
      return obj;
    };
    return replace(tasks);
  };

  const calculateTaskDates = (tasks: GanttTask[], projectStart: string, projectEnd: string): GanttTask[] => {
    const startDate = new Date(projectStart);
    const endDate = new Date(projectEnd);
    const totalProjectDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    let currentDate = new Date(startDate);

    const processTask = (task: GanttTask, level: number = 0): GanttTask => {
      const processedTask = { ...task, level };

      if (task.children && task.children.length > 0) {
        // Process children first
        const processedChildren = task.children.map(child => processTask(child, level + 1));
        processedTask.children = processedChildren;

        // Roll up dates from children
        const childStartDates = processedChildren.map(c => new Date(c.startDate)).filter(d => !isNaN(d.getTime()));
        const childEndDates = processedChildren.map(c => new Date(c.endDate)).filter(d => !isNaN(d.getTime()));

        if (childStartDates.length > 0 && childEndDates.length > 0) {
          processedTask.startDate = new Date(Math.min(...childStartDates.map(d => d.getTime()))).toISOString().split('T')[0];
          processedTask.endDate = new Date(Math.max(...childEndDates.map(d => d.getTime()))).toISOString().split('T')[0];
        }

        // Calculate progress as average of children
        const avgProgress = processedChildren.reduce((sum, c) => sum + c.progress, 0) / processedChildren.length;
        processedTask.progress = Math.round(avgProgress);
      } else {
        // Leaf task - calculate dates based on duration
        const duration = task.duration || 7; // Default 1 week
        processedTask.startDate = currentDate.toISOString().split('T')[0];
        const endDate = new Date(currentDate);
        endDate.setDate(endDate.getDate() + duration);
        processedTask.endDate = endDate.toISOString().split('T')[0];

        // Move currentDate forward
        currentDate = new Date(endDate);
        currentDate.setDate(currentDate.getDate() + 1); // 1 day buffer
      }

      return processedTask;
    };

    return tasks.map(task => processTask(task, 0));
  };

  // ========== EDIT FUNCTIONS ==========
  const toggleCollapse = (taskId: string) => {
    setCollapsedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const updateTask = (taskId: string, updates: Partial<GanttTask>) => {
    if (!ganttData) return;

    const updateTaskRecursive = (tasks: GanttTask[]): GanttTask[] => {
      return tasks.map(task => {
        if (task.id === taskId) {
          return { ...task, ...updates };
        }
        if (task.children) {
          return { ...task, children: updateTaskRecursive(task.children) };
        }
        return task;
      });
    };

    setGanttData({
      ...ganttData,
      tasks: updateTaskRecursive(ganttData.tasks),
      lastUpdated: new Date().toISOString()
    });
  };

  const addTask = (parentId?: string) => {
    if (!ganttData) return;

    const newTask: GanttTask = {
      id: `task-${Date.now()}`,
      name: 'New Task',
      type: 'task',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: 7,
      progress: 0,
      owner: initiativeData.owner || '',
      status: 'not-started',
      color: '#8B5CF6'
    };

    if (!parentId) {
      // Add as root task
      setGanttData({
        ...ganttData,
        tasks: [...ganttData.tasks, newTask],
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Add as child of parentId
      const addChildRecursive = (tasks: GanttTask[]): GanttTask[] => {
        return tasks.map(task => {
          if (task.id === parentId) {
            return {
              ...task,
              children: [...(task.children || []), newTask]
            };
          }
          if (task.children) {
            return { ...task, children: addChildRecursive(task.children) };
          }
          return task;
        });
      };

      setGanttData({
        ...ganttData,
        tasks: addChildRecursive(ganttData.tasks),
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const confirmDeleteTask = () => {
    if (!ganttData || !taskToDelete) return;

    const deleteTaskRecursive = (tasks: GanttTask[]): GanttTask[] => {
      return tasks
        .filter(task => task.id !== taskToDelete)
        .map(task => {
          if (task.children) {
            return { ...task, children: deleteTaskRecursive(task.children) };
          }
          return task;
        });
    };

    setGanttData({
      ...ganttData,
      tasks: deleteTaskRecursive(ganttData.tasks),
      lastUpdated: new Date().toISOString()
    });
    setTaskToDelete(null);
  };

  const deleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
  };

  const handleSave = () => {
    if (!ganttData) return;
    onSave(ganttData);
    onClose();
  };

  const renderTask = (task: GanttTask, depth: number = 0) => {
    const isCollapsed = collapsedTasks.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const indentPx = depth * 24;

    const statusColors = {
      'not-started': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      'completed': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      'blocked': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
    };

    const typeIcons = {
      milestone: CheckCircle,
      task: PlayCircle,
      phase: Sparkles
    };

    const Icon = typeIcons[task.type];

    return (
      <React.Fragment key={task.id}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3 p-3" style={{ paddingLeft: `${indentPx + 12}px` }}>
            {/* Collapse/Expand Button */}
            {hasChildren && (
              <button
                onClick={() => toggleCollapse(task.id)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}

            {/* Task Icon */}
            <Icon className="w-4 h-4 text-gray-400" style={{ color: task.color || '#8B5CF6' }} />

            {/* Task Name (Editable) */}
            <input
              type="text"
              value={task.name}
              onChange={(e) => updateTask(task.id, { name: e.target.value })}
              className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 font-roobert-medium text-sm text-gray-900 dark:text-gray-100"
            />

            {/* Start Date */}
            <input
              type="date"
              value={task.startDate}
              onChange={(e) => updateTask(task.id, { startDate: e.target.value })}
              className="w-32 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />

            {/* End Date */}
            <input
              type="date"
              value={task.endDate}
              onChange={(e) => updateTask(task.id, { endDate: e.target.value })}
              className="w-32 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />

            {/* Progress */}
            <input
              type="number"
              min="0"
              max="100"
              value={task.progress}
              onChange={(e) => updateTask(task.id, { progress: parseInt(e.target.value) || 0 })}
              className="w-16 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <span className="text-xs text-gray-500">%</span>

            {/* Status */}
            <select
              value={task.status || 'not-started'}
              onChange={(e) => updateTask(task.id, { status: e.target.value as any })}
              className={`px-2 py-1 rounded text-xs font-roobert-medium ${statusColors[task.status || 'not-started']}`}
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditingTask(task)}
                className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                title="Edit details"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => addTask(task.id)}
                className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                title="Add child task"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Render children if not collapsed */}
        {hasChildren && !isCollapsed && task.children!.map(child => renderTask(child, depth + 1))}
      </React.Fragment>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[75vw] h-[calc(100vh-2rem)] flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white overflow-hidden">
          {/* Dot Pattern Background */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="gantt-editor-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gantt-editor-grid)" />
            </svg>
          </div>

          <div className="relative p-6">
          <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-roobert-semibold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-white" />
              Gantt Chart Editor
            </h2>
            <p className="text-sm text-white/80 mt-1">
              {initiativeData?.name || 'Initiative Gantt Chart'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-lg font-roobert-medium text-sm transition-colors ${
              activeTab === 'edit'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Edit Gantt
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-lg font-roobert-medium text-sm transition-colors ${
              activeTab === 'templates'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Templates
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'edit' && (
            <div>
              {/* Add Root Task Button */}
              <div className="mb-4 flex justify-between items-center">
                <button
                  onClick={() => addTask()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-roobert-medium text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Root Task
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {ganttData?.tasks.length || 0} root tasks
                </div>
              </div>

              {/* Task List */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3 font-roobert-semibold text-xs text-gray-700 dark:text-gray-300">
                  <div className="w-4"></div>
                  <div className="w-4"></div>
                  <div className="flex-1">Task Name</div>
                  <div className="w-32">Start Date</div>
                  <div className="w-32">End Date</div>
                  <div className="w-16">Progress</div>
                  <div className="w-2"></div>
                  <div className="w-24">Status</div>
                  <div className="w-20">Actions</div>
                </div>

                {/* Task Rows */}
                {ganttData && ganttData.tasks.length > 0 ? (
                  ganttData.tasks.map(task => renderTask(task, 0))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No tasks yet. Add a task or load a template.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-1">
                    Select a Project Template
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Templates add new parent phases with child tasks to your Gantt chart. You can add multiple templates to create parallel workstreams.
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplateManager(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fis-eggplant to-fis-navy text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-roobert-semibold">Manage Templates</span>
                </button>
              </div>

              {/* Template Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {availableTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-400 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <h4 className="font-roobert-semibold text-gray-900 dark:text-white mb-1">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <Clock className="w-3 h-3" />
                      {template.estimatedDuration} weeks
                    </div>
                  </button>
                ))}
              </div>

              {/* Template Configuration Form */}
              {selectedTemplate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-800"
                >
                  <h4 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                    Configure Template: {selectedTemplate.name}
                  </h4>

                  {/* Root Task Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                      Root Task Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={templateRootName}
                      onChange={(e) => setTemplateRootName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Capital Markets - Tiled Rollout"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This will be the parent task containing all template tasks as children
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {selectedTemplate.variables.map(variable => (
                      <div key={variable.key}>
                        <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                          {variable.label} {variable.required && <span className="text-red-500">*</span>}
                        </label>
                        {variable.type === 'select' && variable.options ? (
                          <select
                            value={templateVariables[variable.key] || ''}
                            onChange={(e) => setTemplateVariables({ ...templateVariables, [variable.key]: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select {variable.label}</option>
                            {variable.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={templateVariables[variable.key] || ''}
                            onChange={(e) => setTemplateVariables({ ...templateVariables, [variable.key]: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder={variable.defaultValue || ''}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Date <span className="text-gray-500">(Optional if End Date provided)</span>
                      </label>
                      <input
                        type="date"
                        value={templateStartDate}
                        onChange={(e) => setTemplateStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Date <span className="text-gray-500">(Optional if Start Date provided)</span>
                      </label>
                      <input
                        type="date"
                        value={templateEndDate}
                        onChange={(e) => setTemplateEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateFromTemplate}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-roobert-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Gantt from Template
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-roobert-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-roobert-semibold flex items-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Gantt Chart
          </button>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {taskToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setTaskToDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
                  Delete Task
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this task and all its children? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setTaskToDelete(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-roobert-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTask}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-roobert-semibold transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Detail Editor Modal */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[75vw] h-[calc(100vh-2rem)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white overflow-hidden">
                {/* Dot Pattern Background */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="task-edit-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="20" cy="20" r="1" fill="currentColor" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#task-edit-grid)" />
                  </svg>
                </div>

                <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Edit className="w-6 h-6" />
                    <div>
                      <h3 className="text-lg font-roobert-bold">Edit Task Details</h3>
                      <p className="text-sm text-white/80">{editingTask.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Task Name */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingTask.name}
                    onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                    placeholder="Enter task name"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Task Type */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task Type
                  </label>
                  <select
                    value={editingTask.type}
                    onChange={(e) => setEditingTask({ ...editingTask, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="task">Task</option>
                    <option value="milestone">Milestone</option>
                    <option value="phase">Phase</option>
                  </select>
                </div>

                {/* Dates - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editingTask.startDate}
                      onChange={(e) => setEditingTask({ ...editingTask, startDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={editingTask.endDate}
                      onChange={(e) => setEditingTask({ ...editingTask, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Progress and Status - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                      Progress (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editingTask.progress}
                      onChange={(e) => setEditingTask({ ...editingTask, progress: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={editingTask.status || 'not-started'}
                      onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="not-started">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>

                {/* Owner */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Owner
                  </label>
                  <input
                    type="text"
                    value={editingTask.owner || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, owner: e.target.value })}
                    placeholder="Enter task owner name"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editingTask.color || '#8B5CF6'}
                      onChange={(e) => setEditingTask({ ...editingTask, color: e.target.value })}
                      className="w-16 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingTask.color || '#8B5CF6'}
                      onChange={(e) => setEditingTask({ ...editingTask, color: e.target.value })}
                      placeholder="#8B5CF6"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Dependencies */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dependencies (comma-separated task IDs)
                  </label>
                  <input
                    type="text"
                    value={editingTask.dependencies?.join(', ') || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dependencies: e.target.value.split(',').map(d => d.trim()).filter(d => d) })}
                    placeholder="e.g., task-1, task-2"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    List task IDs that must be completed before this task can start
                  </p>
                </div>

                {/* Risks */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Risks (one per line)
                  </label>
                  <textarea
                    value={editingTask.risks?.join('\n') || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, risks: e.target.value.split('\n').filter(r => r.trim()) })}
                    placeholder="List potential risks..."
                    rows={4}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Task ID (Read-only) */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Task ID
                  </label>
                  <input
                    type="text"
                    value={editingTask.id}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use this ID when setting up dependencies in other tasks
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
                <button
                  onClick={() => setEditingTask(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-roobert-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateTask(editingTask.id, editingTask);
                    setEditingTask(null);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-roobert-semibold transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <GanttTemplateManager
          onClose={() => {
            setShowTemplateManager(false);
            // Reload templates from localStorage
            const saved = localStorage.getItem('ganttTemplates');
            setAvailableTemplates(saved ? JSON.parse(saved) : GANTT_TEMPLATES);
          }}
          onTemplateCreated={(template) => {
            setAvailableTemplates(prev => [...prev, template]);
          }}
          onTemplateUpdated={(template) => {
            setAvailableTemplates(prev => prev.map(t => t.id === template.id ? template : t));
          }}
          onTemplateDeleted={(templateId) => {
            setAvailableTemplates(prev => prev.filter(t => t.id !== templateId));
            if (selectedTemplate?.id === templateId) {
              setSelectedTemplate(null);
            }
          }}
        />
      )}
    </div>
  );
}
