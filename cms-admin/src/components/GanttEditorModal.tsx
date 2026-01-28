/**
 * GANTT EDITOR MODAL
 * 
 * Full-screen editor for Gantt chart data with:
 * - Settings tab (title, date range)
 * - Organizations tab (CRUD operations)
 * - Tasks tab (hierarchical tree editing)
 * - Preview tab (live render)
 * 
 * Similar to BudgetEditorModal pattern
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Settings,
  Building2,
  List,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { GanttChartRenderer } from '../renderers/assetRenderGantt';
import type { GanttData, GanttOrganization, GanttProject, GanttTask } from '../types/ganttTypes';

interface GanttEditorModalProps {
  data: GanttData;
  onChange: (value: GanttData) => void;
  onClose: () => void;
}

export const GanttEditorModal: React.FC<GanttEditorModalProps> = ({ data, onChange, onClose }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'organizations' | 'tasks' | 'preview'>('settings');
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // ==========================================
  // SETTINGS TAB HANDLERS
  // ==========================================

  const updateField = (field: keyof GanttData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // ==========================================
  // ORGANIZATION TAB HANDLERS
  // ==========================================

  const addOrganization = () => {
    const newOrg: GanttOrganization = {
      id: `org-${Date.now()}`,
      name: 'New Organization',
      color: 'var(--brand-primary)',
      collapsed: false,
      projects: []
    };
    onChange({ ...data, organizations: [...data.organizations, newOrg] });
  };

  const updateOrganization = (orgId: string, field: keyof GanttOrganization, value: any) => {
    const updatedOrgs = data.organizations.map(org =>
      org.id === orgId ? { ...org, [field]: value } : org
    );
    onChange({ ...data, organizations: updatedOrgs });
  };

  const deleteOrganization = (orgId: string) => {
    onChange({ 
      ...data, 
      organizations: data.organizations.filter(org => org.id !== orgId) 
    });
  };

  const moveOrganization = (orgId: string, direction: 'up' | 'down') => {
    const index = data.organizations.findIndex(org => org.id === orgId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === data.organizations.length - 1)
    ) {
      return;
    }

    const newOrgs = [...data.organizations];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrgs[index], newOrgs[targetIndex]] = [newOrgs[targetIndex], newOrgs[index]];
    onChange({ ...data, organizations: newOrgs });
  };

  // ==========================================
  // PROJECT HANDLERS
  // ==========================================

  const addProject = (orgId: string) => {
    const newProject: GanttProject = {
      id: `proj-${Date.now()}`,
      name: 'New Project',
      tasks: []
    };
    const updatedOrgs = data.organizations.map(org =>
      org.id === orgId 
        ? { ...org, projects: [...org.projects, newProject] }
        : org
    );
    onChange({ ...data, organizations: updatedOrgs });
  };

  const updateProject = (orgId: string, projectId: string, field: keyof GanttProject, value: any) => {
    const updatedOrgs = data.organizations.map(org => {
      if (org.id === orgId) {
        const updatedProjects = org.projects.map(proj =>
          proj.id === projectId ? { ...proj, [field]: value } : proj
        );
        return { ...org, projects: updatedProjects };
      }
      return org;
    });
    onChange({ ...data, organizations: updatedOrgs });
  };

  const deleteProject = (orgId: string, projectId: string) => {
    const updatedOrgs = data.organizations.map(org => {
      if (org.id === orgId) {
        return { ...org, projects: org.projects.filter(proj => proj.id !== projectId) };
      }
      return org;
    });
    onChange({ ...data, organizations: updatedOrgs });
  };

  // ==========================================
  // TASK HANDLERS
  // ==========================================

  const addTask = (orgId: string, projectId: string) => {
    const newTask: GanttTask = {
      id: `task-${Date.now()}`,
      name: 'New Task',
      startDate: data.startDate,
      endDate: data.endDate,
      progress: 0,
      status: 'on-track',
      owner: '',
      details: {
        description: '',
        milestones: [],
        blockers: [],
        dependencies: []
      }
    };

    const updatedOrgs = data.organizations.map(org => {
      if (org.id === orgId) {
        const updatedProjects = org.projects.map(proj => {
          if (proj.id === projectId) {
            return { ...proj, tasks: [...proj.tasks, newTask] };
          }
          return proj;
        });
        return { ...org, projects: updatedProjects };
      }
      return org;
    });
    onChange({ ...data, organizations: updatedOrgs });
  };

  const updateTask = (orgId: string, projectId: string, taskId: string, field: keyof GanttTask | string, value: any) => {
    const updatedOrgs = data.organizations.map(org => {
      if (org.id === orgId) {
        const updatedProjects = org.projects.map(proj => {
          if (proj.id === projectId) {
            const updatedTasks = proj.tasks.map(task => {
              if (task.id === taskId) {
                // Handle nested fields (e.g., 'details.description')
                if (field.includes('.')) {
                  const [parent, child] = field.split('.');
                  return {
                    ...task,
                    [parent]: {
                      ...(task as any)[parent],
                      [child]: value
                    }
                  };
                }
                return { ...task, [field]: value };
              }
              return task;
            });
            return { ...proj, tasks: updatedTasks };
          }
          return proj;
        });
        return { ...org, projects: updatedProjects };
      }
      return org;
    });
    onChange({ ...data, organizations: updatedOrgs });
  };

  const deleteTask = (orgId: string, projectId: string, taskId: string) => {
    const updatedOrgs = data.organizations.map(org => {
      if (org.id === orgId) {
        const updatedProjects = org.projects.map(proj => {
          if (proj.id === projectId) {
            return { ...proj, tasks: proj.tasks.filter(task => task.id !== taskId) };
          }
          return proj;
        });
        return { ...org, projects: updatedProjects };
      }
      return org;
    });
    onChange({ ...data, organizations: updatedOrgs });
  };

  // ==========================================
  // UI STATE HANDLERS
  // ==========================================

  const toggleOrg = (orgId: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrgs(newExpanded);
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // ==========================================
  // COLOR PRESETS
  // ==========================================

  const colorPresets = [
    { label: 'Purple', value: 'var(--brand-primary)' },
    { label: 'Pink', value: 'var(--brand-secondary)' },
    { label: 'Blue', value: 'var(--accent-blue)' },
    { label: 'Green', value: 'var(--accent-green)' },
    { label: 'Yellow', value: 'var(--accent-yellow)' },
    { label: 'Red', value: 'var(--accent-red)' }
  ];

  const statusOptions: GanttTask['status'][] = ['on-track', 'at-risk', 'blocked', 'completed'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[calc(100vh-2rem)] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-roobert-bold text-gray-900 dark:text-white">Gantt Chart Editor</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{data.title || 'Untitled Project'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-t-lg font-roobert-medium text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-fis-eggplant text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('organizations')}
            className={`px-3 py-1.5 rounded-t-lg font-roobert-medium text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'organizations'
                ? 'bg-fis-eggplant text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Organizations ({data.organizations.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-t-lg font-roobert-medium text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'bg-fis-eggplant text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-t-lg font-roobert-medium text-xs transition-colors flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-fis-eggplant text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-4">
              <div>
                <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chart Title
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Q1 2025 Strategic Initiatives"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={data.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={data.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> These dates define the overall chart range. Individual tasks will be positioned within this timeline.
                </p>
              </div>
            </div>
          )}

          {/* ORGANIZATIONS TAB */}
          {activeTab === 'organizations' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-roobert-semibold">Organizations ({data.organizations.length})</h3>
                <button
                  onClick={addOrganization}
                  className="px-3 py-1.5 bg-fis-eggplant text-white rounded-lg flex items-center gap-1.5 hover:bg-fis-eggplant/90 transition-colors text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Organization
                </button>
              </div>

              {data.organizations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No organizations yet. Click "Add Organization" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.organizations.map((org, index) => (
                    <div 
                      key={org.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        {/* Color Picker */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs text-gray-500">Color</label>
                          <select
                            value={org.color}
                            onChange={(e) => updateOrganization(org.id, 'color', e.target.value)}
                            className="px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                          >
                            {colorPresets.map(preset => (
                              <option key={preset.value} value={preset.value}>
                                {preset.label}
                              </option>
                            ))}
                          </select>
                          <div 
                            className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: org.color }}
                          />
                        </div>

                        {/* Org Details */}
                        <div className="flex-1 space-y-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Organization Name</label>
                            <input
                              type="text"
                              value={org.name}
                              onChange={(e) => updateOrganization(org.id, 'name', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                              placeholder="Capital Markets"
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            {org.projects.length} projects, {org.projects.reduce((sum, p) => sum + p.tasks.length, 0)} tasks
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => moveOrganization(org.id, 'up')}
                            disabled={index === 0}
                            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveOrganization(org.id, 'down')}
                            disabled={index === data.organizations.length - 1}
                            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => deleteOrganization(org.id)}
                            className="px-2 py-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <h3 className="text-sm font-roobert-semibold mb-3">Projects & Tasks</h3>

              {data.organizations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Add organizations first in the Organizations tab.
                </div>
              ) : (
                <div className="space-y-4">
                  {data.organizations.map((org) => (
                    <div key={org.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      {/* Org Header */}
                      <div 
                        className="bg-gray-50 dark:bg-gray-800 p-4 cursor-pointer flex items-center justify-between"
                        onClick={() => toggleOrg(org.id)}
                      >
                        <div className="flex items-center gap-3">
                          {expandedOrgs.has(org.id) ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: org.color }}
                          />
                          <span className="font-roobert-semibold">{org.name}</span>
                          <span className="text-sm text-gray-500">
                            ({org.projects.length} projects)
                          </span>
                        </div>
                        {expandedOrgs.has(org.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addProject(org.id);
                            }}
                            className="px-3 py-1 text-xs bg-fis-eggplant text-white rounded hover:bg-fis-eggplant/90"
                          >
                            <Plus className="w-3 h-3 inline mr-1" />
                            Add Project
                          </button>
                        )}
                      </div>

                      {/* Projects */}
                      {expandedOrgs.has(org.id) && (
                        <div className="p-4 space-y-3">
                          {org.projects.length === 0 ? (
                            <div className="text-sm text-gray-500 text-center py-4">
                              No projects yet. Click "Add Project" above.
                            </div>
                          ) : (
                            org.projects.map((project) => (
                              <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                                {/* Project Header */}
                                <div className="bg-white dark:bg-gray-800 p-2 flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1">
                                    <button
                                      onClick={() => toggleProject(project.id)}
                                      className="text-gray-500"
                                    >
                                      {expandedProjects.has(project.id) ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                    <input
                                      type="text"
                                      value={project.name}
                                      onChange={(e) => updateProject(org.id, project.id, 'name', e.target.value)}
                                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded"
                                      placeholder="Project Name"
                                    />
                                    <span className="text-xs text-gray-500">
                                      ({project.tasks.length} tasks)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => addTask(org.id, project.id)}
                                      className="px-1.5 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => deleteProject(org.id, project.id)}
                                      className="px-1.5 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* Tasks */}
                                {expandedProjects.has(project.id) && (
                                  <div className="p-2 space-y-2 bg-gray-50 dark:bg-gray-900">
                                    {project.tasks.length === 0 ? (
                                      <div className="text-xs text-gray-500 text-center py-2">
                                        No tasks yet
                                      </div>
                                    ) : (
                                      project.tasks.map((task) => (
                                        <div 
                                          key={task.id}
                                          className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2"
                                        >
                                          {/* Task Name & Actions */}
                                          <div className="flex items-center gap-1.5">
                                            <input
                                              type="text"
                                              value={task.name}
                                              onChange={(e) => updateTask(org.id, project.id, task.id, 'name', e.target.value)}
                                              className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded font-roobert-medium"
                                              placeholder="Task Name"
                                            />
                                            <button
                                              onClick={() => deleteTask(org.id, project.id, task.id)}
                                              className="px-1.5 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>

                                          {/* Task Details Grid */}
                                          <div className="grid grid-cols-3 gap-1.5">
                                            <div>
                                              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                              <input
                                                type="date"
                                                value={task.startDate}
                                                onChange={(e) => updateTask(org.id, project.id, task.id, 'startDate', e.target.value)}
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                              <input
                                                type="date"
                                                value={task.endDate}
                                                onChange={(e) => updateTask(org.id, project.id, task.id, 'endDate', e.target.value)}
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs text-gray-500 mb-1">Owner</label>
                                              <input
                                                type="text"
                                                value={task.owner}
                                                onChange={(e) => updateTask(org.id, project.id, task.id, 'owner', e.target.value)}
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded"
                                                placeholder="John Doe"
                                              />
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-1.5">
                                            <div>
                                              <label className="block text-xs text-gray-500 mb-1">Status</label>
                                              <select
                                                value={task.status}
                                                onChange={(e) => updateTask(org.id, project.id, task.id, 'status', e.target.value)}
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded"
                                              >
                                                {statusOptions.map(status => (
                                                  <option key={status} value={status}>
                                                    {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                  </option>
                                                ))}
                                              </select>
                                            </div>
                                            <div>
                                              <label className="block text-xs text-gray-500 mb-1">Progress (%)</label>
                                              <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={task.progress}
                                                onChange={(e) => updateTask(org.id, project.id, task.id, 'progress', parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded"
                                              />
                                            </div>
                                          </div>

                                          <div>
                                            <label className="block text-xs text-gray-500 mb-1">Description</label>
                                            <textarea
                                              value={task.details.description}
                                              onChange={(e) => updateTask(org.id, project.id, task.id, 'details.description', e.target.value)}
                                              className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded"
                                              rows={1}
                                              placeholder="Task description..."
                                            />
                                          </div>

                                          {/* Dependencies */}
                                          <div>
                                            <label className="block text-xs text-gray-500 mb-1">Dependencies</label>
                                            <div className="space-y-1">
                                              {task.details.dependencies.map((dep, depIndex) => (
                                                <div key={depIndex} className="flex gap-1">
                                                  <select
                                                    value={dep}
                                                    onChange={(e) => {
                                                      const newDeps = [...task.details.dependencies];
                                                      newDeps[depIndex] = e.target.value;
                                                      updateTask(org.id, project.id, task.id, 'details.dependencies', newDeps);
                                                    }}
                                                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                                  >
                                                    <option value="">-- Select a task --</option>
                                                    {project.tasks
                                                      .filter(t => t.id !== task.id) // Exclude current task
                                                      .map(t => (
                                                        <option key={t.id} value={t.id}>
                                                          {t.name || 'Untitled Task'}
                                                        </option>
                                                      ))
                                                    }
                                                  </select>
                                                  <button
                                                    onClick={() => {
                                                      const newDeps = task.details.dependencies.filter((_, i) => i !== depIndex);
                                                      updateTask(org.id, project.id, task.id, 'details.dependencies', newDeps);
                                                    }}
                                                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                                  >
                                                    ×
                                                  </button>
                                                </div>
                                              ))}
                                              <button
                                                onClick={() => {
                                                  const newDeps = [...task.details.dependencies, ''];
                                                  updateTask(org.id, project.id, task.id, 'details.dependencies', newDeps);
                                                }}
                                                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                              >
                                                + Add Dependency
                                              </button>
                                            </div>
                                          </div>

                                          {/* Blockers */}
                                          <div>
                                            <label className="block text-xs text-gray-500 mb-1">Blockers & Risks</label>
                                            <div className="space-y-1">
                                              {task.details.blockers.map((blocker, blockIndex) => (
                                                <div key={blockIndex} className="flex gap-1">
                                                  <input
                                                    type="text"
                                                    value={blocker}
                                                    onChange={(e) => {
                                                      const newBlockers = [...task.details.blockers];
                                                      newBlockers[blockIndex] = e.target.value;
                                                      updateTask(org.id, project.id, task.id, 'details.blockers', newBlockers);
                                                    }}
                                                    className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded"
                                                    placeholder="Blocker description"
                                                  />
                                                  <button
                                                    onClick={() => {
                                                      const newBlockers = task.details.blockers.filter((_, i) => i !== blockIndex);
                                                      updateTask(org.id, project.id, task.id, 'details.blockers', newBlockers);
                                                    }}
                                                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                                  >
                                                    ×
                                                  </button>
                                                </div>
                                              ))}
                                              <button
                                                onClick={() => {
                                                  const newBlockers = [...task.details.blockers, ''];
                                                  updateTask(org.id, project.id, task.id, 'details.blockers', newBlockers);
                                                }}
                                                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                              >
                                                + Add Blocker
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PREVIEW TAB */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This is a live preview of your Gantt chart. Click tasks to see detail modals, hover for quick info.
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <GanttChartRenderer data={data} mode="display" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg font-roobert-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
