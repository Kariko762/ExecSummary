/**
 * TASK DETAIL MODAL
 * 
 * Popup modal showing detailed information for a Gantt chart task
 * - Task name, owner, timeline
 * - Progress and status
 * - Milestones
 * - Dependencies and blockers
 * - Glassmorphism design
 */

import React from 'react';
import { X, Calendar, User, CheckCircle, AlertTriangle, AlertCircle, TrendingUp, Link } from 'lucide-react';
import type { GanttTask, GanttData } from '../types/ganttTypes';

interface TaskDetailModalProps {
  task: GanttTask;
  ganttData: GanttData;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, ganttData, onClose }) => {
  
  // Helper to resolve task ID to task name
  const getTaskName = (taskId: string): string => {
    for (const org of ganttData.organizations) {
      for (const project of org.projects) {
        const foundTask = project.tasks.find(t => t.id === taskId);
        if (foundTask) {
          return foundTask.name || 'Untitled Task';
        }
      }
    }
    return taskId; // Fallback to ID if task not found
  };
  
  // Status configuration
  const statusConfig = {
    'on-track': {
      icon: CheckCircle,
      label: 'On Track',
      color: 'var(--semantic-success)',
      bgColor: 'var(--semantic-success-light)',
    },
    'at-risk': {
      icon: AlertTriangle,
      label: 'At Risk',
      color: 'var(--semantic-warning)',
      bgColor: 'var(--semantic-warning-light)',
    },
    'blocked': {
      icon: AlertCircle,
      label: 'Blocked',
      color: 'var(--semantic-error)',
      bgColor: 'var(--semantic-error-light)',
    },
    'completed': {
      icon: CheckCircle,
      label: 'Completed',
      color: 'var(--accent-blue)',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
  };

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

  // Format dates
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Calculate duration
  const calculateDuration = () => {
    try {
      const start = new Date(task.startDate);
      const end = new Date(task.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days`;
    } catch {
      return 'N/A';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-md z-[9999] flex items-stretch justify-end"
      onClick={onClose}
    >
      <div 
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl w-1/2 h-full overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Header */}
        <div 
          className="p-4 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))`
          }}
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="px-2 py-0.5 rounded-full text-xs font-roobert-semibold flex items-center gap-1"
                  style={{ 
                    backgroundColor: config.bgColor,
                    color: config.color
                  }}
                >
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </div>
                <div className="px-2 py-0.5 rounded-full text-xs font-roobert-medium bg-white/20">
                  {task.progress}% Complete
                </div>
              </div>
              <h2 className="text-lg font-roobert-bold mb-1">{task.name}</h2>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <User className="w-3.5 h-3.5" />
                <span>{task.owner}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 relative z-10">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/90 rounded-full transition-all duration-500"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>

          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Timeline Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-roobert-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Timeline
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Start Date</div>
                <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">
                  {formatDate(task.startDate)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">End Date</div>
                <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">
                  {formatDate(task.endDate)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Duration</div>
                <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">
                  {calculateDuration()}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {task.details.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-roobert-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Description
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {task.details.description}
              </p>
            </div>
          )}

          {/* Milestones */}
          {task.details.milestones && task.details.milestones.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-roobert-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Milestones ({task.details.milestones.length})
              </h3>
              <div className="space-y-1.5">
                {task.details.milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      milestone.completed 
                        ? 'bg-green-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                    <div className="flex-1">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white">
                        {milestone.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(milestone.date)}
                      </div>
                    </div>
                    {milestone.completed && (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {task.details.dependencies && task.details.dependencies.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-roobert-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5" />
                Dependencies ({task.details.dependencies.filter(d => d).length})
              </h3>
              <div className="space-y-1.5">
                {task.details.dependencies.filter(dep => dep).map((dep, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <Link className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-roobert-medium text-gray-900 dark:text-white">
                      {getTaskName(dep)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blockers */}
          {task.details.blockers && task.details.blockers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-roobert-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Blockers & Risks
              </h3>
              <div className="space-y-1.5">
                {task.details.blockers.map((blocker, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {blocker}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="w-full px-3 py-2 rounded-lg font-roobert-medium text-sm text-white transition-all"
            style={{
              background: 'linear-gradient(to right, var(--brand-primary), var(--brand-secondary))'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
