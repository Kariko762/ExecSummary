/**
 * PROJECT DETAIL EDITOR MODAL
 * 
 * Dedicated full-screen editor for progressBarListDetailed asset
 * - Table-based editing for multiple projects
 * - Inline editing for efficiency
 * - Live preview of project cards
 * - Handles all 13 fields: title, owner, team, dates, percentage, status, budget, priority, description, milestones, risks, dependencies
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Users,
  AlertCircle,
  Target,
  ExternalLink,
  FileText,
  Package,
  Building2,
  Info,
  ListChecks
} from 'lucide-react';
import { ProgressBarListDetailedPattern } from '../renderers/assetRenderComplex';

interface Step {
  id: string;
  step: string;
  state: 'Pending' | 'Scheduled' | 'In-Progress' | 'Cancelled' | 'Complete';
}

interface ProjectItem {
  id: string;
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
  steps?: Step[];
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

interface ProjectDetailData {
  projects: ProjectItem[];
}

interface ProjectDetailEditorModalProps {
  data: ProjectDetailData;
  onChange: (value: ProjectDetailData) => void;
  onClose: () => void;
}

export const ProjectDetailEditorModal: React.FC<ProjectDetailEditorModalProps> = ({ 
  data, 
  onChange, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'dataPoints'>('edit');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  
  // Global data point configuration (shared across all projects)
  const [globalFields, setGlobalFields] = useState({
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
  });

  // Ensure data.projects exists
  const projects = data?.projects || [];

  // Project Management
  const addProject = () => {
    const newProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: 'New Project',
      owner: '',
      team: '',
      businessUnit: '',
      product: '',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      percentage: 0,
      status: 'On Track',
      budget: '$0',
      priority: 'Medium',
      description: '',
      milestones: '',
      risks: '',
      dependencies: '',
      steps: [],
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
      },
    };
    onChange({ ...data, projects: [...projects, newProject] });
  };

  const updateProject = (projectId: string, field: keyof ProjectItem, value: any) => {
    const updatedProjects = projects.map((proj) =>
      proj.id === projectId ? { ...proj, [field]: value } : proj
    );
    onChange({ ...data, projects: updatedProjects });
  };

  const deleteProject = (projectId: string) => {
    onChange({ ...data, projects: projects.filter((proj) => proj.id !== projectId) });
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

  const getStatusColor = (status: ProjectItem['status']) => {
    switch (status) {
      case 'On Track': return 'text-green-600 dark:text-green-400';
      case 'At Risk': return 'text-yellow-600 dark:text-yellow-400';
      case 'Blocked': return 'text-red-600 dark:text-red-400';
      case 'Complete': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: ProjectItem['priority']) => {
    switch (priority) {
      case 'High': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'Low': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-fis-eggplant to-fis-raspberry p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-roobert-semibold text-white">Project Portfolio Editor</h2>
              <p className="text-white/80 text-sm mt-1 font-roobert-light">
                Manage detailed project tracking data
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-3 font-roobert-medium transition-colors ${
              activeTab === 'edit'
                ? 'border-b-2 border-fis-raspberry text-fis-raspberry'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Edit Projects
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 font-roobert-medium transition-colors flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'border-b-2 border-fis-raspberry text-fis-raspberry'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('dataPoints')}
            className={`px-6 py-3 font-roobert-medium transition-colors ${
              activeTab === 'dataPoints'
                ? 'border-b-2 border-fis-raspberry text-fis-raspberry'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Data Points
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'edit' && (
            <div className="space-y-4">
              {/* Add Project Button */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
                  Projects ({projects.length})
                </h3>
                <button
                  onClick={addProject}
                  className="flex items-center gap-2 px-4 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg transition-colors font-roobert-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Project
                </button>
              </div>

              {/* Projects List */}
              {projects.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-roobert-medium">No projects yet</p>
                  <p className="text-sm">Click "Add Project" to get started</p>
                </div>
              )}

              {projects.map((project) => {
                const isExpanded = expandedProjects.has(project.id);
                return (
                  <div
                    key={project.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {/* Project Header */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleProject(project.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-roobert-medium text-black dark:text-white"
                            placeholder="Project Title"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-roobert-semibold ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                          <span className={`text-sm font-roobert-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-roobert-medium">
                            {project.percentage}%
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="ml-3 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="p-4 pt-0 space-y-4">
                        {/* Row 1: Owner, Team, Business Unit, Product */}
                        <div className="grid grid-cols-2 gap-4">
                          {globalFields.owner && (
                            <div>
                              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Owner
                                </span>
                              </label>
                              <input
                                type="text"
                                value={project.owner}
                                onChange={(e) => updateProject(project.id, 'owner', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                                placeholder="Project Owner"
                              />
                            </div>
                          )}
                          {globalFields.team && (
                            <div>
                              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Team
                                </span>
                              </label>
                              <input
                                type="text"
                                value={project.team}
                                onChange={(e) => updateProject(project.id, 'team', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                                placeholder="Team Name"
                              />
                            </div>
                          )}
                          {globalFields.businessUnit && (
                            <div>
                              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Business Unit
                                </span>
                              </label>
                              <input
                                type="text"
                                value={project.businessUnit || ''}
                                onChange={(e) => updateProject(project.id, 'businessUnit', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                                placeholder="Business Unit"
                              />
                            </div>
                          )}
                          {globalFields.product && (
                            <div>
                              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span className="flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  Product
                                </span>
                              </label>
                              <input
                                type="text"
                                value={project.product || ''}
                                onChange={(e) => updateProject(project.id, 'product', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                                placeholder="Product Name"
                              />
                            </div>
                          )}
                        </div>

                        {/* Row 2: Dates, Budget, Priority */}
                        <div className="grid grid-cols-4 gap-4">
                          {globalFields.startDate && (
                            <div>
                              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Start Date
                                </span>
                              </label>
                              <input
                                type="date"
                                value={project.startDate}
                                onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                              />
                            </div>
                          )}
                          {globalFields.targetDate && (
                            <div>
                              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  Target Date
                                </span>
                              </label>
                              <input
                                type="date"
                                value={project.targetDate}
                                onChange={(e) => updateProject(project.id, 'targetDate', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                              />
                            </div>
                          )}
                          {globalFields.budget && (
                            <div>
                              <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4" />
                                  Budget
                                </span>
                              </label>
                              <input
                                type="text"
                                value={project.budget}
                                onChange={(e) => updateProject(project.id, 'budget', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                                placeholder="$0"
                              />
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              Priority
                            </label>
                            <select
                              value={project.priority}
                              onChange={(e) => updateProject(project.id, 'priority', e.target.value as ProjectItem['priority'])}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </div>
                        </div>

                        {/* Row 3: Progress, Status */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              Progress (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={project.percentage}
                              onChange={(e) => updateProject(project.id, 'percentage', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              Status
                            </label>
                            <select
                              value={project.status}
                              onChange={(e) => updateProject(project.id, 'status', e.target.value as ProjectItem['status'])}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                            >
                              <option value="On Track">On Track</option>
                              <option value="At Risk">At Risk</option>
                              <option value="Blocked">Blocked</option>
                              <option value="Complete">Complete</option>
                            </select>
                          </div>
                        </div>

                        {/* Row 4: Description */}
                        {globalFields.description && (
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              Description
                            </label>
                            <textarea
                              value={project.description}
                              onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                              rows={3}
                              placeholder="Project description..."
                            />
                          </div>
                        )}

                        {/* Row 5: Milestones */}
                        {globalFields.milestones && (
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              Milestones
                            </label>
                            <textarea
                              value={project.milestones}
                              onChange={(e) => updateProject(project.id, 'milestones', e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                              rows={2}
                              placeholder="Separate milestones with | character (e.g., Phase 1 Complete | Testing Started | Deployment Ready)"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Use | to separate multiple milestones
                            </p>
                          </div>
                        )}

                        {/* Row 6: Risks */}
                        {globalFields.risks && (
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              <span className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Risks
                              </span>
                            </label>
                            <textarea
                              value={project.risks}
                              onChange={(e) => updateProject(project.id, 'risks', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                            rows={2}
                            placeholder="Identified risks and mitigation strategies..."
                          />
                          </div>
                        )}

                        {/* Row 7: Dependencies */}
                        {globalFields.dependencies && (
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">
                              Dependencies
                            </label>
                            <textarea
                              value={project.dependencies}
                              onChange={(e) => updateProject(project.id, 'dependencies', e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                              rows={2}
                              placeholder="External dependencies, blockers, prerequisites..."
                            />
                          </div>
                        )}

                        {/* Row 8: Steps */}
                        {globalFields.steps && (
                          <div>
                            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                              <span className="flex items-center gap-2">
                                <ListChecks className="w-4 h-4" />
                                Steps
                              </span>
                            </label>
                            <div className="space-y-2">
                              {(project.steps || []).map((step, index) => (
                                <div key={step.id} className="flex items-center gap-2">
                                  <select
                                    value={step.state}
                                    onChange={(e) => {
                                      const newSteps = [...(project.steps || [])];
                                      newSteps[index].state = e.target.value as Step['state'];
                                      updateProject(project.id, 'steps', newSteps);
                                    }}
                                    className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                                    style={{ width: '35%' }}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="In-Progress">In-Progress</option>
                                    <option value="Cancelled">Cancelled</option>
                                    <option value="Complete">Complete</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={step.step}
                                    onChange={(e) => {
                                      const newSteps = [...(project.steps || [])];
                                      newSteps[index].step = e.target.value;
                                      updateProject(project.id, 'steps', newSteps);
                                    }}
                                    className="px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
                                    style={{ width: '65%' }}
                                    placeholder="Step description..."
                                  />
                                  <button
                                    onClick={() => {
                                      const newSteps = (project.steps || []).filter((_, i) => i !== index);
                                      updateProject(project.id, 'steps', newSteps);
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    title="Delete step"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newSteps = [...(project.steps || []), {
                                    id: `step-${Date.now()}`,
                                    step: '',
                                    state: 'Pending' as const
                                  }];
                                  updateProject(project.id, 'steps', newSteps);
                                }}
                                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                              >
                                + Add Step
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'preview' && (
            <div>
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-200 font-roobert-medium">
                  📊 Live Preview - Click any project card to see the modal drill-down
                </p>
              </div>
              <ProgressBarListDetailedPattern
                data={projects}
                mode="display"
              />
            </div>
          )}

          {activeTab === 'dataPoints' && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                  Configure Data Points
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-roobert-light">
                  Enable or disable fields for all projects. Only enabled fields will appear in the editor.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Owner */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Owner</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-32 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          Project owner/lead
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.owner ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, owner: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Team */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Team</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-36 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          Team or department name
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.team ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, team: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Business Unit */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Business Unit</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-36 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          Business unit or division
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.businessUnit ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, businessUnit: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Product */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Product</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-36 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          Product or service name
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.product ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, product: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Start Date</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-32 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          Project start date
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.startDate ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, startDate: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Target Date */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Target Date</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-40 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          Expected completion date
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.targetDate ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, targetDate: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Budget */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Budget</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-36 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          Project budget amount
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.budget ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, budget: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Description */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Description</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-32 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          Project description
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.description ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, description: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Milestones */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Milestones</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-36 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          Key project milestones
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.milestones ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, milestones: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Risks */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Risks</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-40 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          Identified risks and issues
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.risks ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, risks: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Dependencies */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Dependencies</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-32 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          External dependencies
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.dependencies ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, dependencies: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* Steps */}
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <div className="flex items-center gap-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">Steps</div>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-gray-400 cursor-help" />
                        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block w-32 px-2 py-1 text-[10px] text-white bg-gray-900 rounded shadow-lg z-10">
                          Task list with status
                        </div>
                      </div>
                    </div>
                  </div>
                  <select
                    value={globalFields.steps ? 'enabled' : 'disabled'}
                    onChange={(e) => setGlobalFields({ ...globalFields, steps: e.target.value === 'enabled' })}
                    className="ml-4 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-[10px]"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-roobert-light">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-fis-eggplant hover:bg-fis-raspberry text-white rounded-lg font-roobert-medium transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save & Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
