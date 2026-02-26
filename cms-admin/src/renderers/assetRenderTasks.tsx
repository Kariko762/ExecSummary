/**
 * TASK CONNECTOR RENDERER (CMS)
 * Renders filtered tasks in multi-column grid layout
 */

import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, Users, Target, AlertCircle, TrendingUp, Eye, StickyNote } from 'lucide-react';
import TaskFiltersModal from '../components/TaskFiltersModal';
import { TaskEditorModal } from '../components/TaskEditorModal';
import type { Task as FullTask } from '../components/TaskEditorModal';

interface TaskFilters {
  status?: string[];
  priority?: string[];
  businessUnit?: string[];
  product?: string[];
  owner?: string[];
  tags?: string[];
  goalId?: string;
  initiativeId?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
  limit?: number;
}

interface TaskLayout {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface Task {
  id: string;
  title: string;
  owner?: string;
  businessUnit?: string;
  businessUnits?: string[];
  product?: string;
  status?: 'On Track' | 'At Risk' | 'Off Track' | 'Completed';
  priority?: 'High' | 'Medium' | 'Low';
  percentage?: number;
  targetDate?: string;
  tags?: string[];
  goalId?: string;
}

interface TaskConnectorData {
  filters: TaskFilters;
  layout: TaskLayout;
}

interface TaskConnectorProps {
  data: TaskConnectorData;
  onTaskClick?: (task: Task) => void;
  onChange?: (value: TaskConnectorData) => void;
  mode?: 'edit' | 'display';
}

export const TaskConnectorRenderer: React.FC<TaskConnectorProps> = ({ data, onTaskClick, onChange, mode = 'display' }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTask, setSelectedTask] = useState<FullTask | null>(null);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [availableGoals, setAvailableGoals] = useState<any[]>([]);
  const [noteCounts, setNoteCounts] = useState<Record<string, number>>({}); // NEW
  
  // Local state for text inputs (always initialize, even if not in edit mode)
  const [localBusinessUnit, setLocalBusinessUnit] = useState('');
  const [localProduct, setLocalProduct] = useState('');
  const [localOwner, setLocalOwner] = useState('');

  // Initialize data structure if missing
  const filters = data?.filters || {};
  const layout = data?.layout || { sortBy: 'targetDate', sortOrder: 'asc' };

  // Sync local state when data changes (only in edit mode)
  useEffect(() => {
    if (mode === 'edit') {
      setLocalBusinessUnit((filters.businessUnit || []).join(', '));
      setLocalProduct((filters.product || []).join(', '));
      setLocalOwner((filters.owner || []).join(', '));
    }
  }, [mode, JSON.stringify(filters.businessUnit), JSON.stringify(filters.product), JSON.stringify(filters.owner)]);

  // Fetch tags and goals for filter dropdowns (edit mode)
  useEffect(() => {
    if (mode === 'edit') {
      fetchTagsAndGoals();
    }
  }, [mode]);

