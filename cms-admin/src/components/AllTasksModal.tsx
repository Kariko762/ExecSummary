/**
 * ALL TASKS MODAL
 * Displays all tasks in a table view with filters and bulk operations
 */

import React, { useState, useEffect } from 'react';
import { X, Search, Filter, ClipboardList, Calendar, Users, Target, Trash2, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  createdAt?: string;
  tags?: string[];
  goalId?: string;
}

type SortField = 'title' | 'createdAt' | 'targetDate' | 'priority' | 'status' | 'percentage';

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
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('http://localhost:3001/api/tasks/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskIds: Array.from(selectedTaskIds) })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchTasks();
        setSelectedTaskIds(new Set());
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Failed to delete tasks:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.size === filteredTasks.length) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(filteredTasks.map(t => t.id)));
    }
  };

  const toggleSelectTask = (taskId: string) => {
    const newSelection = new Set(selectedTaskIds);
    if (newSelection.has(taskId)) {
      newSelection.delete(taskId);
    } else {
      newSelection.add(taskId);
    }
    setSelectedTaskIds(newSelection);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.owner?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];
    
    if (sortField === 'createdAt' || sortField === 'targetDate') {
      aVal = new Date(aVal || 0).getTime();
      bVal = new Date(bVal || 0).getTime();
    } else if (sortField === 'percentage') {
      aVal = a.percentage || 0;
      bVal = b.percentage || 0;
    } else if (sortField === 'priority') {
      const priorityMap: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
      aVal = priorityMap[a.priority || ''] || 0;
      bVal = priorityMap[b.priority || ''] || 0;
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'On Track': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'At Risk': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Off Track': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'Completed': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-white/90';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-white/90';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl w-[80vw] max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-tr from-slate-900 via-slate-700 to-slate-800 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-roobert-semibold text-white">All Tasks</h2>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-roobert-medium text-white">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </span>
              {selectedTaskIds.size > 0 && (
                <span className="px-3 py-1 bg-purple-500/30 rounded-full text-sm font-roobert-medium text-white">
                  {selectedTaskIds.size} selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedTaskIds.size > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors text-red-400 font-roobert-medium text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete {selectedTaskIds.size} Task{selectedTaskIds.size > 1 ? 's' : ''}
                </button>
              )}
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
              <p className="text-lg font-roobert-medium text-white/60">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                  ? 'No tasks match your filters'
                  : 'No tasks yet'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-800/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      {selectedTaskIds.size === filteredTasks.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th 
                    onClick={() => handleSort('title')}
                    className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  >
                    Task {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('createdAt')}
                    className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  >
                    Created {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Business Unit
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th 
                    onClick={() => handleSort('percentage')}
                    className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  >
                    Progress {sortField === 'percentage' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  >
                    Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('priority')}
                    className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  >
                    Priority {sortField === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Owner
                  </th>
                  <th 
                    onClick={() => handleSort('targetDate')}
                    className="px-3 py-2 text-left text-[10px] font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  >
                    Due Date {sortField === 'targetDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900/95 backdrop-blur-sm divide-y divide-gray-200 dark:divide-gray-800">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`hover:bg-white/5 transition-colors ${
                      selectedTaskIds.has(task.id) ? 'bg-purple-500/10' : ''
                    }`}
                  >
                    <td className="px-3 py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectTask(task.id);
                        }}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        {selectedTaskIds.has(task.id) ? (
                          <CheckSquare className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td 
                      onClick={() => onEditTask(task)}
                      className="px-3 py-2 cursor-pointer"
                    >
                      <div className="text-xs font-roobert-medium text-white truncate max-w-[200px]">
                        {task.title}
                      </div>
                    </td>
                    <td 
                      onClick={() => onEditTask(task)}
                      className="px-3 py-2 cursor-pointer"
                    >
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {formatDate(task.createdAt)}
                      </span>
                    </td>
                    <td 
                      onClick={() => onEditTask(task)}
                      className="px-3 py-2 cursor-pointer"
                    >
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {task.businessUnits?.length
                          ? task.businessUnits.join(', ')
                          : task.businessUnit || '-'}
                      </span>
                    </td>
                    <td 
                      onClick={() => onEditTask(task)}
                      className="px-3 py-2 cursor-pointer"
                    >
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {task.product || '-'}
                      </span>
                    </td>
                    <td 
                      onClick={() => onEditTask(task)}
                      className="px-3 py-2 cursor-pointer"
                    >
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
                    <td 
                      onClick={() => onEditTask(task)}
                      className="px-3 py-2 cursor-pointer"
                    >
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(task.status)}`}>
                        {task.status || 'N/A'}
                      </span>
                    </td>
                    <td 
                      onClick={() => onEditTask(task)}
                      className="px-3 py-2 cursor-pointer"
                    >
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority || 'N/A'}
                      </span>
                    </td>
                    <td 
                      onClick={() => onEditTask(task)}
                      className="px-3 py-2 cursor-pointer"
                    >
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {task.owner || '-'}
                      </span>
                    </td>
                    <td 
                      onClick={() => onEditTask(task)}
                      className="px-3 py-2 cursor-pointer"
                    >
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {formatDate(task.targetDate)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 max-w-md border border-red-500/30"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-roobert-semibold text-white mb-2">
                      Delete {selectedTaskIds.size} Task{selectedTaskIds.size > 1 ? 's' : ''}?
                    </h3>
                    <p className="text-sm text-gray-300 font-roobert-light">
                      This action cannot be undone. All selected tasks will be permanently deleted.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-roobert-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white font-roobert-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
