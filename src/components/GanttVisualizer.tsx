import React, { useState } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, PlayCircle, Sparkles, Calendar } from 'lucide-react';
import type { GanttTask, GanttData } from '../types/initiativeGantt';

interface GanttVisualizerProps {
  ganttData: GanttData;
}

export default function GanttVisualizer({ ganttData }: GanttVisualizerProps) {
  const [collapsedTasks, setCollapsedTasks] = useState<Set<string>>(new Set());

  if (!ganttData || !ganttData.tasks || ganttData.tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-sm">No Gantt chart data available</p>
        <p className="text-xs mt-2">Use the Edit Gantt button to create a project plan</p>
      </div>
    );
  }

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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'blocked':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'blocked':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const typeIcons = {
    milestone: CheckCircle,
    task: PlayCircle,
    phase: Sparkles
  };

  // Calculate project date range
  const getAllDates = (tasks: GanttTask[]): { min: Date; max: Date } | null => {
    let minDate = new Date('2099-12-31');
    let maxDate = new Date('1970-01-01');
    let foundValidDate = false;

    const processTasks = (taskList: GanttTask[]) => {
      taskList.forEach(task => {
        if (task.startDate && task.startDate.trim() !== '') {
          const start = new Date(task.startDate);
          if (!isNaN(start.getTime())) {
            if (start < minDate) minDate = start;
            foundValidDate = true;
          }
        }
        if (task.endDate && task.endDate.trim() !== '') {
          const end = new Date(task.endDate);
          if (!isNaN(end.getTime())) {
            if (end > maxDate) maxDate = end;
            foundValidDate = true;
          }
        }
        if (task.children) {
          processTasks(task.children);
        }
      });
    };

    processTasks(tasks);
    
    if (!foundValidDate) {
      return null;
    }
    
    return { min: minDate, max: maxDate };
  };

  const dateRange = getAllDates(ganttData.tasks);
  
  // If no valid dates found, show message
  if (!dateRange) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
        <Calendar className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-sm">Gantt chart has tasks with invalid or missing dates</p>
        <p className="text-xs mt-2">Please edit the Gantt chart to add valid start and end dates</p>
      </div>
    );
  }
  
  const projectStartDate = dateRange.min;
  const projectEndDate = dateRange.max;
  const totalProjectDays = Math.ceil((projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Generate month markers
  const getMonthMarkers = () => {
    const markers: { date: Date; label: string; position: number }[] = [];
    const current = new Date(projectStartDate);
    current.setDate(1); // Start of month

    while (current <= projectEndDate) {
      const dayOffset = Math.ceil((current.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const position = (dayOffset / totalProjectDays) * 100;
      
      markers.push({
        date: new Date(current),
        label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        position
      });

      current.setMonth(current.getMonth() + 1);
    }

    return markers;
  };

  const monthMarkers = getMonthMarkers();

  // Calculate task bar position and width
  const getTaskBarStyle = (task: GanttTask) => {
    if (!task.startDate || !task.endDate || task.startDate.trim() === '' || task.endDate.trim() === '') {
      return null;
    }
    
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }
    
    const startOffset = Math.ceil((start.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const left = (startOffset / totalProjectDays) * 100;
    const width = (duration / totalProjectDays) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  const renderTaskName = (task: GanttTask, depth: number = 0): React.JSX.Element | null => {
    const isCollapsed = collapsedTasks.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const indentPx = depth * 24;
    const Icon = typeIcons[task.type];
    const barStyle = getTaskBarStyle(task);
    
    // Skip tasks with invalid dates (unless they have children with valid dates)
    if (!barStyle && !hasChildren) {
      return null;
    }

    return (
      <React.Fragment key={task.id}>
        <div className="h-[56px] p-3 border-b border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex flex-col justify-center" style={{ paddingLeft: `${indentPx + 12}px` }}>
          <div className="flex items-center gap-2">
            {/* Collapse/Expand */}
            {hasChildren ? (
              <button
                onClick={() => toggleCollapse(task.id)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-4" />
            )}

            {/* Icon */}
            <Icon className="w-4 h-4" style={{ color: task.color || '#8B5CF6' }} />

            {/* Task Name */}
            <span className="text-sm font-roobert-medium text-gray-900 dark:text-gray-100 truncate flex-1">
              {task.name}
            </span>

            {/* Status Badge */}
            <span className={`px-2 py-0.5 rounded text-xs font-roobert-medium ${getStatusBadgeColor(task.status)}`}>
              {task.status?.replace('-', ' ') || 'not started'}
            </span>
          </div>
          
          {/* Owner */}
          {task.owner && (
            <div className="mt-1 ml-8 text-xs text-gray-500 dark:text-gray-400">
              Owner: {task.owner}
            </div>
          )}
        </div>

        {/* Render children if not collapsed */}
        {hasChildren && !isCollapsed && task.children!.map(child => renderTaskName(child, depth + 1))}
      </React.Fragment>
    );
  };

  const renderTaskTimeline = (task: GanttTask, depth: number = 0): React.JSX.Element | null => {
    const isCollapsed = collapsedTasks.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const barStyle = getTaskBarStyle(task);
    
    // Skip tasks with invalid dates (unless they have children with valid dates)
    if (!barStyle && !hasChildren) {
      return null;
    }

    return (
      <React.Fragment key={task.id}>
        <div className="relative h-[56px] bg-gray-50 dark:bg-gray-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="min-w-[800px] h-full">
            {barStyle ? (
              <>
                {/* Task Bar */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-8 rounded"
                  style={{ ...barStyle }}
                >
                  {/* Bar background with progress */}
                  <div className={`absolute inset-0 rounded ${getStatusColor(task.status)} opacity-20`} />
                  <div 
                    className={`absolute inset-0 rounded ${getStatusColor(task.status)}`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                {/* Duration label after (right of) the progress bar */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 text-xs font-roobert-medium text-gray-700 dark:text-gray-300 ml-2"
                  style={{ left: `calc(${barStyle.left} + ${barStyle.width})` }}
                >
                  {Math.ceil((new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}D
                </div>
              </>
            ) : (
              <div className="absolute top-1/2 -translate-y-1/2 left-4 text-xs text-gray-400 italic">
                No valid dates
              </div>
            )}
          </div>
        </div>

        {/* Render children if not collapsed */}
        {hasChildren && !isCollapsed && task.children!.map(child => renderTaskTimeline(child, depth + 1))}
      </React.Fragment>
    );
  };

  const renderTask = (task: GanttTask, depth: number = 0): React.JSX.Element | null => {
    const isCollapsed = collapsedTasks.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const indentPx = depth * 24;
    const Icon = typeIcons[task.type];
    const barStyle = getTaskBarStyle(task);
    
    // Skip tasks with invalid dates (unless they have children with valid dates)
    if (!barStyle && !hasChildren) {
      return null;
    }

    return (
      <React.Fragment key={task.id}>
        <div className="flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          {/* Left side: Task info (fixed width) */}
          <div className="w-[300px] min-w-[300px] p-3 border-r border-gray-200 dark:border-gray-700" style={{ paddingLeft: `${indentPx + 12}px` }}>
            <div className="flex items-center gap-2">
              {/* Collapse/Expand */}
              {hasChildren ? (
                <button
                  onClick={() => toggleCollapse(task.id)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              ) : (
                <div className="w-4" />
              )}

              {/* Icon */}
              <Icon className="w-4 h-4" style={{ color: task.color || '#8B5CF6' }} />

              {/* Task Name */}
              <span className="text-sm font-roobert-medium text-gray-900 dark:text-gray-100 truncate flex-1">
                {task.name}
              </span>

              {/* Status Badge */}
              <span className={`px-2 py-0.5 rounded text-xs font-roobert-medium ${getStatusBadgeColor(task.status)}`}>
                {task.status?.replace('-', ' ') || 'not started'}
              </span>
            </div>
            
            {/* Owner */}
            {task.owner && (
              <div className="mt-1 ml-8 text-xs text-gray-500 dark:text-gray-400">
                Owner: {task.owner}
              </div>
            )}
          </div>

          {/* Right side: Timeline (scrollable) */}
          <div className="flex-1 relative h-14 bg-gray-50 dark:bg-gray-900/20 overflow-x-auto">
            <div className="min-w-[800px] h-full relative">
            {barStyle ? (
              <>
                {/* Task Bar */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-8 rounded flex items-center justify-between px-2"
                  style={{ ...barStyle }}
                >
                  {/* Bar background with progress */}
                  <div className={`absolute inset-0 rounded ${getStatusColor(task.status)} opacity-20`} />
                  <div 
                    className={`absolute inset-0 rounded ${getStatusColor(task.status)}`}
                    style={{ width: `${task.progress}%` }}
                  />
                  
                  {/* Dates */}
                  <span className="relative z-10 text-xs font-roobert-medium text-gray-900 dark:text-white drop-shadow">
                    {new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="relative z-10 text-xs font-roobert-medium text-gray-900 dark:text-white drop-shadow">
                    {new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute top-1/2 -translate-y-1/2 left-4 text-xs text-gray-400 italic">
                No valid dates
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Render children if not collapsed */}
        {hasChildren && !isCollapsed && task.children!.map(child => renderTask(child, depth + 1))}
      </React.Fragment>
    );
  };

  // Calculate stats
  const countAllTasks = (tasks: GanttTask[]): number => {
    return tasks.reduce((count, task) => {
      return count + 1 + (task.children ? countAllTasks(task.children) : 0);
    }, 0);
  };

  const countByStatus = (tasks: GanttTask[], status: string): number => {
    return tasks.reduce((count, task) => {
      const thisCount = task.status === status ? 1 : 0;
      const childCount = task.children ? countByStatus(task.children, status) : 0;
      return count + thisCount + childCount;
    }, 0);
  };

  const totalTasks = countAllTasks(ganttData.tasks);
  const completedTasks = countByStatus(ganttData.tasks, 'completed');
  const inProgressTasks = countByStatus(ganttData.tasks, 'in-progress');
  const notStartedTasks = countByStatus(ganttData.tasks, 'not-started');

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <div>
              <h3 className="text-lg font-roobert-bold">Project Gantt Chart</h3>
              <p className="text-sm text-purple-100">
                {totalProjectDays} days • {ganttData.tasks.length} workstreams
              </p>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-purple-100">Project Timeline</div>
            <div className="font-roobert-semibold">
              {projectStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {projectEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart Table */}
      <div className="flex max-h-[600px] overflow-y-auto">
        {/* Left: Task Names Column (fixed width) */}
        <div className="w-[400px] min-w-[400px] flex flex-col">
          {/* Header */}
          <div className="border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <div className="h-[43px] p-3 flex items-center">
              <span className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase">Task</span>
            </div>
          </div>
          {/* Task rows */}
          {ganttData.tasks.map(task => renderTaskName(task, 0))}
        </div>

        {/* Right: Timeline (horizontally scrollable) */}
        <div className="flex-1 flex flex-col overflow-x-auto">
          {/* Month markers header */}
          <div className="relative border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <div className="min-w-[800px] h-[43px] relative">
              {monthMarkers.map((marker, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 border-l border-gray-300 dark:border-gray-600"
                  style={{ left: `${marker.position}%` }}
                >
                  <span className="absolute top-1 left-1 text-xs font-roobert-medium text-gray-600 dark:text-gray-400">
                    {marker.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Timeline bars */}
          {ganttData.tasks.map(task => renderTaskTimeline(task, 0))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-roobert-bold text-purple-600 dark:text-purple-400">{totalTasks}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-roobert-bold text-green-600 dark:text-green-400">{completedTasks}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-roobert-bold text-blue-600 dark:text-blue-400">{inProgressTasks}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-roobert-bold text-gray-600 dark:text-gray-400">{notStartedTasks}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Not Started</div>
          </div>
        </div>
      </div>
    </div>
  );
}