  const fetchTagsAndGoals = async () => {
    try {
      const tagsResponse = await fetch('http://localhost:3001/api/tags');
      if (tagsResponse.ok) {
        const tagsData = await tagsResponse.json();
        setAvailableTags(Array.isArray(tagsData) ? tagsData : []);
      }

      const goalsResponse = await fetch('http://localhost:3001/api/goals');
      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setAvailableGoals(goalsData.goals || []);
      }
    } catch (error) {
      console.error('Failed to fetch tags/goals:', error);
    }
  };

  // EDIT MODE - Filter Configuration UI
  if (mode === 'edit') {
    const updateFilter = (key: keyof TaskFilters, value: any) => {
      onChange?.({
        filters: { ...filters, [key]: value },
        layout
      });
    };

    const updateLayout = (key: keyof TaskLayout, value: any) => {
      onChange?.({
        filters,
        layout: { ...layout, [key]: value }
      });
    };

    const updateTextFilter = (key: keyof TaskFilters, value: string) => {
      const trimmed = value.trim();
      updateFilter(key, trimmed ? value.split(',').map(s => s.trim()).filter(s => s) : undefined);
    };

    const toggleArrayValue = (key: keyof TaskFilters, value: string) => {
      const current = (filters[key] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      updateFilter(key, updated.length > 0 ? updated : undefined);
    };

    const toggleTagValue = (tagId: string) => {
      const current = (filters.tags as string[]) || [];
      const updated = current.includes(tagId)
        ? current.filter(id => id !== tagId)
        : [...current, tagId];
      updateFilter('tags', updated.length > 0 ? updated : undefined);
    };

    return (
      <div className="space-y-4">
        {/* Filter Configuration Section */}
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-3">Task Filters</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <div className="flex flex-wrap gap-2">
                {['On Track', 'At Risk', 'Off Track', 'Completed'].map(status => (
                  <button
                    key={status}
                    onClick={() => toggleArrayValue('status', status)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      (filters.status || []).includes(status)
                        ? 'bg-fis-eggplant dark:bg-fis-raspberry text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <div className="flex flex-wrap gap-2">
                {['High', 'Medium', 'Low'].map(priority => (
                  <button
                    key={priority}
                    onClick={() => toggleArrayValue('priority', priority)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      (filters.priority || []).includes(priority)
                        ? 'bg-fis-eggplant dark:bg-fis-raspberry text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Unit Filter */}
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Business Unit</label>
              <input
                type="text"
                value={localBusinessUnit}
                onChange={(e) => setLocalBusinessUnit(e.target.value)}
                onBlur={(e) => updateTextFilter('businessUnit', e.target.value)}
                placeholder="e.g., Capital Markets, Engineering"
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Separate multiple with commas</p>
            </div>

            {/* Product Filter */}
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
              <input
                type="text"
                value={localProduct}
                onChange={(e) => setLocalProduct(e.target.value)}
                onBlur={(e) => updateTextFilter('product', e.target.value)}
                placeholder="e.g., Platform, API Gateway"
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Separate multiple with commas</p>
            </div>

            {/* Owner Filter */}
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Owner</label>
              <input
                type="text"
                value={localOwner}
                onChange={(e) => setLocalOwner(e.target.value)}
                onBlur={(e) => updateTextFilter('owner', e.target.value)}
                placeholder="e.g., John Doe, Jane Smith"
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Separate multiple with commas</p>
            </div>

            {/* Goal Filter */}
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Strategic Goal</label>
              <select
                value={filters.goalId || ''}
                onChange={(e) => updateFilter('goalId', e.target.value || undefined)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Goals</option>
                {availableGoals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.shortName}</option>
                ))}
              </select>
            </div>

            {/* Tags Filter */}
            <div className="col-span-2">
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTagValue(tag.id)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      (filters.tags || []).includes(tag.id)
                        ? `text-white`
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    style={(filters.tags || []).includes(tag.id) ? { backgroundColor: tag.color } : {}}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value || undefined })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value || undefined })}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Limit */}
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Max Tasks</label>
              <input
                type="number"
                value={filters.limit || 10}
                onChange={(e) => updateFilter('limit', parseInt(e.target.value) || 10)}
                min={1}
                max={100}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Layout Configuration Section */}
        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <h4 className="text-sm font-roobert-semibold text-gray-900 dark:text-white mb-3">Sorting Options</h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select
                value={layout.sortBy || 'targetDate'}
                onChange={(e) => updateLayout('sortBy', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="targetDate">Target Date</option>
                <option value="progress">Progress</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-roobert-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
              <select
                value={layout.sortOrder || 'asc'}
                onChange={(e) => updateLayout('sortOrder', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">Note: Column layout is controlled via Template Builder's layout zones</p>
        </div>

        {/* Test Filters Button */}
        <button
          onClick={() => setShowPreview(true)}
          className="w-full px-4 py-2 bg-fis-eggplant dark:bg-fis-raspberry text-white rounded-lg hover:bg-fis-eggplant/90 dark:hover:bg-fis-raspberry/90 transition-colors flex items-center justify-center gap-2 text-sm font-roobert-medium"
        >
          <Eye className="w-4 h-4" />
          Test Filters (Live Preview)
        </button>

        {/* Preview Modal */}
        {showPreview && (
          <TaskFiltersModal
            filters={filters}
            layout={layout}
            onClose={() => setShowPreview(false)}
            onTaskClick={(task) => {
              console.log('Task clicked in preview:', task);
              setShowPreview(false);
            }}
          />
        )}
      </div>
    );
  }

  // DISPLAY MODE - Fetch and render tasks

  useEffect(() => {
    fetchTasks();
  }, [data]);

  const handleTaskSave = async (updatedTask: FullTask) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      
      if (response.ok) {
        // Refresh tasks to show updates
        await fetchTasks();
        setSelectedTask(null);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      const filters = data?.filters || {};
      const layout = data?.layout || {};
      
      // Apply filters
      if (filters.status?.length) params.append('status', filters.status.join(','));
      if (filters.priority?.length) params.append('priority', filters.priority.join(','));
      if (filters.businessUnit?.length) params.append('businessUnit', filters.businessUnit.join(','));
      if (filters.product?.length) params.append('product', filters.product.join(','));
      if (filters.owner?.length) params.append('owner', filters.owner.join(','));
      if (filters.tags?.length) params.append('tags', filters.tags.join(','));
      if (filters.goalId) params.append('goalId', filters.goalId);
      if (filters.initiativeId) params.append('initiativeId', filters.initiativeId);
      if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start);
      if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end);
      if (filters.limit) params.append('limit', filters.limit.toString());
      
      // Apply sorting
      if (layout.sortBy) params.append('sortBy', layout.sortBy);
      if (layout.sortOrder) params.append('sortOrder', layout.sortOrder);

      const url = `http://localhost:3001/api/tasks?${params.toString()}`;
      console.log('🔍 TaskConnector fetching:', url);
      console.log('📊 Filters applied:', filters);
      
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('✅ Tasks received:', result.tasks?.length || 0, 'tasks');
      
      setTasks(result.tasks || []);
      
      // Fetch note counts for these tasks
      if (result.tasks && result.tasks.length > 0) {
        const taskIds = result.tasks.map((t: Task) => t.id).join(',');
        try {
          const notesResponse = await fetch(`http://localhost:3001/api/notes/count/by-task?taskIds=${taskIds}`);
          const notesData = await notesResponse.json();
          if (notesData.success) {
            setNoteCounts(notesData.counts || {});
          }
        } catch (err) {
          console.error('Failed to fetch note counts:', err);
        }
      } else {
        setNoteCounts({});
      }
    } catch (err) {
      console.error('❌ Failed to fetch tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'On Track': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'At Risk': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Off Track': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProgressColor = (percentage?: number) => {
    if (!percentage) return 'bg-gray-400';
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--brand-primary)]"></div>
          <span className="font-roobert-regular">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
          <span className="font-roobert-regular">{error}</span>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
        <p className="text-lg font-roobert-medium text-gray-500 dark:text-gray-400">
          No tasks match the current filters
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Try adjusting your filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="task-connector-wrapper">
      <div className="task-connector-grid">
        {tasks.map((task) => (
        <div
          key={task.id}
          onClick={() => setSelectedTask(task as unknown as FullTask)}
          className="task-tile group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          {/* Colored Top Border based on Status */}
          <div 
            className={`absolute top-0 left-0 right-0 h-1 ${
              task.status === 'On Track' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
              task.status === 'At Risk' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
              task.status === 'Off Track' ? 'bg-gradient-to-r from-red-400 to-pink-500' :
              task.status === 'Completed' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
              'bg-gradient-to-r from-gray-400 to-gray-500'
            }`}
          />
          
          {/* Priority Corner Accent */}
          {task.priority && (
            <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
              task.priority === 'High' ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' :
              task.priority === 'Medium' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
              'bg-green-500 shadow-lg shadow-green-500/50'
            }`} />
          )}

          <div className="p-4 pt-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-roobert-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent line-clamp-2 flex-1 pr-6">
                {task.title}
              </h3>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-roobert-semibold whitespace-nowrap shadow-sm ${getStatusColor(task.status)}`}>
                {task.status || 'N/A'}
              </span>
            </div>

            {/* Progress Bar with Gradient */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-xs font-roobert-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{task.percentage || 0}%</span>
              </div>
              <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full h-2.5 shadow-inner">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 shadow-sm ${
                    (task.percentage || 0) >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    (task.percentage || 0) >= 40 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    'bg-gradient-to-r from-red-400 to-pink-500'
                  }`}
                  style={{ width: `${task.percentage || 0}%` }}
                />
              </div>
            </div>

            {/* Metadata with Icons */}
            <div className="space-y-2.5 text-xs border-t border-gray-200 dark:border-gray-700 pt-3">
              {task.owner && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Users className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span className="font-roobert-regular truncate">{task.owner}</span>
                </div>
              )}
              
              {task.targetDate && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                  <span className="font-roobert-regular">{task.targetDate}</span>
                </div>
              )}
              
              {task.priority && (
                <div className="flex items-center gap-2">
                  <Target className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
                  <span className={`font-roobert-semibold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                </div>
              )}
              
              {/* Notes Count */}
              {noteCounts[task.id] > 0 && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <StickyNote className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span className="font-roobert-semibold text-amber-700 dark:text-amber-300">
                    {noteCounts[task.id]} {noteCounts[task.id] === 1 ? 'note' : 'notes'}
                  </span>
                </div>
              )}
              
              {(task.businessUnits?.length || task.businessUnit) && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span className="font-roobert-regular text-[11px] truncate">
                    {task.businessUnits?.length ? task.businessUnits.join(', ') : task.businessUnit}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      </div>

      {/* Task Editor Modal (With Editing) */}
      {selectedTask && (
        <TaskEditorModal
          task={selectedTask}
          onSave={handleTaskSave}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default TaskConnectorRenderer;
