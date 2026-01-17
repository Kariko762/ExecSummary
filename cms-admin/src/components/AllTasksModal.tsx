/**
 * ALL TASKS MODAL
 * Displays all tasks in a table view with filters
 */

import React, { useState, useEffect } from 'react';
import { X, Search, Filter, ClipboardList, Calendar, Users, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface AllTasksModalProps {
  onClose: () => void;
  onEditTask: (task: Task) => void;
  onCreateTask?: () => void;
  onOpenNotes?: () => void;
}

export const AllTasksModal: React.FC<AllTasksModalProps> = ({ onClose, onEditTask, onCreateTask, onOpenNotes }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks');
      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.owner?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[80vw] max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[var(--brand-primary)] via-[var(--brand-secondary)] to-[var(--brand-tertiary)] border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-roobert-semibold text-white">All Tasks</h2>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-roobert-medium text-white">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onCreateTask && (
                <button
                  onClick={onCreateTask}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white font-roobert-medium text-sm flex items-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  Create Task
                </button>
              )}
              {onOpenNotes && (
                <button
                  onClick={onOpenNotes}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white font-roobert-medium text-sm flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Timeline Notes
                </button>
              )}
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all" className="bg-gray-800">All Statuses</option>
              <option value="On Track" className="bg-gray-800">On Track</option>
              <option value="At Risk" className="bg-gray-800">At Risk</option>
              <option value="Off Track" className="bg-gray-800">Off Track</option>
              <option value="Completed" className="bg-gray-800">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all" className="bg-gray-800">All Priorities</option>
              <option value="High" className="bg-gray-800">High</option>
              <option value="Medium" className="bg-gray-800">Medium</option>
              <option value="Low" className="bg-gray-800">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="flex-1 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-lg font-roobert-medium text-gray-500 dark:text-gray-400">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                  ? 'No tasks match your filters'
                  : 'No tasks yet'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Business Unit
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => onEditTask(task)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2">
                      <div className="text-xs font-roobert-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                        {task.title}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {task.businessUnit || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {task.product || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 max-w-[60px]">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${task.percentage || 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-700 dark:text-gray-300 min-w-[30px]">
                          {task.percentage || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(task.status)}`}>
                        {task.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {task.owner || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {task.targetDate || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
};
