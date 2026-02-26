import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'planning' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate: string;
  assignee: string;
  progress: number;
}

interface TasksTableCompactProps {
  tasks: Task[];
  color: string;
  onViewAll?: () => void;
}

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  'in-progress': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  planning: { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  blocked: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' }
};

const priorityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/20' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  low: { color: 'text-gray-400', bg: 'bg-gray-500/20' }
};

const colorMap: Record<string, string> = {
  blue: 'border-blue-500/30',
  cyan: 'border-cyan-500/30',
  purple: 'border-purple-500/30',
  green: 'border-green-500/30',
  orange: 'border-orange-500/30'
};

export const TasksTableCompact: React.FC<TasksTableCompactProps> = ({
  tasks,
  color,
  onViewAll
}) => {
  const borderColor = colorMap[color] || colorMap.blue;

  if (!tasks || tasks.length === 0) {
    return (
      <div className={`border ${borderColor} rounded-xl p-6 bg-gray-800/30 backdrop-blur-sm`}>
        <div className="text-center py-8 text-gray-400">
          No tasks available
        </div>
      </div>
    );
  }

  return (
    <div className={`border ${borderColor} rounded-xl bg-gray-800/30 backdrop-blur-sm overflow-hidden`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Active Tasks</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="divide-y divide-gray-700/50">
        {tasks.map((task) => {
          const statusInfo = statusConfig[task.status] || statusConfig.planning;
          const priorityInfo = priorityConfig[task.priority] || priorityConfig.medium;
          const StatusIcon = statusInfo.icon;
          
          const dueDate = new Date(task.dueDate);
          const isOverdue = dueDate < new Date() && task.status !== 'completed';
          const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <motion.div
              key={task.id}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              className="px-6 py-4 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div className={`${statusInfo.bg} p-2 rounded-lg mt-1`}>
                  <StatusIcon size={16} className={statusInfo.color} />
                </div>

                {/* Task Details */}
                <div className="flex-1 min-w-0">
                  {/* Title and Priority */}
                  <div className="flex items-start gap-2 mb-2">
                    <h4 className="text-white font-medium leading-tight flex-1">
                      {task.title}
                    </h4>
                    <span className={`${priorityInfo.bg} ${priorityInfo.color} text-xs px-2 py-1 rounded uppercase font-semibold`}>
                      {task.priority}
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{task.assignee}</span>
                    <span className="text-gray-600">•</span>
                    <span className={isOverdue ? 'text-red-400' : ''}>
                      {isOverdue 
                        ? 'Overdue' 
                        : daysUntilDue === 0 
                        ? 'Due Today' 
                        : daysUntilDue > 0 
                        ? `${daysUntilDue}d remaining` 
                        : dueDate.toLocaleDateString()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {task.status !== 'completed' && task.status !== 'planning' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
