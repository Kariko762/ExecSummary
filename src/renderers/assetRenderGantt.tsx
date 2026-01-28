/**
 * GANTT CHART RENDERER
 * 
 * Interactive project timeline with:
 * - Organizational groupings (collapsible)
 * - Task bars with status colors
 * - Progress indicators
 * - Hover tooltips
 * - Click to open detail modal
 * 
 * DISPLAY MODE ONLY - Edit mode handled by GanttEditorModal
 */

import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { TaskDetailModal } from '../components/TaskDetailModal';
import type { GanttData, GanttTask } from '../types/ganttTypes';

interface GanttChartRendererProps {
  data: GanttData;
  mode?: 'edit' | 'display';
}

export const GanttChartRenderer: React.FC<GanttChartRendererProps> = ({ data }) => {
  const [collapsedOrgs, setCollapsedOrgs] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate days between dates
  const calculateDaysBetween = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate task duration in days
  const calculateTaskDuration = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Smart status display - contextual based on task state
  const getSmartTaskStatus = (task: GanttTask): string => {
    const { startDate, endDate, progress } = task;
    const today = new Date();
    const start = new Date(startDate);
    const taskDuration = calculateTaskDuration(startDate, endDate);
    
    // Completed tasks
    if (progress >= 100) {
      return '✓ Completed';
    }
    
    // Not started yet (future tasks)
    if (progress === 0 && start > today) {
      const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return `Starts in ${daysUntilStart} day${daysUntilStart !== 1 ? 's' : ''} • ${taskDuration} day task`;
    }
    
    // In progress or not started but overdue
    const daysCompleted = Math.round((taskDuration * progress) / 100);
    const daysRemaining = taskDuration - daysCompleted;
    return `${progress}% • ${daysRemaining} of ${taskDuration} days left`;
  };

  // Calculate date ranges for timeline
  const getTimelineMonths = () => {
    try {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const months: { label: string; date: Date; width: number }[] = [];
      
      let current = new Date(start);
      current.setDate(1); // First day of month
      
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      while (current <= end) {
        const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        const monthStart = new Date(Math.max(current.getTime(), start.getTime()));
        const monthEndClamped = new Date(Math.min(monthEnd.getTime(), end.getTime()));
        
        const daysInRange = Math.ceil((monthEndClamped.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const widthPercent = (daysInRange / totalDays) * 100;
        
        months.push({
          label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          date: new Date(current),
          width: widthPercent
        });
        
        current.setMonth(current.getMonth() + 1);
      }
      
      return months;
    } catch {
      return [{ label: 'Timeline', date: new Date(), width: 100 }];
    }
  };

  // Calculate week grid lines
  const getWeekGrid = () => {
    try {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const weeks: { weekNumber: number; width: number }[] = [];
      
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const dayWidth = 100 / totalDays;
      
      let current = new Date(start);
      let weekNum = 1;
      
      while (current <= end) {
        const weekEnd = new Date(current);
        weekEnd.setDate(current.getDate() + 6); // 7 day week
        
        const weekEndClamped = new Date(Math.min(weekEnd.getTime(), end.getTime()));
        const daysInWeek = Math.ceil((weekEndClamped.getTime() - current.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        weeks.push({
          weekNumber: weekNum,
          width: daysInWeek * dayWidth
        });
        
        current.setDate(current.getDate() + 7);
        weekNum++;
      }
      
      return weeks;
    } catch {
      return [];
    }
  };

  // Calculate bar position and width based on dates
  const calculateBarPosition = (taskStart: string, taskEnd: string) => {
    try {
      const chartStart = new Date(data.startDate);
      const chartEnd = new Date(data.endDate);
      const taskStartDate = new Date(taskStart);
      const taskEndDate = new Date(taskEnd);
      
      const chartDuration = chartEnd.getTime() - chartStart.getTime();
      const taskStartOffset = taskStartDate.getTime() - chartStart.getTime();
      const taskDuration = taskEndDate.getTime() - taskStartDate.getTime();
      
      const left = (taskStartOffset / chartDuration) * 100;
      const width = (taskDuration / chartDuration) * 100;
      
      return {
        left: `${Math.max(0, left)}%`,
        width: `${Math.max(1, width)}%`
      };
    } catch {
      return { left: '0%', width: '10%' };
    }
  };

  // Get status configuration
  const getStatusConfig = (status: GanttTask['status']) => {
    const configs = {
      'on-track': {
        color: 'var(--semantic-success)',
        icon: CheckCircle,
        label: 'On Track'
      },
      'at-risk': {
        color: 'var(--semantic-warning)',
        icon: AlertTriangle,
        label: 'At Risk'
      },
      'blocked': {
        color: 'var(--semantic-error)',
        icon: AlertCircle,
        label: 'Blocked'
      },
      'completed': {
        color: 'var(--accent-blue)',
        icon: CheckCircle,
        label: 'Completed'
      }
    };
    return configs[status];
  };

  // Toggle organization collapse
  const toggleOrg = (orgId: string) => {
    const newCollapsed = new Set(collapsedOrgs);
    if (newCollapsed.has(orgId)) {
      newCollapsed.delete(orgId);
    } else {
      newCollapsed.add(orgId);
    }
    setCollapsedOrgs(newCollapsed);
  };

  // Handle task click
  const handleTaskClick = (task: GanttTask) => {
    setSelectedTask(task);
  };

  const months = getTimelineMonths();
  const weeks = getWeekGrid();

  return (
    <div className="gantt-container" ref={containerRef}>
      {/* Header */}
      <div className="gantt-header">
        <div className="gantt-header-left">
          <h3 className="text-lg font-roobert-bold">{data.title || 'Project Timeline'}</h3>
          <div className="text-xs opacity-80 mt-1">
            {new Date(data.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(data.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="gantt-print-btn"
          title="Print Gantt Chart"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print
        </button>
      </div>

      {/* Timeline Headers (Months & Weeks) */}
      <div className="gantt-timeline-container">
        <div className="gantt-task-name-spacer"></div>
        <div className="gantt-header-timeline">
          <div className="gantt-timeline-months">
            {months.map((month, index) => (
              <div 
                key={index} 
                className="gantt-month-cell"
                style={{ width: `${month.width}%` }}
              >
                {month.label}
              </div>
            ))}
          </div>
          <div className="gantt-timeline-weeks">
            {weeks.map((week, index) => (
              <div 
                key={index} 
                className="gantt-week-cell"
                style={{ width: `${week.width}%` }}
              >
                Wk{week.weekNumber}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Lines Background */}
      <div className="gantt-grid-background">
        {weeks.map((week, index) => (
          <div 
            key={index}
            className="gantt-grid-line"
            style={{ width: `${week.width}%` }}
          />
        ))}
      </div>

      {/* Organizations and Tasks */}
      <div className="gantt-body">
        {data.organizations.map((org) => (
          <div key={org.id} className="gantt-org-group">
            {/* Org Header */}
            <div 
              className="gantt-org-header"
              onClick={() => toggleOrg(org.id)}
            >
              <div className="gantt-org-title">
                {collapsedOrgs.has(org.id) ? (
                  <ChevronRight className="gantt-collapse-icon" />
                ) : (
                  <ChevronDown className="gantt-collapse-icon" />
                )}
                <div 
                  className="gantt-org-color-indicator"
                  style={{ backgroundColor: org.color }}
                />
                <span className="font-roobert-semibold">{org.name}</span>
                <span className="gantt-org-count">
                  ({org.projects.reduce((sum, p) => sum + p.tasks.length, 0)} tasks)
                </span>
              </div>
              <div className="gantt-org-timeline-area">
                {/* Empty timeline area for org header */}
              </div>
            </div>

            {/* Tasks (if not collapsed) */}
            {!collapsedOrgs.has(org.id) && org.projects.map((project) => (
              <React.Fragment key={project.id}>
                {project.tasks.map((task) => {
                  const barPos = calculateBarPosition(task.startDate, task.endDate);
                  const statusConfig = getStatusConfig(task.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div 
                      key={task.id}
                      className="gantt-task-row"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="gantt-task-name">
                        <div className="gantt-task-name-content">
                          <span className="text-sm">{task.name}</span>
                          <span className="gantt-task-owner">
                            {task.owner} ({formatDate(task.startDate)} - {formatDate(task.endDate)})
                          </span>
                        </div>
                      </div>
                      <div className="gantt-task-timeline">
                        <div 
                          className={`gantt-task-bar status-${task.status}`}
                          style={{
                            left: barPos.left,
                            width: barPos.width,
                            backgroundColor: statusConfig.color
                          }}
                        >
                          {/* Progress fill */}
                          <div 
                            className="gantt-progress-fill"
                            style={{ width: `${task.progress}%` }}
                          />
                          {/* Status icon and percentage */}
                          <div className="gantt-task-bar-content">
                            <StatusIcon className="gantt-status-icon" />
                            <span className="gantt-task-bar-text">
                              {getSmartTaskStatus(task)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask}
          ganttData={data}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};
