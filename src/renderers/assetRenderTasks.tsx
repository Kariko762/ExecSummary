/**
 * TASK CONNECTOR RENDERER (Frontend - Display Only)
 * Renders filtered tasks in multi-column grid layout
 */

import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, Users, Target, AlertCircle, TrendingUp } from 'lucide-react';

// Note: TaskEditorModal will be loaded dynamically from parent page context

interface TaskFilters {
  status?: string[];
  priority?: string[];
  businessUnit?: string[];
  product?: string[];
  owner?: string[];
  tags?: string[];
  goalId?: string;
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
}

export const TaskConnectorRenderer: React.FC<TaskConnectorProps> = ({ data, onTaskClick }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [data]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      // Apply filters
      if (data.filters.status?.length) params.append('status', data.filters.status.join(','));
      if (data.filters.priority?.length) params.append('priority', data.filters.priority.join(','));
      if (data.filters.businessUnit?.length) params.append('businessUnit', data.filters.businessUnit.join(','));
      if (data.filters.product?.length) params.append('product', data.filters.product.join(','));
      if (data.filters.owner?.length) params.append('owner', data.filters.owner.join(','));
      if (data.filters.tags?.length) params.append('tags', data.filters.tags.join(','));
      if (data.filters.goalId) params.append('goalId', data.filters.goalId);
      if (data.filters.dateRange?.start) params.append('startDate', data.filters.dateRange.start);
      if (data.filters.dateRange?.end) params.append('endDate', data.filters.dateRange.end);
      if (data.filters.limit) params.append('limit', data.filters.limit.toString());
      
      // Apply sorting
      if (data.layout.sortBy) params.append('sortBy', data.layout.sortBy);
      if (data.layout.sortOrder) params.append('sortOrder', data.layout.sortOrder);

      const response = await fetch(`http://localhost:3001/api/tasks?${params.toString()}`);
      const result = await response.json();
      
      setTasks(result.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
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
          onClick={() => onTaskClick?.(task)}
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
              
              {task.businessUnit && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span className="font-roobert-regular text-[11px] truncate">{task.businessUnit}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default TaskConnectorRenderer;
