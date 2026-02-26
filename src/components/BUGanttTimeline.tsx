import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  shortName?: string;
  owner: string;
  businessUnit: string;
  startDate: string;
  targetDate: string;
  percentage: number;
  status: string;
  initiativeId?: string;
}

interface GanttTask {
  id: string;
  name: string;
  shortName: string;
  owner: string;
  status: string;
  progress: number;
  startWeek: number;
  duration: number;
  color: string;
  category: string;
}

interface BUGanttTimelineProps {
  businessUnit: string;
}

type TimelineScale = '30days' | '3months' | '6months';

export const BUGanttTimeline: React.FC<BUGanttTimelineProps> = ({ businessUnit }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [timelineScale, setTimelineScale] = useState<TimelineScale>('3months');
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('bottom');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const taskRowRef = useRef<HTMLDivElement>(null);
  
  const VISIBLE_WEEKS = timelineScale === '30days' ? 4 : timelineScale === '3months' ? 13 : 26;

  // Map route param to BU display name
  const buDisplayNameMap: Record<string, string> = {
    'banking-north-america': 'Banking (NA)',
    'banking-international': 'Banking (Int)',
    'capital-markets': 'Capital Markets',
    'payments': 'Payments'
  };

  const buDisplayName = buDisplayNameMap[businessUnit] || businessUnit;

  useEffect(() => {
    fetchTasks();
  }, [businessUnit]);

  useEffect(() => {
    if (hoveredTask && tooltipRef.current && taskRowRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const taskRect = taskRowRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Check if tooltip would go below viewport
      const wouldOverflowBottom = taskRect.bottom + tooltipRect.height + 8 > viewportHeight;
      
      setTooltipPosition(wouldOverflowBottom ? 'top' : 'bottom');
    }
  }, [hoveredTask]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/tasks');
      const data = await response.json();
      
      if (data.tasks && Array.isArray(data.tasks)) {
        // Filter by business unit and transform to gantt format
        const filteredTasks = data.tasks
          .filter((task: Task) => 
            task.businessUnit === buDisplayName && 
            task.startDate && 
            task.targetDate
          )
          .map((task: Task) => transformTaskToGantt(task));
        
        setTasks(filteredTasks);
        setExpandedCategories(new Set()); // Start collapsed
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformTaskToGantt = (task: Task): GanttTask => {
    const startDate = new Date(task.startDate);
    const targetDate = new Date(task.targetDate);
    const baselineDate = new Date('2026-01-01');
    
    const weekStart = Math.floor((startDate.getTime() - baselineDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const weekEnd = Math.floor((targetDate.getTime() - baselineDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const duration = Math.max(1, weekEnd - weekStart);
    
    let color = '#6b7280';
    let statusKey = 'scheduled';
    
    if (task.status === 'Complete' || task.percentage === 100) {
      color = '#10b981';
      statusKey = 'complete';
    } else if (task.status === 'On Track' || task.status === 'In Progress') {
      color = '#3b82f6';
      statusKey = 'active';
    } else if (task.status === 'At Risk' || task.status === 'Blocked') {
      color = '#ef4444';
      statusKey = 'at-risk';
    }
    
    return {
      id: task.id,
      name: task.title,
      shortName: task.shortName || task.title.substring(0, 40),
      owner: task.owner,
      status: statusKey,
      progress: task.percentage || 0,
      startWeek: Math.max(0, weekStart),
      duration,
      color,
      category: task.initiativeId || 'General Tasks',
    };
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const generateTimeline = () => {
    const baseDate = new Date('2026-01-01');
    const getWeekStartDate = (weekNum: number) => {
      const weekDate = new Date(baseDate);
      weekDate.setDate(baseDate.getDate() + (weekNum - 1) * 7);
      return `${weekDate.getMonth() + 1}/${weekDate.getDate()}`;
    };

    if (timelineScale === '30days') {
      const months = [
        { name: 'JAN', weeks: ['W1', 'W2', 'W3', 'W4'], dates: [1, 2, 3, 4].map(getWeekStartDate) }
      ];
      return months;
    } else if (timelineScale === '3months') {
      const months = [
        { name: 'JAN', weeks: ['W1', 'W2', 'W3', 'W4', 'W5'], dates: [1, 2, 3, 4, 5].map(getWeekStartDate) },
        { name: 'FEB', weeks: ['W6', 'W7', 'W8', 'W9'], dates: [6, 7, 8, 9].map(getWeekStartDate) },
        { name: 'MAR', weeks: ['W10', 'W11', 'W12', 'W13'], dates: [10, 11, 12, 13].map(getWeekStartDate) },
      ];
      return months;
    } else {
      // 6 months
      const months = [
        { name: 'JAN', weeks: ['W1', 'W2', 'W3', 'W4', 'W5'], dates: [1, 2, 3, 4, 5].map(getWeekStartDate) },
        { name: 'FEB', weeks: ['W6', 'W7', 'W8', 'W9'], dates: [6, 7, 8, 9].map(getWeekStartDate) },
        { name: 'MAR', weeks: ['W10', 'W11', 'W12', 'W13'], dates: [10, 11, 12, 13].map(getWeekStartDate) },
        { name: 'APR', weeks: ['W14', 'W15', 'W16', 'W17'], dates: [14, 15, 16, 17].map(getWeekStartDate) },
        { name: 'MAY', weeks: ['W18', 'W19', 'W20', 'W21', 'W22'], dates: [18, 19, 20, 21, 22].map(getWeekStartDate) },
        { name: 'JUN', weeks: ['W23', 'W24', 'W25', 'W26'], dates: [23, 24, 25, 26].map(getWeekStartDate) },
      ];
      return months;
    }
  };

  const groupTasksByInitiative = () => {
    const byInitiative: { [initiative: string]: GanttTask[] } = {};
    
    tasks.forEach(task => {
      const initiative = task.category || 'General Tasks';
      if (!byInitiative[initiative]) {
        byInitiative[initiative] = [];
      }
      byInitiative[initiative].push(task);
    });
    
    return Object.keys(byInitiative)
      .sort((a, b) => {
        if (a === 'General Tasks') return 1;
        if (b === 'General Tasks') return -1;
        return a.localeCompare(b);
      })
      .map(initiative => ({
        category: initiative,
        taskCount: byInitiative[initiative].length,
        tasks: byInitiative[initiative],
      }));
  };

  const timeline = generateTimeline();
  const projects = groupTasksByInitiative();
  
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'complete': 'Complete',
      'active': 'On Track',
      'at-risk': 'At Risk',
      'scheduled': 'Scheduled'
    };
    return statusMap[status] || status;
  };
  
  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'complete': 'bg-green-500/10 text-green-400 border-green-500/30',
      'active': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'at-risk': 'bg-red-500/10 text-red-400 border-red-500/30',
      'scheduled': 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    };
    return colorMap[status] || colorMap['scheduled'];
  };

  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        <p className="mt-4 text-slate-400 text-sm">Loading timeline...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-slate-400 text-sm">No tasks found for {businessUnit} in Q1 2026.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Scale Controls */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-slate-400">Timeline Scale:</span>
        <div className="flex gap-2">
          <button
            onClick={() => setTimelineScale('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timelineScale === '30days'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimelineScale('3months')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timelineScale === '3months'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            3 Months
          </button>
          <button
            onClick={() => setTimelineScale('6months')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timelineScale === '6months'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            6 Months
          </button>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* Timeline Header */}
        <div className="grid grid-cols-[250px_60px_1fr] border-b border-slate-700/50">
          <div className="p-3 border-r border-slate-700/50 bg-slate-800/50">
            <span className="text-xs font-semibold uppercase text-white">Initiative / Task</span>
          </div>
          <div className="p-3 border-r border-slate-700/50 text-center bg-slate-800/50">
            <span className="text-xs font-semibold uppercase text-white">Status</span>
          </div>
          <div className="relative bg-slate-800/50">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${VISIBLE_WEEKS}, 1fr)` }}>
              {timeline.flatMap((month, monthIdx) => 
                month.weeks.map((week, weekIdx) => (
                  <div
                    key={`${monthIdx}-${weekIdx}`}
                    className="px-2 py-3 text-center border-r border-slate-700/50 flex flex-col justify-end min-h-[60px]"
                  >
                    {weekIdx === 0 && (
                      <div className="text-xs font-semibold text-white mb-2">
                        {month.name}
                      </div>
                    )}
                    <div className="mt-auto">
                      <div className="text-[10px] text-slate-300 font-medium mb-0.5">
                        {week}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {month.dates[weekIdx]}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Project Rows */}
        {projects.map((project, projectIdx) => (
          <div key={projectIdx}>
            {/* Initiative Header */}
            <div className="grid grid-cols-[250px_60px_1fr] border-b border-slate-700/50">
              <button
                onClick={() => toggleCategory(project.category)}
                className="flex items-center gap-2 p-2 border-r border-slate-700/50 text-left transition-colors hover:bg-slate-800/70 bg-slate-800/50"
              >
                {project.tasks.length > 0 && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform flex-shrink-0 text-slate-400 ${
                      expandedCategories.has(project.category) ? 'rotate-90' : ''
                    }`}
                  />
                )}
                <span className="text-xs text-white font-semibold">
                  {project.category}
                </span>
                {project.taskCount > 0 && (
                  <span className="text-xs text-slate-400 ml-auto px-2 py-0.5 bg-slate-700/50 rounded">
                    {project.taskCount}
                  </span>
                )}
              </button>
              
              <div className="flex items-center justify-center border-r border-slate-700/50 bg-slate-800/30">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
              </div>
              
              <div className="relative bg-slate-900/30 h-10">
                {/* Aggregate bar when collapsed */}
                {!expandedCategories.has(project.category) && (() => {
                  const minStart = Math.min(...project.tasks.map(t => t.startWeek));
                  const maxEnd = Math.max(...project.tasks.map(t => t.startWeek + t.duration));
                  const duration = maxEnd - minStart;
                  const avgProgress = Math.round(
                    project.tasks.reduce((sum, t) => sum + t.progress, 0) / project.tasks.length
                  );
                  
                  return (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-4 rounded-md overflow-hidden"
                      style={{
                        left: `calc(${(minStart / VISIBLE_WEEKS) * 100}% + 5px)`,
                        width: `calc(${(duration / VISIBLE_WEEKS) * 100}% - 10px)`,
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                      }}
                    >
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${avgProgress}%`,
                          backgroundColor: 'rgba(139, 92, 246, 0.6)',
                        }}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Tasks */}
            {expandedCategories.has(project.category) &&
              project.tasks.map((task, taskIdx) => (
                <div
                  key={taskIdx}
                  ref={hoveredTask === task.id ? taskRowRef : null}
                  className="grid grid-cols-[250px_60px_1fr] border-b border-slate-700/50 hover:bg-slate-800/50 transition-all relative group"
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  <div className="p-2.5 border-r border-slate-700/50 flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-white mb-1 font-medium">{task.shortName}</div>
                      <div className="text-[10px] text-slate-400">{task.owner}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border whitespace-nowrap ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center border-r border-slate-700/50">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: task.color }}
                    />
                  </div>
                  
                  <div className="relative min-h-[48px]">
                    <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${VISIBLE_WEEKS}, 1fr)` }}>
                      {Array.from({ length: VISIBLE_WEEKS }).map((_, idx) => (
                        <div key={idx} className="border-r border-slate-700/40 h-full" />
                      ))}
                    </div>
                    
                    {task.startWeek < VISIBLE_WEEKS && (
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 h-7 rounded-md overflow-hidden transition-all ${
                          hoveredTask === task.id ? 'shadow-lg scale-105' : ''
                        }`}
                        style={{
                          left: `calc(${(task.startWeek / VISIBLE_WEEKS) * 100}% + 8px)`,
                          width: `calc(${Math.min((task.duration / VISIBLE_WEEKS) * 100, 100 - (task.startWeek / VISIBLE_WEEKS) * 100)}% - 16px)`,
                          backgroundColor: task.status === 'complete' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          border: task.status === 'complete' ? '2px solid #10b981' : '2px solid #3b82f6',
                        }}
                      >
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${task.progress}%`,
                            backgroundColor: task.status === 'complete' ? '#10b981' : '#3b82f6',
                          }}
                        />
                        <span className="absolute inset-y-0 left-0 flex items-center text-[10px] font-bold text-white pl-2 drop-shadow-md">
                          {task.progress}%
                        </span>
                      </div>
                    )}
                    
                    {/* Hover Tooltip */}
                    {hoveredTask === task.id && (
                      <div 
                        ref={tooltipRef}
                        className={`absolute left-1/2 -translate-x-1/2 z-50 pointer-events-none ${
                          tooltipPosition === 'bottom' 
                            ? 'top-full mt-2' 
                            : 'bottom-full mb-2'
                        }`}
                      >
                        <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-3 min-w-[250px]">
                          <div className="text-xs font-semibold text-white mb-2">{task.name}</div>
                          <div className="space-y-1 text-[10px] text-slate-400">
                            <div className="flex justify-between">
                              <span>Owner:</span>
                              <span className="text-white">{task.owner}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Progress:</span>
                              <span className="text-white font-semibold">{task.progress}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className={`px-1.5 py-0.5 rounded border ${getStatusColor(task.status)}`}>
                                {getStatusLabel(task.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};
