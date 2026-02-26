import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download,
  CheckCircle, 
  Clock,
  AlertTriangle,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Filter,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { TaskEditorModal } from '../../../cms-admin/src/components/TaskEditorModal';
import type { Task as TaskEditorTask } from '../../../cms-admin/src/components/TaskEditorModal';

interface Task {
  id: string;
  title: string;
  shortName?: string;
  owner: string;
  businessUnit: string;
  product: string;
  startDate: string;
  targetDate: string;
  percentage: number;
  status: string;
  priority: string;
  linkType?: 'goal' | 'initiative' | 'general';
  description?: string;
  milestones?: string;
  risks?: string;
  dependencies?: string;
  initiativeId?: string;
  goalId?: string;
}

interface TasksNotesTableProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const TasksNotesTable: React.FC<TasksNotesTableProps> = ({ isOpen = true, onClose }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'status' | 'progress' | 'deadline'>('priority');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBU, setFilterBU] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.print();
  };

  const handleSaveTask = async (updatedTask: TaskEditorTask) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      
      if (response.ok) {
        // Refresh tasks list
        await fetchTasks();
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  // Calculate stats
  const stats = {
    total: tasks.length,
    complete: tasks.filter(t => t.status === 'Complete' || t.percentage === 100).length,
    inProgress: tasks.filter(t => t.status === 'In Progress' || t.status === 'On Track').length,
    atRisk: tasks.filter(t => t.status === 'At Risk' || t.status === 'Blocked').length,
    highPriority: tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'complete':
      case 'completed':
        return 'bg-green-500/10 text-green-300 border-green-500/30';
      case 'in progress':
      case 'on track':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'at risk':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/30';
      case 'blocked':
        return 'bg-red-500/10 text-red-300 border-red-500/30';
      case 'not started':
      case 'scheduled':
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
      default:
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getLinkTypeColor = (linkType?: string) => {
    switch (linkType) {
      case 'goal':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'initiative':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'general':
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get distinct business units
  const distinctBusinessUnits = Array.from(new Set(tasks.map(t => t.businessUnit).filter(Boolean)));

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status?.toLowerCase() === filterStatus.toLowerCase();
    const buMatch = filterBU === 'all' || task.businessUnit === filterBU;
    return statusMatch && buMatch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return (priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] || 3) - 
               (priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] || 3);
      case 'progress':
        return (b.percentage || 0) - (a.percentage || 0);
      case 'deadline':
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      case 'status':
        return (a.status || '').localeCompare(b.status || '');
      default:
        return 0;
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1a1f2e] w-full h-full flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-[#1e2533] text-white flex-shrink-0 border-b border-white/10">
          <div className="relative px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-roobert-bold text-white">Tasks & Activities</h1>
                  <p className="text-sm text-white/60 font-roobert-light">Strategic initiatives and operational tasks</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-roobert-bold text-white">{stats.total}</div>
                    <div className="text-white/40 text-xs font-roobert-medium">Total</div>
                  </div>
                  <div className="w-px h-4 bg-white/10"></div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-roobert-bold text-green-300">{stats.complete}</div>
                    <div className="text-white/40 text-xs font-roobert-medium">Complete</div>
                  </div>
                  <div className="w-px h-4 bg-white/10"></div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-roobert-bold text-blue-300">{stats.inProgress}</div>
                    <div className="text-white/40 text-xs font-roobert-medium">In Progress</div>
                  </div>
                  <div className="w-px h-4 bg-white/10"></div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-roobert-bold text-orange-300">{stats.atRisk}</div>
                    <div className="text-white/40 text-xs font-roobert-medium">At Risk</div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExport}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10"
                    title="Export"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all border border-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-from-[#1a1f2e] via-[#1e2533] to-[#24293a]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-blue-300/60">Loading tasks...</p>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-blue-300/20 mx-auto mb-4" />
                <h3 className="text-lg font-roobert-semibold text-white mb-2">No Tasks Available</h3>
                <p className="text-blue-300/60">Tasks and activities will appear here once created.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filters & Sort */}
              <div className="flex items-center justify-between bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-6">
                  {/* Status Filter */}
                  <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/60 font-roobert-medium">Status:</span>
                    <div className="flex gap-2">
                    {['all', 'Complete', 'In Progress', 'At Risk', 'Blocked'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status === 'all' ? 'all' : status)}
                        className={`px-3 py-1 rounded-lg text-xs font-roobert-medium transition-all ${
                          filterStatus === (status === 'all' ? 'all' : status)
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  </div>

                  {/* Business Unit Filter */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white/60 font-roobert-medium">BU:</span>
                    <select
                      value={filterBU}
                      onChange={(e) => setFilterBU(e.target.value)}
                      className="px-3 py-1 rounded-lg bg-[#1e2533] text-white text-xs font-roobert-medium border border-white/10 hover:bg-white/10 transition-all"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="all" className="bg-[#1e2533] text-white">All Business Units</option>
                      {distinctBusinessUnits.map((bu) => (
                        <option key={bu} value={bu} className="bg-[#1e2533] text-white">{bu}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ArrowUpDown className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white/60 font-roobert-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 rounded-lg bg-[#1e2533] text-white text-xs font-roobert-medium border border-white/10 hover:bg-white/10 transition-all"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="priority" className="bg-[#1e2533] text-white">Priority</option>
                    <option value="progress" className="bg-[#1e2533] text-white">Progress</option>
                    <option value="deadline" className="bg-[#1e2533] text-white">Deadline</option>
                    <option value="status" className="bg-[#1e2533] text-white">Status</option>
                  </select>
                </div>
              </div>

              {/* Tasks Table */}
              <div className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                  <h3 className="text-lg font-roobert-semibold text-white">All Tasks ({sortedTasks.length})</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/[0.02] border-b border-white/10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Task</th>
                        <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Link Type</th>
                        <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Timeline</th>
                        <th className="px-6 py-3 text-left text-xs font-roobert-semibold text-white/40 uppercase tracking-wider">Business Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedTasks.map((task, idx) => (
                        <motion.tr
                          key={task.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                          onClick={() => setSelectedTask(task)}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-roobert-semibold text-white">{task.title}</div>
                              {task.shortName && task.shortName !== task.title && (
                                <div className="text-xs text-blue-300/40 mt-0.5">{task.shortName}</div>
                              )}
                              {task.product && (
                                <div className="text-xs text-white/40 mt-0.5">{task.product}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-blue-300/60">
                              <Users className="w-3.5 h-3.5" />
                              {task.owner || 'Unassigned'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-roobert-medium border capitalize ${getLinkTypeColor(task.linkType)}`}>
                              {task.linkType || 'general'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-roobert-medium border ${getStatusColor(task.status)}`}>
                              {task.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-roobert-medium border capitalize ${getPriorityColor(task.priority)}`}>
                              {task.priority || 'Medium'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-blue-950/50 rounded-full overflow-hidden border border-blue-500/20">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                  style={{ width: `${task.percentage || 0}%` }}
                                />
                              </div>
                              <span className="text-xs font-roobert-semibold text-blue-300 w-10 text-right">{task.percentage || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <Calendar className="w-3.5 h-3.5" />
                              <div>
                                <div>{formatDate(task.startDate)}</div>
                                <div className="text-white/40">→ {formatDate(task.targetDate)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-blue-300/60">{task.businessUnit || 'N/A'}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Task Editor Modal */}
      {selectedTask && (
        <TaskEditorModal
          task={selectedTask as unknown as TaskEditorTask}
          onSave={handleSaveTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default TasksNotesTable;
